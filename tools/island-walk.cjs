// 저니형 섬: 광장, 길의 칸, 꼭대기를 차례로 돌며 콘솔 오류와 카드, 화면을 확인한다.
// 칸에서는 하늘이 밝아지고 그날의 글이 날 기둥 옆에 뜨는지, 꼭대기에 닿자마자 카드를 누를 수 있는지(전망 도중),
// 광장으로 돌아오면 하늘이 다시 검어지고 글이 사라지는지도 본다.
//   node tools/island-walk.cjs <기본 주소> <스크린샷 폴더> [폭들, 쉼표로]
// Playwright 는 Be the Bee 저장소의 것을 빌려 쓴다: NODE_PATH="<Be the Bee 저장소>/node_modules" node tools/island-walk.cjs ...
// 섬은 로컬 서버(http://localhost:8130/, .claude/launch.json 의 hub)에서 연다. WebGL 은 swiftshader 로 켠다.
const { chromium } = require('playwright');
const base = process.argv[2] || 'http://localhost:8130/';
const out = process.argv[3] || '.';
const widths = (process.argv[4] || '390,1440').split(',').map(Number);
const GL = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
let bad = 0;
const fail = m => { bad++; console.log('  BAD ' + m); };

(async () => {
  const browser = await chromium.launch({ args: GL });
  for (const w of widths) {
    const h = w < 900 ? 844 : 900;
    const mobile = w < 900;
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await page.goto(base + 'world/?time=day&debug&v=' + Date.now());
    await page.waitForFunction(() => document.getElementById('loading').classList.contains('is-done'), null, { timeout: 40000 });
    await page.waitForTimeout(2600);
    console.log(`== ${w}px`);
    const info = await page.evaluate(() => window.__island.regions.map(r => `${r.g.id} ${r.n}칸 꼭대기높이 ${r.top.y.toFixed(2)} 마당 ${r.spots.length}`));
    info.forEach(l => console.log('  ' + l));
    await page.screenshot({ path: `${out}/j-${w}-overview.png` });
    // 첫 봉우리(칩) -> 첫 칸
    await page.evaluate(() => document.querySelectorAll('.chip')[0].click());
    await page.waitForFunction(() => !document.getElementById('day').hidden, null, { timeout: 20000 });
    await page.waitForTimeout(2200);
    const d1 = await page.evaluate(() => {
      const say = document.getElementById('say'), r = say.getBoundingClientRect(), st = getComputedStyle(say);
      return {
        where: document.getElementById('dWhere').textContent, date: document.getElementById('sayDate').textContent, list: document.getElementById('sayList').textContent.slice(0, 80),
        sky: document.body.classList.contains('is-sky'), shown: st.visibility === 'visible' && +st.opacity > 0.9,
        inside: r.left >= 19.5 && r.right <= innerWidth - 19.5 && r.top >= document.querySelector('.band').getBoundingClientRect().bottom && r.bottom <= innerHeight,
        oldCard: Boolean(document.getElementById('dDate') || document.getElementById('dList'))
      };
    });
    console.log(`  첫 칸: ${d1.where} / ${d1.date} / ${d1.list}`);
    console.log(`  하늘 ${d1.sky ? '밝음' : '검음'}, 그날의 글 ${d1.shown ? '보임' : '안 보임'}, 화면 안 ${d1.inside}, 카드에 날짜 ${d1.oldCard ? '남음' : '없음'}`);
    if (!d1.sky || !d1.shown || !d1.inside || d1.oldCard) fail('첫 칸의 하늘이나 그날의 글');
    await page.screenshot({ path: `${out}/j-${w}-step1.png` });
    // 세 칸 오르기
    for (let k = 0; k < 3; k++) {
      await page.click('#bUp');
      await page.waitForTimeout(700);
    }
    // 소프트웨어로 그리는 PC 화면은 한 장면에 1~2초가 걸려서, 마지막 걸음이 끝나 칸에 내려앉을 때까지 기다린다
    await page.waitForFunction(() => window.__island.state.mode === 'step' && !window.__island.walk.dest, null, { timeout: 20000 });
    const d4 = await page.evaluate(() => ({ where: document.getElementById('dWhere').textContent, lit: window.__island.regions[0].lit.size }));
    console.log(`  세 칸 뒤: ${d4.where}, 밟은 칸 ${d4.lit}`);
    await page.screenshot({ path: `${out}/j-${w}-step4.png` });
    // 그날 일지 읽기
    await page.click('#bRead');
    await page.waitForTimeout(300);
    const sh = await page.evaluate(() => ({ open: !document.getElementById('sheet').hidden, n: document.querySelectorAll('#sList li').length, all: !document.getElementById('sAll').hidden }));
    console.log(`  그날 일지 창: ${sh.open ? '열림' : '안 열림'}, 항목 ${sh.n}, 전체 보기 버튼 ${sh.all}`);
    if (!sh.open || !sh.n) fail('그날 일지 창');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    // 게임까지 가기. 꼭대기에 닿은 순간(전망 도중)에도 카드와 플레이 버튼을 누를 수 있어야 한다
    await page.click('#bTop');
    await page.waitForFunction(() => !document.getElementById('card').hidden, null, { timeout: 20000 });
    const v = await page.evaluate(() => {
      const b = document.getElementById('bPlay'), r = b.getBoundingClientRect();
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return { vista: window.__island.near.vista > 0, mode: window.__island.state.mode, play: hit === b, label: b.textContent };
    });
    console.log(`  꼭대기에 닿은 순간: ${v.mode}, 전망 ${v.vista ? '도는 중' : '안 함'}, 플레이 버튼(${v.label}) ${v.play ? '누를 수 있음' : '가려짐'}`);
    if (v.mode !== 'region' || !v.play) fail('꼭대기에 닿은 순간 카드');
    // 전망은 실제 시간으로 2.4초 뒤 첫 장면에서 끝난다. 장면이 느리게 그려지는 PC 검사에서도 끝나는지 20초까지 기다려 본다
    const ended = await page.waitForFunction(() => window.__island.near.vista === 0, null, { timeout: 20000 }).then(() => true, () => false);
    await page.waitForTimeout(1500);
    const c = await page.evaluate(() => ({ title: document.getElementById('cTitle').textContent, note: document.getElementById('cNote').textContent, brief: document.getElementById('card').classList.contains('is-brief') }));
    console.log(`  꼭대기: ${c.title} / ${c.note} / 전망 ${ended ? '끝남' : '안 끝남'}, 카드 ${c.brief ? '줄어 있음' : '펼침'}`);
    if (!ended || c.brief) fail('꼭대기 전망이 끝나지 않거나 카드가 펼쳐지지 않음');
    await page.screenshot({ path: `${out}/j-${w}-top.png` });
    // 다른 봉우리 꼭대기(가장 긴 길)
    await page.evaluate(() => { const I = window.__island; I.travel({ r: 0, s: I.regions[0].n }); });
    await page.waitForFunction(() => !document.getElementById('day').hidden, null, { timeout: 20000 });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${out}/j-${w}-laststep.png` });
    // 광장으로
    await page.click('#bHome2');
    await page.waitForFunction(() => !document.getElementById('entry').hidden && document.getElementById('hint').textContent.includes('하루'), null, { timeout: 20000 });
    await page.waitForTimeout(2600);
    const home = await page.evaluate(() => ({ sky: document.body.classList.contains('is-sky'), say: getComputedStyle(document.getElementById('say')).visibility, k: window.__island.near.k }));
    console.log(`  광장: 하늘 ${home.sky ? '밝음' : '검음'}, 그날의 글 ${home.say}, 가까운 시점 ${home.k.toFixed(2)}`);
    if (home.sky || home.say !== 'hidden' || home.k > 0.05) fail('광장으로 돌아왔는데 하늘이나 시점이 남음');
    await page.screenshot({ path: `${out}/j-${w}-home.png` });
    // 모든 칸을 밟힌 것으로 만들고 끝 창
    await page.evaluate(() => { const I = window.__island; I.regions.forEach((r, i) => { for (let s = 1; s <= r.n; s++) I.markDay(i, s); }); });
    await page.waitForTimeout(2000);
    const end = await page.evaluate(() => ({ open: !document.getElementById('ending').hidden, title: document.getElementById('eTitle').textContent, text: document.getElementById('eText').textContent }));
    console.log(`  끝 창: ${end.open ? '열림' : '안 열림'} ${end.title} / ${end.text}`);
    if (!end.open) fail('끝 창');
    await page.screenshot({ path: `${out}/j-${w}-ending.png` });
    await page.click('#eStay');
    await page.waitForTimeout(2200);
    await page.screenshot({ path: `${out}/j-${w}-lit.png` });
    await page.evaluate(() => window.__island.clearLit());
    console.log(`  콘솔 오류 ${errs.length ? errs.join(' | ') : '없음'}`);
    if (errs.length) fail('콘솔 오류');
    await ctx.close();
  }
  await browser.close();
  console.log(bad ? `실패 ${bad}` : '모두 통과');
  process.exit(bad ? 1 : 0);
})();
