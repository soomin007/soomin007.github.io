/* ============================================================
   게임 목록. 새 게임이 생기면 여기에 항목 하나만 추가하면 된다.
   (JSON 대신 .js 인 이유: file:// 로 열어도 fetch 없이 바로 뜬다)

   필드
     id        앵커·해시 라우팅용 고유 문자열. 영소문자·하이픈만. (#g/<id>)
     title     표시할 제목
     kicker    제목 위 한 줄. 장르·형식
     line      카드·피처드에 쓰는 한 줄. "무엇을 하는 게임인가"만
     lineLong  상세 페이지용 확장 설명. 없으면 line 을 쓴다
     color     이 게임의 색. 홈 글로우·버튼·점 인디케이터에 쓰인다
     year      연도. yearLabel 이 있으면 상세에선 그걸 우선 표시 (연출용)
     meta      카드 태그 칩. 3개까지 보인다
     status    'live' | 'wip'  (wip 은 "앞서 해보기" 리본)
     note      방문자에게 미리 알려야 할 주의. 없으면 빈 문자열
     first     true 인 카드에 "입문 추천" 표가 붙는다. 하나만
     mobile    true = 터치만으로 플레이 가능. 폰에서는 이 게임들이 먼저 정렬된다
     img       캡슐 이미지 경로 (assets/<id>.webp, 1232x706 권장)
     theme     상세 페이지 테마: 'enigma'|'sand'|'bee'|'hud'|'eco'|'' (빈 값 = 범용 다크)
     tag       상세 페이지 우상단 연출 문구
     facts     상세 페이지 표. {k,v} 4개 내외. 검증된 사실만. 수치를 지어내지 않는다
     links     play / code / itch. 없는 건 빈 문자열로 두면 버튼이 안 나온다
   ============================================================ */

const GAMES = [
  {
    id: "be-the-bee",
    title: "Be the Bee",
    kicker: "2인 육각 보드게임",
    line: "타일을 깔아 벌집을 키우고, 같은 색 꿀벌 5마리를 한 줄로 이으면 승리하는 보드게임입니다.",
    lineLong: "",
    color: "#F0B429",
    year: "2026",
    yearLabel: "",
    meta: ["2인", "온라인 대전", "AI 대전"],
    status: "live",
    note: "",
    first: true,
    mobile: true,
    img: "assets/be-the-bee.webp",
    theme: "bee",
    tag: "HIVE · 오늘도 확장 중",
    facts: [
      { k: "인원", v: "2인 (온라인 · AI 대전)" },
      { k: "변형", v: "여왕벌 모드 · 무한 모드" },
      { k: "환경", v: "폰 · PC 모두" },
      { k: "상태", v: "라이브" }
    ],
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
    line: "1942년 블레츨리 파크에서 실제 2차대전 암호 다섯 가지를 직접 해독하는 퍼즐 게임입니다.",
    lineLong: "1942년 블레츨리 파크에서 실제 2차대전 암호 다섯 가지를 직접 해독합니다. 라디오를 감청하고, 단서를 조합해 보고서를 제출합니다. 15개 스테이지와 3가지 엔딩이 준비되어 있습니다.",
    color: "#C2453D",
    year: "2026",
    yearLabel: "1942 ~ 2026",
    meta: ["1인", "15 스테이지", "엔딩 3종"],
    status: "live",
    note: "",
    first: false,
    mobile: true,
    img: "assets/enigma.webp",
    theme: "enigma",
    tag: "문서 № E-1942-05 · 복호화 완료",
    facts: [
      { k: "인원", v: "1인" },
      { k: "분량", v: "15 스테이지 · 엔딩 3종" },
      { k: "환경", v: "폰 · PC 모두" },
      { k: "상태", v: "라이브" }
    ],
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
    line: "폭풍마다 원정대가 떠나고 대부분 돌아오지 못합니다. 죽기 전 단 한 번, 다음 원정대에게 물건을 남길 수 있습니다.",
    lineLong: "폭풍마다 원정대가 떠나고 대부분 돌아오지 못합니다. 모래폭풍이 글씨를 지우는 세계라 말은 남길 수 없습니다. 죽기 전 단 한 번, 다음 원정대에게 물건 하나를 남길 수 있습니다.",
    color: "#C2B49A",
    year: "2026",
    yearLabel: "",
    meta: ["1인", "Godot 4.6"],
    status: "live",
    note: "",
    first: false,
    mobile: true,
    img: "assets/otherside.webp",
    theme: "sand",
    tag: "제 41차 원정 기록",
    facts: [
      { k: "인원", v: "1인" },
      { k: "엔진", v: "Godot 4.6" },
      { k: "환경", v: "폰 · PC 모두" },
      { k: "상태", v: "라이브" }
    ],
    links: {
      play: "https://soomin007.github.io/Otherside/",
      code: "https://github.com/soomin007/Otherside",
      itch: "https://soominsnu.itch.io/see-you-on-the-other-side"
    }
  },
  {
    id: "eyes-on-you",
    title: "Eyes on You",
    kicker: "횡스크롤 로그라이트",
    line: "AI 파트너 VEIL의 조언을 따르거나 무시하며 임무를 수행합니다. 마지막에 VEIL의 정체가 드러납니다.",
    lineLong: "",
    color: "#5B8DEF",
    year: "2026",
    yearLabel: "",
    meta: ["1인", "Godot 4.6", "8~15분", "엔딩 4종"],
    status: "live",
    note: "키보드가 필요한 게임입니다. PC 환경을 권장합니다.",
    first: false,
    mobile: false,
    img: "assets/eyes-on-you.webp",
    theme: "hud",
    tag: "SESSION 7734 · 암호화됨",
    facts: [
      { k: "인원", v: "1인" },
      { k: "한 판", v: "8~15분 · 엔딩 4종" },
      { k: "환경", v: "PC · 키보드 필요" },
      { k: "엔진", v: "Godot 4.6" }
    ],
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
    line: "직접 조작하지 않는 게임입니다. 라운드 사이에 카드를 고르면 생태계 시뮬레이션이 결과를 보여 줍니다.",
    lineLong: "",
    color: "#6FBF8B",
    year: "2026",
    yearLabel: "",
    meta: ["1인", "TypeScript · PixiJS", "모바일 세로"],
    status: "wip",
    note: "",
    first: false,
    mobile: true,
    img: "assets/selection-pressure.webp",
    theme: "eco",
    tag: "관찰 일지 · 갱신됨",
    facts: [
      { k: "조작", v: "없음 · 관전 + 카드 선택" },
      { k: "스택", v: "TypeScript · PixiJS" },
      { k: "환경", v: "모바일 세로 최적" },
      { k: "상태", v: "앞서 해보기" }
    ],
    links: {
      play: "https://soomin007.github.io/selection-pressure/",
      code: "https://github.com/soomin007/selection-pressure",
      itch: ""
    }
  }
];
