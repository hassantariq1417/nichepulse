"use client";

import { Search, Bell, ChevronDown, Sparkles } from "lucide-react";

export function TopBar() {
  return (
    <header className="h-16 border-b border-[#1E293B] bg-[#080B10]/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Search */}
      <div className="relative max-w-md flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
        <input
          type="text"
          placeholder="Search niches, channels, topics..."
          className="w-full h-10 pl-10 pr-4 rounded-lg bg-[#1E293B]/50 border border-[#1E293B] text-sm text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#64FFDA]/50 focus:ring-1 focus:ring-[#64FFDA]/20 transition-all duration-200"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center px-1.5 py-0.5 rounded border border-[#1E293B] bg-[#0D1117] text-[10px] text-[#94A3B8] font-mono">
          ⌘K
        </kbd>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 ml-4">
        {/* AI Credits */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#64FFDA]/10 border border-[#64FFDA]/20">
          <Sparkles className="w-3.5 h-3.5 text-[#64FFDA]" />
          <span className="text-xs font-medium text-[#64FFDA]">5 AI credits left</span>
        </div>

        {/* Notifications */}
        <button className="relative w-9 h-9 rounded-lg bg-[#1E293B]/50 flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-[#1E293B] transition-colors duration-200 cursor-pointer">
          <Bell className="w-4 h-4" />
          <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#F472B6]" />
        </button>

        {/* User avatar */}
        <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#1E293B]/50 transition-colors duration-200 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#64FFDA] to-[#F472B6] flex items-center justify-center text-xs font-bold text-[#080B10]">
            HT
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] hidden sm:block" />
        </button>
      </div>
    </header>
  );
}
