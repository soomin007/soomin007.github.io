/* games.js 의 GAMES 를 읽어 홈(피처드+그리드)과 게임별 테마 상세 페이지를 그린다.
   라우팅: #g/<id> = 상세, 해시 없음 = 홈. 클로드 디자인 v3 시안의 바닐라 이식. */

(function () {
  "use strict";

  var home = document.getElementById("home");
  var detail = document.getElementById("detail");
  var feat = document.getElementById("feat");
  var dotsBox = document.getElementById("dots");
  var grid = document.getElementById("grid");
  var ctxBanner = document.getElementById("ctxBanner");
  var orderNote = document.getElementById("orderNote");
  var brandEyebrow = document.getElementById("brandEyebrow");

  var HOME_TITLE = document.title;
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isTouch = window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 1;

  var THEMES = { enigma: "t-enigma", sand: "t-sand", bee: "t-bee", hud: "t-hud", eco: "t-eco" };

  /* ---------- 헬퍼 ---------- */

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }

  function hexA(hex, a) {
    var n = parseInt(hex.slice(1), 16);
    return "rgba(" + (n >> 16 & 255) + "," + (n >> 8 & 255) + "," + (n & 255) + "," + a + ")";
  }

  function extLink(href, label, cls) {
    var a = el("a", cls, label);
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener";
    return a;
  }

  /* ---------- 정렬: 터치 기기에선 폰으로 되는 게임 먼저 ---------- */

  var games = GAMES.slice();
  if (isTouch) {
    games.sort(function (a, b) { return (b.mobile ? 1 : 0) - (a.mobile ? 1 : 0); });
  }

  brandEyebrow.textContent = "GAMES · " + games.length + " TITLES · ALL FREE";
  orderNote.textContent = isTouch ? "모바일 지원 게임 우선 표시" : "총 " + games.length + "개 게임";

  /* ---------- 유입 경로 배너 ---------- */

  function detectSource() {
    var from = new URLSearchParams(location.search).get("from");
    var ref = document.referrer || "";
    if (from) return from;
    if (/instagram\.|threads\./.test(ref)) return "insta";
    if (/github\./.test(ref)) return "github";
    if (/itch\.io/.test(ref)) return "itch";
    return "";
  }

  var CTX_LINES = {
    insta: ["인스타그램에서 방문해 주셔서 감사합니다", "모든 게임은 무료이며, 설치 없이 브라우저에서 바로 플레이하실 수 있습니다."],
    github: ["GitHub에서 방문해 주셔서 감사합니다", "모든 게임의 소스 코드가 공개되어 있습니다."],
    itch: ["itch.io에서 방문해 주셔서 감사합니다", "직접 만든 게임들을 이곳에 모아 두었습니다."]
  };
  var src = CTX_LINES[detectSource()];
  if (src) {
    ctxBanner.hidden = false;
    ctxBanner.appendChild(el("strong", null, src[0]));
    ctxBanner.appendChild(el("span", null, src[1]));
  }

  /* ---------- 피처드 캐러셀 ---------- */

  var current = 0;
  var timer = null;

  function renderFeat() {
    var g = games[current];
    /* innerHTML 재생성 전에 캐러셀 안 포커스를 기억해 뒀다가 복원 (키보드 연타 유지) */
    var ae = document.activeElement;
    var refocus = null;
    if (feat.contains(ae)) {
      refocus = ae.classList.contains("feat__nav--prev") ? ".feat__nav--prev"
        : ae.classList.contains("feat__nav--next") ? ".feat__nav--next"
        : ".feat__link";
    }
    feat.innerHTML = "";
    feat.style.boxShadow = "0 0 0 1px " + hexA(g.color, 0.45) + ", 0 26px 70px -18px " + hexA(g.color, 0.35);
    home.style.background = "radial-gradient(1100px 650px at 20% -10%, " + hexA(g.color, 0.15) + ", transparent 60%), #0b0c0f";

    var img = el("img", "feat__art");
    img.src = g.img;
    img.alt = g.title + " 게임 화면";
    feat.appendChild(img);

    var link = el("a", "feat__link");
    link.href = g.page || ("#g/" + g.id);
    link.setAttribute("aria-label", g.title + " 자세히 보기");
    feat.appendChild(link);

    var scrim = el("div", "feat__scrim");
    var info = el("div", "feat__info");
    var kicker = el("p", "feat__kicker", g.kicker);
    kicker.style.color = g.color;
    info.appendChild(kicker);
    info.appendChild(el("h1", "feat__title", g.title));
    info.appendChild(el("p", "feat__line", g.line));
    var cta = el("div", "feat__cta");
    var btn = el("span", "feat__btn", "자세히 보기");
    btn.style.background = g.color;
    cta.appendChild(btn);
    cta.appendChild(el("span", "feat__free", "무료 · 브라우저 · 설치 없음"));
    info.appendChild(cta);
    scrim.appendChild(info);
    feat.appendChild(scrim);

    var prev = el("button", "feat__nav feat__nav--prev", "‹");
    prev.setAttribute("aria-label", "이전 게임");
    prev.addEventListener("click", function () { go(current - 1, true); });
    feat.appendChild(prev);

    var next = el("button", "feat__nav feat__nav--next", "›");
    next.setAttribute("aria-label", "다음 게임");
    next.addEventListener("click", function () { go(current + 1, true); });
    feat.appendChild(next);

    renderDots();
    if (refocus) {
      var rb = feat.querySelector(refocus);
      if (rb) rb.focus({ preventScroll: true });
    }
  }

  function renderDots() {
    var focusIdx = Array.prototype.indexOf.call(dotsBox.children, document.activeElement);
    dotsBox.innerHTML = "";
    games.forEach(function (g, i) {
      var d = el("button", "dot");
      d.setAttribute("aria-label", g.title + " 보기");
      if (i === current) {
        d.setAttribute("aria-current", "true");
        d.style.setProperty("--dotc", g.color);
      }
      d.addEventListener("click", function () { go(i, true); });
      dotsBox.appendChild(d);
    });
    if (focusIdx >= 0 && dotsBox.children[focusIdx]) {
      dotsBox.children[focusIdx].focus({ preventScroll: true });
    }
  }

  function go(i, manual) {
    current = (i + games.length) % games.length;
    renderFeat();
    if (manual) restartTimer();
  }

  function stopTimer() {
    if (timer) { clearInterval(timer); timer = null; }
  }

  function restartTimer() {
    stopTimer();
    if (reducedMotion) return;
    timer = setInterval(function () {
      if (!detailOpen) go(current + 1, false);
    }, 6500);
  }

  /* 마우스가 올라가 있거나 키보드 포커스가 캐러셀 안에 있는 동안은 자동 회전 정지 */
  [feat, dotsBox].forEach(function (zone) {
    zone.addEventListener("mouseenter", stopTimer);
    zone.addEventListener("mouseleave", restartTimer);
    zone.addEventListener("focusin", stopTimer);
    zone.addEventListener("focusout", restartTimer);
  });

  var touchX = null;
  feat.addEventListener("touchstart", function (e) { touchX = e.touches[0].clientX; }, { passive: true });
  feat.addEventListener("touchend", function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 45) go(current + (dx < 0 ? 1 : -1), true);
    touchX = null;
  }, { passive: true });

  /* ---------- 그리드 ---------- */

  games.forEach(function (g) {
    var card = el("a", "gcard");
    card.href = g.page || ("#g/" + g.id);
    card.style.setProperty("--tone40", hexA(g.color, 0.4));

    var media = el("div", "gcard__media");
    var img = el("img");
    img.src = g.img;
    img.alt = ""; /* 링크 텍스트에 제목이 이미 있어 alt 는 비운다 (중복 낭독 방지) */
    img.loading = "lazy";
    media.appendChild(img);
    if (g.status === "wip") {
      var wip = el("span", "badge badge--wip", "앞서 해보기");
      wip.style.background = g.color;
      media.appendChild(wip);
    } else if (g.first) {
      var first = el("span", "badge badge--first", "입문 추천");
      first.style.color = g.color;
      first.style.border = "1px solid " + hexA(g.color, 0.4);
      media.appendChild(first);
    }
    if (!g.mobile) media.appendChild(el("span", "badge badge--kbd", "키보드 필요"));
    card.appendChild(media);

    var body = el("div", "gcard__body");
    var head = el("div", "gcard__head");
    head.appendChild(el("span", "gcard__title", g.title));
    var kick = el("span", "gcard__kicker", g.kicker);
    kick.style.color = g.color;
    head.appendChild(kick);
    body.appendChild(head);

    var short = g.line.length > 58 ? g.line.slice(0, 57).replace(/\s+\S*$/, "") + "…" : g.line;
    body.appendChild(el("p", "gcard__line", short));

    var foot = el("div", "gcard__foot");
    var chips = el("div", "gcard__chips");
    g.meta.slice(0, 3).forEach(function (m) { chips.appendChild(el("span", null, m)); });
    foot.appendChild(chips);
    var open = el("span", "gcard__go", "자세히 보기 ›");
    open.style.color = g.color;
    foot.appendChild(open);
    body.appendChild(foot);

    card.appendChild(body);
    grid.appendChild(card);
  });

  /* ---------- 상세 페이지 ---------- */

  var SHOT_HEADS = {
    enigma: "첨부 · 증거 사진",
    sand: "원정 기록",
    bee: "벌집 앨범",
    hud: "감시 화면",
    eco: "표본 도판"
  };

  var teaserCleanup = null;
  var revealObs = null;

  /* 상세를 떠나거나 다시 그릴 때 타이머·raf·옵저버를 정리한다 */
  function cleanupDetailFx() {
    if (teaserCleanup) { teaserCleanup(); teaserCleanup = null; }
    if (revealObs) { revealObs.disconnect(); revealObs = null; }
  }

  function shotsFor(g) {
    if (!g.shots || !g.shots.length) return null;
    var sec = el("section", "d__shots");
    sec.appendChild(el("h2", "d__shots-head", SHOT_HEADS[g.theme] || "장면들"));
    var wrap = el("div", "d__shots-grid");
    g.shots.forEach(function (s, i) {
      var fig = el("figure", "d__shot rev");
      if (g.theme === "hud") {
        var bar = el("div", "d__shot-bar");
        bar.appendChild(el("span", null, "CAM-0" + (i + 1)));
        bar.appendChild(el("span", "d__shot-rec", "● REC"));
        fig.appendChild(bar);
      } else if (g.theme === "eco") {
        fig.appendChild(el("div", "d__shot-bar", "표본 기록 " + String(i + 1).padStart(2, "0")));
      }
      var img = el("img");
      img.src = s.src;
      img.alt = ""; /* 설명은 figcaption 이 맡는다 */
      img.loading = "lazy";
      fig.appendChild(img);
      var prefix = g.theme === "enigma" ? "증거 사진 №" + (i + 1) + " · " : "";
      fig.appendChild(el("figcaption", null, prefix + s.cap));
      wrap.appendChild(fig);
    });
    sec.appendChild(wrap);
    return sec;
  }

  function teaserFor(g) {
    var t = window.TEASERS && window.TEASERS[g.id];
    if (!t) return null;
    var sec = el("section", "d__teaser rev");
    sec.appendChild(el("h2", "d__teaser-head", t.title));
    var body = el("div", "d__teaser-body");
    sec.appendChild(body);
    teaserCleanup = t.make(body, g, reducedMotion) || null;
    return sec;
  }

  /* 스크롤 등장 연출: .rev 요소가 뷰포트에 들어오면 .rev-in */
  function armReveals() {
    var nodes = detail.querySelectorAll(".rev");
    if (reducedMotion || !("IntersectionObserver" in window)) {
      nodes.forEach(function (n) { n.classList.add("rev-in"); });
      return;
    }
    revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("rev-in");
          revealObs.unobserve(en.target);
        }
      });
    }, { threshold: 0.15 });
    nodes.forEach(function (n) { revealObs.observe(n); });
  }

  function flourishFor(g) {
    var box = el("div", "d__flourish");
    if (g.theme === "enigma") {
      box.appendChild(el("span", "stamp", "TOP SECRET · 기밀"));
      box.appendChild(el("span", "redact redact--long"));
      box.appendChild(el("span", "redact redact--short"));
    } else if (g.theme === "hud") {
      box.appendChild(el("span", "rec", "● REC"));
      box.appendChild(el("span", "track", "VEIL ▸ 대상 추적 중"));
      box.appendChild(el("span", "scanline"));
      box.appendChild(el("span", "cam", "CAM-04"));
    } else if (g.theme === "bee") {
      box.appendChild(el("span", "hex"));
      box.appendChild(el("span", "hex"));
      box.appendChild(el("span", "hex"));
    } else if (g.theme === "sand") {
      box.appendChild(el("span", "ridge"));
      box.appendChild(el("span", "ridge__label", "폭풍 이후, 서쪽 능선"));
      box.appendChild(el("span", "ridge"));
    } else if (g.theme === "eco") {
      var no = String(GAMES.indexOf(g) + 1).padStart(3, "0");
      var sp = el("span", "specimen");
      sp.appendChild(document.createTextNode("표본 No." + no));
      sp.appendChild(el("i", null, "|"));
      sp.appendChild(document.createTextNode("생태 도감 · 진행 중인 관찰"));
      box.appendChild(sp);
    } else {
      return null;
    }
    return box;
  }

  function renderDetail(g) {
    cleanupDetailFx();
    detail.innerHTML = "";
    detail.className = "detail " + (THEMES[g.theme] || "t-plain");
    if (!THEMES[g.theme]) detail.style.setProperty("--tone", g.color);

    detail.appendChild(el("div", "d__texture"));

    var bar = el("header", "d__bar");
    var back = el("button", "d__back", "← 목록으로");
    back.addEventListener("click", closeDetail);
    bar.appendChild(back);
    bar.appendChild(el("span", "d__tag", g.tag || ""));
    detail.appendChild(bar);

    var main = el("main", "d__main");

    var meta = el("div", "d__meta");
    meta.appendChild(el("span", "d__kicker", g.kicker));
    meta.appendChild(el("span", "d__year", g.yearLabel || g.year));
    main.appendChild(meta);

    main.appendChild(el("h1", "d__title", g.title));

    var fl = flourishFor(g);
    if (fl) main.appendChild(fl);

    var frame = el("div", "d__frame");
    var img = el("img");
    img.src = g.img;
    img.alt = g.title + " 게임 화면";
    frame.appendChild(img);
    main.appendChild(frame);

    main.appendChild(el("p", "d__line", g.lineLong || g.line));
    if (g.note) main.appendChild(el("div", "d__note", g.note));

    var shots = shotsFor(g);
    if (shots) main.appendChild(shots);

    var teaser = teaserFor(g);
    if (teaser) main.appendChild(teaser);

    var facts = el("dl", "d__facts");
    (g.facts || []).forEach(function (f) {
      var box = el("div", "d__fact");
      box.appendChild(el("dt", null, f.k));
      box.appendChild(el("dd", null, f.v));
      facts.appendChild(box);
    });
    main.appendChild(facts);

    var acts = el("div", "d__acts");
    acts.appendChild(extLink(g.links.play, "바로 플레이", "d__play"));
    if (g.links.code) acts.appendChild(extLink(g.links.code, "소스 코드", "d__ghost"));
    if (g.links.itch) acts.appendChild(extLink(g.links.itch, "itch.io", "d__ghost"));
    acts.appendChild(el("span", "d__free", "무료 · 브라우저 · 설치 없음"));
    main.appendChild(acts);

    detail.appendChild(main);
    armReveals();
  }

  /* ---------- 라우팅 ---------- */

  var detailOpen = false;
  var homeScrollY = 0;
  var detailFromHome = false; /* 이 세션의 홈에서 들어온 상세인가 (딥링크 진입이면 false) */
  var lastFocusCard = null;

  /* 상세 닫기: 홈에서 들어왔으면 히스토리 엔트리를 pop 해 뒤로가기 루프를 막는다 */
  function closeDetail() {
    if (detailFromHome) history.back();
    else location.hash = "";
  }

  function route() {
    var m = (location.hash || "").match(/^#g\/(.+)$/);
    var g = m ? GAMES.find(function (x) { return x.id === m[1]; }) : null;
    if (g && g.page) { /* 전용 페이지가 있으면 옛 해시 링크를 그리로 보낸다 */
      location.replace(g.page);
      return;
    }
    if (g) {
      if (!detailOpen) {
        lastFocusCard = home.contains(document.activeElement) ? document.activeElement : null;
      }
      detailOpen = true;
      renderDetail(g);
      home.hidden = true;
      detail.hidden = false;
      document.title = g.title + " · 김수민 게임";
      var backBtn = detail.querySelector(".d__back");
      if (backBtn) backBtn.focus({ preventScroll: true });
      window.scrollTo(0, 0);
    } else {
      var wasOpen = detailOpen;
      cleanupDetailFx();
      detailOpen = false;
      detail.hidden = true;
      home.hidden = false;
      document.title = HOME_TITLE;
      window.scrollTo(0, homeScrollY);
      if (wasOpen && lastFocusCard && document.contains(lastFocusCard)) {
        lastFocusCard.focus({ preventScroll: true });
      }
    }
  }

  /* 홈 ↔ 상세 전환: 지원 브라우저에선 크로스페이드로 감싼다.
     전환이 중간에 스킵돼도 route 는 항상 실행되므로 promise 거부는 조용히 삼킨다 */
  function routeWithTransition() {
    if (!reducedMotion && document.startViewTransition) {
      var t = document.startViewTransition(route);
      if (t && t.ready) t.ready.catch(function () {});
      if (t && t.finished) t.finished.catch(function () {});
    } else {
      route();
    }
  }

  window.addEventListener("hashchange", function () {
    var toDetail = /^#g\//.test(location.hash || "");
    if (toDetail && !detailOpen) {
      /* 스크롤 스냅샷은 전환(비동기) 시작 전에 동기로 뜬다 */
      homeScrollY = window.scrollY;
      detailFromHome = true;
    }
    if (!toDetail) detailFromHome = false;
    routeWithTransition();
  });
  window.addEventListener("keydown", function (e) {
    /* 맛보기 입력창에서 타이핑 중일 땐 Escape 로 페이지를 닫지 않는다 */
    if (e.key === "Escape" && detailOpen && !/^(INPUT|TEXTAREA)$/.test(e.target.tagName)) {
      closeDetail();
    }
  });

  /* ---------- 시작 ---------- */

  renderFeat();
  route();
  restartTimer();
})();
