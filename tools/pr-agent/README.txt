PRCOME AI PR 워크스페이스 (tools/pr-agent/) — 구조 및 유지보수 안내
====================================================================

[역할]
MESSAZE MVP를 PRCOME에 통합한 "AI PR 워크스페이스"입니다.
tools/press-release.html?start=write  → 작성 모드 진입
tools/distribute.html?start=distribute → 배포 모드 진입

[폴더 구성 — 이 폴더 안에서 자기완결적으로 동작]
  index.html                  워크스페이스 화면 + 앱 로직(인라인)
  config.js                   백엔드 API 주소 (window.API_BASE_URL)
  js/article-generator.js     기사 생성 엔진
  js/mail-generator.js        기자 제안 메일 생성
  js/demo-data.js             샘플 입력 데이터
  css/ , assets/              (예비)

[외부 의존 — "화면(껍데기)"만 공유, 기능은 독립]
  ../../assets/css/style.css  PRCOME 공통 스타일(헤더/폰트/색 토큰)
  ../../assets/js/site.js     PRCOME 공통 헤더/푸터 주입 (#site-header/#site-footer)
  Pretendard (CDN)            폰트

[중요 · 향후 메인페이지 디자인 수정 시]
- AI "기능"은 이 폴더의 index.html + js/ 에만 있습니다. 메인페이지 파일과 분리돼 있습니다.
- 메인 디자인(assets/css/style.css, assets/js/site.js)을 바꿔도
  워크스페이스의 "기능"은 영향받지 않습니다(껍데기 모양만 함께 바뀜).
- 이 폴더의 index.html 하단 인라인 <script> 와 js/ 파일은 기능 코드이므로
  디자인 작업 중 수정/삭제하지 마세요.
- 백엔드/CORS/발송은 이 프런트와 무관하게 별도(Render, 비공개 backend)입니다.

[로컬 확인]
  프로젝트 루트에서 정적 서버 실행 후:
  http://localhost:PORT/tools/pr-agent/index.html?start=write
  ※ 기자 검색·추천은 백엔드 CORS가 github.io만 허용하므로
    GitHub Pages 배포 후에만 실제로 동작합니다(로컬은 정상적으로 막힘).
