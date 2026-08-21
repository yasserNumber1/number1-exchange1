const nodemailer = require('nodemailer')
const Setting = require('../models/Setting')

const DEFAULT_CONTACT_EMAIL = 'nimbeerr1@gmail.com'

const getConfig = async () => {
  const settings = await Setting.getSingleton()
  const port = Number(settings.smtpPort || process.env.SMTP_PORT || 587)

  return {
    host: settings.smtpHost || process.env.SMTP_HOST || '',
    port,
    user: settings.smtpEmail || process.env.SMTP_EMAIL || process.env.SMTP_USER || '',
    pass: settings.smtpPassword || process.env.SMTP_PASSWORD || process.env.SMTP_PASS || '',
    to: process.env.CONTACT_FORM_TO_EMAIL || settings.contactEmail || DEFAULT_CONTACT_EMAIL,
  }
}

exports.sendContactMessage = async ({ name, email, subject, message, lang, page, ip }) => {
  try {
    const config = await getConfig()
    if (!config.host || !config.user || !config.pass || !config.to) {
      console.warn('Contact email not configured')
      return { success: false, error: 'SMTP not configured' }
    }

    const safeName = String(name || '').replace(/[\r\n]+/g, ' ').trim().slice(0, 120)
    const safeEmail = String(email || '').replace(/[\r\n]+/g, '').trim().slice(0, 254)
    const safeSubject = String(subject || '').replace(/[\r\n]+/g, ' ').trim().slice(0, 200)
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: { user: config.user, pass: config.pass },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    })

    const info = await transporter.sendMail({
      from: `"Number1 Exchange Contact" <${config.user}>`,
      to: config.to,
      replyTo: safeEmail ? { name: safeName, address: safeEmail } : undefined,
      subject: safeSubject
        ? `New contact message: ${safeSubject}`
        : 'New contact message — Number1 Exchange',
      text: [
        'New contact form message',
        '',
        `Name: ${safeName}`,
        `Email: ${safeEmail}`,
        `Subject: ${safeSubject || 'Not provided'}`,
        '',
        'Message:',
        String(message || '').trim(),
        '',
        `Language: ${lang || 'en'}`,
        `Page: ${page || 'Not provided'}`,
        `IP: ${ip || 'unknown'}`,
        `Time: ${new Date().toISOString()}`,
      ].join('\n'),
    })

    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Contact email delivery error:', error.message)
    return { success: false, error: error.message }
  }
}
