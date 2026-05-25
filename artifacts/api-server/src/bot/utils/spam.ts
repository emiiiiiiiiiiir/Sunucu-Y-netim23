const messageTimestamps = new Map<string, number[]>();
const lastMessages = new Map<string, string[]>();

const SPAM_LIMIT = 5;
const SPAM_WINDOW_MS = 5000;

const CAPS_MIN_LENGTH = 10;
const CAPS_PERCENT = 0.7;

const EMOJI_LIMIT = 6;
const EMOJI_PATTERN = /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu;

const DUPLICATE_LIMIT = 3;

const MENTION_LIMIT = 3;

const NEWLINE_LIMIT = 5;

export type SpamReason =
  | "mesaj spam"
  | "büyük harf spam"
  | "emoji spam"
  | "tekrar eden mesaj"
  | "mention spam"
  | "yeni satır spam";

export function checkSpam(userId: string, content: string): SpamReason | null {
  const now = Date.now();

  const timestamps = (messageTimestamps.get(userId) ?? []).filter(
    (t) => now - t < SPAM_WINDOW_MS
  );
  timestamps.push(now);
  messageTimestamps.set(userId, timestamps);
  if (timestamps.length > SPAM_LIMIT) return "mesaj spam";

  const letters = content.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ]/g, "");
  if (letters.length >= CAPS_MIN_LENGTH) {
    const upper = letters.replace(/[^A-ZĞÜŞİÖÇ]/g, "").length;
    if (upper / letters.length >= CAPS_PERCENT) return "büyük harf spam";
  }

  const emojiCount = (content.match(EMOJI_PATTERN) ?? []).length;
  if (emojiCount > EMOJI_LIMIT) return "emoji spam";

  const newlineCount = (content.match(/\n/g) ?? []).length;
  if (newlineCount > NEWLINE_LIMIT) return "yeni satır spam";

  const mentionCount = (content.match(/<@!?\d+>/g) ?? []).length;
  if (mentionCount > MENTION_LIMIT) return "mention spam";

  const history = lastMessages.get(userId) ?? [];
  const normalized = content.trim().toLowerCase();
  const sameCount = history.filter((m) => m === normalized).length;
  history.push(normalized);
  if (history.length > DUPLICATE_LIMIT * 2) history.shift();
  lastMessages.set(userId, history);
  if (sameCount + 1 >= DUPLICATE_LIMIT) return "tekrar eden mesaj";

  return null;
}

export function resetSpam(userId: string): void {
  messageTimestamps.delete(userId);
  lastMessages.delete(userId);
}
