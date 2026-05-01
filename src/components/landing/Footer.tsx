"use client";

import Link from "next/link";
import { Zap, ExternalLink, MessageCircle, Play, Mail } from "lucide-react";

const footerLinks = {
  Product: [
    { label: "Niche Finder", href: "/#features" },
    { label: "Content Studio", href: "/#features" },
    { label: "AI Recommendations", href: "/#features" },
    { label: "Pricing", href: "/#pricing" },
    { label: "Changelog", href: "/changelog" },
  ],
  Resources: [
    { label: "Documentation", href: "/docs" },
    { label: "API Reference", href: "/docs" },
    { label: "Blog", href: "/blog" },
    { label: "Tutorials", href: "/docs" },
    { label: "Status", href: "/status" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
    { label: "Contact", href: "mailto:hello@nichepulse.io" },
  ],
};

const socialLinks = [
  { icon: MessageCircle, href: "#", label: "Twitter" },
  { icon: Play, href: "#", label: "YouTube" },
  { icon: ExternalLink, href: "#", label: "GitHub" },
  { icon: Mail, href: "#", label: "Email" },
];

export function Footer() {
  return (
    <footer className="border-t border-[#1E293B] bg-[#080B10]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4 cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#64FFDA] to-[#64FFDA]/60 flex items-center justify-center">
                <Zap className="w-4 h-4 text-[#080B10]" />
              </div>
              <span className="text-xl font-bold">
                <span className="text-[#64FFDA]">Niche</span>
                <span className="text-white">Pulse</span>
              </span>
            </Link>
            <p className="text-sm text-[#94A3B8] max-w-xs leading-relaxed mb-6">
              AI-powered YouTube niche intelligence platform. Find profitable
              niches, analyze channels, and create content that converts.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-lg bg-[#1E293B]/50 flex items-center justify-center text-[#94A3B8] hover:text-[#64FFDA] hover:bg-[#1E293B] transition-colors duration-200 cursor-pointer"
                >
                  <s.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-white mb-4">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-[#94A3B8] hover:text-white transition-colors duration-200 cursor-pointer"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-[#1E293B] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#94A3B8]">
            © {new Date().getFullYear()} NichePulse. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}
