import { PermissionFlagsBits, EmbedBuilder } from "discord.js";
import { config } from "../config.mjs";
import { addWarn } from "../utils/warns.mjs";
import { checkSpam } from "../utils/spam.mjs";

const TOKEN_SPLITTER = /[\s.,!?;:()\[\]{}"'\/\\@#\-_+=|~`]+/;

function containsBadWord(text) {
  const lower = text.toLowerCase();
  const tokens = lower.split(TOKEN_SPLITTER).filter(Boolean);

  return config.badWords.some((w) => {
    const badWord = w.toLowerCase();

    // Çok kelimeli ifadeler tam metinde aranır
    if (badWord.includes(" ")) {
      return lower.includes(badWord);
    }

    // Tek kelimeler: her token'la eşleştir (Türkçe ekler için startsWith)
    return tokens.some((token) => token === badWord || token.startsWith(badWord));
  });
}

function containsBlockedLink(text) {
  const pattern = /https?:\/\/([\w-]+(\.[\w-]+)+)(\/[^\s]*)?/gi;
  for (const match of text.matchAll(pattern)) {
    const domain = match[1].toLowerCase().replace(/^www\./, "");
    const allowed = config.allowedLinkDomains.some(
      (d) => domain === d || domain.endsWith(`.${d}`)
    );
    if (!allowed) return true;
  }
  return false;
}

export async function handleAutoMod(message) {
  if (message.author.bot) return;
  if (!message.guild) return;

  // Üyeyi fetch et (cache'de yoksa API'den çek)
  let member = message.guild.members.cache.get(message.author.id);
  if (!member) {
    member = await message.guild.members.fetch(message.author.id).catch(() => null);
  }

  // Mesaj yönetme yetkisi olan veya admin rolündekiler atlanır
  if (member?.permissions.has(PermissionFlagsBits.ManageMessages)) return;
  if (config.adminRoleIds.length > 0 && config.adminRoleIds.some((id) => member?.roles.cache.has(id))) return;

  const content = message.content;
  if (!content) return;

  let reason = null;

  if (containsBadWord(content)) {
    reason = "küfür içeren mesaj";
  } else if (containsBlockedLink(content)) {
    reason = "izin verilmeyen link";
  } else {
    reason = checkSpam(message.author.id, content);
  }

  if (!reason) return;

  // Mesajı sil
  await message.delete().catch(() => {});

  const warnCount = addWarn(message.guild.id, message.author.id);

  const embed = new EmbedBuilder()
    .setColor(0xff4444)
    .setTitle("Uyarı")
    .setDescription(
      `${message.author}, **${reason}** nedeniyle uyarıldın.\nToplam uyarı: **${warnCount}/${config.warnLimit}**`
    )
    .setTimestamp();

  if ("send" in message.channel) {
    const warning = await message.channel.send({ embeds: [embed] }).catch(() => null);
    if (warning) setTimeout(() => warning.delete().catch(() => {}), 8000);
  }

  // 3 uyarıda 10 dakika sustur
  if (warnCount >= config.warnLimit) {
    if (member?.moderatable) {
      await member.timeout(10 * 60 * 1000, `${config.warnLimit} uyarıya ulaşıldı`).catch(() => {});
    }
    if ("send" in message.channel) {
      const muteEmbed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle("Susturuldu")
        .setDescription(
          `${message.author} ${config.warnLimit} uyarıya ulaştığı için **10 dakika** susturuldu.`
        )
        .setTimestamp();
      await message.channel.send({ embeds: [muteEmbed] }).catch(() => {});
    }
  }
}
