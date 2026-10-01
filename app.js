import { SCENARIOS, buildSystemPrompt, buildFeedbackPrompt } from "./scenarios.js";
import { transcribe, chat } from "./groq.js";

const $ = (id) => document.getElementById(id);
const store = {
  get: (k, d) => { try { return localStorage.getItem(k) ?? d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
};

let level = store.get("level", "beginner");
let session = null; // { scenario, messages, stream, busy }

// ---------- home ----------
function renderHome() {
  $("key").value = store.get("groqKey", "");
  $("keyBox").classList.toggle("hidden", Boolean(store.get("groqKey", "")));
  document.querySelectorAll("#levels button").forEach((b) => b.classList.toggle("on", b.dataset.level === level));
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
  let stream = null;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch {
    // mic denied: text-only mode still works
  }
  session = {
    scenario,
    stream,
    busy: false,
    messages: [
      { role: "system", content: buildSystemPrompt(scenario, level) },
      { role: "assistant", content: scenario.opener },
    ],
  };
  $("home").classList.add("hidden");
  $("chat").classList.remove("hidden");
  $("log").replaceChildren();
  $("talk").classList.toggle("hidden", !stream);
  status(stream ? "" : "마이크 권한이 없어 입력창만 쓸 수 있어요.");
  addMsg("ai", scenario.opener);
  speak(scenario.opener);
}

function leaveChat() {
  speechSynthesis?.cancel();
  session?.stream?.getTracks().forEach((t) => t.stop());
  session = null;
  $("chat").classList.add("hidden");
  $("home").classList.remove("hidden");
}

async function userSaid(text) {
  if (!session || !text) return;
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
    const fb = await chat(
      key(),
      [{ role: "system", content: buildFeedbackPrompt(level) }, { role: "user", content: transcript }],
      { maxTokens: 2048 }
    );
    addMsg("fb", fb);
    status("");
  } catch (e) {
    status("피드백 생성 실패: 다시 눌러주세요.", true);
    console.error(e);
  }
};

// ---------- hold to talk ----------
let recorder = null;
let chunks = [];
const talk = $("talk");

function pickMime() {
  return ["audio/mp4", "audio/webm;codecs=opus", "audio/webm"].find((m) => MediaRecorder.isTypeSupported(m)) ?? "";
}

function startRec(e) {
  e.preventDefault();
  if (!session?.stream || session.busy || recorder) return;
  speechSynthesis?.cancel();
  chunks = [];
  const mime = pickMime();
  recorder = new MediaRecorder(session.stream, mime ? { mimeType: mime } : undefined);
  recorder.ondataavailable = (ev) => ev.data.size && chunks.push(ev.data);
  recorder.onstop = onRecStop;
  recorder.start();
  talk.classList.add("rec");
  talk.textContent = "🔴 말하는 중… 놓으면 전송";
}

function stopRec(e) {
  e.preventDefault();
  if (recorder?.state === "recording") recorder.stop();
}

async function onRecStop() {
  const type = recorder.mimeType || "audio/mp4";
  recorder = null;
  talk.classList.remove("rec");
  talk.textContent = "🎤 누르고 말하기";
  const blob = new Blob(chunks, { type });
  if (blob.size < 2000) return status("너무 짧아요. 버튼을 누른 채 말하세요.", true);
  status("듣는 중…");
  try {
    const text = await transcribe(key(), blob);
    if (!text) return status("잘 안 들렸어요. 다시 말해보세요.", true);
    await userSaid(text);
  } catch (e) {
    status(e.status === 401 ? "API 키가 올바르지 않아요." : "음성 인식 오류: 다시 시도하세요.", true);
    console.error(e);
  }
}

talk.addEventListener("pointerdown", startRec);
talk.addEventListener("pointerup", stopRec);
talk.addEventListener("pointercancel", stopRec);
talk.addEventListener("contextmenu", (e) => e.preventDefault());

renderHome();
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
