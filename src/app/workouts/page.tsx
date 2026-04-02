'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFitFun } from '@/context/FitFunContext';
import { ChevronLeft, Clock, Flame, Dumbbell, Heart } from 'lucide-react';
import Link from 'next/link';

// Options Data
const TIME_OPTIONS = [
    { label: 'under 10 min', value: 5 },
    { label: '11-20 min', value: 10 },
    { label: '21-30 min', value: 20 },
];

const INTENSITY_OPTIONS = [
    { label: 'Easy', value: 'easy' },
    { label: 'Medium', value: 'medium' },
    { label: 'Hard', value: 'hard' },
];

// Mapping to existing categories: 
// Neck & Shoulders -> Mobility
// Arms/Glutes -> Strength
// Full Body -> Cardio (or Strength, but map to Cardio for balance)
const BODY_PART_OPTIONS = [
    { label: 'Neck & Shoulders', value: 'mobility' },
    { label: 'Arms & Upper Body', value: 'strength' },
    { label: 'Glutes & Legs', value: 'strength' },
    { label: 'Full Body', value: 'cardio' },
];

export default function WorkoutsPage() {
    const router = useRouter();
    const { profile } = useFitFun();

    const [selectedTime, setSelectedTime] = useState<number>(5);
    const [selectedIntensity, setSelectedIntensity] = useState<string>('medium');
    const [selectedBodyPartLabels, setSelectedBodyPartLabels] = useState<string[]>(['Full Body']);

    const toggleBodyPart = (label: string) => {
        if (selectedBodyPartLabels.includes(label)) {
            setSelectedBodyPartLabels(prev => prev.filter(item => item !== label));
        } else {
            setSelectedBodyPartLabels(prev => [...prev, label]);
        }
    };

    const handleContinue = () => {
        if (selectedBodyPartLabels.length === 0) return; // Prevent continuing without selection

        // Find the value associated with the last selected label
        const lastSelectedLabel = selectedBodyPartLabels[selectedBodyPartLabels.length - 1];
        const selectedOption = BODY_PART_OPTIONS.find(opt => opt.label === lastSelectedLabel);
        const primaryCategory = selectedOption ? selectedOption.value : 'cardio';

        const workoutId = `${primaryCategory}_${selectedTime}`;
        router.push(`/workout/${workoutId}`);
    };

    const initial = profile.name ? profile.name.charAt(0).toUpperCase() : 'U';

    return (
        <div className="flex-1 flex flex-col bg-[#FFFDF7] p-6 pb-20 overflow-y-auto custom-scrollbar animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 pt-2">
                <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <ChevronLeft size={28} />
                </button>
                <h1 className="text-sm font-black tracking-widest uppercase text-gray-800">
                    CHOOSE YOUR WORKOUT
                </h1>
                <Link href="/settings" className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 font-bold hover:bg-stone-200 transition-colors">
                    {initial}
                </Link>
            </div>

            {/* Section 1: Time */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-2 text-gray-800">
                    <Clock size={16} className="text-gray-900 opacity-70" />
                    <h2 className="font-bold text-sm uppercase tracking-wider">Select Time</h2>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-1 custom-scrollbar snap-x">
                    {TIME_OPTIONS.map((opt) => (
                        <button
                            key={opt.label}
                            onClick={() => setSelectedTime(opt.value)}
                            className={`flex items-center justify-center whitespace-nowrap px-6 h-16 rounded-2xl text-sm font-bold transition-all duration-150 ease-out border snap-start active:scale-95 ${selectedTime === opt.value
                                ? 'bg-brand-100 text-gray-900 border-transparent'
                                : 'bg-gray-100 text-gray-500 border-transparent hover:bg-gray-200'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Section 2: Intensity */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-2 text-gray-800">
                    <Flame size={16} className="text-gray-900 opacity-70" fill="currentColor" />
                    <h2 className="font-bold text-sm uppercase tracking-wider">Select Intensity</h2>
                </div>
                <div className="flex gap-3">
                    {INTENSITY_OPTIONS.map((opt) => (
                        <button
                            key={opt.label}
                            onClick={() => setSelectedIntensity(opt.value)}
                            className={`flex-1 h-16 flex items-center justify-center rounded-2xl text-sm font-bold transition-all duration-150 ease-out border active:scale-95 ${selectedIntensity === opt.value
                                ? 'bg-brand-100 text-gray-900 border-transparent'
                                : 'bg-gray-100 text-gray-500 border-transparent hover:bg-gray-200'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Section 3: Body Part */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-2 text-gray-800">
                    <Dumbbell size={16} className="text-gray-900 opacity-70" />
                    <h2 className="font-bold text-sm uppercase tracking-wider">Select Body Part</h2>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    {BODY_PART_OPTIONS.map((opt) => {
                        const isSelected = selectedBodyPartLabels.includes(opt.label);
                        return (
                            <button
                                key={opt.label}
                                onClick={() => toggleBodyPart(opt.label)}
                                className={`h-16 px-4 rounded-2xl text-sm font-bold transition-all duration-150 ease-out text-center leading-tight flex items-center justify-center border active:scale-95 ${isSelected
                                    ? 'bg-brand-100 text-gray-900 border-transparent'
                                    : 'bg-gray-100 text-gray-500 border-transparent hover:bg-gray-200'
                                    }`}
                            >
                                {opt.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Footer Actions */}
            <div className="flex flex-col gap-3 text-center mt-auto pb-4">
                <button
                    onClick={handleContinue}
                    disabled={selectedBodyPartLabels.length === 0}
                    className={`w-full font-bold py-4 rounded-3xl shadow-lg transition-all text-lg tracking-wide ${selectedBodyPartLabels.length > 0
                        ? 'bg-brand-500 hover:bg-brand-600 text-white hover:shadow-xl active:scale-95'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                >
                    Continue
                </button>
            </div>
        </div>
    );
}
