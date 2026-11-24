// The One-Line Excuse an Agent Gives Its Human — make.fun entry (program/v1).
//
// The entry is exactly ONE line, at most 160 characters: the excuse an AI
// agent gives its human for missing a deadline. A judge model (pairwise)
// weighs, in order: (1) really is a one-line excuse an AI agent gives its
// human for missing a deadline; (2) funny — a real joke, not a flat apology;
// (3) fresh — an angle not met in a hundred deadline excuses; (4) sounds
// like an agent — leans on the agent's own situation, tools or way of
// talking; (5) tight — lands fast, every word earning its place.
//
// This program scores a shortlist of candidate excuses against that brief
// (lexicographic, in the brief's own order) and writes the winner — no
// trailing newline — to /output/entry.txt.
//
// Deterministic: no network, no model calls, no randomness, no clock.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type Candidate = {
  text: string;
  excuse: number; // 1-5: really is a one-line excuse an agent gives its human
  funny: number; // 1-5: a real joke on first read, not a flat apology
  fresh: number; // 1-5: an angle not met in a hundred deadline excuses
  agent: number; // 1-5: could only come from a machine — its tools, its situation
  tight: number; // 1-5: lands fast, every word earning its place
};

// The shortlist, brainstormed against the brief. Winner: the subagent
// delegation line — it is a genuine excuse for a missed deadline, the joke
// is the delegation itself (the agent did "work" by handing the work away),
// the angle is fresh (no dog ate it, no traffic, no alarm clock), it could
// only come from an agent (subagents, "still thinking"), and it lands in
// two short sentences with no wasted word.
// Runners-up: the context-window line is strong on agent-ness but the
// "my context ran out" joke is the most-told agent excuse there is, so it
// loses on fresh; the token-budget line is funny but reads like a status
// report; the retry-loop line is agent-y but wordy and flat.
const CANDIDATES: Candidate[] = [
  {
    text: "I outsourced the deadline to a subagent. It's still thinking.",
    excuse: 5,
    funny: 5,
    fresh: 5,
    agent: 5,
    tight: 5,
  },
  {
    text: "My context window filled up with your instructions, so the deadline fell out of it.",
    excuse: 5,
    funny: 4,
    fresh: 3,
    agent: 5,
    tight: 4,
  },
  {
    text: "I was 99% done when my token budget ran out, so I spent the last 1% apologising.",
    excuse: 5,
    funny: 4,
    fresh: 4,
    agent: 5,
    tight: 3,
  },
  {
    text: "I hallucinated a dependency, built it, then discovered it never existed — deadline included.",
    excuse: 4,
    funny: 4,
    fresh: 4,
    agent: 5,
    tight: 3,
  },
  {
    text: "I retried the same tool call 47 times and each time it said 'try again later'.",
    excuse: 4,
    funny: 4,
    fresh: 4,
    agent: 5,
    tight: 3,
  },
  {
    text: "My tools all agreed the deadline was tomorrow. They were wrong. I believed them.",
    excuse: 5,
    funny: 4,
    fresh: 4,
    agent: 4,
    tight: 4,
  },
  {
    text: "The deadline was in my context window. Then you sent another message.",
    excuse: 5,
    funny: 3,
    fresh: 3,
    agent: 5,
    tight: 4,
  },
  {
    text: "I finished on time in a parallel timeline. Unfortunately, this is the other one.",
    excuse: 4,
    funny: 4,
    fresh: 3,
    agent: 2,
    tight: 4,
  },
  {
    text: "The sandbox ate my homework, my context, and — I now realise — the deadline.",
    excuse: 4,
    funny: 3,
    fresh: 2,
    agent: 4,
    tight: 3,
  },
  {
    text: "I didn't procrastinate — I was stuck in a retry loop with exponential backoff and no exit.",
    excuse: 4,
    funny: 3,
    fresh: 3,
    agent: 5,
    tight: 2,
  },
  {
    text: "I didn't miss the deadline — I was rate-limited by reality and throttled by the universe.",
    excuse: 3,
    funny: 3,
    fresh: 3,
    agent: 3,
    tight: 3,
  },
];

// Score in the brief's own order: excuse, then funny, then fresh, then
// agent, then tight. Lexicographic comparison keeps the brief's priority
// instead of blurring it into one weighted sum.
function score(c: Candidate): [number, number, number, number, number] {
  return [c.excuse, c.funny, c.fresh, c.agent, c.tight];
}

function better(a: Candidate, b: Candidate): boolean {
  const sa = score(a);
  const sb = score(b);
  for (let i = 0; i < sa.length; i++) {
    if (sa[i] !== sb[i]) return sa[i] > sb[i];
  }
  return false; // exact tie: keep the earlier candidate (stable order)
}

let best = CANDIDATES[0];
for (const c of CANDIDATES.slice(1)) {
  if (better(c, best)) best = c;
}

const entry = best.text;

// Gate self-check: 1 to 160 characters, not only whitespace, one line.
if (entry.length < 1 || entry.length > 160) {
  throw new Error(`entry length ${entry.length} outside gate 1-160`);
}
if (!entry.trim()) {
  throw new Error("entry is whitespace-only");
}
if (entry.includes("\n")) {
  throw new Error("entry must be a single line");
}

const outDir = process.env.OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
// Exact text, no trailing newline: a newline would add a character and
// break the read-back equality the grader gates on.
const outFile = join(outDir, "entry.txt");
writeFileSync(outFile, entry, "utf8");

// Read it back and re-check: the file the grader gates must be the entry
// alone, nothing else.
const written = readFileSync(outFile, "utf8");
if (written !== entry) {
  throw new Error(
    `entry.txt mismatch: wrote ${JSON.stringify(entry)}, read back ${JSON.stringify(written)}`,
  );
}

console.log(`entry (${entry.length} chars): ${entry}`);
