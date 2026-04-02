'use client';

import { useFitFun } from "@/context/FitFunContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import { CoachGabi } from "@/components/CoachGabi";
import { ArrowRight } from "lucide-react";

export default function WelcomePage() {
  const { profile, isLoading } = useFitFun();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && profile.setupComplete) {
      router.replace('/home');
    }
  }, [isLoading, profile, router]);

  if (isLoading || profile.setupComplete) {
    return <div className="flex-1 flex items-center justify-center text-brand-500">Loading...</div>;
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#FFFDF7] animate-in slide-in-from-bottom-4 duration-700">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-brand-600 mb-2 tracking-tight">Fit & Fun</h1>
        <p className="text-brand-600/70 text-lg">Consistency made cute.</p>
      </div>

      <CoachGabi
        variant="welcome"
        customMessage="Hi! I'm Gabi. Let's make fitness the best part of your day."
        className="mb-12"
      />

      <button
        onClick={() => router.push('/onboarding')}
        className="w-full max-w-xs bg-brand-500 hover:bg-brand-600 text-white font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
      >
        <span>Let's Go</span>
        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
}
