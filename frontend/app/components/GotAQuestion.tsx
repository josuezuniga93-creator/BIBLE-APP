"use client";
import { useState, useEffect } from "react";
import { useLanguage } from "../lib/useLanguage";
import { QAItem, SEED_QA } from "../data/questions";

const LS_KEY = "tulip_qa";

function loadQA(): QAItem[] {
  if (typeof window === "undefined") return SEED_QA;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return SEED_QA;
    const parsed: QAItem[] = JSON.parse(raw);
    // Merge seed if not already there
    const ids = new Set(parsed.map(q => q.id));
    const merged = [...SEED_QA.filter(s => !ids.has(s.id)), ...parsed];
    return merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch { return SEED_QA; }
}

function saveQA(items: QAItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_KEY, JSON.stringify(items));
}

export default function GotAQuestion() {
  const { lang } = useLanguage();
  const [qa, setQa] = useState<QAItem[]>([]);
  const [question, setQuestion] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [fullAnswer, setFullAnswer] = useState<QAItem | null>(null);
  const [showPast, setShowPast] = useState(false);

  useEffect(() => { setQa(loadQA()); }, []);

  const answered = qa.filter(q => q.answered);
  const latest = answered[0] ?? null;
  const past = answered.slice(1);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;
    const newItem: QAItem = {
      id: `q-${Date.now()}`,
      question: question.trim(),
      answer: "",
      answerFull: "",
      date: new Date().toISOString(),
      answered: false,
    };
    const updated = [newItem, ...qa];
    setQa(updated);
    saveQA(updated);
    setQuestion("");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  }

  return (
    <section className="mt-8 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[15px] font-bold" style={{ color: "var(--color-text, #fff)" }}>
          {lang === "es" ? "¿Tienes una pregunta?" : "Got a Question?"}
        </h3>
        <span className="text-[11px]" style={{ color: "rgba(201,169,97,0.7)" }}>
          {lang === "es" ? "Teología bíblica" : "Biblical theology"}
        </span>
      </div>

      {/* Submit form */}
      <div className="rounded-2xl p-4 mb-4" style={{ background: "rgba(201,169,97,0.06)", border: "1px solid rgba(201,169,97,0.15)" }}>
        <p className="text-[11px] mb-3 leading-snug" style={{ color: "rgba(255,255,255,0.5)" }}>
          {lang === "es"
            ? "¿Tienes una pregunta sobre la Biblia o la doctrina reformada? Envíala y la responderemos."
            : "Have a question about Scripture or Reformed doctrine? Submit it and we'll answer it."}
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <textarea
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder={lang === "es" ? "Escribe tu pregunta aquí..." : "Type your question here..."}
            rows={3}
            className="w-full rounded-xl px-3 py-2.5 text-[13px] resize-none"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(201,169,97,0.2)",
              color: "#fff",
              outline: "none",
              fontSize: "16px",
            }}
          />
          <button
            type="submit"
            className="rounded-xl py-2.5 text-[13px] font-bold"
            style={{ background: "rgba(201,169,97,1)", color: "#08090f" }}
          >
            {submitted
              ? (lang === "es" ? "¡Enviado!" : "Submitted!")
              : (lang === "es" ? "Enviar pregunta" : "Submit Question")}
          </button>
        </form>
      </div>

      {/* Latest answered question */}
      {latest && (
        <div className="rounded-2xl p-4 mb-3" style={{ background: "rgba(201,169,97,0.05)", border: "1px solid rgba(201,169,97,0.12)" }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "rgba(201,169,97,0.65)" }}>
              {lang === "es" ? "• Última respuesta" : "• Latest Answer"}
            </span>
          </div>
          <p className="text-[13px] font-semibold text-white mb-2 leading-snug">
            {lang === "es" && latest.questionEs ? latest.questionEs : latest.question}
          </p>
          <p className="text-[12px] leading-relaxed mb-3" style={{ color: "rgba(255,255,255,0.6)" }}>
            {lang === "es" && latest.answerEs ? latest.answerEs : latest.answer}
          </p>
          <button
            onClick={() => setFullAnswer(latest)}
            className="text-[12px] font-semibold"
            style={{ color: "rgba(201,169,97,1)" }}
          >
            {lang === "es" ? "Ver respuesta completa →" : "View Full Answer →"}
          </button>
        </div>
      )}

      {/* Past Q&A toggle */}
      {past.length > 0 && (
        <div>
          <button
            onClick={() => setShowPast(s => !s)}
            className="text-[12px] mb-2"
            style={{ color: "rgba(201,169,97,0.7)" }}
          >
            {showPast
              ? (lang === "es" ? "Ocultar preguntas anteriores ↑" : "Hide past questions ↑")
              : (lang === "es" ? `Ver ${past.length} pregunta${past.length > 1 ? "s" : ""} anterior${past.length > 1 ? "es" : ""} ↓` : `View ${past.length} past question${past.length > 1 ? "s" : ""} ↓`)}
          </button>
          {showPast && (
            <div className="flex flex-col gap-2">
              {past.map(item => (
                <button
                  key={item.id}
                  onClick={() => setFullAnswer(item)}
                  className="text-left rounded-xl p-3"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(201,169,97,0.08)" }}
                >
                  <p className="text-[12px] text-white leading-snug">
                    {lang === "es" && item.questionEs ? item.questionEs : item.question}
                  </p>
                  <p className="text-[10px] mt-1" style={{ color: "rgba(201,169,97,0.6)" }}>
                    {lang === "es" ? "Ver respuesta →" : "View answer →"}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Full-screen answer modal */}
      {fullAnswer && (
        <div
          className="fixed inset-0 z-50 flex flex-col"
          style={{ background: "var(--bg, #0f0f0f)", overflowY: "auto" }}
        >
          {/* Modal header */}
          <div className="flex items-center justify-between px-5 pt-12 pb-4" style={{ borderBottom: "1px solid rgba(201,169,97,0.12)" }}>
            <span className="text-[13px] font-bold" style={{ color: "rgba(201,169,97,1)" }}>
              {lang === "es" ? "Respuesta completa" : "Full Answer"}
            </span>
            <button
              onClick={() => setFullAnswer(null)}
              className="text-[22px] font-light"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              ×
            </button>
          </div>

          {/* Modal content */}
          <div className="px-5 py-6 flex-1">
            <p className="text-[16px] font-bold text-white mb-6 leading-snug">
              {lang === "es" && fullAnswer.questionEs ? fullAnswer.questionEs : fullAnswer.question}
            </p>
            <div className="text-[14px] leading-relaxed whitespace-pre-line" style={{ color: "rgba(255,255,255,0.75)" }}>
              {lang === "es" && fullAnswer.answerFullEs ? fullAnswer.answerFullEs : fullAnswer.answerFull}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
