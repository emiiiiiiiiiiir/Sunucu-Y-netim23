const warnStore = new Map();

export function addWarn(guildId, userId) {
  if (!warnStore.has(guildId)) warnStore.set(guildId, new Map());
  const guild = warnStore.get(guildId);
  const current = guild.get(userId) ?? 0;
  const next = current + 1;
  guild.set(userId, next);
  return next;
}

export function getWarns(guildId, userId) {
  return warnStore.get(guildId)?.get(userId) ?? 0;
}

export function clearWarns(guildId, userId) {
  warnStore.get(guildId)?.set(userId, 0);
}
