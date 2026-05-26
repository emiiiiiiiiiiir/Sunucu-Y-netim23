import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js";
import { hasAdminRole } from "../utils/hasAdminRole.mjs";

export const data = new SlashCommandBuilder()
  .setName("rol-al")
  .setDescription("Bir kullanıcıdan rol al")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
  .addUserOption((opt) =>
    opt.setName("kullanıcı").setDescription("Kullanıcı").setRequired(true)
  )
  .addRoleOption((opt) =>
    opt.setName("rol").setDescription("Alınacak rol").setRequired(true)
  );

export async function execute(interaction) {
  if (!await hasAdminRole(interaction)) {
    return interaction.reply({ content: "Bu komutu kullanmak için gerekli role sahip değilsin.", ephemeral: true });
  }

  const target = interaction.options.getMember("kullanıcı");
  const role = interaction.options.getRole("rol");

  if (!target || !role) {
    return interaction.reply({ content: "Kullanıcı veya rol bulunamadı.", ephemeral: true });
  }

  const botMember = interaction.guild.members.me;
  if (!botMember || botMember.roles.highest.position <= role.position) {
    return interaction.reply({ content: "Bu rolü alamam, rolüm yeterince yüksek değil.", ephemeral: true });
  }

  await target.roles.remove(role.id);

  const embed = new EmbedBuilder()
    .setColor(0xed4245)
    .setTitle("Rol Alındı")
    .setDescription(`${target} kullanıcısından **${role.name}** rolü alındı.`)
    .setTimestamp();

  return interaction.reply({ embeds: [embed] });
}
