import {
  Client,
  GatewayIntentBits,
  Collection,
  REST,
  Routes,
  ChatInputCommandInteraction,
} from "discord.js";
import { config } from "./config.js";
import { handleAutoMod } from "./handlers/automod.js";
import { logger } from "../lib/logger.js";

import * as rolVer from "./commands/rol.js";
import * as rolAl from "./commands/rol-al.js";
import * as temizle from "./commands/temizle.js";
import * as yardim from "./commands/yardim.js";

type CommandModule = {
  data: { name: string; toJSON: () => unknown };
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
};

const commands: CommandModule[] = [
  rolVer, rolAl, temizle, yardim,
];

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
  ],
});

const commandCollection = new Collection<string, CommandModule>();
for (const cmd of commands) {
  commandCollection.set(cmd.data.name, cmd);
}

client.once("ready", async (c) => {
  logger.info(`Bot hazır: ${c.user.tag}`);

  const rest = new REST().setToken(config.token);
  try {
    const body = commands.map((cmd) => cmd.data.toJSON());
    await rest.put(Routes.applicationCommands(c.user.id), { body });
    logger.info("Slash komutları kaydedildi (global)");
  } catch (err) {
    logger.error({ err }, "Komutlar kaydedilemedi");
  }
});

client.on("messageCreate", async (message) => {
  await handleAutoMod(message);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const cmd = commandCollection.get(interaction.commandName);
  if (!cmd) return;

  try {
    await cmd.execute(interaction);
  } catch (err) {
    logger.error({ err, command: interaction.commandName }, "Komut hatası");
    const msg = { content: "Komut çalıştırılırken hata oluştu.", ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(msg).catch(() => {});
    } else {
      await interaction.reply(msg).catch(() => {});
    }
  }
});

export function startBot() {
  if (!config.token) {
    logger.error("DISCORD_TOKEN ayarlanmamış, bot başlatılamıyor");
    return;
  }
  client.login(config.token).catch((err) => {
    logger.error({ err }, "Bot giriş hatası");
  });
}
