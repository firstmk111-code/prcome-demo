# PR컴(PRCOME) 리뉴얼 제안서 — 언론홍보 배포 툴 + 미디어 디렉토리 중심

- 작성일: 2026-07-31
- 버전: v1 (기획·설계)
- 기준: 2026-07-31 회의 결론 반영 / 개발팀 「AI 웹사이트 제작 표준」(PHP 8.2 + CodeIgniter 4 + MySQL 5.6) 준수
- 목적: 개발팀이 표준 환경 그대로 착수할 수 있도록 방향·IA·DB·라우팅·API를 하나로 정리

---

## 0. 한 줄 요약

> **"보도자료, 어디에 맡길지 고민이라면 — PR컴이 제일 낫다"** 를 증명하는
> **언론홍보(보도자료) 배포 툴 + 매체 설명형 미디어 디렉토리** 사이트.
> 커뮤니티는 보조(후방)로 이동.

---

## 1. 배경 · 방향 전환

### 1.1 기존 방향의 문제
- 커뮤니티 중심 구성은 **목적성이 약하고 활성화가 어렵다** (링크드인/로켓펀치식 구성은 진입장벽·운영부담 큼).
- 타깃(대행사? 일반 광고주? 중소기업 마케터?)이 불명확 → 뾰족함 부족.

### 1.2 확정된 새 방향
| 구분 | 내용 |
| --- | --- |
| 포지셔닝 | 보도자료 배포를 **가장 잘 맡길 수 있는 곳** (언론홍보 실무 툴) |
| 1차 타깃 | 이미 보도자료를 배포하는(또는 맡기려는) 실무 고객 — "어디에 맡길지 비교하는 사람들" |
| 경쟁 대상 | 뉴스와이어 · 미디어피(mediap) · 리스토브 등 배포 대행 서비스 |
| 승부처 | **매체를 잘 설명하는 미디어 디렉토리** + 투명 단가 + AI 작성→배포 원스톱 |
| 커뮤니티 | 신뢰·SEO용 **보조 콘텐츠**로 후방 배치 |

### 1.3 핵심 인사이트
- 고객은 "공감신문이 **뭐하는 매체인지**" 모른다 → 매체 하나하나를 **설명**하는 디렉토리가 차별화의 핵심.
- 우리는 이미 **업종별(일반/메디컬/창업/법률/뷰티·헬스/건강식품/블록체인/HTS) 노출채널·참고사항·단가 데이터**를 보유 → 그대로 자산화.

---

## 2. 경쟁사 대비 차별화 (Why PR컴)

| 항목 | 경쟁사(뉴스와이어·미디어피 등) | PR컴 |
| --- | --- | --- |
| 매체 정보 | 매체명 위주 나열 | **매체 설명 + 독자·노출채널 + 업종 가능/불가 + 참고사항** |
| 단가 | 불투명/문의 | **업종·매체별 투명 단가 + 장바구니 결제** |
| 작성 | 직접 작성 | **AI 보도자료 작성 → 배포까지 원스톱** |
| 선택 근거 | 부족 | "이 매체가 우리 업종에 맞나"를 즉시 판단 |

---

## 3. 정보구조(IA) · 사이트맵

### 3.1 네비게이션 (재편)
```
홈 · 보도자료 배포(툴) · 미디어 디렉토리 · 단가표 · 인사이트 · [커뮤니티]
```
- **언론사 리스트 → "미디어 디렉토리"로 승격**(간판 콘텐츠).
- PR회사 가이드/디렉토리 등 부가 정보는 **축소 또는 제거**.
- 커뮤니티는 메뉴 **뒤쪽 보조**.

### 3.2 사이트맵
```
공개(프론트)
├── / (홈)                         : 배포 툴 진입 + 미디어 디렉토리 프리뷰 + 차별화
├── /distribute (보도자료 배포 툴)  : 3스텝(기사 작성 → 매체 선택 → 결제)
├── /directory (미디어 디렉토리)    : 매체 설명형 목록/상세 (핵심)
│   └── /directory/{slug} (매체 상세)
├── /pricing (단가표)              : 업종·매체별 단가
├── /insights (인사이트/매거진)     : 실무 콘텐츠(SEO)
├── /community (커뮤니티, 후방)      : 실무 Q&A·자료
└── /contact, /guide, /legal/*     : 문의·이용안내·약관

관리자(백엔드, /admin)
├── 로그인 / 대시보드
├── 미디어(매체) 관리 CRUD
├── 업종 카테고리 관리
├── 주문(배포 신청) 관리
├── 보도자료(기사) 관리
├── 인사이트 관리
├── 커뮤니티 게시글 관리
├── 오늘의 PR 정보(공고·행사·지원사업) 관리
└── 회원/문의 관리
```

---

## 4. 화면 구성 — 홈(위→아래)

1. **히어로** — "보도자료, 어디에 맡기시겠어요?" / 부제: AI로 작성 → 매체 선택 → 한 번에 배포
   - CTA: **[보도자료 배포 시작]** · **[매체·단가 둘러보기]**
   - 신뢰지표: 제휴 매체 수 · 누적 배포 · 평균 게재율
2. **3스텝 배포 플로우** (기사 작성 → 매체 선택 → 결제)
3. **⭐ 미디어 디렉토리 프리뷰** — 대표 매체 카드(설명+업종+노출채널) + "전체 보기"
4. **왜 PR컴인가** — 경쟁사 대비 비교표
5. **투명 단가표 프리뷰**
6. **(후방) 인사이트/커뮤니티** — 실무 콘텐츠 소량 노출
7. **후기·실적 · FAQ · 마지막 CTA**

---

## 5. 페이지별 기능 명세 (요약)

| 페이지 | 핵심 기능 |
| --- | --- |
| 미디어 디렉토리 | 업종·노출채널·가격 필터, 매체 **설명**·독자·참고사항, 상세 페이지, 즐겨찾기→배포 담기 |
| 보도자료 배포 툴 | ① AI 기사 작성/업로드 ② 매체 선택(장바구니) ③ 결제/신청 (스텝바) |
| 단가표 | 업종×매체 단가 매트릭스, 검색·정렬 |
| 인사이트 | 카테고리별 아티클(SEO/AEO/GEO 구조화 데이터) |
| 커뮤니티(후방) | 실무 Q&A·자료 게시판 (읽기 자유, 참여는 로그인) |
| 관리자 | 위 데이터 전부 CRUD + 주문/문의 관리 |

---

# 6. 기술 아키텍처 — 개발팀 표준 준수

> 스택: **PHP 8.2 + CodeIgniter 4 + MySQL 5.6 + HTML/CSS/JS**
> 아래는 「AI 웹사이트 제작 표준」을 PR컴 도메인에 매핑한 것.

## 6.1 디렉토리 구조 (표준 그대로)
```
프로젝트 루트/
├── app/
│   ├── Config/ (Routes.php, Database.php, Filters.php, Session.php)
│   ├── Controllers/
│   │   ├── Admin/   (Auth, Dashboard, Media, Category, Order, Article, Post, Insight, Program, User)
│   │   └── Api/     (Media, Category, Order, Article, Post, Insight, Program, Contact)
│   ├── Models/      (MediaModel, CategoryModel, OrderModel, OrderItemModel, ArticleModel, PostModel, InsightModel, ProgramModel, UserModel, AdminUserModel, InquiryModel)
│   ├── Views/admin/ (layout.php 공통 레이아웃 + 각 화면)
│   ├── Filters/     (AdminAuth.php)
│   └── Database/Migrations/
├── public/          (사이트 루트)
│   ├── index.html   (홈)  distribute.html  directory.html  pricing.html  insights.html  community.html
│   ├── css/  js/  images/  uploads/  index.php
├── writable/  system/  vendor/
├── composer.json  spark  .env.example  .env(수동)
```
- 프론트 HTML은 `public/`에 배치, 데이터는 **JS `fetch` → `/api/*`** 로 취득.
- CSS/JS 인라인 금지 → `public/css`, `public/js`.
- 업로드 파일 `public/uploads/`, DB에는 **상대경로만** 저장.

## 6.2 네이밍 컨벤션 (표준 준수)
- 컨트롤러 PascalCase(`Media.php`) · 모델 `MediaModel.php` · 뷰 snake_case(`media_list.php`)
- 메서드 camelCase(`getList`) · 변수 snake_case(`$media_list`)
- 테이블 snake_case 복수형(`media_outlets`) · 라우트 kebab-case(`/admin/media-list`)

## 6.3 데이터베이스 설계 (MySQL 5.6 · utf8mb4_unicode_ci)
공통: `id` INT UNSIGNED AI PK · `created_at`/`updated_at` 필수 · 삭제기능 테이블 `deleted_at`(소프트딜리트) · 논리 외래키.

| 테이블 | 주요 컬럼 | 설명 |
| --- | --- | --- |
| `media_outlets` | id, name, slug, description(매체 설명), reader(독자층), channel(노출채널), homepage, logo_path, is_active | 언론사(매체) — **간판** |
| `media_categories` | id, name, sort | 업종(일반/메디컬/창업/법률/뷰티·헬스/건강식품/블록체인/HTS…) |
| `media_prices` | id, outlet_id, category_id, price, note(참고사항), possible(가능여부) | 매체×업종 단가·노출조건 (기존 데이터 이관) |
| `press_orders` | id, user_id, article_id, status, total_price, payment_status | 배포 신청(주문) |
| `order_items` | id, order_id, outlet_id, category_id, price | 주문 내 선택 매체 |
| `articles` | id, user_id, title, body, source(ai/manual), status | 보도자료(기사) 초안 |
| `posts` | id, user_id, category(qa/knowhow/case/data), title, body, views, is_notice | 커뮤니티(후방) |
| `comments` | id, post_id, user_id, body | 댓글 |
| `insights` | id, category, title, slug, body, thumb_path, published_at | 인사이트/매거진 |
| `programs` | id, type(bid/event/edu/support), title, org, link, deadline | 오늘의 PR 정보(공고·행사·지원사업) |
| `users` | id, email, password(hash), name, company, role | 회원 |
| `admin_users` | id, username, password(hash), name | 관리자 |
| `inquiries` | id, name, email, phone, message, status | 문의 |

> 기존 정적 사이트의 `press-media.js` / `press-notes*.js`(업종별 노출채널·참고사항·단가) → `media_outlets` + `media_prices` **마이그레이션 시더**로 이관.

## 6.4 라우팅 설계 (`app/Config/Routes.php`)
```php
// API
$routes->group('api', ['namespace' => 'App\Controllers\Api'], function($routes) {
    $routes->get('media', 'Media::list');                 // 매체 목록(필터: category, channel, price)
    $routes->get('media/(:segment)', 'Media::detail/$1');  // 매체 상세(slug)
    $routes->get('categories', 'Category::list');
    $routes->get('prices', 'Order::priceMatrix');          // 단가표
    $routes->post('orders', 'Order::create');              // 배포 신청
    $routes->post('articles/draft', 'Article::draft');     // AI 보도자료 초안
    $routes->get('insights', 'Insight::list');
    $routes->get('posts', 'Post::list');
    $routes->get('programs', 'Program::list');             // 오늘의 PR 정보
    $routes->post('contact', 'Contact::submit');
});

// 관리자
$routes->group('admin', ['namespace' => 'App\Controllers\Admin'], function($routes) {
    $routes->get('login', 'Auth::login');
    $routes->post('login', 'Auth::doLogin');
    $routes->get('logout', 'Auth::logout');
    $routes->group('', ['filter' => 'adminAuth'], function($routes) {
        $routes->get('dashboard', 'Dashboard::index');
        $routes->get('media', 'Media::index');
        $routes->post('media/store', 'Media::store');
        $routes->get('order', 'Order::index');
        $routes->get('article', 'Article::index');
        $routes->get('post', 'Post::index');
        $routes->get('insight', 'Insight::index');
        $routes->get('program', 'Program::index');
        $routes->get('user', 'User::index');
    });
});
```

## 6.5 API 응답 포맷 (표준 통일)
```php
// 성공
return $this->response->setJSON(['status'=>true,'message'=>'ok','data'=>$data]);
// 실패
return $this->response->setStatusCode(400)->setJSON(['status'=>false,'message'=>'...','data'=>null]);
```
프론트 `fetch`는 `X-Requested-With: XMLHttpRequest` 헤더 + `result.status` 분기(표준 규격).

## 6.6 보안 규칙 적용 지점
| 항목 | 적용 |
| --- | --- |
| SQL 인젝션 | 모델 전부 Query Builder/바인딩 (문자열 SQL 금지) |
| XSS | 뷰 출력 `esc()` 필수 |
| CSRF | 폼 `csrf_field()`, API CSRF 필터 |
| 비밀번호 | `password_hash(PASSWORD_DEFAULT)` |
| 파일 업로드 | 화이트리스트(jpg/png/pdf), ≤5MB, 파일명 재생성, `public/uploads/` |
| 세션 | DB 세션 저장 |
| adminAuth 필터 | `session.admin_id` 없으면 `/admin/login` 리다이렉트 |
| .env | 저장소 업로드 금지(`.env.example`만) |

## 6.7 프로젝트 초기화 파일 (동시 생성)
`composer.json` · `spark` · `.env.example` · `public/index.php` · `app/Config/Routes.php` · `app/Config/Filters.php`
```bash
composer install
cp .env.example .env      # DB 정보 입력
php spark migrate         # 테이블 생성 (+ 시더로 매체·단가 이관)
chmod -R 775 writable/ public/uploads/
php spark serve
```

---

## 7. 데이터 이관 계획
1. 기존 정적 자산(`assets/js/press-media.js`, `press-notes*.js`, `companies.js`)에서 매체명·업종·단가·노출채널·참고사항 추출.
2. `Database/Seeds/`에 시더 작성 → `media_outlets` + `media_categories` + `media_prices` 적재.
3. 매체 **설명(description)·독자층** 필드는 신규 작성 대상(콘텐츠 작업 병행).

---

## 8. 개발 로드맵 (마일스톤)

| 단계 | 산출물 |
| --- | --- |
| M0 초기화 | CI4 스캐폴딩(표준 디렉토리·라우트·필터·.env.example), DB 마이그레이션 골격 |
| M1 미디어 디렉토리 | 매체 CRUD(admin) + `/api/media` + 프론트 디렉토리/상세 (**간판 우선**) |
| M2 배포 툴 | 3스텝(작성→선택→신청) + `press_orders`/`order_items` + 단가표 |
| M3 홈 재구성 | 새 포지셔닝 홈(배포 툴+디렉토리 프리뷰+차별화) |
| M4 보조 | 인사이트·커뮤니티(후방)·오늘의 PR 정보·문의 |
| M5 AI 보도자료 | 기사 생성 정상화(이전 정상 로직 복원·연동) |

---

## 9. 확인 필요 사항 (다음 결정)
1. **결제 연동**: 실제 결제(PG) 붙일지, 1차는 "신청→관리자 확인" 수동 처리인지.
2. **회원 체계**: 소셜로그인 포함 여부 / B2B(사업자) 정보 수집 범위.
3. **AI 작성**: 기존 사용 모델·엔드포인트(복원 대상) 확인 필요.
4. **매체 설명 콘텐츠**: 매체별 설명·독자층 원고 누가 작성할지(내부/외주).
5. **도메인·서버**: 배포 서버(리눅스/PHP 8.2/MySQL 5.6) 환경 확정.

---

*본 문서는 회의 결론 + 개발팀 표준을 결합한 1차 기획·설계안입니다. 확정 후 M0(스캐폴딩)부터 착수합니다.*
