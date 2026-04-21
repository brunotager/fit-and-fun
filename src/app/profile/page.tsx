'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useFitFun } from '@/context/FitFunContext';
import { 
    ChevronLeft, Camera, Ruler, Scale, User, 
    HeartPulse, Moon, Footprints, ChevronDown, ChevronUp 
} from 'lucide-react';
import type { ActivityLevel, FitnessGoal } from '@/context/FitFunContext';
import { Header } from '@/components/Header';
import { ConnectDeviceModal } from '@/components/ConnectDeviceModal';
import { convertWeight, convertHeight } from '@/lib/conversions';

type ExpandingField = 'height' | 'weight' | 'activityLevel' | 'fitnessGoal' | null;

export default function ProfilePage() {
    const { profile, updateProfile, updateProgressState } = useFitFun();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [expandedField, setExpandedField] = useState<ExpandingField>(null);
    const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);

    const [editValues, setEditValues] = useState({
        name: profile.name || '',
        heightPrimary: profile.heightPrimary ? String(profile.heightPrimary) : '',
        heightSecondary: profile.heightSecondary ? String(profile.heightSecondary) : '',
        heightUnit: profile.heightUnit || 'ft/in',
        weightNum: profile.weight || '',
        weightUnit: profile.weightUnit || 'lbs',
        activityLevel: profile.activityLevel || '',
        fitnessGoal: profile.fitnessGoal || '',
    });

    // Helper to toggle expansion
    const toggleExpand = (field: ExpandingField) => {
        setExpandedField(prev => prev === field ? null : field);
    };

    const handleSave = () => {
        // Prompt if core generation params change
        if (
            (editValues.activityLevel && editValues.activityLevel !== profile.activityLevel) ||
            (editValues.fitnessGoal && editValues.fitnessGoal !== profile.fitnessGoal)
        ) {
            setShowResetModal(true);
            return;
        }
        executeSave();
    };

    const executeSave = (resetPlan = false) => {
        updateProfile({
            name: editValues.name,
            heightPrimary: Number(editValues.heightPrimary) || undefined,
            heightSecondary: Number(editValues.heightSecondary) || undefined,
            heightUnit: editValues.heightUnit,
            weight: Number(editValues.weightNum) || undefined,
            weightUnit: editValues.weightUnit,
            activityLevel: editValues.activityLevel as ActivityLevel,
            fitnessGoal: editValues.fitnessGoal as FitnessGoal,
        });

        if (resetPlan) {
            updateProgressState({ currentPlanDay: 1 });
        }

        setExpandedField(null);
        setShowResetModal(false);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Basic client-side size check (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            alert("Image exceeds 5MB limit.");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            // Additional compression could be done here with a canvas element
            updateProfile({ profileImage: base64String });
        };
        reader.readAsDataURL(file);
    };

    // Helper layout row component
    const renderRow = (
        icon: React.ReactNode, 
        label: string, 
        value: string | number | undefined, 
        fieldKey: ExpandingField,
        renderEditor: () => React.ReactNode
    ) => {
        const isExpanded = expandedField === fieldKey;

        return (
            <div className="flex flex-col border-b border-stone-100 last:border-b-0 pb-2 mb-2 last:mb-0 last:pb-0">
                <div 
                    className="flex justify-between items-center py-3 cursor-pointer group"
                    onClick={() => toggleExpand(fieldKey)}
                >
                    <div className="flex items-center gap-4 text-stone-700">
                        <div className="text-stone-400 group-hover:text-brand-500 transition-colors">
                            {icon}
                        </div>
                        <span className="font-medium text-[15px]">{label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        {value ? (
                            <span className="font-bold text-[15px] text-stone-800">{value}</span>
                        ) : (
                            <span className="text-xs font-bold text-brand-500 bg-brand-50 px-3 py-1 rounded-full uppercase tracking-wide">Add</span>
                        )}
                        {isExpanded ? <ChevronUp size={20} className="text-stone-400" /> : <ChevronDown size={20} className="text-stone-400" />}
                    </div>
                </div>

                {isExpanded && (
                    <div className="py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                        {renderEditor()}
                        <div className="mt-4 flex justify-end">
                            <button 
                                onClick={handleSave}
                                className="bg-brand-500 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-brand-600 transition-colors"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex-1 flex flex-col bg-[#FFFDF7] overflow-y-auto custom-scrollbar pb-10">
            <Header showBack title="My Profile" />

            {/* Profile Avatar Section */}
            <div className="flex flex-col items-center mt-2 mb-10 px-6 relative">
                <div 
                    className="relative w-36 h-36 rounded-full bg-stone-100 flex items-center justify-center shadow-sm cursor-pointer overflow-hidden border-4 border-white mb-6 group"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {profile.profileImage ? (
                        <Image src={profile.profileImage} alt="Profile" fill className="object-cover" />
                    ) : (
                        <span className="text-stone-300 font-bold text-5xl">
                            {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                        </span>
                    )}

                    {/* Camera Overlay */}
                    <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera size={28} className="text-white mb-1" />
                        <span className="text-white/90 text-[10px] font-medium tracking-wide">TAP TO EDIT</span>
                    </div>

                    <input 
                        type="file" 
                        ref={fileInputRef}
                        accept="image/*"
                        capture="user"
                        className="hidden"
                        onChange={handleImageUpload}
                    />
                </div>

                <div className="absolute top-[138px] flex items-center gap-1.5 px-3 py-1 bg-stone-100 rounded-full border border-stone-200">
                    <Camera size={12} className="text-stone-500" />
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Max 5MB</span>
                </div>

                <input
                    type="text"
                    value={editValues.name}
                    onChange={(e) => setEditValues(prev => ({...prev, name: e.target.value}))}
                    onBlur={handleSave}
                    placeholder="User Profile"
                    className="text-2xl font-medium text-stone-800 tracking-tight mt-6 bg-transparent border-b border-transparent hover:border-stone-200 focus:border-brand-500 focus:outline-none text-center w-full max-w-[300px] px-2 py-1 transition-colors truncate"
                />
            </div>

            <div className="px-6 space-y-8">
                {/* PHYSICAL SECTION */}
                <div>
                    <h3 className="text-xs font-bold tracking-[0.15em] text-stone-900 mb-4 ml-2 text-center">PHYSICAL</h3>
                    
                    <div className="bg-[#F8F6F3] rounded-[24px] p-5 shadow-sm">

                        {/* Height Row */}
                        {renderRow(
                            <Ruler size={22} strokeWidth={1.5} />,
                            "Height",
                            (profile.heightPrimary !== undefined && profile.heightSecondary !== undefined) ? 
                                (profile.heightUnit === 'ft/in' ? `${profile.heightPrimary}' ${profile.heightSecondary}"` : `${profile.heightPrimary}m ${profile.heightSecondary}cm`) 
                                : undefined,
                            'height',
                            () => (
                                <div className="flex flex-col gap-3 bg-white p-3 rounded-xl border border-stone-200">
                                    <div className="flex bg-stone-100 rounded-lg p-1.5 w-full">
                                        {['ft/in', 'm/cm'].map(unit => (
                                            <button
                                                key={unit}
                                                onClick={() => {
                                                    if (editValues.heightUnit === unit) return;
                                                    const converted = convertHeight(editValues.heightPrimary, editValues.heightSecondary, unit as any);
                                                    setEditValues(prev => ({
                                                        ...prev, 
                                                        heightUnit: unit as any, 
                                                        heightPrimary: converted.primary, 
                                                        heightSecondary: converted.secondary
                                                    }));
                                                }}
                                                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${
                                                    editValues.heightUnit === unit 
                                                        ? 'bg-white text-stone-900 shadow-sm' 
                                                        : 'text-stone-500 hover:text-stone-700 hover:bg-stone-200/50'
                                                }`}
                                            >
                                                {unit}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="flex-1 flex items-center bg-stone-50 border border-stone-200 rounded-lg pr-3 focus-within:border-brand-300">
                                            <input 
                                                type="number"
                                                value={editValues.heightPrimary}
                                                onChange={(e) => setEditValues(prev => ({...prev, heightPrimary: e.target.value}))}
                                                placeholder={editValues.heightUnit === 'ft/in' ? 'ft' : 'm'}
                                                className="flex-1 w-full bg-transparent text-brand-500 outline-none font-bold text-sm p-3 placeholder-stone-400"
                                            />
                                            <span className="text-stone-400 text-sm font-medium">{editValues.heightUnit === 'ft/in' ? 'ft' : 'm'}</span>
                                        </div>
                                        <div className="flex-1 flex items-center bg-stone-50 border border-stone-200 rounded-lg pr-3 focus-within:border-brand-300">
                                            <input 
                                                type="number"
                                                value={editValues.heightSecondary}
                                                onChange={(e) => setEditValues(prev => ({...prev, heightSecondary: e.target.value}))}
                                                placeholder={editValues.heightUnit === 'ft/in' ? 'in' : 'cm'}
                                                className="flex-1 w-full bg-transparent text-brand-500 outline-none font-bold text-sm p-3 placeholder-stone-400"
                                            />
                                            <span className="text-stone-400 text-sm font-medium">{editValues.heightUnit === 'ft/in' ? 'in' : 'cm'}</span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={handleSave}
                                        className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-2.5 rounded-lg text-sm mt-1 transition-colors"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            )
                        )}

                        {/* Weight Row */}
                        {renderRow(
                            <Scale size={22} strokeWidth={1.5} />,
                            "Weight",
                            profile.weight ? `${profile.weight} ${profile.weightUnit || 'lbs'}` : undefined,
                            'weight',
                            () => (
                                <div className="flex flex-col gap-3 bg-white p-3 rounded-xl border border-stone-200">
                                    <div className="flex bg-stone-100 rounded-lg p-1.5 w-full">
                                        {['lbs', 'kg'].map(unit => (
                                            <button
                                                key={unit}
                                                onClick={() => {
                                                    if (editValues.weightUnit === unit) return;
                                                    const converted = convertWeight(editValues.weightNum as any, unit as any);
                                                    setEditValues(prev => ({...prev, weightUnit: unit as any, weightNum: converted}));
                                                }}
                                                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${
                                                    editValues.weightUnit === unit 
                                                        ? 'bg-white text-stone-900 shadow-sm' 
                                                        : 'text-stone-500 hover:text-stone-700 hover:bg-stone-200/50'
                                                }`}
                                            >
                                                {unit}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex items-center bg-stone-50 border border-stone-200 rounded-lg pr-3 focus-within:border-brand-300">
                                        <input 
                                            type="number"
                                            value={editValues.weightNum}
                                            onChange={(e) => setEditValues(prev => ({...prev, weightNum: e.target.value}))}
                                            placeholder="0"
                                            className="flex-1 w-full bg-transparent text-brand-500 outline-none font-bold text-sm p-3 placeholder-stone-400"
                                        />
                                        <span className="text-stone-400 text-sm font-medium">{editValues.weightUnit}</span>
                                    </div>
                                    <button 
                                        onClick={handleSave}
                                        className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-2.5 rounded-lg text-sm mt-1 transition-colors"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            )
                        )}

                        {/* Activity Level Row */}
                        {renderRow(
                            <Footprints size={22} strokeWidth={1.5} />,
                            "Activity Level",
                            profile.activityLevel,
                            'activityLevel',
                            () => {
                                const levels = [
                                    { id: 'Sedentary', title: 'Sedentary', desc: 'Little to no formal exercise and a mostly seated daily routine.' },
                                    { id: 'Lightly Active', title: 'Lightly Active', desc: 'Light exercise 1-3 days a week, or a daily routine involving walking and standing.' },
                                    { id: 'Moderately Active', title: 'Moderately Active', desc: 'Moderate exercise 3-5 days a week, or a consistently active daily routine.' },
                                    { id: 'Very Active', title: 'Very Active', desc: 'Heavy exercise 6-7 days a week, or intense physical training and high daily activity.' },
                                ];

                                return (
                                    <div className="flex flex-col gap-2 bg-white p-2 rounded-xl border border-stone-200 mt-2">
                                        {levels.map(level => (
                                            <button 
                                                key={level.id}
                                                onClick={() => setEditValues(prev => ({...prev, activityLevel: level.id}))}
                                                className={`p-3 rounded-lg text-left transition-colors flex flex-col gap-1 ${
                                                    editValues.activityLevel === level.id 
                                                        ? 'bg-brand-500 text-white' 
                                                        : 'bg-stone-50 text-stone-700 hover:bg-stone-100'
                                                }`}
                                            >
                                                <span className="text-sm font-bold">{level.title}</span>
                                                <span className={`text-[13px] font-medium leading-relaxed ${
                                                    editValues.activityLevel === level.id ? 'text-white/90' : 'text-stone-500'
                                                }`}>
                                                    {level.desc}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                );
                            }
                        )}
                        
                        {/* Fitness Goal Row */}
                        {renderRow(
                            <HeartPulse size={22} strokeWidth={1.5} />,
                            "Fitness Goal",
                            profile.fitnessGoal,
                            'fitnessGoal',
                            () => (
                                <div className="flex flex-col gap-2 bg-white p-2 rounded-xl border border-stone-200">
                                    {['Weight loss', 'Muscle gain', 'Maintain weight'].map(opt => (
                                        <button
                                            key={opt}
                                            onClick={() => setEditValues(prev => ({...prev, fitnessGoal: opt}))}
                                            className={`p-3 rounded-lg text-left text-sm font-bold transition-colors ${
                                                editValues.fitnessGoal === opt 
                                                    ? 'bg-brand-500 text-white' 
                                                    : 'bg-stone-50 text-stone-700 hover:bg-stone-100'
                                            }`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            )
                        )}
                    </div>
                </div>

                {/* PERSONAL SECTION */}
                <div>
                    <h3 className="text-xs font-bold tracking-[0.15em] text-stone-900 mb-4 ml-2 text-center">PERSONAL</h3>
                    
                    <div className="bg-[#F8F6F3] rounded-[24px] p-5 shadow-sm space-y-1">
                        <div 
                            className="flex justify-between items-center py-3 cursor-pointer group"
                            onClick={() => setIsDeviceModalOpen(true)}
                        >
                            <div className="flex items-center gap-4 text-stone-700">
                                <HeartPulse size={22} strokeWidth={1.5} className="text-stone-400 group-hover:text-brand-500 transition-colors" />
                                <span className="font-medium text-[15px]">Heart Rate</span>
                            </div>
                            <span className="text-xs font-bold text-brand-500 bg-brand-50 px-3 py-1 rounded-full uppercase tracking-wide group-hover:bg-brand-100 transition-colors">Sync</span>
                        </div>
                        
                        <div className="border-t border-stone-200/50 my-1"></div>
                        
                        <div 
                            className="flex justify-between items-center py-3 cursor-pointer group"
                            onClick={() => setIsDeviceModalOpen(true)}
                        >
                            <div className="flex items-center gap-4 text-stone-700">
                                <Moon size={22} strokeWidth={1.5} className="text-stone-400 group-hover:text-brand-500 transition-colors" />
                                <span className="font-medium text-[15px]">Sleep Time</span>
                            </div>
                            <span className="text-xs font-bold text-brand-500 bg-brand-50 px-3 py-1 rounded-full uppercase tracking-wide group-hover:bg-brand-100 transition-colors">Sync</span>
                        </div>

                        <div className="border-t border-stone-200/50 my-1"></div>
                        
                        <div 
                            className="flex justify-between items-center py-3 cursor-pointer group"
                            onClick={() => setIsDeviceModalOpen(true)}
                        >
                            <div className="flex items-center gap-4 text-stone-700">
                                <Footprints size={22} strokeWidth={1.5} className="text-stone-400 group-hover:text-brand-500 transition-colors" />
                                <span className="font-medium text-[15px]">Steps</span>
                            </div>
                            <span className="text-xs font-bold text-brand-500 bg-brand-50 px-3 py-1 rounded-full uppercase tracking-wide group-hover:bg-brand-100 transition-colors">Sync</span>
                        </div>
                    </div>
                </div>
            </div>

            <ConnectDeviceModal 
                isOpen={isDeviceModalOpen} 
                onClose={() => setIsDeviceModalOpen(false)} 
            />

            {/* Reset Warning Modal */}
            {showResetModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl relative">
                        <div className="flex flex-col items-centertext-center mb-6 mt-2">
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight text-center uppercase mb-3">Embrace a New Journey!</h2>
                            <p className="text-[16px] text-stone-600 font-medium leading-relaxed text-center">
                                Updating your fitness goal will generate a brand new <span className="font-bold text-brand-600">7-Day Plan</span> and reset your active day to Day 1. Are you ready?
                            </p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={() => executeSave(true)}
                                className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-4 rounded-xl transition-colors shadow-md active:scale-95 text-lg"
                            >
                                Let's Do This!
                            </button>
                            <button 
                                onClick={() => setShowResetModal(false)}
                                className="w-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold py-4 rounded-xl transition-colors active:scale-95 text-lg"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
