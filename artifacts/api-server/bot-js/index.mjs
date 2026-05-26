import {
  Client,
  GatewayIntentBits,
  Collection,
  REST,
  Routes,
  ChannelType,
  ActivityType,
} from "discord.js";
import {
  joinVoiceChannel,
  VoiceConnectionStatus,
  entersState,
} from "@discordjs/voice";

import { config } from "./config.mjs";
import { handleAutoMod } from "./handlers/automod.mjs";
import { setupAutoMod } from "./utils/setupAutoMod.mjs";

import * as rolVer from "./commands/rol-ver.mjs";
import * as rolAl from "./commands/rol-al.mjs";
import * as temizle from "./commands/temizle.mjs";
import * as yardim from "./commands/yardim.mjs";

if (!config.token) {
  console.error("[Bot] DISCORD_TOKEN ayarlanmamış, çıkılıyor.");
  process.exit(1);
}

// --- Komutları kaydet ---
const commands = [rolVer, rolAl, temizle, yardim];
const commandMap = new Collection();
for (const cmd of commands) {
  commandMap.set(cmd.data.name, cmd);
}

// --- Client oluştur ---
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.AutoModerationConfiguration,
    GatewayIntentBits.AutoModerationExecution,
  ],
});

// --- Ses kanalına bağlan ---
async function joinVoice() {
  if (!config.voiceChannelId) return;

  const channel = await client.channels.fetch(config.voiceChannelId).catch(() => null);
  if (!channel || channel.type !== ChannelType.GuildVoice) {
    console.error("[Bot] Ses kanalı bulunamadı veya geçersiz.");
    return;
  }

  const connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator,
    selfDeaf: true,
    selfMute: true,
  });

  connection.on(VoiceConnectionStatus.Ready, () => {
    console.log(`[Bot] Ses kanalına bağlanıldı: ${channel.name}`);
  });

  connection.on(VoiceConnectionStatus.Disconnected, async () => {
    try {
      await Promise.race([
        entersState(connection, VoiceConnectionStatus.Signalling, 5000),
        entersState(connection, VoiceConnectionStatus.Connecting, 5000),
      ]);
    } catch {
      console.warn("[Bot] Ses bağlantısı kesildi, 5 sn sonra yeniden bağlanılıyor...");
      connection.destroy();
      setTimeout(() => joinVoice(), 5000);
    }
  });
}

// --- Bot hazır ---
client.once("ready", async (c) => {
  console.log(`[Bot] Giriş yapıldı: ${c.user.tag}`);

  // Durum: Rahatsız Etme + İzliyor aktivitesi
  c.user.setPresence({
    status: "dnd",
    activities: [
      {
        name: "Imperial Forces Sunucularını",
        type: ActivityType.Watching,
      },
    ],
  });
  console.log("[Bot] Durum ayarlandı: DND + İzliyor");

  // Slash komutlarını Discord'a kaydet
  const rest = new REST().setToken(config.token);
  try {
    const body = commands.map((cmd) => cmd.data.toJSON());
    await rest.put(Routes.applicationCommands(c.user.id), { body });
    console.log("[Bot] Slash komutları kaydedildi.");
  } catch (err) {
    console.error("[Bot] Komutlar kaydedilemedi:", err);
  }

  // Tüm sunucularda native AutoMod kurulumunu yap
  console.log(`[AutoMod Setup] ${c.guilds.cache.size} sunucuda AutoMod kuruluyor...`);
  for (const guild of c.guilds.cache.values()) {
    await setupAutoMod(guild).catch((err) =>
      console.error(`[AutoMod Setup] ${guild.name} hata:`, err?.message)
    );
  }

  await joinVoice();
});

// --- Yeni sunucuya eklenince AutoMod kur ---
client.on("guildCreate", async (guild) => {
  console.log(`[Bot] Yeni sunucuya eklendi: ${guild.name}`);
  await setupAutoMod(guild).catch((err) =>
    console.error(`[AutoMod Setup] ${guild.name} hata:`, err?.message)
  );
});

// --- Mesaj geldiğinde automod ---
client.on("messageCreate", async (message) => {
  try {
    await handleAutoMod(message);
  } catch (err) {
    console.error("[Bot] Automod hatası:", err);
  }
});

// --- Slash komut geldiğinde ---
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const cmd = commandMap.get(interaction.commandName);
  if (!cmd) return;

  try {
    await cmd.execute(interaction);
  } catch (err) {
    console.error(`[Bot] Komut hatası (${interaction.commandName}):`, err);
    const msg = { content: "Komut çalıştırılırken hata oluştu.", ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(msg).catch(() => {});
    } else {
      await interaction.reply(msg).catch(() => {});
    }
  }
});

// --- Giriş yap ---
client.login(config.token).catch((err) => {
  console.error("[Bot] Giriş hatası:", err);
  process.exit(1);
});
