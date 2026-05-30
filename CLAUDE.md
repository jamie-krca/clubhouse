# 개인 칼럼 웹사이트 — 개발 기획서 (CLAUDE.md)

> 이 문서는 Claude Code에 그대로 전달해 개발을 착수하기 위한 작업 지시서다.
> 작성자(=관리자)는 비개발자이며, 코드 작성은 Claude Code가 전담한다.

---

## 1. 프로젝트 개요

개인이 운영하는 **칼럼 웹사이트**. 두 개의 완전히 다른 주제를 한 도메인 안에서 분리해 다룬다.

- **야구 칼럼** (`/baseball`)
- **면접 / 커리어 이야기** (`/interview`)

방문자는 자기 관심사 섹션만 보고, 두 주제가 섞여 보이지 않는다.
관리자(사이트 주인)는 별도 관리자 페이지에서 로그인 후 글을 직접 작성/수정/삭제하고, 조회수를 확인한다.

> 브랜드명: Clubhouse. 코드 내에서는 `SITE_NAME` 상수로 관리해 나중에 한 곳만 바꾸면 되도록 한다.

---

## 2. 기술 스택

| 구분 | 선택 | 비고 |
|------|------|------|
| 프론트엔드 | Vite + React + React Router | 동적 렌더링 위해 React |
| DB / 인증 | Supabase | articles, subscribers 테이블 + Auth |
| 이미지 | Cloudinary (unsigned upload) | 기존 계정 재사용 가능 |
| 호스팅 | Vercel | 무료, GitHub 연동 자동 배포 |
| 에디터 | Tiptap (또는 react-quill) | 글 작성용 리치 텍스트 |

전부 무료 티어 범위 내에서 동작한다.

---

## 3. 라우팅 구조

```
/                      → 랜딩 (간단한 소개 + 야구/면접 진입점 2개)
/baseball              → 야구 칼럼 목록 (카드 그리드)
/baseball/:slug        → 야구 칼럼 상세
/interview             → 면접 글 목록 (카드 그리드)
/interview/:slug       → 면접 글 상세
/admin                 → 관리자 로그인 + 대시보드
/admin/write           → 글 작성
/admin/edit/:id        → 글 수정
```

- 공개 페이지에는 **관리자 로그인 버튼을 노출하지 않는다.** `/admin`은 주소를 직접 입력해야 접근.
- ⚠️ **중요:** `/admin` URL을 숨기는 것은 보안이 아니다. 반드시 Supabase Auth 로그인으로 보호한다. 로그인 안 된 상태로 `/admin` 접근 시 로그인 폼만 보이고, 글쓰기 기능은 인증된 세션에서만 동작한다.

---

## 4. 데이터베이스 스키마 (Supabase)

### `articles`
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK, default gen_random_uuid()) | |
| category | text | 'baseball' \| 'interview' |
| title | text | 글 제목 |
| slug | text (unique) | URL용 슬러그 (한글 가능, URL 인코딩) |
| content | text | 본문 (HTML 또는 Markdown) |
| thumbnail_url | text | Cloudinary 이미지 URL |
| published | boolean (default false) | 발행 여부 (false면 목록에 안 보임) |
| view_count | integer (default 0) | 조회수 |
| created_at | timestamptz (default now()) | |
| updated_at | timestamptz | 수정 시각 |

### `subscribers`
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | |
| email | text (unique) | 구독 이메일 |
| created_at | timestamptz (default now()) | |

### RLS (Row Level Security) 정책
- `articles`: 공개 읽기는 `published = true`인 행만 허용. 쓰기/수정/삭제는 인증된 사용자(관리자)만.
- `subscribers`: 익명 INSERT 허용 (구독 폼), 읽기는 인증된 사용자만 (관리자가 구독자 목록 봄).
- `view_count` 증가는 RPC 함수(`increment_view`)로 처리해 published 글만 카운트.

---

## 5. 페이지별 상세 명세

### 5-1. 랜딩 `/`
- 사이트 주인 한 줄 소개 + 두 개의 진입 카드/링크 (야구 / 면접).
- 미니멀하게. 과한 히어로 카피 금지.

### 5-2. 목록 페이지 `/baseball`, `/interview`
- 상단 GNB: 로고(클릭 시 `/`) + 구독하기 버튼.
- 카드 그리드 3열 (반응형: 모바일 1열, 태블릿 2열).
- 카드 = 썸네일(3:2) + 제목만. (날짜/카테고리 태그 없음)
- `published = true`인 글만 최신순.
- 페이지네이션 또는 "더 보기" 버튼.
- 구독하기 → 이메일 입력 모달 → `subscribers`에 저장.

### 5-3. 상세 페이지 `/baseball/:slug`, `/interview/:slug`
- 진입 시 `view_count` +1 (RPC).
- 구성: 제목 → 썸네일 → 본문.
- 본문 하단 고정 요소:
  - **링크 복사 버튼** (클릭 시 현재 URL 클립보드 복사 + "복사됨" 토스트)
  - **이전 글 / 다음 글** 네비게이션 (같은 카테고리 내 created_at 기준)
  - 목록으로 돌아가기 링크
- 조회수는 **공개 페이지에 표시하지 않는다.** (관리자만 봄)

### 5-4. 관리자 `/admin`
- 로그인 안 됨 → 이메일/비번 로그인 폼.
- 로그인 됨 → 대시보드:
  - 전체 글 목록 (두 카테고리 모두), 각 글의 **조회수 표시**.
  - 글별 수정/삭제 버튼, 발행/비발행 토글.
  - "새 글 쓰기" 버튼 → `/admin/write`.
  - 구독자 수 / 구독자 목록.
  - (선택) 조회수 합계, 인기 글 정렬 등 간단한 통계.

### 5-5. 글 작성/수정 `/admin/write`, `/admin/edit/:id`
- 입력: 카테고리 선택(야구/면접), 제목, 썸네일 업로드(Cloudinary), 본문(리치 텍스트 에디터).
- 슬러그는 제목 기반 자동 생성 (수정 가능).
- "임시저장(비발행)" / "발행" 두 버튼.
- 수정 모드면 기존 값 불러와 채움.

---

## 6. 이미지 업로드 (Cloudinary)
- Unsigned upload preset 사용 (클라이언트에서 직접 업로드).
- 에디터에서 이미지 선택 → Cloudinary 업로드 → 반환된 URL을 본문/썸네일에 삽입.
- 기존 계정/프리셋 재사용 가능.

---

## 7. 구독자 이메일 자동 발송 (Phase 2 — 나중)
- 처음엔 **이메일 수집만** 구현 (subscribers 저장).
- 새 글 발행 시 구독자에게 자동 메일 발송은 2단계 작업:
  - Resend (무료 월 3,000건) 연동 + Supabase Edge Function.
- 1차 런칭에는 포함하지 않는다.

---

## 8. 개발 순서 (제안)
1. Vite + React + React Router 프로젝트 세팅, 디자인 토큰 적용.
2. Supabase 연결 (env: URL, anon key), 테이블 + RLS + RPC 생성 SQL.
3. 공개 목록/상세 페이지 (더미 데이터 → 실제 fetch).
4. 관리자 로그인 (Supabase Auth).
5. 글 작성/수정/삭제 + Cloudinary 업로드.
6. 조회수 RPC, 이전/다음 글, 링크 복사.
7. 구독 폼 → subscribers 저장.
8. Vercel 배포.
9. (Phase 2) 도메인 연결, 구독 메일 발송.

---

## 9. 디자인 가이드 (기존 시안 유지)
- 베이스: **화이트 배경**, 미니멀, 1px 라인 구분.
- 폰트: 제목/로고 = Libre Baskerville (serif), 본문/UI = Noto Sans KR, 영문 보조 = DM Sans.
- 톤: NYT 스포츠 섹션 같은 정제된 에디토리얼.
- 카드: 테두리 없음, 썸네일 3:2 + 제목. hover 시 살짝 확대/제목 색 변화.
- 야구/면접 섹션은 같은 베이스에 액센트 컬러만 미세하게 다르게 가도 됨.
- (기존에 만든 HTML 시안을 참고 자료로 함께 전달)

---

## 10. 작성자가 미리 준비/제공할 것
1. Supabase 새 프로젝트 → `SUPABASE_URL`, `SUPABASE_ANON_KEY`
2. Supabase Auth에 관리자 계정 1개 (이메일 + 비번)
3. Cloudinary cloud name + unsigned upload preset
4. Vercel 계정 (GitHub 연동)
5. (나중) 도메인

---

## 11. 환경변수 (.env)
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_UPLOAD_PRESET=
VITE_SITE_NAME=Clubhouse
```
