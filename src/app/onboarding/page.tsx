'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFitFun, ActivityLevel, FitnessGoal } from '@/context/FitFunContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import clsx from 'clsx';
import { convertWeight, convertHeight } from '@/lib/conversions';
import { TermsModal } from '@/components/TermsModal';

// Constants
const TOTAL_STEPS = 7; // 0 to 7, where 7 is success

// --- Global Components (Extracted to prevent remounts) ---

const OnboardingHeader = ({ onBack, onSkip }: { onBack: () => void, onSkip: () => void }) => (
    <div className="flex justify-between items-center w-full px-4 pt-4 pb-2 shrink-0">
        <button onClick={onBack} className="p-2 text-stone-500 hover:text-stone-800 transition-colors">
            <ChevronLeft size={24} />
        </button>
        <img src="/logo.png" alt="Fit & Fun Logo" className="h-[46px] object-contain drop-shadow-sm" />
        <button onClick={onSkip} className="p-2 text-stone-400 font-medium text-sm hover:text-stone-600 transition-colors">
            Skip
        </button>
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
                    className="absolute top-0 left-0 h-full bg-[#5DAA52] transition-all duration-500 ease-out rounded-full shadow-sm"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
};

const SVGBubble = ({ text }: { text: React.ReactNode }) => (
    <div className="relative w-[300px] h-[120px] flex items-center justify-center z-20 mb-2 mt-4 shrink-0">
        <svg className="absolute inset-0 w-full h-full drop-shadow-sm" viewBox="0 0 320 130" fill="white" preserveAspectRatio="none">
            <path 
                d="M 32 2 L 288 2 A 30 30 0 0 1 318 32 L 318 70 A 30 30 0 0 1 288 100 L 180 100 C 170 100, 165 120, 160 128 C 155 120, 150 100, 140 100 L 32 100 A 30 30 0 0 1 2 70 L 2 32 A 30 30 0 0 1 32 2 Z" 
                stroke="#374151" 
                strokeWidth="1.5" 
                vectorEffect="non-scaling-stroke" 
            />
        </svg>
        <p className="relative z-10 text-gray-800 font-medium text-[16px] leading-relaxed text-center px-6 pb-6">
            {text}
        </p>
    </div>
);

const ContinueButton = ({ onClick, disabled, text = "Continue" }: { onClick: () => void, disabled?: boolean, text?: string }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={clsx(
            "w-full max-w-[320px] rounded-[24px] py-3 font-bold text-[17px] z-20 relative transition-all duration-300 mx-auto block shrink-0",
            disabled 
                ? "bg-stone-300 text-white shadow-none cursor-not-allowed" 
                : "bg-[#E56B25] text-white shadow-lg shadow-brand-500/20 active:scale-95"
        )}
    >
        {text}
    </button>
);

const InputScreen = ({ title, question, children, onNext, isValid }: { title?: string, question: string, children: React.ReactNode, onNext: () => void, isValid: boolean }) => (
    <div className="flex-1 flex flex-col pt-1 pb-2 px-6 w-full min-h-0">
        <h1 className="text-[20px] font-black text-center tracking-wide text-gray-900 uppercase shrink-0">
            {title || "BASIC INFORMATION"}
        </h1>
        <p className="text-[17px] font-medium text-stone-700 text-center px-4 leading-relaxed shrink-0 mt-1">
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

const IOSAlphabeticKeyboard = ({ onKeyPress, onDelete, onSpace, onReturn }: { onKeyPress: (key: string) => void, onDelete: () => void, onSpace: () => void, onReturn?: () => void }) => {
    const row1 = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
    const row2 = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];
    const row3 = ['Z', 'X', 'C', 'V', 'B', 'N', 'M'];

    return (
        <div className="w-full bg-[#d1d5db] pb-8 pt-3 px-1 shrink-0 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] absolute bottom-0 left-0 z-50">
            <div className="flex flex-col gap-2 max-w-md mx-auto">
                <div className="flex justify-center gap-[5px] px-1">
                    {row1.map(key => (
                        <button key={key} onClick={() => onKeyPress(key)} className="flex-[1_1_0%] w-0 min-w-[28px] max-w-[36px] bg-white hover:bg-gray-200 active:bg-gray-300 rounded-[5px] h-[42px] shadow-[0_1px_0_rgba(0,0,0,0.3)] text-xl font-normal text-black flex items-center justify-center pt-0.5">
                            {key}
                        </button>
                    ))}
                </div>
                <div className="flex justify-center gap-[5px] px-4">
                    {row2.map(key => (
                        <button key={key} onClick={() => onKeyPress(key)} className="flex-[1_1_0%] w-0 min-w-[28px] max-w-[36px] bg-white hover:bg-gray-200 active:bg-gray-300 rounded-[5px] h-[42px] shadow-[0_1px_0_rgba(0,0,0,0.3)] text-xl font-normal text-black flex items-center justify-center pt-0.5">
                            {key}
                        </button>
                    ))}
                </div>
                <div className="flex justify-center gap-[5px] px-1">
                    <button className="w-[42px] bg-[#b5b8bd] active:bg-gray-400 rounded-[5px] h-[42px] shadow-[0_1px_0_rgba(0,0,0,0.3)] flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 4L12 20M12 4L6 10M12 4L18 10" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                    <div className="flex-[1_1_0%] flex gap-[5px] justify-center px-2">
                        {row3.map(key => (
                            <button key={key} onClick={() => onKeyPress(key)} className="flex-[1_1_0%] w-0 min-w-[28px] max-w-[36px] bg-white hover:bg-gray-200 active:bg-gray-300 rounded-[5px] h-[42px] shadow-[0_1px_0_rgba(0,0,0,0.3)] text-xl font-normal text-black flex items-center justify-center pt-0.5">
                                {key}
                            </button>
                        ))}
                    </div>
                    <button onClick={onDelete} className="w-[42px] bg-[#b5b8bd] hover:bg-gray-400 active:bg-gray-500 rounded-[5px] h-[42px] shadow-[0_1px_0_rgba(0,0,0,0.3)] flex items-center justify-center">
                        <svg width="24" height="20" viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.5 2.5H20.5C21.6046 2.5 22.5 3.39543 22.5 4.5V15.5C22.5 16.6046 21.6046 17.5 20.5 17.5H8.5L1.5 10L8.5 2.5Z" fill="white" stroke="black" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M19 7L13 13" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
                            <path d="M13 7L19 13" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                    </button>
                </div>
                <div className="flex justify-center gap-1.5 px-1 pb-1">
                    <button className="w-[88px] bg-[#b5b8bd] active:bg-gray-400 rounded-[5px] h-[42px] shadow-[0_1px_0_rgba(0,0,0,0.3)] text-[15px] font-normal text-black flex items-center justify-center">
                        123
                    </button>
                    <button onClick={onSpace} className="flex-1 bg-white hover:bg-gray-200 active:bg-gray-300 rounded-[5px] h-[42px] shadow-[0_1px_0_rgba(0,0,0,0.3)] text-lg font-normal text-black flex items-center justify-center leading-none">
                        space
                    </button>
                    <button onClick={onReturn} className="w-[88px] bg-[#b5b8bd] hover:bg-gray-400 active:bg-[#979ba1] rounded-[5px] h-[42px] shadow-[0_1px_0_rgba(0,0,0,0.3)] text-[15px] font-normal text-black flex items-center justify-center">
                        return
                    </button>
                </div>
            </div>
        </div>
    );
};

const AgeTooltip = ({ ageStr }: { ageStr: string }) => {
    if (!ageStr) return null;
    const age = parseInt(ageStr);
    if (isNaN(age)) return null;
    
    let message = "";
    if (age > 123) {
        message = "Whoa there! Are you breaking the human lifespan record? (The oldest ever was Jeanne Calment at 122 years and 164 days!)";
    } else if (age > 0 && age < 13) {
        message = "Love the early hustle, but you must be at least 13 to use Fit & Fun!";
    }

    if (!message) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-[calc(100%+14px)] inset-x-0 mx-auto w-[95%] bg-[#E56B25] text-white text-[13.5px] font-bold py-2.5 px-4 rounded-[14px] shadow-lg text-center z-50 leading-tight"
        >
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#E56B25] rotate-45 rounded-sm" />
            <span className="relative z-10">{message}</span>
        </motion.div>
    );
};

const IOSKeyboard = ({ onKeyPress, onDelete }: { onKeyPress: (key: string) => void, onDelete: () => void }) => {
    const keys = [
        { label: '1', sub: '' }, { label: '2', sub: 'A B C' }, { label: '3', sub: 'D E F' },
        { label: '4', sub: 'G H I' }, { label: '5', sub: 'J K L' }, { label: '6', sub: 'M N O' },
        { label: '7', sub: 'P Q R S' }, { label: '8', sub: 'T U V' }, { label: '9', sub: 'W X Y Z' },
    ];

    return (
        <div className="w-full bg-[#d1d5db] pb-8 pt-2 px-1 shrink-0 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] absolute bottom-0 left-0">
            <div className="grid grid-cols-3 gap-x-1.5 gap-y-1.5 p-1 mx-auto max-w-md">
                {keys.map((k) => (
                    <button
                        key={k.label}
                        onClick={() => onKeyPress(k.label)}
                        className="bg-white hover:bg-gray-100 active:bg-gray-300 rounded-[5px] h-[48px] shadow-[0_1px_0_rgba(0,0,0,0.3)] flex flex-col items-center justify-center pt-0.5"
                    >
                        <span className="text-[25px] font-normal leading-none text-black tracking-widest">{k.label}</span>
                        {k.sub && <span className="text-[10px] font-bold text-black tracking-widest uppercase mt-[1px]">{k.sub}</span>}
                    </button>
                ))}
                
                <button
                    onClick={() => onKeyPress('.')}
                    className="bg-white hover:bg-gray-100 active:bg-gray-300 rounded-[5px] h-[48px] shadow-[0_1px_0_rgba(0,0,0,0.3)] flex items-center justify-center pt-0.5"
                >
                    <span className="text-[25px] font-normal leading-none text-black tracking-widest">.</span>
                </button>
                
                <button
                    onClick={() => onKeyPress('0')}
                    className="bg-white hover:bg-gray-100 active:bg-gray-300 rounded-[5px] h-[48px] shadow-[0_1px_0_rgba(0,0,0,0.3)] flex items-center justify-center pt-0.5"
                >
                    <span className="text-[25px] font-normal leading-none text-black tracking-widest">0</span>
                </button>
                
                <button
                    onClick={onDelete}
                    className="bg-transparent active:bg-[#b5b8bd] hover:bg-gray-400 rounded-[5px] h-[48px] flex items-center justify-center text-black"
                >
                    <svg width="24" height="20" viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8.5 2.5H20.5C21.6046 2.5 22.5 3.39543 22.5 4.5V15.5C22.5 16.6046 21.6046 17.5 20.5 17.5H8.5L1.5 10L8.5 2.5Z" fill="white" stroke="black" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M19 7L13 13" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
                        <path d="M13 7L19 13" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                </button>
            </div>
        </div>
    );
};

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
        activityLevel: '' as ActivityLevel,
        fitnessGoal: '' as FitnessGoal,
    });
    const [activeNumField, setActiveNumField] = useState<'heightPrimary' | 'heightSecondary' | 'weightNum'>('heightPrimary');
    const [isTermsOpen, setIsTermsOpen] = useState(false);

    const handleNext = () => {
        if (step < TOTAL_STEPS) {
            setStep(step + 1);
        } else {
            completeSetup();
        }
    };

    const handleBack = () => {
        if (step > 0) setStep(step - 1);
        else router.back();
    };

    const handleSkip = () => {
        completeSetup();
    };

    const completeSetup = () => {
        updateProfile({
            name: formData.name,
            motivation: 'Skipped', 
            goalType: formData.fitnessGoal === 'Muscle gain' ? 'strength' : 'cardio', 
            setupComplete: true,
            joinDate: new Date().toISOString(),
            heightPrimary: parseInt(formData.heightPrimary) || undefined,
            heightSecondary: parseInt(formData.heightSecondary) || undefined,
            heightUnit: formData.heightUnit,
            weight: parseInt(formData.weightNum) || undefined,
            weightUnit: formData.weightUnit,
            activityLevel: formData.activityLevel,
            fitnessGoal: formData.fitnessGoal,
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
            case 5: return formData.activityLevel !== '';
            case 6: return formData.fitnessGoal !== '';
            case 7: return true;
            default: return true;
        }
    };

    // Keyboard handlers
    const handleNumInput = (key: string) => {
        setFormData(prev => ({ ...prev, [activeNumField]: prev[activeNumField] + key }));
        
        // Auto-advance to inches when 1 digit is entered in feet
        if (step === 3 && activeNumField === 'heightPrimary' && formData.heightUnit === 'ft/in' && formData.heightPrimary.length === 0) {
            setActiveNumField('heightSecondary');
        }
    };

    const blockInvalidAgeChars = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (['e', 'E', '+', '-', '.'].includes(e.key)) {
            e.preventDefault();
        }
    };

    const handleNumDelete = () => {
        setFormData(prev => ({ ...prev, [activeNumField]: prev[activeNumField].slice(0, -1) }));
    };

    const handleAlphaInput = (field: 'name') => (key: string) => {
        setFormData(prev => {
            const current = prev[field];
            const isFirstLetter = current.length === 0 || current.endsWith(' ');
            return { ...prev, [field]: current + (isFirstLetter ? key : key.toLowerCase()) };
        });
    };

    const handleAlphaDelete = (field: 'name') => () => {
        setFormData(prev => ({ ...prev, [field]: prev[field].slice(0, -1) }));
    };

    const handleAlphaSpace = (field: 'name') => () => {
        setFormData(prev => ({ ...prev, [field]: prev[field] + ' ' }));
    };

    return (
        <div className="flex-1 flex flex-col bg-[#FFFDF7] overflow-hidden h-full relative">
            <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
            {step > 0 && step < 7 && <OnboardingHeader onBack={handleBack} onSkip={handleSkip} />}
            {step > 0 && step !== 2 && step < 7 && <ProgressBar step={step} />}
            
            <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col relative">
                <AnimatePresence mode="wait">
                    {step === 0 && (
                        <motion.div
                            key="step0"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex-1 flex flex-col items-center justify-center pb-4 pt-4 min-h-0 w-full"
                        >
                            <div className="mb-2">
                                <img src="/logo.png" alt="Fit & Fun Logo" className="w-[60px] h-[60px] object-contain drop-shadow-sm" />
                            </div>
                            <h1 className="text-[28px] font-black text-center tracking-wide text-gray-900 mb-2 uppercase">
                                Welcome to<br/>Fit & Fun
                            </h1>
                            
                            <div className="relative flex flex-col items-center w-full max-w-md mx-auto px-4 mt-4 flex-1 min-h-0">
                                <SVGBubble text={<>Let's start your<br/>journey to well-being!</>} />
                                <div className="relative w-[400px] flex-1 min-h-[50px] -mt-10 -mb-8 z-10 max-w-[110vw] shrink">
                                    <img src="/gabi-celebrate-v2.png" alt="Coach Gabi" className="w-full h-full object-contain drop-shadow-lg" />
                                </div>
                                <ContinueButton onClick={handleNext} text="Get started!" />
                            </div>
                            <p className="text-[11px] font-medium text-stone-400 text-center max-w-[220px]">
                                By continuing, you are agreeing to Fit & Fun's <button onClick={() => setIsTermsOpen(true)} className="underline transition-colors hover:text-stone-500">Terms and Conditions</button>
                            </p>
                        </motion.div>
                    )}

                    {step === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col min-h-0 w-full">
                            <InputScreen title="Let's Personalize" question="First things first. What should I call you?" onNext={handleNext} isValid={isStepValid()}>
                                <input
                                    type="text"
                                    placeholder="Enter your name"
                                    className="w-full p-3 rounded-full bg-stone-100/80 text-center text-lg font-bold text-stone-800 placeholder-stone-400 focus:outline-none border-2 border-stone-200 focus:border-brand-500 transition-colors"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    autoFocus
                                />
                            </InputScreen>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col px-4 pb-4 min-h-0 w-full">
                            <h1 className="text-[20px] font-black text-center tracking-wide text-gray-900 mt-4 mb-2 uppercase">BASIC INFORMATION</h1>
                            <div className="relative flex flex-col items-center w-full max-w-md mx-auto mt-2 justify-between flex-1 min-h-0">
                                <div className="flex flex-col items-center relative z-20 flex-1 min-h-0 justify-center">
                                    <SVGBubble text={<>Great! Let's get some basic<br/>information so we can create a<br/>personal workout plan for you.</>} />
                                    <div className="relative w-full max-w-[360px] flex-1 min-h-[100px] -mt-8 -mb-4 z-10 shrink min-h-0">
                                        <img src="/gabi-wave-right-v2.png" alt="Coach Gabi" className="w-full h-full object-contain drop-shadow-lg" />
                                    </div>
                                </div>
                                <ContinueButton onClick={handleNext} />
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col min-h-0 w-full">
                            <InputScreen question="What is your height?" onNext={handleNext} isValid={isStepValid()}>
                                <div className="flex bg-stone-100 rounded-full p-1.5 relative shadow-inner mb-3 mx-auto w-full max-w-[200px]">
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
                                                "flex-1 py-2 text-sm font-bold rounded-full transition-all z-10",
                                                formData.heightUnit === unit ? "bg-white text-stone-900 shadow-sm" : "text-stone-400"
                                            )}
                                        >
                                            {unit}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex items-center gap-3 w-full">
                                    <div className="flex-1 relative">
                                        <input
                                            type="number"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            placeholder={formData.heightUnit === 'ft/in' ? 'ft' : 'm'}
                                            className="w-full p-3 rounded-[20px] bg-white text-center text-xl font-bold text-stone-800 placeholder-stone-400 focus:outline-none border-2 border-stone-200 focus:border-brand-500 transition-colors"
                                            value={formData.heightPrimary}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setFormData({ ...formData, heightPrimary: val });
                                                if (formData.heightUnit === 'ft/in' && val.length >= 1) {
                                                    document.getElementById('heightSecondaryInput')?.focus();
                                                }
                                            }}
                                            onKeyDown={blockInvalidAgeChars}
                                            autoFocus
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 font-medium">{formData.heightUnit === 'ft/in' ? 'ft' : 'm'}</span>
                                    </div>
                                    <div className="flex-1 relative">
                                        <input
                                            id="heightSecondaryInput"
                                            type="number"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            placeholder={formData.heightUnit === 'ft/in' ? 'in' : 'cm'}
                                            className="w-full p-3 rounded-[20px] bg-white text-center text-xl font-bold text-stone-800 placeholder-stone-400 focus:outline-none border-2 border-stone-200 focus:border-brand-500 transition-colors"
                                            value={formData.heightSecondary}
                                            onChange={(e) => setFormData({ ...formData, heightSecondary: e.target.value })}
                                            onKeyDown={blockInvalidAgeChars}
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 font-medium">{formData.heightUnit === 'ft/in' ? 'in' : 'cm'}</span>
                                    </div>
                                </div>
                            </InputScreen>
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col min-h-0 w-full">
                            <InputScreen question="What is your weight?" onNext={handleNext} isValid={isStepValid()}>
                                <div className="flex bg-stone-100 rounded-full p-1.5 relative shadow-inner mb-3 mx-auto w-full max-w-[200px]">
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
                                                "flex-1 py-2 text-sm font-bold rounded-full transition-all z-10",
                                                formData.weightUnit === unit ? "bg-white text-stone-900 shadow-sm" : "text-stone-400"
                                            )}
                                        >
                                            {unit}
                                        </button>
                                    ))}
                                </div>
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    placeholder={`Enter ${formData.weightUnit}`}
                                    className="w-full p-3 rounded-full bg-stone-100/80 text-center text-lg font-bold text-stone-800 placeholder-stone-400 focus:outline-none border-2 border-stone-200 focus:border-brand-500 transition-colors"
                                    value={formData.weightNum}
                                    onChange={(e) => setFormData({ ...formData, weightNum: e.target.value })}
                                    autoFocus
                                />
                            </InputScreen>
                        </motion.div>
                    )}

                    {step === 5 && (
                        <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col min-h-0 w-full">
                            <InputScreen question="What is your daily activity level?" onNext={handleNext} isValid={isStepValid()}>
                                <div className="flex flex-col gap-3">
                                    {[
                                        { id: 'Sedentary', desc: 'Mostly seated / little exercise' },
                                        { id: 'Lightly Active', desc: 'Light exercise 1-3 days/week' },
                                        { id: 'Moderately Active', desc: 'Moderate exercise 3-5 days/week' },
                                        { id: 'Very Active', desc: 'Heavy exercise 6-7 days/week' },
                                    ].map(level => (
                                        <button
                                            key={level.id}
                                            onClick={() => setFormData({ ...formData, activityLevel: level.id as ActivityLevel })}
                                            className={clsx(
                                                "w-full rounded-2xl p-3 text-left transition-all duration-200 border-2",
                                                formData.activityLevel === level.id ? "bg-brand-50 border-brand-500" : "bg-white border-stone-200 hover:border-stone-300"
                                            )}
                                        >
                                            <div className={clsx("font-bold text-[16px] mb-1", formData.activityLevel === level.id ? "text-brand-600" : "text-stone-800")}>{level.id}</div>
                                            <div className="text-[13px] font-medium text-stone-500">{level.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </InputScreen>
                        </motion.div>
                    )}

                    {step === 6 && (
                        <motion.div key="step6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col min-h-0 w-full">
                            <InputScreen title="FITNESS GOAL" question="What is your primary goal?" onNext={handleNext} isValid={isStepValid()}>
                                <div className="flex flex-col gap-3">
                                    {['Weight loss', 'Muscle gain', 'Maintain weight'].map(opt => (
                                        <button
                                            key={opt}
                                            onClick={() => setFormData({ ...formData, fitnessGoal: opt as FitnessGoal })}
                                            className={clsx(
                                                "w-full py-3 px-4 rounded-full font-bold text-[16px] transition-all duration-200 border-2",
                                                formData.fitnessGoal === opt ? "bg-brand-50 border-brand-500 text-brand-600" : "bg-white border-stone-200 text-stone-800 hover:border-stone-300"
                                            )}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </InputScreen>
                        </motion.div>
                    )}

                    {step === 7 && (
                        <motion.div key="step7" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center pb-4 pt-4 min-h-0 w-full">
                            <div className="mb-2">
                                <img src="/logo.png" alt="Fit & Fun Logo" className="w-[60px] h-[60px] object-contain drop-shadow-sm" />
                            </div>
                            <h1 className="text-[28px] font-black text-center tracking-wide text-gray-900 mb-2 uppercase">You're All Set!</h1>
                            
                            <div className="relative flex flex-col items-center w-full max-w-md mx-auto px-4 mt-4 flex-1 min-h-0">
                                <SVGBubble text={<>Based on your <strong className="text-brand-600 font-black">{formData.activityLevel}</strong> lifestyle, we generated a <strong className="text-brand-600 font-black">{formData.fitnessGoal}</strong> journey.</>} />
                                <div className="relative w-[400px] flex-1 min-h-[50px] -mt-10 -mb-8 z-10 max-w-[110vw] shrink">
                                    <img src="/gabi-celebrate-v2.png" alt="Coach Gabi" className="w-full h-full object-contain drop-shadow-lg" />
                                </div>
                                <ContinueButton onClick={completeSetup} text="Start My Journey" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
