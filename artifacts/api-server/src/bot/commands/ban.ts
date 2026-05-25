import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  GuildMember,
} from "discord.js";
import { hasAdminRole } from "../utils/hasAdminRole.js";

export const data = new SlashCommandBuilder()
  .setName("ban")
  .setDescription("Kullaniciy sunucudan yasakla")
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
  .addUserOption((opt) =>
    opt.setName("kullanici").setDescription("Kullanici").setRequired(true)
  )
  .addStringOption((opt) =>
    opt.setName("sebep").setDescription("Ban sebebi").setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!await hasAdminRole(interaction)) {
    await interaction.reply({ content: "Bu komutu kullanmak icin gerekli role sahip degilsin.", ephemeral: true });
    return;
  }

  if (!interaction.guild) {
    await interaction.reply({ content: "Bu komut sadece sunucularda kullanilabilir.", ephemeral: true });
    return;
  }

  const target = interaction.options.getMember("kullanici") as GuildMember | null;
  const user = interaction.options.getUser("kullanici", true);
  const sebep = interaction.options.getString("sebep") ?? "Belirtilmedi";

  if (target && !target.bannable) {
    await interaction.reply({ content: "Bu kullaniciy yasaklayamam.", ephemeral: true });
    return;
  }

  try {
    await interaction.guild.members.ban(user.id, { reason: sebep });
    const embed = new EmbedBuilder()
      .setColor(0xed4245)
      .setTitle("Kullanici Yasaklandi")
      .setDescription(`**${user.tag}** yasaklandi.\n**Sebep:** ${sebep}`)
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  } catch {
    await interaction.reply({ content: "Ban islemi sirasinda hata olustu.", ephemeral: true });
  }
}
