// 전형적인 AI 디자인 흔적을 찾는다 (known-issues #24, 전역 CLAUDE.md 웹 디자인 규칙).
// 빌드 도구 없이 node 로 바로 돈다.
//   node tools/check-design.cjs              저장소 전체 (midterm, 문서 파일은 빼고)
//   node tools/check-design.cjs g/enigma     그 폴더만
// 걸린 줄이 모두 잘못은 아니다. 게임 원문을 그대로 보여 줘야 하는 자리처럼 이유가 있으면
// 사람이 보고 남긴다. 걸린 곳이 하나라도 있으면 종료 코드 1.
const fs = require('fs');
const path = require('path');

const start = process.argv[2] || '.';
const SKIP = new Set(['.git', 'node_modules', 'midterm', 'session_logs', '.claude', 'tools', 'assets']);
const RULES = [
  ['가운데 점', /·/],
  ['고정폭이나 타자기 글꼴', /IBM Plex Mono|Special Elite|ui-monospace|font-family:[^;]*monospace/],
  ['넓힌 자간', /letter-spacing:\s*0?\.(0[4-9]|[1-9])\d*em/],
  ['왼쪽 색 띠', /border-left:\s*[2-9](\.\d+)?px/],
  ['유리 흐림', /backdrop-filter/],
  ['그라데이션 글자', /background-clip:\s*text/],
  ['글리프 아이콘', /[←→‹›★☆◆◇▸▶◀●○♥]/],
  ['제목 위 꼬리표', /class="[^"]*(eyebrow|kicker|__label)[^"]*"/],
  ['제목 balance', /text-wrap:\s*balance/],
];

function walk(dir, out) {
  for (const name of fs.readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.(html|css|js)$/.test(name)) out.push(p);
  }
  return out;
}

const files = fs.statSync(start).isDirectory() ? walk(start, []) : [start];
let hits = 0;
for (const f of files) {
  const lines = fs.readFileSync(f, 'utf8').split(/\r?\n/);
  lines.forEach((line, i) => {
    for (const [name, re] of RULES) {
      if (re.test(line)) {
        hits++;
        console.log(`${f}:${i + 1}  ${name}  ${line.trim().slice(0, 90)}`);
      }
    }
  });
}
console.log(hits ? `\n걸린 곳 ${hits}개` : '걸린 곳 없음');
process.exit(hits ? 1 : 0);
