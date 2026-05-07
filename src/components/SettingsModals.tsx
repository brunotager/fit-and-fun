'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
                    className="bg-white rounded-3xl p-8 w-full max-w-xs shadow-2xl relative z-10 text-center"
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
                    className="w-full py-4 font-bold text-white bg-brand-500 rounded-2xl flex items-center justify-center hover:bg-brand-600 shadow-lg shadow-brand-500/20 active:scale-95 transition-transform"
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
            <h3 className="text-xl font-black text-gray-900 mb-2">About Fit & Fun</h3>
            <p className="text-gray-500 text-sm mb-4 leading-relaxed">
                Fit & Fun is built for busy people who want to stay fit without the friction. Simple tracking, fast workouts, zero stress.
            </p>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                We're growing! Want to join the team? Connect with me directly.
            </p>
            <div className="flex flex-col gap-3">
                <a
                    href="mailto:brunotager@gmail.com?subject=Joining Fit & Fun"
                    className="w-full py-4 font-bold text-white bg-brand-500 rounded-2xl flex items-center justify-center hover:bg-brand-600 shadow-lg shadow-brand-500/20 active:scale-95 transition-transform"
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
                    className="w-full py-4 font-bold text-white bg-brand-500 rounded-2xl hover:bg-brand-600 shadow-lg shadow-brand-500/20 active:scale-95 transition-transform"
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
            <h3 className="text-xl font-black text-red-600 mb-2">Reset All Progress?</h3>
            <p className="text-gray-500 text-sm mb-4 leading-relaxed">
                This will <span className="font-bold text-red-600">permanently delete</span> all your workout data, badges, and streak. You'll start fresh from Day 1.
            </p>
            <p className="text-gray-400 text-xs mb-8 leading-relaxed">
                Your data will be recoverable for 90 days, then permanently removed.
            </p>
            <div className="flex flex-col gap-3">
                <button
                    onClick={onReset}
                    className="w-full py-4 font-bold text-white bg-red-500 rounded-2xl hover:bg-red-600 shadow-lg shadow-red-500/20 active:scale-95 transition-transform"
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

// Separate component so we can use hooks inside ModalWrapper
function NotificationsContent({ onClose }: { onClose: () => void }) {
    const { useFitFun } = require('@/context/FitFunContext');
    const { notificationsEnabled, setNotificationsEnabled, reminderTime, setReminderTime, userId } = useFitFun();

    const handleToggle = async () => {
        if (notificationsEnabled) {
            // Turn off
            const { unsubscribeFromPush } = await import('@/lib/notifications');
            await unsubscribeFromPush(userId);
            setNotificationsEnabled(false);
        } else {
            // Turn on
            const { subscribeToPush, isNotificationSupported } = await import('@/lib/notifications');
            if (!isNotificationSupported()) return;
            const success = await subscribeToPush(userId, reminderTime);
            if (success) {
                setNotificationsEnabled(true);
            }
        }
    };

    const handleTimeChange = async (newTime: string) => {
        setReminderTime(newTime);
        // Update subscription time in DB
        if (notificationsEnabled) {
            await fetch('/api/save-push-subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    endpoint: '', // Will be filled by the upsert
                    keysP256dh: '',
                    keysAuth: '',
                    reminderTime: newTime,
                }),
            }).catch(() => {});
        }
    };

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
                        onClick={handleToggle}
                        className={`relative w-11 h-6 rounded-full shrink-0 transition-colors ${notificationsEnabled ? 'bg-brand-500' : 'bg-gray-200'}`}
                    >
                        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${notificationsEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                </div>

                {notificationsEnabled && (
                    <div className="flex items-center justify-between py-3 text-left animate-in fade-in duration-200">
                        <div className="flex flex-col mr-4">
                            <span className="font-bold text-[13px] text-gray-900">Reminder Time</span>
                            <span className="text-[11px] font-medium text-gray-400 leading-tight mt-0.5">When should we ping you?</span>
                        </div>
                        <input 
                            type="time" 
                            value={reminderTime}
                            onChange={(e) => handleTimeChange(e.target.value)}
                            className="bg-stone-100 border border-stone-200 rounded-lg px-3 py-1.5 text-sm font-bold text-gray-800 focus:outline-none focus:border-brand-500"
                        />
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-3">
                <button
                    onClick={onClose}
                    className="w-full py-4 font-bold text-gray-500 hover:text-gray-700 active:scale-95 transition-transform bg-stone-100 rounded-2xl"
                >
                    Done
                </button>
            </div>
        </>
    );
}
