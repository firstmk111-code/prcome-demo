/* =========================================================
   PRCOME — 공통 헤더(VLACKBOX형) / 푸터 / 전체분야 메가 / 모바일 아코디언
   좌: 로고 + 전체 분야  ·  중앙: 라운드 알약 5메뉴  ·  우: +글쓰기 / 검색 / 로그인
   fetch 미사용 → file:// 및 GitHub Pages 모두 동작
   ========================================================= */
(function(){
  var R = (typeof window.SITE_ROOT === 'string') ? window.SITE_ROOT : '';
  function u(p){ return (p.charAt(0)==='#') ? p : R + p; }

  var ICON = {
    chat:'<path d="M4 6h16v9h-9l-4 3v-3H4z"/>',
    spark:'<path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/>',
    bulb:'<path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10c.7.6 1 1.3 1 2h6c0-.7.3-1.4 1-2a6 6 0 0 0-4-10z"/>',
    building:'<path d="M4 21V4h10v17H4z"/><path d="M14 10h6v11h-6"/><path d="M7 8h4M7 12h4M7 16h4"/>',
    swap:'<path d="M4 8h13l-3-3"/><path d="M20 16H7l3 3"/>',
    bag:'<path d="M4 8h16v11H4z"/><path d="M9 8V6h6v2"/><path d="M4 13h16"/>',
    dots:'<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>',
    grid:'<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
    pen:'<path d="M4 20l4-1L19 8l-3-3L5 16z"/><path d="M14 6l3 3"/>',
    search:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/>'
  };
  function svg(name,cls){ return '<svg class="'+(cls||'mi')+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(ICON[name]||'')+'</svg>'; }
  var CHEV = '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';

  /* ---- 분야/메뉴 정의 (전체 분야 메가 + 모바일 아코디언 공용) ---- */
  var MENU = [
    { label:'인사이트', icon:'bulb', href:'insights/index.html', items:[
      ['insights/index.html?cat=pr','PR·언론홍보'],['insights/index.html?cat=digital','마케팅'],
      ['insights/index.html?cat=brand','브랜드·콘텐츠'],['insights/index.html?cat=seo','SEO'],
      ['insights/index.html?cat=geo','AEO·GEO'],['insights/index.html?cat=ai','AI 마케팅'],
      ['insights/index.html?cat=interview','인터뷰·칼럼'] ]},
    { label:'커뮤니티', icon:'chat', href:'community/index.html', items:[
      ['community/index.html?cat=free','자유게시판'],['community/index.html?cat=pr-qa','PR 실무 Q&A'],
      ['community/index.html?cat=mkt-qa','마케팅 실무 Q&A'],['community/index.html?cat=media','미디어·언론정보'],
      ['community/index.html?cat=seo','SEO·AEO·GEO'],['community/index.html?cat=promo','업계 홍보'] ]},
    { label:'기업·미디어', icon:'building', href:'directory/index.html', items:[
      ['directory/agencies.html','PR회사'],['directory/agencies.html','마케팅회사'],
      ['directory/media.html','언론사 리스트'],['directory/index.html?type=expert','전문가'],
      ['directory/index.html?type=org','언론단체'],['directory/index.html?type=edu','교육기관'] ]},
    { label:'프로젝트', icon:'swap', href:'projects/index.html', items:[
      ['projects/new.html','홍보대행 의뢰'],['projects/index.html','프로젝트 찾기'],
      ['projects/new.html','프로젝트 등록'],['directory/register.html','PR·마케팅회사 등록'] ]},
    { label:'PR 도구', icon:'spark', href:'tools/index.html', items:[
      ['tools/press-release.html','보도자료 작성 AI'],['tools/distribute.html','보도자료 배포 AI'],
      ['tools/coverage-check.html','기사화 가능성 진단'],['tools/media-recommend.html','언론사·매체 추천'],
      ['tools/visibility.html','SEO·AEO·GEO 진단'],['tools/visibility.html','AI 검색 가시성 진단'] ]},
    { label:'구인구직', icon:'bag', href:'career/index.html', items:[
      ['career/index.html?type=hire','채용정보'],['career/index.html','구직정보'],
      ['career/index.html?type=freelance','프리랜서·외주'] ]},
    { label:'더보기', icon:'dots', href:'help/guide.html', items:[
      ['notice/index.html','공지사항'],['resources/books.html','PR·마케팅 도서'],
      ['directory/index.html?type=dept','관련 학과'],['insights/index.html?cat=term','PR 용어사전'],
      ['help/guide.html','이용안내'],['help/contact.html','광고·제휴 문의'] ]},
  ];

  /* 중앙 라운드 알약 내비 (5) */
  var PILLS = [
    ['insights/index.html','인사이트','insights'],
    ['community/index.html','커뮤니티','community'],
    ['directory/index.html','기업·미디어','directory'],
    ['projects/index.html','프로젝트','projects'],
    ['tools/index.html','PR 도구','tools'],
  ];

  /* ---- 전체 분야 메가 패널 ---- */
  var allcatCols = MENU.map(function(m){
    return '<div class="ac-col"><a class="ac-h" href="'+u(m.href)+'">'+svg(m.icon)+'<span>'+m.label+'</span></a>'+
      m.items.map(function(it){ return '<a class="ac-i" href="'+u(it[0])+'">'+it[1]+'</a>'; }).join('')+'</div>';
  }).join('');

  var pillsHTML = PILLS.map(function(p){
    return '<a class="pill-link" data-folder="'+p[2]+'" href="'+u(p[0])+'">'+p[1]+'</a>';
  }).join('');

  var headerHTML =
  '<header class="site-header"><div class="wrap vbar">'+
    '<div class="vbar-l">'+
      '<a class="brand" href="'+u('index.html')+'"><span class="dot"></span>PRCOME</a>'+
      '<div class="allcat">'+
        '<button class="allcat-btn" aria-haspopup="true">'+svg('grid')+'<span>전체 분야</span>'+CHEV+'</button>'+
        '<div class="allcat-panel"><div class="ac-grid">'+allcatCols+'</div></div>'+
      '</div>'+
    '</div>'+
    '<nav class="pillnav" aria-label="주요 메뉴">'+pillsHTML+'</nav>'+
    '<div class="vbar-r">'+
      '<a class="btn btn-signal btn-write" href="'+u('community/write.html')+'">'+svg('pen','mi')+'<span>글쓰기</span></a>'+
      '<button class="icon-btn" id="hSearch" aria-label="검색 열기">'+svg('search','mi')+'</button>'+
      '<a class="btn btn-text login-link" href="'+u('auth/login.html')+'">로그인</a>'+
      '<button class="hamburger" id="mNavBtn" aria-label="메뉴 열기"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>'+
    '</div>'+
  '</div>'+
  '<div class="hsearch" id="hSearchPanel"><div class="wrap"><form class="hsearch-form" action="'+u('directory/index.html')+'" method="get">'+
    svg('search','si')+'<input name="q" placeholder="인사이트, 언론사, PR회사, 실무정보를 검색하세요" aria-label="통합검색"><button class="btn btn-signal" type="submit">검색</button>'+
  '</form></div></div>'+
  '</header>';

  /* ---- 모바일 드로어(아코디언) ---- */
  var accHTML = MENU.map(function(m){
    var sub = '<a class="m-sub" href="'+u(m.href)+'">'+m.label+' 전체</a>'+
      m.items.map(function(it){ return '<a class="m-sub" href="'+u(it[0])+'">'+it[1]+'</a>'; }).join('');
    return '<div class="m-acc"><button class="m-acc-hd" type="button">'+svg(m.icon)+'<span>'+m.label+'</span>'+CHEV+'</button><div class="m-acc-body">'+sub+'</div></div>';
  }).join('');

  var drawerHTML =
  '<div class="m-drawer" id="mDrawer"><div class="backdrop" data-close></div><div class="m-panel">'+
    '<div class="m-top"><a class="brand" href="'+u('index.html')+'"><span class="dot"></span>PRCOME</a><button class="m-close" data-close aria-label="닫기">×</button></div>'+
    '<form class="field" action="'+u('directory/index.html')+'" method="get" style="margin:8px 0 10px">'+svg('search','si')+'<input name="q" placeholder="통합검색"></form>'+
    accHTML +
    '<div class="flex gap-8" style="padding-top:14px"><a class="btn btn-ghost" style="flex:1" href="'+u('auth/login.html')+'">로그인</a><a class="btn btn-signal" style="flex:1" href="'+u('auth/signup.html')+'">회원가입</a></div>'+
  '</div></div>';

  /* ---- 푸터 ---- */
  var footerHTML =
  '<footer class="site-footer"><div class="wrap">'+
    '<div class="footer-top">'+
      '<div class="footer-brand"><a class="brand" href="'+u('index.html')+'"><span class="dot"></span>PRCOME</a>'+
        '<p>PR·마케팅 정보가 모이고 연결되어 언론·검색·AI로 확산되는 디지털 PR 플랫폼. 홍보담당자, 언론인, 대행사, 마케터를 하나로 잇습니다.</p></div>'+
      '<div class="footer-col"><h4>서비스</h4>'+
        '<a href="'+u('community/index.html')+'">커뮤니티</a><a href="'+u('tools/press-release.html')+'">보도자료 작성 AI</a>'+
        '<a href="'+u('tools/distribute.html')+'">보도자료 배포 AI</a><a href="'+u('tools/visibility.html')+'">AI 가시성 진단</a></div>'+
      '<div class="footer-col"><h4>탐색</h4>'+
        '<a href="'+u('insights/index.html')+'">인사이트</a><a href="'+u('directory/media.html')+'">언론사 리스트</a>'+
        '<a href="'+u('projects/index.html')+'">프로젝트</a><a href="'+u('career/index.html')+'">구인구직</a></div>'+
      '<div class="footer-col"><h4>회사</h4>'+
        '<a href="'+u('notice/index.html')+'">공지사항</a><a href="'+u('help/guide.html')+'">이용안내</a>'+
        '<a href="'+u('help/contact.html')+'">광고·제휴 문의</a><a href="'+u('auth/signup.html')+'">회원가입</a></div>'+
    '</div>'+
    '<div class="footer-bottom"><div>© 2026 PRCOME(피알컴) · www.prcome.com — 본 사이트는 1차 데모 가안이며 일부 기능은 준비 중입니다.</div>'+
      '<div style="display:flex;gap:16px"><a href="'+u('legal/terms.html')+'">이용약관</a><a href="'+u('legal/privacy.html')+'">개인정보처리방침</a></div></div>'+
  '</div></footer>';

  function mount(){
    var h=document.getElementById('site-header'), f=document.getElementById('site-footer');
    if(h) h.outerHTML = headerHTML + drawerHTML;
    if(f) f.outerHTML = footerHTML;

    var btn=document.getElementById('mNavBtn'), drawer=document.getElementById('mDrawer');
    if(btn && drawer){
      btn.addEventListener('click',function(){ drawer.classList.add('open'); document.body.style.overflow='hidden'; });
      drawer.addEventListener('click',function(e){ if(e.target.hasAttribute('data-close')){ drawer.classList.remove('open'); document.body.style.overflow=''; } });
      drawer.querySelectorAll('.m-acc-hd').forEach(function(hd){ hd.addEventListener('click',function(){ hd.parentNode.classList.toggle('open'); }); });
    }
    /* 검색 토글 */
    var st=document.getElementById('hSearch'), sp=document.getElementById('hSearchPanel');
    if(st && sp){ st.addEventListener('click',function(){ sp.classList.toggle('open'); var i=sp.querySelector('input'); if(sp.classList.contains('open')&&i) i.focus(); }); }

    /* 활성 표시 */
    var path=location.pathname;
    document.querySelectorAll('.pill-link').forEach(function(a){
      var fdr=a.getAttribute('data-folder');
      if(fdr && path.indexOf('/'+fdr+'/')>-1) a.classList.add('active');
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mount); else mount();
})();
