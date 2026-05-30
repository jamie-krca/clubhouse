import { Link } from 'react-router-dom'

export default function Card({ article }) {
  return (
    <Link to={`/${article.category}/${article.slug}`} className="card">
      <div className="card-thumb">
        {article.thumbnail_url ? (
          <img src={article.thumbnail_url} alt={article.title} />
        ) : (
          <div className="card-thumb-placeholder" />
        )}
      </div>
      <div className="card-title">{article.title}</div>
    </Link>
  )
}
