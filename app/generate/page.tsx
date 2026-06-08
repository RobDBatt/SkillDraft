"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { WordMark } from "@/components/WordMark";
import { categories, type Category } from "@/lib/questions";
import type { PlatformId } from "@/lib/platforms";
import type { Answers } from "@/lib/buildMessage";
import CategoryCard from "@/components/CategoryCard";
import PlatformSelect from "@/components/PlatformSelect";
import QuestionForm from "@/components/QuestionForm";
import GeneratingState from "@/components/GeneratingState";
import SkillOutput from "@/components/SkillOutput";
import { supabase } from "@/lib/supabase";

type Step = 1 | 2 | 3 | 4 | 5;

// ─── Progress bar ──────────────────────────────────────────────────────────────

const STEP_LABELS = ["Category", "Platform", "Questions", "Generating", "Output"];

function ProgressBar({ step }: { step: Step }) {
  const progress = ((step - 1) / (STEP_LABELS.length - 1)) * 100;
  return (
    <div className="border-b border-border-dark">
      {/* Continuous amber fill track */}
      <div className="relative h-[2px] bg-border-dark">
        <div
          className="absolute left-0 top-0 h-full bg-amber motion-safe:transition-all motion-safe:duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      {/* Step labels */}
      <div className="max-w-6xl mx-auto px-6 lg:px-10">
        <div className="flex items-center h-8">
          {STEP_LABELS.map((label, i) => {
            const n = i + 1;
            const active = n === step;
            const done = n < step;
            return (
              <div
                key={n}
                className="flex-1 flex justify-center first:justify-start last:justify-end"
              >
                <span
                  className={`text-[9px] tracking-[0.1em] uppercase motion-safe:transition-colors motion-safe:duration-300 ${
                    active
                      ? "text-headline"
                      : done
                      ? "text-silver-faint"
                      : "text-silver-faint/50"
                  }`}
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function GeneratePage() {
  const [step, setStep] = useState<Step>(1);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformId | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [skillContent, setSkillContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const category = categories.find((c) => c.id === selectedCategory);

  // Restore wizard draft on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("skilldraft-draft");
      if (!saved) return;
      const draft = JSON.parse(saved);
      if (draft.selectedCategory) setSelectedCategory(draft.selectedCategory);
      if (draft.selectedPlatform) setSelectedPlatform(draft.selectedPlatform);
      if (draft.answers) setAnswers(draft.answers);
      // Only restore steps 1–3 — never resume a generating or output state
      if (draft.step >= 1 && draft.step <= 3) setStep(draft.step);
    } catch {}
  }, []);

  // Persist draft whenever form state changes
  useEffect(() => {
    if (isGenerating) return;
    try {
      sessionStorage.setItem(
        "skilldraft-draft",
        JSON.stringify({
          selectedCategory,
          selectedPlatform,
          answers,
          step: step <= 3 ? step : 3,
        })
      );
    } catch {}
  }, [selectedCategory, selectedPlatform, answers, step, isGenerating]);

  function handleCategorySelect(id: Category) {
    setSelectedCategory(id);
    setAnswers({});
    setError(null);
    setStep(2);
  }

  function handlePlatformSelect(id: PlatformId) {
    setSelectedPlatform(id);
    setStep(3);
  }

  function handleAnswerChange(id: string, value: string | string[]) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  async function generate() {
    if (isGenerating) return;
    setIsGenerating(true);
    setStep(4);
    setError(null);
    setSkillContent("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (session?.access_token) headers["Authorization"] = `Bearer ${session.access_token}`;

      const res = await fetch("/api/generate", {
        method: "POST",
        headers,
        body: JSON.stringify({
          category: selectedCategory,
          platform: selectedPlatform,
          answers,
        }),
      });
      if (!res.ok) {
        const data: { error?: string; creditsEmpty?: boolean } = await res.json();
        if (data.creditsEmpty) {
          setError("You're out of credits. [Top up on the pricing page](/pricing).");
        } else {
          setError(data.error ?? "Generation failed. Please try again.");
        }
        setStep(3);
        return;
      }
      setStep(5);
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setSkillContent((prev) => prev + decoder.decode(value, { stream: true }));
      }
    } catch {
      setError("Network error. Please try again.");
      setStep(3);
    } finally {
      setIsGenerating(false);
    }
  }

  function handleStartOver() {
    try { sessionStorage.removeItem("skilldraft-draft"); } catch {}
    setStep(1);
    setSelectedCategory(null);
    setSelectedPlatform(null);
    setAnswers({});
    setSkillContent("");
    setError(null);
  }

  return (
    <div className="bg-ink min-h-screen">

      {/* ── Nav — sticky with backdrop blur ──────────────────────────── */}
      <nav
        className="sticky top-0 z-50 border-b border-border-dark backdrop-blur-md"
        style={{ background: "color-mix(in srgb, var(--color-ink) 82%, transparent)" }}
      >
        <div className="max-w-6xl mx-auto px-6 lg:px-10 h-14 flex items-center justify-between">
          <Link href="/" aria-label="SkillDraft home">
            <WordMark />
          </Link>
          {step > 1 && (
            <button
              onClick={handleStartOver}
              className="text-silver-dim hover:text-silver-mid text-xs motion-safe:transition-colors focus-visible:outline-none focus-visible:text-silver-mid"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Start over
            </button>
          )}
        </div>
      </nav>

      {/* ── Progress bar — always visible ────────────────────────────── */}
      <ProgressBar step={step} />

      {/* ── Main content ─────────────────────────────────────────────── */}
      <main
        className={
          step === 5
            ? "max-w-6xl mx-auto px-6 lg:px-10 pt-14 pb-24"
            : "max-w-2xl mx-auto px-6 pt-14 pb-24"
        }
      >
        {step === 1 && (
          <div>
            <p
              className="text-amber text-[10px] font-semibold uppercase tracking-[0.18em] mb-8"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Step 1 of 5 — Choose a category
            </p>
            <h1
              className="text-headline text-4xl font-black leading-tight mb-2"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              What are you building a skill for?
            </h1>
            <p
              className="text-silver-muted text-sm mb-10"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              Pick the closest category. Each has its own question set.
            </p>
            <div className="border-t border-border-dark">
              {categories.map((cat, i) => (
                <CategoryCard
                  key={cat.id}
                  category={cat}
                  index={i + 1}
                  selected={selectedCategory === cat.id}
                  onSelect={handleCategorySelect}
                />
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <PlatformSelect
            selected={selectedPlatform}
            onSelect={handlePlatformSelect}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && category && (
          <QuestionForm
            category={category}
            answers={answers}
            onChange={handleAnswerChange}
            onSubmit={generate}
            onBack={() => setStep(2)}
            error={error}
          />
        )}

        {step === 4 && <GeneratingState />}

        {step === 5 && (
          <SkillOutput
            content={skillContent}
            category={selectedCategory!}
            platform={selectedPlatform}
            onRegenerate={generate}
            onStartOver={handleStartOver}
            isGenerating={isGenerating}
          />
        )}
      </main>
    </div>
  );
}
