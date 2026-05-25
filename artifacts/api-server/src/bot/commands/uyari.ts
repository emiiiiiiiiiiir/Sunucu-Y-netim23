import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  GuildMember,
} from "discord.js";
import { addWarn, getWarns, clearWarns } from "../utils/warns.js";

export const data = new SlashCommandBuilder()
  .setName("uyari")
  .setDescription("Uyarı yönetimi")
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addSubcommand((sub) =>
    sub
      .setName("ver")
      .setDescription("Kullanıcıya uyarı ver")
      .addUserOption((opt) =>
        opt.setName("kullanici").setDescription("Kullanıcı").setRequired(true)
      )
      .addStringOption((opt) =>
        opt.setName("sebep").setDescription("Uyarı sebebi").setRequired(false)
      )
  )
  .addSubcommand((sub) =>
    sub
      .setName("goruntule")
      .setDescription("Kullanıcının uyarılarını görüntüle")
      .addUserOption((opt) =>
        opt.setName("kullanici").setDescription("Kullanıcı").setRequired(true)
      )
  )
  .addSubcommand((sub) =>
    sub
      .setName("sifirla")
      .setDescription("Kullanıcının uyarılarını sıfırla")
      .addUserOption((opt) =>
        opt.setName("kullanici").setDescription("Kullanıcı").setRequired(true)
      )
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild) {
    await interaction.reply({ content: "Bu komut sadece sunucularda kullanılabilir.", ephemeral: true });
    return;
  }

  const sub = interaction.options.getSubcommand();
  const user = interaction.options.getUser("kullanici", true);
  const guildId = interaction.guild.id;

  if (sub === "ver") {
    const sebep = interaction.options.getString("sebep") ?? "Belirtilmedi";
    const count = addWarn(guildId, user.id);
    const embed = new EmbedBuilder()
      .setColor(0xfee75c)
      .setTitle("⚠️ Uyarı Verildi")
      .setDescription(`${user} uyarıldı.\n**Sebep:** ${sebep}\n**Toplam uyarı:** ${count}`)
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  } else if (sub === "goruntule") {
    const count = getWarns(guildId, user.id);
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("📋 Uyarılar")
      .setDescription(`${user} kullanıcısının toplam **${count}** uyarısı var.`)
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  } else if (sub === "sifirla") {
    clearWarns(guildId, user.id);
    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle("✅ Uyarılar Sıfırlandı")
      .setDescription(`${user} kullanıcısının uyarıları sıfırlandı.`)
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
}
