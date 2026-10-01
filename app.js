import {
  SCENARIOS, buildSystemPrompt, buildFeedbackPrompt, buildHintPrompt, buildTranslatePrompt,
  parseHints, makeCustomScenario, OPENER_REQUEST,
} from "./scenarios.js";
import { getMic, releaseMic, holdToRecord } from "./recorder.js";
import { transcribe, chat } from "./groq.js";
import { parseFeedback, feedbackToCards, formatFeedback } from "./srs.js";
import { openReview, saveNewCards, dueCount } from "./review.js";

const $ = (id) => document.getElementById(id);
const store = {
  get: (k, d) => { try { return localStorage.getItem(k) ?? d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
};

let level = store.get("level", "beginner");
let session = null; // { scenario, messages, busy }

// ---------- home ----------
function renderHome() {
  $("key").value = store.get("groqKey", "");
  $("keyBox").classList.toggle("hidden", Boolean(store.get("groqKey", "")));
  document.querySelectorAll("#levels button").forEach((b) => b.classList.toggle("on", b.dataset.level === level));
  const due = dueCount();
  $("reviewBtn").textContent = due ? `📚 복습하기 (${due}장)` : "📚 복습하기";
  $("scenarios").replaceChildren(
    ...SCENARIOS.map((s) => {
      const b = document.createElement("button");
      b.className = "card";
      b.textContent = `${s.emoji}  ${s.title}`;
      b.onclick = () => startChat(s);
      return b;
    })
  );
}

$("saveKey").onclick = () => {
  const v = $("key").value.trim();
  if (!v.startsWith("gsk_")) return alert("gsk_ 로 시작하는 Groq 키를 넣어주세요.");
  store.set("groqKey", v);
  renderHome();
};
$("reviewBtn").onclick = () => {
  $("home").classList.add("hidden");
  openReview({ speak, getKey: key, onClose: () => { $("home").classList.remove("hidden"); renderHome(); } });
};
$("customGo").onclick = () => {
  const s = makeCustomScenario($("custom").value);
  if (!s) return alert("어떤 상황인지 한 줄로 적어주세요.");
  startChat(s);
};
$("levels").onclick = (e) => {
  const l = e.target.dataset?.level;
  if (!l) return;
  level = l;
  store.set("level", l);
  renderHome();
};
// double-tap the title to change the key
document.querySelector("h1").addEventListener("dblclick", () => { store.set("groqKey", ""); renderHome(); });

// ---------- helpers ----------
function status(text, isErr = false) {
  $("status").textContent = text;
  $("status").classList.toggle("err", isErr);
}
function addMsg(kind, text) {
  const d = document.createElement("div");
  d.className = `msg ${kind}`;
  d.textContent = text;
  $("log").append(d);
  $("log").scrollTop = $("log").scrollHeight;
}
function speak(text) {
  if (!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = level === "beginner" ? 0.85 : 0.95;
  const v = speechSynthesis.getVoices().find((x) => x.lang === "en-US" && /samantha|ava|allison|google/i.test(x.name))
    ?? speechSynthesis.getVoices().find((x) => x.lang === "en-US");
  if (v) u.voice = v;
  speechSynthesis.speak(u);
}
const key = () => store.get("groqKey", "");

// ---------- chat ----------
async function startChat(scenario) {
  if (!key()) return alert("먼저 Groq API 키를 저장하세요.");
  // iOS: speech + mic must be unlocked inside this tap.
  if ("speechSynthesis" in window) speechSynthesis.speak(new SpeechSynthesisUtterance(""));
  const hasMic = await getMic().then(() => true, () => false); // denied: text-only mode still works
  const system = { role: "system", content: buildSystemPrompt(scenario, level) };
  session = { scenario, busy: true, messages: [system] };
  $("home").classList.add("hidden");
  $("chat").classList.remove("hidden");
  $("log").replaceChildren();
  $("hints").replaceChildren();
  $("micRow").classList.toggle("hidden", !hasMic);

  let opener = scenario.opener;
  if (!opener) {
    status("상황 준비 중…");
    try {
      opener = await chat(key(), [system, { role: "user", content: OPENER_REQUEST }], { maxTokens: 512 });
    } catch (e) {
      console.error(e);
      status(`상황을 못 만들었어요(${e.status ?? "네트워크"}). 나가서 다시 시도하세요.`, true);
      return;
    }
  }
  if (!session) return; // user left while the opener was loading
  session = { ...session, busy: false, messages: [system, { role: "assistant", content: opener }] };
  status(hasMic ? "" : "마이크 권한이 없어 입력창만 쓸 수 있어요.");
  addMsg("ai", opener);
  speak(opener);
}

function leaveChat() {
  speechSynthesis?.cancel();
  releaseMic();
  session = null;
  $("chat").classList.add("hidden");
  $("home").classList.remove("hidden");
}

async function userSaid(text) {
  if (!session || !text) return;
  $("hints").replaceChildren();
  addMsg("me", text);
  session = { ...session, busy: true, messages: [...session.messages, { role: "user", content: text }] };
  status("생각 중…");
  try {
    const reply = await chat(key(), session.messages);
    session = { ...session, messages: [...session.messages, { role: "assistant", content: reply }] };
    addMsg("ai", reply);
    speak(reply);
    status("");
  } catch (e) {
    status(e.status === 401 ? "API 키가 올바르지 않아요." : e.status === 429 ? "잠시 후 다시 시도하세요 (한도 초과)." : `연결 오류(${e.status ?? "네트워크"}): 다시 시도하세요.`, true);
    console.error(e);
  } finally {
    session = session && { ...session, busy: false };
  }
}

$("send").onclick = () => {
  const t = $("text").value.trim();
  $("text").value = "";
  userSaid(t);
};
$("text").onkeydown = (e) => e.key === "Enter" && $("send").click();
$("back").onclick = leaveChat;

$("finish").onclick = async () => {
  if (!session || session.busy) return;
  const turns = session.messages.filter((m) => m.role === "user");
  if (turns.length === 0) return status("먼저 한마디라도 말해보세요.", true);
  status("피드백 만드는 중…");
  try {
    const transcript = session.messages
      .filter((m) => m.role !== "system")
      .map((m) => `${m.role === "user" ? "User" : "Partner"}: ${m.content}`)
      .join("\n");
    const raw = await chat(
      key(),
      [{ role: "system", content: buildFeedbackPrompt(level) }, { role: "user", content: transcript }],
      { maxTokens: 2048 }
    );
    const fb = parseFeedback(raw);
    if (!fb) {
      addMsg("fb", raw); // unexpected format: still show it, just don't make cards
      return status("카드 저장은 건너뛰었어요 (형식 오류).", true);
    }
    const added = saveNewCards(feedbackToCards(fb));
    addMsg("fb", `${formatFeedback(fb)}\n\n📚 복습 카드 ${added}장 저장됨`);
    status("");
  } catch (e) {
    status("피드백 생성 실패: 다시 눌러주세요.", true);
    console.error(e);
  }
};

// ---------- helpers that don't join the conversation ----------
// Last few turns only: enough context, fewer tokens.
const recentTranscript = () =>
  session.messages
    .filter((m) => m.role !== "system")
    .slice(-6)
    .map((m) => `${m.role === "user" ? "Learner" : "Partner"}: ${m.content}`)
    .join("\n");

async function helper(systemPrompt, userContent) {
  return chat(key(), [{ role: "system", content: systemPrompt }, { role: "user", content: userContent }], {
    small: true,
    maxTokens: 512,
  });
}

$("hint").onclick = async () => {
  if (!session || session.busy) return;
  status("힌트 찾는 중…");
  try {
    const hints = parseHints(await helper(buildHintPrompt(level), recentTranscript()));
    if (!hints.length) return status("힌트를 못 만들었어요. 다시 눌러주세요.", true);
    $("hints").replaceChildren(
      ...hints.map((h) => {
        const b = document.createElement("button");
        b.className = "hintChip";
        b.textContent = `🔊 ${h.en}${h.ko ? `\n${h.ko}` : ""}`;
        b.onclick = () => speak(h.en);
        return b;
      })
    );
    status("눌러서 듣고, 따라 말해보세요.");
  } catch (e) {
    console.error(e);
    status(`힌트 오류(${e.status ?? "네트워크"})`, true);
  }
};

async function koreanSaid(ko) {
  addMsg("fb", `🇰🇷 ${ko}`);
  status("영어로 바꾸는 중…");
  const en = (await helper(buildTranslatePrompt(level), `Conversation:\n${recentTranscript()}\n\nKorean: ${ko}`))
    .split("\n")[0]
    .trim();
  addMsg("fb", `🇺🇸 ${en}\n👉 이제 🎤 버튼으로 따라 말해보세요`);
  speak(en);
  saveNewCards([{ front: ko, back: en, note: "내가 하고 싶었던 말" }]);
  status("");
}

// ---------- hold to talk ----------
const recErr = (why) =>
  status(why === "mic" ? "마이크 권한을 허용해주세요." : "너무 짧아요. 버튼을 누른 채 말하세요.", true);

function holdButton(id, lang, onText) {
  holdToRecord($(id), {
    canStart: () => Boolean(session && !session.busy),
    onStart: () => speechSynthesis?.cancel(),
    onError: recErr,
    onBlob: async (blob) => {
      status("듣는 중…");
      try {
        const text = await transcribe(key(), blob, lang);
        if (!text) return status("잘 안 들렸어요. 다시 말해보세요.", true);
        await onText(text);
      } catch (e) {
        status(e.status === 401 ? "API 키가 올바르지 않아요." : `음성 오류(${e.status ?? "네트워크"}): 다시 시도하세요.`, true);
        console.error(e);
      }
    },
  });
}

holdButton("talk", "en", userSaid);
holdButton("talkKo", "ko", koreanSaid);

renderHome();
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
