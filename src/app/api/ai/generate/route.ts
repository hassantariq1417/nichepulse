import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";


// ─── Smart Template Engine (works without any API key) ─────────────────────
// Generates high-quality YouTube content using curated templates + topic injection.
// When a working AI API key is added, it upgrades to full AI generation.

const powerWords = [
  "Proven", "Secret", "Ultimate", "Shocking", "Insane", "Game-Changing",
  "Must-Know", "Life-Changing", "Brutal", "Genius", "Overlooked", "Guaranteed",
  "Untold", "Hidden", "Critical", "Massive", "Explosive", "Powerful",
];

const numbers = ["3", "5", "7", "10", "12", "15", "21", "30"];

const titleTemplates = [
  "I Tried {topic} for 30 Days — Here's What Actually Happened",
  "The {power} Truth About {topic} Nobody Tells You",
  "{number} {topic} Mistakes That Are Costing You Everything",
  "Why 99% of People Fail at {topic} (And How to Fix It)",
  "{topic}: The Complete Beginner's Guide ({year} Edition)",
  "I Wish I Knew This About {topic} Before Starting",
  "{power} {topic} Hacks That Actually Work in {year}",
  "Everything Wrong With {topic} (And What to Do About It)",
  "The REAL Reason You're Not Succeeding at {topic}",
  "{topic} — {number} Lessons I Learned the Hard Way",
  "Watch This Before You Start {topic} in {year}",
  "{topic} Explained in {number} Minutes (No Fluff)",
];

const hookTemplates = [
  `"What if everything you thought you knew about {topic} was completely wrong? I spent the last year testing every strategy out there, and what I found will change how you think about this forever."`,
  `"In the next 8 minutes, I'm going to show you exactly how {topic} works — and why most people never figure this out. Stick around because tip number 3 alone could save you months of wasted effort."`,
  `"Last month, I made a discovery about {topic} that goes against everything the gurus teach. Before you skip this, let me prove it with real data — because the numbers don't lie."`,
  `"Right now, thousands of people are making the same devastating mistake with {topic}. I was one of them until 6 months ago. Here's the moment everything changed."`,
  `"I'm about to share something about {topic} that most creators charge hundreds of dollars for. I almost didn't make this video, but you deserve to know the truth."`,
  `"Stop scrolling. If you've ever struggled with {topic}, this is the most important video you'll watch this year. And I can back that up."`,
];

function capitalize(str: string): string {
  // Smart title case — capitalizes key words, keeps minor words lowercase
  const minor = new Set(["a","an","the","and","but","or","for","in","on","at","to","of","is","it","by","as"]);
  return str
    .split(" ")
    .map((w, i) => {
      if (i === 0 || !minor.has(w.toLowerCase())) {
        return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
      }
      return w.toLowerCase();
    })
    .join(" ");
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateTitles(topic: string): string[] {
  const topicCap = capitalize(topic);
  const year = new Date().getFullYear().toString();
  const used = new Set<number>();
  const results: string[] = [];

  while (results.length < 5 && used.size < titleTemplates.length) {
    const idx = Math.floor(Math.random() * titleTemplates.length);
    if (used.has(idx)) continue;
    used.add(idx);

    const title = titleTemplates[idx]
      .replace("{topic}", topicCap)
      .replace("{power}", pick(powerWords))
      .replace("{number}", pick(numbers))
      .replace("{year}", year);

    results.push(title);
  }

  return results;
}

function generateDescription(topic: string): string[] {
  const topicCap = capitalize(topic);
  const year = new Date().getFullYear();

  return [
    `In this video, I'm breaking down everything you need to know about ${topicCap} in ${year}. Whether you're a complete beginner or looking to level up your skills, this guide covers the essential strategies, common mistakes to avoid, and actionable steps you can start implementing today.

⏱️ Timestamps:
0:00 - Introduction
0:45 - Why ${topicCap} Matters in ${year}
2:30 - The Biggest Mistakes People Make
4:15 - Step-by-Step Strategy Breakdown
7:00 - Real Examples & Case Studies
9:30 - Advanced Tips & Tricks
11:45 - Key Takeaways & Next Steps

📌 Key Points Covered:
• The fundamentals of ${topicCap} explained simply
• 5 common mistakes that hold most people back
• The exact framework I use for consistent results
• Tools and resources to accelerate your progress

🔔 Subscribe for more content on ${topicCap} and related topics!
👍 Like this video if you found it helpful

💬 Drop a comment below: What's your biggest challenge with ${topicCap}?

#${topic.replace(/\s+/g, "")} #${topic.replace(/\s+/g, "").toLowerCase()}tips #${topic.replace(/\s+/g, "").toLowerCase()}${year} #howto #tutorial`,
  ];
}

function generateHooks(topic: string): string[] {
  const topicLower = topic.toLowerCase();
  return shuffle(
    hookTemplates.map((h) => h.replace(/{topic}/g, topicLower))
  ).slice(0, 3);
}

function generateIdeas(topic: string): string[] {
  const topicCap = capitalize(topic);
  return [
    `🔥 "Day in the Life of a ${topicCap} Expert" — Behind-the-scenes format, trending in 2025, high watch time\n   Format: Long-form | Competition: Low | Viral Potential: High`,
    `📈 "I Tried ${topicCap} for 7 Days Straight — Here's My Honest Results" — Challenge format drives engagement\n   Format: Long-form | Competition: Medium | Viral Potential: Very High`,
    `💡 "The Beginner's Complete Guide to ${topicCap} (${new Date().getFullYear()})" — Evergreen, high search volume, authority builder\n   Format: Long-form | Competition: Medium | Viral Potential: Medium`,
    `🎯 "${topicCap} vs. What Everyone Thinks — The REAL Comparison" — Debate/comparison format drives comments\n   Format: Long-form | Competition: Low | Viral Potential: High`,
    `⚡ "5 ${topicCap} Tools That Feel Like Cheating" — List format, extremely high CTR historically\n   Format: Both | Competition: Low | Viral Potential: High`,
    `🚀 "${topicCap} Tier List — Rating Every Strategy from S to F" — Tier list format, highly shareable\n   Format: Long-form | Competition: Low | Viral Potential: Very High`,
  ];
}

function generateTags(topic: string): string[] {
  const slug = topic.toLowerCase().replace(/\s+/g, " ");
  const year = new Date().getFullYear();
  const words = slug.split(" ");

  return [
    `📌 Primary Tags (high-volume, directly relevant):
• ${slug}
• ${slug} tips
• ${slug} tutorial
• ${slug} for beginners
• how to ${slug}

📎 Secondary Tags (medium-volume, related):
• ${slug} guide
• ${slug} strategies
• ${slug} ${year}
• best ${slug} tips
• ${words[0]} advice

🔍 Long-Tail Keywords (lower competition, high intent):
• how to get started with ${slug}
• ${slug} tips for beginners ${year}
• best way to learn ${slug}
• ${slug} mistakes to avoid
• complete ${slug} guide step by step

🔥 Trending Tags:
• ${slug} ${year}
• ${slug} ai tools
• ${slug} trends
• ${slug} masterclass`,
  ];
}

function generateOutline(topic: string): string[] {
  const topicCap = capitalize(topic);

  return [
    `📋 SCRIPT OUTLINE: "The Complete Guide to ${topicCap}"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1️⃣ HOOK (0:00 - 0:30)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   • Pattern interrupt: Start with a bold, counterintuitive claim about ${topicCap}
   • Promise: "By the end of this video, you'll know exactly how to..."
   • Credibility: Brief proof of your expertise or results

2️⃣ THE PROBLEM (0:30 - 2:00)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   • Why most people struggle with ${topicCap}
   • The 3 biggest misconceptions explained
   • Relatable story: "I used to think..."
   • Transition: "But then I discovered..."

3️⃣ THE FRAMEWORK (2:00 - 4:00)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   • Step 1: Foundation — What you need before starting
   • Step 2: Strategy — The core approach that works
   • Step 3: Execution — How to actually implement it
   • Key insight: The one thing that makes the biggest difference

4️⃣ DEEP DIVE (4:00 - 7:00)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   • Point A: [Specific technique] with examples
   • Point B: [Common mistake] and how to avoid it
   • Point C: [Advanced tip] that separates beginners from pros
   • Screen share / B-roll demonstrating the process

5️⃣ PROOF & RESULTS (7:00 - 9:00)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   • Show real results / metrics / screenshots
   • Before vs. after comparison
   • Quick case study or testimonial
   • "And here's the best part..."

6️⃣ CTA & CLOSE (9:00 - 9:30)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   • Recap the key takeaway in one sentence
   • CTA: "If you found this helpful, hit subscribe"
   • Tease next video: "In my next video, I'll show you..."
   • End screen: Related video recommendation

📝 PRODUCTION NOTES:
• Total target length: 9-10 minutes
• Add B-roll every 15-20 seconds
• Use text overlays for key statistics
• Background music: Upbeat but subtle`,
  ];
}

// ─── Main Generator ─────────────────────────────────────────────────────────

const generators: Record<string, (topic: string) => string[]> = {
  title: generateTitles,
  description: generateDescription,
  hooks: generateHooks,
  ideas: generateIdeas,
  tags: generateTags,
  outline: generateOutline,
};

// Optional: Try Gemini if API key is available and working
async function tryGeminiGeneration(type: string, topic: string): Promise<string[] | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompts: Record<string, string> = {
      title: `Generate 5 click-worthy YouTube video titles about: ${topic}. Return ONLY the titles, one per line, numbered 1-5.`,
      description: `Generate a complete YouTube video description about: ${topic}. Include timestamps, hashtags, and a CTA.`,
      hooks: `Generate 3 attention-grabbing YouTube video hooks (first 30 seconds) about: ${topic}. Separate with blank lines.`,
      ideas: `Generate 5 YouTube video ideas about: ${topic}. Include title, format, and competition level for each.`,
      tags: `Generate organized YouTube tags for: ${topic}. Categories: Primary, Secondary, Long-tail, Trending.`,
      outline: `Generate a complete YouTube video script outline about: ${topic}. Include timestamps and talking points.`,
    };

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompts[type] }] }],
      generationConfig: { temperature: 0.8, maxOutputTokens: 2048 },
    });

    const text = result.response.text();
    if (!text || text.length < 20) return null;

    if (type === "title") {
      return text
        .split("\n")
        .map((l) => l.replace(/^\d+[.):\-*]\s*/, "").replace(/^\*\*|\*\*$/g, "").trim())
        .filter((l) => l.length > 5);
    } else if (type === "hooks") {
      return text.split(/\n\s*\n/).map((b) => b.trim()).filter((b) => b.length > 10);
    } else {
      return [text.trim()];
    }
  } catch (e) {
    console.log("Gemini unavailable, using built-in engine:", (e as Error).message);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { type, topic } = await request.json();

    if (!type || !topic) {
      return NextResponse.json({ error: "Missing type or topic" }, { status: 400 });
    }

    const generator = generators[type];
    if (!generator) {
      return NextResponse.json({ error: "Invalid content type" }, { status: 400 });
    }

    // Try AI-powered generation first, fall back to smart templates
    const aiResults = await tryGeminiGeneration(type, topic);
    
    if (aiResults && aiResults.length > 0) {
      return NextResponse.json({ results: aiResults, source: "gemini" });
    }

    // Built-in smart template engine (always works, no API needed)
    const results = generator(topic);
    return NextResponse.json({ results, source: "engine" });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("Generation error:", err.message || error);
    return NextResponse.json(
      { error: err.message || "Failed to generate content" },
      { status: 500 }
    );
  }
}
