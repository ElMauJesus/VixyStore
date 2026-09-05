import React from 'react';
import { Wifi, Battery, Signal } from 'lucide-react';

interface PhoneFrameProps {
  title: string;
  appName: string;
  badgeColor?: string;
  children: React.ReactNode;
  width?: string;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  title,
  appName,
  badgeColor = 'bg-orange-500',
  children,
  width = 'w-[360px]'
}) => {
  return (
    <div className={`flex flex-col items-center shrink-0 ${width} max-w-full`}>
      {/* Device Label */}
      <div className="mb-2 text-center">
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide block">
          {title}
        </span>
        <span className="text-[10px] text-slate-500 font-mono">
          Subdominio: {appName}
        </span>
      </div>

      {/* Phone Shell */}
      <div className="w-full h-[690px] bg-[#0F172A] rounded-[40px] p-3 shadow-2xl border-4 border-slate-800 ring-1 ring-slate-700/50 flex flex-col relative overflow-hidden">
        {/* Dynamic Island / Speaker Notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-950 rounded-full z-40 flex items-center justify-end px-3">
          <div className="w-2 h-2 rounded-full bg-slate-800 border border-slate-700" />
        </div>

        {/* Screen Status Bar */}
        <div className="h-7 w-full px-5 flex items-center justify-between text-[11px] text-slate-400 z-30 shrink-0 font-medium select-none">
          <span>12:45</span>
          <div className="flex items-center gap-1.5 text-slate-300">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <Battery className="w-3.5 h-3.5 text-emerald-400" />
          </div>
        </div>

        {/* App Content Screen Viewport */}
        <div className="flex-1 rounded-[28px] overflow-hidden bg-white dark:bg-slate-900 relative flex flex-col border border-slate-800/40">
          {children}
        </div>

        {/* Home Bar Indicator */}
        <div className="h-4 w-full flex items-center justify-center shrink-0 pt-1">
          <div className="w-28 h-1 bg-slate-700 rounded-full" />
        </div>
      </div>
    </div>
  );
};
