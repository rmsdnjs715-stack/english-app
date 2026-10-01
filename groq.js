const BASE = "https://api.groq.com/openai/v1";
// Llama 3.x was retired from Groq's free tier on 2026-08-16; these are Groq's recommended replacements.
const CHAT_MODELS = ["openai/gpt-oss-120b", "openai/gpt-oss-20b"];

async function call(path, key, init) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { ...init.headers, Authorization: `Bearer ${key}` },
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    const err = new Error(`Groq ${res.status}: ${detail.slice(0, 200)}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export async function transcribe(key, blob, lang = "en") {
  const ext = blob.type.includes("mp4") ? "m4a" : blob.type.includes("webm") ? "webm" : "wav";
  const form = new FormData();
  form.append("file", blob, `speech.${ext}`);
  form.append("model", "whisper-large-v3-turbo");
  form.append("language", lang);
  form.append("temperature", "0");
  const { text } = await call("/audio/transcriptions", key, { method: "POST", body: form });
  return text.trim();
}

// Big model first (or small first with `small: true` for cheap helper calls);
// on any error except a bad key (401), try the other one.
// gpt-oss is a reasoning model: hidden reasoning tokens count toward the budget, so keep it generous.
export async function chat(key, messages, { maxTokens = 1024, small = false } = {}) {
  let lastErr;
  for (const model of small ? [...CHAT_MODELS].reverse() : CHAT_MODELS) {
    try {
      const data = await call("/chat/completions", key, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_completion_tokens: maxTokens,
          reasoning_effort: "low",
          include_reasoning: false,
        }),
      });
      const text = data.choices[0]?.message?.content?.trim();
      if (!text) throw new Error(`${model}: empty reply`);
      return text;
    } catch (e) {
      lastErr = e;
      if (e.status === 401) throw e;
    }
  }
  throw lastErr;
}
