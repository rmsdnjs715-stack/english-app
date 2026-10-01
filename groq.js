const BASE = "https://api.groq.com/openai/v1";
const CHAT_MODELS = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"];

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

export async function transcribe(key, blob) {
  const ext = blob.type.includes("mp4") ? "m4a" : blob.type.includes("webm") ? "webm" : "wav";
  const form = new FormData();
  form.append("file", blob, `speech.${ext}`);
  form.append("model", "whisper-large-v3-turbo");
  form.append("language", "en");
  form.append("temperature", "0");
  const { text } = await call("/audio/transcriptions", key, { method: "POST", body: form });
  return text.trim();
}

// 70b first; on rate limit (429) fall back to 8b.
export async function chat(key, messages, { maxTokens = 120 } = {}) {
  let lastErr;
  for (const model of CHAT_MODELS) {
    try {
      const data = await call("/chat/completions", key, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, messages, temperature: 0.7, max_tokens: maxTokens }),
      });
      return data.choices[0].message.content.trim();
    } catch (e) {
      lastErr = e;
      if (e.status !== 429) throw e;
    }
  }
  throw lastErr;
}
