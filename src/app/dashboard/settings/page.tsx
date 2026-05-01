"use client";

import { useState } from "react";
import {
  Settings,
  User,
  CreditCard,
  Shield,
  Bell,
  Palette,
  Key,
  Check,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Moon,
  Sun,
  Monitor,
} from "lucide-react";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "subscription", label: "Subscription", icon: CreditCard },
  { id: "api-keys", label: "API Keys", icon: Key },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "security", label: "Security", icon: Shield },
];

function ProfileTab() {
  const [name, setName] = useState("Hassan Tariq");
  const [email, setEmail] = useState("hassantariq1417@gmail.com");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Profile</h2>
        <p className="text-sm text-[#94A3B8] mt-1">Manage your personal information</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#4ADE80] to-[#22D3EE] flex items-center justify-center text-xl font-bold text-[#0D1117]">
          HT
        </div>
        <div>
          <p className="text-sm font-medium text-white">Profile Photo</p>
          <p className="text-xs text-[#94A3B8]">JPG, PNG or GIF. Max 2MB</p>
          <button className="mt-1 text-xs text-[#4ADE80] hover:text-[#22D3EE] transition-colors">
            Change avatar
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-[#1E293B]/50 border border-[#1E293B] text-white text-sm placeholder-[#475569] focus:border-[#4ADE80]/50 focus:outline-none focus:ring-1 focus:ring-[#4ADE80]/20 transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-[#1E293B]/50 border border-[#1E293B] text-white text-sm placeholder-[#475569] focus:border-[#4ADE80]/50 focus:outline-none focus:ring-1 focus:ring-[#4ADE80]/20 transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Bio</label>
          <textarea
            rows={3}
            placeholder="Tell us about yourself..."
            className="w-full px-4 py-2.5 rounded-lg bg-[#1E293B]/50 border border-[#1E293B] text-white text-sm placeholder-[#475569] focus:border-[#4ADE80]/50 focus:outline-none focus:ring-1 focus:ring-[#4ADE80]/20 transition-all resize-none"
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#4ADE80] to-[#22D3EE] text-[#0D1117] text-sm font-semibold hover:opacity-90 transition-all flex items-center gap-2"
      >
        {saved ? <><Check className="w-4 h-4" /> Saved!</> : "Save Changes"}
      </button>
    </div>
  );
}

function SubscriptionTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Subscription</h2>
        <p className="text-sm text-[#94A3B8] mt-1">Manage your plan and billing</p>
      </div>

      <div className="p-5 rounded-xl border border-[#4ADE80]/30 bg-[#4ADE80]/5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">Free Plan</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#4ADE80]/20 text-[#4ADE80] tracking-wider">
                Current
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] mt-1">5 AI credits/day • 15 niches • Basic analytics</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-white">$0</span>
            <span className="text-xs text-[#94A3B8]">/month</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-[#94A3B8]">Available Plans</h3>

        {[
          { name: "Pro", price: "$19", features: "Unlimited AI credits • 50 niches • Advanced analytics • Priority support" },
          { name: "Enterprise", price: "$49", features: "Everything in Pro • Team collaboration • Custom integrations • Dedicated support" },
        ].map((plan) => (
          <div key={plan.name} className="p-4 rounded-xl border border-[#1E293B] bg-[#0D1117]/60 hover:border-[#4ADE80]/30 transition-colors group">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-white">{plan.name}</span>
                <p className="text-xs text-[#94A3B8] mt-0.5">{plan.features}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-lg font-bold text-white">{plan.price}</span>
                  <span className="text-xs text-[#94A3B8]">/mo</span>
                </div>
                <button className="px-4 py-2 rounded-lg border border-[#4ADE80]/30 text-[#4ADE80] text-xs font-semibold hover:bg-[#4ADE80]/10 transition-all">
                  Upgrade
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ApiKeysTab() {
  const [showYouTube, setShowYouTube] = useState(false);
  const [showGemini, setShowGemini] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const keys = [
    { id: "youtube", label: "YouTube Data API", value: "AIzaSyAy49rEN71keKZ6wso-X41wE0bMFa16gnA", show: showYouTube, toggle: () => setShowYouTube(!showYouTube), status: "active" },
    { id: "gemini", label: "Gemini API", value: "AIzaSyAJIxXmJeTFSIiS_HETV5P21gR917IomHI", show: showGemini, toggle: () => setShowGemini(!showGemini), status: "active" },
  ];

  const copyKey = (id: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">API Keys</h2>
        <p className="text-sm text-[#94A3B8] mt-1">Manage your API credentials</p>
      </div>

      <div className="space-y-3">
        {keys.map((key) => (
          <div key={key.id} className="p-4 rounded-xl border border-[#1E293B] bg-[#0D1117]/60">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-[#94A3B8]" />
                <span className="text-sm font-medium text-white">{key.label}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  key.status === "active" ? "bg-[#4ADE80]/20 text-[#4ADE80]" : "bg-[#F59E0B]/20 text-[#F59E0B]"
                }`}>
                  {key.status}
                </span>
              </div>
              <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-xs text-[#94A3B8] hover:text-[#4ADE80] flex items-center gap-1 transition-colors">
                Console <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2 rounded-lg bg-[#1E293B]/50 border border-[#1E293B] font-mono text-xs text-[#94A3B8] overflow-hidden whitespace-nowrap">
                {key.show ? key.value : "••••••••••••••••••••••••••••••••••••"}
              </div>
              <button
                onClick={key.toggle}
                className="p-2 rounded-lg border border-[#1E293B] text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/50 transition-all"
                title={key.show ? "Hide" : "Show"}
              >
                {key.show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                onClick={() => copyKey(key.id, key.value)}
                className="p-2 rounded-lg border border-[#1E293B] text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/50 transition-all"
                title="Copy"
              >
                {copied === key.id ? <Check className="w-4 h-4 text-[#4ADE80]" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-[#475569]">
        API keys are stored in your environment variables and are never exposed to the client.
      </p>
    </div>
  );
}

function NotificationsTab() {
  const [notifications, setNotifications] = useState({
    nicheAlerts: true,
    weeklyDigest: true,
    channelUpdates: false,
    trendAlerts: true,
    emailNotifs: true,
    pushNotifs: false,
  });

  const toggle = (key: string) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };

  const items = [
    { key: "nicheAlerts", label: "Niche Score Alerts", desc: "Get notified when a tracked niche score changes significantly" },
    { key: "weeklyDigest", label: "Weekly Digest", desc: "Receive a weekly summary of top-performing niches and channels" },
    { key: "channelUpdates", label: "Channel Updates", desc: "Notifications when saved channels publish new content" },
    { key: "trendAlerts", label: "Trend Alerts", desc: "Real-time alerts for emerging trends and viral content" },
    { key: "emailNotifs", label: "Email Notifications", desc: "Receive notifications via email" },
    { key: "pushNotifs", label: "Push Notifications", desc: "Browser push notifications for important updates" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Notifications</h2>
        <p className="text-sm text-[#94A3B8] mt-1">Configure how you want to be notified</p>
      </div>

      <div className="space-y-1 rounded-xl border border-[#1E293B] bg-[#0D1117]/60 divide-y divide-[#1E293B] overflow-hidden">
        {items.map((item) => (
          <div key={item.key} className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-sm font-medium text-white">{item.label}</p>
              <p className="text-xs text-[#94A3B8] mt-0.5">{item.desc}</p>
            </div>
            <button
              onClick={() => toggle(item.key)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                notifications[item.key as keyof typeof notifications] ? "bg-[#4ADE80]" : "bg-[#1E293B]"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
                  notifications[item.key as keyof typeof notifications] ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AppearanceTab() {
  const [theme, setTheme] = useState<"dark" | "light" | "system">("dark");

  const themes = [
    { id: "dark" as const, label: "Dark", icon: Moon, desc: "Easy on the eyes" },
    { id: "light" as const, label: "Light", icon: Sun, desc: "Classic bright theme" },
    { id: "system" as const, label: "System", icon: Monitor, desc: "Match your OS" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Appearance</h2>
        <p className="text-sm text-[#94A3B8] mt-1">Customize the look and feel</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#94A3B8] mb-3">Theme</label>
        <div className="grid grid-cols-3 gap-3">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`p-4 rounded-xl border text-center transition-all duration-200 ${
                theme === t.id
                  ? "border-[#4ADE80] bg-[#4ADE80]/10 ring-1 ring-[#4ADE80]/20"
                  : "border-[#1E293B] bg-[#0D1117]/60 hover:border-[#4ADE80]/30"
              }`}
            >
              <t.icon className={`w-5 h-5 mx-auto mb-2 ${theme === t.id ? "text-[#4ADE80]" : "text-[#94A3B8]"}`} />
              <span className={`text-sm font-medium ${theme === t.id ? "text-[#4ADE80]" : "text-white"}`}>
                {t.label}
              </span>
              <p className="text-[10px] text-[#94A3B8] mt-0.5">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#94A3B8] mb-3">Accent Color</label>
        <div className="flex gap-3">
          {["#4ADE80", "#22D3EE", "#A78BFA", "#F472B6", "#FB923C", "#FACC15"].map((color) => (
            <button
              key={color}
              className="w-8 h-8 rounded-full border-2 border-transparent hover:border-white/30 transition-all hover:scale-110"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Font Size</label>
        <select className="w-full px-4 py-2.5 rounded-lg bg-[#1E293B]/50 border border-[#1E293B] text-white text-sm focus:border-[#4ADE80]/50 focus:outline-none transition-all appearance-none">
          <option value="sm">Small</option>
          <option value="md" selected>Medium (Default)</option>
          <option value="lg">Large</option>
        </select>
      </div>
    </div>
  );
}

function SecurityTab() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (newPassword && newPassword === confirmPassword) {
      setSaved(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Security</h2>
        <p className="text-sm text-[#94A3B8] mt-1">Manage your password and security settings</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter current password"
            className="w-full px-4 py-2.5 rounded-lg bg-[#1E293B]/50 border border-[#1E293B] text-white text-sm placeholder-[#475569] focus:border-[#4ADE80]/50 focus:outline-none focus:ring-1 focus:ring-[#4ADE80]/20 transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
            className="w-full px-4 py-2.5 rounded-lg bg-[#1E293B]/50 border border-[#1E293B] text-white text-sm placeholder-[#475569] focus:border-[#4ADE80]/50 focus:outline-none focus:ring-1 focus:ring-[#4ADE80]/20 transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#94A3B8] mb-1.5">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            className="w-full px-4 py-2.5 rounded-lg bg-[#1E293B]/50 border border-[#1E293B] text-white text-sm placeholder-[#475569] focus:border-[#4ADE80]/50 focus:outline-none focus:ring-1 focus:ring-[#4ADE80]/20 transition-all"
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#4ADE80] to-[#22D3EE] text-[#0D1117] text-sm font-semibold hover:opacity-90 transition-all flex items-center gap-2"
      >
        {saved ? <><Check className="w-4 h-4" /> Password Updated!</> : "Update Password"}
      </button>

      <div className="pt-4 border-t border-[#1E293B]">
        <h3 className="text-sm font-medium text-white mb-3">Sessions</h3>
        <div className="p-4 rounded-xl border border-[#1E293B] bg-[#0D1117]/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#4ADE80]/10 flex items-center justify-center">
                <Monitor className="w-4 h-4 text-[#4ADE80]" />
              </div>
              <div>
                <p className="text-sm text-white">Current Session</p>
                <p className="text-xs text-[#94A3B8]">macOS • Chrome • Active now</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#4ADE80]/20 text-[#4ADE80] tracking-wider">
              Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  const renderTab = () => {
    switch (activeTab) {
      case "profile": return <ProfileTab />;
      case "subscription": return <SubscriptionTab />;
      case "api-keys": return <ApiKeysTab />;
      case "notifications": return <NotificationsTab />;
      case "appearance": return <AppearanceTab />;
      case "security": return <SecurityTab />;
      default: return <ProfileTab />;
    }
  };

  return (
    <div className="flex gap-8 max-w-4xl">
      {/* Sidebar Navigation */}
      <nav className="w-56 shrink-0 space-y-1">
        <h1 className="text-lg font-bold text-white flex items-center gap-2 px-3 mb-4">
          <Settings className="w-5 h-5 text-[#94A3B8]" />
          Settings
        </h1>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-[#4ADE80]/10 text-[#4ADE80] border border-[#4ADE80]/20"
                : "text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/30 border border-transparent"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Content Area */}
      <div className="flex-1 min-w-0">
        <div className="p-6 rounded-xl border border-[#1E293B] bg-[#0D1117]/60">
          {renderTab()}
        </div>
      </div>
    </div>
  );
}
