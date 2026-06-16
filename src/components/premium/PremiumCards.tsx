"use client";

import { useState } from "react";
import { UserNameWithRole } from "@/components/ui/UserNameWithRole";
import { Check, Sparkles, Shield, Star, Crown, Zap } from "lucide-react";

const TIERS = [
  { 
    role: "vip", 
    price: "IDR 50,000", 
    name: "VIP Member", 
    icon: <Star className="w-5 h-5 text-blue-400" />,
    features: ["Verified checkmark", "Basic analytics", "Custom profile colors"] 
  },
  { 
    role: "mvp", 
    price: "IDR 150,000", 
    name: "MVP", 
    icon: <Zap className="w-5 h-5 text-yellow-400" />,
    features: ["Everything in VIP", "Profile Badge", "Increased upload limits"] 
  },
  { 
    role: "mod", 
    price: "IDR 250,000", 
    name: "Moderator", 
    icon: <Shield className="w-5 h-5 text-green-400" />,
    features: ["Everything in MVP", "Mod Tools access", "Content management"] 
  },
  { 
    role: "god", 
    price: "IDR 1,000,000", 
    name: "God", 
    icon: <Sparkles className="w-5 h-5 text-purple-400" />,
    features: ["Everything in Mod", "God Mode privileges", "Bypass all limits"] 
  }
];

export function PremiumCards({ userName }: { userName: string }) {
  const [selected, setSelected] = useState<string>("vip");

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-[1000px] justify-center mb-24 mt-8">
        {TIERS.map(tier => (
          <div 
            key={tier.role}
            onClick={() => setSelected(tier.role)}
            className={`bg-[#16181c] rounded-2xl p-6 flex flex-col relative border-2 cursor-pointer transition-all ${
              selected === tier.role 
                ? 'border-[#1d9bf0] shadow-[0_0_20px_rgba(29,155,240,0.3)] scale-[1.02]' 
                : 'border-transparent hover:border-[#333c45]'
            }`}
          >
            <div className="mb-6 border-b border-[#333] pb-4">
              <div className="flex items-center gap-2 mb-2">
                {tier.icon}
                <h2 className="text-xl font-bold">{tier.name}</h2>
              </div>
              <div className="text-sm text-gray-400 mb-4 bg-black/40 p-2 rounded-md">
                Preview: <UserNameWithRole displayName={userName} role={tier.role} className="inline-block text-base ml-1" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">{tier.price}</span>
                <span className="text-[#71767b] text-sm">/ mo</span>
              </div>
            </div>

            <ul className="flex flex-col gap-4 text-[14px] font-medium mt-auto">
              {tier.features.map((feat, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="text-[#1d9bf0] w-5 h-5 shrink-0" />
                  <span className="text-gray-300">{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom Fixed Checkout Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-black/90 backdrop-blur border-t border-[#2f3336] p-4 flex justify-center z-50">
        <div className="w-full max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="font-bold text-lg">{TIERS.find(t => t.role === selected)?.name} Tier</span>
            <span className="text-[#71767b] text-sm">{TIERS.find(t => t.role === selected)?.price} / month · Billed monthly</span>
          </div>
          
          <div className="flex flex-col w-full md:w-auto items-end gap-2">
            <button className="w-full md:w-[300px] bg-white hover:bg-gray-200 text-black font-bold py-3 rounded-full text-[15px] transition-colors">
              Subscribe to {TIERS.find(t => t.role === selected)?.name}
            </button>
            <p className="text-[#71767b] text-[11px] max-w-md text-right leading-tight hidden md:block">
              By subscribing, you agree to our <span className="underline cursor-pointer text-white">Purchaser Terms</span>. Cancel anytime.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
