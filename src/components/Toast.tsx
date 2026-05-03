'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  text: string;
  type: 'error' | 'success';
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg border backdrop-blur-sm ${
        toast.type === 'error'
          ? 'bg-red-50/95 border-red-100 text-red-700'
          : 'bg-green-50/95 border-green-100 text-green-700'
      }`}
    >
      {toast.type === 'error' ? (
        <AlertTriangle size={18} className="shrink-0" />
      ) : (
        <CheckCircle size={18} className="shrink-0" />
      )}
      <span className="text-sm font-medium flex-1">{toast.text}</span>
      <button onClick={() => onDismiss(toast.id)} className="shrink-0 p-1 rounded-full hover:bg-black/5">
        <X size={14} />
      </button>
    </motion.div>
  );
}
