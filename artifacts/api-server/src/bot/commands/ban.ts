import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  GuildMember,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("ban")
  .setDescription("Kullanıcıyı sunucudan yasakla")
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
  .addUserOption((opt) =>
    opt.setName("kullanici").setDescription("Kullanıcı").setRequired(true)
  )
  .addStringOption((opt) =>
    opt.setName("sebep").setDescription("Ban sebebi").setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) {
    await interaction.reply({ content: "Bu komut sadece sunucularda kullanılabilir.", ephemeral: true });
    return;
  }

  const target = interaction.options.getMember("kullanici") as GuildMember | null;
  const user = interaction.options.getUser("kullanici", true);
  const sebep = interaction.options.getString("sebep") ?? "Belirtilmedi";

  if (target && !target.bannable) {
    await interaction.reply({ content: "Bu kullanıcıyı yasaklayamam.", ephemeral: true });
    return;
  }

  try {
    await interaction.guild.members.ban(user.id, { reason: sebep });
    const embed = new EmbedBuilder()
      .setColor(0xed4245)
      .setTitle("🔨 Kullanıcı Yasaklandı")
      .setDescription(`**${user.tag}** yasaklandı.\n**Sebep:** ${sebep}`)
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  } catch {
    await interaction.reply({ content: "Ban işlemi sırasında hata oluştu.", ephemeral: true });
  }
}
