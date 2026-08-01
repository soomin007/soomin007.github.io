# soomin007.github.io

게임 허브. 인스타 프로필에 거는 링크 하나가 여기로 온다.

**라이브: https://soomin007.github.io/**

## 배포

이 저장소의 이름은 반드시 `soomin007.github.io` 여야 한다. 이 이름일 때만 계정 루트 페이지가 된다.

1. 새 저장소 `soomin007.github.io` 생성 (public)
2. 이 폴더 내용을 그대로 push
3. Settings → Pages → Source: `Deploy from a branch` → `main` / `(root)`
4. 1~2분 뒤 `https://soomin007.github.io/` 에서 확인

빌드 과정이 없다. HTML/CSS/JS 정적 파일뿐이라 push 하면 바로 반영된다.

## 게임 추가

`games.js` 의 `GAMES` 배열에 항목 하나 추가. 나머지 파일은 손대지 않는다.

```js
{
  id: "새-게임",              // 앵커용. 영소문자·하이픈
  title: "새 게임",
  kicker: "장르 한 줄",
  line: "무엇을 하는 게임인가 한 문장",
  color: "#RRGGBB",           // 이 게임의 색. 목차 띠와 카드 왼쪽 선
  year: "2026",
  meta: ["1인", "엔진", "플레이 시간"],
  status: "live",             // 또는 "wip"
  note: "",                   // 모바일에서 못 하는 게임이면 여기에 경고
  first: false,               // "처음이라면" 표. 전체에서 하나만 true
  links: { play: "", code: "", itch: "" }
}
```

배열 순서가 곧 화면 순서다. 처음 온 사람이 제일 쉽게 붙는 게임을 맨 위에 둔다.

## 남은 일

- [ ] `og.png` 추가 (1200×630). 카톡·인스타에 링크를 붙였을 때 뜨는 썸네일. 없으면 회색 상자만 나온다
- [ ] `favicon.ico` 또는 `icon.png` 추가
- [ ] 커스텀 도메인을 살 경우: 이 저장소 Settings → Pages → Custom domain 에 등록.
      그러면 `soomin007.github.io/be-the-bee` 같은 **프로젝트 페이지도 전부 새 도메인 아래로 따라온다.**
      기존 주소는 깃허브가 리다이렉트하므로 이미 뿌린 링크는 죽지 않는다
- [ ] 게임별 스크린샷 1장씩 카드에 넣을지 결정 (넣으면 무거워지고, 안 넣으면 첫 화면이 빠르다)
