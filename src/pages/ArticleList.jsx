import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import GNB from '../components/GNB'
import Footer from '../components/Footer'
import Card from '../components/Card'
import SubscribeModal from '../components/SubscribeModal'

const ITEMS_PER_PAGE = 9

export default function ArticleList({ category }) {
  const [articles, setArticles] = useState([])
  const [recentArticles, setRecentArticles] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    fetchArticles()
    fetchRecentArticles()
  }, [category, page])

  async function fetchArticles() {
    setLoading(true)
    const from = (page - 1) * ITEMS_PER_PAGE
    const to = from + ITEMS_PER_PAGE - 1

    const { data, count } = await supabase
      .from('articles')
      .select('*', { count: 'exact' })
      .eq('category', category)
      .eq('published', true)
      .order('created_at', { ascending: false })
      .range(from, to)

    setArticles(data || [])
    setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE))
    setLoading(false)
  }

  async function fetchRecentArticles() {
    const { data } = await supabase
      .from('articles')
      .select('id, title, slug, category')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(3)

    setRecentArticles(data || [])
  }

  return (
    <>
      <GNB onSubscribe={() => setModalOpen(true)} />
      <div className="wrap">
        <div className="grid">
          {loading ? (
            <p style={{ color: '#888' }}>불러오는 중...</p>
          ) : articles.length === 0 ? (
            <p style={{ color: '#888' }}>아직 글이 없습니다.</p>
          ) : (
            articles.map((article) => (
              <Card key={article.id} article={article} />
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`pg-btn ${page === p ? 'active' : ''}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
      <Footer recentArticles={recentArticles} />
      <SubscribeModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}
