// Run: node groq.test.mjs  (mocks fetch; no network, no key)
import assert from "node:assert/strict";
import { chat, transcribe } from "./groq.js";

const ok = (body) => ({ ok: true, json: async () => body });
const fail = (status) => ({ ok: false, status, text: async () => "err" });
const reply = (t) => ok({ choices: [{ message: { content: ` ${t} ` } }] });

// 70b ok -> uses 70b
let models = [];
globalThis.fetch = async (_u, init) => { models.push(JSON.parse(init.body).model); return reply("hi"); };
assert.equal(await chat("k", []), "hi");
assert.deepEqual(models, ["llama-3.3-70b-versatile"]);

// 70b rate-limited -> falls back to 8b
models = [];
globalThis.fetch = async (_u, init) => {
  const m = JSON.parse(init.body).model; models.push(m);
  return m.includes("70b") ? fail(429) : reply("fallback");
};
assert.equal(await chat("k", []), "fallback");
assert.deepEqual(models, ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"]);

// 401 does not fall back
models = [];
globalThis.fetch = async (_u, init) => { models.push(JSON.parse(init.body).model); return fail(401); };
await assert.rejects(() => chat("k", []), (e) => e.status === 401);
assert.equal(models.length, 1);

// transcribe: m4a extension for iOS mp4 audio, sends auth header
let seen;
globalThis.fetch = async (url, init) => { seen = { url, init }; return ok({ text: " hello " }); };
assert.equal(await transcribe("k", new Blob(["x"], { type: "audio/mp4" })), "hello");
assert.equal(seen.init.headers.Authorization, "Bearer k");
assert.equal(seen.init.body.get("file").name, "speech.m4a");
assert.equal(seen.init.body.get("model"), "whisper-large-v3-turbo");

console.log("groq.js: 4 checks passed");
