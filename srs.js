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

export function formatFeedback(fb) {
  const lines = [];
  if (fb.praise) lines.push(`👍 ${fb.praise}`, "");
  if (fb.corrections.length) {
    lines.push("🔧 고치면 좋은 문장");
    fb.corrections.forEach((c) => lines.push(`• ${c.mine}\n  → ${c.better}${c.why ? `\n  (${c.why})` : ""}`));
    lines.push("");
  }
  if (fb.expressions.length) {
    lines.push("✨ 오늘 써먹을 표현");
    fb.expressions.forEach((x) => lines.push(`• ${x.en} — ${x.ko}`));
  }
  return lines.join("\n").trim();
}
