import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const TermsModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm z-[100]" 
                    />
                    
                    {/* Modal Content */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                        animate={{ opacity: 1, scale: 1, y: 0 }} 
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="absolute z-[101] bottom-0 left-0 w-full bg-[#FFFDF7] rounded-t-[32px] p-8 shadow-[0_-10px_40px_rgba(0,0,0,0.15)] flex flex-col max-h-[85vh] overflow-hidden"
                    >
                        <div className="w-12 h-1.5 bg-stone-200 rounded-full mx-auto mb-6 shrink-0" />
                        
                        <h2 className="text-[22px] font-black text-stone-900 mb-6 uppercase tracking-tight text-center">
                            Terms & Conditions
                        </h2>
                        
                        <div className="text-stone-600 space-y-5 mb-8 text-[15px] leading-relaxed overflow-y-auto custom-scrollbar pr-2 pb-4 flex-1 h-0">
                            <div>
                                <strong className="text-stone-800 text-base mb-1 block">1. Have Fun (Mandatory)</strong>
                                <p>By using this app, you legally agree to try your best and not take yourself too seriously. Sweating is required, groaning is optional.</p>
                            </div>
                            
                            <div>
                                <strong className="text-stone-800 text-base mb-1 block">2. Coach Gabi is infallible</strong>
                                <p>If the app tells you to do 5 more burpees, you do 5 more burpees. (Just kidding, always listen to your body first! Consult a doctor if you feel pain.)</p>
                            </div>
                            
                            <div>
                                <strong className="text-stone-800 text-base mb-1 block">3. Data Privacy</strong>
                                <p>We strictly use your height, weight, and tears to mathematically create totally rad workouts. We do not sell your soul or your step count to third parties.</p>
                            </div>
                            
                            <div>
                                <strong className="text-stone-800 text-base mb-1 block">4. Age Restriction</strong>
                                <p>You must be 13 or older (or accompanied by an extremely athletic golden retriever) to use this product. COPPA strictly enforced.</p>
                            </div>
                        </div>
                        
                        <button 
                            onClick={onClose}
                            className="w-full bg-[#E56B25] hover:bg-[#c25a1e] text-white font-bold py-4 rounded-full shadow-[0_8px_30px_rgb(229,107,37,0.3)] active:scale-95 transition-all outline-none uppercase tracking-wider text-sm shrink-0"
                        >
                            I Agree (Let's Go!)
                        </button>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
