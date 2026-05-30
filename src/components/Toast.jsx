import { useEffect, useState } from 'react'

export default function Toast({ message, onClose }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    setShow(true)
    const timer = setTimeout(() => {
      setShow(false)
      setTimeout(onClose, 200)
    }, 2000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`toast ${show ? 'show' : ''}`}>
      {message}
    </div>
  )
}
