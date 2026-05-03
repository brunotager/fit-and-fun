'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useFitFun } from '@/context/FitFunContext';
import { ChevronLeft, ChevronRight, Watch, HelpCircle, Bell, Info, RotateCcw } from 'lucide-react';
import { Header } from '@/components/Header';
import { ConnectDeviceModal } from '@/components/ConnectDeviceModal';
import { HelpModal, NotificationsModal, AboutModal, ResetProgressModal } from '@/components/SettingsModals';

export default function SettingsPage() {
    const { profile, resetProgress } = useFitFun();
    const router = useRouter();
    const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
    const [isHelpOpen, setHelpOpen] = useState(false);
    const [isNotifOpen, setNotifOpen] = useState(false);
    const [isAboutOpen, setAboutOpen] = useState(false);
    const [isResetOpen, setResetOpen] = useState(false);

    const handleReset = () => {
        resetProgress();
    };

    const MenuItem = ({ icon: Icon, label, onClick, showCaret = true }: { icon: any, label: string, onClick?: () => void, showCaret?: boolean }) => (
        <div 
            onClick={onClick}
            className="flex justify-between items-center py-4 border-b border-stone-200/50 last:border-b-0 cursor-pointer group"
        >
            <div className="flex items-center gap-4 text-stone-700">
                <Icon size={24} strokeWidth={1.5} className="text-stone-400 group-hover:text-stone-800 transition-colors" />
                <span className="font-semibold text-[15px]">{label}</span>
            </div>
            {showCaret && <ChevronRight size={20} className="text-stone-300 group-hover:text-stone-500 transition-colors" />}
        </div>
    );

    return (
        <div className="flex-1 flex flex-col bg-white overflow-y-auto pb-10 min-h-0">
            <Header showBack title="Settings" />

            {/* Logo area */}
            <div className="flex justify-center mt-6 mb-8">
                <div className="relative w-20 h-20">
                    <Image 
                        src="/logo.png" 
                        alt="Fit & Fun Logo"
                        fill
                        className="object-contain"
                    />
                </div>
            </div>

            {/* Options list */}
            <div className="px-6">
                <div className="bg-[#F8F6F3] rounded-[24px] p-2 shadow-sm">
                    <div className="px-5">
                        <MenuItem icon={Watch} label="Connected devices" onClick={() => setIsDeviceModalOpen(true)} />
                        <MenuItem icon={HelpCircle} label="Help" onClick={() => setHelpOpen(true)} />
                        <MenuItem icon={Bell} label="Notifications" onClick={() => setNotifOpen(true)} />
                        <MenuItem icon={Info} label="About us" onClick={() => setAboutOpen(true)} />
                        <MenuItem icon={RotateCcw} label="Reset progress" onClick={() => setResetOpen(true)} showCaret={false} />
                    </div>
                </div>
            </div>

            <ConnectDeviceModal 
                isOpen={isDeviceModalOpen} 
                onClose={() => setIsDeviceModalOpen(false)} 
            />
            <HelpModal isOpen={isHelpOpen} onClose={() => setHelpOpen(false)} />
            <NotificationsModal isOpen={isNotifOpen} onClose={() => setNotifOpen(false)} />
            <AboutModal isOpen={isAboutOpen} onClose={() => setAboutOpen(false)} />
            <ResetProgressModal isOpen={isResetOpen} onClose={() => setResetOpen(false)} onReset={handleReset} />
        </div>
    );
}
