/* ============================================================
   보도자료 작성 AI — 5단계 흐름 (정보입력 구조 개선판)
   작성 방식(AI/직접) · 기사 유형별 도움말 · 2단계 3분류 · 키워드 자동추출·수정
   생성(3단계)·저장(5단계)은 서버 API(/api/*) 필요
   ============================================================ */
(function () {
  'use strict';

  var TYPE_LABEL = {
    brand: '기업/브랜드 소식', launch: '제품/서비스 출시', award: '수상/인증', event: '행사/이벤트',
    interview: '인터뷰/스토리', market: '시장/산업 관련', social: '사회/이슈 관련', etc: '기타'
  };
  // 기사 유형별 '반드시 포함할 사실' 도움말/예시 (§7)
  var FACT_HELP = {
    brand: '무엇이 달라졌는지 / 언제부터인지 / 변경 이유 / 기업에 어떤 의미가 있는지 적어주세요.',
    launch: '출시일 / 주요 특징 / 기존 제품과 차이점 / 가격(공개하는 경우) / 이용 대상 등을 적어주세요.',
    award: '수상·인증명 / 주관기관 / 수상일 / 선정 이유 / 관련 성과 등을 적어주세요.',
    event: '행사일 / 장소 / 참가 대상 / 행사 목적 / 주요 프로그램 등을 적어주세요.',
    interview: '인물 이름 / 직책 / 주요 경험 / 전달하고 싶은 핵심 메시지를 적어주세요.',
    market: '관련 시장 변화 / 데이터 출처 / 조사 기간 / 주요 수치 / 기업의 대응 내용을 적어주세요.',
    social: '관련 이슈 / 기업의 활동·입장 / 시기 / 대상 / 기대 효과 등을 적어주세요.',
    etc: '날짜 / 장소 / 수치 / 대상 / 주요 내용 등 기사에 꼭 필요한 사실을 적어주세요.'
  };
  var FACT_EX = {
    brand: '예) 2026년 8월 브랜드 리뉴얼 / 로고·슬로건 변경 / 창립 10주년 계기',
    launch: '예) 출시일 2026년 8월 20일 / 판매처 전국 주요 온라인몰 / 가격 19,900원 / 사전예약 3,000건',
    award: '예) 2026 대한민국 친환경대상 / 환경부 주관 / 2026년 7월 / 저탄소 공정 인정',
    event: '예) 2026년 9월 5일 / 서울 코엑스 / 참가 대상 스타트업 200팀 / 목적 투자 매칭',
    interview: '예) 홍길동 대표 / 15년 경력 / “품질이 최고의 마케팅”이라는 철학',
    market: '예) 국내 친환경 포장재 시장 2025년 1.2조원(출처 OO협회) / 전년比 15% 성장',
    social: '예) 지역아동센터 100곳에 물품 기부 / 2026년 8월 / 임직원 봉사 참여',
    etc: '예) 날짜·장소·수치 등 기사에 꼭 필요한 사실'
  };
  // gather 대상 입력 id (article_type=버튼, keywords=2단계 입력)
  var FIELD_IDS = ['company_name', 'summary', 'key_facts', 'emphasis', 'background', 'company_intro', 'rep_name', 'rep_title', 'rep_quote', 'photo_caption', 'photo_source'];
  var MIN = 1300, MAX = 1500;

  var state = { mode: 'ai', type: '', inputs: {}, draft: null, articleId: null, photoName: '' };

  function $(id) { return document.getElementById(id); }
  function val(id) { var el = $(id); return el ? el.value.trim() : ''; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function countChars(t) { return Array.from(String(t == null ? '' : t).replace(/\r\n?/g, '\n').trim()).length; }

  function gather() {
    var o = {};
    FIELD_IDS.forEach(function (id) { o[id] = val(id); });
    o.article_type = state.type || '';
    o.keywords = val('kwEdit');
    state.inputs = o;
    return o;
  }

  function goStep(n) {
    [].forEach.call(document.querySelectorAll('.panel'), function (p) { p.classList.toggle('on', +p.getAttribute('data-panel') === n); });
    [].forEach.call(document.querySelectorAll('.steps li'), function (li) {
      var s = +li.getAttribute('data-step');
      li.classList.toggle('active', s === n);
      li.classList.toggle('done', s < n);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function notice(id, type, html) {
    var el = $(id); if (!el) return;
    if (!html) { el.className = 'notice'; el.innerHTML = ''; return; }
    el.className = 'notice show ' + type; el.innerHTML = html;
  }
  function missingHtml(list, lead) {
    if (!list || !list.length) return esc(lead || '');
    return esc(lead || '') + '<ul>' + list.map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('') + '</ul>';
  }

  /* 키워드 자동 추출(규칙기반) */
  function extractKeywords(o) {
    var kws = [], seen = {};
    function push(w) { w = (w || '').trim(); if (Array.from(w).length < 2 || seen[w] || kws.length >= 6) return; seen[w] = 1; kws.push(w); }
    push(o.company_name);
    var text = [o.summary, o.key_facts, o.emphasis].filter(Boolean).join(' ');
    var toks = text.split(/[\s,.\/·|~()\[\]"'`:;!?0-9%]+/).filter(Boolean);
    var stop = ['그리고', '또는', '그러나', '및', '등', '이번', '관련', '통해', '위해', '대한', '에서', '으로', '한다', '했다', '있다'];
    toks.forEach(function (t) { if (stop.indexOf(t) < 0) push(t); });
    return kws;
  }

  /* 2단계 3분류 */
  function analyze(o) {
    var must = [];
    if (!o.company_name) must.push('기업명');
    if (!o.article_type) must.push('기사 유형');
    if (!o.summary) must.push('기사 한 줄 요약');
    if (!o.key_facts) must.push('반드시 포함할 사실');

    var order = [
      ['기업명', o.company_name],
      ['기사 유형', TYPE_LABEL[o.article_type] || ''],
      ['기사 한 줄 요약', o.summary],
      ['반드시 포함할 사실', o.key_facts],
      ['강조 포인트', o.emphasis],
      ['기사 배경·스토리', o.background],
      ['회사 소개', o.company_intro]
    ];
    var confirmed = order.filter(function (r) { return r[1]; }).map(function (r) { return { label: r[0], value: r[1] }; });
    var who = (o.rep_name + ' ' + o.rep_title).trim();
    if (who) confirmed.push({ label: '관계자', value: who });
    if (o.rep_quote) confirmed.push({ label: '관계자 코멘트', value: o.rep_quote });

    var good = [];
    if (!o.emphasis) good.push('강조 포인트');
    if (!o.background) good.push('기사 배경·스토리');
    if (!o.company_intro) good.push('회사 소개');
    if (!o.rep_quote) good.push('관계자 코멘트');
    if (!o.photo_caption && !state.photoName) good.push('기사 사진');

    return { confirmed: confirmed, good: good, must: must, sufficient: must.length === 0, keywords: extractKeywords(o) };
  }

  function renderReview(a) {
    $('confirmedList').innerHTML = a.confirmed.length
      ? a.confirmed.map(function (c) { return '<li><b>' + esc(c.label) + '</b>' + esc(c.value) + '</li>'; }).join('')
      : '<li class="empty">입력된 정보가 없습니다.</li>';
    $('goodList').innerHTML = a.good.length
      ? a.good.map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('')
      : '<li class="empty">추가할 항목이 없습니다.</li>';
    $('mustList').innerHTML = a.must.length
      ? a.must.map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('')
      : '<li class="empty">모두 확인되었습니다.</li>';

    if (!val('kwEdit')) $('kwEdit').value = a.keywords.join(', '); // 사용자가 수정한 값은 보존

    $('toDraft').disabled = !a.sufficient;
    if (a.sufficient) notice('msg2', 'info', '핵심 정보가 확인되었습니다. 지금 정보로 보도자료를 작성할 수 있습니다. (추가 정보는 선택입니다.)');
    else notice('msg2', 'warn', '‘반드시 확인이 필요한 정보’를 입력한 뒤 다시 진행해 주세요.');
  }

  /* API 호출(타임아웃) */
  function api(path, body) {
    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, 90000);
    return fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify(body), signal: ctrl.signal
    }).then(function (r) {
      clearTimeout(timer);
      return r.json().catch(function () { return null; }).then(function (j) { return { ok: r.ok, status: r.status, json: j }; });
    }).catch(function (e) {
      clearTimeout(timer);
      return { ok: false, status: 0, json: null, aborted: e && e.name === 'AbortError' };
    });
  }

  /* 1단계 → 다음 */
  function toReview() {
    if (state.mode === 'manual') {
      var mt = val('m_title'), mb = $('m_body').value;
      if (!mt) { notice('msgM', 'err', '제목을 입력해 주세요.'); return; }
      if (!mb.trim()) { notice('msgM', 'err', '본문을 입력해 주세요.'); return; }
      notice('msgM', '', '');
      state.inputs = gather();
      state.draft = { title: mt, subtitle: val('m_sub'), body: mb };
      fillEdit();
      goStep(4);
      return;
    }
    var o = gather();
    var miss = [];
    if (!o.company_name) miss.push('기업명');
    if (!o.article_type) miss.push('기사 유형');
    if (!o.summary) miss.push('기사 한 줄 요약');
    if (!o.key_facts) miss.push('반드시 포함할 사실');
    if (miss.length) { notice('msg1', 'err', '다음 핵심 입력이 필요합니다: ' + esc(miss.join(', '))); return; }
    notice('msg1', '', '');
    renderReview(analyze(o));
    goStep(2);
  }

  /* 2단계 → 3단계 : 생성 */
  function toDraft() {
    var o = gather();
    goStep(3);
    $('draftLoading').hidden = false;
    $('draftResult').hidden = true;
    $('regen').hidden = true;
    $('toReviewEdit').hidden = true;
    notice('msg3', '', '');

    api('/api/articles/draft', o).then(function (res) {
      $('draftLoading').hidden = true;
      if (res.aborted) { notice('msg3', 'err', '응답 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.'); $('regen').hidden = false; return; }
      if (res.status === 0) { notice('msg3', 'err', '서버에 연결하지 못했습니다. 네트워크 상태를 확인한 뒤 다시 시도해 주세요.'); $('regen').hidden = false; return; }
      if (!res.json) { notice('msg3', 'err', 'AI 응답을 받지 못했습니다. 다시 시도해 주세요.'); $('regen').hidden = false; return; }
      if (!res.ok) { notice('msg3', 'err', esc(res.json.message || 'AI 보도자료 생성에 실패했습니다. 다시 시도해 주세요.')); $('regen').hidden = false; return; }

      var d = res.json.data || {};
      if (d.needs_more_info) {
        notice('msg3', 'warn', missingHtml(d.missing, res.json.message || '조금 더 정확한 보도자료 작성을 위해 다음 정보가 필요합니다.'));
        return;
      }
      if (!d.body || countChars(d.body) < MIN) {
        notice('msg3', 'warn', '생성된 본문이 충분하지 않습니다. 정보를 보완한 뒤 다시 생성해 주세요.'); $('regen').hidden = false; return;
      }

      state.draft = d; state.articleId = d.article_id || null;
      $('d_title').textContent = d.title || '';
      $('d_sub').textContent = d.subtitle || '';
      $('d_body').textContent = d.body || '';
      $('d_count').textContent = d.char_count != null ? d.char_count : countChars(d.body);
      $('draftResult').hidden = false;
      $('regen').hidden = false;
      $('toReviewEdit').hidden = false;
      notice('msg3', '', '');
    });
  }

  /* 4단계 편집 채우기 */
  function fillEdit() {
    var d = state.draft || {};
    $('e_title').value = d.title || '';
    $('e_sub').value = d.subtitle || '';
    $('e_body').value = d.body || '';
    updateEditCount();
  }
  function updateEditCount() { $('e_count').textContent = countChars($('e_body').value); }

  /* 저장 */
  function saveArticle() {
    var title = val('e_title'), body = $('e_body').value;
    if (!title) { notice('msg4', 'err', '제목을 입력해 주세요.'); return; }
    if (!body.trim()) { notice('msg4', 'err', '본문이 비어 있습니다.'); return; }
    notice('msg4', '', '');
    var btn = $('saveArticle'); btn.disabled = true; btn.textContent = '저장 중…';

    var payload = Object.assign({}, state.inputs, {
      title: title, subtitle: val('e_sub'), body: body,
      source: state.mode === 'manual' ? 'manual' : 'ai'
    });
    api('/api/articles', payload).then(function (res) {
      btn.disabled = false; btn.textContent = '저장하기 →';
      if (res.aborted || res.status === 0) { notice('msg4', 'err', '서버에 연결하지 못했습니다. 저장을 다시 시도해 주세요.'); return; }
      if (!res.ok || !res.json || res.json.status === false) {
        notice('msg4', 'err', esc((res.json && res.json.message) || '저장에 실패했습니다. 다시 시도해 주세요.')); return;
      }
      state.articleId = (res.json.data && res.json.data.article_id) || state.articleId;
      goStep(5);
    });
  }

  /* 작성 방식 전환 */
  function setMode(mode) {
    state.mode = mode;
    [].forEach.call(document.querySelectorAll('#mode .wa-mbtn'), function (b) { b.classList.toggle('on', b.getAttribute('data-mode') === mode); });
    $('aiForm').hidden = mode !== 'ai';
    $('manualForm').hidden = mode !== 'manual';
    $('toReview').textContent = mode === 'manual' ? '다음 : 검수·수정 →' : '다음 : 정보 확인 →';
  }

  /* 기사 유형 선택 → 도움말/예시 변경 */
  function selectType(btn) {
    state.type = btn.getAttribute('data-type');
    [].forEach.call($('typeGrid').children, function (b) { b.classList.toggle('on', b === btn); });
    $('factHelp').textContent = FACT_HELP[state.type] || FACT_HELP.etc;
    $('factEx').textContent = FACT_EX[state.type] || FACT_EX.etc;
  }

  /* 사진 첨부 검증(jpg·png ≤5MB) */
  function onPhoto(e) {
    var f = e.target.files && e.target.files[0];
    var prev = $('photoPrev');
    if (!f) { prev.hidden = true; prev.innerHTML = ''; state.photoName = ''; return; }
    if (['image/png', 'image/jpeg'].indexOf(f.type) < 0) { notice('msg1', 'err', '사진은 jpg·png 형식만 첨부할 수 있습니다.'); e.target.value = ''; return; }
    if (f.size > 5 * 1024 * 1024) { notice('msg1', 'err', '사진은 5MB 이하만 첨부할 수 있습니다.'); e.target.value = ''; return; }
    state.photoName = f.name;
    var url = URL.createObjectURL(f);
    prev.hidden = false;
    prev.innerHTML = '<img src="' + url + '" alt="첨부 사진 미리보기"><div class="pf">' + esc(f.name) + ' · ' + Math.round(f.size / 1024) + 'KB</div>';
    notice('msg1', '', '');
  }

  function bind() {
    [].forEach.call(document.querySelectorAll('#mode .wa-mbtn'), function (b) {
      b.addEventListener('click', function () { setMode(b.getAttribute('data-mode')); });
    });
    $('typeGrid').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) selectType(b); });
    $('photo').addEventListener('change', onPhoto);

    $('toReview').addEventListener('click', toReview);
    $('toDraft').addEventListener('click', toDraft);
    $('toReviewEdit').addEventListener('click', function () { fillEdit(); goStep(4); });
    $('regen').addEventListener('click', toDraft);
    $('saveArticle').addEventListener('click', saveArticle);
    $('saveAgain').addEventListener('click', function () { goStep(4); });
    $('e_body').addEventListener('input', updateEditCount);
    $('backFromEdit').addEventListener('click', function () { goStep(state.mode === 'manual' ? 1 : 3); });

    [].forEach.call(document.querySelectorAll('[data-go]'), function (b) {
      b.addEventListener('click', function () {
        var n = +b.getAttribute('data-go');
        if (n === 2) renderReview(analyze(gather()));
        goStep(n);
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind); else bind();
})();
