import { addCards, grade, dueCards } from "./srs.js";

const $ = (id) => document.getElementById(id);
const KEY = "cards";

export function loadCards() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
function saveCards(cards) {
  try { localStorage.setItem(KEY, JSON.stringify(cards)); } catch { /* storage full/blocked */ }
}

// Returns how many new cards were actually added (duplicates skipped).
export function saveNewCards(items) {
  const before = loadCards();
  const after = addCards(before, items, Date.now());
  saveCards(after);
  return after.length - before.length;
}

export const dueCount = () => dueCards(loadCards(), Date.now()).length;

// One review session over the cards due now. Wrong cards come back once at the end.
export function openReview({ speak, onClose }) {
  let queue = dueCards(loadCards(), Date.now()).map((c) => c.id);
  const retried = new Set();
  let done = 0;

  const close = () => {
    $("review").classList.add("hidden");
    onClose();
  };

  function show() {
    const cards = loadCards();
    const card = cards.find((c) => c.id === queue[0]);
    $("rvProgress").textContent = `${done} 완료 · 남은 카드 ${queue.length}`;
    $("rvBack").classList.add("hidden");
    $("rvGrade").classList.add("hidden");
    $("rvReveal").classList.toggle("hidden", !card);
    if (!card) {
      $("rvFront").textContent = done ? "🎉 오늘 복습 끝!" : "지금 복습할 카드가 없어요.\n대화 후 '끝내고 피드백'을 누르면 카드가 쌓여요.";
      return;
    }
    $("rvFront").textContent = card.front;
    $("rvBackText").textContent = card.back;
    $("rvNote").textContent = card.note;
    $("rvReveal").onclick = () => {
      $("rvReveal").classList.add("hidden");
      $("rvBack").classList.remove("hidden");
      $("rvGrade").classList.remove("hidden");
      speak(card.back);
    };
    $("rvSpeak").onclick = () => speak(card.back);
    $("rvKnew").onclick = () => answer(cards, card, true);
    $("rvMissed").onclick = () => answer(cards, card, false);
  }

  function answer(cards, card, knew) {
    saveCards(cards.map((c) => (c.id === card.id ? grade(c, knew, Date.now()) : c)));
    const rest = queue.slice(1);
    const retry = !knew && !retried.has(card.id);
    if (retry) retried.add(card.id);
    queue = retry ? [...rest, card.id] : rest;
    done += 1;
    show();
  }

  $("rvClose").onclick = close;
  $("review").classList.remove("hidden");
  show();
}
