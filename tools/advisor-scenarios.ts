// Scenario checks for the Course Advisor engine against the built course index.
// Run with:  node tools/advisor-scenarios.ts http://localhost:3100
import { recommend, topicFromText, type Answers } from "../sixsigma-web/src/lib/advisor.ts";

const base = process.argv[2] ?? "http://localhost:3100";
const index = await (await fetch(`${base}/course-index.json`)).json();
const paths = new Set(index.map((c: { path: string }) => c.path));

type Case = { name: string; answers: Answers; expect: RegExp | null };
const cases: Case[] = [
  { name: "New learner wants certification, live online", answers: { topic: "lean-six-sigma", goal: "certify", experience: "none", audience: "me", format: "virtual", commitment: "week", timing: "quarter" }, expect: /green-belt|yellow-belt|six-sigma-qualification/ },
  { name: "Wants only the fundamentals, short", answers: { topic: "lean-six-sigma", goal: "basics", experience: "none", audience: "me", format: "any", commitment: "short", timing: "flexible" }, expect: /yellow-belt|six-sigma-qualification/ },
  { name: "Green Belt holder wants to lead", answers: { topic: "lean-six-sigma", goal: "lead", experience: "green", audience: "me", format: "any", commitment: "week", timing: "flexible" }, expect: /black-belt-upgrade/ },
  { name: "Black Belt holder", answers: { topic: "lean-six-sigma", goal: "lead", experience: "black", audience: "me", format: "any", commitment: "long", timing: "flexible" }, expect: /master-black-belt/ },
  { name: "Power BI user", answers: { topic: "data-tools", tool: "power-bi", goal: "projects", experience: "some", audience: "me", format: "any", timing: "flexible" }, expect: /power-bi/ },
  { name: "GDPR basics for a team", answers: { topic: "data-protection", goal: "basics", experience: "none", audience: "team", format: "onsite" }, expect: /gdpr.*foundation$/ },
  { name: "Self-paced Six Sigma basics links to the online course", answers: { topic: "lean-six-sigma", goal: "basics", experience: "none", audience: "me", format: "online", commitment: "short" }, expect: /yellow-belt/ },
  { name: "Tableau, self-paced (not offered) gives no fake match", answers: { topic: "data-tools", tool: "tableau", goal: "projects", experience: "some", audience: "me", format: "online" }, expect: null },
];

let failed = 0;
for (const c of cases) {
  const r = recommend(c.answers, index);
  const got = r.primary?.course.path ?? null;
  const ok = c.expect === null ? got === null : Boolean(got && c.expect.test(got) && paths.has(got));
  const onlineOk = c.answers.format !== "online" || !r.primary || r.primary.href.startsWith("/online-course/");
  if (!ok || !onlineOk) failed++;
  console.log(`${ok && onlineOk ? "PASS" : "FAIL"}  ${c.name}\n      -> ${got ?? "no suitable course"}${r.primary ? ` (href ${r.primary.href}; alts: ${r.alternatives.map((a) => a.course.name).join(", ") || "none"})` : ""}`);
}

const text = topicFromText("I want to become a scrum master");
console.log(`${text.topic === "agile" ? "PASS" : "FAIL"}  Free text "scrum master" -> topic ${text.topic}`);
if (text.topic !== "agile") failed++;
const all = index.every((c: { path: string }) => paths.has(c.path));
console.log(`${all ? "PASS" : "FAIL"}  every index entry is a real catalogue path (${index.length} courses)`);
process.exit(failed ? 1 : 0);
