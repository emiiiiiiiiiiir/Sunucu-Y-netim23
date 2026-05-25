import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";
import { addWarn, getWarns, clearWarns } from "../utils/warns.js";
import { hasAdminRole } from "../utils/hasAdminRole.js";

export const data = new SlashCommandBuilder()
  .setName("uyari")
  .setDescription("Uyari yonetimi")
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addSubcommand((sub) =>
    sub
      .setName("ver")
      .setDescription("Kullaniciya uyari ver")
      .addUserOption((opt) =>
        opt.setName("kullanici").setDescription("Kullanici").setRequired(true)
      )
      .addStringOption((opt) =>
        opt.setName("sebep").setDescription("Uyari sebebi").setRequired(false)
      )
  )
  .addSubcommand((sub) =>
    sub
      .setName("goruntule")
      .setDescription("Kullanicinin uyarilarini goruntule")
      .addUserOption((opt) =>
        opt.setName("kullanici").setDescription("Kullanici").setRequired(true)
      )
  )
  .addSubcommand((sub) =>
    sub
      .setName("sifirla")
      .setDescription("Kullanicinin uyarilarini sifirla")
      .addUserOption((opt) =>
        opt.setName("kullanici").setDescription("Kullanici").setRequired(true)
      )
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

  const sub = interaction.options.getSubcommand();
  const user = interaction.options.getUser("kullanici", true);
  const guildId = interaction.guild.id;

  if (sub === "ver") {
    const sebep = interaction.options.getString("sebep") ?? "Belirtilmedi";
    const count = addWarn(guildId, user.id);
    const embed = new EmbedBuilder()
      .setColor(0xfee75c)
      .setTitle("Uyari Verildi")
      .setDescription(`${user} uyarildi.\n**Sebep:** ${sebep}\n**Toplam uyari:** ${count}`)
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  } else if (sub === "goruntule") {
    const count = getWarns(guildId, user.id);
    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("Uyarilar")
      .setDescription(`${user} kullanicisinin toplam **${count}** uyarisi var.`)
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  } else if (sub === "sifirla") {
    clearWarns(guildId, user.id);
    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle("Uyarilar Sifirland")
      .setDescription(`${user} kullanicisinin uyarilari sifirland.`)
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
}
