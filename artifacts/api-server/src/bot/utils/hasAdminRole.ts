import { ChatInputCommandInteraction } from "discord.js";
import { config } from "../config.js";

export async function hasAdminRole(interaction: ChatInputCommandInteraction): Promise<boolean> {
  if (!config.adminRoleId) return true;

  const member = interaction.guild?.members.cache.get(interaction.user.id)
    ?? await interaction.guild?.members.fetch(interaction.user.id).catch(() => null);

  if (!member) return false;

  return member.roles.cache.has(config.adminRoleId);
}
