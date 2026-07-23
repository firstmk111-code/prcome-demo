/* =========================================================
   PRCOME — 공통 헤더/푸터 (전 페이지 공통)
   정체성: 언론홍보 실무자 커뮤니티 + 전문 매거진 (PR 70 : 마케팅 30)
   메뉴 우선순위: 커뮤니티 · 인사이트 · PR회사 · 언론사 · 구인구직 · 홍보대행 의뢰 · 도서·교육 · 더보기
   window.MAG = { root:'../', home:(root+'index.html'), catBase:(root+'insights/index.html') }
   #mag-header / #mag-footer 자리표시자에 주입. 현재 위치는 파란 밑줄로 표시.
   ========================================================= */
(function(){
  var C = window.MAG || {};
  var root = (typeof C.root==='string') ? C.root : '';
  var home = C.home || (root+'index.html');
  function u(p){ return (p.charAt(0)==='#'||/^https?:/.test(p)) ? p : root + p; }
  function ext(p){ return /^https?:/.test(p) ? ' target="_blank" rel="noopener"' : ''; }

  /* 구분용 라인 아이콘(currentColor) */
  var IC={
    home:'<svg viewBox="0 0 24 24"><path d="M4 11.5L12 4l8 7.5"/><path d="M6 10v9a1 1 0 001 1h10a1 1 0 001-1v-9"/></svg>',
    comm:'<svg viewBox="0 0 24 24"><path d="M21 11.5a8.4 8.4 0 01-11.6 7.7L3 21l1.8-6.4A8.5 8.5 0 1121 11.5z"/></svg>',
    insight:'<svg viewBox="0 0 24 24"><path d="M12 6C10 4.6 6.7 4 4 4v14c2.7 0 6 .6 8 2 2-1.4 5.3-2 8-2V4c-2.7 0-6 .6-8 2z"/><path d="M12 6v14"/></svg>',
    agency:'<svg viewBox="0 0 24 24"><path d="M5 21V5a1 1 0 011-1h8a1 1 0 011 1v16"/><path d="M15 10h3a1 1 0 011 1v10"/><path d="M8.5 8h3M8.5 12h3M8.5 16h3M3 21h18"/></svg>',
    media:'<svg viewBox="0 0 24 24"><path d="M4 5h13a1 1 0 011 1v12a2 2 0 002-2V8"/><path d="M4 5a1 1 0 00-1 1v12a2 2 0 002 2h13"/><path d="M7 9h7M7 13h7M7 17h4"/></svg>',
    career:'<svg viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5.5A1.5 1.5 0 019.5 4h5A1.5 1.5 0 0116 5.5V7M3 12h18"/></svg>',
    project:'<svg viewBox="0 0 24 24"><path d="M4 11v2a1 1 0 001 1h2l4 4V6L7 10H5a1 1 0 00-1 1z"/><path d="M15 8a4 4 0 010 8"/></svg>',
    books:'<svg viewBox="0 0 24 24"><path d="M3 8.5L12 4l9 4.5-9 4.5-9-4.5z"/><path d="M7 11v4.5c0 1.1 2.2 2 5 2s5-.9 5-2V11"/></svg>',
    more:'<svg viewBox="0 0 24 24"><circle cx="5.5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="18.5" cy="12" r="1.6"/></svg>',
    ai:'<svg viewBox="0 0 24 24"><path d="M12 3l1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7z"/><path d="M18.5 14l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z"/></svg>',
    bell:'<svg viewBox="0 0 24 24"><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 01-3.4 0"/></svg>'
  };
  /* 대분류 · act=현재위치 활성 판별 substring들 · items 없으면 단일 링크 · ic=구분 아이콘 */
  var NAV = [
    { label:'홈', href:'index.html', ic:IC.home, home:true },
    { label:'커뮤니티', href:'community/index.html', ic:IC.comm, act:['/community/'], cols:1, items:[
      ['community/index.html?cat=free','자유게시판'],['community/index.html?cat=qa','질문과 답변'],
      ['community/index.html?cat=knowhow','홍보 노하우'],['events/index.html','행사·세미나'],
      ['community/index.html?cat=agency','파트너 모집'] ]},
    { label:'인사이트', href:'insights/index.html', ic:IC.insight, act:['/insights/'], cols:1, items:[
      ['insights/index.html?cat=pr','PR 가이드'],['insights/index.html','PR 뉴스'],
      ['insights/index.html?cat=media','인터뷰'],['insights/index.html?cat=case','성공사례'],
      ['insights/index.html?cat=trend','트렌드 리포트'] ]},
    { label:'기업정보', href:'directory/agencies.html', ic:IC.agency, act:['/directory/'], cols:1, items:[
      ['directory/media.html','언론사'],
      ['directory/agencies.html','PR기업'] ]},
    { label:'구인구직', href:'career/index.html', ic:IC.career, act:['/career/'], cols:1, items:[
      ['career/index.html','채용공고'],['career/index.html?post=1','구직 등록'],
      ['career/index.html?type=freelance','프리랜서'],['career/index.html?type=talent','인재 찾기'] ]},
    { label:'홍보대행 의뢰', href:'projects/index.html', ic:IC.project, act:['/projects/','/tools/distribute'], cols:1, items:[
      ['tools/distribute.html','보도자료 배포'],['projects/index.html','애드버토리얼'],
      ['projects/new.html','PR 컨설팅'],['projects/index.html','콘텐츠 제작'],
      ['projects/new.html','홍보대행 의뢰하기'] ]},
    { label:'PR도구', href:'tools/index.html', ic:IC.ai, act:['/tools/'], cols:1, items:[
      ['tools/press-release.html','AI 보도자료 자동화'],['tools/media-send.html','언론사 송출'],
      ['tools/pr-diagnosis.html','AI 노출등급 진단'],
      ['https://firstmk111-code.github.io/messeze-mvp/','AI 기자추천·피치메일'],
      ['https://firstmk111-code.github.io/messeze-mvp/','AI SEO·AEO·GEO 분석'] ]},
    { label:'도서·교육', href:'resources/books.html', ic:IC.books, act:['/resources/','/events/'], cols:1, items:[
      ['resources/books.html','PR 도서'],['resources/books.html','마케팅 도서'],
      ['events/index.html','온라인 교육'],['events/index.html','오프라인 교육'],
      ['events/index.html','교육기관'] ]},
    { label:'더보기', href:'more/index.html', ic:IC.more, act:['/more/','/help/','/notice/','/legal/','/directory/index'], cols:1, items:[
      ['directory/index.html?type=expert','전문가'],['notice/index.html','공지사항'],
      ['more/index.html?tab=faq','FAQ'],['help/contact.html','문의하기'],
      ['help/guide.html','PRCOME 소개'] ]},
  ];

  function navActive(n){
    var p=location.pathname;
    if(n.home){ return /\/(index\.html)?$/.test(p) && ['/community/','/insights/','/directory/','/career/','/projects/','/resources/','/events/','/tools/','/more/','/notice/','/help/','/legal/','/experience/','/shop/','/auth/'].every(function(s){return p.indexOf(s)<0;}); }
    return (n.act||[]).some(function(s){return p.indexOf(s)>-1;});
  }
  var CHEV='<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
  var searchSvg='<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4" stroke-linecap="round"/></svg>';

  var navHtml = NAV.map(function(n){
    var has = !!n.items;
    var mega = has ? ('<div class="mega'+(n.cols===3?' c3':'')+'"><div class="mega-grid">'+
      n.items.map(function(it){ return '<a href="'+u(it[0])+'"'+ext(it[0])+'>'+it[1]+'</a>'; }).join('')+'</div></div>') : '';
    return '<div class="nav-item'+(has?' has-mega':'')+'">'+
      '<a class="nav-link'+(navActive(n)?' on':'')+'" href="'+u(n.href)+'"'+(has?' aria-haspopup="true"':'')+'>'+
        (n.ic?'<span class="nic">'+n.ic+'</span>':'')+n.label+(has?CHEV:'')+'</a>'+mega+'</div>';
  }).join('');

  var accHtml = NAV.map(function(n){
    var lead=(n.ic?'<span class="nic">'+n.ic+'</span>':'');
    if(!n.items) return '<a class="m-link" href="'+u(n.href)+'">'+lead+n.label+'</a>';
    return '<div class="m-acc"><button class="m-acc-hd" type="button">'+lead+n.label+CHEV+'</button>'+
      '<div class="m-acc-body"><a href="'+u(n.href)+'">'+n.label+' 전체</a>'+
      n.items.map(function(it){ return '<a href="'+u(it[0])+'"'+ext(it[0])+'>'+it[1]+'</a>'; }).join('')+'</div></div>';
  }).join('');

  var header =
  '<header class="hd">'+
    '<div class="r1">'+
      '<a class="brand" href="'+home+'" aria-label="PRCOME 홈"><span class="mk"></span>PRCOME</a>'+
      '<form class="hsearch" action="'+u('community/index.html')+'" method="get" role="search">'+
        searchSvg+'<input name="q" placeholder="커뮤니티 글·매거진 콘텐츠 검색" aria-label="통합검색"></form>'+
      '<div class="r1-r">'+
        '<a class="tip" href="'+u('insights/index.html')+'">매거진</a>'+
        '<a class="write" href="'+u('community/write.html')+'">글쓰기</a>'+
        '<a class="login" href="'+u('auth/login.html')+'">로그인</a>'+
      '</div>'+
      '<button class="mbtn" id="magMbtn" aria-label="메뉴 열기" aria-expanded="false"><svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16" stroke-linecap="round"/></svg></button>'+
    '</div>'+
    '<div class="r2"><div class="in"><nav class="topnav" aria-label="주요 메뉴">'+navHtml+'</nav></div></div>'+
    '<div class="mpanel" id="magMpanel"><div class="in">'+accHtml+
      '<div class="m-acc-flat"><a href="'+u('insights/index.html')+'">매거진</a><a href="'+u('community/write.html')+'">글쓰기</a><a href="'+u('auth/login.html')+'">로그인</a></div>'+
    '</div></div>'+
  '</header>';

  var footer =
  '<footer class="ft"><div class="in">'+
    '<span class="l">© 2026 PRCOME(피알컴) · www.prcome.com — 언론홍보 실무자 커뮤니티 · 전문 매거진(1차 가안)</span>'+
    '<span class="r"><a href="'+u('notice/index.html')+'">공지사항</a><a href="'+u('help/guide.html')+'">이용안내</a>'+
    '<a href="'+u('legal/terms.html')+'">이용약관</a><a href="'+u('legal/privacy.html')+'">개인정보처리방침</a></span>'+
  '</div></footer>';

  /* =====================================================
     SEO / AEO / GEO — 사이트 공통 구조화 데이터 자동 주입
     - 모든 페이지: canonical · OpenGraph · Twitter · Organization · WebSite · BreadcrumbList(.crumb 자동 파싱)
     - window.SEO 설정 시: FAQPage / Article 스키마 + #faqList 아코디언 자동 렌더
     ===================================================== */
  function injectSEO(){
    var head=document.head, loc=location, url=loc.origin+loc.pathname, origin=loc.origin;
    function metaC(n){var m=document.querySelector('meta[name="'+n+'"]');return m?m.getAttribute('content'):'';}
    var title=document.title||'PRCOME';
    var desc=metaC('description')||'언론홍보(PR) 실무자 커뮤니티이자 전문 매거진 — PRCOME(피알컴).';
    function esc(v){return String(v).replace(/"/g,'&quot;');}
    function add(html){head.insertAdjacentHTML('beforeend',html);}
    function mp(prop,val,attr){if(!val)return;add('<meta '+(attr||'property')+'="'+prop+'" content="'+esc(val)+'">');}
    function ld(obj){var s=document.createElement('script');s.type='application/ld+json';s.textContent=JSON.stringify(obj);head.appendChild(s);}
    if(!document.querySelector('link[rel="canonical"]')) add('<link rel="canonical" href="'+esc(url)+'">');
    mp('og:type',(window.SEO&&window.SEO.ogType)||'website');mp('og:site_name','PRCOME');mp('og:title',title);
    mp('og:description',desc);mp('og:url',url);mp('og:locale','ko_KR');
    mp('twitter:card','summary_large_image','name');mp('twitter:title',title,'name');mp('twitter:description',desc,'name');
    if(!window.__prcomeOrg){window.__prcomeOrg=1;
      ld({"@context":"https://schema.org","@type":"Organization","name":"PRCOME","alternateName":"피알컴","url":origin+"/","description":"언론홍보(PR) 실무자 커뮤니티이자 전문 매거진 플랫폼","knowsAbout":["PR","언론홍보","보도자료","미디어 커뮤니케이션","위기관리","브랜드 저널리즘","AEO","GEO"]});
      ld({"@context":"https://schema.org","@type":"WebSite","name":"PRCOME","url":origin+"/","inLanguage":"ko","potentialAction":{"@type":"SearchAction","target":origin+"/community/index.html?q={search_term_string}","query-input":"required name=search_term_string"}});
    }
    var crumb=document.querySelector('.crumb');
    if(crumb){var parts=[];
      Array.prototype.forEach.call(crumb.childNodes,function(n){
        if(n.nodeType===1&&n.tagName==='A'){var href=n.getAttribute('href')||'';parts.push({name:n.textContent.trim(),item:href?new URL(href,url).href:''});}
        else if(n.nodeType===3){var t=n.textContent.replace(/\//g,'').trim();if(t)parts.push({name:t});}
      });
      parts=parts.filter(function(p){return p.name;});
      if(parts.length>1) ld({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":parts.map(function(p,i){var e={"@type":"ListItem","position":i+1,"name":p.name};if(p.item)e.item=p.item;return e;})});
    }
    var S=window.SEO||{};
    if(S.faq&&S.faq.length){
      ld({"@context":"https://schema.org","@type":"FAQPage","mainEntity":S.faq.map(function(f){return {"@type":"Question","name":f.q,"acceptedAnswer":{"@type":"Answer","text":String(f.a).replace(/<[^>]+>/g,'')}};})});
      var box=document.getElementById('faqList');
      if(box) box.innerHTML=S.faq.map(function(f){return '<details class="faq-item"><summary>'+f.q+'</summary><div class="faq-a">'+f.a+'</div></details>';}).join('');
    }
    if(S.article){var a=S.article,art={"@context":"https://schema.org","@type":"Article","headline":title,"description":desc,"inLanguage":"ko","author":{"@type":"Organization","name":"PRCOME"},"publisher":{"@type":"Organization","name":"PRCOME","url":origin+"/"},"mainEntityOfPage":url};for(var k in a){if(a.hasOwnProperty(k))art[k]=a[k];}ld(art);}
  }

  function mount(){
    var h=document.getElementById('mag-header'), f=document.getElementById('mag-footer');
    if(h) h.outerHTML=header;
    if(f) f.outerHTML=footer;
    var b=document.getElementById('magMbtn'), p=document.getElementById('magMpanel');
    if(b&&p){ b.addEventListener('click',function(){ var o=p.classList.toggle('open'); b.setAttribute('aria-expanded',o?'true':'false'); }); }
    document.querySelectorAll('#magMpanel .m-acc-hd').forEach(function(hd){ hd.addEventListener('click',function(){ hd.parentNode.classList.toggle('open'); }); });
    try{ injectSEO(); }catch(e){}
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mount); else mount();
})();
