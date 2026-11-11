/* ============================================================
   게임 목록. 새 게임이 생기면 여기에 항목 하나만 추가하면 된다.
   (JSON 대신 .js 인 이유: file:// 로 열어도 fetch 없이 바로 뜬다)

   필드
     id        앵커와 해시 라우팅용 고유 문자열. 영소문자와 하이픈만. (#g/<id>)
     page      전용 소개 페이지 경로 (예: "g/enigma/"). 있으면 카드와 피처드가 그 페이지로
               가고, 옛 #g/<id> 링크는 그 페이지로 리다이렉트된다. 없으면 내장 상세를 쓴다
     title     표시할 제목
     kicker    장르나 형식 한 줄. 제목 아래에 놓인다 (제목 위 꼬리표로 쓰지 않는다)
     line      카드와 피처드에 쓰는 한 줄. "무엇을 하는 게임인가"만.
               줄이 바뀌면 안 되는 묶음은 ~ 로 잇는다 (파일 끝에서 줄바꿈 없는 공백으로 바뀐다)
     lineLong  상세 페이지용 확장 설명. 없으면 line 을 쓴다
     color     이 게임의 색. 홈 글로우, 버튼, 점 인디케이터에 쓰인다
     year      연도. yearLabel 이 있으면 상세에선 그걸 우선 표시 (연출용)
     meta      카드 태그 칩. 3개까지 보인다
     status    'live' | 'wip' | 'paused'  (wip 은 "앞서 해보기", paused 는 "개발 보류" 리본.
               paused 는 폐기가 아니라 보류: 플레이 링크는 살아 있고 카드도 그대로 노출된다)
     note      방문자에게 미리 알려야 할 주의. 없으면 빈 문자열
     first     true 인 카드에 "입문 추천" 표가 붙는다. 하나만
     mobile    true = 터치만으로 플레이 가능. 폰에서는 이 게임들이 먼저 정렬된다
     img       캡슐 이미지 경로 (assets/<id>.webp, 1232x706 권장)
     imgFeat   피처드 캐러셀 전용 이미지 (assets/feat/<id>.webp, 1680x800 권장).
               하단 45%는 어둡고 비어 있게 만들어 오버레이 문구 자리를 확보한다.
               게임 UI나 글자가 박힌 스크린샷을 그대로 쓰지 않는다. 없으면 img 를 쓴다
     theme     (구버전 내장 테마 식별자. 전용 페이지 체제 이후 미사용, 기록용으로만 남김)
     tag       상세 페이지 우상단 연출 문구
     facts     상세 페이지 표. {k,v} 4개 내외. 검증된 사실만. 수치를 지어내지 않는다
     shots     상세 갤러리. {src, cap} 배열 (assets/shots/<id>-*.webp). 없으면 [] 로.
               테마가 액자 연출을 정한다 (enigma=증거 사진, hud=CAM 피드, eco=표본 도판)
     links     play / code / itch. 없는 건 빈 문자열로 두면 버튼이 안 나온다

     맛보기(미니 체험)는 teasers.js 에 게임 id 로 등록한다. 등록이 없으면 섹션이 안 나온다
   ============================================================ */

const GAMES = [
  {
    id: "be-the-bee",
    page: "g/be-the-bee/",
    title: "Be the Bee",
    kicker: "2인 육각 보드게임",
    line: "타일을 깔아 벌집을 키우고, 같은 색 꿀벌 5마리를 한~줄로 이으면 승리하는 보드게임입니다.",
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
    imgFeat: "assets/feat/be-the-bee.webp",
    theme: "bee",
    tag: "오늘도 확장 중인 벌집",
    facts: [
      { k: "인원", v: "2인 (온라인 대전, AI 대전)" },
      { k: "변형", v: "여왕벌 모드, 무한 모드" },
      { k: "환경", v: "폰과 PC 모두" },
      { k: "상태", v: "라이브" }
    ],
    shots: [
      { src: "assets/shots/be-the-bee-turn.webp", cap: "타일을 이어 붙이며 판이 자란다" },
      { src: "assets/shots/be-the-bee-goal.webp", cap: "꿀벌 5개를 한 줄로" },
      { src: "assets/shots/be-the-bee-hivelock.webp", cap: "타일 5줄은 벌집이 되어 잠긴다" }
    ],
    links: {
      play: "https://soomin007.github.io/be-the-bee/",
      code: "https://github.com/soomin007/be-the-bee",
      itch: ""
    }
  },
  {
    id: "enigma",
    page: "g/enigma/",
    title: "ENIGMA",
    kicker: "암호 해독 퍼즐",
    line: "1942년 블레츨리 파크에서 실제 2차대전 암호 다섯~가지를 직접 해독하는 퍼즐 게임입니다.",
    lineLong: "1942년 블레츨리 파크에서 실제 2차대전 암호 다섯 가지를 직접 해독합니다. 라디오를 감청하고, 단서를 조합해 보고서를 제출합니다. 15개 스테이지와 3가지 엔딩이 준비되어 있습니다.",
    color: "#C2453D",
    year: "2026",
    yearLabel: "1942 ~ 2026",
    meta: ["1인", "15 스테이지", "엔딩 3종"],
    status: "live",
    note: "스마트폰은 지원하지 않습니다. PC에서 플레이해 주세요.",
    first: false,
    mobile: false,
    img: "assets/enigma.webp",
    imgFeat: "assets/feat/enigma.webp",
    theme: "enigma",
    tag: "문서 № E-1942-05, 복호화 완료",
    facts: [
      { k: "인원", v: "1인" },
      { k: "분량", v: "15 스테이지, 엔딩 3종" },
      { k: "환경", v: "PC" },
      { k: "상태", v: "라이브" }
    ],
    shots: [
      { src: "assets/shots/enigma-radio.webp", cap: "라디오 감청" },
      { src: "assets/shots/enigma-decoder.webp", cap: "해독기" },
      { src: "assets/shots/enigma-evidence.webp", cap: "증거 보드" }
    ],
    links: {
      play: "https://soomin007.github.io/Enigma/",
      code: "https://github.com/soomin007/Enigma",
      itch: "https://soominsnu.itch.io/enigma"
    }
  },
  {
    id: "otherside",
    page: "g/otherside/",
    title: "See you on the other side",
    kicker: "비동기 로그라이트",
    line: "폭풍마다 원정대가 떠나고 대부분 돌아오지 못합니다. 죽기 전 단~한~번, 다음 원정대에게 물건을 남길 수 있습니다.",
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
    imgFeat: "assets/feat/otherside.webp",
    theme: "sand",
    tag: "제 41차 원정 기록",
    facts: [
      { k: "인원", v: "1인" },
      { k: "엔진", v: "Godot 4.6" },
      { k: "환경", v: "폰과 PC 모두" },
      { k: "상태", v: "라이브" }
    ],
    shots: [
      { src: "assets/shots/otherside-storm.webp", cap: "폭풍이 온다" },
      { src: "assets/shots/otherside-pack.webp", cap: "가방을 꾸린다" },
      { src: "assets/shots/otherside-map.webp", cap: "다음 원정의 지도" }
    ],
    links: {
      play: "https://soomin007.github.io/Otherside/",
      code: "https://github.com/soomin007/Otherside",
      itch: "https://soominsnu.itch.io/see-you-on-the-other-side"
    }
  },
  {
    id: "eyes-on-you",
    page: "g/eyes-on-you/",
    title: "Eyes on You",
    kicker: "횡스크롤 다회차 서사 액션",
    line: "AI 파트너 VEIL의 조언을 따르거나 무시하며 임무를 수행합니다. 마지막에 VEIL의 정체가 드러납니다.",
    lineLong: "",
    color: "#5B8DEF",
    year: "2026",
    yearLabel: "",
    meta: ["1인", "Godot 4.6", "엔딩 4종"],
    status: "live",
    note: "키보드가 필요한 게임입니다. PC 환경을 권장합니다.",
    first: false,
    mobile: false,
    img: "assets/eyes-on-you.webp",
    imgFeat: "assets/feat/eyes-on-you.webp",
    theme: "hud",
    tag: "SESSION 7734, 암호화됨",
    facts: [
      { k: "인원", v: "1인" },
      { k: "분량", v: "한 판 완결, 엔딩 4종" },
      { k: "환경", v: "PC, 키보드 필요" },
      { k: "엔진", v: "Godot 4.6" }
    ],
    shots: [
      { src: "assets/shots/eyes-on-you-rooftops.webp", cap: "옥상 루트" },
      { src: "assets/shots/eyes-on-you-subway.webp", cap: "지하철 루트" },
      { src: "assets/shots/eyes-on-you-watchtower.webp", cap: "감시탑 루트" }
    ],
    links: {
      play: "https://soomin007.github.io/EyesOnYou/",
      code: "https://github.com/soomin007/EyesOnYou",
      itch: ""
    }
  },
  {
    id: "outlet-villains",
    page: "g/outlet-villains/",
    title: "충전이 필요해!",
    kicker: "카페 물건 밀기 퍼즐",
    line: "배터리가 떨어져 가는 카페 청소 로봇이, 콘센트를 독차지한 손님을 한 명씩 떠나보내는 짧은 퍼즐 게임입니다.",
    lineLong: "카페 바닥을 한 칸씩 움직이며 의자나 진동벨 같은 물건을 밀어서, 콘센트를 차지한 손님이 스스로 플러그를 뽑고 떠나게 만듭니다. 되돌리기와 처음부터는 언제든 할 수 있고, 실패해도 벌칙이 없습니다.",
    color: "#F2412F",
    year: "2026",
    yearLabel: "",
    meta: ["1인", "되돌리기 자유", "흑백 그림체"],
    status: "live",
    note: "스마트폰은 지원하지 않습니다. PC에서 플레이해 주세요.",
    first: false,
    mobile: false,
    img: "assets/outlet-villains.webp",
    imgFeat: "assets/feat/outlet-villains.webp",
    theme: "",
    tag: "",
    facts: [
      { k: "조작", v: "방향키(WASD), Z 되돌리기, R 처음부터" },
      { k: "환경", v: "PC" },
      { k: "그림체", v: "흑백 (빌런마다 고유색)" },
      { k: "만든 계기", v: "시리어스 게임 수업 활동" },
      { k: "상태", v: "라이브" }
    ],
    shots: [
      { src: "assets/shots/outlet-villains-cafe.webp", cap: "카공 손님으로 가득한 카페" },
      { src: "assets/shots/outlet-villains-unplug.webp", cap: "충전 독의 플러그를 뽑고 콘센트를 차지한 손님" },
      { src: "assets/shots/outlet-villains-dock.webp", cap: "배터리가 떨어져 가는 청소 로봇" }
    ],
    links: {
      play: "https://soomin007.github.io/outlet-villains/",
      code: "https://github.com/soomin007/outlet-villains",
      itch: ""
    }
  }
];

/* 문구 안의 ~ 는 줄이 바뀌면 안 되는 묶음 표시다 (known-issues #13). 이 파일을 읽는 모든 화면
   (허브, 섬, 전시관)이 같은 문구를 쓰도록 여기서 한 번 줄바꿈 없는 공백으로 바꾼다.
   yearLabel 의 범위 표기(1942 ~ 2026)는 건드리지 않는다 */
GAMES.forEach(function (g) {
  ["line", "lineLong", "note"].forEach(function (k) {
    if (g[k]) g[k] = g[k].replace(/~/g, String.fromCharCode(160));
  });
});
