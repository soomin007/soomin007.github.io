# 디자인 브리프 — 김수민 게임 허브 (soomin007.github.io)

> 이 파일을 클로드 디자인(또는 다른 디자인 도구)에 그대로 붙여 넣으면 됩니다.
> 목표: 아래 제약과 데이터를 지키는 **더 나은 시안**을 생성하는 것.

## 무엇을 만드는가

개인이 혼자 만든 웹 게임 5개를 모아 보여주는 **원페이지 게임 허브**.
인스타그램 프로필에 거는 링크 하나가 이 페이지로 온다. 방문자의 대부분은 **폰**으로 들어온다.
페이지의 단일한 일: 방문자가 30초 안에 자기에게 맞는 게임 하나를 골라 "바로 플레이"를 누르게 한다.

- 라이브: https://soomin007.github.io/
- 저장소: https://github.com/soomin007/soomin007.github.io

## 절대 제약 (어겨지면 시안을 쓸 수 없음)

1. **호스팅은 GitHub Pages(정적 서빙).** 서버 코드·DB·API 키는 못 쓴다.
   단, **클라이언트 JS 인터랙션은 제한 없다** — 화면 전환, 테마 전환, 애니메이션, 오디오 전부 가능.
2. **게임 데이터는 `games.js`의 `GAMES` 배열에서만 온다.** 게임 추가 시 이 배열에 항목 하나만 추가하면
   끝나야 한다. HTML에 게임 이름을 하드코딩하지 않는다. (테마가 게임별로 달라진다면 테마 토큰도
   games.js 항목 안에 데이터로 넣는다.)
3. **한국어 UI.** 본문 폰트는 Pretendard (CDN: `pretendardvariable-dynamic-subset.css`).
4. 외부 요청은 폰트 CDN 정도만. 추적기·분석 스크립트 없음.
5. 이미지 lazy load. 첫 화면은 폰 LTE에서도 3초 안에 떠야 한다.
6. **빌드는 가급적 없이** (바닐라 HTML/CSS/JS, push 하면 그대로 뜨는 상태가 이상적).
   시안이 정말 필요로 하면 Vite + GitHub Actions 자동 배포까지는 허용 — 다른 저장소들(be-the-bee,
   selection-pressure)이 이미 쓰는 방식이다. 프레임워크 도입은 그만한 가치가 있을 때만.

## 요구 기능 (현재 구현돼 있고, 새 시안도 갖춰야 함)

- **반응형**: 375px 폰 ~ 1920px 데스크톱. 가로 스크롤 금지.
- **기기 적응**: 터치 기기(`pointer: coarse`)에서는 `mobile: true` 게임을 먼저 정렬.
  `mobile: false` 게임(키보드 필요)은 '키보드 필요' 표시.
- **유입 경로 적응**: `?from=insta|github|itch` 쿼리 또는 referrer 감지 → 상단에 한 줄 환영 배너.
- **피처드 영역**: 게임 하나를 크게 보여주는 회전 캐러셀 (자동 6.5s, 화살표·점·스와이프,
  `prefers-reduced-motion`이면 자동 회전 정지).
- 접근성: 키보드 포커스 표시, 캐러셀 버튼에 aria-label, 이미지 alt.

## 디자인 방향

- **베이스라인: 스팀 상점.** 상단 바 → 피처드 캐러셀 → 캡슐 그리드 구조. 어두운 배경.
- 현재 시안의 시그니처: **게임마다 고유 색(`color` 필드)이 있고, 피처드에 뜬 게임의 색이
  히어로 글로우·버튼·점 인디케이터를 물들인다.** 이 "게임이 색을 가진다" 개념은 유지하면 좋음.
- wip 게임은 스팀 오마주로 "앞서 해보기" 리본. `first: true` 게임에는 "처음이라면" 표시.
- 각 카드: 캡슐 이미지(16:9) + 제목 + 한 줄 설명 + 태그 칩 + "무료 · 브라우저" + 플레이 버튼.
- 이 틀 안에서 타이포·레이아웃·모션은 자유롭게 실험해도 된다. 단정하고 조용하게, 게임 이미지가 주인공.

### 탐색해볼 방향 — 게임 테마로 펼쳐지는 인터랙티브 소개 (사용자 관심사)

목록에서 게임을 누르면 목록 위에 **그 게임의 세계관 테마로 소개 화면이 펼쳐지는** 구성.
색만 바뀌는 게 아니라 타이포·질감·모션까지 그 게임의 것으로:

- **ENIGMA** → 1942년 기밀문서. 타자기 서체, 도장·검열 바, 종이 질감, 글자가 타이핑되듯 등장
- **See you on the other side** → 모래폭풍과 양피지. 세리프 각인 타이포, 모래가 흩어지는 전환
- **Be the Bee** → 밝은 벌집. 육각 격자 모티프, 꿀색, 통통 튀는 모션
- **Eyes on You** → 상황실 HUD. 모노스페이스, 스캔라인, VEIL의 시선 마커
- **적자생존** → 생태 도감. 표본 카드, 형질 수치 게이지, 생물이 꼬물대는 배경

구현 힌트: 테마 토큰(색·폰트·질감·모션 파라미터)을 games.js 각 항목에 `theme` 객체로 넣고,
소개 화면은 하나의 템플릿이 테마 토큰을 읽어 변신하는 구조면 게임 추가 시에도 데이터만 넣으면 된다.
소개 화면에 들어갈 내용: 캡슐 대신 큰 스크린샷, line 확장 설명, 조작법/인원/플레이 환경, 플레이·소스 버튼.
전환은 빠르고(300ms대) 뒤로가기(브라우저 back)로 목록에 돌아올 수 있어야 한다 (해시 라우팅 `#게임id` 권장).

## 게임 데이터 (games.js 전문 — 이 계약을 유지할 것)

```js
const GAMES = [
  {
    id: "be-the-bee",
    title: "Be the Bee",
    kicker: "2인 육각 보드게임",
    line: "타일을 깔아 벌집을 키우고, 같은 색 꿀벌 5마리를 한 줄로 잇는 쪽이 이긴다.",
    color: "#F0B429", year: "2026",
    meta: ["2인", "온라인 대전", "AI 대전"],
    status: "live", note: "", first: true, mobile: true,
    img: "assets/be-the-bee.webp",
    links: { play: "https://soomin007.github.io/be-the-bee/",
             code: "https://github.com/soomin007/be-the-bee", itch: "" }
  },
  {
    id: "enigma",
    title: "ENIGMA",
    kicker: "암호 해독 퍼즐",
    line: "1942년 블레츨리 파크. 실제 2차대전 암호 다섯 가지를 직접 돌려 통신을 푼다.",
    color: "#C2453D", year: "2026",
    meta: ["1인", "15 스테이지", "엔딩 3종"],
    status: "live", note: "", first: false, mobile: true,
    img: "assets/enigma.webp",
    links: { play: "https://soomin007.github.io/Enigma/",
             code: "https://github.com/soomin007/Enigma",
             itch: "https://soominsnu.itch.io/enigma" }
  },
  {
    id: "otherside",
    title: "See you on the other side",
    kicker: "비동기 로그라이트",
    line: "폭풍마다 원정대가 떠나고 거의 다 죽는다. 죽기 전 단 한 번, 다음 원정대에게 물건을 남길 수 있다.",
    color: "#C2B49A", year: "2026",
    meta: ["1인", "Godot 4.6"],
    status: "live", note: "", first: false, mobile: true,
    img: "assets/otherside.webp",
    links: { play: "https://soomin007.github.io/Otherside/",
             code: "https://github.com/soomin007/Otherside",
             itch: "https://soominsnu.itch.io/see-you-on-the-other-side" }
  },
  {
    id: "eyes-on-you",
    title: "Eyes on You",
    kicker: "횡스크롤 로그라이트",
    line: "AI 파트너 VEIL의 조언을 따르거나 무시하며 임무를 해치운다. 마지막에 VEIL이 누구였는지 드러난다.",
    color: "#5B8DEF", year: "2026",
    meta: ["1인", "Godot 4.6", "8~15분", "엔딩 4종"],
    status: "live", note: "키보드가 필요합니다. PC에서 여세요.", first: false, mobile: false,
    img: "assets/eyes-on-you.webp",
    links: { play: "https://soomin007.github.io/EyesOnYou/",
             code: "https://github.com/soomin007/EyesOnYou", itch: "" }
  },
  {
    id: "selection-pressure",
    title: "적자생존",
    kicker: "관전형 진화 로그라이크",
    line: "직접 조작하지 않는다. 라운드 사이에 카드를 고르면 생태 시뮬이 결과를 살아 움직이게 한다.",
    color: "#6FBF8B", year: "2026",
    meta: ["1인", "TypeScript · PixiJS", "모바일 세로"],
    status: "wip", note: "", first: false, mobile: true,
    img: "assets/selection-pressure.webp",
    links: { play: "https://soomin007.github.io/selection-pressure/",
             code: "https://github.com/soomin007/selection-pressure", itch: "" }
  }
];
```

## 사용 가능한 이미지 (전부 라이브 URL)

| 용도 | URL | 크기 |
|---|---|---|
| Be the Bee 캡슐 | https://soomin007.github.io/assets/be-the-bee.webp | 1232x706 |
| ENIGMA 캡슐 | https://soomin007.github.io/assets/enigma.webp | 1232x706 |
| Otherside 캡슐 | https://soomin007.github.io/assets/otherside.webp | 1232x706 |
| Eyes on You 캡슐 | https://soomin007.github.io/assets/eyes-on-you.webp | 1232x706 |
| 적자생존 캡슐 | https://soomin007.github.io/assets/selection-pressure.webp | 1232x706 |
| OG 썸네일 | https://soomin007.github.io/og.png | 1200x630 |
| 파비콘 | https://soomin007.github.io/icon.png | 256x256 |

## 산출물 형식

다음 중 하나:
- **A (선호)**: `index.html` + `styles.css` + `app.js` 세 파일. `games.js`는 위 데이터 그대로 로드한다고 가정.
- **B**: 데이터가 인라인된 단일 `index.html` 프로토타입. (채택되면 A 형태로 분리해서 반영)

현재 코드가 궁금하면 저장소에서 그대로 볼 수 있다: https://github.com/soomin007/soomin007.github.io
