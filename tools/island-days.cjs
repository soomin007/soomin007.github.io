// 그날의 글 46칸을 폭마다 띄워 본다. 말을 칸마다 바로 세우고(jump, ?debug 로 열 때만 있다) 시점이 자리 잡은 뒤에 잰다.
//   node tools/island-days.cjs <기본 주소> [폭들, 쉼표로]
// 칸마다 (1) 줄바꿈이 구절 중간에서 꺾이지 않는지(check-text.cjs 와 같은 규칙),
// (2) 글 상자가 화면 좌우 여백 20px 안에 있는지, 머리글 띠와 아래 카드(PC 는 왼쪽 카드)에 겹치지 않는지 본다.
// Playwright 는 Be the Bee 저장소의 것을 빌려 쓴다: NODE_PATH="<Be the Bee 저장소>/node_modules" node tools/island-days.cjs ...
// 섬은 로컬 서버(http://localhost:8130/, .claude/launch.json 의 hub)에서 연다. WebGL 은 swiftshader 로 켠다.
const { chromium } = require('playwright');
const base = process.argv[2] || 'http://localhost:8130/';
const widths = (process.argv[3] || '320,360,390,1440').split(',').map(Number);
const HEIGHT = { 320: 640, 360: 740, 390: 844 };

function sayCheck() {
  const startBad = /^(수|것|때|줄|뿐|듯|만큼|적|중|데|있|없|두|뒀|놓|놨|버|보|봤|주|줬|싶|하|되|드리|드립|대|개|명|가지|컷|번|쪽|편|채|졌|져)(\s|[다니습었는은을를이가도요며고게지서면기,.]|$)/;
  const endBad = /(^|\s)(이|그|저|각|몇|한|두|세|네|첫|새|옛|온|모든|이런|그런|저런|어떤|여러)$/;
  const box = document.getElementById('say');
  const breaks = [];
  for (const el of box.querySelectorAll('p')) {
    if (!el.getBoundingClientRect().width) continue;
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
      if (startBad.test(b) || endBad.test(a)) breaks.push(`${a.slice(-12)} / ${b.slice(0, 12)}`);
    }
    const last = lines.length > 1 ? lines[lines.length - 1].text.trim() : '';
    if (last && !last.includes(' ')) breaks.push(`끝줄 하나: "${last}"`);
  }
  const r = box.getBoundingClientRect();
  const band = document.querySelector('.band').getBoundingClientRect();
  const card = document.getElementById('day').getBoundingClientRect();
  const out = [];
  const st = getComputedStyle(box);
  if (st.visibility !== 'visible' || +st.opacity < 0.9) out.push(`안 보임(${st.visibility}, ${st.opacity})`);
  if (r.left < 19.5 || r.right > innerWidth - 19.5) out.push(`좌우 여백 밖 ${Math.round(r.left)}~${Math.round(r.right)}`);
  if (r.top < band.bottom || r.bottom > innerHeight) out.push(`위아래 밖 ${Math.round(r.top)}~${Math.round(r.bottom)} (띠 아래 ${Math.round(band.bottom)})`);
  if (r.right > card.left && r.left < card.right && r.bottom > card.top && r.top < card.bottom) out.push(`카드와 겹침 ${Math.round(r.top)}~${Math.round(r.bottom)} / 카드 ${Math.round(card.top)}~`);
  return { breaks, out, rect: [r.left, r.top, r.width, r.height].map(Math.round) };
}

(async () => {
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  let breaks = 0, outside = 0, cells = 0;
  for (const w of widths) {
    const mobile = w < 900;
    const ctx = await browser.newContext({ viewport: { width: w, height: HEIGHT[w] || (mobile ? 760 : 900) }, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push(e.message));
    // 글 자리만 재므로 PC 화면 효과(빛 번짐, 미니어처 흐림)는 끈다. 켜 두면 1440 에서 칸마다 몇 초씩 걸린다
    await page.goto(base + 'world/?time=day&debug&nofx&v=' + Date.now());
    await page.waitForFunction(() => document.getElementById('loading').classList.contains('is-done'), null, { timeout: 40000 });
    await page.waitForTimeout(2600);
    const plan = await page.evaluate(() => window.__island.regions.map(r => r.n));
    let tallest = 0;
    for (let r = 0; r < plan.length; r++) {
      for (let s = 1; s <= plan[r]; s++) {
        const res = await page.evaluate(([r, s, fn]) => {
          window.__island.jump({ r, s });
          window.__tick();
          window.__tick();
          return new Function('return ' + fn)()();
        }, [r, s, sayCheck.toString()]);
        cells++;
        tallest = Math.max(tallest, res.rect[3]);
        for (const x of res.breaks) { console.log(`${w}px 봉우리${r} ${s}칸 줄: ${x}`); breaks++; }
        for (const x of res.out) { console.log(`${w}px 봉우리${r} ${s}칸 자리: ${x}`); outside++; }
      }
    }
    console.log(`== ${w}px: 칸 ${plan.reduce((a, b) => a + b, 0)}개, 가장 높은 글 상자 ${tallest}px${errs.length ? ', 오류 ' + errs.join(' | ') : ''}`);
    if (errs.length) outside++;
    await ctx.close();
  }
  await browser.close();
  console.log(`줄바꿈 ${breaks}곳, 화면 밖이나 겹침 ${outside}곳 (${cells}칸)`);
  process.exit(breaks || outside ? 1 : 0);
})();
