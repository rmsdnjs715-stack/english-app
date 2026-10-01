// Leitner-style spaced repetition: right answer moves a card up a box (longer wait), wrong sends it back to box 0.
const DAY = 86_400_000;
export const INTERVALS = [0, 1, 3, 7, 14, 30]; // days to wait in each box

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();

export function addCards(cards, items, now) {
  const seen = new Set(cards.map((c) => norm(c.back)));
  const fresh = [];
  for (const { front, back, note = "" } of items) {
    if (!front || !back) continue;
    const k = norm(back);
    if (!k || seen.has(k)) continue;
    seen.add(k);
    fresh.push({ id: `${now}-${fresh.length}`, front, back, note, box: 0, due: now });
  }
  return [...cards, ...fresh];
}

export function grade(card, knew, now) {
  const box = knew ? Math.min(card.box + 1, INTERVALS.length - 1) : 0;
  return { ...card, box, due: now + INTERVALS[box] * DAY };
}

export const dueCards = (cards, now) => cards.filter((c) => c.due <= now).sort((a, b) => a.due - b.due);

// Shadowing: how much of the target sentence the learner actually said, word by word (LCS, order-aware).
const words = (s) => norm(s).split(" ").filter(Boolean);

export function scoreSpeech(target, said) {
  const t = words(target);
  const s = words(said);
  const dp = Array.from({ length: t.length + 1 }, () => new Array(s.length + 1).fill(0));
  for (let i = t.length - 1; i >= 0; i--)
    for (let j = s.length - 1; j >= 0; j--)
      dp[i][j] = t[i] === s[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const hit = new Set();
  for (let i = 0, j = 0; i < t.length && j < s.length; ) {
    if (t[i] === s[j]) { hit.add(i); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
    else j++;
  }
  return {
    score: t.length ? Math.round((hit.size / t.length) * 100) : 0,
    missed: t.filter((_, i) => !hit.has(i)),
  };
}

const str = (v, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// Model output -> validated feedback, or null if it isn't the JSON we asked for.
export function parseFeedback(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  let raw;
  try {
    raw = JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
  const list = (v) => (Array.isArray(v) ? v : []);
  const corrections = list(raw.corrections)
    .map((c) => ({ mine: str(c?.mine), better: str(c?.better), why: str(c?.why) }))
    .filter((c) => c.mine && c.better)
    .slice(0, 3);
  const expressions = list(raw.expressions)
    .map((x) => ({ en: str(x?.en), ko: str(x?.ko) }))
    .filter((x) => x.en && x.ko)
    .slice(0, 5);
  if (!corrections.length && !expressions.length) return null;
  return { praise: str(raw.praise, 300), corrections, expressions };
}

export const feedbackToCards = (fb) => [
  ...fb.corrections.map((c) => ({ front: `🔧 ${c.mine}`, back: c.better, note: c.why })),
  ...fb.expressions.map((x) => ({ front: x.ko, back: x.en, note: "" })),
];

