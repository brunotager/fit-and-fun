import React from 'react';
import { Wifi, Battery, Signal } from 'lucide-react';

export function StatusBar() {
    return (
        <div className="w-full h-12 flex justify-between items-center px-6 pt-2 bg-transparent z-50 text-gray-900 select-none">
            {/* Time */}
            <div className="font-semibold text-[15px] tracking-tight ml-2">
                9:41
            </div>

            {/* Status Icons */}
            <div className="flex items-center gap-1.5 mr-1">
                <Signal size={18} fill="currentColor" strokeWidth={0} className="text-gray-900" />
                <Wifi size={18} strokeWidth={2.5} />
                <div className="pl-0.5">
                    <Battery size={22} className="text-gray-900 opacity-40" />
                    {/* Note: Lucide Battery doesn't support fill capacity easily without SVG manipulation, keeping schematic */}
                </div>
            </div>
        </div>
    );
}
