const { spawnSync, spawn } = require('child_process');
const path = require('path');

const hostDeps = path.join(__dirname, '..', 'artifacts', 'api-server', 'host-deps');

spawnSync('npm', ['install', '--prefix', hostDeps], { stdio: 'inherit', shell: true });

process.env.NODE_PATH = path.join(hostDeps, 'node_modules');
require('module').Module._initPaths();

const bot = spawn('node', ['--enable-source-maps', 'artifacts/api-server/dist/src/index.mjs'], {
  stdio: 'inherit',
  shell: false,
  env: { ...process.env, NODE_PATH: path.join(hostDeps, 'node_modules') }
});

bot.on('exit', function(code) { process.exit(code || 0); });
