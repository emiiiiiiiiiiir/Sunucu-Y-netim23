import {
  AutoModerationRuleTriggerType,
  AutoModerationRuleEventType,
  AutoModerationRuleKeywordPresetType,
  AutoModerationActionType,
  PermissionFlagsBits,
} from "discord.js";
import { config } from "../config.mjs";

// Discord keyword filter için wildcard formatı — Türkçe ekleri kapsar
function toKeywordFilter(words) {
  return words
    .filter((w) => !w.includes(" ")) // çok kelimeli ifadeler keyword filter'a girmez
    .map((w) => `${w.toLowerCase()}*`); // "orospu*" → orospu, orospudur, orospuya vb.
}

export async function setupAutoMod(guild) {
  const botMember = guild.members.me;

  if (!botMember?.permissions.has(PermissionFlagsBits.ManageGuild)) {
    console.log(`[AutoMod Setup] ${guild.name}: MANAGE_GUILD yetkisi yok, atlandı.`);
    return;
  }

  // Mevcut bot kurallarını çek (çift kural oluşturmamak için)
  const existingRules = await guild.autoModerationRules.fetch().catch(() => null);
  const botRules = existingRules?.filter((r) => r.creatorId === guild.client.user.id) ?? new Map();

  console.log(`[AutoMod Setup] ${guild.name}: ${botRules.size} mevcut bot kuralı bulundu.`);

  // --- Kural 1: Özel küfür listesi (KEYWORD) ---
  const hasKeywordRule = [...botRules.values()].some(
    (r) => r.triggerType === AutoModerationRuleTriggerType.Keyword
      && r.name.includes("Imperial Forces")
  );

  if (!hasKeywordRule) {
    await guild.autoModerationRules
      .create({
        name: "Imperial Forces - Küfür Filtresi",
        eventType: AutoModerationRuleEventType.MessageSend,
        triggerType: AutoModerationRuleTriggerType.Keyword,
        triggerMetadata: {
          keywordFilter: toKeywordFilter(config.badWords),
        },
        actions: [{ type: AutoModerationActionType.BlockMessage }],
        enabled: true,
      })
      .then(() => console.log(`[AutoMod Setup] ${guild.name}: Küfür kuralı oluşturuldu.`))
      .catch((err) => console.error(`[AutoMod Setup] ${guild.name}: Küfür kuralı oluşturulamadı:`, err?.message));
  } else {
    // Küfür listesi güncellendiyse kuralı da güncelle
    const existingRule = [...botRules.values()].find(
      (r) => r.triggerType === AutoModerationRuleTriggerType.Keyword
        && r.name.includes("Imperial Forces")
    );
    if (existingRule) {
      await existingRule
        .edit({
          triggerMetadata: {
            keywordFilter: toKeywordFilter(config.badWords),
          },
        })
        .then(() => console.log(`[AutoMod Setup] ${guild.name}: Küfür kuralı güncellendi.`))
        .catch((err) => console.error(`[AutoMod Setup] ${guild.name}: Küfür kuralı güncellenemedi:`, err?.message));
    }
  }

  // --- Kural 2: Discord'un yerleşik küfür/slur/cinsel içerik filtresi (KEYWORD_PRESET) ---
  const hasPresetRule = [...botRules.values()].some(
    (r) => r.triggerType === AutoModerationRuleTriggerType.KeywordPreset
      && r.name.includes("Imperial Forces")
  );

  if (!hasPresetRule) {
    await guild.autoModerationRules
      .create({
        name: "Imperial Forces - Genel Koruma",
        eventType: AutoModerationRuleEventType.MessageSend,
        triggerType: AutoModerationRuleTriggerType.KeywordPreset,
        triggerMetadata: {
          presets: [
            AutoModerationRuleKeywordPresetType.Profanity,
            AutoModerationRuleKeywordPresetType.SexualContent,
            AutoModerationRuleKeywordPresetType.Slurs,
          ],
          allowList: [],
        },
        actions: [{ type: AutoModerationActionType.BlockMessage }],
        enabled: true,
      })
      .then(() => console.log(`[AutoMod Setup] ${guild.name}: Genel koruma kuralı oluşturuldu.`))
      .catch((err) => console.error(`[AutoMod Setup] ${guild.name}: Genel koruma kuralı oluşturulamadı:`, err?.message));
  }

  // --- Kural 3: Mention spam filtresi ---
  const hasMentionRule = [...botRules.values()].some(
    (r) => r.triggerType === AutoModerationRuleTriggerType.MentionSpam
      && r.name.includes("Imperial Forces")
  );

  if (!hasMentionRule) {
    await guild.autoModerationRules
      .create({
        name: "Imperial Forces - Mention Spam",
        eventType: AutoModerationRuleEventType.MessageSend,
        triggerType: AutoModerationRuleTriggerType.MentionSpam,
        triggerMetadata: {
          mentionTotalLimit: 3,
          mentionRaidProtectionEnabled: true,
        },
        actions: [{ type: AutoModerationActionType.BlockMessage }],
        enabled: true,
      })
      .then(() => console.log(`[AutoMod Setup] ${guild.name}: Mention spam kuralı oluşturuldu.`))
      .catch((err) => console.error(`[AutoMod Setup] ${guild.name}: Mention spam kuralı oluşturulamadı:`, err?.message));
  }

  console.log(`[AutoMod Setup] ${guild.name}: Kurulum tamamlandı.`);
}
