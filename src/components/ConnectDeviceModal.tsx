'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Watch, Circle, Activity } from 'lucide-react';

interface ConnectDeviceModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ConnectDeviceModal({ isOpen, onClose }: ConnectDeviceModalProps) {
    if (!isOpen) return null;

    const devices = [
        { id: 'apple', name: 'Apple Health', icon: Heart, color: 'text-[#EA304F]', bg: 'bg-[#EA304F]/10' },
        { id: 'garmin', name: 'Garmin Watch', icon: Watch, color: 'text-[#007CC3]', bg: 'bg-[#007CC3]/10' },
        { id: 'oura', name: 'Oura Ring', icon: Circle, color: 'text-stone-800', bg: 'bg-stone-200' },
        { id: 'whoop', name: 'Whoop 5.0', icon: Activity, color: 'text-white', bg: 'bg-black', iconColor: 'text-white' },
    ];

    return (
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
                        <h3 className="text-xl font-black text-gray-900 mb-2">Connect Device</h3>
                        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                            Sync your daily activity, sleep, and heart rate to update automatically.
                        </p>

                        <div className="flex flex-col gap-3 mb-6">
                            {devices.map((device) => {
                                const Icon = device.icon;
                                return (
                                    <button
                                        key={device.id}
                                        className="w-full flex items-center p-3 rounded-2xl border-2 border-stone-100 hover:border-brand-200 hover:bg-brand-50 transition-all active:scale-[0.98] group"
                                    >
                                        <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${device.bg} mr-4`}>
                                            <Icon size={20} className={device.iconColor || device.color} strokeWidth={2.5} />
                                        </div>
                                        <span className="font-bold text-gray-800 text-sm text-left flex-1">{device.name}</span>
                                        <span className="text-[10px] font-black text-brand-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Connect</span>
                                    </button>
                                );
                            })}
                        </div>
                        
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={onClose}
                                className="w-full py-2 font-bold text-gray-500 hover:text-gray-700 active:scale-95 transition-transform"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
