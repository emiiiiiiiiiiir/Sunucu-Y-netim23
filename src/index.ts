const { spawn } = require('child_process');

const bot = spawn('node', ['--enable-source-maps', 'artifacts/api-server/dist/index.mjs'], {
  stdio: 'inherit',
  shell: false
});

bot.on('exit', function(code) { process.exit(code || 0); });
