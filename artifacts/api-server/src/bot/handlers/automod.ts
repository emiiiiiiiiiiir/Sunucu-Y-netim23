import { Message, PermissionFlagsBits, EmbedBuilder } from "discord.js";
import { config } from "../config.js";
import { addWarn } from "../utils/warns.js";
import { checkSpam } from "../utils/spam.js";
import { logger } from "../../lib/logger.js";

const LINK_PATTERN = /https?:\/\/([\w-]+(\.[\w-]+)+)(\/[^\s]*)?/gi;
const TOKEN_SPLITTER = /[\s.,!?;:()\[\]{}"'\/\\@#\-_+=|~`]+/;

function containsBadWord(text: string): boolean {
  const lower = text.toLowerCase();
  const tokens = lower.split(TOKEN_SPLITTER).filter(Boolean);
  const noSpaceTokens = tokens.map((t) => t.replace(/\s/g, ""));

  return config.badWords.some((w) => {
    const badWord = w.toLowerCase();
    if (badWord.includes(" ")) {
      return lower.includes(badWord);
    }
    return (
      tokens.some((token) => token === badWord || token.startsWith(badWord)) ||
      noSpaceTokens.some((token) => token === badWord || token.startsWith(badWord))
    );
  });
}

function containsBlockedLink(text: string): boolean {
  const pattern = new RegExp(LINK_PATTERN.source, LINK_PATTERN.flags);
  const matches = text.matchAll(pattern);
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

  const member = await message.guild.members.fetch(message.author.id).catch(() => null);

  if (member?.permissions.has(PermissionFlagsBits.ManageMessages)) {
    logger.info({ userId: message.author.id }, "automod: yetkili atlandı");
    return;
  }

  if (config.adminRoleIds.length > 0 && config.adminRoleIds.some((id) => member?.roles.cache.has(id))) {
    logger.info({ userId: message.author.id }, "automod: admin rolü atlandı");
    return;
  }

  const content = message.content;
  logger.info({ userId: message.author.id, content }, "automod: mesaj kontrol ediliyor");

  let reason: string | null = null;

  if (containsBadWord(content)) {
    reason = "küfür içeren mesaj";
  } else if (containsBlockedLink(content)) {
    reason = "izin verilmeyen link";
  } else {
    reason = checkSpam(message.author.id, content);
  }

  logger.info({ userId: message.author.id, reason }, "automod: sonuç");

  if (!reason) return;

  try {
    await message.delete();
  } catch (err) {
    logger.warn({ err }, "automod: mesaj silinemedi");
  }

  const warnCount = addWarn(message.guild.id, message.author.id);

  const embed = new EmbedBuilder()
    .setColor(0xff4444)
    .setTitle("Uyarı")
    .setDescription(
      `${message.author}, **${reason}** nedeniyle uyarıldın.\nToplam uyarı: **${warnCount}/${config.warnLimit}**`
    )
    .setTimestamp();

  if ("send" in message.channel) {
    const warning = await message.channel.send({ embeds: [embed] });
    setTimeout(() => warning.delete().catch(() => {}), 8000);
  }

  if (warnCount >= config.warnLimit) {
    try {
      await member?.timeout(10 * 60 * 1000, `${config.warnLimit} uyarıya ulaşıldı`);
      if ("send" in message.channel) {
        const muteEmbed = new EmbedBuilder()
          .setColor(0xff0000)
          .setTitle("Susturuldu")
          .setDescription(
            `${message.author} ${config.warnLimit} uyarıya ulaştığı için **10 dakika** susturuldu.`
          )
          .setTimestamp();
        await message.channel.send({ embeds: [muteEmbed] });
      }
    } catch (err) {
      logger.warn({ err }, "automod: timeout uygulanamadı");
    }
  }
}
