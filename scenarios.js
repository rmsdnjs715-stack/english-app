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

export const OPENER_REQUEST = "Start the scene now: say your first line to the user, in character.";

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
    "Reply with ONLY a JSON object, no other text:",
    '{"praise": "잘한 점 한 줄 (Korean)",',
    ' "corrections": [{"mine": "the user\'s original sentence", "better": "a more natural English sentence", "why": "짧은 이유 (Korean)"}],',
    ' "expressions": [{"en": "useful English expression for this scene", "ko": "한국어 뜻"}]}',
    "corrections: at most 3, only real mistakes or unnatural sentences (empty array if none).",
    "expressions: exactly 5, short and reusable, matched to the learner's level.",
  ].join("\n");
}
