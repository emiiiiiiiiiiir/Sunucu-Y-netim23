import { Message, PermissionFlagsBits, EmbedBuilder } from "discord.js";
import { config } from "../config.js";
import { addWarn } from "../utils/warns.js";

function containsBadWord(text: string): boolean {
  const lower = text.toLowerCase();
  return config.badWords.some((w) => lower.includes(w));
}

function containsBlockedLink(text: string): boolean {
  const matches = text.matchAll(config.linkPattern);
  for (const match of matches) {
    const domain = match[1].toLowerCase().replace(/^www\./, "");
    const allowed = config.allowedLinkDomains.some(
      (d) => domain === d || domain.endsWith(`.${d}`)
    );
    if (!allowed) return true;
  }
  return false;
}

export async function handleAutoMod(message: Message): Promise<void> {
  if (message.author.bot) return;
  if (!message.guild) return;

  const member = message.guild.members.cache.get(message.author.id);

  if (member?.permissions.has(PermissionFlagsBits.ManageMessages)) return;
  if (config.adminRoleIds.length > 0 && config.adminRoleIds.some((id) => member?.roles.cache.has(id))) return;

  let reason: string | null = null;

  if (containsBadWord(message.content)) {
    reason = "kufur iceren mesaj";
  } else if (containsBlockedLink(message.content)) {
    reason = "izin verilmeyen link";
  }

  if (!reason) return;

  try {
    await message.delete();
  } catch {
    // mesaj zaten silinmis olabilir
  }

  const warnCount = addWarn(message.guild.id, message.author.id);

  const embed = new EmbedBuilder()
    .setColor(0xff4444)
    .setTitle("Uyari")
    .setDescription(
      `${message.author}, **${reason}** nedeniyle uyarildin.\nToplam uyari: **${warnCount}/${config.warnLimit}**`
    )
    .setTimestamp();

  if ("send" in message.channel) {
    const warning = await message.channel.send({ embeds: [embed] });
    setTimeout(() => warning.delete().catch(() => {}), 8000);
  }

  if (warnCount >= config.warnLimit) {
    try {
      await member?.timeout(10 * 60 * 1000, `${config.warnLimit} uyariya ulasildi`);
      if ("send" in message.channel) {
        const muteEmbed = new EmbedBuilder()
          .setColor(0xff0000)
          .setTitle("Susturuldu")
          .setDescription(
            `${message.author} ${config.warnLimit} uyariya ulastigi icin **10 dakika** susturuldu.`
          )
          .setTimestamp();
        await message.channel.send({ embeds: [muteEmbed] });
      }
    } catch {
      // timeout izni yoksa sessizce gec
    }
  }
}
