const messageTimestamps = new Map();
const lastMessages = new Map();

const SPAM_LIMIT = 5;
const SPAM_WINDOW_MS = 5000;
const CAPS_MIN_LENGTH = 10;
const CAPS_PERCENT = 0.7;
const EMOJI_LIMIT = 6;
const EMOJI_REGEX = /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu;
const DUPLICATE_LIMIT = 3;
const MENTION_LIMIT = 3;
const NEWLINE_LIMIT = 5;

export function checkSpam(userId, content) {
  const now = Date.now();

  // Mesaj spam: 5 saniyede 5'ten fazla mesaj
  const timestamps = (messageTimestamps.get(userId) ?? []).filter(
    (t) => now - t < SPAM_WINDOW_MS
  );
  timestamps.push(now);
  messageTimestamps.set(userId, timestamps);
  if (timestamps.length > SPAM_LIMIT) return "mesaj spam";

  // Büyük harf spam
  const letters = content.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ]/g, "");
  if (letters.length >= CAPS_MIN_LENGTH) {
    const upper = letters.replace(/[^A-ZĞÜŞİÖÇ]/g, "").length;
    if (upper / letters.length >= CAPS_PERCENT) return "büyük harf spam";
  }

  // Emoji spam
  const emojiCount = (content.match(EMOJI_REGEX) ?? []).length;
  if (emojiCount > EMOJI_LIMIT) return "emoji spam";

  // Yeni satır spam
  const newlineCount = (content.match(/\n/g) ?? []).length;
  if (newlineCount > NEWLINE_LIMIT) return "yeni satır spam";

  // Mention spam
  const mentionCount = (content.match(/<@!?\d+>/g) ?? []).length;
  if (mentionCount > MENTION_LIMIT) return "mention spam";

  // Tekrar eden mesaj
  const history = lastMessages.get(userId) ?? [];
  const normalized = content.trim().toLowerCase();
  const sameCount = history.filter((m) => m === normalized).length;
  history.push(normalized);
  if (history.length > DUPLICATE_LIMIT * 2) history.shift();
  lastMessages.set(userId, history);
  if (sameCount + 1 >= DUPLICATE_LIMIT) return "tekrar eden mesaj";

  return null;
}
