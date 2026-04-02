'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFitFun, GoalType } from '@/context/FitFunContext';
import { CoachGabi } from '@/components/CoachGabi';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, Check } from 'lucide-react';
import clsx from 'clsx';

export default function OnboardingPage() {
    const router = useRouter();
    const { updateProfile } = useFitFun();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        motivation: '',
        goalType: 'cardio' as GoalType,
    });

    const handleNext = () => {
        if (step < 3) {
            setStep(step + 1);
        } else {
            completeSetup();
        }
    };

    const completeSetup = () => {
        updateProfile({
            ...formData,
            setupComplete: true,
            joinDate: new Date().toISOString(),
        });
        router.push('/home');
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
        else router.back();
    };

    const isStepValid = () => {
        if (step === 1) return formData.name.trim().length > 0;
        if (step === 2) return formData.motivation.trim().length > 0;
        return true;
    };

    return (
        <div className="flex-1 flex flex-col p-6 bg-[#FFFDF7] animate-in fade-in duration-500">
            {/* Progress Bar */}
            <div className="w-full h-1 bg-gray-100 rounded-full mb-8 mt-4">
                <div
                    className="h-full bg-brand-500 rounded-full transition-all duration-500"
                    style={{ width: `${(step / 3) * 100}%` }}
                />
            </div>

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex-1"
                    >
                        <CoachGabi variant="neutral" customMessage="First things first. What should I call you?" />
                        <input
                            type="text"
                            placeholder="Your Name"
                            className="w-full mt-8 p-4 text-xl border-b-2 border-brand-100 focus:border-brand-500 outline-none text-center font-medium bg-transparent placeholder:text-gray-300 transition-colors"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            autoFocus
                        />
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex-1"
                    >
                        <CoachGabi variant="neutral" customMessage={`Nice to meet you, ${formData.name}. Why do you want to move?`} />
                        <input
                            type="text"
                            placeholder="e.g. To feel stronger..."
                            className="w-full mt-8 p-4 text-lg border-b-2 border-brand-100 focus:border-brand-500 outline-none text-center font-medium bg-transparent placeholder:text-gray-300 transition-colors"
                            value={formData.motivation}
                            onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                            autoFocus
                        />
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex-1 flex flex-col"
                    >
                        <CoachGabi variant="motivate" customMessage="Awesome. Last question: What's your main focus right now?" />

                        <div className="flex-1 flex flex-col justify-center gap-4 mt-4">
                            {(['cardio', 'strength', 'mobility'] as GoalType[]).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setFormData({ ...formData, goalType: type })}
                                    className={clsx(
                                        "p-4 rounded-xl border-2 font-bold text-lg capitalize transition-all",
                                        formData.goalType === type
                                            ? "border-brand-500 bg-brand-50 text-brand-600 shadow-md"
                                            : "border-gray-200 text-gray-400 hover:border-brand-200"
                                    )}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex justify-between items-center mt-auto py-4">
                <button
                    onClick={handleBack}
                    className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
                >
                    <ChevronLeft />
                </button>

                <button
                    onClick={handleNext}
                    disabled={!isStepValid()}
                    className={clsx(
                        "bg-brand-500 text-white rounded-full px-8 py-3 font-bold shadow-lg flex items-center gap-2 transition-all",
                        !isStepValid() ? "opacity-50 cursor-not-allowed" : "hover:scale-105 hover:shadow-xl"
                    )}
                >
                    {step === 3 ? "All Set" : "Next"}
                    {step === 3 ? <Check size={20} /> : <ArrowRight size={20} />}
                </button>
            </div>
        </div>
    );
}
