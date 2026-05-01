"use client";

import { Bell, CheckCircle, TrendingUp, Flame, Sparkles } from "lucide-react";

const notifications = [
  {
    id: 1,
    type: "outlier",
    icon: Flame,
    color: "#F472B6",
    title: "New outlier detected",
    desc: 'Channel "Shadow Files" in True Crime niche is showing unusual growth patterns.',
    time: "2 hours ago",
    read: false,
  },
  {
    id: 2,
    type: "trending",
    icon: TrendingUp,
    color: "#34D399",
    title: "Niche trending alert",
    desc: "AI Tools & Automation niche has moved from Stable to Rising trend direction.",
    time: "5 hours ago",
    read: false,
  },
  {
    id: 3,
    type: "ai",
    icon: Sparkles,
    color: "#818CF8",
    title: "AI recommendation ready",
    desc: "New niche recommendations based on your saved preferences are available.",
    time: "1 day ago",
    read: true,
  },
  {
    id: 4,
    type: "system",
    icon: CheckCircle,
    color: "#64FFDA",
    title: "Data refresh complete",
    desc: "All 210 channels have been re-analyzed with updated metrics.",
    time: "2 days ago",
    read: true,
  },
];

export default function NotificationsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-[#818CF8]" />
            Notifications
          </h1>
          <p className="text-sm text-[#94A3B8] mt-1">Stay updated on your niche intelligence</p>
        </div>
        <button className="text-xs text-[#64FFDA] hover:text-[#64FFDA]/80 cursor-pointer transition-colors">
          Mark all as read
        </button>
      </div>

      <div className="rounded-xl border border-[#1E293B] bg-[#0D1117]/60 divide-y divide-[#1E293B] overflow-hidden">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`flex items-start gap-4 px-5 py-4 transition-colors duration-200 cursor-pointer hover:bg-[#1E293B]/20 ${
              !notif.read ? "bg-[#1E293B]/10" : ""
            }`}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
              style={{ backgroundColor: `${notif.color}15` }}
            >
              <notif.icon className="w-4 h-4" style={{ color: notif.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white">{notif.title}</span>
                {!notif.read && (
                  <div className="w-2 h-2 rounded-full bg-[#64FFDA] shrink-0" />
                )}
              </div>
              <p className="text-xs text-[#94A3B8] mt-0.5 leading-relaxed">{notif.desc}</p>
              <span className="text-[10px] text-[#94A3B8] mt-1 inline-block">{notif.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
