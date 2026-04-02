'use client';
import { useFitFun } from "@/context/FitFunContext";

export default function SettingsPage() {
    const { resetProgress } = useFitFun();

    return (
        <div className="flex-1 flex flex-col p-6 bg-white">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>

            <div className="mt-8">
                <button
                    onClick={resetProgress}
                    className="w-full border border-red-200 text-red-500 p-4 rounded-xl hover:bg-red-50 transition-colors font-medium"
                >
                    Reset Progress
                </button>
            </div>
        </div>
    )
}
