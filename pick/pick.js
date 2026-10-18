/* ============================================================
   무엇을 할까? · 추천 규칙

   역할 분담
     기기 질문  후보를 거른다 (폰에서 못 하는 게임은 폰 칸에 넣지 않는다)
     시간 질문  후보는 거의 안 바꾸고, 결과 문구의 분량 안내(tip)를 바꾼다
               (모든 게임이 언제든 멈출 수 있어서 시간으로는 걸러지지 않는다)

   데이터와 규칙 분리
     RULES 에는 "어느 칸에 어떤 게임, 왜, 얼마나"만 둔다.
     제목 · 색 · 이미지 · 플레이 링크는 허브의 games.js(GAMES)에서 id 로 꺼낸다.
     게임 정보가 바뀌어도 이 파일은 고칠 필요가 없다.

   한 칸에 후보가 여럿이면: 배열 맨 앞이 이긴다 (우선순위 고정).

   문구 속 ~ 는 "여기서 줄을 바꾸지 말 것" 표시. 화면에 넣을 때
   줄바꿈 없는 공백으로 바꿔, "둘 수 있습니다" 같은 묶음이
   좁은 화면에서 중간에 꺾이지 않게 한다.
   ============================================================ */

const RULES = {
  phone: {
    5: [
      { id: "be-the-bee",
        why: "한 수마다 자동 저장되어 언제 멈춰도 그~자리에서 이어~둘~수~있습니다.",
        tip: "AI와 한 판. 길어지면 저장해 두고 나중에 이어서~두면~됩니다." },
      { id: "otherside",
        why: "첫 원정은 튜토리얼이라 짧게 끝납니다.",
        tip: "첫 원정 한 번만." }
    ],
    15: [
      { id: "be-the-bee",
        why: "실력이 비슷할수록 한 판이 길어지는 대전 게임입니다. 끝까지 두기~좋은~시간입니다.",
        tip: "비슷한 난이도의 AI를 골라 끝까지 한 판." },
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
        why: "런 하나가 15분 안쪽이라 한 번에 끝까지 볼~수~있습니다. 키보드가 필요합니다.",
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

/* 줄바꿈 없는 공백(U+00A0) */
const NBSP = String.fromCharCode(160);

/* 지금 고른 답. 둘 다 정해지면 결과를 보여 준다 */
const answer = { time: null, device: null };

function findGame(id) {
  return GAMES.find(function (g) { return g.id === id; });
}

function pick(time, device) {
  const candidates = RULES[device][time];
  return candidates[0];
}

function copy(text) {
  return text.split("~").join(NBSP);
}

function showResult() {
  const box = document.getElementById("result");
  if (!answer.time || !answer.device) {
    box.hidden = true;
    return;
  }

  const rule = pick(answer.time, answer.device);
  const game = findGame(rule.id);

  box.style.setProperty("--c", game.color);
  document.getElementById("rImg").src = "../" + (game.imgFeat || game.img);
  document.getElementById("rKicker").textContent = game.kicker;
  document.getElementById("rTitle").textContent = game.title;
  document.getElementById("rWhy").textContent = copy(rule.why);
  document.getElementById("rTip").textContent = copy(rule.tip);
  document.getElementById("rPlay").href = game.links.play;
  document.getElementById("rAbout").href = "../" + game.page;
  box.hidden = false;
}

/* 질문 버튼: 같은 줄에서 하나만 눌린 상태로 */
document.querySelectorAll(".q").forEach(function (group) {
  const key = group.dataset.key;
  group.querySelectorAll("button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      group.querySelectorAll("button").forEach(function (b) {
        b.setAttribute("aria-pressed", "false");
      });
      btn.setAttribute("aria-pressed", "true");
      answer[key] = btn.dataset.value;
      showResult();
    });
  });
});
