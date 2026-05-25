import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  GuildMember,
} from "discord.js";
import { hasAdminRole } from "../utils/hasAdminRole.js";

const durations: Record<string, number> = {
  "1dk": 60 * 1000,
  "5dk": 5 * 60 * 1000,
  "10dk": 10 * 60 * 1000,
  "30dk": 30 * 60 * 1000,
  "1saat": 60 * 60 * 1000,
  "1gun": 24 * 60 * 60 * 1000,
};

export const data = new SlashCommandBuilder()
  .setName("sustur")
  .setDescription("Kullanıcıyı sustur (timeout)")
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addUserOption((opt) =>
    opt.setName("kullanici").setDescription("Kullanıcı").setRequired(true)
  )
  .addStringOption((opt) =>
    opt
      .setName("sure")
      .setDescription("Susturma süresi")
      .setRequired(true)
      .addChoices(
        { name: "1 dakika", value: "1dk" },
        { name: "5 dakika", value: "5dk" },
        { name: "10 dakika", value: "10dk" },
        { name: "30 dakika", value: "30dk" },
        { name: "1 saat", value: "1saat" },
        { name: "1 gün", value: "1gun" }
      )
  )
  .addStringOption((opt) =>
    opt.setName("sebep").setDescription("Susturma sebebi").setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!await hasAdminRole(interaction)) {
    await interaction.reply({ content: "Bu komutu kullanmak için gerekli role sahip değilsin.", ephemeral: true });
    return;
  }

  if (!interaction.guild) {
    await interaction.reply({ content: "Bu komut sadece sunucularda kullanılabilir.", ephemeral: true });
    return;
  }

  const target = interaction.options.getMember("kullanici") as GuildMember | null;
  const user = interaction.options.getUser("kullanici", true);
  const sureKey = interaction.options.getString("sure", true);
  const sebep = interaction.options.getString("sebep") ?? "Belirtilmedi";
  const ms = durations[sureKey] ?? 60000;

  if (!target) {
    await interaction.reply({ content: "Kullanıcı sunucuda bulunamadı.", ephemeral: true });
    return;
  }

  if (!target.moderatable) {
    await interaction.reply({ content: "Bu kullanıcıyı susturamam.", ephemeral: true });
    return;
  }

  try {
    await target.timeout(ms, sebep);
    const embed = new EmbedBuilder()
      .setColor(0xfee75c)
      .setTitle("Kullanıcı Susturuldu")
      .setDescription(`**${user.tag}** susturuldu.\n**Süre:** ${sureKey}\n**Sebep:** ${sebep}`)
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  } catch {
    await interaction.reply({ content: "Susturma işlemi sırasında hata oluştu.", ephemeral: true });
  }
}
