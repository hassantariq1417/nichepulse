"use client";

import { useState } from "react";
import {
  FileText,
  Sparkles,
  Copy,
  CheckCircle,
  Video,
  Type,
  AlignLeft,
  Hash,
  Lightbulb,
  Wand2,
  BookOpen,
  RefreshCw,
} from "lucide-react";

const contentTypes = [
  {
    id: "title",
    label: "Video Titles",
    icon: Type,
    description: "Generate click-worthy titles that drive CTR",
    placeholder: "e.g., productivity tips for developers",
  },
  {
    id: "description",
    label: "Descriptions",
    icon: AlignLeft,
    description: "SEO-optimized descriptions with timestamps",
    placeholder: "e.g., morning routine for entrepreneurs",
  },
  {
    id: "hooks",
    label: "Script Hooks",
    icon: Lightbulb,
    description: "Attention-grabbing first 30 seconds",
    placeholder: "e.g., why most people fail at investing",
  },
  {
    id: "ideas",
    label: "Video Ideas",
    icon: Video,
    description: "Trending topic ideas based on niche data",
    placeholder: "e.g., personal finance for gen-z",
  },
  {
    id: "tags",
    label: "Tags & SEO",
    icon: Hash,
    description: "Optimized tags and keyword suggestions",
    placeholder: "e.g., home workout equipment reviews",
  },
  {
    id: "outline",
    label: "Script Outline",
    icon: BookOpen,
    description: "Full video structure with talking points",
    placeholder: "e.g., 10 habits of successful people",
  },
];



export default function ContentStudioPage() {
  const [selectedType, setSelectedType] = useState("title");
  const [topic, setTopic] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setGenerating(true);
    setError("");
    setResults([]);

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: selectedType, topic: topic.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to generate content");
        return;
      }

      setResults(data.results || []);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const currentType = contentTypes.find((t) => t.id === selectedType)!;

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FileText className="w-6 h-6 text-[#818CF8]" />
          Content Studio
        </h1>
        <p className="text-sm text-[#94A3B8] mt-1">
          AI-powered content generation for YouTube creators
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Type selector + Input */}
        <div className="lg:col-span-4 space-y-4">
          {/* Content type cards */}
          <div className="rounded-xl border border-[#1E293B] bg-[#0D1117]/60 p-4 space-y-2">
            <h3 className="text-xs text-[#94A3B8] uppercase tracking-wider mb-3">
              Content Type
            </h3>
            {contentTypes.map((type) => {
              const isActive = selectedType === type.id;
              return (
                <button
                  key={type.id}
                  onClick={() => {
                    setSelectedType(type.id);
                    setResults([]);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-[#818CF8]/10 border border-[#818CF8]/30"
                      : "hover:bg-[#1E293B]/50 border border-transparent"
                  }`}
                >
                  <type.icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? "text-[#818CF8]" : "text-[#94A3B8]"
                    }`}
                  />
                  <div>
                    <div
                      className={`text-sm font-medium ${
                        isActive ? "text-white" : "text-[#94A3B8]"
                      }`}
                    >
                      {type.label}
                    </div>
                    <div className="text-[10px] text-[#94A3B8]">{type.description}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Input area */}
          <div className="rounded-xl border border-[#1E293B] bg-[#0D1117]/60 p-4 space-y-3">
            <h3 className="text-xs text-[#94A3B8] uppercase tracking-wider">
              Your Topic
            </h3>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={currentType.placeholder}
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg bg-[#1E293B]/50 border border-[#1E293B] text-sm text-white placeholder-[#94A3B8] resize-none focus:outline-none focus:border-[#818CF8]/50 focus:ring-1 focus:ring-[#818CF8]/20 transition-all duration-200"
            />
            <button
              onClick={handleGenerate}
              disabled={generating || !topic.trim()}
              className="w-full h-10 rounded-lg bg-gradient-to-r from-[#818CF8] to-[#64FFDA] text-[#080B10] text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-opacity duration-200"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Generate {currentType.label}
                </>
              )}
            </button>
            {error && (
              <div className="px-3 py-2 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20 text-xs text-[#EF4444]">
                {error}
              </div>
            )}
            <p className="text-[10px] text-[#94A3B8] text-center">
              Powered by Gemini AI
            </p>
          </div>
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-8">
          {results.length === 0 && !generating ? (
            <div className="rounded-xl border border-[#1E293B] bg-[#0D1117]/60 flex flex-col items-center justify-center min-h-[400px] text-center px-8">
              <div className="w-16 h-16 rounded-2xl bg-[#818CF8]/10 flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-[#818CF8]" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Ready to Create
              </h3>
              <p className="text-sm text-[#94A3B8] max-w-sm">
                Select a content type, enter your topic, and let AI generate
                high-performing content optimized for YouTube.
              </p>
            </div>
          ) : generating ? (
            <div className="rounded-xl border border-[#1E293B] bg-[#0D1117]/60 flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-12 h-12 rounded-xl bg-[#818CF8]/10 flex items-center justify-center mb-4 animate-pulse">
                <Wand2 className="w-6 h-6 text-[#818CF8]" />
              </div>
              <p className="text-sm text-[#94A3B8]">Generating your content...</p>
              <div className="flex gap-1 mt-3">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-[#818CF8] animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-[#94A3B8]">
                  {results.length} result{results.length !== 1 ? "s" : ""} generated
                </h3>
                <button
                  onClick={handleGenerate}
                  className="inline-flex items-center gap-1.5 text-xs text-[#818CF8] hover:text-[#818CF8]/80 cursor-pointer transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  Regenerate
                </button>
              </div>
              {results.map((result, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-[#1E293B] bg-[#0D1117]/60 p-5 hover:border-[#818CF8]/20 transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <pre className="text-sm text-white whitespace-pre-wrap font-sans leading-relaxed flex-1">
                      {result}
                    </pre>
                    <button
                      onClick={() => handleCopy(result, i)}
                      className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-[#1E293B] transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                    >
                      {copiedIndex === i ? (
                        <CheckCircle className="w-4 h-4 text-[#34D399]" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
