'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFitFun } from '@/context/FitFunContext';

interface SharedModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ModalWrapper = ({ isOpen, onClose, children }: SharedModalProps & { children: React.ReactNode }) => (
    <AnimatePresence>
        {isOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    onClick={onClose}
                />
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-[20px] p-8 w-full max-w-xs shadow-2xl relative z-10 text-center"
                >
                    {children}
                </motion.div>
            </div>
        )}
    </AnimatePresence>
);

export function HelpModal({ isOpen, onClose }: SharedModalProps) {
    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose}>
            <h3 className="text-xl font-black text-gray-900 mb-2">Need Help?</h3>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                I'm Bruno, the creator of Fit & Fun. I read every email and I'd love to hear from you.
            </p>
            <div className="flex flex-col gap-3">
                <a
                    href="mailto:brunotager@gmail.com?subject=Fit & Fun Help"
                    className="w-full py-4 font-bold text-white bg-brand-500 rounded-[20px] flex items-center justify-center hover:bg-brand-600 shadow-lg shadow-brand-500/20 active:scale-95 transition-transform"
                >
                    Email Me
                </a>
                <button
                    onClick={onClose}
                    className="w-full py-4 font-bold text-gray-500 hover:text-gray-700 active:scale-95 transition-transform"
                >
                    Cancel
                </button>
            </div>
        </ModalWrapper>
    );
}

export function AboutModal({ isOpen, onClose }: SharedModalProps) {
    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose}>
            <h3 className="text-xl font-black text-gray-900 mb-2 uppercase">About Fit & Fun</h3>
            <p className="text-gray-500 text-sm mb-4 leading-relaxed">
                Fit & Fun is built for busy people who want to stay fit without the friction. Simple tracking, fast workouts, zero stress.
            </p>
            <p className="text-gray-500 text-sm mb-4 leading-relaxed">
                We're growing! Want to join the team? Connect with me directly.
            </p>
            <p className="text-stone-400 text-[11px] mb-8 leading-relaxed text-center border-t border-stone-100 pt-4 font-medium">
                Exercise dataset provided under open license. Credit to <a href="https://ascendapi.com" target="_blank" rel="noopener noreferrer" className="underline text-brand-600 hover:text-brand-500 transition-colors font-bold">AscendAPI (https://ascendapi.com)</a>
            </p>
            <div className="flex flex-col gap-3">
                <a
                    href="mailto:brunotager@gmail.com?subject=Joining Fit & Fun"
                    className="w-full py-4 font-bold text-white bg-brand-500 rounded-[20px] flex items-center justify-center hover:bg-brand-600 shadow-lg shadow-brand-500/20 active:scale-95 transition-transform"
                >
                    Join the Team
                </a>
                <button
                    onClick={onClose}
                    className="w-full py-4 font-bold text-gray-500 hover:text-gray-700 active:scale-95 transition-transform"
                >
                    Close
                </button>
            </div>
        </ModalWrapper>
    );
}

export function LogOutModal({ isOpen, onClose, onLogOut }: SharedModalProps & { onLogOut: () => void }) {
    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose}>
            <h3 className="text-xl font-black text-gray-900 mb-2">Log Out?</h3>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                You'll be taken back to the welcome screen. Your progress stays saved — you can pick up right where you left off.
            </p>
            <div className="flex flex-col gap-3">
                <button
                    onClick={onLogOut}
                    className="w-full py-4 font-bold text-white bg-brand-500 rounded-[20px] hover:bg-brand-600 shadow-lg shadow-brand-500/20 active:scale-95 transition-transform"
                >
                    Yes, Log Out
                </button>
                <button
                    onClick={onClose}
                    className="w-full py-4 font-bold text-gray-500 hover:text-gray-700 active:scale-95 transition-transform"
                >
                    Cancel
                </button>
            </div>
        </ModalWrapper>
    );
}

export function ResetProgressModal({ isOpen, onClose, onReset }: SharedModalProps & { onReset: () => void }) {
    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose}>
            <h3 className="text-xl font-black text-[#7E0000] mb-2">Reset All Progress?</h3>
            <p className="text-gray-500 text-sm mb-4 leading-relaxed">
                This will <span className="font-bold text-[#7E0000]">permanently delete</span> all your workout data, badges, and streak. You'll start fresh from Day 1.
            </p>
            <p className="text-gray-400 text-xs mb-8 leading-relaxed">
                Your data will be recoverable for 90 days, then permanently removed.
            </p>
            <div className="flex flex-col gap-3">
                <button
                    onClick={onReset}
                    className="w-full py-4 font-bold text-white bg-[#7E0000] rounded-[20px] hover:bg-[#5E0000] shadow-lg shadow-red-500/20 active:scale-95 transition-transform"
                >
                    Yes, Delete Everything
                </button>
                <button
                    onClick={onClose}
                    className="w-full py-4 font-bold text-gray-500 hover:text-gray-700 active:scale-95 transition-transform"
                >
                    Cancel
                </button>
            </div>
        </ModalWrapper>
    );
}

export function NotificationsModal({ isOpen, onClose }: SharedModalProps) {
    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose}>
            <NotificationsContent onClose={onClose} />
        </ModalWrapper>
    );
}

// Separate component so hooks work correctly inside ModalWrapper's conditional render
function NotificationsContent({ onClose }: { onClose: () => void }) {
    const { notificationsEnabled, setNotificationsEnabled, reminderTime, setReminderTime, userId } = useFitFun();
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [isToggling, setIsToggling] = useState(false);

    // Parse 24h "HH:MM" into 12h components for the custom selects
    const [h24, storedMin] = reminderTime.split(':').map(Number);
    const isPM = h24 >= 12;
    const h12 = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24;

    // Snap to nearest 15-min interval for display
    const minuteOptions = [0, 15, 30, 45];
    const displayMin = minuteOptions.includes(storedMin)
        ? storedMin
        : minuteOptions.reduce((prev, curr) =>
            Math.abs(curr - storedMin) < Math.abs(prev - storedMin) ? curr : prev
        );

    // Optimistic toggle — flip immediately, revert on failure
    const handleToggle = async () => {
        if (isToggling) return;
        setIsToggling(true);
        setStatusMessage(null);

        const wasEnabled = notificationsEnabled;
        setNotificationsEnabled(!wasEnabled); // instant visual flip

        try {
            if (wasEnabled) {
                const { unsubscribeFromPush } = await import('@/lib/notifications');
                await unsubscribeFromPush(userId);
            } else {
                const { isNotificationSupported, getNotificationPermission, subscribeToPush } = await import('@/lib/notifications');

                if (!isNotificationSupported()) {
                    setNotificationsEnabled(false); // revert
                    setStatusMessage('Your browser doesn\'t support push notifications.');
                    return;
                }

                const permission = getNotificationPermission();
                if (permission === 'denied') {
                    setNotificationsEnabled(false); // revert
                    setStatusMessage('Notifications are blocked. Please update your browser settings to allow them.');
                    return;
                }

                const success = await subscribeToPush(userId, reminderTime);
                if (!success) {
                    setNotificationsEnabled(false); // revert
                    setStatusMessage('Something went wrong. Please try again.');
                }
            }
        } catch {
            setNotificationsEnabled(wasEnabled); // revert on error
            setStatusMessage('Something went wrong. Please try again.');
        } finally {
            setIsToggling(false);
        }
    };

    // Convert 12h components back to 24h "HH:MM" and persist
    const updateTime = (newH12: number, newMin: number, newPM: boolean) => {
        let newH24 = newH12;
        if (newPM && newH12 !== 12) newH24 = newH12 + 12;
        if (!newPM && newH12 === 12) newH24 = 0;
        const newTime = `${String(newH24).padStart(2, '0')}:${String(newMin).padStart(2, '0')}`;
        setReminderTime(newTime);
        if (notificationsEnabled) {
            fetch('/api/save-push-subscription', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, reminderTime: newTime }),
            }).catch(() => {});
        }
    };

    // Shared styling for the custom time selects
    const selectClass = "appearance-none bg-stone-100 border border-stone-200 rounded-xl px-2.5 py-1.5 text-[13px] font-bold text-gray-800 text-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1 transition-colors";

    return (
        <>
            <h3 className="text-xl font-black text-gray-900 mb-2">Notifications</h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                A daily nudge to keep your streak alive.
            </p>

            <div className="mb-6 flex flex-col">
                <div className="flex items-center justify-between py-3 border-b border-stone-100 text-left">
                    <div className="flex flex-col mr-4">
                        <span className="font-bold text-[13px] text-gray-900">Daily Workout Reminder</span>
                        <span className="text-[11px] font-medium text-gray-400 leading-tight mt-0.5">
                            {notificationsEnabled ? "You'll get a daily nudge" : "Currently off"}
                        </span>
                    </div>
                    <button
                        role="switch"
                        aria-checked={notificationsEnabled}
                        aria-label="Toggle daily reminders"
                        onClick={handleToggle}
                        disabled={isToggling}
                        className={`relative w-11 h-6 rounded-full shrink-0 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${notificationsEnabled ? 'bg-brand-500' : 'bg-gray-200'}`}
                    >
                        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 shadow-sm ${notificationsEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                </div>

                {/* Status message for errors/blocked */}
                {statusMessage && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-left animate-in fade-in duration-200">
                        <p className="text-xs font-medium text-amber-700 leading-relaxed">{statusMessage}</p>
                    </div>
                )}

                {notificationsEnabled && (
                    <div className="flex items-center justify-between py-3 text-left animate-in fade-in duration-200">
                        <div className="flex flex-col mr-3">
                            <span className="font-bold text-[13px] text-gray-900">Reminder Time</span>
                            <span className="text-[11px] font-medium text-gray-400 leading-tight mt-0.5">When should we ping you?</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                            {/* Hour select (1–12) */}
                            <select
                                value={h12}
                                onChange={(e) => updateTime(Number(e.target.value), displayMin, isPM)}
                                className={selectClass}
                                aria-label="Hour"
                            >
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                                    <option key={h} value={h}>{h}</option>
                                ))}
                            </select>
                            <span className="text-gray-300 font-bold text-sm leading-none">:</span>
                            {/* Minute select (00, 15, 30, 45) */}
                            <select
                                value={displayMin}
                                onChange={(e) => updateTime(h12, Number(e.target.value), isPM)}
                                className={selectClass}
                                aria-label="Minute"
                            >
                                {minuteOptions.map(m => (
                                    <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
                                ))}
                            </select>
                            {/* AM/PM select */}
                            <select
                                value={isPM ? 'PM' : 'AM'}
                                onChange={(e) => updateTime(h12, displayMin, e.target.value === 'PM')}
                                className={selectClass}
                                aria-label="AM or PM"
                            >
                                <option value="AM">AM</option>
                                <option value="PM">PM</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-3">
                <button
                    onClick={onClose}
                    className="w-full py-4 font-bold text-gray-500 hover:text-gray-700 active:scale-95 transition-transform bg-stone-100 rounded-[20px]"
                >
                    Done
                </button>
            </div>
        </>
    );
}
