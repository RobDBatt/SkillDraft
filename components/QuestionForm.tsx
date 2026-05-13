"use client";

import { useState } from "react";
import type { CategoryConfig, Question } from "@/lib/questions";
import type { Answers } from "@/lib/buildMessage";

interface QuestionFormProps {
  category: CategoryConfig;
  answers: Answers;
  onChange: (id: string, value: string | string[]) => void;
  onSubmit: () => void;
  onBack: () => void;
  error: string | null;
}

// ─── Text input ────────────────────────────────────────────────────────────────

function TextInput({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={question.placeholder}
      className="w-full bg-transparent border border-[#252a2e] text-[#eceef0] text-sm px-4 py-3 rounded-[4px] placeholder:text-[#3a4048] motion-safe:transition-colors focus:outline-none focus:ring-1 focus:ring-[#9ea2a6] focus:border-[#9ea2a6]"
      style={{ fontFamily: "var(--font-sans)" }}
    />
  );
}

// ─── Textarea ─────────────────────────────────────────────────────────────────

function TextareaInput({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={question.placeholder}
      rows={4}
      className="w-full bg-transparent border border-[#252a2e] text-[#eceef0] text-sm px-4 py-3 rounded-[4px] placeholder:text-[#3a4048] motion-safe:transition-colors focus:outline-none focus:ring-1 focus:ring-[#9ea2a6] focus:border-[#9ea2a6] resize-y"
      style={{ fontFamily: "var(--font-sans)" }}
    />
  );
}

// ─── Single-select rows ────────────────────────────────────────────────────────

function SingleSelectRows({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="border-t border-[#1a1d20]">
      {question.options?.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`w-full flex items-center gap-3 py-3 border-b border-[#1a1d20] text-left motion-safe:transition-colors pl-2 focus-visible:outline-none ${
              selected
                ? "text-[#eceef0] border-l-2 border-l-[#e8c87a] -ml-2 pl-[10px] bg-[#0d1014]"
                : "text-[#6e7478] hover:text-[#9ea2a6] hover:bg-[#0a0c0e]"
            }`}
          >
            <span
              className={`w-4 h-4 border rounded-full flex-shrink-0 flex items-center justify-center motion-safe:transition-colors ${
                selected ? "border-[#e8c87a]" : "border-[#2a2e32]"
              }`}
              aria-hidden="true"
            >
              {selected && <span className="w-2 h-2 rounded-full bg-[#e8c87a]" />}
            </span>
            <span className="text-sm" style={{ fontFamily: "var(--font-sans)" }}>
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Multiselect with optional "Other + free text" ────────────────────────────

function MultiSelectInput({
  question,
  values,
  otherText,
  onToggle,
  onOtherTextChange,
}: {
  question: Question;
  values: string[];
  otherText: string;
  onToggle: (v: string) => void;
  onOtherTextChange: (v: string) => void;
}) {
  const hasOther = question.options?.some((o) => o.value === "other");
  const otherChecked = values.includes("other");

  return (
    <div className="border-t border-[#1a1d20]">
      {question.options?.map((opt) => {
        const checked = values.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onToggle(opt.value)}
            className={`w-full flex items-center gap-3 py-3 border-b border-[#1a1d20] text-left motion-safe:transition-colors pl-2 focus-visible:outline-none ${
              checked
                ? "text-[#eceef0] border-l-2 border-l-[#e8c87a] -ml-2 pl-[10px] bg-[#0d1014]"
                : "text-[#6e7478] hover:text-[#9ea2a6] hover:bg-[#0a0c0e]"
            }`}
          >
            <span
              className={`w-4 h-4 border flex-shrink-0 rounded-[2px] flex items-center justify-center motion-safe:transition-colors ${
                checked ? "border-[#e8c87a] bg-[#e8c87a]" : "border-[#2a2e32]"
              }`}
              aria-hidden="true"
            >
              {checked && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
                  <path
                    d="M1 4L3.5 6.5L9 1"
                    stroke="#0a0a0a"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
            <span className="text-sm" style={{ fontFamily: "var(--font-sans)" }}>
              {opt.label}
            </span>
          </button>
        );
      })}

      {hasOther && otherChecked && (
        <div className="py-3 pl-7 border-b border-[#1a1d20]">
          <input
            type="text"
            value={otherText}
            onChange={(e) => onOtherTextChange(e.target.value)}
            placeholder="Describe..."
            autoFocus
            className="w-full bg-transparent border-b border-[#252a2e] text-[#eceef0] text-sm py-1.5 placeholder:text-[#3a4048] motion-safe:transition-colors focus:outline-none focus:border-[#9ea2a6]"
            style={{ fontFamily: "var(--font-sans)" }}
          />
        </div>
      )}
    </div>
  );
}

// ─── Main form ─────────────────────────────────────────────────────────────────

export default function QuestionForm({
  category,
  answers,
  onChange,
  onSubmit,
  onBack,
  error,
}: QuestionFormProps) {
  const [validationError, setValidationError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    for (const q of category.questions) {
      if (!q.required) continue;
      const val = answers[q.id];
      if (
        val === undefined ||
        val === "" ||
        (Array.isArray(val) && val.length === 0)
      ) {
        setValidationError(`"${q.label}" is required.`);
        return;
      }
    }
    setValidationError(null);
    onSubmit();
  }

  const displayedError = validationError ?? error;

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          type="button"
          onClick={onBack}
          className="text-[#4a5056] hover:text-[#9ea2a6] text-xs motion-safe:transition-colors focus-visible:outline-none focus-visible:text-[#9ea2a6]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          ← Back
        </button>
        <span
          className="text-[#e8c87a] text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Step 3 of 5
        </span>
      </div>

      <h1
        className="text-[#eceef0] text-4xl font-black leading-tight mb-2"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {category.label}
      </h1>
      <p
        className="text-[#6e7478] text-sm mb-10"
        style={{ fontFamily: "var(--font-sans)" }}
      >
        {category.description}
      </p>

      {/* Questions */}
      <div className="flex flex-col gap-8">
        {category.questions.map((question) => {
          const rawValue = answers[question.id];
          const otherText =
            typeof answers[question.id + "_other"] === "string"
              ? (answers[question.id + "_other"] as string)
              : "";

          return (
            <div key={question.id}>
              <label
                className="block text-[#9ea2a6] text-[13px] mb-2.5 leading-snug"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                {question.label}
                {!question.required && (
                  <span
                    className="text-[#3a4048] text-[10px] ml-2 uppercase tracking-[0.1em]"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    optional
                  </span>
                )}
              </label>

              {question.type === "text" && (
                <TextInput
                  question={question}
                  value={typeof rawValue === "string" ? rawValue : ""}
                  onChange={(v) => onChange(question.id, v)}
                />
              )}

              {question.type === "textarea" && (
                <TextareaInput
                  question={question}
                  value={typeof rawValue === "string" ? rawValue : ""}
                  onChange={(v) => onChange(question.id, v)}
                />
              )}

              {question.type === "select" && (
                <SingleSelectRows
                  question={question}
                  value={typeof rawValue === "string" ? rawValue : ""}
                  onChange={(v) => onChange(question.id, v)}
                />
              )}

              {question.type === "multiselect" && (
                <MultiSelectInput
                  question={question}
                  values={Array.isArray(rawValue) ? rawValue : []}
                  otherText={otherText}
                  onToggle={(v) => {
                    const current = Array.isArray(rawValue) ? rawValue : [];
                    const next = current.includes(v)
                      ? current.filter((x) => x !== v)
                      : [...current, v];
                    onChange(question.id, next);
                  }}
                  onOtherTextChange={(v) => onChange(question.id + "_other", v)}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Error */}
      {displayedError && (
        <p
          className="text-[#c55] text-sm mt-6"
          style={{ fontFamily: "var(--font-sans)" }}
          role="alert"
        >
          {displayedError}
        </p>
      )}

      {/* Submit */}
      <div className="mt-10">
        <button
          type="submit"
          className="gradient-silver-btn text-sm font-semibold px-6 py-3 rounded-[4px] motion-safe:transition-all motion-safe:duration-200 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9ea2a6] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          Generate my skill →
        </button>
      </div>
    </form>
  );
}
