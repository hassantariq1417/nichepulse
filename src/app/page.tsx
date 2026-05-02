import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { SocialProof } from "@/components/landing/SocialProof";
import { Features } from "@/components/landing/Features";
import { WhyNichePulse } from "@/components/landing/WhyNichePulse";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Comparison } from "@/components/landing/Comparison";
import { Testimonials } from "@/components/landing/Testimonials";
import { EarlyAccess } from "@/components/landing/EarlyAccess";
import { Pricing } from "@/components/landing/Pricing";
import { FAQ } from "@/components/landing/FAQ";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#080B10] text-white overflow-x-hidden">
      <Navbar />
      <Hero />
      <SocialProof />
      <Features />
      <WhyNichePulse />
      <HowItWorks />
      <Comparison />
      <Testimonials />
      <EarlyAccess />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}

