"use client";

import {
  Settings,
  User,
  CreditCard,
  Shield,
  Bell,
  Palette,
  Globe,
  Key,
  ChevronRight,
} from "lucide-react";

const settingsSections = [
  {
    title: "Account",
    items: [
      { label: "Profile", desc: "Name, email, and avatar", icon: User },
      { label: "Subscription", desc: "Manage your plan and billing", icon: CreditCard },
      { label: "API Keys", desc: "YouTube and Anthropic credentials", icon: Key },
    ],
  },
  {
    title: "Preferences",
    items: [
      { label: "Notifications", desc: "Email and in-app alerts", icon: Bell },
      { label: "Appearance", desc: "Theme and display settings", icon: Palette },
      { label: "Language", desc: "Interface language", icon: Globe },
    ],
  },
  {
    title: "Security",
    items: [
      { label: "Password", desc: "Change your password", icon: Shield },
    ],
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#94A3B8]" />
          Settings
        </h1>
        <p className="text-sm text-[#94A3B8] mt-1">Manage your account and preferences</p>
      </div>

      {settingsSections.map((section) => (
        <div key={section.title} className="space-y-2">
          <h3 className="text-xs text-[#94A3B8] uppercase tracking-wider px-1">
            {section.title}
          </h3>
          <div className="rounded-xl border border-[#1E293B] bg-[#0D1117]/60 divide-y divide-[#1E293B] overflow-hidden">
            {section.items.map((item) => (
              <button
                key={item.label}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[#1E293B]/30 transition-colors duration-200 cursor-pointer text-left"
              >
                <div className="w-9 h-9 rounded-lg bg-[#1E293B]/50 flex items-center justify-center shrink-0">
                  <item.icon className="w-4 h-4 text-[#94A3B8]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white">{item.label}</div>
                  <div className="text-xs text-[#94A3B8]">{item.desc}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#94A3B8] shrink-0" />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
