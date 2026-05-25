import { PermissionFlagsBits, EmbedBuilder } from "discord.js";
import { config } from "../config.mjs";
import { addWarn } from "../utils/warns.mjs";
import { checkSpam } from "../utils/spam.mjs";

// Türkçe karakterleri de kapsar
const LETTER_REGEX = /[a-zA-ZğüşıöçĞÜŞİÖÇ]/g;

function normalize(text) {
  return text
    .toLowerCase()
    // Görsel benzer karakterleri değiştir (@ → a, 3 → e, 0 → o vb.)
    .replace(/@/g, "a")
    .replace(/4/g, "a")
    .replace(/3/g, "e")
    .replace(/1/g, "i")
    .replace(/0/g, "o")
    .replace(/5/g, "s")
    .replace(/\$/g, "s")
    .replace(/\+/g, "t");
}

function containsBadWord(text) {
  const norm = normalize(text);

  // Sadece harfler — boşluk/nokta/özel karakter bypass'larını yakalar
  const lettersOnly = (norm.match(LETTER_REGEX) ?? []).join("");

  // Normal tokenize (boşluk/noktalama ile ayrılmış kelimeler)
  const tokens = norm.split(/[\s.,!?;:()\[\]{}"'\/\\@#\-_+=|~`*^%&]+/).filter(Boolean);

  for (const raw of config.badWords) {
    const bad = normalize(raw);

    if (bad.includes(" ")) {
      // Çok kelimeli: metinde tam geçiyor mu?
      if (norm.includes(bad)) {
        console.log(`[Automod] Küfür yakalandı (çok kelimeli): "${raw}"`);
        return true;
      }
      continue;
    }

    // 1. Token eşleşmesi (Türkçe ek: "siktir", "siktirin" vb.)
    const tokenMatch = tokens.some(
      (t) => t === bad || t.startsWith(bad)
    );
    if (tokenMatch) {
      console.log(`[Automod] Küfür yakalandı (token): "${raw}"`);
      return true;
    }

    // 2. Boşluksuz metin içinde geçiyor mu? ("s i k t i r" → "siktir")
    const strippedMatch =
      lettersOnly.includes(bad) ||
      norm.replace(/\s+/g, "").includes(bad);
    if (strippedMatch) {
      console.log(`[Automod] Küfür yakalandı (boşluk bypass): "${raw}"`);
      return true;
    }
  }

  return false;
}

function containsBlockedLink(text) {
  const pattern = /https?:\/\/([\w-]+(\.[\w-]+)+)(\/[^\s]*)?/gi;
  for (const match of text.matchAll(pattern)) {
    const domain = match[1].toLowerCase().replace(/^www\./, "");
    const allowed = config.allowedLinkDomains.some(
      (d) => domain === d || domain.endsWith(`.${d}`)
    );
    if (!allowed) {
      console.log(`[Automod] Engellenen link: "${domain}"`);
      return true;
    }
  }
  return false;
}

export async function handleAutoMod(message) {
  if (message.author.bot) return;
  if (!message.guild) return;

  // Üyeyi fetch et
  let member = message.guild.members.cache.get(message.author.id);
  if (!member) {
    member = await message.guild.members.fetch(message.author.id).catch(() => null);
  }

  // Admin ve mesaj yönetme yetkisi olanlar atlanır
  if (member?.permissions.has(PermissionFlagsBits.ManageMessages)) {
    console.log(`[Automod] Atlandı (ManageMessages yetkisi): ${message.author.tag}`);
    return;
  }
  if (config.adminRoleIds.length > 0 && config.adminRoleIds.some((id) => member?.roles.cache.has(id))) {
    console.log(`[Automod] Atlandı (admin rolü): ${message.author.tag}`);
    return;
  }

  const content = message.content;
  if (!content) {
    console.log(`[Automod] İçerik boş, atlandı: ${message.author.tag}`);
    return;
  }

  console.log(`[Automod] Kontrol ediliyor: "${content.slice(0, 80)}" | Yazar: ${message.author.tag}`);

  let reason = null;

  if (containsBadWord(content)) {
    reason = "küfür içeren mesaj";
  } else if (containsBlockedLink(content)) {
    reason = "izin verilmeyen link";
  } else {
    reason = checkSpam(message.author.id, content);
    if (reason) console.log(`[Automod] Spam yakalandı: ${reason} | ${message.author.tag}`);
  }

  if (!reason) return;

  console.log(`[Automod] Siliniyor | Sebep: ${reason} | Yazar: ${message.author.tag}`);

  // Mesajı sil
  await message.delete().catch((err) => {
    console.error(`[Automod] Mesaj silinemedi:`, err?.message);
  });

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

  // warnLimit uyarıda 10 dakika sustur
  if (warnCount >= config.warnLimit) {
    if (member?.moderatable) {
      await member
        .timeout(10 * 60 * 1000, `${config.warnLimit} uyarıya ulaşıldı`)
        .catch((err) => console.error("[Automod] Timeout hatası:", err?.message));
    } else {
      console.warn(`[Automod] ${message.author.tag} susturulamadı (moderatable değil)`);
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
