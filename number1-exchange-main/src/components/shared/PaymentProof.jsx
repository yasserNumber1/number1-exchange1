import { useState } from 'react'

const API = import.meta.env.VITE_API_URL || 'https://www.yasser-number1.com'

export default function PaymentProof({ order, sessionToken, isAr, onSaved }) {
  const [txHash, setTxHash] = useState('')
  const [receipt, setReceipt] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const tr = (ar, en) => isAr ? ar : en
  const isCrypto = order.payment?.method?.startsWith('USDT_')

  if (!sessionToken || !['pending', 'verifying'].includes(order.status) || order.payment?.method === 'WALLET') return null

  const submit = async () => {
    if (!txHash.trim() && !receipt) return
    setBusy(true); setError(''); setSuccess(false)
    try {
      let receiptImageUrl = ''
      if (receipt) {
        const form = new FormData()
        form.append('receipt', receipt)
        const uploadResponse = await fetch(`${API}/api/orders/upload-receipt`, { method: 'POST', body: form })
        const uploadData = await uploadResponse.json()
        if (!uploadResponse.ok || !uploadData.success) throw new Error(uploadData.message || 'Upload failed')
        receiptImageUrl = uploadData.url
      }
      const response = await fetch(`${API}/api/orders/${order.orderNumber}/payment-proof`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken, txHash: txHash.trim(), receiptImageUrl }),
      })
      const data = await response.json()
      if (!response.ok || !data.success) throw new Error(data.message || 'Save failed')
      setTxHash(''); setReceipt(null); setSuccess(true)
      onSaved?.()
    } catch (err) {
      setError(err.message || tr('تعذر حفظ إثبات الدفع.', 'Could not save payment proof.'))
    } finally { setBusy(false) }
  }

  return (
    <div style={{ background:'var(--card)', border:'1px solid var(--border-1)', borderRadius:16, padding:20, marginTop:16 }}>
      <div style={{ fontWeight:700, marginBottom:8 }}>{tr('إثبات الدفع (اختياري)', 'Payment proof (optional)')}</div>
      {isCrypto && <input value={txHash} onChange={event => setTxHash(event.target.value)} placeholder={tr('رقم المعاملة TXID بعد التحويل', 'Transaction ID (TXID) after transfer')} style={{ width:'100%', padding:10, borderRadius:8, border:'1px solid var(--border-1)', background:'var(--bg)', color:'var(--text-1)', marginBottom:10, boxSizing:'border-box' }} />}
      <label style={{ display:'block', fontSize:'0.85rem', color:'var(--text-2)', marginBottom:10 }}>
        {tr('صورة الإيصال (JPG/PNG/WebP، حتى 5MB)', 'Receipt image (JPG/PNG/WebP, up to 5MB)')}
        <input type="file" accept="image/png,image/jpeg,image/webp" onChange={event => { setReceipt(event.target.files?.[0] || null); setSuccess(false) }} style={{ display:'block', marginTop:6, maxWidth:'100%' }} />
      </label>
      <button onClick={submit} disabled={busy || (!txHash.trim() && !receipt)} style={{ padding:'9px 18px', borderRadius:8, border:'none', background:'var(--cyan)', color:'#001018', fontWeight:700, cursor:'pointer', opacity:busy || (!txHash.trim() && !receipt) ? 0.5 : 1 }}>
        {busy ? tr('جاري الحفظ...', 'Saving...') : tr('إرسال إثبات الدفع', 'Submit payment proof')}
      </button>
      {success && <div style={{ color:'var(--green)', marginTop:8, fontSize:'0.82rem' }}>{tr('تم حفظ إثبات الدفع وإبلاغ الإدارة.', 'Payment proof saved and admin notified.')}</div>}
      {error && <div style={{ color:'#f87171', marginTop:8, fontSize:'0.82rem' }}>{error}</div>}
    </div>
  )
}
