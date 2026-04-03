"use client";

import { Cpu, Wifi, WifiOff, ChevronRight } from "lucide-react";

interface DeviceSelectorProps {
  deviceTokens: string[];
  onSelectDevice: (token: string) => void;
  organizationName: string;
}

export default function DeviceSelector({ deviceTokens, onSelectDevice, organizationName }: DeviceSelectorProps) {
  if (deviceTokens.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6 fade-in">
        <div className="w-24 h-24 bg-slate-800/60 rounded-full flex items-center justify-center mb-6 border border-slate-700/50">
          <WifiOff className="w-10 h-10 text-slate-500" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Belum Ada Perangkat</h2>
        <p className="text-slate-400 text-sm max-w-xs">
          Admin belum menambahkan perangkat ke akun Anda. Hubungi administrator untuk menambahkan device token.
        </p>
        <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 max-w-xs">
          <p className="text-xs text-amber-300">
            💡 Berikan token perangkat ESP32 Anda kepada admin agar bisa di-assign ke akun Anda.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="text-center mb-2">
        <p className="text-slate-400 text-sm">{organizationName}</p>
        <h2 className="text-xl font-bold text-white mt-1">Pilih Perangkat</h2>
        <p className="text-slate-500 text-xs mt-1">
          {deviceTokens.length} perangkat tersedia
        </p>
      </div>

      <div className="space-y-3">
        {deviceTokens.map((token, index) => (
          <button
            key={token}
            onClick={() => onSelectDevice(token)}
            className="w-full glass-panel p-5 rounded-2xl flex items-center justify-between group hover:border-emerald-500/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors relative">
                <Cpu className="w-6 h-6 text-emerald-400" />
                <span className="absolute -top-1 -right-1 flex w-3 h-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full w-3 h-3 bg-emerald-500"></span>
                </span>
              </div>
              <div className="text-left">
                <p className="font-semibold text-white text-sm group-hover:text-emerald-300 transition-colors">
                  Perangkat {index + 1}
                </p>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{token}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <Wifi className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] font-medium text-emerald-400">Online</span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
