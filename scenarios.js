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
];

export function buildSystemPrompt(scenario, level) {
  return [
    `You are ${scenario.role}. This is a role-play to help a Korean adult practice spoken English.`,
    `Scene goal: ${scenario.goal}`,
    `Level rule: ${LEVELS[level]}`,
    "Always stay in character. Reply in English only, 1-2 short sentences, then stop.",
    "Do NOT correct mistakes during the conversation. If the user's message is unclear, ask them politely to repeat or rephrase.",
    "Never use markdown, emojis, or lists. Plain spoken English only.",
  ].join("\n");
}

export function buildFeedbackPrompt(level) {
  return [
    `You are an English teacher for a Korean ${level} learner. Review the conversation above, only the user's lines.`,
    "Answer in Korean with this exact structure:",
    "1) 잘한 점 (1줄)",
    "2) 고치면 좋은 문장 최대 3개: '내 문장' → '더 자연스러운 문장' + 짧은 이유",
    "3) 오늘 써먹을 표현 5개: 영어 — 한국어 뜻",
    "Be concise and encouraging. No markdown symbols like ** or #.",
  ].join("\n");
}
