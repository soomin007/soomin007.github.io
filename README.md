# soomin007.github.io

게임 허브. 인스타 프로필에 거는 링크 하나가 여기로 온다.

**라이브: https://soomin007.github.io/**

스팀 상점 구조(상단 바 → 피처드 캐러셀 → 캡슐 그리드)의 원페이지.
게임마다 고유 색이 있고, 피처드에 뜬 게임의 색이 화면을 물들인다.

## 구조

```
index.html        뼈대. OG 태그, 폰트 로드, 빈 컨테이너
styles.css        전체 스타일 (스팀풍 다크 + 게임별 --tone)
games.js          게임 데이터 배열. 앞으로 유일하게 손댈 파일
app.js            games.js 를 읽어 캐러셀·그리드를 그림 + 기기/유입 경로 적응
assets/           게임별 캡슐 이미지 (1232x706 webp)
og.png            카톡·인스타 공유 썸네일 (1200x630)
icon.png          파비콘 (256x256)
DESIGN_HANDOFF.md 디자인 도구에 넘기는 브리프 (제약·데이터·에셋 URL)
```

빌드 과정이 없다. HTML/CSS/JS 정적 파일뿐이라 push 하면 바로 반영된다.

## 적응형 동작

- **반응형**: 375px~1920px. 880px 아래에서 히어로가 세로로 쌓인다.
- **기기**: 터치 기기에선 `mobile: true` 게임이 먼저 정렬된다. 키보드 필요 게임엔 표시가 붙는다.
- **유입 경로**: `?from=insta` `?from=github` `?from=itch` 쿼리(또는 referrer 자동 감지)로
  상단 환영 배너가 바뀐다. 인스타 프로필에는 `https://soomin007.github.io/?from=insta` 를 걸면 된다.
- **모션**: `prefers-reduced-motion` 이면 캐러셀 자동 회전이 꺼진다.

## 게임 추가

1. 캡슐 이미지 하나 생성 (대표 스크린샷/키아트 → 16:9):
   ```
   ffmpeg -y -i <원본> -vf "crop=...,scale=1232:706" -c:v libwebp -q:v 82 assets/<게임id>.webp
   ```
2. `games.js` 의 `GAMES` 배열에 항목 추가. 나머지 파일은 손대지 않는다.

```js
{
  id: "새-게임",              // 앵커용. 영소문자·하이픈
  title: "새 게임",
  kicker: "장르 한 줄",
  line: "무엇을 하는 게임인가 한 문장",
  color: "#RRGGBB",           // 이 게임의 색. 글로우·버튼·점에 쓰인다
  year: "2026",
  meta: ["1인", "엔진", "특징"],
  status: "live",             // 또는 "wip" ("앞서 해보기" 리본)
  note: "",                   // 미리 알릴 주의사항 (키보드 필요 등)
  first: false,               // "처음이라면" 표. 전체에서 하나만 true
  mobile: true,               // 터치만으로 플레이 가능한가. 폰에선 true 가 먼저 정렬
  img: "assets/새-게임.webp", // 캡슐 이미지
  links: { play: "", code: "", itch: "" }
}
```

배열 순서가 곧 데스크톱 화면 순서다. 처음 온 사람이 제일 쉽게 붙는 게임을 맨 위에 둔다.

## 남은 일

- [ ] (선택) 다른 게임을 itch.io에 올리게 되면 games.js 의 itch 칸 채우기.
      itch 업로드 자체는 의무가 아니다 — 허브는 GitHub Pages 링크만으로 완결된다
- [ ] 커스텀 도메인을 살 경우: 이 저장소 Settings → Pages → Custom domain 에 등록.
      그러면 프로젝트 페이지도 전부 새 도메인 아래로 따라온다. 기존 주소는 깃허브가 리다이렉트한다
