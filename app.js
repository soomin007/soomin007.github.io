/* games.js 의 GAMES 를 읽어 피처드 캐러셀과 그리드를 그린다.
   기기(터치/키보드)와 유입 경로(인스타·깃허브 등)에 따라 정렬·안내가 달라진다. */

(function () {
  "use strict";

  var feature = document.getElementById("feature");
  var grid = document.getElementById("grid");
  var storeCount = document.getElementById("storeCount");
  var ctxBanner = document.getElementById("ctxBanner");

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isTouch = window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 1;

  /* ---------- 유입 경로 감지 ---------- */

  function detectSource() {
    var from = new URLSearchParams(location.search).get("from");
    var ref = document.referrer || "";
    if (from) return from;
    if (/instagram\.|threads\./.test(ref)) return "insta";
    if (/github\./.test(ref)) return "github";
    if (/itch\.io/.test(ref)) return "itch";
    return "";
  }

  var source = detectSource();

  var CTX_LINES = {
    insta: "<strong>인스타에서 오셨네요.</strong> 전부 무료고, 설치 없이 눌러서 바로 열립니다. '폰 OK' 표시가 폰으로 하기 좋은 게임이에요.",
    github: "<strong>GitHub에서 오셨네요.</strong> 모든 게임의 소스가 공개돼 있습니다. 각 카드의 '소스'를 눌러보세요.",
    itch: "<strong>itch.io에서 오셨네요.</strong> 여기 있는 게임은 전부 브라우저에서 바로 돌아갑니다."
  };

  if (CTX_LINES[source]) {
    ctxBanner.hidden = false;
    ctxBanner.innerHTML = '<div class="ctx__inner">' + CTX_LINES[source] + "</div>";
  }

  /* ---------- 정렬: 터치 기기에선 폰으로 되는 게임 먼저 ---------- */

  var games = GAMES.slice();
  if (isTouch) {
    games.sort(function (a, b) { return (b.mobile ? 1 : 0) - (a.mobile ? 1 : 0); });
  }

  /* ---------- 헬퍼 ---------- */

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }

  function darkText(hex) {
    var r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) > 150;
  }

  function extLink(href, label, cls) {
    var a = el("a", cls, label);
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener";
    return a;
  }

  function deviceChip(g) {
    return g.mobile ? el("span", "chip chip--ok", "폰 OK") : el("span", "chip chip--warn", "키보드 필요");
  }

  function playLabel(g) {
    return g.status === "wip" ? "지금까지 만든 것 보기" : "바로 플레이";
  }

  /* ---------- 피처드 캐러셀 ---------- */

  var current = 0;
  var timer = null;

  function buildFeature() {
    feature.innerHTML = "";
    var g = games[current];

    feature.style.setProperty("--tone", g.color);
    document.querySelector(".bar__tld").style.color = g.color;

    var frame = el("div", "feature__frame");

    var media = el("a", "feature__media");
    media.href = g.links.play;
    media.target = "_blank";
    media.rel = "noopener";
    media.setAttribute("aria-label", g.title + " " + playLabel(g));
    var img = el("img");
    img.src = g.img;
    img.alt = g.title + " 게임 화면";
    media.appendChild(img);
    frame.appendChild(media);

    var info = el("div", "feature__info");
    info.appendChild(el("p", "feature__kicker", g.kicker + " · " + g.year));
    info.appendChild(el("h1", "feature__title", g.title));
    info.appendChild(el("p", "feature__line", g.line));
    if (g.note) info.appendChild(el("p", "feature__note", "⚠ " + g.note));

    var chips = el("div", "feature__chips");
    if (g.first) chips.appendChild(el("span", "chip chip--first", "처음이라면 이 게임"));
    if (g.status === "wip") chips.appendChild(el("span", "chip", "앞서 해보기"));
    g.meta.forEach(function (m) { chips.appendChild(el("span", "chip", m)); });
    chips.appendChild(deviceChip(g));
    info.appendChild(chips);

    var acts = el("div", "feature__acts");
    var play = extLink(g.links.play, playLabel(g), "btn btn--play");
    play.style.color = darkText(g.color) ? "#0e141b" : "#ffffff";
    acts.appendChild(play);
    if (g.links.itch) acts.appendChild(extLink(g.links.itch, "itch.io", "btn"));
    if (g.links.code) acts.appendChild(extLink(g.links.code, "소스", "btn"));
    info.appendChild(acts);

    frame.appendChild(info);
    feature.appendChild(frame);

    /* 좌우 화살표 + 게임색 점 */
    var rail = el("div", "feature__rail");
    var prev = el("button", "feature__arrow", "←");
    prev.setAttribute("aria-label", "이전 게임");
    prev.addEventListener("click", function () { go(current - 1, true); });
    rail.appendChild(prev);

    var dots = el("div", "feature__dots");
    games.forEach(function (gg, i) {
      var d = el("button", "dot");
      d.setAttribute("aria-label", gg.title + " 보기");
      d.style.setProperty("--dot-tone", gg.color);
      if (i === current) d.setAttribute("aria-current", "true");
      d.addEventListener("click", function () { go(i, true); });
      dots.appendChild(d);
    });
    rail.appendChild(dots);

    var next = el("button", "feature__arrow", "→");
    next.setAttribute("aria-label", "다음 게임");
    next.addEventListener("click", function () { go(current + 1, true); });
    rail.appendChild(next);

    feature.appendChild(rail);
  }

  function go(i, manual) {
    current = (i + games.length) % games.length;
    buildFeature();
    if (manual) restartTimer();
  }

  function restartTimer() {
    if (timer) clearInterval(timer);
    if (reducedMotion) return;
    timer = setInterval(function () { go(current + 1, false); }, 6500);
  }

  /* 스와이프 */
  var touchX = null;
  feature.addEventListener("touchstart", function (e) { touchX = e.touches[0].clientX; }, { passive: true });
  feature.addEventListener("touchend", function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) go(current + (dx < 0 ? 1 : -1), true);
    touchX = null;
  }, { passive: true });

  /* ---------- 그리드 ---------- */

  function buildGrid() {
    games.forEach(function (g) {
      var card = el("article", "card");
      card.id = g.id;
      card.style.setProperty("--tone", g.color);

      var mediaLink = el("a", "card__mediaLink");
      mediaLink.href = g.links.play;
      mediaLink.target = "_blank";
      mediaLink.rel = "noopener";
      mediaLink.setAttribute("aria-label", g.title + " " + playLabel(g));
      var img = el("img", "card__media");
      img.src = g.img;
      img.alt = g.title + " 게임 화면";
      img.loading = "lazy";
      mediaLink.appendChild(img);
      if (g.status === "wip") mediaLink.appendChild(el("span", "ribbon", "앞서 해보기"));
      else if (g.first) mediaLink.appendChild(el("span", "ribbon", "처음이라면"));
      card.appendChild(mediaLink);

      var body = el("div", "card__body");
      body.appendChild(el("p", "card__kicker", g.kicker));
      body.appendChild(el("h3", "card__title", g.title));
      body.appendChild(el("p", "card__line", g.line));

      var chips = el("div", "card__chips");
      g.meta.slice(0, 3).forEach(function (m) { chips.appendChild(el("span", "chip", m)); });
      chips.appendChild(deviceChip(g));
      body.appendChild(chips);

      var foot = el("div", "card__foot");
      foot.appendChild(el("span", "price", "무료 · 브라우저"));
      var acts = el("div", "card__acts");
      if (g.links.code) acts.appendChild(extLink(g.links.code, "소스", "mini"));
      if (g.links.itch) acts.appendChild(extLink(g.links.itch, "itch", "mini"));
      var play = extLink(g.links.play, "플레이", "mini mini--play");
      play.style.color = darkText(g.color) ? "#0e141b" : "#ffffff";
      acts.appendChild(play);
      foot.appendChild(acts);
      body.appendChild(foot);

      card.appendChild(body);
      grid.appendChild(card);
    });

    storeCount.textContent = games.length + "개 · 전부 무료";
  }

  /* ---------- 시작 ---------- */

  buildFeature();
  buildGrid();
  restartTimer();
})();
