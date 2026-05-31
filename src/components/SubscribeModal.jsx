import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

export default function SubscribeModal({ isOpen, onClose }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const nameRef = useRef(null)

  useEffect(() => {
    if (isOpen && nameRef.current) {
      setTimeout(() => nameRef.current?.focus(), 100)
    }
  }, [isOpen])

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [])

  const handleClose = () => {
    onClose()
    setTimeout(() => {
      setName('')
      setEmail('')
      setDone(false)
    }, 300)
  }

  const handleBgClick = (e) => {
    if (e.target === e.currentTarget) handleClose()
  }

  const isValidEmail = email.trim().includes('@')
  const isFormValid = name.trim() !== '' && email.trim() !== '' && isValidEmail

  const handleSubmit = async () => {
    if (!isFormValid) return

    setLoading(true)

    const { error: insertError } = await supabase
      .from('subscribers')
      .insert({ name: name.trim(), email: email.trim() })

    setLoading(false)

    if (insertError && insertError.code !== '23505') {
      return
    }

    setDone(true)
    setTimeout(handleClose, 2200)
  }

  return (
    <div
      className={`modal-overlay ${isOpen ? 'open' : ''}`}
      onClick={handleBgClick}
    >
      <div className="modal">
        <button className="modal-close" onClick={handleClose}>×</button>
        {!done ? (
          <div>
            <div className="modal-title">새 글 알림 받기</div>
            <div className="modal-field">
              <label className="modal-label">
                이름 <span className="required">*</span>
              </label>
              <input
                ref={nameRef}
                type="text"
                className="modal-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="modal-field">
              <label className="modal-label">
                이메일 <span className="required">*</span>
              </label>
              <input
                type="email"
                className="modal-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && isFormValid && handleSubmit()}
              />
            </div>
            <button
              className="modal-submit"
              onClick={handleSubmit}
              disabled={!isFormValid || loading}
            >
              {loading ? '처리 중...' : '구독하기'}
            </button>
          </div>
        ) : (
          <div className="modal-done">
            구독되었습니다 ✓<br />
            <span style={{ fontSize: '12px', color: '#aaa' }}>
              새 글이 올라오면 알려드릴게요.
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
