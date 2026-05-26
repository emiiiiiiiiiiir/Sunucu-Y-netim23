import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("yardım")
  .setDescription("Bot komutlarını listele");

export async function execute(interaction) {
  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle("Moderasyon Botu - Komutlar")
    .addFields(
      {
        name: "Moderasyon",
        value: [
          "`/temizle` — Kanal mesajlarını temizle",
          "`/sustur` — Kullanıcıyı belirtilen süre sustur",
          "`/susturma-kaldır` — Kullanıcının susturmasını kaldır",
        ].join("\n"),
      },
      {
        name: "Rol",
        value: [
          "`/rol-ver` — Kullanıcıya rol ver",
          "`/rol-al` — Kullanıcıdan rol al",
        ].join("\n"),
      },
      {
        name: "Oto-Mod (Otomatik)",
        value: [
          "Küfür içeren mesajları siler",
          "İzinsiz linkleri engeller",
          "Mesaj spamını engeller",
          "Büyük harf spamını engeller",
          "Emoji spamını engeller",
          "Tekrar eden mesajları engeller",
          "Mention spamını engeller",
          "Yeni satır spamını engeller",
          "3 uyarıda kullanıcı 10 dk susturulur",
        ].join("\n"),
      }
    )
    .setFooter({ text: "Yalnızca yetkili üyeler moderasyon komutlarını kullanabilir." })
    .setTimestamp();

  return interaction.reply({ embeds: [embed], ephemeral: true });
}
