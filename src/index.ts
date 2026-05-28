const { spawnSync, spawn } = require('child_process');

spawnSync('npm', ['install', '-g', 'pnpm'], { stdio: 'inherit', shell: true });

const install = spawnSync('pnpm', ['install'], { stdio: 'inherit', shell: true });
if (install.status !== 0) process.exit(install.status || 1);

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
