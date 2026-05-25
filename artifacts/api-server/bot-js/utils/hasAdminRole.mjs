import { config } from "../config.mjs";

export async function hasAdminRole(interaction) {
  if (config.adminRoleIds.length === 0) return true;

  let member = interaction.guild?.members.cache.get(interaction.user.id);
  if (!member) {
    member = await interaction.guild?.members.fetch(interaction.user.id).catch(() => null);
  }

  if (!member) return false;
  return config.adminRoleIds.some((roleId) => member.roles.cache.has(roleId));
}
