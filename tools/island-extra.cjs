// 섬 소개 창과 섬을 못 띄울 때의 안내 화면 검사.
//   node tools/island-extra.cjs <기본 주소> <스크린샷 폴더>
// Playwright 는 Be the Bee 저장소의 것을 빌려 쓴다: NODE_PATH="<Be the Bee 저장소>/node_modules" node tools/island-extra.cjs ...
// 섬은 로컬 서버(http://localhost:8130/, .claude/launch.json 의 hub)에서 연다. WebGL 은 swiftshader 로 켠다.
const { chromium } = require('playwright');
const base = process.argv[2] || 'http://localhost:8130/';
const out = process.argv[3] || '.';
const GL = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
const NO_GL = ['--disable-3d-apis', '--disable-webgl'];
let bad = 0;
const fail = msg => { bad++; console.log('  BAD ' + msg); };

// check-text.cjs 와 같은 줄바꿈 검사를 고른 상자 안에서만 한다
function lineCheck(sel) {
  const startBad = /^(수|것|때|줄|뿐|듯|만큼|적|중|데|있|없|두|뒀|놓|놨|버|보|봤|주|줬|싶|하|되|드리|드립|대|개|명|가지|컷|번|쪽|편|채|졌|져)(\s|[다니습었는은을를이가도요며고게지서면기,.]|$)/;
  const endBad = /(^|\s)(이|그|저|각|몇|한|두|세|네|첫|새|옛|온|모든|이런|그런|저런|어떤|여러)$/;
  const near = [], breaks = [], one = [];
  for (const el of document.querySelector(sel).querySelectorAll('p, h1, h2, h3, dt, dd, summary')) {
    const box = el.getBoundingClientRect();
    if (!box.width || getComputedStyle(el).visibility === 'hidden') continue;
    if (box.left < 19.5 || box.right > innerWidth - 19.5) near.push(`${el.tagName} "${el.textContent.trim().slice(0, 16)}" ${Math.round(box.left)}~${Math.round(box.right)}`);
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
      if (startBad.test(b) || endBad.test(a)) breaks.push(`${a.slice(-14)} / ${b.slice(0, 14)}`);
    }
    // 마지막 줄에 낱말 하나만 남은 문단
    const last = lines.length > 1 ? lines[lines.length - 1].text.trim() : '';
    if (last && !last.includes(' ')) one.push(`${el.tagName} 끝줄 "${last}"`);
  }
  return { overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth, near, breaks, one };
}

function report(tag, r) {
  console.log(`  ${tag}: 넘침 ${r.overflow ? '있음' : '없음'}, 여백 부족 ${r.near.length}, 줄바꿈 ${r.breaks.length}, 외톨이 끝줄 ${r.one.length}`);
  r.near.forEach(s => console.log('    여백: ' + s));
  r.breaks.forEach(s => console.log('    줄: ' + s));
  r.one.forEach(s => console.log('    끝줄: ' + s));
  if (r.overflow || r.near.length) fail(tag + ' 넘침이나 여백');
}

async function open(browser, w, h, opts = {}) {
  const mobile = w < 900;
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  if (opts.route) await opts.route(page);
  await page.goto(base + 'world/' + (opts.query || '') + (opts.query ? '&' : '?') + 'v=' + Date.now());
  return { ctx, page, errs };
}

(async () => {
  // 1) 정상: 머리글 배치, 소개 창, 소개 창이 열린 동안 섬 키가 막히는지
  {
    const browser = await chromium.launch({ args: GL });
    for (const [w, h] of [[320, 640], [360, 740], [390, 844], [1440, 900]]) {
      const { ctx, page, errs } = await open(browser, w, h, { query: '?time=day' });
      await page.waitForFunction(() => document.getElementById('loading').classList.contains('is-done'), null, { timeout: 30000 });
      await page.waitForTimeout(500);
      console.log(`== 정상 ${w}px`);
      const head = await page.evaluate(() => {
        const b = document.querySelector('.brand').getBoundingClientRect();
        const r = document.querySelector('.top__right').getBoundingClientRect();
        const items = [...document.querySelectorAll('.top__right > *')].map(e => { const x = e.getBoundingClientRect(); return { t: e.textContent.trim(), l: Math.round(x.left), r: Math.round(x.right), top: Math.round(x.top + x.height / 2) }; });
        return { brandR: Math.round(b.right), rightL: Math.round(r.left), rightR: Math.round(r.right), gap: Math.round(r.left - b.right), items, sameRow: new Set(items.map(i => i.top)).size === 1 };
      });
      console.log(`  머리글: 이름 끝 ${head.brandR}, 오른쪽 묶음 ${head.rightL}~${head.rightR}, 사이 ${head.gap}px, ${head.items.map(i => i.t + '(' + i.l + '~' + i.r + ')').join(' ')}`);
      if (head.gap < 10 || head.rightR > w - 19.5 || !head.sameRow) fail('머리글이 좁음');
      // 땅 하나로 간 뒤 카드가 뜬 상태에서 소개를 연다
      await page.evaluate(() => document.querySelectorAll('.chip')[1].click());
      await page.waitForFunction(() => !document.getElementById('day').hidden, null, { timeout: 20000 });
      await page.waitForTimeout(300);
      const before = await page.evaluate(() => document.getElementById('dWhere').textContent);
      await page.click('#bAbout');
      await page.waitForTimeout(250);
      const st = await page.evaluate(() => ({
        open: !document.getElementById('about').hidden,
        focus: document.activeElement.id,
        pc: getComputedStyle(document.querySelector('.about .for-pc')).display
      }));
      console.log(`  소개 열림 ${st.open}, 초점 ${st.focus}, PC 설명 ${st.pc}`);
      if (!st.open || st.focus !== 'aClose') fail('소개 창이 안 열리거나 초점이 닫기에 없음');
      if ((w < 900) !== (st.pc === 'none')) fail('PC 설명 표시가 기기와 맞지 않음');
      report('소개 글', await page.evaluate(lineCheck, '#about'));
      const fit = await page.evaluate(() => {
        const p = document.querySelector('#about .sheet__panel');
        const words = [...document.querySelectorAll('#about .about > p, #about .sheet__lead')].map(e => e.textContent.trim().split(/\s+/).length).reduce((a, b) => a + b, 0);
        return { h: Math.round(p.getBoundingClientRect().height), scroll: p.scrollHeight > p.clientHeight + 1, words };
      });
      console.log(`  접힌 소개 창: 높이 ${fit.h}px, 스크롤 ${fit.scroll ? '생김' : '없음'}, 펼친 글 ${fit.words}어절`);
      await page.screenshot({ path: `${out}/about-${w}.png` });
      // 만든 과정을 펼쳐서 다시 본다
      await page.click('#about summary');
      await page.waitForTimeout(250);
      const more = await page.evaluate(() => ({ open: document.querySelector('#about details').open, words: [...document.querySelectorAll('#about details p')].map(e => e.textContent.trim().split(/\s+/).length).reduce((a, b) => a + b, 0) }));
      console.log(`  만든 과정 ${more.open ? '펼침' : '안 펼쳐짐'}, ${more.words}어절`);
      if (!more.open) fail('만든 과정이 안 펼쳐짐');
      report('만든 과정', await page.evaluate(lineCheck, '#about details'));
      await page.evaluate(() => { const p = document.querySelector("#about .sheet__panel"); p.scrollTop = p.scrollHeight; });
      await page.waitForTimeout(150);
      await page.screenshot({ path: `${out}/about-${w}-end.png` });
      await page.evaluate(() => { document.querySelector("#about .sheet__panel").scrollTop = 0; });
      // 소개 창이 열린 동안 오른쪽 화살표는 땅을 옮기지 않아야 한다
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(200);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1200);
      const after = await page.evaluate(() => ({
        open: !document.getElementById('about').hidden,
        card: !document.getElementById('day').hidden,
        title: document.getElementById('dWhere').textContent,
        focus: document.activeElement.id
      }));
      console.log(`  Esc 뒤: 소개 ${after.open ? '열림' : '닫힘'}, 카드 ${after.card ? '그대로' : '사라짐'}, 땅 ${before} -> ${after.title}, 초점 ${after.focus}`);
      if (after.open || !after.card || after.title !== before || after.focus !== 'bAbout') fail('소개 창 키 처리');
      // 바깥을 누르면 닫히는지
      await page.click('#bAbout');
      await page.waitForTimeout(200);
      await page.mouse.click(Math.round(w / 2), 8);
      await page.waitForTimeout(200);
      if (!(await page.evaluate(() => document.getElementById('about').hidden))) fail('바깥을 눌러도 안 닫힘');
      if (errs.length) fail('콘솔 오류 ' + errs.join(' | '));
      await ctx.close();
    }
    await browser.close();
  }

  // 2) WebGL 을 끈 브라우저
  {
    const browser = await chromium.launch({ args: NO_GL });
    for (const [w, h] of [[320, 640], [360, 740], [390, 844], [1440, 900]]) {
      const { ctx, page, errs } = await open(browser, w, h);
      await page.waitForTimeout(2500);
      console.log(`== WebGL 없음 ${w}px`);
      const st = await page.evaluate(() => ({
        fail: !document.getElementById('fail').hidden,
        loading: !document.getElementById('loading').hidden,
        title: document.getElementById('fTitle').textContent,
        focus: document.activeElement.id,
        pic: document.getElementById('fPic').complete && document.getElementById('fPic').naturalWidth,
        btns: [...document.querySelectorAll('#fRow .btn')].map(b => { const r = b.getBoundingClientRect(); return b.textContent + '(' + Math.round(r.left) + '~' + Math.round(r.right) + ', ' + Math.round(r.top) + ')'; })
      }));
      console.log(`  안내 ${st.fail}, 로딩 ${st.loading}, 제목 "${st.title}", 초점 ${st.focus}, 그림 폭 ${st.pic}, 버튼 ${st.btns.join(' ')}`);
      if (!st.fail || st.loading || !st.title.includes('그릴 수 없습니다') || !st.pic) fail('WebGL 안내가 안 뜸');
      report('안내 글', await page.evaluate(lineCheck, '#fail'));
      await page.screenshot({ path: `${out}/nogl-${w}.png`, fullPage: false });
      // 안내 화면에서 섬 소개를 열고 닫는다
      await page.click('#fRow [data-act="about"]');
      await page.waitForTimeout(200);
      const ab = await page.evaluate(() => !document.getElementById('about').hidden);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200);
      const ab2 = await page.evaluate(() => !document.getElementById('about').hidden);
      console.log(`  안내에서 소개 열기 ${ab}, Esc 뒤 ${ab2 ? '열림' : '닫힘'}`);
      if (!ab || ab2) fail('안내 화면에서 소개 창');
      console.log('  콘솔: ' + (errs.join(' | ').slice(0, 200) || '없음'));
      await ctx.close();
    }
    await browser.close();
  }

  // 3) three.js 를 받지 못할 때, 4) 느린 연결
  {
    const browser = await chromium.launch({ args: GL });
    for (const w of [320, 1440]) {
      const { ctx, page } = await open(browser, w, w < 900 ? 640 : 900, {
        route: p => p.route(/cdn\.jsdelivr\.net\/npm\/three@/, r => r.abort())
      });
      await page.waitForTimeout(2500);
      const st = await page.evaluate(() => ({
        fail: !document.getElementById('fail').hidden,
        title: document.getElementById('fTitle').textContent,
        btns: [...document.querySelectorAll('#fRow .btn')].map(b => b.textContent)
      }));
      console.log(`== 파일 못 받음 ${w}px: 안내 ${st.fail}, 제목 "${st.title}", 버튼 ${st.btns.join(', ')}`);
      if (!st.fail || !st.title.includes('불러오지')) fail('파일 실패 안내가 안 뜸');
      report('안내 글', await page.evaluate(lineCheck, '#fail'));
      await page.screenshot({ path: `${out}/noload-${w}.png` });
      await ctx.close();
    }
    {
      const { ctx, page, errs } = await open(browser, 390, 844, {
        route: p => p.route(/three\.module\.js/, async r => { await new Promise(res => setTimeout(res, 15000)); await r.continue(); })
      });
      await page.waitForTimeout(8800);
      const mid = await page.evaluate(() => ({ more: !document.getElementById('loadMore').hidden, fail: !document.getElementById('fail').hidden }));
      report('로딩 글', await page.evaluate(lineCheck, '#loading'));
      await page.screenshot({ path: `${out}/slow-390.png` });
      await page.waitForFunction(() => document.getElementById('loading').classList.contains('is-done'), null, { timeout: 30000 }).catch(() => {});
      const end = await page.evaluate(() => ({ done: document.getElementById('loading').classList.contains('is-done'), fail: !document.getElementById('fail').hidden }));
      console.log(`== 느린 연결: 8.8초에 목록 안내 ${mid.more}, 안내 화면 ${mid.fail}; 끝내 섬이 뜸 ${end.done}, 안내 화면 ${end.fail}`);
      if (!mid.more || mid.fail || !end.done || end.fail) fail('느린 연결 처리');
      if (errs.length) fail('콘솔 오류 ' + errs.join(' | '));
      await ctx.close();
    }
    await browser.close();
  }
  console.log(bad ? `문제 ${bad}건` : '모두 통과');
  process.exit(bad ? 1 : 0);
})();
