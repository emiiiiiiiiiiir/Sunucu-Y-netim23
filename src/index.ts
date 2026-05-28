const { spawnSync, spawn } = require('child_process');

const build = spawnSync('pnpm', ['--filter', '@workspace/api-server', 'run', 'build'], {
  stdio: 'inherit',
  shell: true
});

if (build.status !== 0) process.exit(build.status || 1);

const bot = spawn('node', ['--enable-source-maps', 'artifacts/api-server/dist/index.mjs'], {
  stdio: 'inherit',
  shell: false
});

bot.on('exit', function(code) { process.exit(code || 0); });
