// 홈 피처드 캐러셀의 글 칸 높이를 폰 폭마다 슬라이드별로 잰다 (known-issues #29).
// 폰에서는 글이 그림 아래 칸에 있어서, 슬라이드마다 높이가 다르면 자동으로 넘어갈 때 아래 내용이 들썩인다.
// 게임을 더하거나 소개 문구(line)를 바꾸면 이 값으로 styles.css 의 .feat__scrim min-height 를 고친다.
//
// 빌드 도구 없이 쓰는 저장소라 Playwright 는 Be the Bee 저장소의 것을 빌려 쓴다.
//   NODE_PATH="<Be the Bee 저장소>/node_modules" node tools/measure-feat.cjs http://localhost:8130/
const { chromium } = require('playwright');
const base = process.argv[2] || 'http://localhost:8130/';

(async () => {
  const browser = await chromium.launch();
  for (const w of (process.argv[3] ? process.argv[3].split(",").map(Number) : [320, 359, 360, 390, 430, 640])) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 800 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const page = await ctx.newPage();
    await page.goto(base + '?v=' + Date.now());
    await page.waitForTimeout(1500);
    const n = await page.evaluate(() => document.querySelectorAll('.dot').length);
    const rows = [];
    for (let i = 0; i < n; i++) {
      await page.evaluate(k => document.querySelectorAll('.dot')[k].click(), i);
      await page.waitForTimeout(400);
      rows.push(await page.evaluate(() => {
        const info = document.querySelector('.feat__info');
        const s = document.querySelector('.feat__scrim');
        const cs = getComputedStyle(s);
        // 글 자체가 차지하는 높이(위아래 안쪽 여백 포함). min-height 를 정할 때는 이 값의 최댓값을 쓴다
        const need = Math.ceil(info.getBoundingClientRect().height + parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom));
        return { title: document.querySelector('.feat__title').textContent, need, now: Math.round(s.getBoundingClientRect().height) };
      }));
    }
    const max = Math.max(...rows.map(r => r.need));
    const same = new Set(rows.map(r => r.now)).size === 1;
    console.log(`${w}px: 글이 필요한 높이 최대 ${max}px, 지금 칸 높이 ${same ? '모두 ' + rows[0].now + 'px' : '제각각 ' + rows.map(r => r.now).join('/')}`);
    for (const r of rows) console.log(`  ${r.title}: ${r.need}px`);
    await ctx.close();
  }
  await browser.close();
})();
