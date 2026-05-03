'use client';

import { useFitFun } from "@/context/FitFunContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@/components/Spinner";

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

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-brand-500">
      <Spinner size={36} />
      <span className="text-sm font-medium text-stone-400">Loading...</span>
    </div>
  );
}
