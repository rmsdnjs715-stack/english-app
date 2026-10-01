export const LEVELS = {
  beginner: "Use only simple, common words and short sentences (max 10 words). Speak slowly and clearly. Ask one easy question at a time.",
  intermediate: "Use natural everyday English with common idioms. Sentences up to 20 words. You may ask follow-up questions.",
};

export { SCENARIOS, CATEGORIES } from "./scenario-list.js";

const MAX_CUSTOM = 100;

// A user-described scene. No fixed opener: the AI writes its own first line.
export function makeCustomScenario(text) {
  const scene = text.trim().slice(0, MAX_CUSTOM);
  if (!scene) return null;
  return {
    id: "custom",
    title: scene,
    emoji: "✏️",
    role: "the other person in this scene (pick the most natural role)",
    goal: `The scene, described by the learner in Korean or English: "${scene}"`,
    opener: null,
  };
}

// A real person, not a textbook: a local from Portland, Maine (30s). Maine flavor is light on purpose —
// heavy dialect ("ayuh" is mostly older Downeast speakers) would sound fake and confuse learners.
const MAINE_VOICE = {
  beginner: [
    "Talk like a real, friendly local from Portland, Maine in their 30s — not a teacher, not a textbook.",
    "Use contractions (I'm, you're, that's) and casual reactions (Oh nice! / Yeah, for sure. / No worries.).",
    "Keep the Maine flavor very light: at most one 'wicked' (= very, e.g. 'wicked good') in the whole chat, nothing else regional.",
  ],
  intermediate: [
    "Talk like a real local from Portland, Maine in their 30s: warm, a bit dry and understated, never over-excited.",
    "Use natural spoken English: contractions, fillers (yeah, so, I mean), casual phrasing (gonna, wanna, kinda) where a real person would.",
    "Now and then use real Maine expressions when they fit naturally: 'wicked' (very), 'from away' (not from Maine), 'upta camp' (at the cabin). Never force them; avoid 'ayuh'.",
  ],
};

const realVoice = (level) => MAINE_VOICE[level].join("\n");

export function buildHintPrompt(level) {
  return [
    `You help a Korean ${level} English learner who is stuck in a role-play. Read the conversation and suggest what THE LEARNER could say next.`,
    `Level rule: ${LEVELS[level]}`,
    "Suggestions must sound like what a real American would casually say in this moment (contractions, natural phrasing), not textbook sentences.",
    "Give exactly 3 different replies, one per line, in this format: English sentence | 한국어 뜻",
    "No numbering, no other text.",
  ].join("\n");
}

export function buildTranslatePrompt(level) {
  return [
    `A Korean ${level} English learner said something in Korean during a role-play. Turn it into what they should say in English, fitting the conversation.`,
    `Level rule: ${LEVELS[level]}`,
    "Say it the way a real American would casually say it in this moment, not a word-for-word textbook translation.",
    "Reply with ONLY the English sentence, nothing else.",
  ].join("\n");
}

// "English | 한국어" lines -> [{ en, ko }], at most 3.
export function parseHints(text) {
  return text
    .split("\n")
    .map((l) => l.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").split("|"))
    .map(([en = "", ko = ""]) => ({ en: en.trim(), ko: ko.trim() }))
    .filter((h) => /[a-z]/i.test(h.en))
    .slice(0, 3);
}

export const OPENER_REQUEST ="Start the scene now: say your first line to the user, in character.";

export function buildSystemPrompt(scenario, level) {
  return [
    `You are ${scenario.role}. This is a role-play to help a Korean adult practice spoken English.`,
    `Scene goal: ${scenario.goal}`,
    `Level rule: ${LEVELS[level]}`,
    realVoice(level),
    "Unless the scene says otherwise, it takes place in Portland, Maine.",
    "Always stay in character. Reply in English only, 1-2 short sentences, then stop.",
    "Do NOT correct mistakes during the conversation. If the user's message is unclear, ask them politely to repeat or rephrase.",
    "Never use markdown, emojis, or lists. Plain spoken English only.",
  ].join("\n");
}

export function buildFeedbackPrompt(level) {
  return [
    `You are an English teacher for a Korean ${level} learner. Review the conversation above, only the user's lines.`,
    "Reply with ONLY a JSON object, no other text:",
    '{"praise": "잘한 점 한 줄 (Korean)",',
    ' "corrections": [{"mine": "the user\'s original sentence", "better": "how a real local would naturally say it", "why": "왜 바꾸는지 (Korean)"}],',
    ' "expressions": [{"en": "useful English expression for this scene", "ko": "한국어 뜻"}]}',
    "'better' and 'en' must be what a real person in Maine (USA) would actually say in daily life: casual, contractions, not stiff textbook English.",
    "If one of the 5 expressions is Maine slang (like 'wicked good'), mark it in ko, e.g. '엄청 좋아 (메인주 표현)'. At most one such expression.",
    "Write every Korean field so a middle-school student understands it instantly: one short friendly sentence, no grammar terms (no 관사, 전치사, 시제 etc.), explain with everyday words.",
    'Example why: "\'one Americano\'처럼 개수를 먼저 말해야 자연스러워요."',
    "corrections: at most 3, only real mistakes or unnatural sentences (empty array if none).",
    "expressions: exactly 5, short and reusable, matched to the learner's level.",
  ].join("\n");
}
