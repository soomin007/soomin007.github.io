/* 홈의 "몇 분 있으세요?" 한 줄. app.js 가 그리드를 그린 뒤에 실행된다.

   허브가 이미 하는 일
     게임을 보여 주는 것(피처드 · 카드)과 기기 판별(터치면 폰 게임 먼저).
   여기서 더하는 일
     가진 시간을 물어, 지금 기기에서 할 게임 하나를 골라 맨 앞 카드로 올리고
     "얼마나 하면 좋은지" 한 줄을 붙인다. 기기는 묻지 않고 app.js 와 같은 방법으로 판별한다.

   규칙은 RULES 하나. 한 칸에 후보가 여럿이면 배열 맨 앞이 이긴다 (우선순위 고정).
   문구 속 ~ 는 "여기서 줄을 바꾸지 말 것" 표시. 화면에 넣을 때 줄바꿈 없는 공백으로 바꾼다.
   (1차 시도였던 설문 페이지는 pick/ 에 그대로 남아 있다) */

(function () {
  "use strict";

  var RULES = {
    phone: {
      5: [
        { id: "be-the-bee",
          why: "한 수마다 자동 저장되어 언제 멈춰도 그~자리에서 이어~둘~수~있습니다.",
          tip: "AI와 한~판. 길어지면 저장해 두고 나중에 이어서~두면~됩니다." },
        { id: "otherside",
          why: "첫 원정은 튜토리얼이라 짧게 끝납니다.",
          tip: "첫 원정 한 번만." }
      ],
      15: [
        { id: "be-the-bee",
          why: "실력이 비슷할수록 한 판이 길어지는 대전 게임입니다.",
          tip: "비슷한 난이도의 AI를 골라 끝까지 한~판." },
        { id: "otherside",
          why: "원정이 끝날 때마다 기록이 저장됩니다.",
          tip: "원정 두세 번." }
      ],
      30: [
        { id: "otherside",
          why: "원정대가 죽기 전에 남긴 물건이 다음 원정으로 이어집니다.",
          tip: "원정을 이어서, 엔딩~쪽으로." }
      ]
    },
    pc: {
      5: [
        { id: "enigma",
          why: "스테이지마다 저장되고, 스테이지 하나가 짧습니다.",
          tip: "한 스테이지만 풀어~보세요." },
        { id: "eyes-on-you",
          why: "스테이지 사이마다 자동 저장됩니다.",
          tip: "스테이지 몇 개만." }
      ],
      15: [
        { id: "eyes-on-you",
          why: "런 하나가 15분 안쪽이라 한 번에 끝까지 볼~수~있습니다.",
          tip: "런 하나 끝까지." }
      ],
      30: [
        { id: "enigma",
          why: "실제 2차대전 암호 다섯 가지를 차례로 풀어~갑니다.",
          tip: "여러 스테이지를 이어서." },
        { id: "otherside",
          why: "원정 기록이 저장되어 여러 번에 나눠~하기~좋습니다.",
          tip: "원정을 이어서, 엔딩~쪽으로." }
      ]
    }
  };

  var LABEL = { 5: "5분이라면", 15: "15분이라면", 30: "30분 이상이라면" };
  var NBSP = String.fromCharCode(160);

  var ask = document.getElementById("ask");
  var grid = document.getElementById("grid");
  if (!ask || !grid) return;

  /* app.js 와 같은 판별. 터치 기기면 폰 */
  var isTouch = window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 1;
  var device = isTouch ? "phone" : "pc";
  document.getElementById("askNote").textContent =
    isTouch ? "폰에서 할 수 있는 게임 중에서 고릅니다." : "PC 기준으로 고릅니다.";

  /* 원래 카드 순서. 고를 때마다 이 순서로 되돌린 뒤 추천 카드만 맨 앞으로 */
  var original = Array.prototype.slice.call(grid.children);

  function copy(text) {
    return text.split("~").join(NBSP);
  }

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }

  function clearPick() {
    original.forEach(function (card) {
      card.classList.remove("is-pick");
      var old = card.querySelectorAll(".badge--now, .gcard__pick");
      Array.prototype.forEach.call(old, function (n) { n.remove(); });
      grid.appendChild(card);
    });
  }

  function choose(time) {
    var rule = RULES[device][time][0];
    var card = grid.querySelector('[data-id="' + rule.id + '"]');
    clearPick();
    if (!card) return;

    card.classList.add("is-pick");
    card.querySelector(".gcard__media").appendChild(el("span", "badge badge--now", "지금 추천"));

    var box = el("div", "gcard__pick");
    var tip = el("p", "gcard__tip");
    tip.appendChild(el("b", null, LABEL[time]));
    tip.appendChild(document.createTextNode(" " + copy(rule.tip)));
    box.appendChild(tip);
    box.appendChild(el("p", "gcard__why", copy(rule.why)));
    card.querySelector(".gcard__body").insertBefore(box, card.querySelector(".gcard__foot"));

    grid.classList.add("has-pick");
    grid.insertBefore(card, grid.firstChild);
    card.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  var buttons = ask.querySelectorAll("button");
  Array.prototype.forEach.call(buttons, function (btn) {
    btn.addEventListener("click", function () {
      Array.prototype.forEach.call(buttons, function (b) { b.setAttribute("aria-pressed", "false"); });
      btn.setAttribute("aria-pressed", "true");
      choose(btn.dataset.time);
    });
  });
})();
