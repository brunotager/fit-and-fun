'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password) {
      // In a real app we'd want server-side session, but for this simple version
      // we store the secret in sessionStorage to pass to our API calls.
      sessionStorage.setItem('admin_secret', password);
      router.push('/admin');
    } else {
      setError('Password is required');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF7] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm text-center border border-stone-100">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase mb-2">Admin Portal</h1>
        <p className="text-stone-500 text-sm mb-8 font-medium">Enter your secret code to view analytics.</p>
        
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            placeholder="Secret Code"
            className="w-full p-4 rounded-xl bg-stone-50 text-center font-bold text-stone-800 placeholder-stone-400 focus:outline-none border-2 border-stone-200 focus:border-brand-500 transition-colors"
            autoFocus
          />
          {error && <p className="text-red-500 text-sm font-bold">{error}</p>}
          <button 
            type="submit"
            className="w-full bg-brand-500 text-white font-bold py-4 rounded-xl hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/20 active:scale-95"
          >
            Access Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}
