import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  GuildMember,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("kick")
  .setDescription("Kullanıcıyı sunucudan at")
  .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
  .addUserOption((opt) =>
    opt.setName("kullanici").setDescription("Kullanıcı").setRequired(true)
  )
  .addStringOption((opt) =>
    opt.setName("sebep").setDescription("Atma sebebi").setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) {
    await interaction.reply({ content: "Bu komut sadece sunucularda kullanılabilir.", ephemeral: true });
    return;
  }

  const target = interaction.options.getMember("kullanici") as GuildMember | null;
  const user = interaction.options.getUser("kullanici", true);
  const sebep = interaction.options.getString("sebep") ?? "Belirtilmedi";

  if (!target) {
    await interaction.reply({ content: "Kullanıcı sunucuda bulunamadı.", ephemeral: true });
    return;
  }

  if (!target.kickable) {
    await interaction.reply({ content: "Bu kullanıcıyı atamam.", ephemeral: true });
    return;
  }

  try {
    await target.kick(sebep);
    const embed = new EmbedBuilder()
      .setColor(0xffa500)
      .setTitle("👢 Kullanıcı Atıldı")
      .setDescription(`**${user.tag}** sunucudan atıldı.\n**Sebep:** ${sebep}`)
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  } catch {
    await interaction.reply({ content: "Kick işlemi sırasında hata oluştu.", ephemeral: true });
  }
}
