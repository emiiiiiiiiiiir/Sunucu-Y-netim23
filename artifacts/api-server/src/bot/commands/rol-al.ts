import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  GuildMember,
} from "discord.js";
import { hasAdminRole } from "../utils/hasAdminRole.js";

export const data = new SlashCommandBuilder()
  .setName("rol-al")
  .setDescription("Bir kullanıcıdan rol al")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
  .addUserOption((opt) =>
    opt.setName("kullanici").setDescription("Kullanıcı").setRequired(true)
  )
  .addRoleOption((opt) =>
    opt.setName("rol").setDescription("Alınacak rol").setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!await hasAdminRole(interaction)) {
    await interaction.reply({ content: "Bu komutu kullanmak için gerekli role sahip değilsin.", ephemeral: true });
    return;
  }

  const target = interaction.options.getMember("kullanici") as GuildMember | null;
  const role = interaction.options.getRole("rol");

  if (!target || !role) {
    await interaction.reply({ content: "Kullanıcı veya rol bulunamadı.", ephemeral: true });
    return;
  }

  if (!interaction.guild) {
    await interaction.reply({ content: "Bu komut sadece sunucularda kullanılabilir.", ephemeral: true });
    return;
  }

  const botMember = interaction.guild.members.me;
  if (!botMember || botMember.roles.highest.position <= role.position) {
    await interaction.reply({ content: "Bu rolü alamam, rolüm yeterince yüksek değil.", ephemeral: true });
    return;
  }

  try {
    await target.roles.remove(role.id);
    const embed = new EmbedBuilder()
      .setColor(0xed4245)
      .setTitle("Rol Alındı")
      .setDescription(`${target} kullanıcısından **${role.name}** rolü alındı.`)
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  } catch {
    await interaction.reply({ content: "Rol alırken bir hata oluştu.", ephemeral: true });
  }
}
