/* =========================================================
   PR Agent Core — 기업분석 · 뉴스가치 채점 로직
   (원본 데모 tools/pr-agent/index.html 에서 추출·재사용)
   입력 DOM id: f_name, f_ind, f_topic, f_about, f_case, f_kw
   핵심 API: buildIdeas() -> IDEAS[], CTX(전역), analyzeCompany()
   ========================================================= */
var SIGDEFS=[
 {key:'eco',label:'친환경·ESG',tag:'esg',re:/친환경|재활용|탄소|에코|그린|ESG|저감|지속가능|폐기물|순환/},
 {key:'public',label:'공공·조달',tag:'public',re:/공공|지자체|정부|조달|국토부|관공서|행정|공기업|관급|지방자치|광역시|사무소|시청|도청|MOU/},
 {key:'safety',label:'안전·공익',tag:'public',re:/안전|보행|시인성|교통|재난|방재|보안|사고예방/},
 {key:'export',label:'수출·해외',tag:'market',re:/수출|해외|글로벌|바이어|무역|진출|해외시장/},
 {key:'cert',label:'인증·특허',tag:'evidence',re:/인증|특허|수상|신기술|혁신제품|GS인증|KS|등록|실증/},
 {key:'numbers',label:'정량 성과',tag:'evidence',re:/[0-9]+\s*(%|％|억|만|개|건|배|위|명|톤|kg|퍼센트)/},
 {key:'tech',label:'기술·R&D',tag:'technology',re:/기술|개발|스마트|태양광|IoT|AI|솔루션|플랫폼|자동화|R&D|특허|소재/},
 {key:'market',label:'시장 확대',tag:'market',re:/시장|확대|점유|성장|매출|진입|공략|수요/}
];
var CTX={};
function _val(id){return ((document.getElementById(id)||{}).value||'').trim();}
function _splitList(s){return String(s||'').split(/[,\n·]/).map(function(t){return t.trim();}).filter(Boolean);}
/* ===== 기업 유형 분석 (기사 작성 전에 '역할'을 먼저 이해) =====
   순서=우선순위. re가 blob(기업명·업종·주요정보·성과·키워드)에 걸리는 첫 유형 채택.
   각 유형은 기사 문체(leadAct/valueFrame/focus)와 유형별 보완자료(mats)를 갖는다. */
var BIZ_TYPES=[
 {type:'hospital', label:'의료기관', cat:'의료·헬스케어', re:/병원|의원|클리닉|의료법인|한의원|치과|메디컬|요양|헬스케어|재활센터/,
  customer:'환자·내원 고객', role:'의료 서비스를 제공하는 의료기관', focus:'의료 성과',
  leadAct:'의료 서비스 성과를 공개했다', act:'건강을 관리하고 있다',
  valueFrame:'이번 사례는 지역 주민의 의료 접근성을 높이는 사례다',
  svc:['진료','검진','수술','재활'],
  mats:['진료·수술 실적 데이터','환자 만족도·치료 성과 자료','의료진 프로필·전문 분야','장비·시설 사진','원장 인터뷰','환자 사례(동의 후)','인증·학회 발표 자료']},
 {type:'education', label:'교육기관', cat:'교육·서비스업', re:/학원|아카데미|에듀|스쿨|평생교육|연수원|훈련기관|교습소|교육원|직업전문학교|교육기관/,
  customer:'수강생·학부모', role:'교육 프로그램을 운영하는 교육기관', focus:'교육 프로그램',
  leadAct:'교육 프로그램 운영 성과를 공개했다', act:'역량 강화를 돕고 있다',
  valueFrame:'이번 프로그램은 수강생의 역량 강화와 취업으로 이어지는 사례다',
  svc:['교육과정','직업훈련','자격취득 지원'],
  mats:['수료·취업 실적 데이터','수강생 후기·성과 사례','커리큘럼·강사 프로필','수업·실습 현장 사진','원장 인터뷰','자격 취득 통계','기관 인증 자료']},
 {type:'agency', label:'홍보·마케팅 전문기업', cat:'서비스업', re:/홍보|마케팅|대행|에이전시|광고\s*대행|브랜딩|퍼블리시티|바우처|수행기관|해외마케팅|브랜드\s*컨설팅|커뮤니케이션|컨설팅/,
  customer:'정부지원사업 참여기업·중소기업', role:'중소기업의 마케팅·해외 진출을 지원하는 전문 홍보기업', focus:'지원사업 성과',
  leadAct:'중소기업 해외 진출 지원 성과를 공개했다', act:'판로 개척을 지원하고 있다',
  valueFrame:'이번 사업은 정부지원사업을 기반으로 중소기업의 해외 진출을 지원하는 사례다',
  svc:['수출바우처','혁신바우처','언론홍보','해외마케팅','브랜드 컨설팅'],
  mats:['수행한 정부지원사업 사례','고객사 성공 사례','해외 바이어 상담 사진','프로젝트 수행 이미지','대표 인터뷰','언론보도 사례','수출지원 실적 데이터']},
 {type:'startup', label:'스타트업', cat:'기술 기반 서비스업', re:/스타트업|창업|벤처|시드\s*투자|시리즈\s*[A-C]|투자유치|액셀러레이터|스케일업/,
  customer:'서비스 이용자·투자자', role:'기술 기반 서비스를 제공하는 스타트업', focus:'기술·성장',
  leadAct:'서비스 성장 성과를 공개했다', act:'서비스를 확대하고 있다',
  valueFrame:'이번 성과는 기술 기반 서비스의 시장 확대를 보여주는 사례다',
  svc:['플랫폼 운영','기술 개발','서비스 고도화'],
  mats:['이용자·거래액 성장 지표','투자 유치·파트너십 현황','핵심 기술·특허 자료','서비스 화면·데모','대표 인터뷰','언론보도 사례','성장 로드맵 자료']},
 {type:'public', label:'공공·지원기관', cat:'공공기관', re:/진흥원|공사|재단|협회|지원단|사업단|위원회|테크노파크|창조경제혁신센터/,
  customer:'지역기업·주민', role:'지역·산업을 지원하는 공공기관', focus:'지원사업 성과',
  leadAct:'지원사업 성과를 공개했다', act:'성장을 지원하고 있다',
  valueFrame:'이번 사업은 지역 기업의 성장을 지원하는 사례다',
  svc:['지원사업','정책 운영','기업 지원'],
  mats:['지원사업 참여기업·성과 데이터','수혜기업 사례','현장·행사 사진','기관장 코멘트','예산·집행 실적','협약(MOU) 자료','언론보도 사례']},
 {type:'manufacturer', label:'제조기업', cat:'제조업', re:/제조|생산|공장|납품|OEM|ODM|부품|소재|장비|섬유|침장|직물|식품|화장품|기계|전자|가공|협동조합|공업|제품/,
  customer:'국내외 거래처·소비자', role:'제품을 생산·공급하는 제조기업', focus:'제품·수출',
  leadAct:'판로 확대에 나섰다', act:'판로를 넓히고 있다',
  valueFrame:'이번 사업은 제품 판로를 확대하는 사례다',
  svc:['제품 생산','품질관리','수출'],
  mats:['제품·생산 현장 사진','품질·인증 자료','거래처·납품 실적','수출 상담·계약 현황','대표 코멘트','매출·성장 데이터','전시·박람회 사진']},
 {type:'service', label:'서비스기업', cat:'서비스업', re:/서비스|운영|플랫폼|솔루션|용역|유통|물류|임대|중개/,
  customer:'고객사·이용자', role:'전문 서비스를 제공하는 기업', focus:'사업 성과',
  leadAct:'사업 성과를 공개했다', act:'성장을 지원하고 있다',
  valueFrame:'이번 성과는 서비스 경쟁력을 보여주는 사례다',
  svc:['전문 서비스','운영','컨설팅'],
  mats:['서비스 이용·계약 실적','고객사 성공 사례','운영 현장 사진','대표 인터뷰','성장 지표','파트너십 현황','언론보도 사례']}
];
function analyzeCompany(){
 var name=(CTX&&CTX.company)||_val('f_name')||'해당 기업', ind=(CTX&&CTX.industry)||_val('f_ind');
 var kws=(CTX&&CTX.keywords)||_kwArr();
 var blob=[name,ind,(CTX&&CTX.topic)||_val('f_topic'),_val('f_about'),_val('f_case'),kws.join(' ')].join('  ');
 var picked=null;
 for(var i=0;i<BIZ_TYPES.length;i++){ if(BIZ_TYPES[i].re.test(blob)){picked=BIZ_TYPES[i];break;} }
 if(!picked)picked=BIZ_TYPES[BIZ_TYPES.length-1];
 /* 핵심 서비스 = 유형 기본 서비스 먼저, 그 뒤 사용자 키워드(숫자·일반어 제외) 보강 */
 var svc=picked.svc.slice(), STOP=/^(성과|사례|추진|개최|진행|판로|해외|국내|기업|사업|소식)$/;
 kws.forEach(function(k){k=String(k||'').trim();if(k&&!/^[0-9]/.test(k)&&!STOP.test(k)&&svc.indexOf(k)<0&&svc.length<7)svc.push(k);});
 return {type:picked.type,typeLabel:picked.label,cat:picked.cat,customer:picked.customer,role:picked.role,angle:picked.role,
  services:svc.slice(0,6),focus:picked.focus,leadAct:picked.leadAct,act:picked.act,valueFrame:picked.valueFrame,mats:picked.mats.slice()};
}
function buildContext(){
 var name=_val('f_name')||'해당 기업',industry=_val('f_ind'),topic=_val('f_topic')||(name+' 신규 소식'),about=_val('f_about'),caseTxt=_val('f_case'),keywords=_kwArr();
 var blob=[name,industry,topic,about,caseTxt,keywords.join(' ')].join('  ');
 var signals={},buckets={esg:[],public:[],market:[],technology:[],evidence:[]};
 SIGDEFS.forEach(function(d){var m=blob.match(d.re);signals[d.key]=!!m;if(m&&buckets[d.tag].indexOf(d.label)<0)buckets[d.tag].push(d.label);});
 CTX={company:name,industry:industry,product:_extractProduct(topic,keywords),topic:topic,keywords:keywords,achievement:_splitList(caseTxt),market:buckets.market,technology:buckets.technology,esg:buckets.esg,public:buckets.public,evidence:buckets.evidence,signals:signals};
 CTX.biz=analyzeCompany();
 return CTX;
}
/* 한글 조사 */
function _hasJong(s){if(!s)return false;var c=s.charCodeAt(s.length-1);if(c<0xAC00||c>0xD7A3)return false;return (c-0xAC00)%28!==0;}
function _josa(s,a,b){return s+(_hasJong(s)?a:b);}
function _eun(s){return _josa(s,'은','는');}
function _eul(s){return _josa(s,'을','를');}
function _euro(s){if(!s)return s;var c=s.charCodeAt(s.length-1);if(c<0xAC00||c>0xD7A3)return s+'로';var j=(c-0xAC00)%28;return s+((j===0||j===8)?'로':'으로');}
function _short(s,n){s=String(s||'').replace(/\s+/g,' ').trim();return s.length>n?s.slice(0,n)+'…':s;}
function _firstSent(s){s=String(s||'').replace(/\n+/g,' ').replace(/\s+/g,' ').trim();var idx=s.search(/[.。]/);if(idx>3&&idx<70)return s.slice(0,idx+1);return _short(s,80);}
function _kwArr(){return String((document.getElementById('f_kw')||{}).value||'').split(/[,\n]/).map(function(t){return t.trim();}).filter(Boolean);}
function _firstTok(s){return String(s||'').split(/[,\n]/)[0].trim();}
function _extractProduct(topic,kw){var m=String(topic||'').match(/[‘'"“]([^’'"”]{1,24})[’'"”]/);if(m)return m[1];return (kw&&kw[0])||_short(topic,12)||'신제품';}

var STRATEGY={};
function buildStrategy(){
 var s=CTX.signals,angles=[];
 if(s.public)angles.push('공공조달');if(s.eco)angles.push('ESG·친환경');if(s.export)angles.push('수출');if(s.numbers||s.market)angles.push('지역경제');if(s.tech)angles.push('기술혁신');
 if(!angles.length)angles=['기업 사례'];
 var order=[];if(s.public||s.market)order.push('지역경제 기사');order.push('산업 기사');if(s.public)order.push('공공기관 사례');if(s.eco)order.push('ESG·친환경 기사');order.push('SNS·블로그');order.push('뉴스룸 등록');
 var strong=[s.public,s.eco,s.export,s.numbers,s.tech,s.cert].filter(Boolean).length;
 STRATEGY={stars:Math.max(2,Math.min(5,strong)),order:order.slice(0,5),potential:Math.min(92,58+strong*6),reason:'이번 소재는 '+angles.slice(0,3).join(' + ')+' 방향이 가장 유리합니다.'};
}
function renderStrategy(){var st=STRATEGY,stars='';for(var i=1;i<=5;i++)stars+=(i<=st.stars?'★':'<span class="off">★</span>');document.getElementById('stratStars').innerHTML=stars;document.getElementById('stratPotential').innerHTML=st.potential+'%<small> 예상</small>';document.getElementById('stratReason').textContent=st.reason;document.getElementById('stratOrder').innerHTML=st.order.map(function(o,i){return '<div class="of"><span class="on">'+(i+1)+'</span>'+esc(o)+'</div>';}).join('');}

var IDEAS=[];
function _baseFrom(keys){var c=0;keys.forEach(function(k){if(CTX.signals[k])c++;});return Math.max(40,Math.min(76,46+c*8));}
function _rationale(keys){var out=[],L={eco:'친환경·ESG 요소 존재',public:'공공기관·조달 시장',safety:'공공 안전 이슈',export:'수출·해외 시장 확대',cert:'인증·특허 등 증빙 보유',numbers:'정량 성과 수치 존재',tech:'기술 차별성 보유',market:'시장 확대 가능성'};keys.forEach(function(k){if(CTX.signals[k])out.push(L[k]);});if(out.length<2)out.push('입력 키워드와 기사화 사례 유사성');return out;}
function _findKw(re,fb){var kw=CTX.keywords;for(var i=0;i<kw.length;i++){if(re.test(kw[i]))return kw[i];}var m=(CTX.topic+' '+_val('f_about')+' '+_val('f_case')).match(re);return m?m[0]:(fb||'');}
function buildIdeas(){
 buildContext();
 var name=CTX.company,kw=CTX.keywords,kw0=kw[0]||'',kjoin=kw.slice(0,3).join('·')||kw0,product=CTX.product,topic=CTX.topic;
 var indTokens=String(CTX.industry).split(/[,\n]/).map(function(s){return s.trim();}).filter(Boolean);
 var indField='';for(var ii=0;ii<indTokens.length;ii++){if(/산업/.test(indTokens[ii])){indField=indTokens[ii];break;}}if(!indField)indField=indTokens[indTokens.length-1]||'산업';
 var indCore=indField.replace(/산업$/,'')||kw0||'산업';
 var aboutS=_firstSent(_val('f_about'))||(name+'의 활동'),caseS=_firstSent(_val('f_case'))||'최근 성과';
 var region=_findKw(/베트남|해외|글로벌|미국|중국|일본|유럽|아세안|인도|동남아/, CTX.signals.export?'해외':'');
 var venueRaw=_findKw(/[가-힣A-Za-z]*마트|[가-힣]+유통|[가-힣]+플랫폼|바이어|[가-힣]+몰/,'');
 var venue=venueRaw||'유통망';
 var event=_findKw(/[가-힣A-Za-z]*상담회|[가-힣]*박람회|[가-힣]*전시회|[가-힣]*미팅/,'');
 var pubOrg=(((_val('f_about')+' '+_val('f_case')).match(/[가-힣]+(?:광역시|특별시|시|도|군|구)\s?[가-힣]*사무소/)||[''])[0])||((_val('f_about').match(/[가-힣]{2,}(?:시청|도청|군청|구청)/)||[''])[0])||'지자체·공공기관';
 var ecoFlag=CTX.signals.eco,exportFlag=CTX.signals.export||region||venueRaw;
 var matsExport=['강남마트 등 현지 유통망 매장 사진','참가기업 제품 사진','상담회 현장 사진','참가기업 대표 코멘트','예상 상담 규모·목표 수출액'];
 /* 보완자료는 이전 State를 재사용하지 않고 '현재 기업 유형'에서 매번 새로 생성한다.
    실제 수출 행사(유통망+행사)가 있는 제조·공공기관일 때만 수출용 자료, 그 외엔 유형별 자료. */
 var biz=CTX.biz||analyzeCompany();
 var hasExportEvent=(venueRaw||event)&&(biz.type==='manufacturer'||biz.type==='public');
 var mats=hasExportEvent?matsExport:(biz.mats&&biz.mats.length?biz.mats.slice():['정량 성과·수치 자료','고객·참여기업 사례','대표자 코멘트','현장 사진','시장·수요 데이터']);
 IDEAS=_editorialMeeting(biz,mats,{name:name,indCore:indCore,region:region,venueRaw:venueRaw,event:event,pubOrg:pubOrg,product:product,topic:topic,caseS:caseS});
 return IDEAS;
}
/* ===== AI 기사 기획 회의 =====
   실제 기자처럼 "무엇이 뉴스인가"를 먼저 판단한다. 유형·시그널·사실에서 기사 후보 8개 각도를
   뉴스 가치(newsValue)로 채점 → 상위 5개를 뉴스가치 순으로 선정하고, 각 후보에 '왜 기사가 되는가'를 붙인다. */
function _editorialMeeting(biz,mats,X){
 var s=CTX.signals||{}, bf=_bizFacts();
 var name=X.name, indCore=X.indCore, region=X.region||bf.region, venueRaw=X.venueRaw, pubOrg=X.pubOrg, product=X.product||'신규 서비스';
 var firms=bf.firms, cases=bf.cases, amount=bf.amount||((_val('f_about')+_val('f_case')).match(/[0-9,]+\s*억\s*원?/)||[''])[0], people=bf.people;
 var t=biz.type;
 var caseTitle=(t==='hospital')?name+', 환자 치료 사례 공개':(t==='education')?name+', 수강생 성과 사례 공개':(t==='agency')?name+', 고객사 성공 사례 공개':name+', 참여기업 성공 사례 공개';
 /* 유형별 각도 적합도 */
 var FIT={
  agency:{gov:15,export:8,case:11,perf:9,cert:4,deal:6,product:3,market:5},
  public:{gov:15,export:8,case:9,perf:7,deal:8,cert:6,market:5,product:2},
  manufacturer:{export:15,deal:13,perf:9,cert:8,market:6,case:6,product:6,gov:4},
  hospital:{perf:15,cert:12,case:11,product:6,market:4,gov:3,deal:2,export:0},
  education:{perf:13,case:13,cert:10,product:6,market:4,gov:6,deal:2,export:2},
  startup:{market:13,perf:12,deal:11,product:11,export:6,case:6,cert:5,gov:4},
  service:{perf:11,case:11,deal:8,product:8,market:8,cert:6,export:6,gov:4}
 }[t]||{perf:10,case:10,deal:8,product:8,market:8,cert:6,export:6,gov:5};
 function sig(k){return s[k]?1:0;}
 var pool=[
  {key:'gov', title:name+', '+(firms?firms+' ':'')+'정부지원사업 수행 성과', base:60, fact:(firms?6:0)+sig('public')*8,
   fmt:'지원사업 성과 기사', mailType:'성과 제안형', crit:{news:12,diff:8,evi:8,int:12},
   why:['정부지원사업 수행은 공공성이 있어 지역·산업 매체가 다룬다','수혜기업 수·지원 실적 등 수치로 기사화가 쉽다','세금이 투입된 사업의 성과 = 공적 관심사']},
  {key:'export', title:name+', '+(region||'해외')+' 판로 개척'+(amount?' ('+amount+' 규모)':''), base:60, fact:(region||venueRaw?6:0)+sig('export')*8+sig('market')*3,
   fmt:'수출·판로 기사', mailType:'성과 제안형', crit:{news:11,diff:10,evi:7,int:11},
   why:['수출·해외 진출은 지역경제·산업 기사의 단골 소재다','유통망·거래 규모 수치로 구체성이 확보된다','지역 기업의 해외 성과 = 지역 매체 관심 높음']},
  {key:'deal', title:name+', '+(venueRaw||'주요 파트너')+' 협약·공급 계약', base:62, fact:(venueRaw?6:0)+(amount?6:0)+sig('export')*4,
   fmt:'계약·협약 기사', mailType:'속보 제안형', crit:{news:14,diff:9,evi:7,int:8},
   why:['계약·MOU 체결은 날짜가 있는 명확한 사건(뉴스 훅)이다','거래 규모가 크면 그 자체로 기사 가치가 있다','"언제·누구와" 가 분명해 데스크가 채택하기 쉽다']},
  {key:'cert', title:name+', 인증·선정 획득', base:57, fact:sig('cert')*11+((t==='hospital'||t==='education')?4:0),
   fmt:'인증·선정 기사', mailType:'성과 제안형', crit:{news:11,diff:11,evi:9,int:7},
   why:['공인 인증·정부 선정은 객관적 근거가 있어 신뢰도가 높다','업계 최초·유일이면 강력한 뉴스 훅이 된다','제3자 검증 성격이라 광고성 논란이 적다']},
  {key:'case', title:caseTitle, base:55, fact:(firms||cases?6:0)+sig('numbers')*4+((t==='agency'||t==='service')?4:0),
   fmt:'성공 사례 기획기사', mailType:'기획 제안형', crit:{news:9,diff:9,evi:11,int:9},
   why:['실제 성공 사례는 실증성이 높아 기획기사로 채택된다','고객·참여기업 수치로 규모를 제시할 수 있다','스토리가 있어 독자 몰입도가 높다']},
  {key:'perf', title:name+', '+(firms||cases||people||'주요')+' 성과 실적 공개', base:58, fact:(firms||cases||people?6:0)+sig('numbers')*8,
   fmt:'실적·성과 기사', mailType:'성과 제안형', crit:{news:10,diff:8,evi:11,int:9},
   why:['정량 실적은 기사 신뢰도의 핵심 근거다','전년 대비 증감으로 뉴스성을 부여할 수 있다','수치가 곧 헤드라인이 된다']},
  {key:'product', title:name+', 신규 '+product+' 선보여', base:52, fact:(product&&product!=='신규 사업'?5:0)+sig('tech')*5,
   fmt:'신규 출시 기사', mailType:'출시 제안형', crit:{news:11,diff:10,evi:6,int:8},
   why:['신규 출시는 "왜 지금"이 명확해 시의성이 있다','기존 대비 차별점이 있으면 기사화된다','이용자 반응·초기 성과를 붙이면 강해진다']},
  {key:'market', title:indCore+' 시장 변화 속 '+name+'의 대응', base:54, fact:sig('market')*6+sig('tech')*4+(t==='startup'?4:0),
   fmt:'산업 트렌드 기사', mailType:'기고 제안형', crit:{news:9,diff:11,evi:6,int:10},
   why:['산업 트렌드 기획기사에 사례로 편입될 수 있다','시장 데이터와 결합하면 기사 가치가 오른다','업계 관점을 제시하면 전문지가 선호한다']}
 ];
 pool.forEach(function(a){ a.news=Math.max(45,Math.min(95, a.base + (FIT[a.key]||0) + a.fact)); });
 pool.sort(function(a,b){return b.news-a.news;});
 var top=pool.slice(0,5);
 return top.map(function(a,idx){
  var news=a.news;
  var base=Math.max(48,Math.min(80, news-9)), max=Math.max(84,Math.min(99, news+6));
  var st=(news>=85)?{s:'기사성 높음',t:'ok'}:(news>=68)?{s:'기사성 보통',t:'info'}:{s:'기사성 낮음',t:'warn'};
  return {
   no:'후보 '+(idx+1), title:a.title, newsValue:news, why:a.why, angleKey:a.key,
   ex:a.why[0], points:a.why.slice(0,3), need:mats, way:a.fmt, status:st.s, stType:st.t,
   rationale:a.why.slice(0,3),
   diagnosis:{baseScore:base, maxScore:max, format:a.fmt, criteriaBase:a.crit, materials:mats,
    recommendation:['추천 형식: '+a.fmt,'추천 제목: '+a.title].concat(a.why.slice(0,2).map(function(w){return '뉴스 근거: '+w;}))},
   mailType:a.mailType,
   subject:'[보도자료] '+name+', '+_short(a.title.replace(name+', ',''),38),
   body:'안녕하세요, {name} 기자님.\n\n'+name+'입니다.\n\n'+a.why[0]+'\n\n'+_eul(X.topic||a.title)+' 중심으로 자료와 인터뷰를 제공드릴 수 있습니다.\n{tone}\n검토 부탁드립니다. 감사합니다.'
  };
 });
}

function _bizFacts(){
 var blob=_val('f_about')+' '+_val('f_case')+' '+(CTX.topic||'');
 function g(re){var m=blob.match(re);return m?m[0].replace(/\s+/g,' ').trim():'';} /* 내부 공백은 1칸 유지 */
 return {
  firms:g(/[0-9,]+\s*개\s*(?:중소기업|고객사|업체|기관|기업|사)/),
  cases:g(/[0-9,]+\s*건/),
  amount:g(/[0-9,]+\s*억\s*원?|[0-9,]+\s*만\s*원/),
  people:g(/[0-9,]+\s*명/),
  year:g(/(?:19|20)[0-9]{2}\s*년/),
  region:(blob.match(/베트남|해외|글로벌|미국|중국|일본|유럽|아세안|동남아|인도네시아/)||[''])[0],
  lead:g(/대표이사\s*[가-힣]{2,4}|대표\s*[가-힣]{2,4}|원장\s*[가-힣]{2,4}|이사장\s*[가-힣]{2,4}|회장\s*[가-힣]{2,4}|센터장\s*[가-힣]{2,4}/)
 };
}

/* ===== 2단계: 기자 DB 매칭 (원본 데모 재사용 · 이메일은 마스킹) ===== */
var selIdea=0,selRep=0,repShown=5,matchTotal=0,repChosen=false,REPS=[];
var FIELD_CAT=[{key:'it',label:'IT·과학'},{key:'전자',label:'IT·과학'},{key:'과학',label:'IT·과학'},{key:'경제',label:'경제·산업'},{key:'산업',label:'경제·산업'},{key:'유통',label:'경제·산업'},{key:'금융',label:'경제·산업'},{key:'기업',label:'경제·산업'},{key:'문화',label:'문화'},{key:'콘텐츠',label:'문화'},{key:'디자인',label:'문화'},{key:'연예',label:'연예'},{key:'방송',label:'연예'},{key:'지역',label:'지역'},{key:'사회',label:'사회'},{key:'환경',label:'사회'},{key:'정치',label:'정치'},{key:'국제',label:'국제'},{key:'스포츠',label:'스포츠'}];
function normalizeField(field){var segs=String(field||'').split(',').map(function(s){return s.trim();}).filter(Boolean);var out=[],seen={};segs.forEach(function(seg){var low=seg.toLowerCase(),label=null;for(var i=0;i<FIELD_CAT.length;i++){if(low.indexOf(FIELD_CAT[i].key.toLowerCase())>=0){label=FIELD_CAT[i].label;break;}}if(!label)label=seg.split(/\s+/)[0];if(label&&!seen[label]){seen[label]=1;out.push(label);}});return out;}
function getShortField(field){return normalizeField(field).slice(0,2).join(' · ');}

var SYN={'디자인':['디자인','문화','콘텐츠'],'마케팅':['마케팅','브랜드','문화','콘텐츠'],'브랜드':['브랜드','마케팅','문화'],'도로표지병':['산업','경제','건설','환경','지역'],'볼라드':['산업','건설','지역','안전'],'친환경':['환경','산업','경제','사회'],'재활용':['환경','사회','산업'],'도로안전시설물':['산업','건설','지역','사회'],'태양광':['산업','경제','환경','과학'],'제조':['산업','경제','과학'],'수출':['경제','산업','국제','무역'],'공공조달':['경제','사회','정치'],'안전':['사회','지역','산업'],'스마트':['it','과학','산업'],'베트남':['국제','경제','산업'],'침장':['산업','생활','유통','경제'],'섬유':['산업','경제','패션','지역'],'판로개척':['경제','유통','산업'],'강남마트':['유통','경제','생활'],'k-bedding':['산업','생활','경제'],'수출상담회':['경제','산업','국제'],'유통':['유통','경제','생활']};
var TERMW={'디자인':24,'마케팅':22,'브랜드':20,'콘텐츠':22,'문화':12,'it':10,'과학':8,'산업':12,'경제':12,'환경':14,'건설':12,'지역':12,'사회':11,'안전':10,'국제':10,'정치':6,'유통':12,'기업':10,'무역':12,'패션':12,'생활':10};
function probes(t){return SYN[t]?[t].concat(SYN[t]):[t];}
function tokenize(s){return (s||'').toLowerCase().split(/[\s,.\/·\(\)\[\]#"'’“”\-–—|>]+/).map(function(t){return t.trim();}).filter(function(t){return t.length>=2&&t!=='추가'&&t!=='확인'&&t!=='필요';});}
function buildMatches(){
 var toks=tokenize(_val('f_kw')).concat(tokenize(_val('f_ind'))).concat(tokenize(_val('f_topic'))).concat(tokenize(_val('f_about')));
 var target={};toks.forEach(function(t){probes(t).forEach(function(p){if(p.length>=2)target[p.toLowerCase()]=true;});});
 var terms=Object.keys(target);
 var scored=REPORTERS.map(function(r){var hay=(r.field||'').toLowerCase();var found=[];var score=40;terms.forEach(function(tm){if(hay.indexOf(tm)>=0){score+=(TERMW[tm]||8);found.push(tm);}});if(r.email&&r.email.indexOf('@')>=0)score+=8;else score-=25;if(score>99)score=99;if(score<0)score=0;return {r:r,score:score,matched:found};});
 scored.sort(function(a,b){if(b.score!==a.score)return b.score-a.score;if(b.matched.length!==a.matched.length)return b.matched.length-a.matched.length;return (a.r.media||'').localeCompare(b.r.media||'');});
 matchTotal=scored.filter(function(o){return o.matched.length>0;}).length;
 REPS=scored.slice(0,60).map(function(o,i){var r=o.r;var rep={rank:i+1,name:r.name,media:r.media,email:r.email||'',field:r.field||'',matched:o.matched,score:o.score,tone:reporterTone(r)};rep.reasons=reporterReasons(rep);rep.why=rep.reasons.join(' / ');return rep;});
 selRep=0;repShown=5;repChosen=false;
}
function reporterTone(r){var m=r.media||'',f=(r.field||'');if(/KBS|MBC|SBS|JTBC|YTN|방송|tbs|채널|TV/.test(m)||/방송|영상/.test(f))return '방송';if(/경제|매경|한경|머니|이데일리|서울경제|파이낸셜|아시아경제|헤럴드|뉴스핌|비즈|이코노/.test(m)||/경제|금융|증권/.test(f))return '경제지';if(/(일보|일간|신문)/.test(m)&&/대구|부산|광주|대전|강원|경북|경남|전북|전남|인천|울산|제주|지역|매일/.test(m+f))return '지역지';if(/IT|전자|디지털|테크|산업|과학|바이오|메디|헬스|디자인|문화|건설|환경/.test(f))return '전문지';return '종합지';}
function reporterReasons(r){var out=[],f=r.field||'',fld0=(f.split(',')[0]||'').trim();if(fld0)out.push('최근 '+fld0+' 분야 기사 다수 작성');if(CTX.signals&&CTX.signals.eco&&/산업|경제|환경|과학|사회/.test(f))out.push('ESG·친환경 산업 담당');if(CTX.signals&&CTX.signals.public&&/경제|사회|지역|정치/.test(f))out.push('공공기관·정책 기사 경험');if(/지역|일보|매일/.test(r.media+f))out.push('지역경제 기사 작성');if(r.matched&&r.matched.length)out.push('입력 키워드 '+r.matched.slice(0,3).join('·')+' 일치');out.push('성향: '+r.tone);if(r.email)out.push('개인 이메일 확인');return out.slice(0,5);}

var REPORTERS=[
{name:'김강호',media:'CNBNEWS',email:'masked@demo',field:'경제'},
{name:'김민영',media:'CNBNEWS',email:'masked@demo',field:'경제'},
{name:'김보연',media:'CNBNEWS',email:'masked@demo',field:'경제'},
{name:'유기서',media:'DBS동아방송',email:'masked@demo',field:'건강, 교육, 문화'},
{name:'이영완',media:'DBS동아방송',email:'masked@demo',field:'문화'},
{name:'권영석',media:'EBN',email:'masked@demo',field:'오피니언, 경제, 산업'},
{name:'김남희',media:'EBN',email:'masked@demo',field:'산업, 오피니언, 경제'},
{name:'김신혜',media:'EBN',email:'masked@demo',field:'문화'},
{name:'알렌은',media:'ELLE',email:'masked@demo',field:'문화'},
{name:'길애경',media:'HelloDD.com',email:'masked@demo',field:'문화'},
{name:'김승원',media:'HelloDD.com',email:'masked@demo',field:'문화'},
{name:'김지영',media:'HelloDD.com',email:'masked@demo',field:'문화'},
{name:'구서경',media:'HelloT',email:'masked@demo',field:'경제, 문화, 산업'},
{name:'김재황',media:'HelloT',email:'masked@demo',field:'경제, 문화, 산업'},
{name:'김진희',media:'HelloT',email:'masked@demo',field:'문화'},
{name:'권용만',media:'IT조선',email:'masked@demo',field:'IT, 전자, 과학기술'},
{name:'김경아',media:'IT조선',email:'masked@demo',field:'IT, 전자, 과학기술'},
{name:'김광연',media:'IT조선',email:'masked@demo',field:'IT, 전자, 과학기술'},
{name:'김영민',media:'JTBC',email:'masked@demo',field:'문화'},
{name:'김천',media:'JTBC',email:'masked@demo',field:'문화'},
{name:'김혜리',media:'JTBC',email:'masked@demo',field:'문화'},
{name:'김진형',media:'JTV 전주방송',email:'masked@demo',field:'문화'},
{name:'변한영',media:'JTV 전주방송',email:'masked@demo',field:'문화'},
{name:'송창용',media:'JTV 전주방송',email:'masked@demo',field:'문화'},
{name:'강훈',media:'JTV전주방송',email:'masked@demo',field:'지역방송, 문화'},
{name:'김민지',media:'JTV전주방송',email:'masked@demo',field:'지역방송, 문화'},
{name:'김학준',media:'JTV전주방송',email:'masked@demo',field:'지역방송, 문화'},
{name:'김빛이라',media:'KBS',email:'masked@demo',field:'문화, 연예'},
{name:'민수아',media:'KBS',email:'masked@demo',field:'경제, 서비스, 쇼핑'},
{name:'박미영',media:'KBS',email:'masked@demo',field:'경제, 경제일반, 대전'},
{name:'길재섭',media:'KNN',email:'masked@demo',field:'문화'},
{name:'김건형',media:'KNN',email:'masked@demo',field:'지역방송, 문화'},
{name:'김동환',media:'KNN',email:'masked@demo',field:'문화'},
{name:'고강용',media:'MBC',email:'masked@demo',field:'IT, 과학, 국제'},
{name:'구민지',media:'MBC',email:'masked@demo',field:'경제, 자원, 증권'},
{name:'김재경',media:'MBC',email:'masked@demo',field:'문화, 종교, 정치'},
{name:'시티라이프',media:'MBN',email:'masked@demo',field:'문화'},
{name:'갈태웅',media:'OBS',email:'masked@demo',field:'경제, 반도체, 스포츠'},
{name:'김영길',media:'OBS',email:'masked@demo',field:'문화, 사회, 미분류'},
{name:'김용재',media:'OBS',email:'masked@demo',field:'경제, 경제일반, 자동차'},
{name:'강희수',media:'OSEN',email:'masked@demo',field:'문화'},
{name:'민경훈',media:'OSEN',email:'masked@demo',field:'문화'},
{name:'손용호',media:'OSEN',email:'masked@demo',field:'문화'},
{name:'김성수',media:'PC사랑',email:'masked@demo',field:'문화, 정치'},
{name:'김호정',media:'PC사랑',email:'masked@demo',field:'문화'},
{name:'남지율',media:'PC사랑',email:'masked@demo',field:'문화'},
{name:'박수선',media:'PD저널',email:'masked@demo',field:'문화, 경제, 경제일반'},
{name:'비밀번호',media:'PD저널',email:'masked@demo',field:'문화'},
{name:'파일',media:'SBS',email:'masked@demo',field:'경제, 국제, 사회'},
{name:'김기송',media:'SBS Biz',email:'masked@demo',field:'문화'},
{name:'김동필',media:'SBS Biz',email:'masked@demo',field:'문화'},
{name:'류정현',media:'SBS Biz',email:'masked@demo',field:'문화'},
{name:'박지윤',media:'SPACE',email:'masked@demo',field:'IT'},
{name:'이정훈',media:'STYLE H',email:'masked@demo',field:'IT, 문화, 생활'},
{name:'기자',media:'TJB 대전방송',email:'masked@demo',field:'문화, 정치'},
{name:'강지호',media:'TV리포트',email:'masked@demo',field:'문화'},
{name:'강해인',media:'TV리포트',email:'masked@demo',field:'국제, 문화'},
{name:'김나래',media:'TV리포트',email:'masked@demo',field:'국제, 문화, 연예'},
{name:'변재영',media:'TV조선',email:'masked@demo',field:'경제, 사회, 정치'},
{name:'정은혜',media:'TV조선',email:'masked@demo',field:'경제'},
{name:'지정용',media:'TV조선',email:'masked@demo',field:'경제, 정치'},
{name:'김재호',media:'YBC연합방송',email:'masked@demo',field:'문화'},
{name:'윤원식',media:'YBC연합방송',email:'masked@demo',field:'문화'},
{name:'이승재',media:'YBC연합방송',email:'masked@demo',field:'문화'},
{name:'강내리',media:'YTN',email:'masked@demo',field:'문화, 연예, 영화'},
{name:'강정규',media:'YTN',email:'masked@demo',field:'IT, 과학, 국제'},
{name:'강태욱',media:'YTN',email:'masked@demo',field:'경제, 무역, 사회'},
{name:'건설전문',media:'ZDNet Korea',email:'masked@demo',field:'경제'},
{name:'김민아',media:'ZDNet Korea',email:'masked@demo',field:'유통'},
{name:'방은주',media:'ZDNet Korea',email:'masked@demo',field:'경제'},
{name:'조태석',media:'fmtv표준방송',email:'masked@demo',field:'경제'},
{name:'강인묵',media:'iFM경인방송',email:'masked@demo',field:'문화'},
{name:'곽경호',media:'iFM경인방송',email:'masked@demo',field:'문화'},
{name:'김성민',media:'iFM경인방송',email:'masked@demo',field:'문화'},
{name:'비밀번호',media:'i가스저널',email:'masked@demo',field:'문화'},
{name:'김장민',media:'press24',email:'masked@demo',field:'경제, 문화, 사회'},
{name:'서은용',media:'press24',email:'masked@demo',field:'경제, 문화, 사회'},
{name:'원의',media:'press24',email:'masked@demo',field:'경제, 국방, 문화'},
{name:'김규비',media:'ybcnews',email:'masked@demo',field:'문화'},
{name:'김은우',media:'ybcnews',email:'masked@demo',field:'문화'},
{name:'이성재',media:'ybcnews',email:'masked@demo',field:'문화'},
{name:'민경화',media:'가톨릭신문',email:'masked@demo',field:'문화'},
{name:'박영호',media:'가톨릭신문',email:'masked@demo',field:'문화'},
{name:'박원희',media:'가톨릭신문',email:'masked@demo',field:'문화'},
{name:'김명준',media:'강원도민일보',email:'masked@demo',field:'경제, 정치, 문화'},
{name:'김여진',media:'강원도민일보',email:'masked@demo',field:'문화, 스포츠, 정치'},
{name:'김영희',media:'강원도민일보',email:'masked@demo',field:'문화, 사회, 스포츠'},
{name:'고은',media:'강원일보',email:'masked@demo',field:'경제, 국제, 금융'},
{name:'권원근',media:'강원일보',email:'masked@demo',field:'문화, 학술, 문화재'},
{name:'김보경',media:'강원일보',email:'masked@demo',field:'경제, 문화, 사회'},
{name:'권오준',media:'경기도민일보미디어',email:'masked@demo',field:'교육, 문화, 사회'},
{name:'김영천',media:'경기도민일보미디어',email:'masked@demo',field:'교육, 문화, 사회'},
{name:'나정식',media:'경기도민일보미디어',email:'masked@demo',field:'교육, 문화, 사회'},
{name:'유광식',media:'경기매일',email:'masked@demo',field:'문화, 연예, 오피니언'},
{name:'장형연',media:'경기매일',email:'masked@demo',field:'문화'},
{name:'정석철',media:'경기매일',email:'masked@demo',field:'문화, 스포츠, 연예'},
{name:'김성운',media:'경기신문',email:'masked@demo',field:'문화'},
{name:'김영복',media:'경기신문',email:'masked@demo',field:'문화'},
{name:'김원규',media:'경기신문',email:'masked@demo',field:'문화'},
{name:'강한수',media:'경기일보',email:'masked@demo',field:'문화, IT, 과학'},
{name:'공혜린',media:'경기일보',email:'masked@demo',field:'문화, IT, 과학'},
{name:'권종오',media:'경기일보',email:'masked@demo',field:'문화, 스포츠, 월드컵'},
{name:'권민주',media:'경남도민일보',email:'masked@demo',field:'문화'},
{name:'김구연',media:'경남도민일보',email:'masked@demo',field:'경제, 사회'},
{name:'김다솜',media:'경남도민일보',email:'masked@demo',field:'문화, 정치, 국회'},
{name:'강진태',media:'경남신문',email:'masked@demo',field:'IT, 과학, 모바일'},
{name:'고비룡',media:'경남신문',email:'masked@demo',field:'사회, IT, 과학'},
{name:'권태영',media:'경남신문',email:'masked@demo',field:'정치, 경제, 무역'},
{name:'경남일보',media:'경남일보',email:'masked@demo',field:'문화, 미술, 건축'},
{name:'김윤관',media:'경남일보',email:'masked@demo',field:'IT, 과학, 과학일반'},
{name:'문병기',media:'경남일보',email:'masked@demo',field:'경제, 자동차, 정치'},
{name:'김규진',media:'경도일보',email:'masked@demo',field:'경제, 유통, 정치'},
{name:'권오항',media:'경북도민일보',email:'masked@demo',field:'문화'},
{name:'권택근',media:'경북도민일보',email:'masked@demo',field:'사회, 경제, 취업'},
{name:'김대호',media:'경북도민일보',email:'masked@demo',field:'문화, 사회, 스포츠'},
{name:'강준혁',media:'경북매일',email:'masked@demo',field:'문화'},
{name:'고성환',media:'경북매일',email:'masked@demo',field:'문화, 정치, 선거'},
{name:'곽인규',media:'경북매일',email:'masked@demo',field:'문화, 전시, 공연'},
{name:'박윤식',media:'경북매일신문',email:'masked@demo',field:'문화, 정치, 청와대'},
{name:'장유수',media:'경북매일신문',email:'masked@demo',field:'경제, 유통'},
{name:'전병휴',media:'경북매일신문',email:'masked@demo',field:'문화, 미술, 건축'},
{name:'곽성일',media:'경북일보',email:'masked@demo',field:'사회, 정치, 문화'},
{name:'권남인',media:'경북일보',email:'masked@demo',field:'문화'},
{name:'권진한',media:'경북일보',email:'masked@demo',field:'경제, 문화, 전시'},
{name:'권지혜',media:'경상일보',email:'masked@demo',field:'문화, 전시, 공연'},
{name:'김도현',media:'경상일보',email:'masked@demo',field:'경제, 사회, 정치'},
{name:'김동수',media:'경상일보',email:'masked@demo',field:'문화'},
{name:'강기정',media:'경인일보',email:'masked@demo',field:'문화'},
{name:'구민주',media:'경인일보',email:'masked@demo',field:'경제, 사회'},
{name:'김성호',media:'경인일보',email:'masked@demo',field:'문화, 미술, 건축'},
{name:'박상호',media:'CNBNEWS',email:'masked@demo',field:'사회'},
{name:'박용덕',media:'CNBNEWS',email:'masked@demo',field:'사회'},
{name:'비밀번호',media:'EBN',email:'masked@demo',field:'오피니언'},
{name:'김기태',media:'G1방송',email:'masked@demo',field:'지역방송'},
{name:'김도운',media:'G1방송',email:'masked@demo',field:'지역방송'},
{name:'윤일지',media:'JoongAng Daily',email:'masked@demo',field:'연예'},
{name:'강동일',media:'KBC광주방송',email:'masked@demo',field:'지역방송'},
{name:'고익수',media:'KBC광주방송',email:'masked@demo',field:'지역방송'},
{name:'강규엽',media:'KBS',email:'masked@demo',field:'울산'},
{name:'강전일',media:'KBS',email:'masked@demo',field:'경북'},
{name:'김경임',media:'KCTV제주방송',email:'masked@demo',field:'지역방송'},
{name:'김용원',media:'KCTV제주방송',email:'masked@demo',field:'지역방송'},
{name:'전성현',media:'KNN',email:'masked@demo',field:'지역방송'},
{name:'조진욱',media:'KNN',email:'masked@demo',field:'지역방송'},
{name:'곽동건',media:'MBC',email:'masked@demo',field:'사회, 미디어'},
{name:'곽승규',media:'MBC',email:'masked@demo',field:'스포츠, 축구'},
{name:'김래범',media:'MBN',email:'masked@demo',field:'사회'},
{name:'정태진',media:'MBN',email:'masked@demo',field:'정치'},
{name:'강수인',media:'NSP통신',email:'masked@demo',field:'정치'},
{name:'강은태',media:'NSP통신',email:'masked@demo',field:'정치'},
{name:'권하경',media:'OBS',email:'masked@demo',field:'사회, 날씨'},
{name:'김대희',media:'OBS',email:'masked@demo',field:'사회, 사건, 사고'},
{name:'강필주',media:'OSEN',email:'masked@demo',field:'스포츠'},
{name:'고용준',media:'OSEN',email:'masked@demo',field:'게임'},
{name:'이철규',media:'PC사랑',email:'masked@demo',field:'오피니언'},
{name:'김도윤',media:'TBC',email:'masked@demo',field:'연예'},
{name:'박가영',media:'TBC',email:'masked@demo',field:'지역방송'},
{name:'권혁기',media:'TV리포트',email:'masked@demo',field:'사회'},
{name:'김진수',media:'TV리포트',email:'masked@demo',field:'연예'},
{name:'이나영',media:'TV조선',email:'masked@demo',field:'사회'},
{name:'이태희',media:'TV조선',email:'masked@demo',field:'정치'},
{name:'강민경',media:'YTN',email:'masked@demo',field:'정치, 국회, 정당'},
{name:'강진원',media:'YTN',email:'masked@demo',field:'정치, 청와대'},
{name:'홍하나',media:'ZDNet Korea',email:'masked@demo',field:'금융'},
{name:'강찬우',media:'e-헬스통신',email:'masked@demo',field:'건강'},
{name:'데스크',media:'e-헬스통신',email:'masked@demo',field:'건강'},
{name:'구정민',media:'강원도민일보',email:'masked@demo',field:'국제, 유럽, 정치'},
{name:'김유경',media:'강원도민일보',email:'masked@demo',field:'경남'},
{name:'김영석',media:'강원일보',email:'masked@demo',field:'사회'},
{name:'박승선',media:'강원일보',email:'masked@demo',field:'사회'},
{name:'김수민',media:'게임어바웃',email:'masked@demo',field:'게임'},
{name:'김형근',media:'게임어바웃',email:'masked@demo',field:'게임'},
{name:'박상진',media:'경기도민일보미디어',email:'masked@demo',field:'스포츠'},
{name:'배연석',media:'경기도민일보미디어',email:'masked@demo',field:'스포츠'},
{name:'구재원',media:'경기일보',email:'masked@demo',field:'사회, 교육, 시험'},
{name:'김동식',media:'경기일보',email:'masked@demo',field:'국제, 미국, 북미'},
{name:'문정민',media:'경남도민일보',email:'masked@demo',field:'사회, 교육, 시험'},
{name:'박솔미',media:'경남도민일보',email:'masked@demo',field:'미분류'},
{name:'김현미',media:'경남신문',email:'masked@demo',field:'정치, 국회, 정당'},
{name:'노윤주',media:'경남신문',email:'masked@demo',field:'충남'}
];

/* ===== 보도자료 생성기 (원본 데모 buildPressRelease + _polishPR 재사용) ===== */
var PR_STYLE='economy';
var PR_STYLES={
 economy:{label:'경제신문', tag:'A', lead:'판로 확대에 나섰다',
  valueFn:function(c){return '이번 '+c.ev+'로 '+c.actor+'는 '+(c.reg||'해외')+' 유통망과 직접 거래 채널을 확보한다.'+(c.amt?(' 목표 거래 규모는 연 '+c.amt+'이다.'):(c.firmN?(' 참가 기업은 '+c.firmN+'다.'):''));}},
 local:{label:'지역신문', tag:'B', lead:'공동 판로 개척에 나섰다',
  valueFn:function(c){return '이번 '+c.ev+'는 개별 기업 단위로는 뚫기 어려운 '+(c.reg||'해외')+' 판로를 '+(c.city?c.city+' ':'')+c.indCore+'기업이 공동으로 확보하는 사례다.'+(c.firmN?(' '+c.firmN+'가 함께 참여한다.'):'');}},
 it:{label:'산업·IT 전문지', tag:'C', lead:'유통망 확대에 나섰다',
  valueFn:function(c){return '이번 '+c.ev+'는 오프라인 매장 입점과 함께 온라인·플랫폼 기반 판매 채널을 확보하는 방식으로 진행된다.'+(c.stores?(' 연계 대상은 '+c.venue+' '+c.stores+(_hasJong(c.stores)?'이다.':'다.')):'');}},
 startup:{label:'스타트업 전문지', tag:'', lead:'신규 시장 진출에 나섰다',
  valueFn:function(c){return '이번 '+c.ev+'는 '+c.actor+'가 '+(c.reg||'해외')+' 시장에 처음으로 진입하는 사업이다.'+(c.amt?(' 초기 목표 규모는 연 '+c.amt+'이다.'):'');}},
 corp:{label:'기업 보도자료', tag:'', lead:'시장 공략을 본격화했다',
  valueFn:function(c){return '이번 '+c.ev+'로 '+c.actor+'는 '+(c.reg||'신규')+' 시장에서 거래처를 확대한다.'+(c.firmN?(' 참가 기업은 '+c.firmN+'다.'):'');}}
};
function _jEN(s){return _hasJong(s)?'은':'는';}
function _prFacts(){
 var about=_val('f_about'), caseTxt=_val('f_case'), blob=about+' '+caseTxt+' '+(CTX.topic||'');
 function g(re){var x=blob.match(re);return x?x[0]:'';}
 var region=_findKw(/베트남|해외|글로벌|미국|중국|일본|유럽|아세안|인도|동남아/,'');
 var venue=_findKw(/[가-힣A-Za-z]*마트|[가-힣]+유통|[가-힣]+플랫폼|[가-힣]+몰/,'');
 var event=_findKw(/[가-힣A-Za-z]*상담회|[가-힣]*박람회|[가-힣]*전시회|[가-힣]*미팅/,'');
 return {
  region:region, venue:venue, event:event||'행사',
  city:(blob.match(/(대구|부산|광주|대전|울산|인천|세종|서울|경기|강원|충북|충남|전북|전남|경북|경남|제주)/)||[''])[0],
  pubOrg:((blob.match(/[가-힣]+(?:광역시|특별시|시|도|군|구)\s?[가-힣]*사무소/)||[''])[0])||'',
  stores:g(/[0-9]+\s*개\s*(?:소매\s*)?매장/),
  amount:g(/[0-9,]+\s*억\s*원?/),
  firms:g(/참가기업\s*[0-9]+\s*개사|[0-9]+\s*개사/),
  date:g(/[0-9]{1,2}월\s*[0-9]{1,2}일/),
  place:g(/[가-힣]{0,3}호텔\s*[가-힣A-Za-z]+|니코사이공|[가-힣]{2,8}컨벤션센터/).replace(/(에서는|에서|에는|에)$/,''),
  lead:g(/이사장\s*[가-힣]{2,4}|대표\s*[가-힣]{2,4}|회장\s*[가-힣]{2,4}/)
 };
}
function _indCore(){
 var toks=String(CTX.industry).split(/[,\n]/).map(function(s){return s.trim();}).filter(Boolean);
 var f='';for(var i=0;i<toks.length;i++){if(/산업$/.test(toks[i])){f=toks[i];break;}}
 if(!f)f=toks[toks.length-1]||'산업';
 return f.replace(/산업$/,'')||toks[0]||((CTX.keywords||[])[0])||'산업';
}
/* 서비스·비제조 기업용 사실 추출 (제조·수출 프레임을 쓰지 않는다) */
function _bizFacts(){
 var blob=_val('f_about')+' '+_val('f_case')+' '+(CTX.topic||'');
 function g(re){var m=blob.match(re);return m?m[0].replace(/\s+/g,' ').trim():'';} /* 내부 공백은 1칸 유지 */
 return {
  firms:g(/[0-9,]+\s*개\s*(?:중소기업|고객사|업체|기관|기업|사)/),
  cases:g(/[0-9,]+\s*건/),
  amount:g(/[0-9,]+\s*억\s*원?|[0-9,]+\s*만\s*원/),
  people:g(/[0-9,]+\s*명/),
  year:g(/(?:19|20)[0-9]{2}\s*년/),
  region:(blob.match(/베트남|해외|글로벌|미국|중국|일본|유럽|아세안|동남아|인도네시아/)||[''])[0],
  lead:g(/대표이사\s*[가-힣]{2,4}|대표\s*[가-힣]{2,4}|원장\s*[가-힣]{2,4}|이사장\s*[가-힣]{2,4}|회장\s*[가-힣]{2,4}|센터장\s*[가-힣]{2,4}/)
 };
}
/* 기업 유형별 기사 생성 (제조/수출이 아닌 홍보대행·서비스·스타트업·병원·교육·공공) */
/* ===== 인터뷰에서 수집한 취재 내용 추출 =====
   기사는 회사 소개가 아니라, 인터뷰에서 확인된 코멘트·수치·사례를 중심으로 쓴다. */
function _interviewFacts(){
 var qt=ANSWER_TEXT.quote||'', quote='';
 var m=qt.match(/[""]([^""]{4,})[""]|"([^"]{4,})"/);
 if(m) quote=(m[1]||m[2]);
 var speaker=(qt.match(/(이사장|대표이사|대표|원장|회장|센터장|팀장|본부장)\s*[가-힣]{2,4}|[가-힣]{2,4}\s*(이사장|대표|원장|회장|센터장)/)||[''])[0].trim();
 return {
  quote:quote, speaker:speaker,
  num:(ANSWER_TEXT.num||'').trim(),
  caseText:(ANSWER_TEXT.case||'').trim(),
  plan:(ANSWER_TEXT.plan||'').trim(),
  diff:(ANSWER_TEXT.diff||'').trim(),
  has:function(){return !!(quote||ANSWER_TEXT.num||ANSWER_TEXT.case);}
 };
}
/* 경어체·구어체 답변을 기사체(–다)로 변환 */
function _toArticleStyle(s){
 s=String(s||'').replace(/\n+/g,' ').trim();
 s=s.replace(/하였습니다/g,'했다').replace(/했습니다/g,'했다').replace(/합니다/g,'한다')
    .replace(/됩니다/g,'된다').replace(/입니다/g,'이다').replace(/였습니다/g,'였다')
    .replace(/있습니다/g,'있다').replace(/없습니다/g,'없다').replace(/드립니다/g,'다')
    .replace(/십니다/g,'다').replace(/ㅂ니다/g,'다').replace(/습니다/g,'다')
    .replace(/이에요|예요|에요/g,'다').replace(/\s{2,}/g,' ').trim();
 if(s && !/[.。!?]$/.test(s)) s+='.';
 return s;
}
/* 관계자 코멘트: 인터뷰에서 받은 실제 코멘트를 우선 사용 (인용부 안은 기사체로) */
function _articleComment(defSpeaker, defQuote){
 var iv=_interviewFacts();
 var sp=iv.speaker||defSpeaker;
 var quote=String(iv.quote||defQuote).replace(/^["""]|["""]$/g,'').replace(/[.。]$/,'').trim();
 quote=quote.replace(/했습니다/g,'하겠다').replace(/합니다/g,'한다').replace(/입니다/g,'이다').replace(/습니다/g,'다');
 return _eun(sp)+' "'+quote+'"고 말했다.';
}
/* 본문에 넣을 취재 사실(수치·사례) 문장 — 기사체로 변환, 중복 최소화 */
function _ivBodyLine(){
 var iv=_interviewFacts(), out=[];
 if(iv.num) out.push(_toArticleStyle(_firstSent(iv.num)));
 if(iv.caseText){ var c=_toArticleStyle(_firstSent(iv.caseText)); if(out.indexOf(c)<0 && c.replace(/[0-9]/g,'')!==(out[0]||'').replace(/[0-9]/g,'')) out.push(c); }
 return out.join(' ').trim();
}
/* 리드 첫 문장 = '사건/성과' (회사 소개가 아니라, 최근 발생한 성과·계약·선정·지원 사례로 시작) */
function _leadEvent(biz,f,ang){
 var firms=f.firms,cases=f.cases,amount=f.amount,people=f.people,region=f.region;
 var strong=firms||cases||people||amount||'';
 if(ang==='deal') return (region?region+' ':'')+'시장 공급 계약이 체결됐다.';
 if(ang==='cert') return '공인 인증·정부 선정 성과가 나왔다.';
 switch(biz.type){
  case 'agency':
   if(firms) return firms+(_hasJong(firms)?'이':'가')+' 정부지원사업을 통해 '+(region||'해외')+' 시장 진출에 나섰다.';
   if(cases) return (region||'해외')+' 바이어 상담 '+cases+(_hasJong(cases)?'이':'가')+' 성사됐다.';
   return '중소기업의 '+(region||'해외')+' 마케팅 지원 성과가 나왔다.';
  case 'hospital':
   if(strong) return (f.year?f.year+' ':'지난해 ')+strong+' 규모의 진료·치료 성과가 집계됐다.';
   return '지역 의료 서비스 성과가 공개됐다.';
  case 'education':
   if(people||firms) return (f.year?f.year+' ':'')+'수료생 '+(people||firms)+'이 배출됐다.';
   return '교육 프로그램 운영 성과가 나왔다.';
  case 'startup':
   if(amount) return (f.year?f.year+' ':'')+amount+' 규모의 투자 유치·성장 성과가 나왔다.';
   if(people) return '서비스 이용자가 '+people+'을 넘어섰다.';
   return '기술 기반 서비스의 성장 성과가 공개됐다.';
  case 'public':
   if(firms) return firms+(_hasJong(firms)?'이':'가')+' 지원사업 수혜를 받았다.';
   return '지역기업 지원 성과가 나왔다.';
  default:
   if(strong) return strong+' 규모의 사업 성과가 나왔다.';
   return biz.typeLabel+' 분야 사업 성과가 공개됐다.';
 }
}
function _prBiz(biz){
 var f=_bizFacts(), name=CTX.company||'해당 기업';
 var nameShort=name.replace(/주식회사|㈜|\(주\)/g,'').trim()||name;
 var svc=(biz.services||[]).filter(Boolean).slice(0,4), svcTxt=svc.slice(0,3).join('·')||biz.typeLabel;
 var scale=[];if(f.firms)scale.push(f.firms);if(f.cases)scale.push(f.cases);if(f.amount)scale.push(f.amount);if(f.people)scale.push(f.people);
 /* 제목 = 사명 + (정량 팩트) + 유형별 헤드라인 명사. 홍보문구·수식어·중복어 배제 */
 var HEAD={agency:'해외 진출 지원 성과', public:'지원사업 성과', hospital:'진료 성과 공개',
   education:'교육 성과 공개', startup:'투자유치·성장 성과', service:'사업 성과 공개',
   manufacturer:'사업 성과 공개'}[biz.type]||'사업 성과 공개';
 var factBit=f.firms||f.cases||f.amount||f.people||'';
 var L=[];
 /* 제목 */
 L.push('[제목] '+nameShort+', '+(factBit?factBit+' ':(svc[0]?svc[0]+' ':''))+HEAD);
 /* 부제목: 핵심 서비스 + 정량 팩트 */
 L.push('[부제목] '+svcTxt+(scale.length?(' · '+scale.slice(0,2).join(', ')):(' · '+biz.typeLabel)));
 L.push('');
 /* 리드: 문장1 = '사건/성과'로 시작(회사 소개 아님), 문장2 = 주체·서비스·출처(밝혔다) */
 var ang=(typeof IDEAS!=='undefined'&&IDEAS[selIdea])?IDEAS[selIdea].angleKey:'';
 L.push('[리드]');
 L.push(_leadEvent(biz,f,ang));
 L.push(name+(f.lead?'('+f.lead+')':'')+_jEN(name)+' '+_eul(svcTxt)+' 통해 '+biz.customer+'의 '+biz.act+'고 밝혔다.');
 L.push('');
 /* 본문: 인터뷰에서 확인된 취재 사실(수치·사례) 우선, 그 다음 서비스 배경 */
 L.push('■ 본문');
 var iv=_interviewFacts(), ivLine=_ivBodyLine();
 var scaleVerb=(biz.type==='hospital'||biz.type==='startup'||biz.type==='manufacturer')?'기록했다':'지원했다';
 var b='';
 if(ivLine) b+=ivLine+' ';       /* 인터뷰 취재 내용을 본문 앞에 */
 b+=name+_jEN(name)+' '+_eul(svc.join('·')||svcTxt)+' 주요 서비스로 제공한다. ';
 if(scale.length && !ivLine){var sj=scale.join(', ');b+=(f.year?f.year+' ':'')+(f.region&&biz.type==='agency'?'해외 진출을 목표로 ':'')+sj+(_hasJong(sj)?'을':'를')+' '+scaleVerb+'.';}
 L.push(b.trim());
 L.push('');
 /* 배경 설명 */
 L.push('■ 배경 설명');
 L.push(_eun(name)+' '+biz.role+(_hasJong(biz.role)?'이다.':'다.'));
 L.push('');
 /* 기사 가치 */
 L.push('■ 기사 가치');
 L.push(biz.valueFrame+'.');
 L.push('');
 /* 향후 일정 (인터뷰의 향후 계획 우선) */
 L.push('■ 향후 일정');
 L.push(iv.plan? _toArticleStyle(_firstSent(iv.plan)) : (_eun(name)+' '+_eul(biz.customer)+' 대상으로 '+_eul(svc[0]||'지원')+' 확대한다.'));
 L.push('');
 /* 관계자 코멘트 (인터뷰에서 받은 실제 코멘트 우선) */
 L.push('■ 관계자 코멘트');
 L.push(_articleComment(f.lead||(name+' 관계자'), biz.customer+'의 실질적인 성과를 만드는 데 집중하겠다'));
 L.push('');
 /* 기관 소개 (배경 설명과 중복되지 않게 서비스·고객 중심으로 기술) */
 L.push('■ '+nameShort+' 소개');
 L.push(name+_jEN(name)+' '+_eul(svc.join('·')||svcTxt)+' '+biz.customer+'에게 제공하는 '+biz.typeLabel+(_hasJong(biz.typeLabel)?'이다.':'다.'));
 L.push('');
 /* 문의처 */
 L.push('■ 문의처');
 L.push(name+' 홍보담당 / 전화 010-1234-5678 / 이메일 work@firstmkt.co.kr');
 L.push('');
 /* 첨부자료 (유형별 보완자료에서) */
 L.push('[첨부자료]');
 (biz.mats||[]).slice(0,5).forEach(function(a){L.push('· '+a);});
 return L.join('\n');
}
function buildPressRelease(){
 buildContext();
 var biz=CTX.biz||analyzeCompany();
 var _fx=_prFacts();
 /* 실제 수출 행사(유통망+행사)가 있는 제조·공공기관만 기존 '수출상담회' 서사, 그 외엔 유형별 기사 */
 var useExport=(_fx.venue||(_fx.event&&_fx.event!=='행사'))&&(biz.type==='manufacturer'||biz.type==='public');
 if(!useExport) return _prBiz(biz);
 var f=_prFacts(), name=CTX.company||'해당 기관', prod=CTX.product||'신규 사업';
 var indCore=_indCore(), nameShort=name.replace(/협동조합$|조합$/,'').trim()||name;
 var st=PR_STYLES[PR_STYLE]||PR_STYLES.economy;
 var ev=(f.event&&f.event!=='행사')?f.event:prod, isEvent=(f.event&&f.event!=='행사');
 var amt=f.amount?f.amount.replace(/\s+/g,''):'', reg=f.region||'', firmN=(f.firms||'').replace(/참가기업\s*/,'');
 /* 주체(제목·리드의 첫 주어): 컨소시엄이면 '지역+업종+규모', 단일기업이면 사명 */
 var actorHead = (firmN&&f.city&&indCore) ? (f.city+' '+indCore+'기업 '+firmN)
               : (firmN&&indCore)        ? (indCore+'기업 '+firmN)
               : (f.city&&indCore)        ? (f.city+' '+indCore+'업계')
               : nameShort;
 var actorShort = (f.city&&indCore)?(f.city+' '+indCore+'업계'):nameShort;
 var c={ev:ev,reg:reg,amt:amt,firmN:firmN,city:f.city,venue:f.venue,stores:f.stores,indCore:indCore,actor:actorShort};
 var L=[];
 /* ── 제목: 홍보문이 아니라 기사 헤드라인 (주체+구체행위, 수식어 없이) ──
    예) 대구 침장기업 5개사, 베트남 강남마트와 수출상담회 추진 */
 L.push('[제목] '+actorHead+', '+(reg?reg+' ':'')+(f.venue?f.venue+'와 ':'')+(isEvent?f.event:(prod+' 사업'))+' 추진');
 /* ── 부제목: 핵심 수치·일정 팩트 2개 ── */
 var sub=[];
 if(f.date)sub.push((reg?reg+' ':'')+f.date+' 개최');
 if(firmN&&sub.length<2)sub.push(indCore+'기업 '+firmN+' 참가');
 if(f.stores&&amt&&sub.length<2)sub.push(f.venue+' '+f.stores+'·연 '+amt+' 수입망 연계');
 else{ if(f.stores&&sub.length<2)sub.push(f.venue+' '+f.stores+' 연계'); if(amt&&sub.length<2)sub.push('연 '+amt+' 규모'); }
 L.push('[부제목] '+(sub.slice(0,2).join(', ')||(indCore+'업계 '+(reg||'신규')+' 판로 개척')));
 L.push('');
 /* ── 리드: 첫 두 문장에 6하원칙(누가·언제·어디서·무엇을·왜·얼마나) ── */
 L.push('[리드]');
 /* 문장1 = 누가 + 무엇을/왜 (한 눈에 사건 요약) */
 L.push(actorHead+_jEN(actorHead)+' '+(reg?reg+' 시장 ':'')+st.lead+'.');
 /* 문장2 = 언제·어디서·무엇을·누가(주체 사명)·규모 + 출처(밝혔다) */
 var lead2=name+(f.lead?'('+f.lead+')':'')+_jEN(name)+' ';
 if(f.venue)lead2+=f.venue+'와 함께 ';
 if(f.date)lead2+=f.date+' ';
 if(f.place)lead2+=f.place+'에서 ';
 lead2+="'"+ev+"'를 "+(isEvent?'연다고 ':'추진한다고 ');
 if(firmN)lead2+='밝혔다. '+(f.city?f.city+' ':'')+indCore+'기업 '+firmN+'가 참가한다.';
 else lead2+='밝혔다.';
 L.push(lead2.trim());
 L.push('');
 /* ── 본문: 사실 나열 (참가 규모·사전 협의·개최 장소) ── */
 L.push('■ 본문');
 var b='';
 if(f.venue)b+=name+_jEN(name)+' 앞서 '+f.venue+' 관계자를 '+(f.city||'국내')+'로 초청해 사전 협의를 진행했다. ';
 if(firmN)b+='참가 기업은 '+(f.city?f.city+' ':'')+indCore+'기업 '+firmN+'다. ';
 if(f.place)b+=ev+'는 '+f.place+'에서 열린다.';
 L.push(b.trim()||_firstSent(_val('f_about'))||(name+'가 '+(reg||'신규')+' 시장 진출을 추진하고 있다.'));
 L.push('');
 /* ── 배경 설명 ── */
 L.push('■ 배경 설명');
 var bgp=[];if(f.stores)bgp.push(f.stores+'을 운영');if(amt)bgp.push('연 '+amt+' 규모의 한국 제품을 수입');
 var bg=(f.venue&&bgp.length)?(f.venue+_jEN(f.venue)+' '+(reg?reg+'에서 ':'')+bgp.join('하고, ')+'하는 유통망이다. '):'';
 L.push((bg+'이번 협력은 양측이 맺은 업무협약(MOU)에 따른 첫 사업이다.').trim());
 L.push('');
 /* ── 기사 가치: 매체 관점별 사실 서술 (예측어 없이) ── */
 L.push('■ 기사 가치');
 L.push(st.valueFn(c));
 L.push('');
 /* ── 향후 일정 (인터뷰의 향후 계획 우선) ── */
 var ivx=_interviewFacts();
 L.push('■ 향후 일정');
 L.push(ivx.plan? _toArticleStyle(_firstSent(ivx.plan)) : (name+_jEN(name)+' '+(f.pubOrg?f.pubOrg+'와 협력해 ':'')+(f.date?f.date+' '+ev+' 이후 ':'')+'현지 판로를 단계적으로 확대한다.'));
 L.push('');
 /* ── 관계자 코멘트: 인터뷰에서 받은 실제 코멘트 우선 ── */
 L.push('■ 관계자 코멘트');
 L.push(_articleComment(f.lead||(name+' 관계자'), (reg||'현지')+' 시장은 '+indCore+' 수요가 늘고 있는 곳이며, 이번 '+ev+'에서 구체적인 수출 계약을 마무리하겠다'));
 L.push('');
 /* ── 기관 소개 ── */
 L.push('■ '+nameShort+' 소개');
 L.push(name+_jEN(name)+' '+indCore+' 분야 '+(firmN?'참여기업의 공동 사업과 ':'')+'판로 개척을 지원한다.');
 L.push('');
 /* ── 문의처 ── */
 L.push('■ 문의처');
 L.push(name+' 홍보담당 / 전화 010-1234-5678 / 이메일 work@firstmkt.co.kr');
 L.push('');
 /* ── 첨부자료 ── */
 L.push('[첨부자료]');
 (f.venue?[f.venue+' 매장 사진']:[]).concat([(firmN?'참가기업':'주요')+' 제품 사진',(f.venue?'사전 협의':'행사')+' 현장 사진',(f.lead||'대표')+' 코멘트 전문','목표 수출액·규모 자료']).forEach(function(a){L.push('· '+a);});
 return L.join('\n');
}

function _polishPR(t){
 /* ① 광고성·과장 수식어 삭제 */
 t=t.replace(/(업계\s*최고의?|최고의|최강의?|국내\s*최초|세계\s*최초|업계\s*최초|유일무이한?|획기적인?|혁신적인?|명품|최고급|압도적인?|놀라운|엄청난|대박|자랑하는?|열풍|돌풍|각광|화제)/g,'');
 var seen={};
 t=t.split('\n').map(function(line){
  var head=line.trim();
  if(/^(■|\[|·|□)/.test(head)||!head)return line; /* 헤더·라벨·첨부 줄 보존 */
  /* ② GPT가 즐겨 쓰는 군더더기 접속어·모호한 수식어 제거 (문장 뜻은 유지).
        인접한 상투어가 연달아 나와도 모두 지워지도록 변화가 없을 때까지 반복. */
  var prev;
  do{ prev=line;
   line=line.replace(/(^|[\s.,])\s*(한편|특히|또한|아울러|무엇보다|앞으로도?|나아가|이를\s*통해|다양한|적극적으로|적극)\s*,?\s*/g,'$1');
  }while(line!==prev);
  line=line.replace(/\s*크게\s*(?=늘|증가|성장|확대)/g,' ');
  /* ③ 90자 초과 문장을 절 단위로 분할 */
  if(line.length>90)line=line.replace(/하며\s/g,'한다. ').replace(/으며\s/g,'다. ').replace(/이며\s/g,'이다. ').replace(/\s그리고\s/g,'. ').replace(/,\s(?=[가-힣]{6,})/g,'. ');
  line=line.replace(/[ \t]{2,}/g,' ').replace(/\s+([.,])/g,'$1').trim();
  /* ④ 중복 문장 제거 */
  var k=line.replace(/\s/g,'');if(k.length>=8){if(seen[k])return '';seen[k]=1;}
  return line;
 }).join('\n');
 return t.replace(/\n{3,}/g,'\n\n');
}

var ANSWER_TEXT={}, answers={}, HELD_MATERIALS=[];
