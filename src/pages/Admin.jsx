import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { SITE_NAME } from '../lib/constants'

export default function Admin() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [articles, setArticles] = useState([])
  const [subscribers, setSubscribers] = useState([])
  const [showSubscribers, setShowSubscribers] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
      if (session) {
        fetchArticles()
        fetchSubscribers()
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        if (session) {
          fetchArticles()
          fetchSubscribers()
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function fetchArticles() {
    const { data } = await supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false })

    setArticles(data || [])
  }

  async function fetchSubscribers() {
    const { data } = await supabase
      .from('subscribers')
      .select('*')
      .order('created_at', { ascending: false })

    setSubscribers(data || [])
  }

  async function handleLogin(e) {
    e.preventDefault()
    setLoginError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setLoginError('로그인 실패: 이메일 또는 비밀번호를 확인하세요.')
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setSession(null)
  }

  async function togglePublish(article) {
    await supabase
      .from('articles')
      .update({ published: !article.published })
      .eq('id', article.id)

    fetchArticles()
  }

  async function deleteArticle(id) {
    if (!confirm('정말 삭제하시겠습니까?')) return

    await supabase.from('articles').delete().eq('id', id)
    fetchArticles()
  }

  function formatDate(dateStr) {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="admin-wrap">
        <p style={{ color: '#888' }}>불러오는 중...</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="admin-login">
        <h1 className="admin-title">{SITE_NAME} Admin</h1>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">로그인</button>
          {loginError && (
            <p style={{ color: '#e33', fontSize: '13px', marginTop: '12px' }}>
              {loginError}
            </p>
          )}
        </form>
      </div>
    )
  }

  const totalViews = articles.reduce((sum, a) => sum + (a.view_count || 0), 0)

  return (
    <div className="admin-wrap">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="admin-title" style={{ marginBottom: 0 }}>관리자</h1>
        <button onClick={handleLogout} style={{ padding: '8px 16px', border: '1px solid #e3e3e3', background: '#fff', fontSize: '13px', cursor: 'pointer' }}>
          로그아웃
        </button>
      </div>

      <div style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
        <div style={{ padding: '16px 24px', border: '1px solid #ededed' }}>
          <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>총 글</div>
          <div style={{ fontSize: '24px', fontWeight: '700' }}>{articles.length}</div>
        </div>
        <div style={{ padding: '16px 24px', border: '1px solid #ededed' }}>
          <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>총 조회수</div>
          <div style={{ fontSize: '24px', fontWeight: '700' }}>{totalViews.toLocaleString()}</div>
        </div>
        <div
          onClick={() => setShowSubscribers(true)}
          style={{ padding: '16px 24px', border: '1px solid #ededed', cursor: 'pointer', transition: 'border-color 0.18s' }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#111'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = '#ededed'}
        >
          <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>구독자</div>
          <div style={{ fontSize: '24px', fontWeight: '700' }}>{subscribers.length}</div>
        </div>
      </div>

      <Link to="/admin/write" className="admin-btn">새 글 쓰기</Link>

      <table className="admin-table">
        <thead>
          <tr>
            <th>제목</th>
            <th>카테고리</th>
            <th>상태</th>
            <th>조회</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {articles.map((article) => (
            <tr key={article.id}>
              <td>{article.title}</td>
              <td>{article.category === 'baseball' ? '야구' : '면접'}</td>
              <td>{article.published ? '발행' : '비발행'}</td>
              <td className="views">{article.view_count || 0}</td>
              <td>
                <div className="admin-actions">
                  <button onClick={() => togglePublish(article)}>
                    {article.published ? '비발행' : '발행'}
                  </button>
                  <button onClick={() => navigate(`/admin/edit/${article.id}`)}>
                    수정
                  </button>
                  <button className="delete" onClick={() => deleteArticle(article.id)}>
                    삭제
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showSubscribers && (
        <div
          className="modal-overlay open"
          onClick={(e) => e.target === e.currentTarget && setShowSubscribers(false)}
        >
          <div className="modal" style={{ width: '500px' }}>
            <button className="modal-close" onClick={() => setShowSubscribers(false)}>×</button>
            <div className="modal-title">구독자 목록</div>
            <div className="modal-sub">{subscribers.length}명</div>
            {subscribers.length === 0 ? (
              <p style={{ color: '#888', fontSize: '14px' }}>아직 구독자가 없습니다.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '8px 0', borderBottom: '1px solid #ededed', color: '#888', fontWeight: '500' }}>이메일</th>
                    <th style={{ textAlign: 'right', padding: '8px 0', borderBottom: '1px solid #ededed', color: '#888', fontWeight: '500' }}>구독일</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((sub) => (
                    <tr key={sub.id}>
                      <td style={{ padding: '10px 0', borderBottom: '1px solid #f4f4f4' }}>{sub.email}</td>
                      <td style={{ padding: '10px 0', borderBottom: '1px solid #f4f4f4', textAlign: 'right', color: '#888' }}>{formatDate(sub.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
