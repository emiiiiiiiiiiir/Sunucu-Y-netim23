import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js";
import { hasAdminRole } from "../utils/hasAdminRole.mjs";

export const data = new SlashCommandBuilder()
  .setName("temizle")
  .setDescription("Kanaldan mesajları temizle")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  .addIntegerOption((opt) =>
    opt
      .setName("adet")
      .setDescription("Silinecek mesaj sayısı (1-100)")
      .setMinValue(1)
      .setMaxValue(100)
      .setRequired(true)
  );

export async function execute(interaction) {
  if (!await hasAdminRole(interaction)) {
    return interaction.reply({ content: "Bu komutu kullanmak için gerekli role sahip değilsin.", ephemeral: true });
  }

  const adet = interaction.options.getInteger("adet");
  const channel = interaction.channel;

  if (!channel || !("bulkDelete" in channel)) {
    return interaction.reply({ content: "Bu kanalda toplu silme yapılamaz.", ephemeral: true });
  }

  const deleted = await channel.bulkDelete(adet, true).catch(() => null);

  if (!deleted) {
    return interaction.reply({ content: "Mesajlar silinirken hata oluştu. (14 günden eski mesajlar toplu silinemez)", ephemeral: true });
  }

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle("Mesajlar Temizlendi")
    .setDescription(`**${deleted.size}** mesaj silindi.`)
    .setTimestamp();

  const reply = await interaction.reply({ embeds: [embed], fetchReply: true });
  setTimeout(() => reply.delete().catch(() => {}), 5000);
}
