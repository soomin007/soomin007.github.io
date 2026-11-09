// 페이지 글 검사: 폭마다 (1) 가로 넘침 (2) 화면 가장자리 20px 여백 (3) 구절 중간에서 꺾인 줄을 찾는다.
//
// 빌드 도구 없이 쓰는 저장소라 Playwright 는 Be the Bee 저장소의 것을 빌려 쓴다.
//   NODE_PATH="<Be the Bee 저장소>/node_modules" node tools/check-text.cjs http://localhost:8130/g/outlet-villains/
// 폭을 뒤에 적으면 그 폭만 본다(기본 320, 360, 390, 1440).
//
// (3)은 다음 줄이 의존 명사나 보조 용언("수", "것", "두면", "봤습니다")이나 단위("명", "개", "가지")로
// 시작하는 자리를 고른다. "보이지"처럼 낱말을 잘못 짚는 경우가 있으니, 걸린 줄은 사람이 보고 판단해서
// 끊기면 안 되는 묶음만 <span class="nw"> 로 감싼다 (전역 CLAUDE.md 글쓰기 규칙, known-issues #1).
const { chromium } = require('playwright');

const url = process.argv[2];
const widths = process.argv.length > 3 ? process.argv.slice(3).map(Number) : [320, 360, 390, 1440];
if (!url) {
  console.log('주소를 적어 주세요. 예: node tools/check-text.cjs http://localhost:8130/');
  process.exit(1);
}

(async () => {
  const browser = await chromium.launch();
  let problems = 0;
  for (const w of widths) {
    const page = await browser.newPage({ viewport: { width: w, height: 900 }, isMobile: w < 900, hasTouch: w < 900 });
    await page.goto(url + (url.includes('?') ? '&' : '?') + 'v=' + Date.now());
    await page.waitForTimeout(1200);
    const r = await page.evaluate(() => {
      const startBad = /^(수|것|때|줄|뿐|듯|만큼|적|중|데|있|없|두|뒀|놓|놨|버|보|봤|주|줬|싶|하|되|드리|드립|대|개|명|가지|컷|번|쪽|편|채|졌|져)(\s|[다니습었는은을를이가도요며고게지서면,.]|$)/;
      const near = [];
      const breaks = [];
      for (const el of document.querySelectorAll('p, h1, h2, h3, figcaption, li > p')) {
        const box = el.getBoundingClientRect();
        if (!box.width || getComputedStyle(el).visibility === 'hidden') continue;
        if (box.left < 19.5 || box.right > innerWidth - 19.5) near.push(`${el.tagName} "${el.textContent.trim().slice(0, 16)}" ${Math.round(box.left)}~${Math.round(box.right)}`);
        // 글자마다 위치를 재서 실제 줄로 나눈다
        const lines = [];
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) {
          for (let i = 0; i < node.length; i++) {
            const range = document.createRange();
            range.setStart(node, i);
            range.setEnd(node, i + 1);
            const rect = range.getClientRects()[0];
            if (!rect) continue;
            const top = Math.round(rect.top);
            let line = lines.find(l => Math.abs(l.top - top) < 4);
            if (!line) { line = { top, text: '' }; lines.push(line); }
            line.text += node.data[i];
          }
        }
        lines.sort((a, b) => a.top - b.top);
        for (let k = 0; k + 1 < lines.length; k++) {
          const a = lines[k].text.trim(), b = lines[k + 1].text.trim();
          if (startBad.test(b)) breaks.push(`${a.slice(-14)} / ${b.slice(0, 14)}`);
        }
      }
      return { overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth, near, breaks };
    });
    console.log(`== ${w}px: 넘침 ${r.overflow ? '있음' : '없음'}, 여백 부족 ${r.near.length}곳, 확인할 줄바꿈 ${r.breaks.length}곳`);
    r.near.forEach(s => console.log('  여백: ' + s));
    r.breaks.forEach(s => console.log('  줄: ' + s));
    if (r.overflow || r.near.length) problems++;
    await page.close();
  }
  await browser.close();
  process.exit(problems ? 1 : 0);
})();
