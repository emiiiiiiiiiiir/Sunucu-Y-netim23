import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"] ?? "3000";

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }
  logger.info({ port }, "Server listening");
});

// Discord botunu ayrı bir Node.js sürecinde başlat (bundle dışı, native modüller sorunsuz çalışır)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const botPath = path.resolve(__dirname, "../bot-js/index..mjs");

const bot = spawn("node", [botPath], {
  stdio: "inherit",
  env: process.env,
});

bot.on("error", (err) => {
  logger.error({ err }, "Bot süreci başlatılamadı");
});

bot.on("exit", (code, signal) => {
  if (code !== 0) {
    logger.warn({ code, signal }, "Bot süreci kapandı, 5 sn sonra yeniden başlatılıyor");
    setTimeout(() => {
      spawn("node", [botPath], { stdio: "inherit", env: process.env });
    }, 5000);
  }
});
