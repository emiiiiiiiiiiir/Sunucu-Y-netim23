export const config = {
  token: process.env["DISCORD_TOKEN"] ?? "",

  badWords: [
    "küfür1", "küfür2", "orospu", "siktir", "amk", "amına", "bok", "göt", "oç",
    "piç", "yarrak", "yarak", "orospu", "fahişe", "kahpe", "ibne", "götveren",
    "fuck", "shit", "bitch", "ass", "damn", "cunt", "dick", "pussy",
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

  linkPattern: /https?:\/\/([\w-]+(\.[\w-]+)+)(\/[^\s]*)?/gi,

  warnLimit: 3,
};
