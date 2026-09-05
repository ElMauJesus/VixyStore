import React from 'react';
import { Wifi, BatteryMedium, Signal } from 'lucide-react';

interface PhoneFrameProps {
  appName: string;
  appBadgeColor?: string;
  children: React.ReactNode;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  appName,
  appBadgeColor = 'bg-amber-500',
  children
}) => {
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="w-full max-w-[400px] h-[810px] bg-neutral-950 rounded-[44px] p-3 shadow-2xl border-4 border-neutral-800 flex flex-col relative mx-auto select-none">
      {/* Outer rim gloss */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-4 bg-neutral-800 rounded-b-xl z-30 flex items-center justify-center">
        <div className="w-3 h-3 rounded-full bg-neutral-950 border border-neutral-700/80 mr-3" />
        <div className="w-12 h-1 bg-neutral-700 rounded-full" />
      </div>

      {/* Screen container */}
      <div className="w-full h-full bg-neutral-100 dark:bg-neutral-900 rounded-[34px] overflow-hidden flex flex-col relative border border-neutral-800/40">
        {/* Android Status Bar */}
        <div className="h-7 w-full bg-neutral-950 text-neutral-300 px-5 flex items-center justify-between text-[11px] font-medium shrink-0 z-20">
          <span>{currentTime}</span>
          <div className="flex items-center gap-1.5 text-neutral-400">
            <Signal className="w-3 h-3 text-neutral-200" />
            <span className="text-[10px] font-bold text-neutral-300">4G LTE</span>
            <Wifi className="w-3 h-3 text-neutral-200" />
            <BatteryMedium className="w-3.5 h-3.5 text-emerald-400" />
          </div>
        </div>

        {/* App Title Header */}
        <div className="h-10 px-4 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between shrink-0 z-10 text-white">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${appBadgeColor} animate-pulse`} />
            <span className="text-xs font-bold tracking-tight font-mono">{appName}</span>
          </div>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
            Android Native
          </span>
        </div>

        {/* App Viewport Content */}
        <div className="flex-1 overflow-y-auto relative flex flex-col bg-neutral-50 dark:bg-neutral-950">
          {children}
        </div>

        {/* Android Navigation Bar */}
        <div className="h-5 bg-neutral-950 flex items-center justify-center shrink-0 z-20">
          <div className="w-28 h-1 bg-neutral-600 rounded-full" />
        </div>
      </div>
    </div>
  );
};
