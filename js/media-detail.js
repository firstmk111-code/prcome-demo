/* 언론사 상세 — /api/media/{id} 우선, 없으면 data/media.json
   미확보(NULL) 항목은 '정보 확인 필요' 반복 대신 표시 생략, 하단 안내 1줄로 처리 */
(function () {
  'use strict';
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function won(n) { return n == null ? '-' : Number(n).toLocaleString('ko-KR') + '원'; }

  var id = new URLSearchParams(location.search).get('id');
  var root = document.getElementById('detail');
  if (!id) { root.innerHTML = '<p class="mempty">잘못된 접근입니다.</p>'; return; }

  fetch('/api/media/' + encodeURIComponent(id), { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
    .then(function (r) { if (!r.ok) throw 0; return r.json(); })
    .then(function (res) { if (!res.status || !res.data) throw 0; return res.data; })
    .catch(function () {
      return fetch('data/media.json').then(function (r) { return r.json(); })
        .then(function (j) { return (j.items || []).filter(function (o) { return String(o.id) === String(id); })[0]; });
    })
    .then(function (o) { if (!o) { root.innerHTML = '<p class="mempty">언론사를 찾을 수 없습니다.</p>'; return; } render(o); })
    .catch(function () { root.innerHTML = '<p class="mempty">데이터를 불러오지 못했습니다.</p>'; });

  function logo(o, cls) {
    if (o.logo_path) return '<span class="' + cls + '"><img src="' + esc(o.logo_path) + '" alt="' + esc(o.name) + '" onerror="this.parentNode.textContent=this.alt.charAt(0)"></span>';
    return '<span class="' + cls + '">' + esc(o.name.charAt(0)) + '</span>';
  }
  function item(k, v) { return '<div class="d-item"><div class="k">' + k + '</div><div class="v">' + v + '</div></div>'; }

  function render(o) {
    document.title = o.name + ' — 미디어 디렉토리 | PRCOME';
    var cats = (o.prices || []).map(function (p) { return p.category; }).filter(function (v, i, a) { return v && a.indexOf(v) === i; });
    if (!cats.length) cats = o.categories || [];

    // 데이터 있는 항목만 카드로
    var grid = '';
    grid += item('적합 업종', esc(cats.join(', ')));
    if (o.channel) grid += item('노출채널 · 포털 제휴', esc(o.channel));
    if (o.min_price != null) grid += item('예상 금액', won(o.min_price) + '~ <small style="color:var(--sub-2)">(VAT 별도)</small>');
    if (o.report_field) grid += item('주요 보도 분야', esc(o.report_field));
    if (o.lead_time) grid += item('예상 소요 기간', esc(o.lead_time));
    if (o.region) grid += item('지역', esc(o.region));
    grid += item('보도자료 준비 상태', '작성 전 — <a href="write-ai.html?media=' + o.id + '" style="color:var(--pt);font-weight:700">보도자료 작성</a>에서 준비');

    var priceRows = (o.prices || []).map(function (p) {
      return '<tr><td>' + esc(p.category || '-') + '</td><td class="p">' + won(p.price) + '</td><td>' + (p.note ? esc(p.note) : '-') + '</td></tr>';
    }).join('') || '<tr><td colspan="3">단가 정보 준비 중</td></tr>';

    var similar = (o.similar || []).map(function (s) {
      return '<a href="media-detail.html?id=' + s.id + '">' + logo(s, 'lg') + '<span class="nm">' + esc(s.name) + '</span></a>';
    }).join('');

    root.innerHTML =
      '<div class="crumb" style="font-size:12.5px;color:var(--sub);margin-bottom:12px"><a href="index.html">홈</a> / <a href="directory.html">미디어 디렉토리</a> / ' + esc(o.name) + '</div>' +
      '<div class="d-hero">' + logo(o, 'lg') +
        '<div class="ht"><h1>' + esc(o.name) + '</h1><div class="cls">' + esc(cats.join(', ')) + '</div></div>' +
        '<div class="pr">' + won(o.min_price) + '~ <small>VAT 별도</small></div>' +
      '</div>' +
      '<div class="d-actions">' +
        '<a class="pri" href="press.html?media=' + o.id + '">언론홍보 신청</a>' +
        '<a class="gh" href="write-ai.html?media=' + o.id + '">보도자료 작성</a>' +
      '</div>' +
      '<div class="d-grid">' + grid + '</div>' +
      '<div class="d-sec"><h2>업종별 예상 금액 · 진행 참고사항</h2>' +
        '<table class="pricetbl"><tr><th>업종</th><th>예상 금액</th><th>진행 참고사항</th></tr>' + priceRows + '</table>' +
        '<p class="d-note">※ 기사 유형·기명 여부에 따라 금액이 달라질 수 있으며, 상세 조건·최종 금액은 로그인 후 언론홍보 신청 단계에서 확인됩니다.</p>' +
      '</div>' +
      (similar ? '<div class="d-sec"><h2>유사 언론사</h2><div class="similar">' + similar + '</div></div>' : '') +
      '<p class="d-note">주요 보도 분야·예상 소요 기간 등 일부 항목은 데이터 확보 후 순차 제공됩니다. PRCOME 안에서 정보를 확인한 뒤 보도자료 작성·언론홍보 신청으로 이어가세요.</p>';
  }
})();
