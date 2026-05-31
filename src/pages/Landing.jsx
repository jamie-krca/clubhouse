import { Link } from 'react-router-dom'
import { SITE_NAME } from '../lib/constants'

export default function Landing() {
  return (
    <div className="landing">
      <h1 className="landing-title">{SITE_NAME}</h1>
      <div className="landing-links">
        <Link to="/baseball" className="landing-link">야구 칼럼</Link>
        <Link to="/interview" className="landing-link">면접 이야기</Link>
      </div>
    </div>
  )
}
