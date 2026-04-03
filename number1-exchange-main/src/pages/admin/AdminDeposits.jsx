// AdminDeposits.jsx — redirects to Wallets (deposits merged there)
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
export default function AdminDeposits() {
  const navigate = useNavigate()
  useEffect(() => { navigate('/admin/wallets', { replace: true }) }, [])
  return null
}
