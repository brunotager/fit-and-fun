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
                Are you sure you want to disconnect? Your progress remains saved locally.
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

export function NotificationsModal({ isOpen, onClose }: SharedModalProps) {
    // Mock state since user requested front-end interactions without backend currently attached
    const [daily, setDaily] = useState(true);
    const [weekly, setWeekly] = useState(true);
    const [updates, setUpdates] = useState(false);

    const Toggle = ({ active, onChange, label, desc }: any) => (
        <div className="flex items-center justify-between py-3 border-b border-stone-100 last:border-b-0 text-left">
            <div className="flex flex-col mr-4">
                <span className="font-bold text-[13px] text-gray-900">{label}</span>
                <span className="text-[11px] font-medium text-gray-400 leading-tight mt-0.5">{desc}</span>
            </div>
            <button 
                onClick={onChange}
                className={`relative w-11 h-6 rounded-full shrink-0 transition-colors ${active ? 'bg-brand-500' : 'bg-gray-200'}`}
            >
                <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${active ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
        </div>
    );

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose}>
            <h3 className="text-xl font-black text-gray-900 mb-2">Notifications</h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                Stay motivated without the spam.
            </p>
            
            <div className="mb-6 flex flex-col">
                <Toggle 
                    active={daily} onChange={() => setDaily(!daily)}
                    label="Daily Reminder" desc="A quick nudge to keep your streak going." 
                />
                <Toggle 
                    active={weekly} onChange={() => setWeekly(!weekly)}
                    label="Weekly Summary" desc="Your progress digest every Sunday." 
                />
                <Toggle 
                    active={updates} onChange={() => setUpdates(!updates)}
                    label="Product Updates" desc="New workouts and feature alerts." 
                />
            </div>

            <div className="flex flex-col gap-3">
                <button
                    onClick={onClose}
                    className="w-full py-4 font-bold text-gray-500 hover:text-gray-700 active:scale-95 transition-transform bg-stone-100 rounded-2xl"
                >
                    Done
                </button>
            </div>
        </ModalWrapper>
    );
}
