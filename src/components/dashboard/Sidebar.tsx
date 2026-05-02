"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Zap,
  LayoutDashboard,
  Search,
  FileText,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Bookmark,
  Bell,
  Database,
  Hash,
} from "lucide-react";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Niche Finder", href: "/dashboard/niches", icon: Search },
  { label: "Channels", href: "/dashboard/channels", icon: TrendingUp },
  { label: "Keywords", href: "/dashboard/keywords", icon: Hash },
  { label: "Content Studio", href: "/dashboard/content", icon: FileText },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Saved", href: "/dashboard/saved", icon: Bookmark },
  { label: "Data Ingest", href: "/dashboard/ingest", icon: Database },
];

const bottomItems = [
  { label: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-40 flex flex-col bg-[#0A0E14] border-r border-[#1E293B] transition-all duration-300 ${
        collapsed ? "w-[68px]" : "w-[240px]"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 h-16 px-4 border-b border-[#1E293B] shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#64FFDA] to-[#64FFDA]/60 flex items-center justify-center shrink-0">
          <Zap className="w-4 h-4 text-[#080B10]" />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold whitespace-nowrap">
            <span className="text-[#64FFDA]">Niche</span>
            <span className="text-white">Pulse</span>
          </span>
        )}
      </div>

      {/* Main nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer group ${
                isActive
                  ? "bg-[#64FFDA]/10 text-[#64FFDA]"
                  : "text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/50"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon
                className={`w-5 h-5 shrink-0 ${
                  isActive ? "text-[#64FFDA]" : "text-[#94A3B8] group-hover:text-white"
                }`}
              />
              {!collapsed && <span>{item.label}</span>}
              {isActive && !collapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#64FFDA]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom nav */}
      <div className="px-2 pb-2 space-y-1 border-t border-[#1E293B] pt-2">
        {bottomItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-200 cursor-pointer ${
                isActive
                  ? "bg-[#64FFDA]/10 text-[#64FFDA]"
                  : "text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/50"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/50 transition-colors duration-200 cursor-pointer w-full"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 shrink-0" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5 shrink-0" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
