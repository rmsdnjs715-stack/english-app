// Run: node groq.test.mjs  (mocks fetch; no network, no key)
import assert from "node:assert/strict";
import { chat, transcribe } from "./groq.js";

const ok = (body) => ({ ok: true, json: async () => body });
const fail = (status) => ({ ok: false, status, text: async () => "err" });
const reply = (t) => ok({ choices: [{ message: { content: ` ${t} ` } }] });
const BIG = "openai/gpt-oss-120b";
const SMALL = "openai/gpt-oss-20b";

// big model ok -> uses big, with hidden low-effort reasoning
let bodies = [];
globalThis.fetch = async (_u, init) => { bodies.push(JSON.parse(init.body)); return reply("hi"); };
assert.equal(await chat("k", []), "hi");
assert.deepEqual(bodies.map((b) => b.model), [BIG]);
assert.equal(bodies[0].reasoning_effort, "low");
assert.equal(bodies[0].include_reasoning, false);

// big model fails (rate limit OR retired model 400/404) -> falls back to small
for (const status of [429, 400, 404]) {
  bodies = [];
  globalThis.fetch = async (_u, init) => {
    const b = JSON.parse(init.body); bodies.push(b);
    return b.model === BIG ? fail(status) : reply("fallback");
  };
  assert.equal(await chat("k", []), "fallback", `status ${status}`);
  assert.deepEqual(bodies.map((b) => b.model), [BIG, SMALL]);
}

// empty reply (reasoning ate the budget) -> falls back too
bodies = [];
globalThis.fetch = async (_u, init) => {
  const b = JSON.parse(init.body); bodies.push(b);
  return b.model === BIG ? ok({ choices: [{ message: { content: "" } }] }) : reply("ok");
};
assert.equal(await chat("k", []), "ok");

// 401 does not fall back
bodies = [];
globalThis.fetch = async (_u, init) => { bodies.push(JSON.parse(init.body)); return fail(401); };
await assert.rejects(() => chat("k", []), (e) => e.status === 401);
assert.equal(bodies.length, 1);

// transcribe: m4a extension for iOS mp4 audio, sends auth header
let seen;
globalThis.fetch = async (url, init) => { seen = { url, init }; return ok({ text: " hello " }); };
assert.equal(await transcribe("k", new Blob(["x"], { type: "audio/mp4" })), "hello");
assert.equal(seen.init.headers.Authorization, "Bearer k");
assert.equal(seen.init.body.get("file").name, "speech.m4a");
assert.equal(seen.init.body.get("model"), "whisper-large-v3-turbo");

// small: true tries the small model first (helper calls save the big model's budget)
bodies = [];
globalThis.fetch = async (_u, init) => { bodies.push(JSON.parse(init.body)); return reply("hint"); };
assert.equal(await chat("k", [], { small: true }), "hint");
assert.deepEqual(bodies.map((b) => b.model), [SMALL]);

// transcribe language param (Korean mode)
globalThis.fetch = async (url, init) => { seen = { url, init }; return ok({ text: "안녕" }); };
assert.equal(await transcribe("k", new Blob(["x"], { type: "audio/mp4" }), "ko"), "안녕");
assert.equal(seen.init.body.get("language"), "ko");

console.log("groq.js: all checks passed");
