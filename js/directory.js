/* ============================================================
   미디어 디렉토리 — 목록/검색/필터/정렬/관심/비교
   데이터 소스: /api/media 우선, 없으면 data/media.json (정적 확인용)
   실제 데이터가 있는 항목(업종·노출채널·가격)만 필터로 노출
   관심·비교는 1차에서 localStorage (로그인 서버 연동은 후속)
   ============================================================ */
(function () {
  'use strict';

  var FAV_KEY = 'prcome_media_fav', CMP_KEY = 'prcome_media_cmp';
  var fav = load(FAV_KEY), cmp = load(CMP_KEY);
  var ALL = [], CATS = [], cache = {};
  var state = { q: '', category: '', channel: '', price_min: '', price_max: '', sort: '' };

  function load(k) { try { return JSON.parse(localStorage.getItem(k) || '[]'); } catch (e) { return []; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function won(n) { return n == null ? '-' : Number(n).toLocaleString('ko-KR') + '원~'; }

  /* 데이터 로드: 정적 json + (있으면) API */
  function boot() {
    var staticP = fetch('data/media.json').then(function (r) { return r.json(); }).catch(function () { return { items: [], categories: [] }; });
    var apiP = fetch('/api/media', { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
      .then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
    Promise.all([staticP, apiP]).then(function (arr) {
      var s = arr[0], api = arr[1];
      CATS = s.categories || [];
      ALL = (api && api.status && api.data && api.data.items) ? api.data.items : (s.items || []);
      ALL.forEach(function (o) { cache[o.id] = o; });
      renderChips(); apply(); renderCmpBar(); bind();
    });
  }

  function renderChips() {
    var box = document.getElementById('catChips');
    box.innerHTML = '<button class="on" data-cat="">전체</button>' + CATS.map(function (c) {
      return '<button data-cat="' + esc(c.name) + '">' + esc(c.name) + '<span class="c">' + c.cnt + '</span></button>';
    }).join('');
  }

  /* 클라이언트 필터·정렬 */
  function apply() {
    var q = state.q.toLowerCase();
    var list = ALL.filter(function (o) {
      if (q && o.name.toLowerCase().indexOf(q) < 0) return false;
      if (state.category && (o.categories || []).indexOf(state.category) < 0) return false;
      if (state.channel && (!o.channel || o.channel.indexOf(state.channel) < 0)) return false;
      if (state.price_min !== '' && (o.min_price == null || o.min_price < +state.price_min)) return false;
      if (state.price_max !== '' && (o.min_price == null || o.min_price > +state.price_max)) return false;
      return true;
    });
    switch (state.sort) {
      case 'price_asc':  list.sort(function (a, b) { return (a.min_price || 0) - (b.min_price || 0); }); break;
      case 'price_desc': list.sort(function (a, b) { return (b.min_price || 0) - (a.min_price || 0); }); break;
      case 'name':       list.sort(function (a, b) { return a.name.localeCompare(b.name, 'ko'); }); break;
    }
    document.getElementById('dcount').innerHTML = '검색 결과 <b>' + list.length + '</b>개';
    var el = document.getElementById('mlist');
    el.innerHTML = list.length ? list.map(card).join('') : '<div class="mempty">조건에 맞는 언론사가 없습니다.</div>';
  }

  function logoHtml(o) {
    if (o.logo_path) return '<img src="' + esc(o.logo_path) + '" alt="' + esc(o.name) + ' 로고" onerror="this.parentNode.textContent=this.alt.charAt(0)">';
    return esc(o.name.charAt(0));
  }

  /* 노출채널 문자열 → 실제 채널값 배열 (임의 생성 없음) */
  function chanList(ch) {
    if (!ch) return [];
    var names = ['네이버', '다음', '네이트'];
    var found = names.filter(function (n) { return ch.indexOf(n) > -1; });
    return found.length ? found : [ch]; // 매칭 없으면 원문 그대로
  }
  /* 라벨 + 짧은 텍스트 한 줄 */
  function metaRow(label, text) {
    return '<li><span class="mi">' + label + '</span><span class="mv">' + text + '</span></li>';
  }

  function card(o) {
    var cats = o.categories || [];
    var chans = chanList(o.channel);
    var isFav = fav.indexOf(o.id) > -1, isCmp = cmp.indexOf(o.id) > -1;

    // 실제 보유 항목만 한 줄 텍스트로, 없는 줄은 숨김
    var meta = '';
    if (chans.length)   meta += metaRow('채널', esc(chans.join(' · ')));
    if (cats.length)    meta += metaRow('업종', esc(cats.join(' · ')));
    if (o.report_field) meta += metaRow('분야', esc(o.report_field));

    // 언론사명 아래 한 줄 설명/분류: DB 실제 값이 있을 때만(임의 생성 금지)
    var descText = o.description || o.type || '';
    var desc = descText ? '<p class="mc-desc">' + esc(descText) + '</p>' : '';

    return '<article class="mcard2" data-id="' + o.id + '">' +
      '<button class="fav' + (isFav ? ' on' : '') + '" data-fav="' + o.id + '" title="관심 언론사">' + (isFav ? '♥' : '♡') + '</button>' +
      '<div class="mc-logo">' + logoHtml(o) + '</div>' +
      '<div class="mc-body">' +
        '<a class="mc-name" href="media-detail.html?id=' + o.id + '">' + esc(o.name) + '</a>' +
        desc +
        (meta ? '<ul class="mc-meta">' + meta + '</ul>' : '') +
        '<div class="mc-actions">' +
          '<a class="btn ghost" href="media-detail.html?id=' + o.id + '">상세보기</a>' +
          '<a class="btn primary" href="press.html?media=' + o.id + '">이 언론사로 진행</a>' +
          '<button class="btn ghost cmp' + (isCmp ? ' on' : '') + '" data-cmp="' + o.id + '">비교</button>' +
        '</div>' +
      '</div>' +
    '</article>';
  }

  function toggleFav(id) { var i = fav.indexOf(id); if (i > -1) fav.splice(i, 1); else fav.push(id); save(FAV_KEY, fav); }
  function toggleCmp(id) {
    var i = cmp.indexOf(id);
    if (i > -1) { cmp.splice(i, 1); }
    else { if (cmp.length >= 3) { alert('비교는 최대 3개까지 가능합니다.'); return false; } cmp.push(id); }
    save(CMP_KEY, cmp); return true;
  }
  function renderCmpBar() {
    var bar = document.getElementById('cmpBar');
    if (!cmp.length) { bar.classList.remove('on'); return; }
    bar.classList.add('on');
    document.getElementById('cmpItems').innerHTML = cmp.map(function (id) {
      var o = cache[id]; return '<span class="ci">' + esc(o ? o.name : ('#' + id)) + '<b data-rmcmp="' + id + '">✕</b></span>';
    }).join('');
    document.getElementById('cmpGo').disabled = cmp.length < 2;
  }
  function openCompare() {
    var chosen = cmp.map(function (id) { return cache[id]; }).filter(Boolean);
    if (chosen.length < 2) return;
    var fields = [
      ['적합 업종', function (o) { return esc((o.categories || []).join(', ') || '-'); }],
      ['노출채널', function (o) { return o.channel ? esc(o.channel) : '-'; }],
      ['예상 금액', function (o) { return won(o.min_price) + ' <small>(VAT 별도)</small>'; }]
    ];
    var html = '<table class="cmptable"><tr><th>항목</th>' + chosen.map(function (o) { return '<td><b>' + esc(o.name) + '</b></td>'; }).join('') + '</tr>';
    fields.forEach(function (f) { html += '<tr><th>' + f[0] + '</th>' + chosen.map(function (o) { return '<td>' + f[1](o) + '</td>'; }).join('') + '</tr>'; });
    html += '</table>';
    document.getElementById('cmpBody').innerHTML = html;
    document.getElementById('cmpModal').classList.add('on');
  }

  function bind() {
    var t;
    document.getElementById('q').addEventListener('input', function (e) {
      clearTimeout(t); var v = e.target.value; t = setTimeout(function () { state.q = v.trim(); apply(); }, 200);
    });
    document.getElementById('sort').addEventListener('change', function (e) { state.sort = e.target.value; apply(); });
    document.getElementById('catChips').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      state.category = b.getAttribute('data-cat');
      [].forEach.call(this.children, function (x) { x.classList.toggle('on', x === b); }); apply();
    });
    document.getElementById('chanChips').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      state.channel = b.getAttribute('data-chan');
      [].forEach.call(this.children, function (x) { x.classList.toggle('on', x === b); }); apply();
    });
    document.getElementById('mlist').addEventListener('click', function (e) {
      var f = e.target.closest('[data-fav]'), c = e.target.closest('[data-cmp]');
      if (f) { var id = +f.getAttribute('data-fav'); toggleFav(id); f.classList.toggle('on'); f.textContent = fav.indexOf(id) > -1 ? '♥' : '♡'; }
      else if (c) { var cid = +c.getAttribute('data-cmp'); if (toggleCmp(cid) !== false) { c.classList.toggle('on'); renderCmpBar(); } }
    });
    document.getElementById('cmpItems').addEventListener('click', function (e) {
      var r = e.target.closest('[data-rmcmp]'); if (!r) return;
      var id = +r.getAttribute('data-rmcmp'); toggleCmp(id);
      var btn = document.querySelector('[data-cmp="' + id + '"]'); if (btn) btn.classList.remove('on');
      renderCmpBar();
    });
    document.getElementById('cmpGo').addEventListener('click', openCompare);
    document.getElementById('cmpX').addEventListener('click', function () { document.getElementById('cmpModal').classList.remove('on'); });
    document.getElementById('cmpModal').addEventListener('click', function (e) { if (e.target === this) this.classList.remove('on'); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
