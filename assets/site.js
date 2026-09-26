/* Generated site behaviour: mobile menu and client side search. No tracking,
   no service worker, no framework. */
(function () {
  var base = (document.body.getAttribute('data-base') || '').replace(/\/$/, '');
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var form = document.getElementById('search-form');
  if (!form) return;
  var input = document.getElementById('q');
  var status = document.getElementById('search-status');
  var results = document.getElementById('search-results');
  var index = [];

  fetch(base + '/search-index.json').then(function (r) { return r.json(); }).then(function (data) {
    index = data;
    status.textContent = index.length + ' pages indexed. Type to search.';
    var q = new URLSearchParams(location.search).get('q');
    if (q) { input.value = q; run(q); }
  }).catch(function () { status.textContent = 'Search index unavailable.'; });

  function run(query) {
    var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) { results.innerHTML = ''; return; }
    var hits = index.map(function (item) {
      var hay = (item.t + ' ' + item.d + ' ' + item.k + ' ' + item.c).toLowerCase();
      var score = 0;
      terms.forEach(function (t) {
        if (hay.indexOf(t) !== -1) score += 1;
        if (item.t.toLowerCase().indexOf(t) !== -1) score += 2;
      });
      return { item: item, score: score };
    }).filter(function (h) { return h.score > 0; })
      .sort(function (a, b) { return b.score - a.score; })
      .slice(0, 40);
    status.textContent = hits.length + ' result' + (hits.length === 1 ? '' : 's') + ' for "' + query + '"';
    results.innerHTML = hits.map(function (h) {
      return '<article class="search-hit"><h3><a href="' + h.item.u + '">' + esc(h.item.t) +
        '</a></h3><p class="muted">' + esc(h.item.d) + '</p></article>';
    }).join('');
  }

  function esc(s) {
    return String(s || '').replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  form.addEventListener('submit', function (e) { e.preventDefault(); run(input.value); });
  input.addEventListener('input', function () { if (input.value.length > 2) run(input.value); });
})();
