import React from "react";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Features } from "@/components/landing/Features";
import { LiveDemo } from "@/components/landing/LiveDemo";
import { Pricing } from "@/components/landing/Pricing";

export default function LandingPage() {
  return (
    <div className="flex flex-col w-full">
      <Hero />
      <HowItWorks /> 
      <LiveDemo /> 
      <Features />
      <Pricing /> 
    </div>
  );
}
