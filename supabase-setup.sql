-- Clubhouse 데이터베이스 셋업
-- Supabase SQL Editor에서 실행하세요

-- 1. articles 테이블 생성
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('baseball', 'interview')),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  thumbnail_url TEXT,
  published BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- 2. subscribers 테이블 생성
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. articles 테이블 RLS 설정
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- 공개 읽기: published = true인 글만
CREATE POLICY "Public can read published articles"
  ON articles FOR SELECT
  USING (published = TRUE);

-- 인증된 사용자(관리자)는 모든 글 읽기 가능
CREATE POLICY "Authenticated users can read all articles"
  ON articles FOR SELECT
  TO authenticated
  USING (TRUE);

-- 인증된 사용자(관리자)만 글 작성
CREATE POLICY "Authenticated users can insert articles"
  ON articles FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

-- 인증된 사용자(관리자)만 글 수정
CREATE POLICY "Authenticated users can update articles"
  ON articles FOR UPDATE
  TO authenticated
  USING (TRUE);

-- 인증된 사용자(관리자)만 글 삭제
CREATE POLICY "Authenticated users can delete articles"
  ON articles FOR DELETE
  TO authenticated
  USING (TRUE);

-- 4. subscribers 테이블 RLS 설정
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- 익명 사용자도 구독 가능 (INSERT)
CREATE POLICY "Anyone can subscribe"
  ON subscribers FOR INSERT
  TO anon, authenticated
  WITH CHECK (TRUE);

-- 인증된 사용자(관리자)만 구독자 목록 조회
CREATE POLICY "Authenticated users can read subscribers"
  ON subscribers FOR SELECT
  TO authenticated
  USING (TRUE);

-- 5. 조회수 증가 RPC 함수
CREATE OR REPLACE FUNCTION increment_view(article_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE articles
  SET view_count = view_count + 1
  WHERE id = article_id AND published = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 익명 사용자도 조회수 증가 호출 가능
GRANT EXECUTE ON FUNCTION increment_view(UUID) TO anon;
GRANT EXECUTE ON FUNCTION increment_view(UUID) TO authenticated;

-- 6. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
