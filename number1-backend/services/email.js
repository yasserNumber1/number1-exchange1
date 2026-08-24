const nodemailer = require('nodemailer')
const axios = require('axios')
const Setting = require('../models/Setting')

const DEFAULT_CONTACT_EMAIL = 'nimbeerr1@gmail.com'
const DEFAULT_RESEND_FROM = 'Number1 Exchange <no-reply@yasser-number1.com>'

const getConfig = async () => {
  const settings = await Setting.getSingleton()
  const port = Number(settings.smtpPort || process.env.SMTP_PORT || 587)
  const configuredResendFrom = String(settings.resendFromEmail || '').trim()
  const isLegacyTestSender = !configuredResendFrom || configuredResendFrom.includes('onboarding@resend.dev')

  return {
    resendApiKey: settings.resendApiKey || process.env.RESEND_API_KEY || '',
    // Deployment env must be able to override the database's legacy test sender.
    resendFrom: process.env.RESEND_FROM_EMAIL || (isLegacyTestSender ? DEFAULT_RESEND_FROM : configuredResendFrom),
    host: settings.smtpHost || process.env.SMTP_HOST || '',
    port,
    user: settings.smtpEmail || process.env.SMTP_EMAIL || process.env.SMTP_USER || '',
    pass: settings.smtpPassword || process.env.SMTP_PASSWORD || process.env.SMTP_PASS || '',
    to: process.env.CONTACT_FORM_TO_EMAIL || settings.contactEmail || DEFAULT_CONTACT_EMAIL,
  }
}

const buildEmail = ({ name, email, subject, message, lang, page, ip }) => {
  const safeName = String(name || '').replace(/[\r\n]+/g, ' ').trim().slice(0, 120)
  const safeEmail = String(email || '').replace(/[\r\n]+/g, '').trim().slice(0, 254)
  const safeSubject = String(subject || '').replace(/[\r\n]+/g, ' ').trim().slice(0, 200)

  return {
    safeName,
    safeEmail,
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
  }
}

const sendWithResend = async (config, emailContent, idempotencyKey) => {
  const response = await axios.post(
    'https://api.resend.com/emails',
    {
      from: config.resendFrom,
      to: [config.to],
      reply_to: emailContent.safeEmail,
      subject: emailContent.subject,
      text: emailContent.text,
    },
    {
      headers: {
        Authorization: `Bearer ${config.resendApiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'number1-exchange/1.0',
        ...(idempotencyKey && { 'Idempotency-Key': `contact-form/${idempotencyKey}` }),
      },
      timeout: 15000,
    },
  )

  return { success: true, provider: 'resend', messageId: response.data.id }
}

const sendWithSmtp = async (config, emailContent) => {
  if (!config.host || !config.user || !config.pass) {
    return { success: false, error: 'Email provider not configured' }
  }

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
    replyTo: emailContent.safeEmail
      ? { name: emailContent.safeName, address: emailContent.safeEmail }
      : undefined,
    subject: emailContent.subject,
    text: emailContent.text,
  })

  return { success: true, provider: 'smtp', messageId: info.messageId }
}

const sendTransactionalWithResend = async (config, { to, subject, text, html }) => {
  const response = await axios.post(
    'https://api.resend.com/emails',
    { from: config.resendFrom, to: [to], subject, text, ...(html ? { html } : {}) },
    {
      headers: {
        Authorization: `Bearer ${config.resendApiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'number1-exchange/1.0',
      },
      timeout: 15000,
    },
  )

  return { success: true, provider: 'resend', messageId: response.data.id }
}

const sendTransactionalWithSmtp = async (config, { to, subject, text, html }) => {
  if (!config.host || !config.user || !config.pass) {
    return { success: false, error: 'Email provider not configured' }
  }

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
    from: `"Number1 Exchange" <${config.user}>`,
    to,
    subject,
    text,
    ...(html ? { html } : {}),
  })

  return { success: true, provider: 'smtp', messageId: info.messageId }
}

exports.sendPasswordResetEmail = async ({ name, email, resetUrl }) => {
  try {
    const config = await getConfig()
    const recipientName = String(name || 'there').trim() || 'there'
    const subject = 'Reset your Number1 Exchange password'
    const text = [
      `Hello ${recipientName},`,
      '',
      'We received a request to reset your Number1 Exchange password.',
      `Open this link to choose a new password: ${resetUrl}`,
      '',
      'This link expires in 1 hour. If you did not request this, you can ignore this email.',
      '',
      'Number1 Exchange',
    ].join('\n')

    if (config.resendApiKey) {
      let resendResult
      try {
        resendResult = await sendTransactionalWithResend(config, { to: email, subject, text })
      } catch (error) {
        resendResult = { success: false, error: error.response?.data?.message || error.message }
      }
      if (resendResult.success || !config.host || !config.user || !config.pass) {
        return resendResult
      }
      console.warn('Resend password email failed; trying SMTP fallback:', resendResult.error)
    }
    return await sendTransactionalWithSmtp(config, { to: email, subject, text })
  } catch (error) {
    const providerMessage = error.response?.data?.message || error.message
    console.error('Password reset email delivery error:', providerMessage)
    return { success: false, error: providerMessage }
  }
}

exports.sendContactMessage = async ({ name, email, subject, message, lang, page, ip, idempotencyKey }) => {
  try {
    const config = await getConfig()
    if (!config.to) {
      console.warn('Contact email not configured')
      return { success: false, error: 'Recipient not configured' }
    }

    const emailContent = buildEmail({ name, email, subject, message, lang, page, ip })
    return config.resendApiKey
      ? await sendWithResend(config, emailContent, idempotencyKey)
      : await sendWithSmtp(config, emailContent)
  } catch (error) {
    const providerMessage = error.response?.data?.message || error.message
    console.error('Contact email delivery error:', providerMessage)
    return { success: false, error: providerMessage }
  }
}
