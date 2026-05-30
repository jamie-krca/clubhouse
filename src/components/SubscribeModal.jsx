import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

export default function SubscribeModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
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
      setEmail('')
      setError(false)
      setDone(false)
    }, 300)
  }

  const handleBgClick = (e) => {
    if (e.target === e.currentTarget) handleClose()
  }

  const handleSubmit = async () => {
    const trimmed = email.trim()
    if (!trimmed || !trimmed.includes('@')) {
      setError(true)
      return
    }

    setLoading(true)
    setError(false)

    const { error: insertError } = await supabase
      .from('subscribers')
      .insert({ email: trimmed })

    setLoading(false)

    if (insertError && insertError.code !== '23505') {
      setError(true)
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
            <div className="modal-sub">
              새 글이 올라오면 이메일로 알려드립니다. 스팸은 보내지 않습니다.
            </div>
            <input
              ref={inputRef}
              type="email"
              className={`modal-input ${error ? 'error' : ''}`}
              placeholder="이메일 주소"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
            <button
              className="modal-submit"
              onClick={handleSubmit}
              disabled={loading}
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
