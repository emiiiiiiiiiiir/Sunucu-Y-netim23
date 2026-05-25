import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("yardim")
  .setDescription("Bot komutlarini listele");

export async function execute(interaction: ChatInputCommandInteraction) {
  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle("Moderasyon Botu - Komutlar")
    .setDescription("Sunucu moderasyon botu komut listesi")
    .addFields(
      {
        name: "Moderasyon",
        value: [
          "`/ban` — Kullaniciy yasakla",
          "`/kick` — Kullaniciy at",
          "`/sustur` — Kullaniciy sustur",
          "`/temizle` — Kanal mesajlarini temizle",
        ].join("\n"),
      },
      {
        name: "Uyari",
        value: [
          "`/uyari ver` — Uyari ver",
          "`/uyari goruntule` — Uyarilari goruntule",
          "`/uyari sifirla` — Uyarilari sifirla",
        ].join("\n"),
      },
      {
        name: "Rol",
        value: [
          "`/rol-ver` — Kullaniciya rol ver",
          "`/rol-al` — Kullanicidan rol al",
        ].join("\n"),
      },
      {
        name: "Oto-Mod",
        value: [
          "Kufur iceren mesajlari otomatik siler",
          "Izinsiz linkleri otomatik engeller",
          "3 uyarida kullanici 10 dk susturulur",
        ].join("\n"),
      }
    )
    .setFooter({ text: "Yalnizca yetkili uyeler moderasyon komutlarini kullanabilir." })
    .setTimestamp();

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
