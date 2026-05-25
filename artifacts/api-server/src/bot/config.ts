export const config = {
  token: process.env["DISCORD_TOKEN"] ?? "",

  adminRoleIds: (process.env["ADMIN_ROLE_IDS"] ?? "").split(",").map((s) => s.trim()).filter(Boolean),

  voiceChannelId: process.env["VOICE_CHANNEL_ID"] ?? "",

  badWords: [
    "orospu", "siktir", "amk", "amına", "amina", "bok", "göt", "got", "oç", "oc",
    "piç", "pic", "yarrak", "yarak", "fahişe", "fahise", "kahpe", "ibne",
    "götveren", "orospu çocuğu", "orospuçocuğu", "sikerim", "sikeyim",
    "amcık", "amcik", "götoğlanı", "ananı", "anani", "ananı sikim",
    "fuck", "shit", "bitch", "cunt", "dick", "pussy", "asshole", "motherfucker",
    "nigger", "nigga",
  ],

  allowedLinkDomains: [
    "discord.com",
    "discord.gg",
    "youtube.com",
    "youtu.be",
    "twitch.tv",
    "twitter.com",
    "x.com",
    "github.com",
    "imgur.com",
  ],

  warnLimit: 3,
};
