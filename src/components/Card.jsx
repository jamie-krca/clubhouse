import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'

function isNewArticle(createdAt) {
  const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000
  return new Date(createdAt).getTime() > threeDaysAgo
}

function getVisitedIds() {
  try {
    return JSON.parse(localStorage.getItem('visitedArticles') || '[]')
  } catch {
    return []
  }
}

function markAsVisited(id) {
  const visited = getVisitedIds()
  if (!visited.includes(id)) {
    visited.push(id)
    localStorage.setItem('visitedArticles', JSON.stringify(visited))
  }
}

export default function Card({ article }) {
  const [visited, setVisited] = useState(false)
  const isNew = isNewArticle(article.created_at)

  useEffect(() => {
    setVisited(getVisitedIds().includes(article.id))
  }, [article.id])

  const handleClick = () => {
    markAsVisited(article.id)
  }

  return (
    <Link
      to={`/${article.category}/${article.slug}`}
      className="card"
      onClick={handleClick}
    >
      <div className="card-thumb">
        {article.thumbnail_url ? (
          <img src={article.thumbnail_url} alt={article.title} />
        ) : (
          <div className="card-thumb-placeholder" />
        )}
      </div>
      <div className={`card-title ${visited ? 'visited' : ''}`}>
        {article.title}
        {isNew && <span className="new-dot"></span>}
      </div>
    </Link>
  )
}
