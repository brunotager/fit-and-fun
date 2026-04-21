'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Activity, CheckCircle, RefreshCcw, LogOut } from 'lucide-react';

interface StatsData {
  users: any[];
  workouts: any[];
  stats: {
    totalUsers: number;
    totalWorkouts: number;
    completionRate: number;
  }
}

export default function AdminDashboard() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  const fetchStats = async () => {
    setLoading(true);
    const secret = sessionStorage.getItem('admin_secret');
    if (!secret) {
      router.push('/admin/login');
      return;
    }

    try {
      const res = await fetch(`/api/admin/stats?secret=${encodeURIComponent(secret)}`);
      if (res.status === 401) {
        sessionStorage.removeItem('admin_secret');
        router.push('/admin/login');
        return;
      }
      
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-[#F4F4F5] flex items-center justify-center">
        <div className="animate-spin text-brand-500"><RefreshCcw size={32} /></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F4F5] pb-10">
      {/* Header */}
      <div className="bg-white px-6 py-4 shadow-sm flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-500 rounded-lg flex items-center justify-center">
            <Activity className="text-white" size={20} strokeWidth={2.5} />
          </div>
          <h1 className="text-xl font-black text-gray-900 tracking-tight uppercase">Fit&Fun Admin</h1>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={fetchStats} className="text-stone-400 hover:text-brand-500 transition-colors p-2">
            <RefreshCcw size={20} className={loading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={() => { sessionStorage.removeItem('admin_secret'); router.push('/admin/login'); }}
            className="flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-600 px-4 py-2 rounded-full font-bold text-sm transition-colors"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-8">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl font-bold mb-8 border border-red-100">
            Error: {error}
          </div>
        )}

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                <Users size={24} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-sm font-bold text-stone-400 uppercase tracking-wider">Total Users</p>
                <h2 className="text-4xl font-black text-gray-900 tabular-nums">{data?.stats.totalUsers || 0}</h2>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-500 flex items-center justify-center">
                <Activity size={24} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-sm font-bold text-stone-400 uppercase tracking-wider">Workouts Logged</p>
                <h2 className="text-4xl font-black text-gray-900 tabular-nums">{data?.stats.totalWorkouts || 0}</h2>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-green-50 text-green-500 flex items-center justify-center">
                <CheckCircle size={24} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-sm font-bold text-stone-400 uppercase tracking-wider">Timer Finished Rate</p>
                <div className="flex items-baseline gap-1">
                  <h2 className="text-4xl font-black text-gray-900 tabular-nums">{data?.stats.completionRate || 0}</h2>
                  <span className="text-xl font-bold text-gray-400">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Users Table */}
          <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden flex flex-col h-[500px]">
            <div className="p-6 border-b border-stone-100 shrink-0">
              <h3 className="text-lg font-black text-gray-900 uppercase">Recent Users</h3>
              <p className="text-sm font-medium text-stone-500">Track where users are dropping off</p>
            </div>
            <div className="flex-1 overflow-auto p-0">
              <table className="w-full text-left border-collapse">
                <thead className="bg-stone-50 sticky top-0">
                  <tr>
                    <th className="py-3 px-6 text-xs font-bold text-stone-400 uppercase tracking-wider">Name</th>
                    <th className="py-3 px-6 text-xs font-bold text-stone-400 uppercase tracking-wider">Goal</th>
                    <th className="py-3 px-6 text-xs font-bold text-stone-400 uppercase tracking-wider text-right">Day Reached</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {data?.users.slice(0, 50).map(u => (
                    <tr key={u.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="py-4 px-6 font-bold text-gray-900">{u.name || 'Anonymous'}</td>
                      <td className="py-4 px-6 font-medium text-stone-500 text-sm">{u.fitness_goal || u.goal_type}</td>
                      <td className="py-4 px-6 text-right">
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-stone-100 text-stone-700 font-bold text-sm">
                          Day {u.last_active_day || 1}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!data?.users || data.users.length === 0) && (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-stone-400 font-medium">No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Workouts Table */}
          <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden flex flex-col h-[500px]">
            <div className="p-6 border-b border-stone-100 shrink-0">
              <h3 className="text-lg font-black text-gray-900 uppercase">Recent Workouts</h3>
              <p className="text-sm font-medium text-stone-500">Completed vs Skipped</p>
            </div>
            <div className="flex-1 overflow-auto p-0">
              <table className="w-full text-left border-collapse">
                <thead className="bg-stone-50 sticky top-0">
                  <tr>
                    <th className="py-3 px-6 text-xs font-bold text-stone-400 uppercase tracking-wider">Date</th>
                    <th className="py-3 px-6 text-xs font-bold text-stone-400 uppercase tracking-wider">Type</th>
                    <th className="py-3 px-6 text-xs font-bold text-stone-400 uppercase tracking-wider text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {data?.workouts.slice(0, 50).map(w => (
                    <tr key={w.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="py-4 px-6 font-medium text-stone-600 text-sm">
                        {new Date(w.date).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 font-bold text-gray-900 capitalize">{w.type}</td>
                      <td className="py-4 px-6 text-right">
                        {w.completion_type === 'timer_finished' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-600 font-bold text-xs uppercase tracking-wider border border-green-100">
                            <CheckCircle size={14} /> Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-500 font-bold text-xs uppercase tracking-wider border border-stone-200">
                            Manual End
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {(!data?.workouts || data.workouts.length === 0) && (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-stone-400 font-medium">No workouts found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
