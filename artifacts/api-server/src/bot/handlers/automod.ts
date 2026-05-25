import { Message, PermissionFlagsBits, EmbedBuilder } from "discord.js";
import { config } from "../config.js";
import { addWarn } from "../utils/warns.js";
import { checkSpam } from "../utils/spam.js";

const LINK_PATTERN = /https?:\/\/([\w-]+(\.[\w-]+)+)(\/[^\s]*)?/gi;

// Kelime ayırıcılar: boşluk, noktalama, özel karakterler
const TOKEN_SPLITTER = /[\s.,!?;:()\[\]{}"'\/\\@#\-_+=|~`]+/;

function containsBadWord(text: string): boolean {
  const lower = text.toLowerCase();

  // Boşluksuz versiyon: "a m k" gibi bypass girişimlerini yakala
  // Sadece harfler arasındaki boşlukları kaldır, kelime başı/sonu korunur
  const tokens = lower.split(TOKEN_SPLITTER).filter(Boolean);

  // Boşluk bypass için: sadece 1-2 karakter arası boşluklu yazımları yakala (ör. "a m k")
  const noSpaceTokens = tokens.map((t) => t.replace(/\s/g, ""));

  return config.badWords.some((w) => {
    const badWord = w.toLowerCase();

    // Çok kelimeli ifade: tam metinde ara
    if (badWord.includes(" ")) {
      return lower.includes(badWord);
    }

    // Tek kelime: her token'ın başıyla eşleştir
    // (Türkçe ek alabilir: "amk" → "amklara", "orospu" → "orosbuya")
    return tokens.some(
      (token) => token === badWord || token.startsWith(badWord)
    ) || noSpaceTokens.some(
      (token) => token === badWord || token.startsWith(badWord)
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

  if (member?.permissions.has(PermissionFlagsBits.ManageMessages)) return;
  if (config.adminRoleIds.length > 0 && config.adminRoleIds.some((id) => member?.roles.cache.has(id))) return;

  const content = message.content;
  let reason: string | null = null;

  if (containsBadWord(content)) {
    reason = "küfür içeren mesaj";
  } else if (containsBlockedLink(content)) {
    reason = "izin verilmeyen link";
  } else {
    reason = checkSpam(message.author.id, content);
  }

  if (!reason) return;

  try {
    await message.delete();
  } catch {
    // mesaj zaten silinmiş olabilir
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
    } catch {
      // timeout izni yoksa sessizce geç
    }
  }
}
