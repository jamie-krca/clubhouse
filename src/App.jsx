import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import ArticleList from './pages/ArticleList'
import ArticleDetail from './pages/ArticleDetail'
import Admin from './pages/Admin'
import AdminWrite from './pages/AdminWrite'
import AdminEdit from './pages/AdminEdit'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/baseball" element={<ArticleList category="baseball" />} />
      <Route path="/baseball/:slug" element={<ArticleDetail category="baseball" />} />
      <Route path="/interview" element={<ArticleList category="interview" />} />
      <Route path="/interview/:slug" element={<ArticleDetail category="interview" />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/admin/write" element={<AdminWrite />} />
      <Route path="/admin/edit/:id" element={<AdminEdit />} />
    </Routes>
  )
}
