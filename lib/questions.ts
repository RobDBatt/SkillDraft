// All category question configs for the SkillDraft generator wizard.
// Each question maps 1:1 to a form field in QuestionForm.tsx.
// Multiselect options with value "other" automatically show a companion free-text field.

export type QuestionType = "text" | "textarea" | "multiselect" | "select";

export interface Option {
  value: string;
  label: string;
}

export interface Question {
  id: string;
  label: string;
  type: QuestionType;
  placeholder?: string;
  required: boolean;
  options?: Option[]; // for select / multiselect
}

export type Category =
  | "development"
  | "frontend-design"
  | "content-writing"
  | "data-integrations"
  | "project-workflows"
  | "custom-other";

export interface CategoryConfig {
  id: Category;
  label: string;
  icon: string;
  description: string;
  questions: Question[];
}

export const categories: CategoryConfig[] = [
  // ── Development ──────────────────────────────────────────────────────────
  {
    id: "development",
    label: "Development",
    icon: "</>",
    description: "Git, code review, testing, refactoring, scaffolding",
    questions: [
      {
        id: "language",
        label: "What's your primary language or framework?",
        type: "multiselect",
        required: true,
        options: [
          { value: "typescript", label: "TypeScript" },
          { value: "javascript", label: "JavaScript" },
          { value: "python", label: "Python" },
          { value: "go", label: "Go" },
          { value: "rust", label: "Rust" },
          { value: "ruby", label: "Ruby" },
          { value: "php", label: "PHP" },
          { value: "java-kotlin", label: "Java / Kotlin" },
          { value: "csharp", label: "C# / .NET" },
          { value: "nextjs", label: "Next.js" },
          { value: "react", label: "React" },
          { value: "vue", label: "Vue" },
          { value: "svelte", label: "Svelte" },
          { value: "fastapi", label: "FastAPI / Django / Flask" },
          { value: "nodejs", label: "Node.js / Express" },
          { value: "other", label: "Other" },
        ],
      },
      {
        id: "tasks",
        label: "What repetitive tasks do you want to automate?",
        type: "multiselect",
        required: true,
        options: [
          { value: "git-commits", label: "Git commits & PR descriptions" },
          { value: "code-review", label: "Code review & feedback" },
          { value: "refactoring", label: "Refactoring & cleanup" },
          { value: "unit-tests", label: "Writing unit tests" },
          { value: "integration-tests", label: "Writing integration / E2E tests" },
          { value: "scaffolding", label: "Scaffolding new files & components" },
          { value: "documentation", label: "Writing documentation" },
          { value: "debugging", label: "Debugging & error analysis" },
          { value: "dependency-audit", label: "Dependency auditing" },
          { value: "security-review", label: "Security review" },
          { value: "performance", label: "Performance optimization" },
          { value: "api-design", label: "API design & documentation" },
          { value: "db-migrations", label: "Database migrations" },
          { value: "other", label: "Other" },
        ],
      },
      {
        id: "conventions",
        label: "Which coding conventions must Claude always follow?",
        type: "multiselect",
        required: false,
        options: [
          { value: "named-exports", label: "Named exports only (no default exports)" },
          { value: "conventional-commits", label: "Conventional Commits format" },
          { value: "no-any", label: "No `any` in TypeScript" },
          { value: "strict-ts", label: "Strict TypeScript mode" },
          { value: "eslint", label: "ESLint rules enforced" },
          { value: "prettier", label: "Prettier formatting" },
          { value: "mobile-first", label: "Mobile-first CSS" },
          { value: "bem", label: "BEM naming" },
          { value: "jsdoc", label: "JSDoc comments on all functions" },
          { value: "readme-update", label: "README update on every change" },
          { value: "changelog", label: "Changelog entries required" },
          { value: "other", label: "Other" },
        ],
      },
      {
        id: "never",
        label: "What should Claude never do in this skill?",
        type: "multiselect",
        required: false,
        options: [
          { value: "modify-tests", label: "Modify test files" },
          { value: "touch-package-json", label: "Touch package.json / package-lock.json" },
          { value: "change-env", label: "Change environment variables" },
          { value: "delete-files", label: "Delete files" },
          { value: "modify-config", label: "Modify config files (eslint, tsconfig, etc.)" },
          { value: "create-outside-folders", label: "Create files outside designated folders" },
          { value: "inline-styles", label: "Use inline styles" },
          { value: "add-deps", label: "Add new dependencies without asking" },
          { value: "commit-main", label: "Commit directly to main branch" },
          { value: "other", label: "Other" },
        ],
      },
      {
        id: "extra",
        label: "Any additional context?",
        type: "textarea",
        placeholder: "Team size, project type, anything else Claude should know",
        required: false,
      },
    ],
  },

  // ── Frontend & Design ─────────────────────────────────────────────────────
  {
    id: "frontend-design",
    label: "Frontend & Design",
    icon: "▢",
    description: "Components, design systems, UI patterns",
    questions: [
      {
        id: "stack",
        label: "What's your UI stack?",
        type: "multiselect",
        required: true,
        options: [
          { value: "react", label: "React" },
          { value: "nextjs", label: "Next.js" },
          { value: "vue", label: "Vue" },
          { value: "svelte", label: "Svelte" },
          { value: "angular", label: "Angular" },
          { value: "astro", label: "Astro" },
          { value: "tailwind", label: "Tailwind CSS" },
          { value: "css-modules", label: "CSS Modules" },
          { value: "styled-components", label: "Styled Components" },
          { value: "sass", label: "Sass / SCSS" },
          { value: "bootstrap", label: "Bootstrap" },
          { value: "material-ui", label: "Material UI" },
          { value: "shadcn", label: "Shadcn/ui" },
          { value: "radix", label: "Radix UI" },
          { value: "framer-motion", label: "Framer Motion" },
          { value: "other", label: "Other" },
        ],
      },
      {
        id: "building",
        label: "What are you building?",
        type: "multiselect",
        required: true,
        options: [
          { value: "components", label: "New UI components" },
          { value: "pages", label: "Full pages & layouts" },
          { value: "landing-pages", label: "Landing pages" },
          { value: "dashboards", label: "Dashboards" },
          { value: "forms", label: "Forms & inputs" },
          { value: "navigation", label: "Navigation & menus" },
          { value: "modals", label: "Modals & overlays" },
          { value: "tables", label: "Data tables" },
          { value: "charts", label: "Charts & visualizations" },
          { value: "tokens", label: "Design system tokens" },
          { value: "responsive", label: "Responsive / mobile fixes" },
          { value: "dark-mode", label: "Dark mode support" },
          { value: "a11y", label: "Accessibility improvements" },
          { value: "animation", label: "Animation & transitions" },
          { value: "other", label: "Other" },
        ],
      },
      {
        id: "design-rules",
        label: "What design rules must Claude always follow?",
        type: "multiselect",
        required: false,
        options: [
          { value: "mobile-first", label: "Mobile-first breakpoints always" },
          { value: "ts-props", label: "TypeScript props interface above every component" },
          { value: "named-exports", label: "Named exports only" },
          { value: "no-inline-styles", label: "No inline styles" },
          { value: "aria", label: "Accessibility attributes (aria-*, role) required" },
          { value: "semantic-html", label: "Semantic HTML (no div soup)" },
          { value: "css-vars", label: "CSS variables for all colors" },
          { value: "spacing-scale", label: "Consistent spacing scale" },
          { value: "hover-focus", label: "Always include hover & focus states" },
          { value: "other", label: "Other" },
        ],
      },
      {
        id: "design-system",
        label: "Brand / design system details",
        type: "textarea",
        placeholder: "Colors, fonts, spacing, component patterns",
        required: false,
      },
      {
        id: "never",
        label: "What should Claude never do?",
        type: "multiselect",
        required: false,
        options: [
          { value: "arbitrary-values", label: "Use arbitrary Tailwind values (no `w-[437px]`)" },
          { value: "important", label: "Use `!important`" },
          { value: "hardcode-colors", label: "Hard-code color values" },
          { value: "one-off-styles", label: "Create non-reusable one-off styles" },
          { value: "ignore-mobile", label: "Ignore mobile breakpoints" },
          { value: "deprecated-html", label: "Use deprecated HTML elements" },
          { value: "other", label: "Other" },
        ],
      },
    ],
  },

  // ── Content & Writing ─────────────────────────────────────────────────────
  {
    id: "content-writing",
    label: "Content & Writing",
    icon: "✎",
    description: "Copywriting, docs, SEO, blog posts",
    questions: [
      {
        id: "content-type",
        label: "What type of content?",
        type: "multiselect",
        required: true,
        options: [
          { value: "blog", label: "Blog posts & articles" },
          { value: "seo", label: "SEO landing pages" },
          { value: "product-copy", label: "Product copy & marketing" },
          { value: "technical-docs", label: "Technical documentation" },
          { value: "api-docs", label: "API documentation" },
          { value: "readme", label: "README files" },
          { value: "email", label: "Email newsletters" },
          { value: "cold-outreach", label: "Cold outreach emails" },
          { value: "linkedin", label: "Social media posts (LinkedIn)" },
          { value: "twitter", label: "Social media posts (X / Twitter)" },
          { value: "youtube", label: "YouTube scripts" },
          { value: "case-studies", label: "Case studies" },
          { value: "press-releases", label: "Press releases" },
          { value: "ux-copy", label: "UX copy & microcopy" },
          { value: "other", label: "Other" },
        ],
      },
      {
        id: "voice",
        label: "What's your voice and tone?",
        type: "multiselect",
        required: true,
        options: [
          { value: "direct", label: "Direct and no-fluff" },
          { value: "conversational", label: "Conversational and approachable" },
          { value: "technical", label: "Technical and precise" },
          { value: "authoritative", label: "Authoritative and expert" },
          { value: "friendly", label: "Friendly and encouraging" },
          { value: "formal", label: "Formal and professional" },
          { value: "witty", label: "Witty and opinionated" },
          { value: "empathetic", label: "Empathetic and human" },
          { value: "other", label: "Other" },
        ],
      },
      {
        id: "structure",
        label: "What structural rules must Claude follow?",
        type: "multiselect",
        required: false,
        options: [
          { value: "h1", label: "Always include an H1" },
          { value: "h2-frequency", label: "H2s every 200–300 words" },
          { value: "tldr", label: "Include a TL;DR or summary at the top" },
          { value: "cta", label: "End with a clear CTA" },
          { value: "faq", label: "Include FAQ section" },
          { value: "bullets-sparingly", label: "Use bullet points sparingly" },
          { value: "short-paragraphs", label: "No more than 3 sentences per paragraph" },
          { value: "internal-links", label: "Include internal links" },
          { value: "meta-desc", label: "Always write a meta description" },
          { value: "alt-text", label: "Add alt text suggestions for images" },
          { value: "other", label: "Other" },
        ],
      },
      {
        id: "avoid",
        label: "What words or patterns to avoid?",
        type: "multiselect",
        required: false,
        options: [
          { value: "seamless", label: '"Seamless"' },
          { value: "powerful", label: '"Powerful"' },
          { value: "robust", label: '"Robust"' },
          { value: "leverage", label: '"Leverage"' },
          { value: "game-changer", label: '"Game-changer"' },
          { value: "best-in-class", label: '"Best-in-class"' },
          { value: "cutting-edge", label: '"Cutting-edge"' },
          { value: "passive-voice", label: "Passive voice" },
          { value: "filler-phrases", label: 'Filler phrases ("In conclusion...", "It\'s worth noting...")' },
          { value: "em-dashes", label: "Em dashes overuse" },
          { value: "other", label: "Other" },
        ],
      },
      {
        id: "extra",
        label: "Any additional style notes?",
        type: "textarea",
        placeholder: "Audience, reading level, SEO targets, anything else",
        required: false,
      },
    ],
  },

  // ── Data & Integrations ───────────────────────────────────────────────────
  {
    id: "data-integrations",
    label: "Data & Integrations",
    icon: "⇄",
    description: "APIs, databases, pipelines, spreadsheets",
    questions: [
      {
        id: "tools",
        label: "What tools or systems are involved?",
        type: "multiselect",
        required: true,
        options: [
          { value: "postgres", label: "PostgreSQL" },
          { value: "mysql", label: "MySQL / MariaDB" },
          { value: "sqlite", label: "SQLite" },
          { value: "mongodb", label: "MongoDB" },
          { value: "redis", label: "Redis" },
          { value: "supabase", label: "Supabase" },
          { value: "firebase", label: "Firebase" },
          { value: "prisma", label: "Prisma ORM" },
          { value: "drizzle", label: "Drizzle ORM" },
          { value: "rest", label: "REST APIs" },
          { value: "graphql", label: "GraphQL" },
          { value: "trpc", label: "tRPC" },
          { value: "sheets", label: "Google Sheets / Excel" },
          { value: "airtable", label: "Airtable" },
          { value: "stripe", label: "Stripe API" },
          { value: "twilio", label: "Twilio" },
          { value: "sendgrid", label: "SendGrid" },
          { value: "s3", label: "AWS S3 / Cloudflare R2" },
          { value: "vercel-edge", label: "Vercel Edge Config" },
          { value: "other", label: "Other" },
        ],
      },
      {
        id: "workflow",
        label: "What's the core workflow type?",
        type: "multiselect",
        required: true,
        options: [
          { value: "fetch-transform-display", label: "Fetch data from API → transform → display" },
          { value: "pull-validate-write", label: "Pull data → validate → write to database" },
          { value: "etl", label: "ETL pipeline (extract, transform, load)" },
          { value: "webhook", label: "Webhook ingestion & processing" },
          { value: "scheduled-sync", label: "Scheduled data sync / cron job" },
          { value: "real-time", label: "Real-time data streaming" },
          { value: "file-upload", label: "File upload & processing" },
          { value: "report-gen", label: "Report generation" },
          { value: "cleanup", label: "Data cleanup & deduplication" },
          { value: "other", label: "Other" },
        ],
      },
      {
        id: "conventions",
        label: "Data format & naming conventions",
        type: "multiselect",
        required: false,
        options: [
          { value: "snake-case", label: "snake_case column names" },
          { value: "camel-case", label: "camelCase field names" },
          { value: "iso-dates", label: "ISO 8601 date format" },
          { value: "utc", label: "UTC timestamps only" },
          { value: "validate-before-write", label: "Always validate before writing" },
          { value: "sanitize-input", label: "Always sanitize user input" },
          { value: "zod", label: "Zod schema validation required" },
          { value: "typed-responses", label: "TypeScript types for all API responses" },
          { value: "other", label: "Other" },
        ],
      },
      {
        id: "error-handling",
        label: "Error handling preferences",
        type: "multiselect",
        required: false,
        options: [
          { value: "log-dont-throw", label: "Log errors, don't throw" },
          { value: "typed-errors", label: "Always return typed error objects" },
          { value: "result-pattern", label: "Use Result/Either pattern" },
          { value: "try-catch", label: "Try/catch every async call" },
          { value: "retry", label: "Retry on network failure (up to 3x)" },
          { value: "alert-critical", label: "Alert on critical failures" },
          { value: "no-raw-errors", label: "Never expose raw errors to client" },
          { value: "other", label: "Other" },
        ],
      },
      {
        id: "extra",
        label: "Any additional context?",
        type: "textarea",
        placeholder: "Data volume, rate limits, security constraints, anything else",
        required: false,
      },
    ],
  },

  // ── Project Workflows ─────────────────────────────────────────────────────
  {
    id: "project-workflows",
    label: "Project Workflows",
    icon: "☰",
    description: "Spec → plan → build cycles, team processes",
    questions: [
      {
        id: "phase",
        label: "What phase(s) of the workflow?",
        type: "multiselect",
        required: true,
        options: [
          { value: "specs", label: "Writing specs & PRDs" },
          { value: "task-breakdown", label: "Breaking work into tasks" },
          { value: "estimating", label: "Estimating complexity" },
          { value: "implementation", label: "Implementation" },
          { value: "code-review", label: "Code review" },
          { value: "testing", label: "Writing tests" },
          { value: "documentation", label: "Documentation" },
          { value: "deployment", label: "Deployment" },
          { value: "post-launch", label: "Post-launch monitoring" },
          { value: "full-cycle", label: "Full cycle (all phases)" },
          { value: "other", label: "Other" },
        ],
      },
      {
        id: "team-size",
        label: "What's your team context?",
        type: "select",
        required: true,
        options: [
          { value: "solo", label: "Solo developer" },
          { value: "small", label: "Small team (2–5 people)" },
          { value: "mid", label: "Mid-size team (6–20 people)" },
          { value: "large", label: "Large / enterprise team (20+)" },
        ],
      },
      {
        id: "process-rules",
        label: "What process rules must Claude respect?",
        type: "multiselect",
        required: false,
        options: [
          { value: "ask-before-create", label: "Always ask before creating new files" },
          { value: "ask-before-delete", label: "Always ask before deleting anything" },
          { value: "tdd", label: "Write tests before implementation (TDD)" },
          { value: "no-merge-without-tests", label: "Never merge without passing tests" },
          { value: "pr-description", label: "PR description required before every merge" },
          { value: "changelog-required", label: "Changelog entry required for every release" },
          { value: "docs-alongside", label: "Always update docs alongside code" },
          { value: "ticket-in-commit", label: "Ticket / issue number required in every commit" },
          { value: "approval-scripts", label: "Requires approval before running scripts" },
          { value: "other", label: "Other" },
        ],
      },
      {
        id: "tools",
        label: "What tools does your team use?",
        type: "multiselect",
        required: false,
        options: [
          { value: "github", label: "GitHub" },
          { value: "gitlab", label: "GitLab" },
          { value: "jira", label: "Jira" },
          { value: "linear", label: "Linear" },
          { value: "notion", label: "Notion" },
          { value: "confluence", label: "Confluence" },
          { value: "slack", label: "Slack" },
          { value: "asana", label: "Asana" },
          { value: "trello", label: "Trello" },
          { value: "figma", label: "Figma" },
          { value: "vercel", label: "Vercel" },
          { value: "other", label: "Other" },
        ],
      },
      {
        id: "done",
        label: 'What does "done" look like?',
        type: "textarea",
        placeholder: 'e.g. "Tests passing, PR description written, docs updated"',
        required: false,
      },
    ],
  },

  // ── Custom / Other ────────────────────────────────────────────────────────
  {
    id: "custom-other",
    label: "Custom / Other",
    icon: "✦",
    description: "Anything that doesn't fit above",
    questions: [
      {
        id: "purpose",
        label: "What should this skill help Claude do?",
        type: "textarea",
        placeholder: "Describe the skill's goal in plain language",
        required: true,
      },
      {
        id: "trigger",
        label: "When should it trigger?",
        type: "textarea",
        placeholder: "What would you type or do that should activate this skill?",
        required: true,
      },
      {
        id: "output-format",
        label: "What output format do you expect?",
        type: "multiselect",
        required: false,
        options: [
          { value: "code-only", label: "Code only" },
          { value: "code-explanation", label: "Code with explanation" },
          { value: "markdown", label: "Markdown document" },
          { value: "list", label: "Structured list" },
          { value: "step-by-step", label: "Step-by-step instructions" },
          { value: "summary-actions", label: "Summary + action items" },
          { value: "json", label: "JSON / structured data" },
          { value: "other", label: "Other" },
        ],
      },
      {
        id: "hard-rules",
        label: "What hard rules apply?",
        type: "multiselect",
        required: false,
        options: [
          { value: "ask-irreversible", label: "Always ask before taking irreversible actions" },
          { value: "no-unmentioned-files", label: "Never modify files I didn't explicitly mention" },
          { value: "explain-first", label: "Always explain what you're about to do first" },
          { value: "no-deps", label: "Never add dependencies without asking" },
          { value: "under-500-words", label: "Keep responses under 500 words" },
          { value: "diff-first", label: "Always show a diff before applying changes" },
          { value: "other", label: "Other" },
        ],
      },
      {
        id: "extra",
        label: "Any additional context?",
        type: "textarea",
        placeholder: "Anything else Claude should know about this skill",
        required: false,
      },
    ],
  },
];

export function getCategoryById(id: Category): CategoryConfig | undefined {
  return categories.find((c) => c.id === id);
}
