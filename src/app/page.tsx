'use client';

import { useFitFun } from "@/context/FitFunContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function WelcomePage() {
  const { profile, isLoading } = useFitFun();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (profile.setupComplete) {
        router.replace('/home');
      } else {
        router.replace('/onboarding');
      }
    }
  }, [isLoading, profile, router]);

  return <div className="flex-1 flex items-center justify-center text-brand-500">Loading...</div>;
}
