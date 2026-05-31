import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import GNB from '../components/GNB'
import Footer from '../components/Footer'
import SubscribeModal from '../components/SubscribeModal'
import Toast from '../components/Toast'

export default function ArticleDetail({ category }) {
  const { slug } = useParams()
  const [article, setArticle] = useState(null)
  const [prevArticle, setPrevArticle] = useState(null)
  const [nextArticle, setNextArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    fetchArticle()
  }, [slug, category])

  async function fetchArticle() {
    setLoading(true)

    const { data } = await supabase
      .from('articles')
      .select('*')
      .eq('category', category)
      .eq('slug', slug)
      .eq('published', true)
      .single()

    if (data) {
      setArticle(data)
      incrementViewCount(data.id)
      fetchAdjacentArticles(data.created_at)
    }

    setLoading(false)
  }

  async function incrementViewCount(id) {
    await supabase.rpc('increment_view', { article_id: id })
  }

  async function fetchAdjacentArticles(createdAt) {
    const { data: prev } = await supabase
      .from('articles')
      .select('slug, title')
      .eq('category', category)
      .eq('published', true)
      .lt('created_at', createdAt)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const { data: next } = await supabase
      .from('articles')
      .select('slug, title')
      .eq('category', category)
      .eq('published', true)
      .gt('created_at', createdAt)
      .order('created_at', { ascending: true })
      .limit(1)
      .single()

    setPrevArticle(prev)
    setNextArticle(next)
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href)
    setToast('링크가 복사되었습니다')
  }

  if (loading) {
    return (
      <div className="page-layout">
        <GNB onSubscribe={() => setModalOpen(true)} />
        <main className="main-content">
          <div className="article-detail">
            <p style={{ color: '#888' }}>불러오는 중...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!article) {
    return (
      <div className="page-layout">
        <GNB onSubscribe={() => setModalOpen(true)} />
        <main className="main-content">
          <div className="article-detail">
            <p style={{ color: '#888' }}>글을 찾을 수 없습니다.</p>
            <Link to={`/${category}`} className="back-link">← 목록으로</Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="page-layout">
      <GNB onSubscribe={() => setModalOpen(true)} />
      <main className="main-content">
        <article className="article-detail">
          <h1 className="article-title">{article.title}</h1>
          {article.thumbnail_url && (
            <img
              src={article.thumbnail_url}
              alt={article.title}
              className="article-thumb"
            />
          )}
          <div
            className="article-content"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
          <div className="article-footer">
            <button className="copy-btn" onClick={copyLink}>
              링크 복사
            </button>
            <div className="article-nav">
              {prevArticle ? (
                <Link to={`/${category}/${prevArticle.slug}`}>
                  ← {prevArticle.title}
                </Link>
              ) : (
                <span />
              )}
              {nextArticle ? (
                <Link to={`/${category}/${nextArticle.slug}`}>
                  {nextArticle.title} →
                </Link>
              ) : (
                <span />
              )}
            </div>
            <Link to={`/${category}`} className="back-link">
              ← 목록으로
            </Link>
          </div>
        </article>
      </main>
      <Footer />
      <SubscribeModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  )
}
