import { SITE_NAME } from '../lib/constants'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer>
      <div className="wrap">
        <div className="content-divider"></div>
        <div className="footer-text">
          <span>협업 제안 문의 : clubhouse.krca@gmail.com</span>
          <span>© {year} {SITE_NAME} | 클럽하우스</span>
        </div>
      </div>
    </footer>
  )
}
