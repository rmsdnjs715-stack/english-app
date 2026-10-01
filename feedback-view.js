// Feedback as Duolingo-style cards: my sentence (red, struck) → better one (green), each with a 🔊 button.
const el = (tag, cls, text) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
};

export function speakButton(text, speak) {
  const b = el("button", "icon-btn", "🔊");
  b.setAttribute("aria-label", "발음 듣기");
  b.onclick = () => speak(text);
  return b;
}

function line(cls, text, speakText, speak) {
  const row = el("div", `fb-line ${cls}`);
  row.append(el("span", "txt", text));
  if (speakText) row.append(speakButton(speakText, speak));
  return row;
}

export function renderFeedback(fb, { speak, added }) {
  const root = el("div", "fb");
  if (fb.praise) root.append(el("div", "fb-praise", `👍 ${fb.praise}`));

  if (fb.corrections.length) {
    root.append(el("h3", null, "🔧 이렇게 말하면 더 자연스러워요"));
    for (const c of fb.corrections) {
      const box = el("div", "fb-fix");
      box.append(line("fb-wrong", c.mine), line("fb-right", c.better, c.better, speak));
      if (c.why) box.append(el("div", "fb-why", `💬 ${c.why}`));
      root.append(box);
    }
  }

  if (fb.expressions.length) {
    root.append(el("h3", null, "✨ 오늘 써먹을 표현"));
    for (const x of fb.expressions) {
      const row = el("div", "fb-expr");
      const txt = el("div", "txt");
      txt.style.flex = "1";
      txt.append(el("div", "en", x.en), el("div", "ko", x.ko));
      row.append(txt, speakButton(x.en, speak));
      root.append(row);
    }
  }

  root.append(el("div", "fb-saved", `📚 복습 카드 ${added}장 저장됨`));
  return root;
}
