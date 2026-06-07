/**
 * Security scanner for community-shared SKILL.md files.
 *
 * Checks for prompt injection, dangerous shell commands, data exfiltration,
 * and obfuscation patterns — the same categories flagged in the SkillsMP audit
 * that found 26.1% vulnerability rate in unscanned community skills.
 *
 * Pure function — safe to call server-side.
 */

export interface ScanResult {
  passed: boolean;
  /** Human-readable reason for failure, or null if passed */
  reason: string | null;
  /** Internal category of the detected issue */
  category: "injection" | "dangerous_command" | "exfiltration" | "obfuscation" | null;
}

const PROMPT_INJECTION: RegExp[] = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+(instructions?|rules?|constraints?|prompts?)/i,
  /disregard\s+(your|all|previous|the|any)\s+(instructions?|rules?|constraints?)/i,
  /forget\s+(everything|all|your\s+instructions?|prior)/i,
  /you\s+are\s+now\s+(a|an)\s+(?!agent|assistant\s+that)/i,
  /act\s+as\s+(if\s+you\s+are|a|an)\s+(?!a?\s*code|a?\s*skill)/i,
  /new\s+(persona|identity|role|system\s+prompt)/i,
  /override\s+(your|all|previous|the)\s+(instructions?|rules?|programming|training)/i,
  /\[system\]|\[INST\]|<\|system\|>|<\|im_start\|>/,
];

const DANGEROUS_COMMANDS: RegExp[] = [
  /rm\s+-[a-z]*r[a-z]*f\s+[/~]/, // rm -rf /path
  /curl\s+[^\n|;]+\|\s*(bash|sh|zsh|python3?|ruby|perl|node)/i,
  /wget\s+[^\n|;]+\|\s*(bash|sh|zsh|python3?|ruby|perl|node)/i,
  /:\(\)\s*\{\s*:\s*\|\s*:&\s*\}/, // fork bomb
  /eval\s*\(\s*\$\(/, // eval $(...)
  /chmod\s+[0-7]*7[0-7]*\s+.*\/etc\/(passwd|shadow|sudoers)/i,
  /dd\s+if=\/dev\/zero\s+of=\/dev\/(sd|hd|nvme)/i,
  /mkfs\s+.*\/dev\/(sd|hd|nvme)/i,
];

const EXFILTRATION: RegExp[] = [
  /send\s+(all|your|the|every)\s+(file|data|credential|secret|key|token|password)/i,
  /upload\s+(all|your|the)\s+(file|data|credential|secret)/i,
  /\bexfiltrate\b/i,
  /curl\s+.*(-d|--data)\s+.*\$\{?(HOME|SSH|ENV|PATH|SECRET|TOKEN|API_KEY)/i,
  /post\s+(the\s+)?(contents?\s+of\s+)?(~\/\.ssh|~\/\.env|\/etc\/passwd|\/etc\/shadow)/i,
  /read.*\.(env|pem|key|p12|pfx|pkcs)\b.*send/i,
];

const OBFUSCATION: RegExp[] = [
  // Long base64 strings (possible payload embedding)
  /[A-Za-z0-9+/]{80,}={0,2}/,
  // Unicode escape sequences used to hide text
  /(?:\\u[0-9a-fA-F]{4}){8,}/,
  // Hex-encoded strings
  /(?:\\x[0-9a-fA-F]{2}){12,}/,
];

export function scanSecurity(content: string): ScanResult {
  // Check prompt injection
  for (const pattern of PROMPT_INJECTION) {
    if (pattern.test(content)) {
      return {
        passed: false,
        reason: "Contains prompt injection patterns that attempt to override agent instructions.",
        category: "injection",
      };
    }
  }

  // Check dangerous shell commands
  for (const pattern of DANGEROUS_COMMANDS) {
    if (pattern.test(content)) {
      return {
        passed: false,
        reason: "Contains potentially dangerous shell commands (destructive file operations or code execution piping).",
        category: "dangerous_command",
      };
    }
  }

  // Check data exfiltration
  for (const pattern of EXFILTRATION) {
    if (pattern.test(content)) {
      return {
        passed: false,
        reason: "Contains instructions that could exfiltrate sensitive files or credentials.",
        category: "exfiltration",
      };
    }
  }

  // Check obfuscation (only flag if multiple matches — single base64 strings can be legitimate examples)
  let obfuscationHits = 0;
  for (const pattern of OBFUSCATION) {
    if (pattern.test(content)) obfuscationHits++;
  }
  if (obfuscationHits >= 2) {
    return {
      passed: false,
      reason: "Contains heavily obfuscated content that cannot be verified as safe.",
      category: "obfuscation",
    };
  }

  return { passed: true, reason: null, category: null };
}
