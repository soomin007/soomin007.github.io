// 날짜 카드 46장을 폭마다 띄워 줄바꿈을 본다(check-text.cjs 와 같은 규칙).
//   node tools/island-days.cjs <기본 주소> [폭들]
// Playwright 는 Be the Bee 저장소의 것을 빌려 쓴다: NODE_PATH="<Be the Bee 저장소>/node_modules" node tools/island-days.cjs ...
// 섬은 로컬 서버(http://localhost:8130/, .claude/launch.json 의 hub)에서 연다. WebGL 은 swiftshader 로 켠다.
const { chromium } = require('playwright');
const base = process.argv[2] || 'http://localhost:8130/';
const widths = (process.argv[3] || '320,390').split(',').map(Number);
function lineCheck(sel) {
  const startBad = /^(수|것|때|줄|뿐|듯|만큼|적|중|데|있|없|두|뒀|놓|놨|버|보|봤|주|줬|싶|하|되|드리|드립|대|개|명|가지|컷|번|쪽|편|채|졌|져)(\s|[다니습었는은을를이가도요며고게지서면기,.]|$)/;
  const endBad = /(^|\s)(이|그|저|각|몇|한|두|세|네|첫|새|옛|온|모든|이런|그런|저런|어떤|여러)$/;
  const out = [];
  for (const el of document.querySelector(sel).querySelectorAll('p')) {
    if (!el.getBoundingClientRect().width) continue;
    const lines = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      for (let i = 0; i < node.length; i++) {
        const range = document.createRange();
        range.setStart(node, i); range.setEnd(node, i + 1);
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
      if (startBad.test(b) || endBad.test(a)) out.push(`${a.slice(-12)} / ${b.slice(0, 12)}`);
    }
    const last = lines.length > 1 ? lines[lines.length - 1].text.trim() : '';
    if (last && !last.includes(' ')) out.push(`끝줄 하나: "${last}"`);
  }
  return out;
}
(async () => {
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  let total = 0;
  for (const w of widths) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 760 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const page = await ctx.newPage();
    await page.goto(base + 'world/?time=day&debug&v=' + Date.now());
    await page.waitForFunction(() => document.getElementById('loading').classList.contains('is-done'), null, { timeout: 40000 });
    const plan = await page.evaluate(() => window.__island.regions.map(r => r.n));
    for (let r = 0; r < plan.length; r++) {
      for (let s = 1; s <= plan[r]; s++) {
        const res = await page.evaluate(([r, s, fn]) => { window.__island.showDay(r, s); return new Function('return ' + fn)()('#day'); }, [r, s, lineCheck.toString()]);
        for (const x of res) { console.log(`${w}px 봉우리${r} ${s}칸: ${x}`); total++; }
      }
    }
    await ctx.close();
  }
  await browser.close();
  console.log(`걸린 곳 ${total}`);
})();
