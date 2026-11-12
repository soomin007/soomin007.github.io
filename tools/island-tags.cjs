// 섬 이름표 동작 확인: 이름표를 누르면 그 땅으로 가는지, 끌면 섬이 돌고 이름표가 따라가는지,
// 땅에 다가갔을 때 이름표가 머리글 밑에 있는지, 콘솔 오류가 없는지.
//   node tools/island-tags.cjs <저장 폴더>
// Playwright 는 Be the Bee 저장소의 것을 빌려 쓴다: NODE_PATH="<Be the Bee 저장소>/node_modules" node tools/island-tags.cjs ...
// 섬은 로컬 서버(http://localhost:8130/, .claude/launch.json 의 hub)에서 연다. WebGL 은 swiftshader 로 켠다.
const { chromium } = require('playwright');
const out = process.argv[2];

const rects = page => page.evaluate(() => [...document.querySelectorAll('#names .name')].map(el => {
  const q = el.getBoundingClientRect();
  return { text: el.querySelector('b').textContent, x: q.left, y: q.top, w: q.width, h: q.height, vis: getComputedStyle(el).visibility, op: +getComputedStyle(el).opacity };
}));

(async () => {
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  let fail = 0;
  const check = (ok, msg) => { console.log((ok ? 'PASS ' : 'FAIL ') + msg); if (!ok) fail++; };
  for (const [name, vp, dpr, mobile] of [['phone', { width: 390, height: 844 }, 3, true], ['pc', { width: 1440, height: 900 }, 1, false]]) {
    const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: dpr, isMobile: mobile, hasTouch: mobile });
    const page = await ctx.newPage();
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('http://localhost:8130/world/?time=day&v=' + Date.now());
    await page.waitForTimeout(7000);

    let r = await rects(page);
    const shown = r.filter(t => t.vis === 'visible' && t.op > 0.9);
    const want = await page.evaluate(() => document.querySelectorAll('#names .name').length); check(shown.length === want && want === 6, `${name}: 섬 전체 보기에서 이름표 ${want}개(땅 5, 광장 1)가 모두 보임 (${shown.length})`);
    const inside = shown.every(t => t.x >= 19.5 && t.x + t.w <= vp.width - 19.5);
    check(inside, `${name}: 이름표가 좌우 여백 20px 안에 있음`);

    // 이름표 누르기: ENIGMA
    const en = r.find(t => t.text === 'ENIGMA');
    await page.mouse.click(en.x + en.w / 2, en.y + en.h / 2);
    await page.waitForTimeout(5000);
    const title = await page.textContent('#dWhere');
    check(title.startsWith('ENIGMA'), `${name}: ENIGMA 이름표를 누르면 ENIGMA 길의 첫 칸 카드가 뜸 (${title})`);
    const top = await page.evaluate(() => document.querySelector('.top').getBoundingClientRect().bottom);
    r = await rects(page);
    const under = r.filter(t => t.vis === 'visible' && t.y >= 0 && t.y < top);
    check(under.length === 0, `${name}: 땅 앞에서 머리글(아래 끝 ${Math.round(top)}px)과 겹친 이름표 없음 (${under.map(t => t.text).join(', ')})`);
    await page.screenshot({ path: `${out}/verify-${name}-land.png` });

    // 광장으로 돌아와서 끌기
    await page.click('#bHome2');
    await page.waitForTimeout(5000);
    const before = (await rects(page)).find(t => t.text === 'Be the Bee');
    const y0 = vp.height * 0.45;
    await page.mouse.move(vp.width * 0.3, y0);
    await page.mouse.down();
    for (let k = 1; k <= 10; k++) await page.mouse.move(vp.width * 0.3 + k * 15, y0);
    await page.mouse.up();
    await page.waitForTimeout(2000);
    const after = (await rects(page)).find(t => t.text === 'Be the Bee');
    const cardHidden = await page.evaluate(() => document.getElementById('card').hidden && document.getElementById('day').hidden);
    check(Math.abs(after.x - before.x) > 10 && cardHidden, `${name}: 끌면 섬이 돌고 이름표가 따라감 (x ${Math.round(before.x)} -> ${Math.round(after.x)}), 땅으로 가지 않음`);
    // 이름표 위에서 끌어도 돈다
    const s = (await rects(page)).find(t => t.text === '충전이 필요해!');
    await page.mouse.move(s.x + s.w / 2, s.y + s.h / 2);
    await page.mouse.down();
    for (let k = 1; k <= 10; k++) await page.mouse.move(s.x + s.w / 2 + k * 12, s.y + s.h / 2);
    await page.mouse.up();
    await page.waitForTimeout(2000);
    const s2 = (await rects(page)).find(t => t.text === '충전이 필요해!');
    const cardHidden2 = await page.evaluate(() => document.getElementById('card').hidden && document.getElementById('day').hidden);
    check(Math.abs(s2.x - s.x) > 10 && cardHidden2, `${name}: 이름표 위에서 끌어도 섬이 돎 (x ${Math.round(s.x)} -> ${Math.round(s2.x)})`);
    await page.screenshot({ path: `${out}/verify-${name}-turned.png` });

    check(errors.length === 0, `${name}: 콘솔 오류 없음 ${errors.join(' | ')}`);
    await ctx.close();
  }
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
