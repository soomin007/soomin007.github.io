/* 게임별 맛보기(미니 체험). app.js 가 상세 페이지에서 게임 id 로 찾아 마운트한다.
   등록 형태: TEASERS[<게임id>] = { title: 섹션 제목, make: function(mount, g, reducedMotion) }
   make 는 정리(cleanup) 함수를 반환할 수 있다 (타이머·raf·옵저버 해제용). 없으면 null.

   각 맛보기는 해당 게임 저장소의 실제 데이터·룰·문구를 축소 이식한 것이다 (2026-08-02 코드 분석).
   - ENIGMA: data/chapters/chapter_00_01.json 의 실제 첫 퍼즐 (ATTACK AT DAWN, shift 3)
   - SYOTOS: Items.gd 실제 아이템 수치, Situations.gd 위기 카드 원문, 남기기 비용
   - Be the Bee: ② 타일+말 턴, 3축 5목 판정(lines.ts), easy AI 상당 휴리스틱
   - EoY: RouteData.gd 실제 루트 카드·추천 구조, VeilDialogue.gd 실제 대사, trust +2/+0
   - 적자생존: cards.ts 실제 형질 카드 원문, mapType.ts 군도 설명, 드래프트 중 시뮬 정지 */

(function () {
  "use strict";

  window.TEASERS = {};

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }

  /* ==================================================================
     ENIGMA · 챕터 0 "첫 교신" 실제 퍼즐
     암호문 DWWDFN DW GDZQ = ATTACK AT DAWN (시저, 이동값 3, 오른쪽)
     ================================================================== */

  (function () {
    var CIPHER = "DWWDFN DW GDZQ";
    var PLAIN = "ATTACK AT DAWN";

    function decodeChar(ch, shift, dirRight) {
      var c = ch.charCodeAt(0);
      if (c < 65 || c > 90) return ch;
      var k = dirRight ? -shift : shift;
      return String.fromCharCode(((c - 65 + k) % 26 + 26) % 26 + 65);
    }
    function decode(text, shift, dirRight) {
      var out = "";
      for (var i = 0; i < text.length; i++) out += decodeChar(text[i], shift, dirRight);
      return out;
    }

    window.TEASERS["enigma"] = {
      title: "실습 · CHAPTER 0 첫 교신",
      make: function (mount) {
        var box = el("div", "ez");
        mount.appendChild(box);

        box.appendChild(el("div", "ez-head", "[ 시저 암호 해독기 · CAESAR CIPHER ]"));
        box.appendChild(el("div", "ez-label", "감청 신호 · 437.5 kHz · SIGNAL LOCKED"));
        box.appendChild(el("p", "ez-cipher", CIPHER));

        /* 이동값 슬라이더 + 방향 토글 (실제 해독기와 같은 조작) */
        var dialRow = el("div", "ez-dialrow");
        var dialLab = el("span", "ez-diallab", "이동값: 0");
        var dial = el("input", "ez-dial");
        dial.type = "range";
        dial.min = "0"; dial.max = "25"; dial.value = "0";
        dial.setAttribute("aria-label", "이동값");
        dialRow.appendChild(dialLab);
        dialRow.appendChild(dial);
        box.appendChild(dialRow);

        var dirRow = el("div", "ez-dirrow");
        var btnR = el("button", "tz-btn ez-dir", "▶ 앞으로 이동 (Right)");
        var btnL = el("button", "tz-btn ez-dir", "◀ 뒤로 이동 (Left)");
        btnR.type = "button"; btnL.type = "button";
        dirRow.appendChild(btnR);
        dirRow.appendChild(btnL);
        box.appendChild(dirRow);

        /* 26자 대응표: 윗줄 암호(고정) / 아랫줄 평문(실시간). 암호문에 나오는 글자는 골드 */
        var used = {};
        CIPHER.split("").forEach(function (ch) { if (/[A-Z]/.test(ch)) used[ch] = true; });
        var table = el("div", "ez-table");
        var rowTop = el("div", "ez-row");
        var rowBot = el("div", "ez-row");
        var botCells = [];
        for (var i = 0; i < 26; i++) {
          var L = String.fromCharCode(65 + i);
          rowTop.appendChild(el("span", "ez-ch" + (used[L] ? " is-used" : ""), L));
          var b = el("span", "ez-ch", L);
          botCells.push(b);
          rowBot.appendChild(b);
        }
        table.appendChild(rowTop);
        table.appendChild(rowBot);
        box.appendChild(table);

        box.appendChild(el("div", "ez-label", "해독 결과"));
        var out = el("p", "ez-out", CIPHER);
        box.appendChild(out);

        /* 해독되면 열리는 보고서 (실제 챕터 0 질문) */
        var report = el("div", "ez-report");
        report.hidden = true;
        report.appendChild(el("div", "ez-head", "[ 보고서 작성 ] 수집한 정보를 바탕으로 아래 질문에 답하십시오."));
        report.appendChild(el("p", "ez-q", "적군의 공격 시각은 언제입니까?"));
        var optRow = el("div", "ez-opts");
        var feedback = el("p", "ez-feedback", "");
        feedback.setAttribute("aria-live", "polite");
        var done = el("div", "ez-done");
        done.hidden = true;
        done.appendChild(el("span", "ez-stamp", "DECODED"));
        var doneCol = el("div", "ez-donecol");
        doneCol.appendChild(el("span", "ez-stars", "★ ★ ★"));
        doneCol.appendChild(el("span", "ez-doneline", "완벽한 해독. 블레츨리 파크가 당신을 주목합니다."));
        doneCol.appendChild(el("span", "ez-next", "본편은 라디오 감청과 단서 보드를 거쳐 여기까지 옵니다. 15개 스테이지, 암호 5종."));
        done.appendChild(doneCol);
        ["DUSK", "DAWN", "NOON", "DARK"].forEach(function (opt) {
          var b = el("button", "tz-btn ez-opt", opt);
          b.type = "button";
          b.addEventListener("click", function () {
            if (opt === "DAWN") {
              feedback.textContent = "";
              optRow.querySelectorAll("button").forEach(function (x) { x.disabled = true; });
              b.classList.add("is-right");
              done.hidden = false;
            } else {
              feedback.textContent = "재검토 요망. 해독기를 다시 확인하고 보고서를 수정하십시오.";
            }
          });
          optRow.appendChild(b);
        });
        report.appendChild(optRow);
        report.appendChild(feedback);
        report.appendChild(done);
        box.appendChild(report);

        var dirRight = true;
        function refresh() {
          var k = parseInt(dial.value, 10);
          dialLab.textContent = "이동값: " + k;
          btnR.classList.toggle("is-on", dirRight);
          btnL.classList.toggle("is-on", !dirRight);
          for (var i = 0; i < 26; i++) {
            botCells[i].textContent = decodeChar(String.fromCharCode(65 + i), k, dirRight);
            botCells[i].className = "ez-ch" + (used[String.fromCharCode(65 + i)] ? " is-used" : "");
          }
          var guess = decode(CIPHER, k, dirRight);
          out.textContent = guess;
          var solved = guess === PLAIN;
          out.classList.toggle("is-solved", solved);
          if (solved) report.hidden = false;
        }
        dial.addEventListener("input", refresh);
        btnR.addEventListener("click", function () { dirRight = true; refresh(); });
        btnL.addEventListener("click", function () { dirRight = false; refresh(); });
        refresh();
        return null;
      }
    };
  })();

  /* ==================================================================
     SYOTOS · 미니 원정: 가방 → 위기 → 남기기 → 유산
     아이템 수치·위기 카드·남기기 비용은 본편 데이터 그대로
     ================================================================== */

  (function () {
    var ITEMS = {
      "물통": { water: 7, food: 0, w: 3, desc: "물 +7" },
      "식량 자루": { water: 0, food: 6, w: 3, desc: "식량 +6" },
      "말린 고기": { water: -2, food: 9, w: 5, desc: "식량 +9 · 물 -2" },
      "장막": { water: 0, food: 0, w: 2, desc: "폭풍 버티기" },
      "로프": { water: 0, food: 0, w: 1, desc: "틈 건너기" }
    };
    var WORDS = ["또", "봐", "앞", "없다", "끝", "물", "조심", "여기"];
    var LS_KEY = "syotos-legacy";

    window.TEASERS["otherside"] = {
      title: "미니 원정 · 마른 강까지",
      make: function (mount, g, reducedMotion) {
        var timers = [];
        function later(fn, ms) { timers.push(setTimeout(fn, reducedMotion ? Math.min(ms, 250) : ms)); }

        var legacy = null;
        try { legacy = JSON.parse(localStorage.getItem(LS_KEY) || "null"); } catch (e) {}

        var screen = el("div", "sy");
        mount.appendChild(screen);

        function clear() { screen.innerHTML = ""; }

        /* ---- 1. 가방 꾸리기 ---- */
        var bag = [];
        function packScreen() {
          clear();
          if (legacy && legacy.item && ITEMS[legacy.item]) {
            var lg = el("p", "sy-legacy",
              "이전 원정대가 남긴 " + legacy.item + ". 아직 쓸 만하다." +
              (legacy.words && legacy.words.length ? " 곁의 표식: [ " + legacy.words.join(" · ") + " ]" : ""));
            screen.appendChild(lg);
            bag.push(legacy.item);
          }
          screen.appendChild(el("h3", "sy-h", "가방을 꾸린다"));
          screen.appendChild(el("p", "sy-sub", "가방은 여섯 칸. 여기서는 네 칸만 꾸립니다. 담은 만큼이 이번 원정의 목숨이다."));

          var slotRow = el("div", "sy-slots");
          var itemRow = el("div", "sy-items");
          var preview = el("p", "sy-preview", "");
          preview.setAttribute("aria-live", "polite");
          var warn = el("p", "sy-warn", "");
          var goBtn = el("button", "tz-btn sy-go", "떠난다");
          goBtn.type = "button";

          function stats() {
            var water = 0, food = 0, w = 0;
            bag.forEach(function (name) {
              var it = ITEMS[name];
              water += it.water; food += it.food; w += it.w;
            });
            return { water: Math.max(water, 0), food: Math.max(food, 0), w: w };
          }
          function render() {
            slotRow.innerHTML = "";
            for (var i = 0; i < 4; i++) {
              (function (idx) {
                var s = el("button", "sy-slot" + (bag[idx] ? " has-item" : ""), bag[idx] || "빈 칸");
                s.type = "button";
                s.setAttribute("aria-label", bag[idx] ? bag[idx] + " 빼기" : "빈 칸");
                s.addEventListener("click", function () {
                  if (bag[idx]) { bag.splice(idx, 1); render(); }
                });
                slotRow.appendChild(s);
              })(i);
            }
            var st = stats();
            preview.textContent = "물 " + st.water + " · 식량 " + st.food + " · 무게 " + st.w;
            warn.textContent = st.w > 12 ? "짐이 무겁다. 걸음마다 물이 더 든다." : "";
            goBtn.disabled = bag.length === 0;
          }
          Object.keys(ITEMS).forEach(function (name) {
            var b = el("button", "tz-btn sy-item", name);
            b.type = "button";
            b.title = ITEMS[name].desc;
            b.appendChild(el("span", "sy-itemdesc", ITEMS[name].desc));
            b.addEventListener("click", function () {
              if (bag.length < 4) { bag.push(name); render(); }
            });
            itemRow.appendChild(b);
          });
          goBtn.addEventListener("click", function () {
            var st = stats();
            marchScreen(st.water, st.food, st.w);
          });

          screen.appendChild(slotRow);
          screen.appendChild(itemRow);
          screen.appendChild(preview);
          screen.appendChild(warn);
          screen.appendChild(goBtn);
          render();
        }

        /* ---- 2. 행군 + 위기 ---- */
        function marchScreen(water, food, weight) {
          clear();
          screen.appendChild(el("p", "sy-npc", "시장: 또 떠나는군. 부디 조심히 가게."));
          var status = el("p", "sy-status", "");
          status.setAttribute("aria-live", "polite");
          var trail = el("p", "sy-trail", "");
          screen.appendChild(status);
          screen.appendChild(trail);

          var step = 0;
          var drain = weight > 12 ? 2 : 1;
          function tick() {
            step++;
            water -= drain;
            if (step % 2 === 0) food -= 1;
            trail.textContent += "· ";
            status.textContent = step + "걸음째 · 물 " + Math.max(water, 0) + " · 식량 " + Math.max(food, 0);
            if (step === 4) return later(crisis, 700);
            if (water <= 2) return later(bequeathScreen, 700);
            if (water <= 0 || food <= 0) return later(deathScreen, 700);
            later(tick, 650);
          }

          function crisis() {
            var card = el("div", "sy-card");
            card.appendChild(el("p", "sy-cardtitle", "느닷없이 모래바람이 몰아친다"));
            var row = el("div", "sy-choices");
            if (bag.indexOf("장막") >= 0) {
              var a = el("button", "tz-btn", "장막을 펼친다");
              a.type = "button";
              a.addEventListener("click", function () {
                card.remove();
                screen.appendChild(el("p", "sy-note", "장막이 바람을 받아냈다."));
                later(tick, 700);
              });
              row.appendChild(a);
            }
            var b = el("button", "tz-btn", "이 악물고 버틴다 (?)");
            b.type = "button";
            b.addEventListener("click", function () {
              water -= 4;
              card.remove();
              screen.appendChild(el("p", "sy-note", "버텼다. 물 -4."));
              if (water <= 0) return later(deathScreen, 800);
              later(tick, 700);
            });
            row.appendChild(b);
            card.appendChild(row);
            screen.appendChild(card);
          }

          later(tick, 400);

          /* 이후 화면에서 쓰도록 물 잔량 공유 */
          bequeathScreen.getWater = function () { return water; };
        }

        /* ---- 3. 남기기 ---- */
        var leftItem = null, leftWords = [];
        function bequeathScreen() {
          clear();
          screen.appendChild(el("h3", "sy-h", "무엇을 남길까"));
          screen.appendChild(el("p", "sy-sub", "물건 하나를 여기 둔다. 그만큼 잃지만, 계속 갈 수 있다."));
          var row = el("div", "sy-items");
          var candidates = bag.slice(0, 3);
          if (!candidates.length) candidates = [];
          candidates.forEach(function (name) {
            var b = el("button", "tz-btn", name + " 남기기");
            b.type = "button";
            b.addEventListener("click", function () { pick(name); });
            row.appendChild(b);
          });
          var mark = el("button", "tz-btn", "표식만 남긴다");
          mark.type = "button";
          mark.addEventListener("click", function () { pick(null); });
          row.appendChild(mark);
          screen.appendChild(row);

          function pick(name) {
            leftItem = name;
            row.querySelectorAll("button").forEach(function (x) { x.disabled = true; });
            var crumble = el("p", "sy-crumble", name ? name + "이(가) 모래 속에 잠긴다…" : "돌을 쌓아 표식을 세운다…");
            screen.appendChild(crumble);
            later(wordScreen, reducedMotion ? 300 : 1100);
          }
        }

        /* ---- 4. 말 새기기 ---- */
        function wordScreen() {
          clear();
          screen.appendChild(el("h3", "sy-h", "어떤 말을 새길까"));
          screen.appendChild(el("p", "sy-sub", "두 단어까지. 모래폭풍이 못 지우는 건 돌에 새긴 말뿐이다."));
          var chipRow = el("div", "sy-words");
          var goBtn = el("button", "tz-btn sy-go", "남기고 계속 간다");
          goBtn.type = "button";
          WORDS.forEach(function (w) {
            var c = el("button", "sy-word", w);
            c.type = "button";
            c.setAttribute("aria-pressed", "false");
            c.addEventListener("click", function () {
              var on = c.classList.contains("is-on");
              if (!on && leftWords.length >= 2) return;
              c.classList.toggle("is-on");
              c.setAttribute("aria-pressed", String(!on));
              if (on) leftWords.splice(leftWords.indexOf(w), 1);
              else leftWords.push(w);
            });
            chipRow.appendChild(c);
          });
          goBtn.addEventListener("click", deathScreen);
          screen.appendChild(chipRow);
          screen.appendChild(goBtn);
        }

        /* ---- 5. 끝, 그리고 다음 원정 ---- */
        function deathScreen() {
          try {
            if (leftItem) localStorage.setItem(LS_KEY, JSON.stringify({ item: leftItem, words: leftWords }));
          } catch (e) {}
          clear();
          screen.appendChild(el("p", "sy-death", "물이 떨어졌다. 여기서 갈증으로 끝났다."));
          screen.appendChild(el("p", "sy-motto", "말은 남지 않는다. 물건만 남는다."));
          later(function () {
            var card = el("div", "sy-card sy-card--legacy");
            card.appendChild(el("p", "sy-cardtitle", "…모래가 다시 가라앉았다."));
            var found = leftItem
              ? "다음 원정대가 남긴 " + leftItem + "을(를) 발견할 것이다." +
                (leftWords.length ? " 곁의 표식: [ " + leftWords.join(" · ") + " ]" : "")
              : "다음 원정대가 돌 표식을 발견할 것이다." +
                (leftWords.length ? " [ " + leftWords.join(" · ") + " ]" : "");
            card.appendChild(el("p", null, found));
            card.appendChild(el("p", "sy-note", "실제로 남았습니다. 다음 방문 때 이 가방에 들어 있습니다."));
            var again = el("button", "tz-btn", "다음 원정을 떠난다");
            again.type = "button";
            again.addEventListener("click", function () {
              try { legacy = JSON.parse(localStorage.getItem(LS_KEY) || "null"); } catch (e) {}
              bag = []; leftItem = null; leftWords = [];
              packScreen();
            });
            card.appendChild(again);
            screen.appendChild(card);
          }, 1200);
        }

        packScreen();
        return function () { timers.forEach(clearTimeout); };
      }
    };
  })();

  /* ==================================================================
     Be the Bee · 연습 대국 (vs 갈색 AI)
     실전 ② 턴(타일 1 + 말 1)만. 승리 판정은 본편과 같은 3축 5목
     ================================================================== */

  (function () {
    var S = 21; /* hex size (pointy-top) */
    var R = 3;  /* 보드 반경 */
    var AX = [[1, 0], [1, -1], [0, -1]];

    function key(q, r) { return q + "," + r; }
    function inBoard(q, r) {
      return Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r)) <= R;
    }
    function neighbors(q, r) {
      return [[1, 0], [-1, 0], [0, 1], [0, -1], [1, -1], [-1, 1]]
        .map(function (d) { return [q + d[0], r + d[1]]; })
        .filter(function (c) { return inBoard(c[0], c[1]); });
    }
    /* (q,r) 을 지나는, owner 말의 최장 연속선 (본편 lines.ts 축소판) */
    function runThrough(pieces, owner, q, r) {
      var best = [key(q, r)];
      AX.forEach(function (d) {
        var line = [key(q, r)], i, k;
        for (i = 1; i <= 6; i++) {
          k = key(q + d[0] * i, r + d[1] * i);
          if (pieces[k] === owner) line.push(k); else break;
        }
        for (i = 1; i <= 6; i++) {
          k = key(q - d[0] * i, r - d[1] * i);
          if (pieces[k] === owner) line.push(k); else break;
        }
        if (line.length > best.length) best = line;
      });
      return best;
    }

    window.TEASERS["be-the-bee"] = {
      title: "연습 대국 · 갈색 AI",
      make: function (mount, g, reducedMotion) {
        var timers = [];
        function later(fn, ms) { timers.push(setTimeout(fn, reducedMotion ? 60 : ms)); }

        mount.appendChild(el("p", "tz-note",
          "본편의 ② 턴만 씁니다: 타일 1개를 깔고, 아무 타일 위에 말 1개. 노랑(당신) 선입니다."));

        var tiles = {};  /* key -> 'y' | 'b' (타일 색) */
        var pieces = {}; /* key -> 'y' | 'b' (말 소유) */
        tiles[key(0, 0)] = "y"; /* 본편과 같은 시드 배치 */
        tiles[key(1, 0)] = "b";

        var over = false;
        var phase = "tile"; /* 'tile' | 'piece' | 'ai' */
        var cells = {};

        var boardWrap = el("div", "bb-board");
        var W = Math.ceil(Math.sqrt(3) * S * (2 * R + 1)) + 8;
        var H = Math.ceil(1.5 * S * 2 * R + 2 * S) + 8;
        boardWrap.style.width = W + "px";
        boardWrap.style.height = H + "px";

        for (var q = -R; q <= R; q++) {
          for (var r = -R; r <= R; r++) {
            if (!inBoard(q, r)) continue;
            (function (q, r) {
              var c = el("button", "bb-cell");
              c.type = "button";
              c.setAttribute("aria-label", "벌집 칸");
              var x = Math.sqrt(3) * S * (q + r / 2) + W / 2;
              var y = 1.5 * S * r + H / 2;
              c.style.left = (x - Math.sqrt(3) * S / 2) + "px";
              c.style.top = (y - S) + "px";
              c.addEventListener("click", function () { onCell(q, r); });
              cells[key(q, r)] = c;
              boardWrap.appendChild(c);
            })(q, r);
          }
        }
        mount.appendChild(boardWrap);

        var status = el("p", "bb-status", "");
        status.setAttribute("aria-live", "polite");
        mount.appendChild(status);
        mount.appendChild(el("p", "bb-tip",
          "\"말 5개를 한 줄로 이으면 승리예요.\" 본편에는 ① 타일 2개 턴, 벌집 잠금, 여왕벌 모드가 더 있습니다."));
        var reset = el("button", "tz-btn", "다시 두기");
        reset.type = "button";
        reset.hidden = true;
        mount.appendChild(reset);

        function paint() {
          Object.keys(cells).forEach(function (k) {
            var c = cells[k];
            c.className = "bb-cell";
            if (tiles[k]) c.classList.add("t-" + tiles[k]);
            if (pieces[k]) c.classList.add("p-" + pieces[k]);
            if (over) return;
            if (phase === "tile" && !tiles[k] && hasTileNeighbor(k)) c.classList.add("can");
            if (phase === "piece" && tiles[k] && !pieces[k]) c.classList.add("can");
          });
        }
        function hasTileNeighbor(k) {
          var p = k.split(",");
          return neighbors(+p[0], +p[1]).some(function (n) { return tiles[key(n[0], n[1])]; });
        }
        function emptyAdjacent() {
          var out = [];
          Object.keys(cells).forEach(function (k) {
            if (!tiles[k] && hasTileNeighbor(k)) out.push(k);
          });
          return out;
        }
        function pieceSpots() {
          return Object.keys(tiles).filter(function (k) { return !pieces[k]; });
        }

        function onCell(q, r) {
          if (over || phase === "ai") return;
          var k = key(q, r);
          if (phase === "tile") {
            if (tiles[k] || !hasTileNeighbor(k)) return;
            tiles[k] = "y";
            phase = "piece";
            status.textContent = "말을 놓을 타일을 클릭하세요.";
            paint();
          } else if (phase === "piece") {
            if (!tiles[k] || pieces[k]) return;
            pieces[k] = "y";
            if (checkWin("y", q, r)) return;
            phase = "ai";
            status.textContent = "갈색이 생각 중…";
            paint();
            later(aiTurn, 650);
          }
        }

        function checkWin(owner, q, r) {
          var line = runThrough(pieces, owner, q, r);
          if (line.length >= 5) {
            over = true;
            line.forEach(function (k) { cells[k].classList.add("in-line"); });
            status.textContent = owner === "y"
              ? "노랑 승리! 말 5개가 한 줄로 이어졌습니다."
              : "갈색 승리! 상대가 먼저 5목을 만들었습니다.";
            status.classList.add(owner === "y" ? "is-win" : "is-lose");
            reset.hidden = false;
            paint();
            return true;
          }
          return false;
        }

        /* AI: ① 이기는 수 ② 노랑 3+줄 끝을 끊는 수(빈 칸이면 타일부터 깔아 선점) ③ 내 최장 줄 연장 */
        function aiTurn() {
          var target = null, tileAt = null;

          function tryPiece(k) { /* k 에 갈색 말을 두면 몇 목이 되나 */
            var p = k.split(",");
            pieces[k] = "b";
            var len = runThrough(pieces, "b", +p[0], +p[1]).length;
            delete pieces[k];
            return len;
          }

          /* ① 즉시 승리 */
          pieceSpots().forEach(function (k) {
            if (!target && tryPiece(k) >= 5) target = k;
          });

          /* ② 차단: 노랑 최장 줄(3+)의 양끝 */
          if (!target) {
            var bestLine = [], axis = null;
            Object.keys(pieces).forEach(function (k) {
              if (pieces[k] !== "y") return;
              var p = k.split(",");
              AX.forEach(function (d) {
                var line = [k], i, kk;
                for (i = 1; i <= 6; i++) {
                  kk = key(+p[0] + d[0] * i, +p[1] + d[1] * i);
                  if (pieces[kk] === "y") line.push(kk); else break;
                }
                for (i = 1; i <= 6; i++) {
                  kk = key(+p[0] - d[0] * i, +p[1] - d[1] * i);
                  if (pieces[kk] === "y") line.push(kk); else break;
                }
                if (line.length > bestLine.length) { bestLine = line; axis = d; }
              });
            });
            if (bestLine.length >= 3 && axis) {
              var qs = bestLine.map(function (k) { return +k.split(",")[0]; });
              var rs = bestLine.map(function (k) { return +k.split(",")[1]; });
              var ends = [
                [Math.max.apply(null, qs.map(function (qq, i) { return qq * axis[0] + rs[i] * axis[1]; }))],
                null
              ];
              /* 축 위 투영으로 양끝 좌표 계산 */
              var proj = bestLine.map(function (k) {
                var p = k.split(",");
                return { q: +p[0], r: +p[1], t: (+p[0]) * axis[0] + (+p[1]) * axis[1] };
              }).sort(function (a, b) { return a.t - b.t; });
              var lo = proj[0], hi = proj[proj.length - 1];
              [[hi.q + axis[0], hi.r + axis[1]], [lo.q - axis[0], lo.r - axis[1]]].some(function (c) {
                var k = key(c[0], c[1]);
                if (!inBoard(c[0], c[1])) return false;
                if (tiles[k] && !pieces[k]) { target = k; return true; }
                if (!tiles[k] && hasTileNeighbor(k)) { target = k; tileAt = k; return true; }
                return false;
              });
            }
          }

          /* ③ 내 최장 줄 연장 */
          if (!target) {
            var best = -1;
            pieceSpots().forEach(function (k) {
              var len = tryPiece(k);
              var p = k.split(",");
              var score = len * 10 - (Math.abs(+p[0]) + Math.abs(+p[1]) + Math.abs(+p[0] + +p[1]));
              if (score > best) { best = score; target = k; }
            });
          }

          /* 타일 놓기 (선점용이 아니면 내 진영 근처 아무 빈칸) */
          if (!tileAt) {
            var opts = emptyAdjacent();
            if (opts.length) {
              opts.sort(function (a, b) {
                function near(k) {
                  var p = k.split(",");
                  var d = 99;
                  Object.keys(pieces).forEach(function (pk) {
                    if (pieces[pk] !== "b") return;
                    var pp = pk.split(",");
                    var dd = Math.max(Math.abs(+p[0] - +pp[0]), Math.abs(+p[1] - +pp[1]),
                      Math.abs((+p[0] + +p[1]) - (+pp[0] + +pp[1])));
                    if (dd < d) d = dd;
                  });
                  return d;
                }
                return near(a) - near(b);
              });
              tileAt = opts[0];
            }
          }
          if (tileAt) tiles[tileAt] = "b";

          if (!target) { endTurnToPlayer(); return; }
          if (!tiles[target]) { /* 선점 실패 폴백 */
            endTurnToPlayer(); return;
          }
          pieces[target] = "b";
          var p = target.split(",");
          if (checkWin("b", +p[0], +p[1])) return;
          endTurnToPlayer();
        }

        function endTurnToPlayer() {
          phase = emptyAdjacent().length ? "tile" : "piece";
          status.textContent = phase === "tile"
            ? "노랑 차례 · 타일을 놓을 빈 칸을 클릭하세요."
            : "노랑 차례 · 말을 놓을 타일을 클릭하세요.";
          paint();
        }

        reset.addEventListener("click", function () {
          tiles = {}; pieces = {}; over = false;
          tiles[key(0, 0)] = "y"; tiles[key(1, 0)] = "b";
          status.classList.remove("is-win", "is-lose");
          reset.hidden = true;
          endTurnToPlayer();
        });

        status.textContent = "노랑 차례 · 타일을 놓을 빈 칸을 클릭하세요. (선플레이어 첫 턴)";
        paint();
        return function () { timers.forEach(clearTimeout); };
      }
    };
  })();

  /* ==================================================================
     Eyes on You · 첫 갈림길 (실제 루트 카드 + VEIL 신뢰 규칙)
     대사는 본편 VeilDialogue.gd·RouteData.gd 원문
     ================================================================== */

  (function () {
    var ROUTES = [
      {
        id: "outskirts", name: "외곽 진입로", risk: 1, reward: 1, rec: true,
        line: "여기로 가요. 경비도 약하고, 길도 단순해요.",
        entry: "외곽으로 들어왔어요. 깊숙한 안쪽이 목표예요. 다 싸울 필요는 없어요."
      },
      {
        id: "rooftop", name: "외벽 옥상", risk: 2, reward: 2, rec: false,
        line: "수직 상승 구간. 트인 만큼 저격에 노출됩니다.",
        entry: "여기서 감각을 익히십시오. 무리하지 마십시오."
      }
    ];

    window.TEASERS["eyes-on-you"] = {
      title: "SIMULATION · 첫 갈림길",
      make: function (mount, g, reducedMotion) {
        var timers = [];
        var iv = null;
        function later(fn, ms) { timers.push(setTimeout(fn, reducedMotion ? 100 : ms)); }

        var head = el("div", "ey-head");
        var eye = el("span", "ey-eye");
        eye.appendChild(el("span", "ey-pupil"));
        head.appendChild(eye);
        head.appendChild(el("span", "ey-hud", "STAGE 1/7 · 루트 선택   HP ♥♥♥   VEIL ○○○○○"));
        mount.appendChild(head);

        var sub = el("div", "ey-subs");
        sub.setAttribute("aria-live", "polite");
        mount.appendChild(sub);

        function say(text, thenFn) {
          var line = el("p", "ey-sub");
          sub.appendChild(line);
          var full = "VEIL ▸ " + text;
          if (reducedMotion) {
            line.textContent = full;
            if (thenFn) later(thenFn, 200);
            return;
          }
          var i = 0;
          iv = setInterval(function () {
            i++;
            line.textContent = full.slice(0, i);
            if (i >= full.length) {
              clearInterval(iv);
              iv = null;
              if (thenFn) later(thenFn, 420);
            }
          }, 22);
        }

        var cardRow = el("div", "ey-cards");
        cardRow.hidden = true;
        mount.appendChild(cardRow);
        var result = el("div", "ey-result");
        mount.appendChild(result);

        function offer() {
          cardRow.hidden = false;
          ROUTES.forEach(function (rt) {
            var c = el("button", "ey-card" + (rt.rec ? " is-rec" : ""));
            c.type = "button";
            if (rt.rec) c.appendChild(el("span", "ey-recbadge", "★ 베일 추천"));
            c.appendChild(el("strong", null, rt.name));
            c.appendChild(el("span", "ey-rr", "위험 " + rt.risk + " · 보상 " + rt.reward));
            c.appendChild(el("span", "ey-cardline", rt.line));
            c.addEventListener("click", function () { choose(rt); });
            cardRow.appendChild(c);
          });
        }

        function choose(rt) {
          cardRow.querySelectorAll("button").forEach(function (x) { x.disabled = true; });
          rt.recPicked = rt.rec;
          say(rt.entry, function () {
            var followed = rt.rec;
            var trust = followed ? 2 : 0;
            result.appendChild(el("p", "ey-clear", "…구간 통과. 데이터 링크 유지 중."));
            var gauge = el("p", "ey-gauge",
              "VEIL 신뢰 +" + trust + "   " + (followed ? "●○○○○" : "○○○○○"));
            if (followed) gauge.classList.add("is-up");
            result.appendChild(gauge);
            result.appendChild(el("p", "ey-note",
              followed
                ? "본편 규칙 그대로입니다: 추천을 따라 클리어하면 신뢰 +2. 신뢰는 VEIL의 어투를 바꾸고, 엔딩 4종을 가릅니다."
                : "본편 규칙 그대로입니다: 무시해도 벌점은 없습니다. 신뢰가 자라지 않을 뿐이고, 그 신뢰가 VEIL의 어투와 엔딩 4종을 가릅니다."));
            say("요원이 저를 믿을수록, 제가 더 많이 도와드릴 수 있습니다.", function () {
              var again = el("button", "tz-btn", "다른 선택 해보기");
              again.type = "button";
              again.addEventListener("click", function () {
                sub.innerHTML = ""; cardRow.innerHTML = ""; result.innerHTML = "";
                cardRow.hidden = true;
                start();
              });
              result.appendChild(again);
            });
          });
        }

        function start() {
          say("...통신 연결됐습니다. 들립니까, 요원?", function () {
            say("멀리는 제가 보겠습니다. 눈앞은 요원이 맡으십시오.", function () {
              say("처음이니 무난한 쪽으로 가요.", offer);
            });
          });
        }

        later(start, 300);
        return function () {
          timers.forEach(clearTimeout);
          if (iv) clearInterval(iv);
        };
      }
    };
  })();

  /* ==================================================================
     적자생존 · 군도에서의 한 번의 드래프트
     카드 원문·군도 설명·"드래프트 중 시뮬 정지"는 본편 그대로
     ================================================================== */

  (function () {
    var CARDS = [
      { name: "커다란 몸", desc: "큰 짐승은 좀처럼 잡아먹히지 않는다. 대신 걸음이 무겁고 많이 먹으며 새끼를 적게 친다.", fx: "몸집 +24", apply: function (p) { p.size = 1.35; p.spd *= 0.85; } },
      { name: "날개", desc: "산과 바다 위를 날아 넘고 산 위의 먹이를 먹는다. 대신 배가 빨리 곯는다.", fx: "비행 해금", apply: function (p) { p.wings = true; } },
      { name: "초음파", desc: "눈이 멀고 귀가 열린다. 어둠도 수풀도 등 뒤도 막지 못한다.", fx: "반향 +70 · 시야 0", apply: function (p) { p.echo = true; p.spd *= 1.3; } }
    ];

    window.TEASERS["selection-pressure"] = {
      title: "관찰 실습 · 이번 세계는 군도",
      make: function (mount, g, reducedMotion) {
        var timers = [];
        var raf = null;
        function later(fn, ms) { timers.push(setTimeout(fn, reducedMotion ? 200 : ms)); }

        mount.appendChild(el("p", "sp-world",
          "군도: 잘게 쪼개진 섬과 얕은 바다입니다. 헤엄치거나 날지 못하면 한 섬에 갇힙니다."));

        var canvas = document.createElement("canvas");
        canvas.className = "sp-canvas";
        canvas.setAttribute("aria-label", "개체군 시뮬레이션: 두 섬과 바다");
        mount.appendChild(canvas);
        var ctx = canvas.getContext("2d");

        var xpWrap = el("div", "sp-xpwrap");
        var xpBar = el("div", "sp-xp");
        xpWrap.appendChild(xpBar);
        var xpLab = el("p", "sp-gen", "무리가 먹이를 먹으면 경험치가 쌓입니다.");
        xpLab.setAttribute("aria-live", "polite");
        mount.appendChild(xpWrap);
        mount.appendChild(xpLab);

        var draft = el("div", "sp-draft");
        draft.hidden = true;
        draft.appendChild(el("h3", "sp-drafthead", "새 형질이 무리에 퍼져요"));
        var cardRow = el("div", "sp-cards");
        draft.appendChild(cardRow);
        var skip = el("button", "tz-btn sp-skip", "건너뛰고 새끼 치기");
        skip.type = "button";
        draft.appendChild(skip);
        mount.appendChild(draft);

        var flash = el("div", "sp-flash");
        flash.hidden = true;
        mount.appendChild(flash);

        var W = 320, H = 230, DPR = 1;
        var GAP0 = 0.44, GAP1 = 0.58; /* 바다 x 비율 구간 */
        var pop = [];
        var foods = [];
        var eaten = 0, NEED = 6;
        var paused = false, ended = false, chosen = null;

        for (var i = 0; i < 12; i++) {
          pop.push({
            x: 20 + (i * 23) % 100, y: 30 + (i * 47) % 170,
            dir: (i * 0.7) % (Math.PI * 2), spd: 0.55,
            size: 1, wings: false, echo: false, tgt: null, wob: i * 3
          });
        }
        function spawnFood(n, island) {
          for (var i = 0; i < n; i++) {
            var left = island === "L" || (island === "any" && i % 2 === 0);
            foods.push({
              x: left ? 12 + ((i * 53) % Math.floor(W * GAP0 - 24))
                      : W * GAP1 + 12 + ((i * 53) % Math.floor(W * (1 - GAP1) - 24)),
              y: 16 + (i * 71) % (H - 32),
              island: left ? "L" : "R"
            });
          }
        }
        spawnFood(7, "L");
        spawnFood(7, "R");

        function resize() {
          W = canvas.clientWidth || 320;
          DPR = window.devicePixelRatio || 1;
          canvas.width = W * DPR;
          canvas.height = H * DPR;
          ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
        }

        function islandOf(x) { return x < W * GAP0 ? "L" : (x > W * GAP1 ? "R" : "SEA"); }

        function tick() {
          pop.forEach(function (p) {
            if (!p.tgt || p.tgt.gone) {
              var mine = islandOf(p.x);
              var cand = foods.filter(function (f) {
                return !f.gone && (p.wings || f.island === mine);
              });
              var best = null, bd = 1e9;
              cand.forEach(function (f) {
                var d = (f.x / W * 320 - p.x / W * 320) * (f.x - p.x) + (f.y - p.y) * (f.y - p.y);
                d = (f.x - p.x) * (f.x - p.x) + (f.y - p.y) * (f.y - p.y);
                if (d < bd) { bd = d; best = f; }
              });
              p.tgt = best;
            }
            p.wob += 0.06;
            if (p.tgt) {
              var want = Math.atan2(p.tgt.y - p.y, p.tgt.x - p.x);
              var diff = Math.atan2(Math.sin(want - p.dir), Math.cos(want - p.dir));
              p.dir += diff * (p.echo ? 0.2 : 0.09) + Math.sin(p.wob) * 0.04;
            } else {
              p.dir += Math.sin(p.wob) * 0.08;
            }
            var nx = p.x + Math.cos(p.dir) * p.spd;
            var ny = p.y + Math.sin(p.dir) * p.spd;
            /* 바다는 날개 없인 못 건넌다 */
            if (!p.wings && islandOf(nx) === "SEA" && islandOf(p.x) !== "SEA") {
              p.dir += Math.PI * 0.7;
            } else { p.x = nx; p.y = ny; }
            if (p.x < 6) p.x = 6; if (p.x > W - 6) p.x = W - 6;
            if (p.y < 6) p.y = 6; if (p.y > H - 6) p.y = H - 6;
            if (p.tgt && !p.tgt.gone) {
              var dx = p.tgt.x - p.x, dy = p.tgt.y - p.y;
              if (dx * dx + dy * dy < 42) {
                p.tgt.gone = true;
                p.tgt = null;
                onEat();
              }
            }
          });
          foods = foods.filter(function (f) { return !f.gone; });
          if (foods.length < 8) spawnFood(4, "any");
        }

        function onEat() {
          if (ended) return;
          eaten++;
          if (!chosen) {
            xpBar.style.width = Math.min(eaten / NEED * 100, 100) + "%";
            xpLab.textContent = "경험치 " + Math.min(eaten, NEED) + "/" + NEED;
            if (eaten >= NEED) openDraft();
          }
        }

        function drawCreature(p) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.dir);
          var L = 8 * p.size, Wd = 5.5 * p.size;
          if (p.wings) {
            ctx.fillStyle = "rgba(245, 238, 225, 0.55)";
            ctx.beginPath(); ctx.ellipse(-1, -Wd - 2, 4.5, 2.2, -0.5, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.ellipse(-1, Wd + 2, 4.5, 2.2, 0.5, 0, Math.PI * 2); ctx.fill();
          }
          /* 물방울 몸통 + 굵은 윤곽 (본편 스티커 스타일 축소판) */
          ctx.beginPath();
          ctx.moveTo(L, 0);
          ctx.quadraticCurveTo(L * 0.4, Wd, -L * 0.6, Wd * 0.55);
          ctx.quadraticCurveTo(-L, 0, -L * 0.6, -Wd * 0.55);
          ctx.quadraticCurveTo(L * 0.4, -Wd, L, 0);
          ctx.fillStyle = "#6cc24a";
          ctx.fill();
          ctx.lineWidth = 1.6;
          ctx.strokeStyle = "#3d7627";
          ctx.stroke();
          if (p.echo) {
            ctx.fillStyle = "#3d7627";
            ctx.beginPath(); ctx.moveTo(L * 0.2, -Wd * 0.7); ctx.lineTo(L * 0.55, -Wd * 1.5); ctx.lineTo(L * 0.6, -Wd * 0.5); ctx.fill();
            ctx.beginPath(); ctx.moveTo(L * 0.2, Wd * 0.7); ctx.lineTo(L * 0.55, Wd * 1.5); ctx.lineTo(L * 0.6, Wd * 0.5); ctx.fill();
          } else {
            ctx.beginPath(); ctx.arc(L * 0.45, -Wd * 0.25, 2.2 * p.size, 0, Math.PI * 2);
            ctx.fillStyle = "#fff"; ctx.fill();
            ctx.beginPath(); ctx.arc(L * 0.55, -Wd * 0.25, 1 * p.size, 0, Math.PI * 2);
            ctx.fillStyle = "#1c2410"; ctx.fill();
          }
          ctx.restore();
        }

        function draw() {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = "#2e7096"; /* 얕은 바다 */
          ctx.fillRect(0, 0, W, H);
          ctx.fillStyle = "#80944e"; /* 초원 섬 */
          ctx.fillRect(0, 0, W * GAP0, H);
          ctx.fillRect(W * GAP1, 0, W * (1 - GAP1), H);
          ctx.fillStyle = "rgba(255,255,255,0.12)";
          ctx.fillRect(W * GAP0, 0, 2, H);
          ctx.fillRect(W * GAP1 - 2, 0, 2, H);
          foods.forEach(function (f) {
            ctx.beginPath();
            ctx.arc(f.x, f.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = f.island ? "#9bee5a" : "#7fe9ff";
            ctx.fill();
          });
          pop.forEach(drawCreature);
        }

        function loop() {
          if (!paused) tick();
          draw();
          raf = requestAnimationFrame(loop);
        }

        function openDraft() {
          paused = true; /* 본편처럼 드래프트 동안 시뮬 정지 */
          draft.hidden = false;
          xpLab.textContent = "시뮬 정지 · 형질을 고르세요. 고른 게 몸에 보입니다.";
        }

        CARDS.forEach(function (card) {
          var b = el("button", "sp-card");
          b.type = "button";
          b.appendChild(el("strong", null, card.name));
          b.appendChild(el("span", "sp-carddesc", card.desc));
          b.appendChild(el("span", "sp-cardfx", card.fx));
          b.addEventListener("click", function () { pickCard(card); });
          cardRow.appendChild(b);
        });
        skip.addEventListener("click", function () {
          for (var i = 0; i < 4; i++) {
            pop.push({ x: 30 + i * 8, y: 40 + i * 11, dir: i, spd: 0.55, size: 0.8, wings: false, echo: false, tgt: null, wob: i });
          }
          pickCard(null);
        });

        function pickCard(card) {
          chosen = card || { name: "새끼 치기" };
          draft.hidden = true;
          paused = false;
          if (card) pop.forEach(card.apply);
          xpLab.textContent = card
            ? "「" + card.name + "」 형질이 무리에 퍼집니다. 지켜보십시오."
            : "무리가 " + pop.length + "마리로 불었습니다. 지켜보십시오.";
          if (reducedMotion) { tick(); tick(); draw(); }
          later(function () {
            flash.hidden = false;
            flash.appendChild(el("p", "sp-pass", "위협을 넘겼습니다"));
            flash.appendChild(el("p", "sp-big", "생존"));
            flash.appendChild(el("p", "sp-close",
              "본편은 채집과 보스, 대멸종까지 6단계, 형질 카드 60여 장, 시대 5개입니다."));
            var again = el("button", "tz-btn", "새 혈통으로 시작");
            again.type = "button";
            again.addEventListener("click", function () {
              ended = false; chosen = null; eaten = 0;
              pop.forEach(function (p) { p.size = 1; p.wings = false; p.echo = false; p.spd = 0.55; });
              pop.length = 12;
              xpBar.style.width = "0%";
              xpLab.textContent = "무리가 먹이를 먹으면 경험치가 쌓입니다.";
              flash.hidden = true;
              flash.innerHTML = "";
            });
            flash.appendChild(again);
            ended = true;
          }, 9000);
        }

        resize();
        draw();
        window.addEventListener("resize", resize);
        var io = null;
        if (reducedMotion) {
          for (var t = 0; t < 40; t++) tick();
          draw();
          openDraft();
        } else if ("IntersectionObserver" in window) {
          io = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
              if (en.isIntersecting) { if (!raf) raf = requestAnimationFrame(loop); }
              else if (raf) { cancelAnimationFrame(raf); raf = null; }
            });
          }, { threshold: 0.05 });
          io.observe(canvas);
        } else {
          raf = requestAnimationFrame(loop);
        }

        return function () {
          timers.forEach(clearTimeout);
          if (raf) cancelAnimationFrame(raf);
          if (io) io.disconnect();
          window.removeEventListener("resize", resize);
        };
      }
    };
  })();
})();
