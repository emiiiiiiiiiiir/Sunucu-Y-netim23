import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  GuildMember,
} from "discord.js";
import { hasAdminRole } from "../utils/hasAdminRole.js";

export const data = new SlashCommandBuilder()
  .setName("kick")
  .setDescription("Kullaniciy sunucudan at")
  .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
  .addUserOption((opt) =>
    opt.setName("kullanici").setDescription("Kullanici").setRequired(true)
  )
  .addStringOption((opt) =>
    opt.setName("sebep").setDescription("Atma sebebi").setRequired(false)
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

  if (!target) {
    await interaction.reply({ content: "Kullanici sunucuda bulunamadi.", ephemeral: true });
    return;
  }

  if (!target.kickable) {
    await interaction.reply({ content: "Bu kullaniciy atamam.", ephemeral: true });
    return;
  }

  try {
    await target.kick(sebep);
    const embed = new EmbedBuilder()
      .setColor(0xffa500)
      .setTitle("Kullanici Atildi")
      .setDescription(`**${user.tag}** sunucudan atildi.\n**Sebep:** ${sebep}`)
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  } catch {
    await interaction.reply({ content: "Kick islemi sirasinda hata olustu.", ephemeral: true });
  }
}
