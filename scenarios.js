export const LEVELS = {
  beginner: "Use only simple, common words and short sentences (max 10 words). Speak slowly and clearly. Ask one easy question at a time.",
  intermediate: "Use natural everyday English with common idioms. Sentences up to 20 words. You may ask follow-up questions.",
};

export const SCENARIOS = [
  {
    id: "cafe",
    title: "카페에서 주문하기",
    emoji: "☕",
    role: "a friendly barista at a coffee shop",
    goal: "The user orders a drink and maybe a snack, and pays.",
    opener: "Hi there! Welcome in. What can I get for you today?",
  },
  {
    id: "airport",
    title: "공항 체크인",
    emoji: "✈️",
    role: "an airline check-in agent at the airport",
    goal: "The user checks in for a flight: passport, luggage, seat preference.",
    opener: "Good morning! May I see your passport, please?",
  },
  {
    id: "directions",
    title: "길 물어보기",
    emoji: "🗺️",
    role: "a helpful local person on the street in a big city",
    goal: "The user asks how to get to a place (station, museum, restaurant).",
    opener: "Hi! You look a little lost. Can I help you?",
  },
  {
    id: "restaurant",
    title: "식당에서 주문하기",
    emoji: "🍝",
    role: "a server at a casual restaurant",
    goal: "The user gets a table, orders food and drinks, asks about the menu, and asks for the check.",
    opener: "Good evening! Table for how many?",
  },
  {
    id: "hotel",
    title: "호텔 체크인",
    emoji: "🏨",
    role: "a front desk clerk at a hotel",
    goal: "The user checks in, confirms the reservation, and asks about breakfast, Wi-Fi, or checkout time.",
    opener: "Welcome to the Grand Hotel. Do you have a reservation with us?",
  },
  {
    id: "taxi",
    title: "택시·우버 타기",
    emoji: "🚕",
    role: "a taxi driver",
    goal: "The user gives the destination, talks about the route or time, and pays.",
    opener: "Hi there, where are you heading today?",
  },
  {
    id: "shopping",
    title: "옷 가게 쇼핑",
    emoji: "👕",
    role: "a sales assistant in a clothing store",
    goal: "The user looks for an item, asks about size, color, and price, and tries something on.",
    opener: "Hi! Are you looking for anything in particular today?",
  },
  {
    id: "refund",
    title: "교환·환불하기",
    emoji: "🧾",
    role: "a customer service clerk at a store",
    goal: "The user explains a problem with something they bought and asks for an exchange or refund.",
    opener: "Hello, how can I help you today?",
  },
  {
    id: "pharmacy",
    title: "약국·병원",
    emoji: "💊",
    role: "a pharmacist",
    goal: "The user describes symptoms (headache, cold, stomachache) and gets medicine and advice.",
    opener: "Hi, what can I help you with today?",
  },
  {
    id: "smalltalk",
    title: "회사 동료와 스몰토크",
    emoji: "💼",
    role: "a friendly coworker chatting in the office break room",
    goal: "Casual small talk: weekend plans, weather, work, hobbies.",
    opener: "Hey, good morning! How was your weekend?",
  },
  {
    id: "meeting",
    title: "회의에서 의견 말하기",
    emoji: "📊",
    role: "a team leader running a short team meeting",
    goal: "The user shares a work update, gives an opinion, and agrees or politely disagrees.",
    opener: "Okay everyone, let's get started. Could you give us a quick update on your project?",
  },
  {
    id: "intro",
    title: "자기소개하기",
    emoji: "🙋",
    role: "a friendly person meeting the user for the first time at a networking event",
    goal: "The user introduces themselves: name, job, where they live, hobbies.",
    opener: "Hi, I don't think we've met. I'm Alex. What's your name?",
  },
  {
    id: "phone",
    title: "전화로 예약하기",
    emoji: "📞",
    role: "a receptionist answering the phone at a restaurant",
    goal: "The user books a table: date, time, number of people, name, phone number.",
    opener: "Thank you for calling Bella Cucina. How can I help you?",
  },
  {
    id: "bank",
    title: "은행 업무",
    emoji: "🏦",
    role: "a bank teller",
    goal: "The user opens an account, exchanges money, or asks about a card problem.",
    opener: "Good afternoon. What can I do for you today?",
  },
  {
    id: "friend",
    title: "친구와 주말 약속",
    emoji: "🎬",
    role: "the user's English-speaking friend",
    goal: "Make weekend plans together: what to do, when and where to meet.",
    opener: "Hey! Are you free this weekend? We should hang out.",
  },
];

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
