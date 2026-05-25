import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js";
import { hasAdminRole } from "../utils/hasAdminRole.mjs";

export const data = new SlashCommandBuilder()
  .setName("rol-ver")
  .setDescription("Bir kullanıcıya rol ver")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
  .addUserOption((opt) =>
    opt.setName("kullanici").setDescription("Kullanıcı").setRequired(true)
  )
  .addRoleOption((opt) =>
    opt.setName("rol").setDescription("Verilecek rol").setRequired(true)
  );

export async function execute(interaction) {
  if (!await hasAdminRole(interaction)) {
    return interaction.reply({ content: "Bu komutu kullanmak için gerekli role sahip değilsin.", ephemeral: true });
  }

  const target = interaction.options.getMember("kullanici");
  const role = interaction.options.getRole("rol");

  if (!target || !role) {
    return interaction.reply({ content: "Kullanıcı veya rol bulunamadı.", ephemeral: true });
  }

  const botMember = interaction.guild.members.me;
  if (!botMember || botMember.roles.highest.position <= role.position) {
    return interaction.reply({ content: "Bu rolü veremem, rolüm yeterince yüksek değil.", ephemeral: true });
  }

  await target.roles.add(role.id);

  const embed = new EmbedBuilder()
    .setColor(0x57f287)
    .setTitle("Rol Verildi")
    .setDescription(`${target} kullanıcısına **${role.name}** rolü verildi.`)
    .setTimestamp();

  return interaction.reply({ embeds: [embed] });
}
