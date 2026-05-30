import { Link } from 'react-router-dom'
import { SITE_NAME, SITE_TAGLINE, CONTACT_EMAIL } from '../lib/constants'

export default function Footer({ recentArticles = [] }) {
  const year = new Date().getFullYear()

  return (
    <footer>
      <div className="footer-inner">
        <div>
          <div className="footer-logo">{SITE_NAME}</div>
          <div className="footer-tagline">{SITE_TAGLINE}</div>
        </div>
        {recentArticles.length > 0 && (
          <div>
            <div className="footer-recent-label">최근 글</div>
            <div className="footer-recent">
              {recentArticles.slice(0, 3).map((article) => (
                <Link key={article.id} to={`/${article.category}/${article.slug}`}>
                  {article.title}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="footer-bottom">
        <span className="footer-copy">© {year} {SITE_NAME}</span>
        <a href={`mailto:${CONTACT_EMAIL}`} className="footer-contact">
          {CONTACT_EMAIL}
        </a>
      </div>
    </footer>
  )
}
