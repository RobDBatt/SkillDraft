"use client";

import { useState } from "react";
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

type Step = 1 | 2 | 3 | 4 | 5;

// ─── Progress bar ──────────────────────────────────────────────────────────────

const STEP_LABELS = ["Category", "Platform", "Questions", "Generating", "Output"];

function ProgressBar({ step }: { step: Step }) {
  const progress = ((step - 1) / (STEP_LABELS.length - 1)) * 100;
  return (
    <div className="border-b border-[#1a1d20]">
      {/* Continuous amber fill track */}
      <div className="relative h-[2px] bg-[#141618]">
        <div
          className="absolute left-0 top-0 h-full bg-[#e8c87a] motion-safe:transition-all motion-safe:duration-500"
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
                      ? "text-[#eceef0]"
                      : done
                      ? "text-[#3a4048]"
                      : "text-[#1e2226]"
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

  const category = categories.find((c) => c.id === selectedCategory);

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
    setStep(4);
    setError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: selectedCategory,
          platform: selectedPlatform,
          answers,
        }),
      });
      const data: { skill?: string; error?: string } = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Generation failed. Please try again.");
        setStep(3);
        return;
      }
      setSkillContent(data.skill ?? "");
      setStep(5);
    } catch {
      setError("Network error. Please try again.");
      setStep(3);
    }
  }

  function handleStartOver() {
    setStep(1);
    setSelectedCategory(null);
    setSelectedPlatform(null);
    setAnswers({});
    setSkillContent("");
    setError(null);
  }

  return (
    <div className="bg-[#0a0a0a] min-h-screen">

      {/* ── Nav — sticky with backdrop blur ──────────────────────────── */}
      <nav
        className="sticky top-0 z-50 border-b border-[#1a1d20] backdrop-blur-md"
        style={{ background: "rgba(10,10,10,0.82)" }}
      >
        <div className="max-w-6xl mx-auto px-6 lg:px-10 h-14 flex items-center justify-between">
          <Link href="/" aria-label="SkillDraft home">
            <WordMark />
          </Link>
          {step > 1 && (
            <button
              onClick={handleStartOver}
              className="text-[#4a5056] hover:text-[#9ea2a6] text-xs motion-safe:transition-colors focus-visible:outline-none focus-visible:text-[#9ea2a6]"
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
              className="text-[#e8c87a] text-[10px] font-semibold uppercase tracking-[0.18em] mb-8"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Step 1 of 5 — Choose a category
            </p>
            <h1
              className="text-[#eceef0] text-4xl font-black leading-tight mb-2"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              What are you building a skill for?
            </h1>
            <p
              className="text-[#6e7478] text-sm mb-10"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              Pick the closest category. Each has its own question set.
            </p>
            <div className="border-t border-[#1a1d20]">
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
          />
        )}
      </main>
    </div>
  );
}
