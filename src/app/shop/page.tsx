'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useFitFun } from '@/context/FitFunContext';
import { shopItems, RARITY_COLORS, getItemById, type ShopItem, type ItemCategory } from '@/data/shopItems';
import { Header } from '@/components/Header';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Check, Star, Sparkles, X, PartyPopper } from 'lucide-react';
import clsx from 'clsx';

export default function ShopPage() {
    const router = useRouter();
    const { progress, availablePoints, wardrobe, purchaseItem, equipItem, unequipItem } = useFitFun();
    const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
    const [showPurchaseConfirm, setShowPurchaseConfirm] = useState(false);
    const [showPurchaseSuccess, setShowPurchaseSuccess] = useState(false);
    const [justPurchasedItem, setJustPurchasedItem] = useState<ShopItem | null>(null);
    const [justPurchasedId, setJustPurchasedId] = useState<string | null>(null);

    const items = shopItems; // All jerseys for now

    const isOwned = useCallback((itemId: string) => wardrobe.ownedItems.includes(itemId), [wardrobe.ownedItems]);
    const isEquipped = useCallback((itemId: string) => {
        const item = getItemById(itemId);
        if (!item) return false;
        return wardrobe.equipped[item.category] === itemId;
    }, [wardrobe.equipped]);

    const handlePurchase = (item: ShopItem) => {
        setSelectedItem(item);
        setShowPurchaseConfirm(true);
    };

    const confirmPurchase = () => {
        if (!selectedItem) return;
        const success = purchaseItem(selectedItem.id);
        if (success) {
            setJustPurchasedId(selectedItem.id);
            setJustPurchasedItem(selectedItem);
            setShowPurchaseConfirm(false);

            // Confetti celebration
            import('canvas-confetti').then(({ default: confetti }) => {
                confetti({
                    particleCount: 120,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#E86A20', '#FDBA74', '#FFEDD5', '#7C3AED', '#38BDF8']
                });
            });

            // Show the success modal asking to equip
            setTimeout(() => setShowPurchaseSuccess(true), 400);

            // Clear the "just purchased" glow after 5s
            setTimeout(() => setJustPurchasedId(null), 5000);
        } else {
            setShowPurchaseConfirm(false);
        }
    };

    const handleEquipAfterPurchase = () => {
        if (justPurchasedItem) {
            equipItem(justPurchasedItem.id);
        }
        setShowPurchaseSuccess(false);
        setJustPurchasedItem(null);
    };

    const handleSkipEquip = () => {
        setShowPurchaseSuccess(false);
        setJustPurchasedItem(null);
    };

    const handleEquipToggle = (item: ShopItem) => {
        if (isEquipped(item.id)) {
            unequipItem(item.category);
        } else {
            equipItem(item.id);
        }
    };

    const canAfford = (price: number) => availablePoints >= price;

    return (
        <div className="flex-1 flex flex-col bg-[#FFFDF7] overflow-hidden animate-in fade-in duration-500">
            <Header showBack backTo="/progress" title="Gabi's Shop" />

            {/* Points Banner */}
            <div className="px-6 pt-4 pb-2">
                <div className="flex items-center justify-between bg-gradient-to-r from-brand-500 to-[#E86A20] rounded-[20px] p-4 shadow-lg shadow-brand-500/20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                            <Star size={20} className="text-white" fill="white" />
                        </div>
                        <div>
                            <p className="text-white/80 text-xs font-bold uppercase tracking-wider">Available Points</p>
                            <p className="text-white text-2xl font-black tabular-nums">{availablePoints.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider">Lifetime</p>
                        <p className="text-white/80 text-sm font-bold tabular-nums">{progress.totalPoints.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Section Title */}
            <div className="px-6 pt-4 pb-1">
                <h2 className="text-xs font-black text-stone-400 uppercase tracking-[0.15em]">👕 Jerseys</h2>
            </div>

            {/* Items Grid */}
            <div className="flex-1 overflow-y-auto px-6 pt-3 pb-32 custom-scrollbar">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-2 gap-3"
                >
                    {items.map((item, index) => {
                        const owned = isOwned(item.id);
                        const equipped = isEquipped(item.id);
                        const affordable = canAfford(item.price);
                        const rarity = RARITY_COLORS[item.rarity];
                        const wasJustPurchased = justPurchasedId === item.id;

                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05, duration: 0.3 }}
                                className={clsx(
                                    "relative bg-white rounded-[20px] overflow-hidden shadow-sm border transition-all duration-300",
                                    equipped ? "border-brand-300 ring-2 ring-brand-200 shadow-brand-100" :
                                    wasJustPurchased ? "border-emerald-300 ring-2 ring-emerald-200" :
                                    "border-stone-100 hover:border-stone-200 hover:shadow-md"
                                )}
                            >
                                {/* Image Area */}
                                <div 
                                    className="relative aspect-square bg-gradient-to-b from-stone-50 to-stone-100 overflow-hidden cursor-pointer"
                                    onClick={() => owned ? handleEquipToggle(item) : (affordable ? handlePurchase(item) : undefined)}
                                >
                                    {/* Gabi Image — use celebrate pose for preview */}
                                    <Image
                                        src={item.previewImage}
                                        alt={item.name}
                                        fill
                                        unoptimized
                                        className={clsx(
                                            "object-contain p-1 transition-all duration-500",
                                            !owned && "blur-[6px] scale-105 saturate-50"
                                        )}
                                    />

                                    {/* Lock overlay for non-owned items */}
                                    {!owned && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                            <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                                                <Lock size={20} className="text-stone-500" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Equipped Badge */}
                                    {equipped && (
                                        <div className="absolute top-2 right-2 bg-brand-500 text-white text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full shadow-md flex items-center gap-1">
                                            <Check size={10} strokeWidth={4} />
                                            <span>Wearing</span>
                                        </div>
                                    )}

                                    {/* Rarity Badge */}
                                    <div className={clsx(
                                        "absolute top-2 left-2 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full",
                                        rarity.bg, rarity.text
                                    )}>
                                        {rarity.label}
                                    </div>
                                </div>

                                {/* Info Area */}
                                <div className="p-3">
                                    <h3 className="font-bold text-sm text-stone-900 truncate leading-tight">{item.name}</h3>
                                    <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">{item.description}</p>

                                    {/* Action Area */}
                                    <div className="mt-2.5">
                                        {owned ? (
                                            <button
                                                onClick={() => handleEquipToggle(item)}
                                                className={clsx(
                                                    "w-full py-2 rounded-[20px] text-xs font-bold uppercase tracking-wider transition-all duration-200 active:scale-95",
                                                    equipped
                                                        ? "bg-brand-50 text-brand-600 border border-brand-200"
                                                        : "bg-stone-100 text-stone-600 hover:bg-stone-200 border border-stone-200"
                                                )}
                                            >
                                                {equipped ? '✓ Equipped' : 'Equip'}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => affordable ? handlePurchase(item) : undefined}
                                                disabled={!affordable}
                                                className={clsx(
                                                    "w-full py-2 rounded-[20px] text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5",
                                                    affordable
                                                        ? "bg-brand-500 text-white hover:bg-brand-600 active:scale-95 shadow-sm"
                                                        : "bg-stone-100 text-stone-400 cursor-not-allowed"
                                                )}
                                            >
                                                <Star size={12} fill="currentColor" />
                                                <span>{item.price}</span>
                                                {!affordable && (
                                                    <span className="text-[9px] normal-case font-medium ml-0.5">
                                                        (need {item.price - availablePoints} more)
                                                    </span>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Equipped Summary */}
                {wardrobe.equipped.jersey && (
                    <div className="mt-6 mb-4">
                        <h3 className="text-xs font-black text-stone-400 uppercase tracking-[0.15em] mb-3 text-center">Currently Wearing</h3>
                        <div className="flex gap-2 justify-center flex-wrap">
                            {(() => {
                                const item = getItemById(wardrobe.equipped.jersey!);
                                if (!item) return null;
                                return (
                                    <div className="flex items-center gap-2 bg-brand-50 border border-brand-100 rounded-full px-3 py-1.5">
                                        <span className="text-xs font-bold text-brand-700">{item.name}</span>
                                        <button
                                            onClick={() => unequipItem('jersey')}
                                            className="w-4 h-4 rounded-full bg-brand-200 flex items-center justify-center hover:bg-brand-300 transition-colors"
                                        >
                                            <X size={10} className="text-brand-700" strokeWidth={3} />
                                        </button>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                )}

                {/* Coming Soon teaser */}
                <div className="mt-8 mb-4 text-center">
                    <p className="text-xs font-bold text-stone-300 uppercase tracking-wider">👟 Shoes & 🎽 Accessories — Coming Soon</p>
                </div>
            </div>

            {/* ═══════════════════════════════════ */}
            {/* Purchase Confirmation Modal */}
            {/* ═══════════════════════════════════ */}
            <AnimatePresence>
                {showPurchaseConfirm && selectedItem && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setShowPurchaseConfirm(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-[20px] p-6 w-full max-w-sm shadow-2xl relative z-10 text-center"
                        >
                            {/* Preview — show celebrate pose */}
                            <div className="relative w-44 h-44 mx-auto mb-4 rounded-[20px] overflow-hidden bg-gradient-to-b from-stone-50 to-stone-100">
                                <Image
                                    src={selectedItem.gabiCelebrateImage}
                                    alt={selectedItem.name}
                                    fill
                                    unoptimized
                                    className="object-contain p-1"
                                />
                            </div>

                            <div className={clsx(
                                "inline-block text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full mb-2",
                                RARITY_COLORS[selectedItem.rarity].bg,
                                RARITY_COLORS[selectedItem.rarity].text
                            )}>
                                {RARITY_COLORS[selectedItem.rarity].label}
                            </div>

                            <h2 className="text-xl font-black text-gray-900 tracking-tight mb-1">{selectedItem.name}</h2>
                            <p className="text-sm text-stone-500 mb-6 leading-relaxed">{selectedItem.description}</p>

                            <div className="flex items-center justify-center gap-2 mb-6 bg-stone-50 rounded-[20px] py-3">
                                <Star size={18} className="text-brand-500" fill="#f97316" />
                                <span className="text-2xl font-black text-stone-900">{selectedItem.price}</span>
                                <span className="text-sm text-stone-500 font-medium">points</span>
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={confirmPurchase}
                                    className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-4 rounded-[20px] shadow-[0_8px_30px_rgb(232,106,32,0.25)] active:scale-95 transition-all uppercase tracking-wider text-sm flex items-center justify-center gap-2"
                                >
                                    <Sparkles size={16} />
                                    <span>Unlock for {selectedItem.price} pts</span>
                                </button>
                                <button
                                    onClick={() => setShowPurchaseConfirm(false)}
                                    className="w-full text-stone-500 font-bold py-3 hover:text-stone-700 transition-colors active:scale-95 text-sm"
                                >
                                    Cancel
                                </button>
                            </div>

                            {/* Points remaining preview */}
                            <p className="text-[11px] text-stone-400 mt-2">
                                You&apos;ll have {(availablePoints - selectedItem.price).toLocaleString()} pts remaining
                            </p>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ═══════════════════════════════════ */}
            {/* Purchase Success — "Equip Now?" Modal */}
            {/* ═══════════════════════════════════ */}
            <AnimatePresence>
                {showPurchaseSuccess && justPurchasedItem && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={handleSkipEquip}
                        />
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                            className="bg-white rounded-[20px] p-6 w-full max-w-sm shadow-2xl relative z-10 text-center"
                        >
                            {/* Celebration emoji */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.15, type: 'spring', damping: 10 }}
                                className="w-16 h-16 mx-auto mb-3 rounded-full bg-emerald-50 flex items-center justify-center"
                            >
                                <PartyPopper size={32} className="text-emerald-500" />
                            </motion.div>

                            <h2 className="text-xl font-black text-gray-900 tracking-tight mb-1">Unlocked!</h2>
                            <p className="text-sm text-stone-500 mb-4">
                                <span className="font-bold text-stone-700">{justPurchasedItem.name}</span> is now yours!
                            </p>

                            {/* Preview — celebrate pose, unblurred */}
                            <div className="relative w-48 h-48 mx-auto mb-5 rounded-[20px] overflow-hidden bg-gradient-to-b from-brand-50 to-stone-100 border border-brand-100">
                                <Image
                                    src={justPurchasedItem.gabiCelebrateImage}
                                    alt={justPurchasedItem.name}
                                    fill
                                    unoptimized
                                    className="object-contain p-1"
                                />
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleEquipAfterPurchase}
                                    className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-4 rounded-[20px] shadow-[0_8px_30px_rgb(232,106,32,0.25)] active:scale-95 transition-all uppercase tracking-wider text-sm flex items-center justify-center gap-2"
                                >
                                    <span>Equip Now</span>
                                </button>
                                <button
                                    onClick={handleSkipEquip}
                                    className="w-full text-stone-500 font-bold py-3 hover:text-stone-700 transition-colors active:scale-95 text-sm"
                                >
                                    Maybe Later
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
