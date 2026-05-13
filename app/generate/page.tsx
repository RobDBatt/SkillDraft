"use client";

import { useState } from "react";
import Link from "next/link";
import { categories, type Category } from "@/lib/questions";
import type { PlatformId } from "@/lib/platforms";
import type { Answers } from "@/lib/buildMessage";
import CategoryCard from "@/components/CategoryCard";
import PlatformSelect from "@/components/PlatformSelect";
import QuestionForm from "@/components/QuestionForm";
import GeneratingState from "@/components/GeneratingState";
import SkillOutput from "@/components/SkillOutput";

type Step = 1 | 2 | 3 | 4 | 5;

// ─── Progress indicator ────────────────────────────────────────────────────────

const STEP_LABELS = ["Category", "Platform", "Questions", "Generating", "Output"];

function ProgressBar({ step }: { step: Step }) {
  return (
    <div className="border-b border-[#1a1d20]">
      <div className="max-w-6xl mx-auto px-6 lg:px-10">
        <div className="flex items-center h-9 gap-1 overflow-x-auto no-scrollbar">
          {STEP_LABELS.map((label, i) => {
            const n = i + 1;
            const active = n === step;
            const done = n < step;
            return (
              <div key={n} className="flex items-center shrink-0">
                <span
                  className={`text-[9px] tracking-[0.14em] tabular-nums whitespace-nowrap transition-colors ${
                    active
                      ? "text-[#eceef0]"
                      : done
                      ? "text-[#6e7478]"
                      : "text-[#3a4048]"
                  }`}
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {String(n).padStart(2, "0")}·{label.toUpperCase()}
                </span>
                {i < STEP_LABELS.length - 1 && (
                  <span
                    className="mx-3 text-[#3a4048] text-[9px]"
                    aria-hidden="true"
                  >
                    /
                  </span>
                )}
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
      {/* Nav */}
      <nav className="border-b border-[#1a1a1a]">
        <div className="max-w-6xl mx-auto px-6 lg:px-10 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="gradient-silver-text text-xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            SkillDraft
          </Link>
          {step > 1 && (
            <button
              onClick={handleStartOver}
              className="text-[#444] hover:text-[#9ea2a6] text-xs transition-colors"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Start over
            </button>
          )}
        </div>
      </nav>

      {/* Progress bar — always visible */}
      <ProgressBar step={step} />

      {/* Main content */}
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
              className="text-[#e8c87a] text-[10px] uppercase tracking-[0.18em] mb-8"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Step 1 of 5 — Choose a category
            </p>
            <h1
              className="text-[#eceef0] text-4xl font-black leading-tight mb-2"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              What are you building?
            </h1>
            <p
              className="text-[#888] text-sm mb-10"
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
