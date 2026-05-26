import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from "discord.js";
import { hasAdminRole } from "../utils/hasAdminRole.mjs";

export const data = new SlashCommandBuilder()
  .setName("sustur")
  .setDescription("Bir kullanıcıyı sustur")
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addUserOption((opt) =>
    opt.setName("kullanici").setDescription("Susturulacak kullanıcı").setRequired(true)
  )
  .addIntegerOption((opt) =>
    opt
      .setName("sure")
      .setDescription("Süre (dakika)")
      .setMinValue(1)
      .setMaxValue(40320)
      .setRequired(true)
  )
  .addStringOption((opt) =>
    opt.setName("sebep").setDescription("Susturma sebebi").setRequired(false)
  );

export async function execute(interaction) {
  if (!await hasAdminRole(interaction)) {
    return interaction.reply({ content: "Bu komutu kullanmak için gerekli role sahip değilsin.", ephemeral: true });
  }

  const target = interaction.options.getMember("kullanici");
  const sure = interaction.options.getInteger("sure");
  const sebep = interaction.options.getString("sebep") ?? "Sebep belirtilmedi";

  if (!target) {
    return interaction.reply({ content: "Kullanıcı bulunamadı.", ephemeral: true });
  }

  if (!target.moderatable) {
    return interaction.reply({ content: "Bu kullanıcıyı susturamam. Rolüm yetersiz veya kullanıcı sunucu sahibi.", ephemeral: true });
  }

  const executor = interaction.member;
  if (executor && target.roles.highest.position >= executor.roles.highest.position) {
    return interaction.reply({ content: "Kendi rolünden yüksek veya eşit roldeki birini susturmazsın.", ephemeral: true });
  }

  await target.timeout(sure * 60 * 1000, sebep);

  const sureText = sure >= 60
    ? `${Math.floor(sure / 60)} saat ${sure % 60 > 0 ? `${sure % 60} dakika` : ""}`.trim()
    : `${sure} dakika`;

  const embed = new EmbedBuilder()
    .setColor(0xffa500)
    .setTitle("Kullanıcı Susturuldu")
    .addFields(
      { name: "Kullanıcı", value: `${target}`, inline: true },
      { name: "Süre", value: sureText, inline: true },
      { name: "Sebep", value: sebep },
      { name: "Yetkili", value: `${interaction.user}`, inline: true }
    )
    .setTimestamp();

  return interaction.reply({ embeds: [embed] });
}
