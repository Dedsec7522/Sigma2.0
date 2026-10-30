// Course Advisor engine. Pure and deterministic: it runs in the browser against the
// published course index, and the optional AI layer may only re-rank its output.
import type { CourseIndexEntry, DeliveryMethod, Level } from "./types";

export type TopicId =
  | "lean-six-sigma"
  | "lean"
  | "kaizen"
  | "agile"
  | "data-protection"
  | "data-tools"
  | "project-tools"
  | "process";

export type Goal = "basics" | "projects" | "lead" | "certify" | "tool";
export type Experience = "none" | "some" | "green" | "black";
export type Audience = "me" | "team";
export type Format = DeliveryMethod | "any";
export type Commitment = "short" | "week" | "long";
export type Timing = "soon" | "quarter" | "flexible";

export type Answers = {
  topic?: TopicId;
  tool?: string;
  goal?: Goal;
  experience?: Experience;
  audience?: Audience;
  format?: Format;
  commitment?: Commitment;
  timing?: Timing;
  freeText?: string;
};

export type Option<T extends string> = { value: T; label: string; hint?: string };
export type Question = {
  id: keyof Answers;
  title: string;
  help?: string;
  options: Option<string>[];
};

export const TOPICS: (Option<TopicId> & { match: (c: CourseIndexEntry) => boolean; words: string[] })[] = [
  {
    value: "lean-six-sigma",
    label: "Six Sigma and Lean Six Sigma",
    hint: "Belts from Yellow to Master Black Belt",
    match: (c) => /six-sigma/.test(c.category) && !/dmaic/.test(c.path),
    words: ["six sigma", "lean six sigma", "belt", "yellow", "green", "black", "dmaic", "quality", "defect", "variation", "process improvement", "statistics"],
  },
  {
    value: "lean",
    label: "Lean, 5S and Kanban",
    hint: "Remove waste and improve flow",
    match: (c) => c.category === "lean-training",
    words: ["lean", "waste", "5s", "kanban", "value stream", "flow", "lean it", "manufacturing"],
  },
  {
    value: "kaizen",
    label: "Kaizen and continuous improvement",
    hint: "Build a culture of small, steady gains",
    match: (c) => c.category === "kaizen-training",
    words: ["kaizen", "continuous improvement", "culture", "small improvements"],
  },
  {
    value: "agile",
    label: "Agile, Scrum and project management",
    hint: "Scrum Master, Product Owner, CPAPM",
    match: (c) => /scrum|agile|cpapm/.test(c.path),
    words: ["agile", "scrum", "sprint", "product owner", "project management", "project manager"],
  },
  {
    value: "data-protection",
    label: "GDPR and data protection",
    hint: "Foundation, Practitioner and DPO",
    match: (c) => /gdpr|data-protection/.test(c.path),
    words: ["gdpr", "data protection", "privacy", "dpo", "compliance"],
  },
  {
    value: "data-tools",
    label: "Data, reporting and analysis tools",
    hint: "Excel, SQL, Power BI, Tableau, Minitab",
    match: (c) => /sql|power-bi|tableau|excel|minitab|cognos|crystal/.test(c.path),
    words: ["data", "excel", "sql", "power bi", "tableau", "minitab", "reporting", "dashboard", "analysis", "cognos", "crystal"],
  },
  {
    value: "project-tools",
    label: "Project planning software",
    hint: "Microsoft Project and Primavera P6",
    match: (c) => /microsoft-project|primavera/.test(c.path),
    words: ["microsoft project", "ms project", "primavera", "p6", "scheduling", "planning"],
  },
  {
    value: "process",
    label: "Problem solving, process and resilience",
    hint: "Root cause, DMAIC, BPI, continuity, ArchiMate",
    match: (c) => /root-cause|business-process|continuity|archimate|dmaic/.test(c.path),
    words: ["root cause", "problem solving", "process", "continuity", "resilience", "archimate", "architecture", "dmaic"],
  },
];

const TOOLS: Option<string>[] = [
  { value: "excel", label: "Microsoft Excel" },
  { value: "sql", label: "SQL" },
  { value: "power-bi", label: "Power BI" },
  { value: "tableau", label: "Tableau" },
  { value: "minitab", label: "Minitab" },
  { value: "cognos", label: "Cognos BI" },
  { value: "crystal", label: "Crystal Reports" },
];

const SIX_SIGMA_LIKE: TopicId[] = ["lean-six-sigma", "lean", "kaizen", "data-protection"];

export function nextQuestion(a: Answers, catalogue: CourseIndexEntry[]): Question | null {
  if (!a.topic) {
    return {
      id: "topic",
      title: "What would you like to learn?",
      help: "Choose the closest area. You can also describe what you need in your own words.",
      options: TOPICS.map(({ value, label, hint }) => ({ value, label, hint })),
    };
  }
  if (a.topic === "data-tools" && !a.tool) {
    const available = TOOLS.filter((t) => catalogue.some((c) => c.path.includes(t.value)));
    return {
      id: "tool",
      title: "Which tool do you work with?",
      options: [...available, { value: "any", label: "Not sure yet" }],
    };
  }
  if (!a.goal) {
    const opts: Option<Goal>[] = [
      { value: "basics", label: "Understand the fundamentals", hint: "A solid grounding to apply at work" },
      { value: "projects", label: "Apply it to real projects", hint: "Practical skills I can use straight away" },
      { value: "certify", label: "Gain a recognised certificate", hint: "Training with the exam included" },
    ];
    if (SIX_SIGMA_LIKE.includes(a.topic) || a.topic === "agile") {
      opts.push({ value: "lead", label: "Lead change and coach others", hint: "Run programmes and mentor teams" });
    }
    return { id: "goal", title: "What are you hoping to achieve?", options: opts };
  }
  if (!a.experience) {
    const opts: Option<Experience>[] = [
      { value: "none", label: "I'm new to this" },
      { value: "some", label: "I have some practical experience" },
    ];
    if (a.topic === "lean-six-sigma") {
      opts.push(
        { value: "green", label: "I already hold a Green Belt" },
        { value: "black", label: "I already hold a Black Belt" },
      );
    }
    return { id: "experience", title: "What is your current experience?", options: opts };
  }
  if (!a.audience) {
    return {
      id: "audience",
      title: "Who is the training for?",
      options: [
        { value: "me", label: "Just me" },
        { value: "team", label: "A team or group", hint: "We can deliver any course onsite" },
      ],
    };
  }
  if (!a.format) {
    const pool = topicPool(a, catalogue);
    const has = (m: DeliveryMethod) => pool.some((c) => c.methods.includes(m));
    const opts: Option<Format>[] = [];
    if (has("virtual")) opts.push({ value: "virtual", label: "Live online, instructor-led", hint: "Join from home or the office" });
    if (has("classroom")) opts.push({ value: "classroom", label: "In a classroom near me", hint: "Over 90 UK venues" });
    if (pool.some((c) => c.onlinePath)) opts.push({ value: "online", label: "Self-paced online", hint: "Study in your own time" });
    if (a.audience === "team" || has("onsite")) opts.push({ value: "onsite", label: "Onsite at our workplace", hint: "Ideal for groups" });
    opts.push({ value: "any", label: "No preference" });
    return { id: "format", title: "How would you prefer to learn?", options: opts };
  }
  if (!a.commitment && a.topic === "lean-six-sigma") {
    return {
      id: "commitment",
      title: "How much time can you commit?",
      options: [
        { value: "short", label: "One or two days" },
        { value: "week", label: "Up to a week" },
        { value: "long", label: "Longer is fine", hint: "For in-depth programmes" },
      ],
    };
  }
  if (!a.timing && a.format !== "online" && a.format !== "onsite") {
    return {
      id: "timing",
      title: "When would you like to start?",
      options: [
        { value: "soon", label: "Within the next month" },
        { value: "quarter", label: "In the next three months" },
        { value: "flexible", label: "I'm flexible" },
      ],
    };
  }
  return null;
}

// ---------------------------------------------------------------- free text
export function topicFromText(text: string): { topic?: TopicId; tool?: string } {
  const t = ` ${text.toLowerCase()} `;
  let best: { topic?: TopicId; score: number } = { score: 0 };
  for (const topic of TOPICS) {
    const score = topic.words.reduce((s, w) => s + (t.includes(w) ? w.split(" ").length + 1 : 0), 0);
    if (score > best.score) best = { topic: topic.value, score };
  }
  const tool = TOOLS.find((x) => t.includes(x.label.toLowerCase()) || t.includes(` ${x.value.replace("-", " ")} `))?.value;
  return { topic: tool ? "data-tools" : best.topic, tool };
}

export function experienceFromText(text: string): Experience | undefined {
  const t = text.toLowerCase();
  if (/black belt (certified|holder)|have (a|my) black belt|hold a black belt/.test(t)) return "black";
  if (/green belt (certified|holder)|have (a|my) green belt|hold a green belt/.test(t)) return "green";
  if (/beginner|new to|no experience|never/.test(t)) return "none";
  return undefined;
}

// ---------------------------------------------------------------- scoring
const LEVEL_RANK: Record<Level, number> = { foundation: 0, intermediate: 1, advanced: 2, expert: 3 };

function targetLevel(a: Answers): number {
  const exp = { none: 0, some: 1, green: 2, black: 3 }[a.experience ?? "none"];
  const goal = { basics: 0, tool: 0.5, certify: 1, projects: 1, lead: 2 }[a.goal ?? "basics"];
  if (a.topic === "lean-six-sigma") {
    if (a.experience === "black") return 3;
    if (a.experience === "green") return 2;
    if (a.goal === "lead") return exp >= 1 ? 2 : 1.5;
    if (a.goal === "basics") return 0;
    return exp >= 1 ? 1.4 : 1;
  }
  return Math.min(3, Math.max(0, (exp + goal) / 1.5));
}

function topicPool(a: Answers, catalogue: CourseIndexEntry[]) {
  const topic = TOPICS.find((t) => t.value === a.topic);
  let pool = topic ? catalogue.filter(topic.match) : catalogue;
  if (a.topic === "data-tools" && a.tool && a.tool !== "any") pool = pool.filter((c) => c.path.includes(a.tool!));
  return pool;
}

export type Recommendation = {
  course: CourseIndexEntry;
  score: number;
  reasons: string[];
  /** The page to send the visitor to: the self-paced version when they asked for it. */
  href: string;
  format: Format;
};

/** The soonest scheduled date that hasn't passed (the index is built ahead of time). */
export function nextUpcomingDate(c: Pick<CourseIndexEntry, "upcomingDates" | "nextDate">): string | null {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London" }).format(new Date());
  return (c.upcomingDates ?? (c.nextDate ? [c.nextDate] : [])).find((d) => d >= today) ?? null;
}

const daysUntil = (iso: string) => (new Date(`${iso}T12:00:00Z`).getTime() - Date.now()) / 86_400_000;

export function recommend(a: Answers, catalogue: CourseIndexEntry[]): { primary: Recommendation | null; alternatives: Recommendation[]; candidates: Recommendation[] } {
  const pool = topicPool(a, catalogue);
  const target = targetLevel(a);
  const scored: Recommendation[] = pool.map((c) => {
    const reasons: string[] = [];
    let score = 50;

    const levelGap = Math.abs(LEVEL_RANK[c.level] - target);
    score -= levelGap * 14;
    if (levelGap < 0.75) reasons.push(`${levelLabel(c.level)} level, which matches your experience and goals`);

    const isUpgrade = /upgrade/.test(c.path);
    if (isUpgrade) score += a.experience === "green" && a.goal !== "basics" ? 22 : -30;
    if (isUpgrade && a.experience === "green") reasons.push("Built for existing Green Belts moving up to Black Belt");
    if (a.experience === "black" && !/master/.test(c.path)) score -= 25;
    if (a.experience === "green" && c.level === "foundation") score -= 20;

    // Lean Six Sigma is the site's flagship family; prefer it when the visitor has no stated preference.
    if (a.topic === "lean-six-sigma" && c.category === "lean-six-sigma-training") score += 3;

    if ((a.goal === "certify" || a.goal === "lead") && c.examIncluded) {
      score += 8;
      reasons.push("Exam and certificate included");
    }

    if (a.commitment && c.durationDays) {
      const max = { short: 2, week: 5, long: 99 }[a.commitment];
      if (c.durationDays <= max) {
        score += 6;
      } else {
        score -= Math.min(30, (c.durationDays - max) * 3);
      }
    }

    const format = a.format ?? "any";
    if (format === "online") {
      if (c.onlinePath) {
        score += 12;
        reasons.push("Available as a self-paced online course");
      } else score -= 45; // not offered in the format asked for: never present it as a match
    } else if (format === "classroom" || format === "virtual") {
      if (c.methods.includes(format)) score += 6;
      else score -= 45;
    } else if (format === "onsite" && c.methods.includes("onsite")) {
      score += 4;
      reasons.push("Can be delivered onsite for your team");
    }

    if (a.timing && a.timing !== "flexible" && format !== "online" && format !== "onsite") {
      const horizon = a.timing === "soon" ? 31 : 92;
      const next = nextUpcomingDate(c);
      if (next && daysUntil(next) <= horizon) {
        score += 8;
        reasons.push(`Scheduled dates within your timeframe, from ${shortDate(next)}`);
      } else score -= 6;
    }

    if (a.audience === "team") score += c.methods.includes("onsite") ? 2 : 0;
    if (a.freeText) {
      const t = a.freeText.toLowerCase();
      if (t.includes(c.name.toLowerCase())) score += 15;
      if (/lean six sigma/.test(t) && c.category === "lean-six-sigma-training") score += 6;
      if (/(^|[^n] )six sigma/.test(t) && !/lean six sigma/.test(t) && c.category === "six-sigma-training") score += 6;
    }

    if (c.duration) reasons.push(`${c.duration}${c.methods.length > 1 ? `, with ${c.methods.length} ways to attend` : ""}`);

    const href = format === "online" && c.onlinePath ? c.onlinePath : c.path;
    return { course: c, score, reasons: dedupe(reasons).slice(0, 4), href, format };
  });

  scored.sort((x, y) => y.score - x.score || (x.course.durationDays ?? 99) - (y.course.durationDays ?? 99));
  const viable = scored.filter((r) => r.score >= 20);
  const [primary, ...rest] = viable;
  return { primary: primary ?? null, alternatives: rest.slice(0, 2), candidates: viable.slice(0, 6) };
}

const dedupe = (xs: string[]) => [...new Set(xs)];
const levelLabel = (l: Level) => ({ foundation: "Foundation", intermediate: "Intermediate", advanced: "Advanced", expert: "Expert" })[l];
const shortDate = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", timeZone: "Europe/London" }).format(new Date(`${iso}T12:00:00Z`));

export function describeAnswers(a: Answers): { key: keyof Answers; label: string }[] {
  const out: { key: keyof Answers; label: string }[] = [];
  const topic = TOPICS.find((t) => t.value === a.topic);
  if (topic) out.push({ key: "topic", label: topic.label });
  if (a.tool && a.tool !== "any") out.push({ key: "tool", label: TOOLS.find((t) => t.value === a.tool)?.label ?? a.tool });
  const maps: Partial<Record<keyof Answers, Record<string, string>>> = {
    goal: { basics: "Fundamentals", projects: "Apply to projects", certify: "Get certified", lead: "Lead and coach", tool: "Tool skills" },
    experience: { none: "New to this", some: "Some experience", green: "Green Belt holder", black: "Black Belt holder" },
    audience: { me: "For me", team: "For a team" },
    format: { virtual: "Live online", classroom: "Classroom", online: "Self-paced", onsite: "Onsite", any: "Any format" },
    commitment: { short: "1–2 days", week: "Up to a week", long: "Longer is fine" },
    timing: { soon: "Within a month", quarter: "Within 3 months", flexible: "Flexible start" },
  };
  for (const key of ["goal", "experience", "audience", "format", "commitment", "timing"] as const) {
    const v = a[key];
    if (v && maps[key]?.[v]) out.push({ key, label: maps[key]![v] });
  }
  return out;
}

/** Order in which answers are asked; changing one clears everything after it. */
export const ANSWER_ORDER: (keyof Answers)[] = ["topic", "tool", "goal", "experience", "audience", "format", "commitment", "timing"];
