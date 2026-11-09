// 사용법: node tools/bind-det.cjs g/<id>/index.html [...]
// check-text.cjs 가 "이 / 게임"처럼 관형사에서 꺾인 줄을 찾으면, 이 도구로 그 짝을 한 번에 묶는다 (known-issues #26).
// 관형사와 바로 뒤 낱말("이 게임", "두 곡을", "모든 사건의")을 줄바꿈 없는 묶음으로 감싼다.
// <main> 안의 글자에만 손대고, 태그와 <script>, <style> 안은 건드리지 않는다. 태그를 넘는 짝은 그대로 둔다.
const fs = require('fs');
const DET = '이|그|저|각|몇|한|두|세|네|첫|새|옛|온|모든|이런|그런|저런|어떤|여러';
const re = new RegExp(`(^|\\s)(${DET}) ([가-힣A-Za-z0-9][^\\s<]*)`, 'g');

for (const file of process.argv.slice(2)) {
  const src = fs.readFileSync(file, 'utf8');
  const a = src.indexOf('<main');
  const b = src.lastIndexOf('</main>');
  if (a < 0 || b < 0) { console.log('main 없음', file); continue; }
  let count = 0;
  let inCode = false;
  let prevTag = '';
  const mid = src.slice(a, b).split(/(<[^>]+>)/).map(part => {
    if (part.startsWith('<')) {
      if (/^<(script|style)\b/i.test(part)) inCode = true;
      if (/^<\/(script|style)>/i.test(part)) inCode = false;
      prevTag = part;
      return part;
    }
    if (inCode) return part;
    // 이미 nw 묶음이 바로 이 자리에서 시작하면 다시 감싸지 않는다(두 번 돌려도 결과가 같게)
    return part.replace(re, (m, pre, det, word, offset) => {
      if (offset === 0 && prevTag === '<span class="nw">') return m;
      count++;
      return `${pre}<span class="nw">${det} ${word}</span>`;
    });
  }).join('');
  fs.writeFileSync(file, src.slice(0, a) + mid + src.slice(b));
  console.log(`${file}: ${count}곳`);
}
