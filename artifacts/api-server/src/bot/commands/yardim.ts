import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("yardim")
  .setDescription("Bot komutlarını listele");

export async function execute(interaction: ChatInputCommandInteraction) {
  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle("Moderasyon Botu - Komutlar")
    .setDescription("Sunucu moderasyon botu komut listesi")
    .addFields(
      {
        name: "Moderasyon",
        value: [
          "`/sustur` — Kullanıcıyı sustur",
          "`/temizle` — Kanal mesajlarını temizle",
        ].join("\n"),
      },
      {
        name: "Uyarı",
        value: [
          "`/uyari ver` — Uyarı ver",
          "`/uyari goruntule` — Uyarıları görüntüle",
          "`/uyari sifirla` — Uyarıları sıfırla",
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
        name: "Oto-Mod",
        value: [
          "Küfür içeren mesajları otomatik siler",
          "İzinsiz linkleri otomatik engeller",
          "3 uyarıda kullanıcı 10 dk susturulur",
        ].join("\n"),
      }
    )
    .setFooter({ text: "Yalnızca yetkili üyeler moderasyon komutlarını kullanabilir." })
    .setTimestamp();

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
