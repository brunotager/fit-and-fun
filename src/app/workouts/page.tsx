'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFitFun } from '@/context/FitFunContext';
import { Flame, Clock, Gift, CheckCircle2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { generate7DayPlan } from '@/lib/planEngine';

export default function WorkoutsPage() {
    const router = useRouter();
    const { profile, progress } = useFitFun();
    const [showInterestModal, setShowInterestModal] = useState(false);
    const [email, setEmail] = useState('');
    const [isEmailSubmitted, setIsEmailSubmitted] = useState(false);

    const currentDay = progress.currentPlanDay || 1;
    
    if (currentDay > 7) {
        return (
            <div className="flex-1 flex flex-col bg-[#FFFDF7] animate-in fade-in duration-700 h-full">
                <Header title="Journey Complete" />
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-32 h-32 bg-brand-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
                        <Gift size={64} className="text-brand-500" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight mb-4">Beta Complete!</h1>
                    <p className="text-gray-600 mb-8 max-w-sm">
                        Congratulations! You have completed the 7-Day Fit & Fun beta journey. 
                        You've unlocked the foundation for a healthier habit.
                    </p>
                    <button 
                        onClick={() => {
                            console.log("BACKEND_TRACK: User requested more content after Day 7");
                            setShowInterestModal(true);
                        }}
                        className="w-full max-w-xs bg-brand-500 hover:bg-brand-600 text-white font-bold py-4 rounded-full shadow-lg active:scale-95 transition-transform uppercase tracking-wider text-sm"
                    >
                        Want More Workouts?
                    </button>
                    <button 
                        onClick={() => router.push('/progress')}
                        className="mt-4 text-brand-600 font-bold text-sm uppercase tracking-wide px-4 py-2"
                    >
                        View My Progress
                    </button>
                </div>

                {/* Interest Modal */}
                {showInterestModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl relative text-center">
                            {!isEmailSubmitted ? (
                                <>
                                    <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Flame size={32} className="text-brand-500" strokeWidth={2.5} />
                                    </div>
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase mb-3">You're on fire! 🔥</h2>
                                    <p className="text-sm text-stone-600 font-medium leading-relaxed mb-6">
                                        We are actively designing the extended **28-Day Plan**. Join the waitlist and you'll be the first to know when it drops!
                                    </p>
                                    
                                    <div className="flex flex-col gap-3 mb-6">
                                        <input 
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Enter your email"
                                            className="w-full bg-stone-50 border border-stone-200 rounded-xl p-4 text-stone-700 font-medium outline-none focus:border-brand-500 transition-colors placeholder:text-stone-400 text-center"
                                        />
                                        <button 
                                            onClick={() => {
                                                if(email.includes('@')) {
                                                    setIsEmailSubmitted(true);
                                                    console.log("BACKEND_TRACK: Email Waitlist Joined -", email);
                                                }
                                            }}
                                            className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-4 rounded-xl transition-colors active:scale-95 text-lg shadow-md disabled:opacity-50"
                                            disabled={!email}
                                        >
                                            Join Waitlist
                                        </button>
                                    </div>
                                    
                                    <button 
                                        onClick={() => setShowInterestModal(false)}
                                        className="text-stone-400 hover:text-stone-600 font-bold text-sm tracking-wide transition-colors"
                                    >
                                        MAYBE LATER
                                    </button>
                                </>
                            ) : (
                                <div className="animate-in zoom-in-95 duration-500 py-4">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle2 size={32} className="text-green-500" strokeWidth={2.5} />
                                    </div>
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase mb-3">You're In!</h2>
                                    <p className="text-[15px] text-stone-600 font-medium leading-relaxed mb-8">
                                        We've added <span className="font-bold text-brand-600">{email}</span> to the VIP list. Stay tuned!
                                    </p>
                                    <button 
                                        onClick={() => setShowInterestModal(false)}
                                        className="w-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold py-4 rounded-xl transition-colors active:scale-95 text-lg"
                                    >
                                        Awesome
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    const plan = generate7DayPlan(profile.fitnessGoal, profile.activityLevel);
    const todayWorkout = plan[currentDay - 1];

    if (!todayWorkout) return null; // Safe fallback

    return (
        <div className="flex-1 flex flex-col bg-[#FFFDF7] overflow-y-auto custom-scrollbar animate-in fade-in duration-700 pb-10 min-h-0">
            <Header title="Your Personal Plan" />

            <div className="flex-1 flex flex-col px-6 mt-6 relative">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Today's Focus</h2>
                        <h1 className="text-[32px] font-black text-gray-900 tracking-tight">Day {currentDay}</h1>
                    </div>
                    <div className="bg-brand-100 text-brand-600 px-4 py-1.5 rounded-full font-bold text-sm">
                        {currentDay} of 7
                    </div>
                </div>

                {/* Workout Card */}
                <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden flex flex-col items-center text-center">
                    {/* Decorative Blob */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-50 rounded-full blur-2xl opacity-60"></div>
                    
                    <div className="w-20 h-20 bg-[#FFFDF7] rounded-full border-[6px] border-brand-50 flex items-center justify-center mb-4 z-10">
                        <Flame size={32} className="text-brand-500" strokeWidth={2.5} />
                    </div>

                    <h2 className="text-2xl font-black text-gray-900 mb-3 z-10 capitalize">{todayWorkout.category} Routine</h2>
                    
                    <div className="flex items-center gap-2 mb-8 bg-gray-50 px-4 py-2.5 rounded-full z-10 border border-gray-100">
                        <Clock size={16} className="text-brand-500" strokeWidth={2.5} />
                        <span className="font-bold text-sm text-gray-700">{todayWorkout.duration} mins</span>
                    </div>

                    <button
                        onClick={() => router.push(`/workout/${todayWorkout.id}`)}
                        className="w-full bg-[#EA580C] hover:bg-[#C2410C] text-white font-black py-4 rounded-2xl shadow-[0_8px_30px_rgb(234,88,12,0.25)] active:scale-95 transition-transform text-lg uppercase tracking-wide z-10"
                    >
                        START WORKOUT
                    </button>
                </div>

                <div className="mt-4 text-center text-gray-400 text-sm font-medium px-4 leading-relaxed">
                    "Consistent action creates consistent results.<br />Let's do this!"
                </div>
            </div>
        </div>
    );
}
