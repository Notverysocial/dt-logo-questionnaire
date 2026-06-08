"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  VISUAL_PAIRS,
  PRIMARY_FOR_OPTIONS,
  PRIMARY_TEXT_OPTIONS,
} from "../lib/intake-schema";

type FormState = {
  one_word: string;
  three_adjectives: string;
  primary_for: string[];
  pairs: Record<string, string>;
  reference_urls: string;
  anti_reference_urls: string;
  primary_text: string;
  imagery: string;
  color_preferences: string;
  avoid: string;
  name: string;
  email: string;
  role: string;
  final_thoughts: string;
};

const initialState: FormState = {
  one_word: "",
  three_adjectives: "",
  primary_for: [],
  pairs: {},
  reference_urls: "",
  anti_reference_urls: "",
  primary_text: "",
  imagery: "",
  color_preferences: "",
  avoid: "",
  name: "",
  email: "",
  role: "",
  final_thoughts: "",
};

export default function DTLogoQuestionnairePage() {
  const [state, setState] = useState<FormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setState((s) => ({ ...s, [key]: value }));

  const togglePair = (id: string, choice: string) =>
    setState((s) => ({ ...s, pairs: { ...s.pairs, [id]: choice } }));

  const togglePrimaryFor = (id: string) =>
    setState((s) => {
      const current = s.primary_for;
      if (current.includes(id)) {
        return { ...s, primary_for: current.filter((x) => x !== id) };
      }
      return { ...s, primary_for: [...current, id] };
    });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Required-field validation
    const requiredText: (keyof FormState)[] = [
      "one_word",
      "three_adjectives",
      "reference_urls",
      "primary_text",
      "name",
      "email",
    ];
    for (const k of requiredText) {
      const v = state[k];
      if (typeof v === "string" && v.trim() === "") {
        setError(`Please fill out: ${String(k).replace(/_/g, " ")}`);
        return;
      }
    }
    if (!state.email.includes("@")) {
      setError("Please provide a valid email address.");
      return;
    }
    if (state.primary_for.length === 0) {
      setError("Please pick at least one audience the logo is primarily for.");
      return;
    }
    // All pairs must be answered
    for (const p of VISUAL_PAIRS) {
      if (!state.pairs[p.id]) {
        setError(`Pick one for: ${p.question}`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...state, submitted_at: new Date().toISOString() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || "Something went wrong submitting. Please try again.");
        setSubmitting(false);
        return;
      }
      router.push("/thanks");
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <main className="shell">
      <div className="intro">
        <span className="brand-mark">DRIVEN TALENT</span>
        <h1>Logo Design Questionnaire</h1>
        <p>
          Help us land on the right mark. 5 minutes — gives the designers concrete
          direction so we stop guessing and start finishing. No wrong answers; the
          more specific you are, the better the next round of mockups will be.
        </p>
      </div>

      <form onSubmit={onSubmit} noValidate>
        {/* ===== Section 1 — Identity ===== */}
        <section className="section">
          <span className="eyebrow">01 — About Your Team's Identity</span>
          <h2>Who Driven Talent is, in words</h2>
          <p className="hint">
            Quick gut answers. Don't overthink — first instinct is usually right.
          </p>

          <label className="field-label">
            The ONE word you'd use to describe Driven Talent's energy
          </label>
          <input
            type="text"
            value={state.one_word}
            onChange={(e) => update("one_word", e.target.value)}
            placeholder="e.g. relentless, sharp, reliable, hungry"
          />

          <label className="field-label">
            Three adjectives you want a candidate to feel when they see the logo
          </label>
          <input
            type="text"
            value={state.three_adjectives}
            onChange={(e) => update("three_adjectives", e.target.value)}
            placeholder="e.g. trustworthy, fast, professional"
          />

          <label className="field-label">
            Who is the logo PRIMARILY for? (pick all that apply)
          </label>
          <div className="checkbox-grid">
            {PRIMARY_FOR_OPTIONS.map((opt) => {
              const selected = state.primary_for.includes(opt.id);
              return (
                <label
                  key={opt.id}
                  className={`checkbox-row ${selected ? "selected" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => togglePrimaryFor(opt.id)}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{opt.label}</div>
                    <div style={{ fontSize: 13, color: "var(--color-muted)" }}>
                      {opt.desc}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </section>

        {/* ===== Section 2 — Visual style pairs ===== */}
        <section className="section">
          <span className="eyebrow">02 — Visual Style</span>
          <h2>Pick one from each pair</h2>
          <p className="hint">
            Quick gut reaction. Tap the one closer to where you want the logo to land.
          </p>

          {VISUAL_PAIRS.map((pair) => (
            <div key={pair.id} className="pair-grid">
              <div className="pair-question">{pair.question}</div>
              {(["a", "b"] as const).map((side) => {
                const opt = pair[side];
                const selected = state.pairs[pair.id] === opt.value;
                return (
                  <label
                    key={opt.value}
                    className={`pair-card ${selected ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name={pair.id}
                      checked={selected}
                      onChange={() => togglePair(pair.id, opt.value)}
                    />
                    <div className="label">{opt.label}</div>
                    <div className="desc">{opt.desc}</div>
                  </label>
                );
              })}
            </div>
          ))}
        </section>

        {/* ===== Section 3 — References ===== */}
        <section className="section">
          <span className="eyebrow">03 — References</span>
          <h2>Logos you love + logos you hate</h2>
          <p className="hint">
            Any industry. Specificity here saves us 3 rounds of mockups.
          </p>

          <label className="field-label">
            2-3 logos from ANY industry that feel RIGHT for DT (URL per line + why)
          </label>
          <textarea
            value={state.reference_urls}
            onChange={(e) => update("reference_urls", e.target.value)}
            placeholder={"https://example.com — the wordmark is bold but balanced\nhttps://anothersite.com — love how the symbol works at small sizes"}
            rows={5}
          />

          <label className="field-label">
            1-2 logos that feel WRONG for DT (URL per line + why) — optional
          </label>
          <textarea
            value={state.anti_reference_urls}
            onChange={(e) => update("anti_reference_urls", e.target.value)}
            placeholder={"https://avoidthis.com — too corporate / boring\nhttps://nope.com — feels dated"}
            rows={3}
          />
        </section>

        {/* ===== Section 4 — Specific elements ===== */}
        <section className="section">
          <span className="eyebrow">04 — Specific Elements</span>
          <h2>Concrete preferences</h2>
          <p className="hint">
            The mechanical pieces — what text shows up, what imagery (if any), what colors.
          </p>

          <label className="field-label">
            Is "DT" or "Driven Talent" the primary visible text?
          </label>
          <div className="checkbox-grid">
            {PRIMARY_TEXT_OPTIONS.map((opt) => {
              const selected = state.primary_text === opt.id;
              return (
                <label
                  key={opt.id}
                  className={`checkbox-row ${selected ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="primary_text"
                    checked={selected}
                    onChange={() => update("primary_text", opt.id)}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{opt.label}</div>
                    <div style={{ fontSize: 13, color: "var(--color-muted)" }}>
                      {opt.desc}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>

          <label className="field-label">
            Any specific imagery in mind? (forklift silhouette, road, gear, no imagery — just type, etc.)
          </label>
          <textarea
            value={state.imagery}
            onChange={(e) => update("imagery", e.target.value)}
            placeholder="e.g. simple gear icon, or no imagery — just the wordmark, or a stylized 'D'"
            rows={3}
          />

          <label className="field-label">
            Color preferences beyond black + gold? (optional)
          </label>
          <textarea
            value={state.color_preferences}
            onChange={(e) => update("color_preferences", e.target.value)}
            placeholder="e.g. open to a deep navy accent / stick to black + gold only / a hit of red OK"
            rows={2}
          />

          <label className="field-label">Anything to AVOID? (optional)</label>
          <textarea
            value={state.avoid}
            onChange={(e) => update("avoid", e.target.value)}
            placeholder="e.g. no cliché briefcase icons, no script fonts, no gradient"
            rows={2}
          />
        </section>

        {/* ===== Section 5 — Contact ===== */}
        <section className="section">
          <span className="eyebrow">05 — You</span>
          <h2>Who's filling this out?</h2>
          <p className="hint">
            So we know whose preferences these are when we sit down to compare.
          </p>

          <label className="field-label">Your name</label>
          <input
            type="text"
            value={state.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Full name"
          />

          <label className="field-label">Your email</label>
          <input
            type="email"
            value={state.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="you@drivengroup.com"
          />

          <label className="field-label">Your role at DT</label>
          <input
            type="text"
            value={state.role}
            onChange={(e) => update("role", e.target.value)}
            placeholder="e.g. Recruiter, Ops, Founder"
          />

          <label className="field-label">Any final thoughts? (optional)</label>
          <textarea
            value={state.final_thoughts}
            onChange={(e) => update("final_thoughts", e.target.value)}
            placeholder="Anything we didn't ask that the designers should know"
            rows={3}
          />
        </section>

        {error && <div className="error-banner">{error}</div>}

        <button type="submit" className="submit-btn" disabled={submitting}>
          {submitting ? "Sending…" : "Send My Answers"}
        </button>
      </form>
    </main>
  );
}
