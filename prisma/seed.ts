import { PrismaClient, ChannelFormat, CompetitionLevel, TrendDirection } from "@prisma/client";

const prisma = new PrismaClient();

// ─── Niche Categories ──────────────────────────────────────────────────
const niches = [
  { name: "Finance & Investing", slug: "finance", description: "Personal finance, stock market analysis, crypto, and wealth building strategies", competitionLevel: "HIGH" as CompetitionLevel, trendDirection: "UP" as TrendDirection, estimatedCPM: 18.5, iconEmoji: "💰" },
  { name: "AI Tools & Tech", slug: "ai-tools", description: "AI software reviews, tutorials, prompt engineering, and emerging tech", competitionLevel: "MEDIUM" as CompetitionLevel, trendDirection: "UP" as TrendDirection, estimatedCPM: 14.2, iconEmoji: "🤖" },
  { name: "Stoicism & Philosophy", slug: "stoicism", description: "Ancient wisdom, Marcus Aurelius, Seneca, and modern stoic practices", competitionLevel: "LOW" as CompetitionLevel, trendDirection: "UP" as TrendDirection, estimatedCPM: 8.7, iconEmoji: "🏛️" },
  { name: "True Crime", slug: "true-crime", description: "Unsolved mysteries, cold cases, criminal psychology, and forensic analysis", competitionLevel: "HIGH" as CompetitionLevel, trendDirection: "STABLE" as TrendDirection, estimatedCPM: 11.3, iconEmoji: "🔍" },
  { name: "Dark History", slug: "dark-history", description: "Untold historical events, fallen empires, and forgotten civilizations", competitionLevel: "LOW" as CompetitionLevel, trendDirection: "UP" as TrendDirection, estimatedCPM: 9.8, iconEmoji: "📜" },
  { name: "Fitness & Health", slug: "fitness", description: "Workout routines, nutrition science, body transformation, and biohacking", competitionLevel: "HIGH" as CompetitionLevel, trendDirection: "STABLE" as TrendDirection, estimatedCPM: 12.1, iconEmoji: "💪" },
  { name: "Productivity Systems", slug: "productivity", description: "Time management, second brain, Notion setups, and deep work strategies", competitionLevel: "MEDIUM" as CompetitionLevel, trendDirection: "STABLE" as TrendDirection, estimatedCPM: 10.5, iconEmoji: "⚡" },
  { name: "Luxury Lifestyle", slug: "luxury", description: "Luxury cars, watches, mansions, private jets, and high-end living", competitionLevel: "MEDIUM" as CompetitionLevel, trendDirection: "STABLE" as TrendDirection, estimatedCPM: 15.8, iconEmoji: "👑" },
  { name: "Mindset & Motivation", slug: "mindset", description: "Growth mindset, discipline, morning routines, and success psychology", competitionLevel: "HIGH" as CompetitionLevel, trendDirection: "DOWN" as TrendDirection, estimatedCPM: 7.4, iconEmoji: "🧠" },
  { name: "Self Improvement", slug: "self-improvement", description: "Habits, social skills, confidence building, and personal development", competitionLevel: "HIGH" as CompetitionLevel, trendDirection: "STABLE" as TrendDirection, estimatedCPM: 9.2, iconEmoji: "📈" },
  { name: "Business & Startups", slug: "business", description: "Entrepreneurship, side hustles, e-commerce, and business case studies", competitionLevel: "HIGH" as CompetitionLevel, trendDirection: "UP" as TrendDirection, estimatedCPM: 16.7, iconEmoji: "🚀" },
  { name: "Real Estate", slug: "real-estate", description: "Property investing, house flipping, rental income, and market analysis", competitionLevel: "MEDIUM" as CompetitionLevel, trendDirection: "UP" as TrendDirection, estimatedCPM: 19.3, iconEmoji: "🏠" },
  { name: "Coding & Dev", slug: "coding", description: "Programming tutorials, web development, system design, and tech careers", competitionLevel: "MEDIUM" as CompetitionLevel, trendDirection: "UP" as TrendDirection, estimatedCPM: 13.6, iconEmoji: "💻" },
  { name: "Language Learning", slug: "languages", description: "Polyglot tips, language hacks, immersion techniques, and fluency strategies", competitionLevel: "LOW" as CompetitionLevel, trendDirection: "STABLE" as TrendDirection, estimatedCPM: 7.9, iconEmoji: "🌍" },
  { name: "Travel Hacks", slug: "travel-hacks", description: "Budget travel, points hacking, hidden destinations, and digital nomad life", competitionLevel: "MEDIUM" as CompetitionLevel, trendDirection: "UP" as TrendDirection, estimatedCPM: 11.8, iconEmoji: "✈️" },
];

// ─── Channel Name Templates ────────────────────────────────────────────
const channelPrefixes: Record<string, string[]> = {
  "finance": ["WealthMind", "Cash Flow Pro", "Stock Pulse", "Money Matrix", "Bull Market", "Alpha Gains", "Dividend King", "Profit Signal", "Capital Edge", "Market Scout", "Penny Sage", "Crypto Cipher", "Fiscal Fox", "Budget Beast"],
  "ai-tools": ["AI Explained", "Prompt Labs", "Neural Notes", "Tech Forge", "Bot Builder", "Code & AI", "Deep Dive AI", "Silicon Mind", "Future Proof", "AI Insider", "Machine Mind", "Algo Arts", "Smart Stack", "Data Dynamo"],
  "stoicism": ["Stoic Wisdom", "Marcus Mind", "Calm Logic", "Inner Citadel", "Seneca Says", "Virtue Path", "Logos Life", "Memento Mori", "Still Mind", "Ancient Edge", "Aurelian", "Epictetus Lab", "Praxis Daily"],
  "true-crime": ["Cold Case Files", "Crime Decoded", "Murder Map", "Forensic Focus", "Dark Dossier", "Case Cracker", "Evidence Room", "Crime Pulse", "Shadow Files", "Unsolved HQ", "Serial Scanner", "Case Cold", "Truth Seeker"],
  "dark-history": ["Forgotten Past", "History Noir", "Dark Ages", "Empire Falls", "Hidden Chronicles", "Time Shadows", "Lost Empires", "History Untold", "Ancient Doom", "Epoch Dark", "Relic Hunter", "Chronicle Noir", "Past Secrets"],
  "fitness": ["Iron Science", "Gains Lab", "Body Forge", "Flex Academy", "Muscle Mind", "Peak Form", "Lift Logic", "Rep Counter", "Fit Protocol", "Bio Hack", "Shred Science", "Core Theory", "Power Phase"],
  "productivity": ["Deep Work Hub", "System Zero", "Flow State", "Notion Nerd", "Task Master", "Focus Fire", "Time Craft", "Output Pro", "Brain OS", "Clarity Code", "Daily Driver", "Zen Desk", "Plan Genius"],
  "luxury": ["Lux Living", "Elite Daily", "Gold Standard", "Prestige", "Crown Vision", "Opulence", "Fine Lines", "Platinum Edge", "High Society", "Velvet Life", "Grand Tour", "Rich Reels", "Diamond Eye"],
  "mindset": ["Mind Shift", "Rise Daily", "Grit Talk", "Level Up Mind", "Alpha Mindset", "Inner Game", "Motive Force", "Wake Up Call", "Mental Edge", "Fire Within", "Bold Mind", "Drive Daily", "Peak State"],
  "self-improvement": ["Better You", "Growth Hacker", "Life Upgrade", "Max Potential", "Evolve Daily", "Self Mastery", "Level Path", "Skill Stack", "Progress Pro", "Daily Edge", "Habit Hero", "Life Labs", "Rise Up"],
  "business": ["Startup Grind", "Hustle Smart", "Biz Decoded", "Founder Files", "Scale Up", "Revenue Lab", "Side Project", "Launch Pad", "Venture Mind", "Profit Play", "Biz Brain", "CEO Secrets", "Growth Engine"],
  "real-estate": ["Property Pulse", "Flip Master", "Rental Empire", "Deal Finder", "REI School", "Estate Edge", "Cash Flow Estate", "Brick & Mortar", "Home Hack", "Landlord Lab", "Market Mover", "Key Capital", "Door Knock"],
  "coding": ["Code with Chris", "Dev Decoded", "Build & Ship", "Stack Overflow", "Full Stack", "Code Mentor", "Dev Journey", "Byte Size", "Clean Code", "Ship It", "Debug Daily", "Syntax FM", "Code Craft"],
  "languages": ["Polyglot Path", "Fluent Fast", "Word World", "Lingua Lab", "Speak Easy", "Talk Native", "Grammar Guru", "Immerse Now", "Accent Lab", "Daily Dose", "Lang Hack", "Rosetta Mind", "Native Flow"],
  "travel-hacks": ["Nomad Notes", "Points Pro", "Wander Wise", "Cheap Flights", "Pack Light", "Globe Hack", "Travel Intel", "Budget Globe", "Mile Master", "Trip Trick", "Jet Savvy", "Route Less", "Explore More"],
};

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals = 1): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateChannelData(nicheName: string, nicheSlug: string, idx: number) {
  const names = channelPrefixes[nicheSlug] || channelPrefixes["finance"];
  const name = names[idx % names.length] + (idx >= names.length ? ` ${Math.floor(idx / names.length) + 1}` : "");
  const subs = randomInt(5000, 2500000);
  const views = BigInt(randomInt(500000, 500000000));
  const videoCount = randomInt(30, 800);
  const format = pick([ChannelFormat.LONG_FORM, ChannelFormat.SHORT_FORM, ChannelFormat.BOTH]);
  const growthRate7d = randomFloat(-2, 15);
  const growthRate30d = randomFloat(-5, 45);
  const viewsLast48h = randomInt(Math.floor(subs * 0.01), Math.floor(subs * 0.3));
  const uploadFreq = randomFloat(0.5, 7, 1);
  const nicheScore = randomFloat(15, 98, 1);
  const monthlyViews = randomInt(50000, 10000000);
  const isOutlier = nicheScore > 80 && Math.random() > 0.6;
  const isTrending = growthRate30d > 20 && Math.random() > 0.5;
  const countries = ["US", "UK", "CA", "AU", "IN", "DE", "BR", "PH", "NG", "ZA", null];

  return {
    youtubeId: `UC${nicheSlug.replace("-", "")}${String(idx).padStart(4, "0")}${randomInt(1000, 9999)}`,
    title: name,
    description: `${name} creates content about ${nicheName.toLowerCase()}. Join for weekly uploads covering the latest trends, strategies, and insights.`,
    thumbnailUrl: `https://picsum.photos/seed/${nicheSlug}${idx}/176/176`,
    subscriberCount: subs,
    viewCount: views,
    videoCount,
    category: nicheName,
    format,
    estimatedMonthlyRevenue: parseFloat(((monthlyViews / 1000) * randomFloat(5, 20)).toFixed(2)),
    nicheScore,
    growthRate7d,
    growthRate30d,
    viewsLast48h,
    uploadFrequency: uploadFreq,
    isOutlier,
    isTrending,
    country: pick(countries),
    channelAge: randomInt(3, 84),
    lastScrapedAt: new Date(),
  };
}

function generateVideoData(channelId: string, channelTitle: string, videoIdx: number) {
  const hooks = [
    "I Tried This for 30 Days...",
    "Nobody Is Talking About This",
    "The Hidden Truth Behind",
    "Why Everyone Is Wrong About",
    "I Spent $10,000 Testing",
    "The Algorithm Doesn't Want You to See This",
    "This Changed Everything I Know About",
    "How I Made $50K with",
    "Stop Doing This Immediately",
    "The #1 Mistake Everyone Makes with",
    "What They Don't Teach You About",
    "I Analyzed 1000 Channels and Found",
    "The Secret Strategy Behind",
    "You're Losing Money Because of",
    "This Simple Trick Will Transform Your",
  ];
  const topics = [
    "passive income", "content creation", "viral videos", "audience growth",
    "monetization", "personal branding", "social media", "online business",
    "investing strategies", "AI automation", "market trends", "career growth",
    "productivity hacks", "financial freedom", "side hustles",
  ];
  const title = `${pick(hooks)} ${pick(topics)}`;
  const views = randomInt(5000, 5000000);
  const publishedDaysAgo = randomInt(1, 180);
  const hoursAge = publishedDaysAgo * 24;
  const isViral = views > 500000 && Math.random() > 0.5;

  return {
    youtubeVideoId: `vid_${channelId.slice(-6)}_${videoIdx}_${randomInt(10000, 99999)}`,
    title,
    viewCount: views,
    likeCount: Math.floor(views * randomFloat(0.02, 0.08)),
    commentCount: Math.floor(views * randomFloat(0.002, 0.01)),
    publishedAt: new Date(Date.now() - publishedDaysAgo * 86400000),
    isViral,
    viewsPerHour: parseFloat((views / hoursAge).toFixed(2)),
    thumbnail: `https://picsum.photos/seed/vid${channelId.slice(-4)}${videoIdx}/320/180`,
  };
}

async function main() {
  console.log("🌱 Seeding NichePulse database...\n");

  // Clear existing data
  await prisma.videoInsight.deleteMany();
  await prisma.userSavedNiche.deleteMany();
  await prisma.channel.deleteMany();
  await prisma.nicheCategory.deleteMany();
  await prisma.user.deleteMany();

  console.log("✅ Cleared existing data\n");

  // Create niches
  const createdNiches = [];
  for (const niche of niches) {
    const created = await prisma.nicheCategory.create({ data: niche });
    createdNiches.push(created);
    console.log(`  📂 Created niche: ${niche.iconEmoji} ${niche.name}`);
  }
  console.log(`\n✅ Created ${createdNiches.length} niche categories\n`);

  // Create channels — ~13-14 per niche = ~200 total
  const channelsPerNiche = Math.ceil(200 / niches.length);
  let totalChannels = 0;
  let totalVideos = 0;

  for (const niche of createdNiches) {
    for (let i = 0; i < channelsPerNiche; i++) {
      const channelData = generateChannelData(niche.name, niche.slug, i);
      const channel = await prisma.channel.create({
        data: {
          ...channelData,
          nicheCategoryId: niche.id,
        },
      });
      totalChannels++;

      // Create 5 videos per channel
      for (let v = 0; v < 5; v++) {
        await prisma.videoInsight.create({
          data: {
            channelId: channel.id,
            ...generateVideoData(channel.id, channel.title, v),
          },
        });
        totalVideos++;
      }
    }
    console.log(`  📺 Created ${channelsPerNiche} channels for ${niche.iconEmoji} ${niche.name}`);
  }

  // Update niche stats
  for (const niche of createdNiches) {
    const channels = await prisma.channel.findMany({
      where: { nicheCategoryId: niche.id },
      select: { nicheScore: true },
    });
    const avgScore = channels.reduce((sum, c) => sum + c.nicheScore, 0) / channels.length;
    await prisma.nicheCategory.update({
      where: { id: niche.id },
      data: {
        averageNicheScore: parseFloat(avgScore.toFixed(1)),
        channelCount: channels.length,
      },
    });
  }

  console.log(`\n═══════════════════════════════════════`);
  console.log(`  ✅ Seeding complete!`);
  console.log(`  📂 ${createdNiches.length} niche categories`);
  console.log(`  📺 ${totalChannels} channels`);
  console.log(`  🎬 ${totalVideos} video insights`);
  console.log(`═══════════════════════════════════════\n`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seeding failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
