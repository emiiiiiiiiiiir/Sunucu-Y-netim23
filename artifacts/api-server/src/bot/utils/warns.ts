const warnStore = new Map<string, Map<string, number>>();

export function addWarn(guildId: string, userId: string): number {
  if (!warnStore.has(guildId)) {
    warnStore.set(guildId, new Map());
  }
  const guild = warnStore.get(guildId)!;
  const current = guild.get(userId) ?? 0;
  const next = current + 1;
  guild.set(userId, next);
  return next;
}

export function getWarns(guildId: string, userId: string): number {
  return warnStore.get(guildId)?.get(userId) ?? 0;
}

export function clearWarns(guildId: string, userId: string): void {
  warnStore.get(guildId)?.set(userId, 0);
}
