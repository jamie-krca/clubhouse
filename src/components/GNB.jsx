import { Link } from 'react-router-dom'
import { SITE_NAME } from '../lib/constants'

export default function GNB({ onSubscribe }) {
  return (
    <nav className="gnb">
      <div className="gnb-inner">
        <Link to="/" className="gnb-logo">{SITE_NAME}</Link>
        <button className="gnb-sub-btn" onClick={onSubscribe}>
          구독하기
        </button>
      </div>
    </nav>
  )
}
