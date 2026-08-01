/* ============================================================
   게임 목록. 새 게임이 생기면 여기에 항목 하나만 추가하면 된다.
   (JSON 대신 .js 인 이유: file:// 로 열어도 fetch 없이 바로 뜬다)

   필드
     id       앵커용 고유 문자열. 영소문자·하이픈만.
     title    표시할 제목
     kicker   제목 위 한 줄. 장르·형식
     line     카드 본문 한 줄. "무엇을 하는 게임인가"만
     color    이 게임의 색. 히어로 글로우·버튼·점 인디케이터에 쓰인다
     year     출시/작업 연도
     meta     표찰(태그 칩)에 찍히는 항목들. 3~4개까지가 읽힌다
     status   'live' | 'wip'  (wip 은 "앞서 해보기" 리본이 붙는다)
     note     방문자에게 미리 알려야 할 주의. 없으면 빈 문자열
     first    true 인 카드에 "처음이라면" 표가 붙는다. 하나만
     mobile   true = 터치만으로 플레이 가능. 폰에서는 이 게임들이 먼저 정렬된다
     img      캡슐 이미지 경로 (assets/<id>.webp, 1232x706 권장)
     links    play / code / itch. 없는 건 빈 문자열로 두면 버튼이 안 나온다
   ============================================================ */

const GAMES = [
  {
    id: "be-the-bee",
    title: "Be the Bee",
    kicker: "2인 육각 보드게임",
    line: "타일을 깔아 벌집을 키우고, 같은 색 꿀벌 5마리를 한 줄로 잇는 쪽이 이긴다.",
    color: "#F0B429",
    year: "2026",
    meta: ["2인", "온라인 대전", "AI 대전"],
    status: "live",
    note: "",
    first: true,
    mobile: true,
    img: "assets/be-the-bee.webp",
    links: {
      play: "https://soomin007.github.io/be-the-bee/",
      code: "https://github.com/soomin007/be-the-bee",
      itch: ""
    }
  },
  {
    id: "enigma",
    title: "ENIGMA",
    kicker: "암호 해독 퍼즐",
    line: "1942년 블레츨리 파크. 실제 2차대전 암호 다섯 가지를 직접 돌려 통신을 푼다.",
    color: "#C2453D",
    year: "2026",
    meta: ["1인", "15 스테이지", "엔딩 3종"],
    status: "live",
    note: "",
    first: false,
    mobile: true,
    img: "assets/enigma.webp",
    links: {
      play: "https://soomin007.github.io/Enigma/",
      code: "https://github.com/soomin007/Enigma",
      itch: "https://soominsnu.itch.io/enigma"
    }
  },
  {
    id: "otherside",
    title: "See you on the other side",
    kicker: "비동기 로그라이트",
    line: "폭풍마다 원정대가 떠나고 거의 다 죽는다. 죽기 전 단 한 번, 다음 원정대에게 물건을 남길 수 있다.",
    color: "#C2B49A",
    year: "2026",
    meta: ["1인", "Godot 4.6"],
    status: "live",
    note: "",
    first: false,
    mobile: true,
    img: "assets/otherside.webp",
    links: {
      play: "https://soomin007.github.io/Otherside/",
      code: "https://github.com/soomin007/Otherside",
      itch: ""
    }
  },
  {
    id: "eyes-on-you",
    title: "Eyes on You",
    kicker: "횡스크롤 로그라이트",
    line: "AI 파트너 VEIL의 조언을 따르거나 무시하며 임무를 해치운다. 마지막에 VEIL이 누구였는지 드러난다.",
    color: "#5B8DEF",
    year: "2026",
    meta: ["1인", "Godot 4.6", "8~15분", "엔딩 4종"],
    status: "live",
    note: "키보드가 필요합니다. PC에서 여세요.",
    first: false,
    mobile: false,
    img: "assets/eyes-on-you.webp",
    links: {
      play: "https://soomin007.github.io/EyesOnYou/",
      code: "https://github.com/soomin007/EyesOnYou",
      itch: ""
    }
  },
  {
    id: "selection-pressure",
    title: "적자생존",
    kicker: "관전형 진화 로그라이크",
    line: "직접 조작하지 않는다. 라운드 사이에 카드를 고르면 생태 시뮬이 결과를 살아 움직이게 한다.",
    color: "#6FBF8B",
    year: "2026",
    meta: ["1인", "TypeScript · PixiJS", "모바일 세로"],
    status: "wip",
    note: "",
    first: false,
    mobile: true,
    img: "assets/selection-pressure.webp",
    links: {
      play: "https://soomin007.github.io/selection-pressure/",
      code: "https://github.com/soomin007/selection-pressure",
      itch: ""
    }
  }
];
