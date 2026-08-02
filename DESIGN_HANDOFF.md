# 디자인 브리프: soomin007 게임 허브 (soomin007.github.io)

> 이 파일을 클로드 디자인(또는 다른 디자인 도구)에 그대로 붙여 넣으면 됩니다.
> **운영 루틴: 이 문서는 "다음 시안에 필요한 것"만 담는다.** 시안이 채택·적용되면
> 해당 요구·방향 서술은 이 문서에서 지우고, 현재 상태 기준으로 갱신한다.
> 이미 적용된 결과물의 기록은 세션 로그와 git 히스토리가 맡는다.

## 무엇을 만드는가

개인이 혼자 만든 웹 게임 5개를 모아 보여주는 **원페이지 게임 허브**.
인스타그램 프로필에 거는 링크 하나가 이 페이지로 온다. 방문자의 대부분은 **폰**으로 들어온다.
페이지의 단일한 일: 방문자가 30초 안에 자기에게 맞는 게임 하나를 골라 "바로 플레이"를 누르게 한다.

- 라이브: https://soomin007.github.io/
- 저장소: https://github.com/soomin007/soomin007.github.io

## 절대 제약 (어겨지면 시안을 쓸 수 없음)

1. **호스팅은 GitHub Pages(정적 서빙).** 서버 코드·DB·API 키는 못 쓴다.
   단, **클라이언트 JS 인터랙션은 제한 없다**. 화면 전환, 테마 전환, 애니메이션, 오디오 전부 가능.
2. **게임 데이터는 `games.js`의 `GAMES` 배열에서만 온다.** 게임 추가 시 이 배열에 항목 하나만 추가하면
   끝나야 한다. HTML에 게임 이름을 하드코딩하지 않는다. 데이터 계약(필드 정의)은 games.js 상단 주석이
   단일 진실이다: https://soomin007.github.io/games.js
3. **한국어 UI.** 본문 폰트는 Pretendard (CDN: `pretendardvariable-dynamic-subset.css`).
   문구는 표준 안내체(합쇼체)로 통일한다. em dash(U+2014)는 쓰지 않는다. `·`, 쉼표, 마침표로 잇는다.
4. **전 화면 다크 베이스.** 홈도 상세 테마도 어두운 배경 위에서 논다. 게임 세계의 밝은 재질(종이,
   양피지, 벌집)은 페이지 배경이 아니라 "어두운 무대 위에 조명을 받은 오브젝트"로 표현한다.
   화면 사이 전환은 크로스페이드(View Transitions, 0.3s, reduced-motion 존중)를 유지한다.
5. 외부 요청은 폰트 CDN 정도만. 추적기·분석 스크립트 없음.
6. 이미지 lazy load. 첫 화면은 폰 LTE에서도 3초 안에 떠야 한다.
7. **빌드는 가급적 없이** (바닐라 HTML/CSS/JS, push 하면 그대로 뜨는 상태가 이상적).
   시안이 정말 필요로 하면 Vite + GitHub Actions 자동 배포까지는 허용. 프레임워크는 그만한 가치가 있을 때만.

## 현재 상태 (2026-08 기준, 이미 구현됨)

- 홈: 스팀 상점형. 상단 바 → 피처드 캐러셀(자동 6.5s, 스와이프·점) → 캡슐 그리드.
  피처드에 뜬 게임의 색이 히어로 글로우·버튼·점을 물들인다.
- 상세: `#g/<id>` 해시 라우팅. 게임별 세계관 테마 5종(1942 기밀문서 / 양피지 / 벌집 / 상황실 HUD /
  생태 도감) + 범용 다크 1종. 전부 다크 베이스.
- 적응: 터치 기기에서 `mobile: true` 게임 우선 정렬, `prefers-reduced-motion` 존중,
  375px~1920px 반응형.

새 시안은 이 상태를 대체하거나 개선하는 것이다. 위 구조를 지킬 필요는 없지만, 절대 제약과
"게임이 색을 가진다" 개념, 게임별 세계관 테마 상세는 유지하는 편이 좋다.

## 사용 가능한 이미지 (전부 라이브 URL)

| 용도 | URL | 크기 |
|---|---|---|
| Be the Bee 캡슐 | https://soomin007.github.io/assets/be-the-bee.webp | 1232x706 |
| ENIGMA 캡슐 | https://soomin007.github.io/assets/enigma.webp | 1232x706 |
| Otherside 캡슐 | https://soomin007.github.io/assets/otherside.webp | 1232x706 |
| Eyes on You 캡슐 | https://soomin007.github.io/assets/eyes-on-you.webp | 1232x706 |
| 적자생존 캡슐 | https://soomin007.github.io/assets/selection-pressure.webp | 1232x706 |
| 피처드 전용 5장 | https://soomin007.github.io/assets/feat/<게임id>.webp | 1680x800 |
| OG 썸네일 | https://soomin007.github.io/og.png | 1200x630 |
| 파비콘 | https://soomin007.github.io/icon.png | 256x256 |

## 산출물 형식

다음 중 하나:
- **A (선호)**: `index.html` + `styles.css` + `app.js` 세 파일. `games.js`는 라이브 데이터를 그대로 로드한다고 가정.
- **B**: 데이터가 인라인된 단일 `index.html` 프로토타입. (채택되면 A 형태로 분리해서 반영)

현재 코드는 저장소에서 그대로 볼 수 있다: https://github.com/soomin007/soomin007.github.io
