// Shared mic + hold-to-talk button. One mic stream for the whole app; release it when leaving a screen.
let stream = null;

export async function getMic() {
  if (!stream) stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  return stream;
}

export function releaseMic() {
  stream?.getTracks().forEach((t) => t.stop());
  stream = null;
}

const pickMime = () =>
  ["audio/mp4", "audio/webm;codecs=opus", "audio/webm"].find((m) => MediaRecorder.isTypeSupported(m)) ?? "";

// Press = record, release = stop and hand over the audio. onError gets "mic" | "short".
export function holdToRecord(button, { canStart = () => true, onStart = () => {}, onBlob, onError }) {
  const idle = button.textContent;
  let rec = null;
  let pressed = false;

  button.addEventListener("pointerdown", async (e) => {
    e.preventDefault();
    if (rec || !canStart()) return;
    pressed = true;
    let s;
    try {
      s = await getMic();
    } catch {
      pressed = false;
      return onError("mic");
    }
    if (!pressed) return; // released before the mic was ready
    onStart();
    const chunks = [];
    const mime = pickMime();
    rec = new MediaRecorder(s, mime ? { mimeType: mime } : undefined);
    rec.ondataavailable = (ev) => ev.data.size && chunks.push(ev.data);
    rec.onstop = () => {
      const blob = new Blob(chunks, { type: rec.mimeType || "audio/mp4" });
      rec = null;
      button.classList.remove("rec");
      button.textContent = idle;
      if (blob.size < 2000) return onError("short");
      onBlob(blob);
    };
    rec.start();
    button.classList.add("rec");
    button.textContent = "🔴 듣는 중… 놓으면 전송";
  });

  const stop = (e) => {
    e.preventDefault();
    pressed = false;
    if (rec?.state === "recording") rec.stop();
  };
  button.addEventListener("pointerup", stop);
  button.addEventListener("pointercancel", stop);
  button.addEventListener("contextmenu", (e) => e.preventDefault());
}
