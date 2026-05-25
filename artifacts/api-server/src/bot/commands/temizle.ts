import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  TextChannel,
} from "discord.js";
import { hasAdminRole } from "../utils/hasAdminRole.js";

export const data = new SlashCommandBuilder()
  .setName("temizle")
  .setDescription("Kanaldan mesajlari temizle")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  .addIntegerOption((opt) =>
    opt
      .setName("adet")
      .setDescription("Silinecek mesaj sayisi (1-100)")
      .setMinValue(1)
      .setMaxValue(100)
      .setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!await hasAdminRole(interaction)) {
    await interaction.reply({ content: "Bu komutu kullanmak icin gerekli role sahip degilsin.", ephemeral: true });
    return;
  }

  const adet = interaction.options.getInteger("adet", true);
  const channel = interaction.channel as TextChannel | null;

  if (!channel || !("bulkDelete" in channel)) {
    await interaction.reply({ content: "Bu kanalda toplu silme yapilamaz.", ephemeral: true });
    return;
  }

  try {
    const deleted = await channel.bulkDelete(adet, true);
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("Mesajlar Temizlendi")
      .setDescription(`**${deleted.size}** mesaj silindi.`)
      .setTimestamp();
    const reply = await interaction.reply({ embeds: [embed], fetchReply: true });
    setTimeout(() => reply.delete().catch(() => {}), 5000);
  } catch {
    await interaction.reply({ content: "Mesajlari silerken hata olustu. (14 gunden eski mesajlar toplu silinemez)", ephemeral: true });
  }
}
