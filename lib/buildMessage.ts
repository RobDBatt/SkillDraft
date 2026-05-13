// Builds the user message sent to Anthropic from the wizard answers.
// Handles: multiselect label lookup, "other" free-text, and platform context.

import { getCategoryById, type Category } from "./questions";
import { getPlatformById, type PlatformId } from "./platforms";

export type Answers = Record<string, string | string[]>;

function resolveMultiselectLabels(
  values: string[],
  options: { value: string; label: string }[] | undefined,
  otherText: string | undefined
): string {
  const labels = values
    .filter((v) => v !== "other")
    .map((v) => options?.find((o) => o.value === v)?.label ?? v);

  if (values.includes("other") && otherText?.trim()) {
    labels.push(otherText.trim());
  }

  return labels.join(", ");
}

export function buildUserMessage(
  category: Category,
  platform: PlatformId | null,
  answers: Answers
): string {
  const config = getCategoryById(category);
  if (!config) {
    throw new Error(`Unknown category: ${category}`);
  }

  const lines: string[] = [`Category: ${config.label}`, ""];

  if (platform) {
    const platformConfig = getPlatformById(platform);
    lines.push(`Platform: ${platformConfig?.label ?? platform}`, "");
  }

  lines.push("User answers:");

  for (const question of config.questions) {
    const raw = answers[question.id];
    const isEmpty =
      raw === undefined ||
      raw === "" ||
      (Array.isArray(raw) && raw.length === 0);

    if (isEmpty) {
      if (question.required) {
        throw new Error(`Missing required answer for: ${question.id}`);
      }
      continue;
    }

    lines.push(`\n${question.label}`);

    if (question.type === "multiselect" && Array.isArray(raw)) {
      const otherText =
        typeof answers[question.id + "_other"] === "string"
          ? (answers[question.id + "_other"] as string)
          : undefined;
      lines.push(resolveMultiselectLabels(raw, question.options, otherText));
    } else if (typeof raw === "string") {
      lines.push(raw.trim());
    } else {
      lines.push((raw as string[]).join(", "));
    }
  }

  lines.push(
    "",
    "Generate a production-ready SKILL.md file based on the above. Return only the raw file content — no markdown fences, no explanation."
  );

  const result = lines.join("\n");
  console.log("[buildMessage] assembled:\n", result);
  return result;
}
