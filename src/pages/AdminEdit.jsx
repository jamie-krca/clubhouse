import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { uploadImage } from '../lib/storage'

export default function AdminEdit() {
  const { id } = useParams()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [category, setCategory] = useState('baseball')
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [content, setContent] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [published, setPublished] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (!session) {
        navigate('/admin')
      } else {
        fetchArticle()
      }
    })
  }, [id, navigate])

  async function fetchArticle() {
    const { data } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single()

    if (data) {
      setCategory(data.category)
      setTitle(data.title)
      setSlug(data.slug)
      setContent(data.content || '')
      setThumbnailUrl(data.thumbnail_url || '')
      setPublished(data.published)
    }

    setLoading(false)
  }

  async function handleThumbnailUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const url = await uploadImage(file)
    setThumbnailUrl(url)
    setUploading(false)
  }

  async function saveArticle(publish) {
    if (!title.trim()) {
      alert('제목을 입력하세요.')
      return
    }

    setSaving(true)

    const { error } = await supabase
      .from('articles')
      .update({
        category,
        title: title.trim(),
        slug: slug.trim(),
        content,
        thumbnail_url: thumbnailUrl,
        published: publish,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    setSaving(false)

    if (error) {
      alert('저장 실패: ' + error.message)
      return
    }

    navigate('/admin')
  }

  if (loading) {
    return (
      <div className="editor-wrap">
        <p style={{ color: '#888' }}>불러오는 중...</p>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="editor-wrap">
      <h1 className="editor-title">글 수정</h1>

      <div className="editor-field">
        <label>카테고리</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="baseball">야구</option>
          <option value="interview">면접</option>
        </select>
      </div>

      <div className="editor-field">
        <label>제목</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="글 제목"
        />
      </div>

      <div className="editor-field">
        <label>썸네일</label>
        <input type="file" accept="image/*" onChange={handleThumbnailUpload} />
        {uploading && <p style={{ fontSize: '13px', color: '#888' }}>업로드 중...</p>}
        {thumbnailUrl && (
          <div className="editor-thumb-preview">
            <img src={thumbnailUrl} alt="썸네일 미리보기" />
          </div>
        )}
      </div>

      <div className="editor-field">
        <label>본문 (HTML)</label>
        <textarea
          className="editor-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="<p>본문을 작성하세요...</p>"
        />
      </div>

      <div className="editor-buttons">
        <button className="save" onClick={() => saveArticle(false)} disabled={saving}>
          임시저장
        </button>
        <button className="publish" onClick={() => saveArticle(true)} disabled={saving}>
          {published ? '수정 완료' : '발행하기'}
        </button>
      </div>
    </div>
  )
}
