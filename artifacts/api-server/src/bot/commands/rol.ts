import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  GuildMember,
} from "discord.js";
import { hasAdminRole } from "../utils/hasAdminRole.js";

export const data = new SlashCommandBuilder()
  .setName("rol-ver")
  .setDescription("Bir kullaniciya rol ver")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
  .addUserOption((opt) =>
    opt.setName("kullanici").setDescription("Kullanici").setRequired(true)
  )
  .addRoleOption((opt) =>
    opt.setName("rol").setDescription("Verilecek rol").setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!await hasAdminRole(interaction)) {
    await interaction.reply({ content: "Bu komutu kullanmak icin gerekli role sahip degilsin.", ephemeral: true });
    return;
  }

  const target = interaction.options.getMember("kullanici") as GuildMember | null;
  const role = interaction.options.getRole("rol");

  if (!target || !role) {
    await interaction.reply({ content: "Kullanici veya rol bulunamadi.", ephemeral: true });
    return;
  }

  if (!interaction.guild) {
    await interaction.reply({ content: "Bu komut sadece sunucularda kullanilabilir.", ephemeral: true });
    return;
  }

  const botMember = interaction.guild.members.me;
  if (!botMember || botMember.roles.highest.position <= role.position) {
    await interaction.reply({ content: "Bu rolu veremem, rolum yeterince yuksek degil.", ephemeral: true });
    return;
  }

  try {
    await target.roles.add(role.id);
    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle("Rol Verildi")
      .setDescription(`${target} kullanicisina **${role.name}** rolu verildi.`)
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  } catch {
    await interaction.reply({ content: "Rol verirken bir hata olustu.", ephemeral: true });
  }
}
