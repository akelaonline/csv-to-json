const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const roots = ['index.js', 'controllers', 'routes', 'utils', 'public/app.js', 'test', 'scripts'];
const files = [];

function collect(target) {
  const absolute = path.resolve(target);
  if (!fs.existsSync(absolute)) return;
  const stat = fs.statSync(absolute);
  if (stat.isDirectory()) {
    for (const entry of fs.readdirSync(absolute)) {
      collect(path.join(target, entry));
    }
  } else if (target.endsWith('.js') && target !== 'scripts/check.js') {
    files.push(target);
  }
}

roots.forEach(collect);

for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status || 1);
}

console.log(`Syntax check passed for ${files.length} JavaScript files.`);
