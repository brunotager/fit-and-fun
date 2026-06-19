'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFitFun } from '@/context/FitFunContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import clsx from 'clsx';
import { convertWeight, convertHeight } from '@/lib/conversions';
import { TermsModal } from '@/components/TermsModal';
import { DotLottieReact, type DotLottie } from '@lottiefiles/dotlottie-react';

// Constants
const TOTAL_STEPS = 5; // 0 to 5, where 5 is success
const GABI_WELCOME_LINE = "I'm Coach Gabi. Let's build healthy habits together!";

function useTypewriter(text: string, enabled: boolean, speed = 45) {
    const [out, setOut] = useState('');
    const [done, setDone] = useState(false);
    useEffect(() => {
        if (!enabled) return;
        if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setOut(text);
            setDone(true);
            return;
        }
        let i = 0;
        const id = setInterval(() => {
            i++;
            setOut(text.slice(0, i));
            if (i >= text.length) { clearInterval(id); setDone(true); }
        }, speed);
        return () => clearInterval(id);
    }, [text, enabled, speed]);
    return { out, done };
}

// --- Global Components (Extracted to prevent remounts) ---

const OnboardingHeader = ({ onBack, onSkip, showSkip = true }: { onBack: () => void; onSkip: () => void; showSkip?: boolean }) => (
    <div className="flex justify-between items-center w-full px-4 pt-4 pb-2 shrink-0">
        <button onClick={onBack} className="p-2 text-stone-500 hover:text-[#171717] transition-colors">
            <ChevronLeft size={24} />
        </button>
        <img src="/logo.png" alt="Fit & Fun Logo" className="h-[46px] object-contain drop-shadow-sm" />
        {showSkip ? (
            <button onClick={onSkip} className="p-2 text-[#78716C] font-bold text-xs tracking-wider uppercase hover:text-[#171717] transition-colors">
                SKIP
            </button>
        ) : (
            <span className="w-12" aria-hidden="true" />
        )}
    </div>
);

const ProgressBar = ({ step }: { step: number }) => {
    // Progress bar shows starting from step 1 (0 is welcome, 2 is intro story)
    // We calculate based on total inputs
    const progress = Math.max(0, step) / (TOTAL_STEPS - 1) * 100;
    return (
        <div className="w-full px-6 mb-2 mt-2 shrink-0">
            <div className="w-full h-3 bg-stone-200 rounded-full relative overflow-hidden">
                <div
                    className="absolute top-0 left-0 h-full bg-[#267E00] transition-all duration-500 ease-out rounded-full shadow-sm"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
};

const SVGBubble = ({ text }: { text: React.ReactNode }) => (
    <div className="relative z-20 shrink-0 mb-3 mt-4 mx-auto max-w-[320px] drop-shadow-md">
        <div
            className="relative bg-[#F5F5F4] z-10"
            style={{ borderRadius: '32px', padding: '16px' }}
        >
            <p className="text-gray-800 font-medium text-[16px] leading-relaxed text-center m-0">
                {text}
            </p>
        </div>
        {/* Tail pointing down-left, perfectly blending with the bubble */}
        <svg
            className="absolute left-[20%] -bottom-[12px] z-20"
            width="28"
            height="14"
            viewBox="0 0 28 14"
            fill="none"
            style={{ overflow: 'visible' }}
        >
            <path
                d="M 8 -1 L 0 14 Q 14 10 24 -1 Z"
                fill="#F5F5F4"
            />
        </svg>
    </div>
);

const ContinueButton = ({ onClick, disabled, text = "CONTINUE" }: { onClick: () => void, disabled?: boolean, text?: string }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={clsx(
            "w-full max-w-[320px] rounded-[20px] py-4 font-bold text-sm tracking-wider uppercase z-20 relative transition-transform duration-300 mx-auto block shrink-0",
            disabled 
                ? "bg-stone-300 text-white shadow-none cursor-not-allowed" 
                : "bg-brand-500 text-white shadow-[0_8px_30px_rgb(232,106,32,0.25)] hover:bg-brand-600 active:scale-95"
        )}
    >
        {text}
    </button>
);

const InputScreen = ({ title, question, children, onNext, isValid }: { title?: string, question: string, children: React.ReactNode, onNext: () => void, isValid: boolean }) => (
    <div className="flex-1 flex flex-col pt-1 pb-2 px-6 w-full min-h-0">
        <h1 className="text-[28px] font-black text-center tracking-tight text-[#171717] uppercase shrink-0">
            {title || "BASIC INFORMATION"}
        </h1>
        <p className="text-base font-medium text-[#78716C] text-center px-4 leading-relaxed shrink-0 mt-1">
            {question}
        </p>
        <div className="w-full max-w-sm mx-auto flex flex-col justify-center my-auto py-1 min-h-0 flex-shrink">
            {children}
        </div>
        <div className="shrink-0 mt-auto">
            <ContinueButton onClick={onNext} disabled={!isValid} />
        </div>
    </div>
);

// --- Main Form Component ---

export default function OnboardingPage() {
    const router = useRouter();
    const { updateProfile } = useFitFun();
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState({
        name: '',
        heightPrimary: '',
        heightSecondary: '',
        heightUnit: 'ft/in' as 'ft/in' | 'm/cm',
        weightNum: '',
        weightUnit: 'lbs' as 'lbs' | 'kg',
    });
    const [isTermsOpen, setIsTermsOpen] = useState(false);
    const [animationEnded, setAnimationEnded] = useState(false);
    const { out: gabiOut, done: gabiDone } = useTypewriter(GABI_WELCOME_LINE, animationEnded);

    const handleDotLottieRef = (dotLottie: DotLottie | null) => {
        if (!dotLottie) return;
        dotLottie.addEventListener('complete', () => setAnimationEnded(true));
    };

    const handleNext = () => {
        if (step < TOTAL_STEPS) {
            setStep(step + 1);
        } else {
            completeSetup();
        }
    };

    const handleBack = () => {
        if (step > 0) {
            setStep(step - 1);
        } else {
            router.back();
        }
    };

    const handleSkip = () => {
        completeSetup();
    };

    const completeSetup = () => {
        updateProfile({
            name: formData.name,
            motivation: 'Levels Model', 
            goalType: 'cardio', 
            setupComplete: true,
            joinDate: new Date().toISOString(),
            heightPrimary: parseInt(formData.heightPrimary) || undefined,
            heightSecondary: parseInt(formData.heightSecondary) || undefined,
            heightUnit: formData.heightUnit,
            weight: parseInt(formData.weightNum) || undefined,
            weightUnit: formData.weightUnit,
        });
        router.push('/workouts');
    };

    const isStepValid = () => {
        switch (step) {
            case 0: return true;
            case 1: return formData.name.trim().length > 0;
            case 2: return true;
            case 3: return formData.heightPrimary.length > 0 && formData.heightSecondary.length > 0;
            case 4: return formData.weightNum.length > 0;
            case 5: return true;
            default: return true;
        }
    };

    return (
        <div className="flex-1 flex flex-col bg-[#FFFDF7] overflow-hidden h-full relative">
            <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
            {step > 0 && step < 5 && (
                <OnboardingHeader onBack={handleBack} onSkip={handleSkip} showSkip={step !== 1} />
            )}
            {step > 0 && step !== 2 && step < 5 && <ProgressBar step={step} />}
            
            <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col relative">
                <AnimatePresence mode="wait">
                    {step === 0 && (
                        <motion.div
                            key="step0"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex-1 flex flex-col items-center pb-6 pt-6 px-6 min-h-0 w-full"
                        >
                            <img src="/logo.png" alt="Fit & Fun Logo" className="w-14 h-14 object-contain drop-shadow-sm mb-2 shrink-0" />

                            <h1 className="text-[28px] font-black text-center tracking-tight text-[#171717] uppercase leading-tight mb-4 shrink-0">
                                WELCOME TO<br />FIT &amp; FUN
                            </h1>

                            {/* Typewriter — height reserved to prevent layout shift */}
                            <p
                                aria-label={GABI_WELCOME_LINE}
                                className="text-center text-base font-medium leading-relaxed text-[#171717] min-h-[3.25rem] mb-4 shrink-0"
                            >
                                <span aria-hidden="true">
                                    {gabiOut}
                                    {!gabiDone && (
                                        <span className="inline-block w-[2px] h-[1.1em] -mb-[2px] bg-[#E86A20] animate-pulse" />
                                    )}
                                </span>
                            </p>

                            {/* Gabi animation — plays once, holds last frame, transparent bg */}
                            <div className="relative flex-1 min-h-0 w-full max-w-md">
                                <DotLottieReact
                                    src="/coach-gabi-welcome-video.lottie"
                                    autoplay
                                    loop={false}
                                    dotLottieRefCallback={handleDotLottieRef}
                                    style={{ width: '100%', height: '100%' }}
                                />
                            </div>

                            {/* Live from frame 1 — never gated on animations */}
                            <div className="w-full max-w-[320px] mx-auto shrink-0 mt-4">
                                <ContinueButton onClick={handleNext} text="GET STARTED" />
                            </div>

                            <p className="mt-2 text-[11px] font-medium text-[#A8A29E] text-center max-w-[240px] shrink-0">
                                By joining, you agree to our{' '}
                                <button onClick={() => setIsTermsOpen(true)} className="underline transition-colors hover:text-stone-500">
                                    Terms and Conditions
                                </button>.
                            </p>
                        </motion.div>
                    )}

                    {step === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col min-h-0 w-full">
                            <InputScreen title="YOUR NAME" question="What should Gabi call you?" onNext={handleNext} isValid={isStepValid()}>
                                <input
                                    type="text"
                                    placeholder="Type your name..."
                                    className="w-full p-4 rounded-[20px] bg-[#EEEAEA]/80 text-center text-lg font-bold text-[#171717] placeholder-[#A8A29E] focus:outline-none border-2 border-[#EEEAEA] focus:border-brand-500 transition-colors"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    autoFocus
                                />
                            </InputScreen>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col px-4 pb-4 min-h-0 w-full">
                            <h1 className="text-[20px] font-black text-center tracking-wide text-[#171717] mt-4 mb-2 uppercase">GETTING STARTED</h1>
                            <div className="relative flex flex-col items-center w-full max-w-md mx-auto mt-2 justify-between flex-1 min-h-0">
                                <div className="flex flex-col items-center relative z-20 flex-1 min-h-0 justify-center">
                                    <SVGBubble text={<>Awesome! Let&rsquo;s get to know<br/>you. To make fitness frictionless,<br/>everyone works through levels.</>} />
                                    <div className="relative w-full max-w-[360px] flex-1 min-h-[100px] -mt-8 -mb-4 z-10 shrink min-h-0">
                                        <img src="/gabi-wave-right-v2.png" alt="Coach Gabi" className="w-full h-full object-contain drop-shadow-lg" />
                                    </div>
                                </div>
                                <ContinueButton onClick={handleNext} text="CONTINUE" />
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col min-h-0 w-full">
                            <InputScreen title="YOUR HEIGHT" question="How tall are you?" onNext={handleNext} isValid={isStepValid()}>
                                <div className="flex bg-[#EEEAEA] rounded-full p-1.5 relative shadow-inner mb-4 mx-auto w-full max-w-[200px]">
                                    {['ft/in', 'm/cm'].map(unit => (
                                        <button
                                            key={unit}
                                            onClick={() => {
                                                if (formData.heightUnit === unit) return;
                                                const converted = convertHeight(formData.heightPrimary, formData.heightSecondary, unit as any);
                                                setFormData({ 
                                                    ...formData, 
                                                    heightUnit: unit as any, 
                                                    heightPrimary: converted.primary, 
                                                    heightSecondary: converted.secondary 
                                                });
                                            }}
                                            className={clsx(
                                                "flex-1 py-2 text-sm font-bold rounded-full transition-all z-10 uppercase tracking-wider",
                                                formData.heightUnit === unit ? "bg-white text-[#171717] shadow-sm" : "text-[#78716C]"
                                            )}
                                        >
                                            {unit}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex items-center gap-3 w-full">
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            inputMode={formData.heightUnit === 'm/cm' ? 'decimal' : 'numeric'}
                                            pattern="[0-9]*"
                                            placeholder={formData.heightUnit === 'ft/in' ? 'ft' : 'm'}
                                            className="w-full p-4 rounded-[20px] bg-[#EEEAEA]/80 text-center text-xl font-bold text-[#171717] placeholder-[#A8A29E] focus:outline-none border-2 border-[#EEEAEA] focus:border-brand-500 transition-colors"
                                            value={formData.heightPrimary}
                                            onChange={(e) => {
                                                const raw = formData.heightUnit === 'm/cm'
                                                    ? e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')
                                                    : e.target.value.replace(/[^0-9]/g, '');
                                                setFormData(prev => ({ ...prev, heightPrimary: raw }));
                                            }}
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#78716C] font-medium">{formData.heightUnit === 'ft/in' ? 'ft' : 'm'}</span>
                                    </div>
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            placeholder={formData.heightUnit === 'ft/in' ? 'in' : 'cm'}
                                            className="w-full p-4 rounded-[20px] bg-[#EEEAEA]/80 text-center text-xl font-bold text-[#171717] placeholder-[#A8A29E] focus:outline-none border-2 border-[#EEEAEA] focus:border-brand-500 transition-colors"
                                            value={formData.heightSecondary}
                                            onChange={(e) => {
                                                const raw = e.target.value.replace(/[^0-9]/g, '');
                                                setFormData(prev => ({ ...prev, heightSecondary: raw }));
                                            }}
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#78716C] font-medium">{formData.heightUnit === 'ft/in' ? 'in' : 'cm'}</span>
                                    </div>
                                </div>
                            </InputScreen>
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col min-h-0 w-full">
                            <InputScreen title="YOUR WEIGHT" question="How much do you weigh?" onNext={handleNext} isValid={isStepValid()}>
                                <div className="flex bg-[#EEEAEA] rounded-full p-1.5 relative shadow-inner mb-4 mx-auto w-full max-w-[200px]">
                                    {['lbs', 'kg'].map(unit => (
                                        <button
                                            key={unit}
                                            onClick={() => {
                                                if (formData.weightUnit === unit) return;
                                                const convertedWeight = convertWeight(formData.weightNum, unit as any);
                                                setFormData({ 
                                                    ...formData, 
                                                    weightUnit: unit as any, 
                                                    weightNum: convertedWeight 
                                                });
                                            }}
                                            className={clsx(
                                                "flex-1 py-2 text-sm font-bold rounded-full transition-all z-10 uppercase tracking-wider",
                                                formData.weightUnit === unit ? "bg-white text-[#171717] shadow-sm" : "text-[#78716C]"
                                            )}
                                        >
                                            {unit}
                                        </button>
                                    ))}
                                </div>
                                <div className="relative w-full">
                                    <input
                                        type="text"
                                        inputMode={formData.weightUnit === 'kg' ? 'decimal' : 'numeric'}
                                        pattern="[0-9]*"
                                        placeholder="0"
                                        className="w-full p-4 rounded-[20px] bg-[#EEEAEA]/80 text-center text-xl font-bold text-[#171717] placeholder-[#A8A29E] focus:outline-none border-2 border-[#EEEAEA] focus:border-brand-500 transition-colors"
                                        value={formData.weightNum}
                                        onChange={(e) => {
                                            const raw = formData.weightUnit === 'kg'
                                                ? e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1')
                                                : e.target.value.replace(/[^0-9]/g, '');
                                            setFormData(prev => ({ ...prev, weightNum: raw }));
                                        }}
                                    />
                                    {formData.weightNum && (
                                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[#78716C] font-bold text-base uppercase tracking-wider">{formData.weightUnit}</span>
                                    )}
                                </div>
                            </InputScreen>
                        </motion.div>
                    )}

                    {step === 5 && (
                        <motion.div key="step5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center pb-4 pt-4 min-h-0 w-full">
                            <div className="mb-2">
                                <img src="/logo.png" alt="Fit & Fun Logo" className="w-[60px] h-[60px] object-contain drop-shadow-sm" />
                            </div>
                            <h1 className="text-[28px] font-black text-center tracking-tight text-[#171717] mb-2 uppercase">YOU'RE ALL SET!</h1>
                            
                            <div className="relative flex flex-col items-center w-full max-w-md mx-auto px-4 mt-4 flex-1 min-h-0">
                                <SVGBubble text={<>Awesome! Your Level 1 Plan is<br/>ready. Let&rsquo;s crush those 5-minute<br/>workouts together.</>} />
                                <div className="relative w-[400px] flex-1 min-h-[50px] -mt-10 -mb-8 z-10 max-w-[110vw] shrink">
                                    <img src="/gabi-celebrate-v2.png" alt="Coach Gabi" className="w-full h-full object-contain drop-shadow-lg" />
                                </div>
                                <ContinueButton onClick={completeSetup} text="START MY JOURNEY" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
