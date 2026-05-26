import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js";
import { hasAdminRole } from "../utils/hasAdminRole.mjs";

export const data = new SlashCommandBuilder()
  .setName("susturma-kaldır")
  .setDescription("Bir kullanıcının susturmasını kaldır")
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addUserOption((opt) =>
    opt.setName("kullanici").setDescription("Susturması kaldırılacak kullanıcı").setRequired(true)
  );

export async function execute(interaction) {
  if (!await hasAdminRole(interaction)) {
    return interaction.reply({ content: "Bu komutu kullanmak için gerekli role sahip değilsin.", ephemeral: true });
  }

  const target = interaction.options.getMember("kullanici");

  if (!target) {
    return interaction.reply({ content: "Kullanıcı bulunamadı.", ephemeral: true });
  }

  if (!target.isCommunicationDisabled()) {
    return interaction.reply({ content: "Bu kullanıcı zaten susturulmamış.", ephemeral: true });
  }

  if (!target.moderatable) {
    return interaction.reply({ content: "Bu kullanıcının susturmasını kaldıramam. Rolüm yetersiz.", ephemeral: true });
  }

  await target.timeout(null);

  const embed = new EmbedBuilder()
    .setColor(0x57f287)
    .setTitle("Susturma Kaldırıldı")
    .addFields(
      { name: "Kullanıcı", value: `${target}`, inline: true },
      { name: "Yetkili", value: `${interaction.user}`, inline: true }
    )
    .setTimestamp();

  return interaction.reply({ embeds: [embed] });
}
