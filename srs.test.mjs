// Run: node srs.test.mjs
import assert from "node:assert/strict";
import { addCards, grade, dueCards, parseFeedback, feedbackToCards, formatFeedback, INTERVALS } from "./srs.js";

const DAY = 86_400_000;
const now = 1_000_000;

// addCards: skips blanks and duplicates (case/punctuation-insensitive), keeps input untouched
const base = addCards([], [{ front: "주세요", back: "Can I get a latte?" }], now);
const more = addCards(base, [
  { front: "x", back: "can i get a LATTE" },
  { front: "", back: "y" },
  { front: "감사", back: "Thanks a lot" },
], now);
assert.equal(base.length, 1);
assert.deepEqual(more.map((c) => c.back), ["Can I get a latte?", "Thanks a lot"]);
assert.ok(more.every((c) => c.box === 0 && c.due === now));

// grade: right climbs boxes up to the cap, wrong resets to box 0 (due now)
let c = more[0];
for (let i = 1; i < INTERVALS.length + 2; i++) c = grade(c, true, now);
assert.equal(c.box, INTERVALS.length - 1);
assert.equal(c.due, now + INTERVALS.at(-1) * DAY);
assert.equal(grade(c, false, now).box, 0);
assert.equal(grade(c, false, now).due, now);
assert.equal(more[0].box, 0, "grade must not mutate");

// dueCards
const later = grade(more[0], true, now); // box1 -> due tomorrow
assert.deepEqual(dueCards([later, more[1]], now).map((x) => x.back), ["Thanks a lot"]);
assert.equal(dueCards([later], now + DAY).length, 1);

// parseFeedback: tolerates text around JSON, validates shape, caps counts
const fb = parseFeedback(`Sure!\n{"praise":"좋아요","corrections":[{"mine":"I want Americano one","better":"Can I get one Americano?","why":"수량은 앞에"},{"mine":"","better":"x"}],
 "expressions":[{"en":"For here or to go?","ko":"드시고 가세요?"},{"en":"a","ko":"b"},{"en":"c","ko":"d"},{"en":"e","ko":"f"},{"en":"g","ko":"h"},{"en":"i","ko":"j"}]}\nDone`);
assert.equal(fb.corrections.length, 1);
assert.equal(fb.expressions.length, 5);
assert.equal(parseFeedback("no json here"), null);
assert.equal(parseFeedback("{broken"), null);
assert.equal(parseFeedback('{"corrections":[],"expressions":[]}'), null);

// feedbackToCards + formatFeedback
const cards = feedbackToCards(fb);
assert.equal(cards.length, 6);
assert.deepEqual(cards[0], { front: "🔧 I want Americano one", back: "Can I get one Americano?", note: "수량은 앞에" });
assert.deepEqual(cards[1], { front: "드시고 가세요?", back: "For here or to go?", note: "" });
assert.ok(formatFeedback(fb).includes("→ Can I get one Americano?"));

console.log("srs.js: all checks passed");
