/* 게임별 맛보기(미니 체험). app.js 가 상세 페이지에서 게임 id 로 찾아 마운트한다.
   등록 형태: TEASERS[<게임id>] = { title: 섹션 제목, make: function(mount, g, reducedMotion) }
   make 는 정리(cleanup) 함수를 반환할 수 있다 (타이머·raf·옵저버 해제용). 없으면 null.
   여기 코드는 게임의 실제 규칙을 흉내낸 장난감이지 본편 이식이 아니다. */

(function () {
  "use strict";

  window.TEASERS = {};

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }

  /* ============ ENIGMA: 카이사르 회전자 ============ */
  /* 슬라이더로 회전자를 돌려 감청문을 푼다. 본편 다섯 암호 중 첫 번째의 축소판 */

  var PLAIN = "ENIGMA IS BROKEN";
  var SHIFT = 7;

  function caesar(text, shift) {
    var out = "";
    for (var i = 0; i < text.length; i++) {
      var c = text.charCodeAt(i);
      if (c >= 65 && c <= 90) out += String.fromCharCode((c - 65 + shift + 26) % 26 + 65);
      else out += text[i];
    }
    return out;
  }

  window.TEASERS["enigma"] = {
    title: "실습 · 오늘의 감청",
    make: function (mount) {
      var cipherText = caesar(PLAIN, SHIFT);
      mount.appendChild(el("p", "tz-note", "새벽 2시 40분에 잡힌 통신입니다. 회전자를 돌려 해독하십시오."));
      var out = el("p", "tz-cipher", cipherText);
      mount.appendChild(out);

      var row = el("div", "tz-dialrow");
      var lab = el("label", "tz-dial-label", "회전자 위치: 0");
      lab.setAttribute("for", "tz-dial");
      var dial = el("input", "tz-dial");
      dial.type = "range";
      dial.min = "0";
      dial.max = "25";
      dial.value = "0";
      dial.id = "tz-dial";
      row.appendChild(lab);
      row.appendChild(dial);
      mount.appendChild(row);

      var done = el("div", "tz-done");
      done.appendChild(el("span", "tz-stamp", "해독 완료"));
      done.appendChild(el("span", "tz-done-line", "이걸 다섯 가지 실제 암호로, 15개 스테이지 동안 합니다."));
      done.hidden = true;
      mount.appendChild(done);

      dial.addEventListener("input", function () {
        var k = parseInt(dial.value, 10);
        lab.textContent = "회전자 위치: " + k;
        var guess = caesar(cipherText, -k);
        out.textContent = guess;
        var solved = guess === PLAIN;
        out.classList.toggle("is-solved", solved);
        done.hidden = !solved;
      });
      return null;
    }
  };

  /* ============ SYOTOS: 말은 지워지고, 물건은 남는다 ============ */
  /* 모래에 글을 쓰면 폭풍이 지운다. 대신 물건 하나를 남기면 localStorage 로 다음 방문까지 남는다 */

  var LS_KEY = "syotos-left-item";
  var ITEMS = ["수통", "나침반", "밧줄", "랜턴"];

  window.TEASERS["otherside"] = {
    title: "의식 · 남기고 가기",
    make: function (mount, g, reducedMotion) {
      var timers = [];
      function later(fn, ms) { timers.push(setTimeout(fn, ms)); }

      var prev = null;
      try { prev = localStorage.getItem(LS_KEY); } catch (e) { /* 프라이빗 모드 등 */ }
      if (prev) {
        mount.appendChild(el("p", "tz-note tz-prev", "지난 방문에서 당신이 남긴 것: " + prev + ". 아직 그 자리에 있습니다."));
      }

      mount.appendChild(el("p", "tz-note", "다음 원정대에게 하고 싶은 말을 모래에 적어 보십시오."));
      var form = el("form", "tz-sandrow");
      var input = el("input", "tz-sandinput");
      input.type = "text";
      input.maxLength = 14;
      input.placeholder = "짧게";
      input.setAttribute("aria-label", "모래에 적을 말");
      var btn = el("button", "tz-btn", "모래에 적는다");
      btn.type = "submit";
      form.appendChild(input);
      form.appendChild(btn);
      mount.appendChild(form);

      var stage = el("p", "tz-sandstage");
      stage.setAttribute("aria-live", "polite");
      mount.appendChild(stage);

      var after = el("div", "tz-after");
      after.hidden = true;
      after.appendChild(el("p", "tz-note", "…폭풍이 지나갔습니다. 이 세계에서 말은 남지 않습니다. 물건이라면 남습니다."));
      var itemRow = el("div", "tz-items");
      ITEMS.forEach(function (name) {
        var b = el("button", "tz-btn tz-item", name);
        b.type = "button";
        b.addEventListener("click", function () {
          try { localStorage.setItem(LS_KEY, name); } catch (e) {}
          itemRow.querySelectorAll(".tz-item").forEach(function (x) { x.disabled = true; });
          b.classList.add("is-left");
          after.appendChild(el("p", "tz-note tz-left-line", name + "을(를) 남겨 두었습니다. 다음 원정대가 발견할 것입니다."));
        });
        itemRow.appendChild(b);
      });
      after.appendChild(itemRow);
      mount.appendChild(after);

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var text = (input.value || "").trim();
        if (!text) return;
        input.value = "";
        input.disabled = true;
        btn.disabled = true;
        stage.textContent = "";
        var spans = [];
        for (var i = 0; i < text.length; i++) {
          var s = el("span", "tz-grain", text[i] === " " ? " " : text[i]);
          stage.appendChild(s);
          spans.push(s);
        }
        if (reducedMotion) {
          later(function () { stage.classList.add("is-gone"); after.hidden = false; }, 900);
          return;
        }
        later(function () {
          spans.forEach(function (s, i) {
            later(function () {
              s.style.transform = "translate(" + (30 + Math.floor(Math.abs(Math.sin(i * 7)) * 60)) + "px," +
                (-8 + Math.floor(Math.abs(Math.cos(i * 5)) * 16) - 8) + "px) rotate(" + (i % 2 ? 28 : -22) + "deg)";
              s.style.opacity = "0";
            }, i * 70);
          });
        }, 700);
        later(function () { after.hidden = false; }, 700 + text.length * 70 + 900);
      });

      return function () { timers.forEach(clearTimeout); };
    }
  };

  /* ============ Be the Bee: 연습 벌집 ============ */
  /* 빈 칸을 눌러 꿀벌을 놓는다. 같은 줄 5마리면 승리. 본편은 상대가 이걸 끊으러 온다 */

  var HEX_ROWS = [
    { r: -2, q0: 0, len: 5 },
    { r: -1, q0: -1, len: 6 },
    { r: 0, q0: -2, len: 7 },
    { r: 1, q0: -2, len: 6 },
    { r: 2, q0: -2, len: 5 }
  ];
  var HEX_DIRS = [[1, 0], [0, 1], [1, -1]];

  window.TEASERS["be-the-bee"] = {
    title: "연습 벌집",
    make: function (mount) {
      mount.appendChild(el("p", "tz-note", "빈 칸을 눌러 꿀벌을 놓아 보십시오. 한 줄로 다섯 마리면 승리입니다."));
      var placed = {}; /* "q,r" -> true */
      var cells = {};  /* "q,r" -> button */
      var won = false;

      var board = el("div", "tz-hive");
      HEX_ROWS.forEach(function (row) {
        var line = el("div", "tz-hive-row");
        for (var i = 0; i < row.len; i++) {
          (function (q, r) {
            var key = q + "," + r;
            var c = el("button", "tz-cell");
            c.type = "button";
            c.setAttribute("aria-label", "벌집 칸");
            c.addEventListener("click", function () {
              if (won || placed[key]) return;
              placed[key] = true;
              c.classList.add("has-bee");
              var best = bestLine(q, r);
              if (best.length >= 5) {
                won = true;
                best.forEach(function (k) { cells[k].classList.add("in-line"); });
                msg.textContent = "다섯 마리! 실전에서는 상대가 이 줄을 끊으러 옵니다.";
                msg.classList.add("is-win");
                reset.hidden = false;
              } else if (best.length >= 3) {
                best.forEach(function (k) { cells[k].classList.add("in-line"); });
                msg.textContent = best.length + "마리째. " + (5 - best.length) + "마리 남았습니다.";
              }
            });
            cells[key] = c;
            line.appendChild(c);
          })(row.q0 + i, row.r);
        }
        board.appendChild(line);
      });
      mount.appendChild(board);

      function bestLine(q, r) {
        var best = [];
        HEX_DIRS.forEach(function (d) {
          var line = [q + "," + r];
          var i;
          for (i = 1; i < 7; i++) {
            var k = (q + d[0] * i) + "," + (r + d[1] * i);
            if (placed[k]) line.push(k); else break;
          }
          for (i = 1; i < 7; i++) {
            var k2 = (q - d[0] * i) + "," + (r - d[1] * i);
            if (placed[k2]) line.push(k2); else break;
          }
          if (line.length > best.length) best = line;
        });
        return best;
      }

      var msg = el("p", "tz-hivemsg", "");
      msg.setAttribute("aria-live", "polite");
      mount.appendChild(msg);

      var reset = el("button", "tz-btn", "벌집 비우기");
      reset.type = "button";
      reset.hidden = true;
      reset.addEventListener("click", function () {
        placed = {};
        won = false;
        msg.textContent = "";
        msg.classList.remove("is-win");
        reset.hidden = true;
        Object.keys(cells).forEach(function (k) { cells[k].classList.remove("has-bee", "in-line"); });
      });
      mount.appendChild(reset);
      return null;
    }
  };

  /* ============ Eyes on You: 보안 채널 ============ */
  /* VEIL 이 말을 걸어온다. 조언을 따르거나 무시한다. 본편의 핵심 루프 축소판 */

  var VEIL_STEPS = [
    { say: "연결 확인. 당신이 오는 걸 보고 있었다.", choice: null },
    { say: "정면 복도에 카메라 두 대. 우회로를 권장한다.", choice: true },
    { say: "보안 콘솔이 열려 있다. 손대지 않는 게 좋겠다.", choice: true }
  ];
  var VEIL_FOLLOW = ["좋은 선택. …아마도.", "말을 잘 듣는 타입이군. 기록했다."];
  var VEIL_IGNORE = ["기록해 두지. 당신은 내 말을 듣지 않는 타입.", "그럴 줄 알았다. 그것도 데이터다."];

  window.TEASERS["eyes-on-you"] = {
    title: "보안 채널 · VEIL",
    make: function (mount, g, reducedMotion) {
      var timers = [];
      var iv = null;
      function later(fn, ms) { timers.push(setTimeout(fn, ms)); }

      var term = el("div", "tz-term");
      term.setAttribute("aria-live", "polite");
      mount.appendChild(term);
      var choiceRow = el("div", "tz-choices");
      mount.appendChild(choiceRow);

      var follows = 0;
      var answered = 0;

      function typeLine(text, cls, thenFn) {
        var line = el("p", "tz-termline" + (cls ? " " + cls : ""));
        term.appendChild(line);
        term.scrollTop = term.scrollHeight;
        if (reducedMotion) {
          line.textContent = text;
          if (thenFn) later(thenFn, 250);
          return;
        }
        var i = 0;
        iv = setInterval(function () {
          i++;
          line.textContent = text.slice(0, i);
          term.scrollTop = term.scrollHeight;
          if (i >= text.length) {
            clearInterval(iv);
            iv = null;
            if (thenFn) later(thenFn, 350);
          }
        }, 24);
      }

      function step(idx) {
        if (idx >= VEIL_STEPS.length) return finale();
        var s = VEIL_STEPS[idx];
        typeLine("VEIL ▸ " + s.say, null, function () {
          if (!s.choice) return step(idx + 1);
          offer(idx);
        });
      }

      function offer(idx) {
        choiceRow.innerHTML = "";
        [["조언을 따른다", true], ["무시한다", false]].forEach(function (opt) {
          var b = el("button", "tz-btn tz-choice", opt[0]);
          b.type = "button";
          b.addEventListener("click", function () {
            choiceRow.innerHTML = "";
            typeLine("YOU ▸ " + opt[0], "tz-you", function () {
              var pool = opt[1] ? VEIL_FOLLOW : VEIL_IGNORE;
              if (opt[1]) follows++;
              typeLine("VEIL ▸ " + pool[answered % pool.length], null, function () {
                answered++;
                step(idx + 1);
              });
            });
          });
          choiceRow.appendChild(b);
        });
      }

      function finale() {
        var trust = 50 + follows * 25;
        typeLine("VEIL ▸ 충분히 봤다. 신뢰 지수 " + trust + "%. 나머지는 임무에서 확인하지.", "tz-final", function () {
          mount.appendChild(el("p", "tz-note", "엔딩 4종은 이런 선택들이 가릅니다. 본편은 PC · 키보드로."));
        });
      }

      later(function () { step(0); }, 300);

      return function () {
        timers.forEach(clearTimeout);
        if (iv) clearInterval(iv);
      };
    }
  };

  /* ============ 적자생존: 개체군 관찰 ============ */
  /* 직접 조작 없음. 카드를 고르면 형질이 개체군에 퍼지는 걸 지켜본다 */

  window.TEASERS["selection-pressure"] = {
    title: "관찰 실습 · 7번 서식지",
    make: function (mount, g, reducedMotion) {
      mount.appendChild(el("p", "tz-note", "직접 조작할 수 없습니다. 카드를 골라 형질을 퍼뜨리고, 지켜보십시오."));

      var canvas = document.createElement("canvas");
      canvas.className = "tz-eco";
      canvas.setAttribute("aria-label", "개체군 시뮬레이션");
      mount.appendChild(canvas);
      var ctx = canvas.getContext("2d");

      var pop = [];
      for (var i = 0; i < 22; i++) {
        pop.push({
          x: (i * 61) % 320, y: (i * 37) % 200,
          dir: (i * 0.83) % (Math.PI * 2),
          speed: 0.35, r: 3.2, herd: 0, wob: i
        });
      }
      var gen = 1;

      function resize() {
        var w = canvas.clientWidth || 320;
        canvas.width = w * (window.devicePixelRatio || 1);
        canvas.height = 220 * (window.devicePixelRatio || 1);
        ctx.setTransform(window.devicePixelRatio || 1, 0, 0, window.devicePixelRatio || 1, 0, 0);
      }

      function tick() {
        var w = canvas.clientWidth || 320;
        var cx = 0, cy = 0;
        pop.forEach(function (p) { cx += p.x; cy += p.y; });
        cx /= pop.length; cy /= pop.length;
        pop.forEach(function (p) {
          p.wob += 0.05;
          p.dir += Math.sin(p.wob) * 0.06;
          if (p.herd > 0) {
            var want = Math.atan2(cy - p.y, cx - p.x);
            var diff = Math.atan2(Math.sin(want - p.dir), Math.cos(want - p.dir));
            p.dir += diff * 0.012 * p.herd;
          }
          p.x += Math.cos(p.dir) * p.speed;
          p.y += Math.sin(p.dir) * p.speed;
          if (p.x < -6) p.x = w + 6; if (p.x > w + 6) p.x = -6;
          if (p.y < -6) p.y = 226; if (p.y > 226) p.y = -6;
        });
      }

      function draw() {
        var w = canvas.clientWidth || 320;
        /* clientWidth 가 스크롤바 등으로 줄어도 잔상이 없도록 비트맵 전체를 지운다 */
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        pop.forEach(function (p) {
          ctx.beginPath();
          ctx.fillStyle = "rgba(111, 191, 139, 0.9)";
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.strokeStyle = "rgba(111, 191, 139, 0.35)";
          ctx.lineWidth = 1;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - Math.cos(p.dir) * (p.r + 4), p.y - Math.sin(p.dir) * (p.r + 4));
          ctx.stroke();
        });
      }

      var raf = null;
      var running = false;
      function loop() {
        tick();
        draw();
        raf = requestAnimationFrame(loop);
      }
      function start() {
        if (!running && !reducedMotion) { running = true; raf = requestAnimationFrame(loop); }
        if (reducedMotion) draw();
      }
      function stop() {
        running = false;
        if (raf) { cancelAnimationFrame(raf); raf = null; }
      }

      var cardRow = el("div", "tz-cards");
      var genLab = el("p", "tz-gen", "세대 1 · 기준 개체군");
      genLab.setAttribute("aria-live", "polite");
      var CARDS = [
        { name: "빠른 다리", desc: "이동 속도 상승", apply: function (p) { p.speed = Math.min(p.speed + 0.3, 1.6); } },
        { name: "큰 몸집", desc: "개체 크기 상승", apply: function (p) { p.r = Math.min(p.r + 1.1, 8); } },
        { name: "무리 본능", desc: "서로 모이려 한다", apply: function (p) { p.herd = Math.min(p.herd + 1, 3); } }
      ];
      CARDS.forEach(function (card) {
        var b = el("button", "tz-btn tz-card");
        b.type = "button";
        b.appendChild(el("strong", null, card.name));
        b.appendChild(el("span", null, card.desc));
        b.addEventListener("click", function () {
          pop.forEach(card.apply);
          gen++;
          genLab.textContent = "세대 " + gen + " · " + card.name + " 형질이 퍼졌습니다";
          if (reducedMotion) { tick(); draw(); }
        });
        cardRow.appendChild(b);
      });
      mount.appendChild(cardRow);
      mount.appendChild(genLab);

      resize();
      draw();
      window.addEventListener("resize", resize);

      /* 화면 밖에선 시뮬 정지 (배터리) */
      var io = null;
      if ("IntersectionObserver" in window) {
        io = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) { en.isIntersecting ? start() : stop(); });
        }, { threshold: 0.05 });
        io.observe(canvas);
      } else {
        start();
      }

      return function () {
        stop();
        window.removeEventListener("resize", resize);
        if (io) io.disconnect();
      };
    }
  };
})();
