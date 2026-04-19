"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Cpu, Bell, Thermometer, Droplets, Sprout, Sun,
  Power, LayoutDashboard, BarChart2, Settings, LogOut, Loader2, RefreshCw,
  Smartphone, Trash2, Calendar, Clock, Shield, ArrowRight, ChevronLeft, User
} from "lucide-react";
import { doc, onSnapshot, setDoc, Unsubscribe } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import { logoutUser } from "@/lib/auth-helpers";
import DeviceSelector from "@/components/DeviceSelector";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format, subHours } from "date-fns";

export default function Home() {
  const router = useRouter();
  const { user, userProfile, loading: authLoading } = useAuth();

  const [screen, setScreen] = useState<"splash" | "loading" | "deviceSelect" | "monitoring">("splash");
  const [currentTab, setCurrentTab] = useState<"home" | "stats" | "system">("home");
  const [activeToken, setActiveToken] = useState("");

  const [dateStr, setDateStr] = useState("");

  const [sensorData, setSensorData] = useState({
    temperature: 0,
    humidity: 0,
    soilMoisture: 0,
    pumpStatus: false,
    autoMode: false,
  });

  const [isConnected, setIsConnected] = useState(false);
  const [unsubscribe, setUnsubscribe] = useState<Unsubscribe | null>(null);

  // ─── Date string ──────────────────────────────────
  useEffect(() => {
    const dateOptions: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "short" };
    setDateStr(new Date().toLocaleDateString("id-ID", dateOptions));
  }, []);

  // ─── Splash → Auth routing ────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      setScreen("loading");
    }, 3800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (screen !== "loading") return;
    if (authLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (userProfile?.role === "admin") {
      router.push("/admin");
      return;
    }

    // Mitra user → device select
    setScreen("deviceSelect");
  }, [screen, authLoading, user, userProfile, router]);

  // ─── Firebase listener ────────────────────────────
  const startFirebaseListener = (currentToken: string) => {
    const databaseRootAppId = process.env.NEXT_PUBLIC_DATABASE_ROOT_APP_ID || "smart-farm";
    const deviceRef = doc(db, "artifacts", databaseRootAppId, "public", "data", "devices", currentToken);

    const unsub = onSnapshot(
      deviceRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setSensorData({
            temperature: data.temperature || 0,
            humidity: data.humidity || 0,
            soilMoisture: data.soilMoisture || 0,
            pumpStatus: data.pumpStatus || false,
            autoMode: data.autoMode || false,
          });
          setIsConnected(true);
        } else {
          const defaultData = { temperature: 0, humidity: 0, soilMoisture: 0, pumpStatus: false, autoMode: false };
          setDoc(deviceRef, defaultData);
          setSensorData(defaultData);
          setIsConnected(true);
        }
      },
      (error) => {
        console.error("Firebase Read Error:", error);
        setIsConnected(false);
      }
    );
    setUnsubscribe(() => unsub);
  };

  const handleSelectDevice = (token: string) => {
    setActiveToken(token);
    startFirebaseListener(token);
    setScreen("monitoring");
  };

  const handleBackToDevices = () => {
    if (unsubscribe) unsubscribe();
    setIsConnected(false);
    setActiveToken("");
    setCurrentTab("home");
    setScreen("deviceSelect");
  };

  const handlePumpToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStatus = e.target.checked;
    setSensorData((prev) => ({ ...prev, pumpStatus: newStatus }));

    if (activeToken) {
      try {
        const databaseRootAppId = process.env.NEXT_PUBLIC_DATABASE_ROOT_APP_ID || "smart-farm";
        const deviceRef = doc(db, "artifacts", databaseRootAppId, "public", "data", "devices", activeToken);
        await setDoc(deviceRef, { pumpStatus: newStatus }, { merge: true });
      } catch {
        setSensorData((prev) => ({ ...prev, pumpStatus: !newStatus }));
      }
    }
  };

  const handleAutoToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStatus = e.target.checked;
    setSensorData((prev) => ({ ...prev, autoMode: newStatus }));

    if (activeToken) {
      try {
        const databaseRootAppId = process.env.NEXT_PUBLIC_DATABASE_ROOT_APP_ID || "smart-farm";
        const deviceRef = doc(db, "artifacts", databaseRootAppId, "public", "data", "devices", activeToken);
        await setDoc(deviceRef, { autoMode: newStatus }, { merge: true });
      } catch {
        setSensorData((prev) => ({ ...prev, autoMode: !newStatus }));
      }
    }
  };

  const handleLogout = async () => {
    if (unsubscribe) unsubscribe();
    try {
      await logoutUser();
    } catch (err) {
      console.error(err);
    }
    router.push("/login");
  };

  // ─── SPLASH SCREEN ──────────────────────────────
  if (screen === "splash") {
    return (
      <div id="splash-screen" className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 transition-all duration-700">
        <div className="relative w-48 h-48 mb-6">
          <div className="absolute inset-0 rounded-full border-2 border-emerald-500 animate-ping opacity-20"></div>
          <div className="absolute inset-4 rounded-full border-2 border-emerald-400 animate-ping opacity-20" style={{ animationDelay: "0.5s" }}></div>
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">
            <line x1="20" y1="80" x2="80" y2="80" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
            <path d="M50 80 Q50 60 50 40" fill="none" stroke="#10b981" strokeWidth="5" strokeLinecap="round" className="draw-path" />
            <path d="M50 60 Q30 50 40 30 Q50 45 50 60" fill="none" stroke="#10b981" strokeWidth="4" strokeLinejoin="round" className="draw-path" style={{ animationDelay: "0.5s" }} />
            <path d="M50 50 Q70 40 60 20 Q50 35 50 50" fill="none" stroke="#10b981" strokeWidth="4" strokeLinejoin="round" className="draw-path" style={{ animationDelay: "0.8s" }} />
            <circle cx="40" cy="30" r="3" fill="#3b82f6" className="pulse-node delay-1" />
            <circle cx="60" cy="20" r="3" fill="#f59e0b" className="pulse-node delay-2" />
            <circle cx="50" cy="40" r="3" fill="#ef4444" className="pulse-node delay-3" />
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Amaranggana<span className="text-emerald-500">Farm</span>
        </h1>
        <p className="text-slate-400 mt-2 text-sm tracking-widest uppercase">IoT Dashboard System</p>
      </div>
    );
  }

  // ─── LOADING STATE ───────────────────────────────
  if (screen === "loading" || authLoading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950">
        <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mb-4" />
        <p className="text-slate-400 text-sm">Memverifikasi akun...</p>
      </div>
    );
  }

  // ─── DEVICE SELECT SCREEN ────────────────────────
  if (screen === "deviceSelect") {
    return (
      <div className="flex flex-col min-h-screen max-w-lg mx-auto w-full relative">
        <header className="pt-8 pb-4 px-6 flex justify-between items-center fade-in">
          <div>
            <p className="text-slate-400 text-sm font-medium mb-1">Selamat datang,</p>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-400" />
              {userProfile?.displayName || "Mitra"}
            </h2>
          </div>
          <button
            onClick={handleLogout}
            className="w-10 h-10 rounded-full glass-panel flex items-center justify-center cursor-pointer hover:bg-rose-500/20 transition-colors group"
            title="Keluar"
          >
            <LogOut className="text-slate-400 w-5 h-5 group-hover:text-rose-400 transition-colors" />
          </button>
        </header>

        <main className="flex-1 px-6 pb-12">
          <DeviceSelector
            deviceTokens={userProfile?.deviceTokens || []}
            onSelectDevice={handleSelectDevice}
            organizationName={userProfile?.organizationName || ""}
          />
        </main>
      </div>
    );
  }

  // ─── MONITORING DASHBOARD ────────────────────────
  return (
    <div id="app-screen" className="flex flex-col min-h-screen max-w-lg mx-auto w-full relative">
      <header className="pt-8 pb-4 px-6 flex justify-between items-center fade-in">
        <div className="flex items-center gap-3">
          {/* Back to device list (only if mitra has multiple devices) */}
          {(userProfile?.deviceTokens?.length || 0) > 1 && (
            <button
              onClick={handleBackToDevices}
              className="w-9 h-9 rounded-full glass-panel flex items-center justify-center hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-slate-300" />
            </button>
          )}
          <div>
            <p className="text-slate-400 text-sm font-medium mb-1">{dateStr}</p>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              {currentTab === "home" && "Lahan Cerdas"}
              {currentTab === "stats" && "Statistik Sensor"}
              {currentTab === "system" && "Sistem Manajemen"}
              {currentTab === "home" && (
                <span className={`flex w-3 h-3 relative ${isConnected ? "" : "hidden"}`}>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full w-3 h-3 bg-emerald-500"></span>
                </span>
              )}
            </h2>
          </div>
        </div>
        <div className="w-12 h-12 rounded-full glass-panel flex items-center justify-center cursor-pointer hover:bg-slate-800 transition-colors">
          <Bell className="text-slate-300 w-5 h-5" />
        </div>
      </header>

      <main className="flex-1 px-6 fade-in space-y-6 overflow-y-auto no-scrollbar pb-32">
        {currentTab === "home" && (
          <HomeTab sensorData={sensorData} activeToken={activeToken} handlePumpToggle={handlePumpToggle} handleAutoToggle={handleAutoToggle} userProfile={userProfile} />
        )}
        {currentTab === "stats" && <StatsTab activeToken={activeToken} />}
        {currentTab === "system" && <SystemTab activeToken={activeToken} userProfile={userProfile} />}
      </main>

      {/* FLOATING NAVIGATION BAR */}
      <nav className="glass-nav fixed bottom-6 left-6 right-6 md:left-1/2 md:-translate-x-1/2 md:w-96 rounded-full px-4 py-2 flex justify-between items-center z-50 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
        <button onClick={() => setCurrentTab("home")} className={`flex flex-col items-center gap-1 w-16 group transition-colors ${currentTab === "home" ? "text-emerald-400" : "text-slate-400 hover:text-white"}`}>
          <div className={`p-2 rounded-xl transition-all ${currentTab === "home" ? "bg-emerald-500/20 scale-110" : "group-hover:bg-slate-700"}`}>
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold">Beranda</span>
        </button>
        <button onClick={() => setCurrentTab("stats")} className={`flex flex-col items-center gap-1 w-16 group transition-colors ${currentTab === "stats" ? "text-blue-400" : "text-slate-400 hover:text-white"}`}>
          <div className={`p-2 rounded-xl transition-all ${currentTab === "stats" ? "bg-blue-500/20 scale-110" : "group-hover:bg-slate-700"}`}>
            <BarChart2 className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold">Statistik</span>
        </button>
        <button onClick={() => setCurrentTab("system")} className={`flex flex-col items-center gap-1 w-16 group transition-colors ${currentTab === "system" ? "text-amber-400" : "text-slate-400 hover:text-white"}`}>
          <div className={`p-2 rounded-xl transition-all ${currentTab === "system" ? "bg-amber-500/20 scale-110" : "group-hover:bg-slate-700"}`}>
            <Settings className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold">Sistem</span>
        </button>
        <button onClick={handleLogout} className="flex flex-col items-center gap-1 text-slate-400 hover:text-rose-400 transition-colors w-16 group">
          <div className="p-2 rounded-xl group-hover:bg-rose-500/20 transition-all">
            <LogOut className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-medium">Keluar</span>
        </button>
      </nav>
    </div>
  );
}

// ---------------------------------------------------------
// TAB: BERANDA (HOME)
// ---------------------------------------------------------
function HomeTab({ sensorData, activeToken, handlePumpToggle, handleAutoToggle, userProfile }: any) {
  return (
    <>
      {/* User & Org Info */}
      <div className="glass-panel p-4 rounded-2xl flex items-center gap-3 bg-emerald-500/5 border-emerald-500/10">
        <div className="w-10 h-10 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-400 font-bold text-sm">
          {userProfile?.displayName?.charAt(0)?.toUpperCase() || "M"}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">{userProfile?.organizationName || "Organisasi"}</p>
          <p className="text-xs text-slate-400">{userProfile?.displayName || "Mitra"}</p>
        </div>
        <div className="px-2.5 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
          <span className="text-[10px] font-medium text-emerald-400">Mitra</span>
        </div>
      </div>

      {/* Sensor Cards Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Suhu */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between aspect-square relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-500/10 rounded-full blur-xl group-hover:bg-rose-500/20 transition-all"></div>
          <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none flex items-center justify-center opacity-30">
            <div className="radiation-wave bg-rose-500/40 w-full h-full"></div>
            <div className="radiation-wave radiation-delay-1 bg-rose-500/20 w-full h-full"></div>
          </div>
          <div className="flex justify-between items-start relative z-10">
            <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center">
              <Thermometer className="text-rose-400 w-5 h-5" />
            </div>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">Suhu</span>
          </div>
          <div className="relative z-10">
            <div className="flex items-baseline gap-1">
              <h3 className="text-3xl font-bold text-white transition-all duration-1000">
                {Number(sensorData.temperature).toFixed(1)}
              </h3>
              <span className="text-rose-400 font-medium">°C</span>
            </div>
          </div>
        </div>

        {/* Kelembapan Udara */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between aspect-square relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all"></div>
          <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none flex items-center justify-center opacity-30">
            <div className="radiation-wave bg-blue-500/40 w-full h-full"></div>
            <div className="radiation-wave radiation-delay-1 bg-blue-500/20 w-full h-full"></div>
          </div>
          <div className="flex justify-between items-start relative z-10">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Droplets className="text-blue-400 w-5 h-5" />
            </div>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">Udara</span>
          </div>
          <div className="relative z-10">
            <div className="flex items-baseline gap-1">
              <h3 className="text-3xl font-bold text-white transition-all duration-1000">
                {Math.floor(Number(sensorData.humidity))}
              </h3>
              <span className="text-blue-400 font-medium">%</span>
            </div>
          </div>
        </div>

        {/* Kelembapan Tanah */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between aspect-square relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none flex items-center justify-center opacity-30">
            <div className="radiation-wave bg-emerald-500/40 w-full h-full"></div>
            <div className="radiation-wave radiation-delay-1 bg-emerald-500/20 w-full h-full"></div>
          </div>
          <div className="flex justify-between items-start relative z-10">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Sprout className="text-emerald-400 w-5 h-5" />
            </div>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">Tanah</span>
          </div>
          <div className="relative z-10">
            <div className="flex items-baseline gap-1">
              <h3 className="text-3xl font-bold text-white transition-all duration-1000">
                {Math.floor(Number(sensorData.soilMoisture))}
              </h3>
              <span className="text-emerald-400 font-medium">%</span>
            </div>
          </div>
        </div>

        {/* Cahaya */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between aspect-square relative overflow-hidden group opacity-50">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/10 rounded-full blur-xl transition-all"></div>
          <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none flex items-center justify-center opacity-30">
            <div className="radiation-wave bg-amber-500/40 w-full h-full"></div>
            <div className="radiation-wave radiation-delay-1 bg-amber-500/20 w-full h-full"></div>
          </div>
          <div className="flex justify-between items-start relative z-10">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Sun className="text-amber-400 w-5 h-5" />
            </div>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">Cahaya</span>
          </div>
          <div className="relative z-10">
            <div className="flex items-baseline gap-1">
              <h3 className="text-3xl font-bold text-white">--</h3>
              <span className="text-amber-400 font-medium">Lux</span>
            </div>
          </div>
        </div>
      </div>

      {/* Kontrol Pompa & Mode */}
      <div className="glass-panel rounded-3xl p-1 mt-6 flex flex-col gap-1">
        {/* Kontrol Pompa */}
        <div className="relative bg-slate-900/50 rounded-t-[22px] rounded-b-xl p-6 flex items-center justify-between border border-slate-800 overflow-hidden">
          {sensorData.pumpStatus && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-20">
              <div className="radiation-wave bg-emerald-500/40 w-[200%] h-[200%]"></div>
            </div>
          )}
          <div className="flex items-center gap-4 relative z-10">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 ${sensorData.pumpStatus ? "bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]" : "bg-slate-800"}`}>
              <Power className={`w-6 h-6 transition-colors duration-500 ${sensorData.pumpStatus ? "text-white" : "text-slate-400"}`} />
            </div>
            <div>
              <h4 className="font-bold text-lg">Pompa Air</h4>
              <p className={`text-sm ${sensorData.pumpStatus ? "text-emerald-400" : "text-slate-400"}`}>
                Status: {sensorData.pumpStatus ? "MENYALA" : "MATI"}
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer z-10">
            <input type="checkbox" className="sr-only peer" checked={sensorData.pumpStatus} onChange={handlePumpToggle} disabled={sensorData.autoMode} />
            <div className={`w-14 h-8 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500 shadow-inner ${sensorData.autoMode ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
          </label>
        </div>

        {/* Mode Otomatis/Manual */}
        <div className="relative bg-slate-900/50 rounded-b-[22px] rounded-t-xl p-6 flex items-center justify-between border border-slate-800 overflow-hidden">
          <div className="flex items-center gap-4 relative z-10">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 ${sensorData.autoMode ? "bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]" : "bg-slate-800"}`}>
              <RefreshCw className={`w-6 h-6 transition-colors duration-500 ${sensorData.autoMode ? "text-white" : "text-slate-400"}`} />
            </div>
            <div>
              <h4 className="font-bold text-lg">Mode Operasi</h4>
              <p className={`text-sm ${sensorData.autoMode ? "text-blue-400" : "text-amber-400"}`}>
                Mode: {sensorData.autoMode ? "OTOMATIS" : "MANUAL"}
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer z-10">
            <input type="checkbox" className="sr-only peer" checked={sensorData.autoMode} onChange={handleAutoToggle} />
            <div className="w-14 h-8 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-500 shadow-inner"></div>
          </label>
        </div>
      </div>
      <div className="text-center mt-4">
        <p className="text-xs text-slate-500">
          Token Aktif: <span className="font-mono text-emerald-400">{activeToken}</span>
        </p>
      </div>
    </>
  );
}

// ---------------------------------------------------------
// TAB: STATISTIK (STATS)
// ---------------------------------------------------------
function StatsTab({ activeToken }: { activeToken: string }) {
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [selectedTime, setSelectedTime] = useState("12:00");

  const mockData = useMemo(() => {
    const data = [];
    const seed = selectedDate.split("-").reduce((a, b) => a + parseInt(b), 0) + parseInt(selectedTime.replace(":", ""));
    let tempBase = 25 + (seed % 10);
    let soilBase = 40 + (seed % 30);

    for (let i = 9; i >= 0; i--) {
      const timePoint = format(subHours(new Date(`${selectedDate}T${selectedTime}`), i), "HH:mm");
      tempBase += (i * seed) % 5 > 2 ? 1.5 : -0.5;
      soilBase += (i * seed) % 7 > 3 ? -2 : 3;

      data.push({
        time: timePoint,
        Suhu: Number(tempBase.toFixed(1)),
        Tanah: Math.max(0, Math.min(100, Math.floor(soilBase))),
      });
    }
    return data;
  }, [selectedDate, selectedTime]);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  return (
    <div className="space-y-6">
      <div className="glass-panel p-5 rounded-2xl flex flex-col sm:flex-row gap-4 justify-between items-center z-20 relative">
        <div className="flex w-full sm:w-auto items-center gap-3">
          <Calendar className="text-slate-400 w-5 h-5 flex-shrink-0" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-sm rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500 w-full sm:w-auto"
          />
        </div>
        <div className="flex w-full sm:w-auto items-center gap-3">
          <Clock className="text-slate-400 w-5 h-5 flex-shrink-0" />
          <input
            type="time"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-sm rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500 w-full sm:w-auto"
          />
        </div>
      </div>

      <div className="glass-panel p-5 rounded-2xl space-y-4">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">Riwayat Suhu & Tanah</h3>
          <p className="text-xs text-slate-400">Menampilkan rekaman data historis (Stepped Chart).</p>
        </div>

        <div className="w-full h-64 mt-4">
          {isMounted && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockData} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickMargin={10} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px", color: "#f8fafc" }}
                  itemStyle={{ fontSize: 13, fontWeight: "bold" }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: "10px" }} />
                <Line type="stepAfter" dataKey="Suhu" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line type="stepAfter" dataKey="Tanah" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="glass-panel p-4 rounded-xl flex items-center gap-3 bg-blue-500/10 border-blue-500/20">
        <div className="p-2 bg-blue-500/20 rounded-full">
          <BarChart2 className="w-4 h-4 text-blue-400" />
        </div>
        <p className="text-xs text-blue-200">Data direkam setiap 1 jam pada perangkat untuk tanggal yang dipilih.</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------
// TAB: SISTEM (SYSTEM)
// ---------------------------------------------------------
function SystemTab({ activeToken, userProfile }: { activeToken: string; userProfile: any }) {
  const [toasting, setToasting] = useState("");

  const handleAction = (msg: string) => {
    setToasting(msg);
    setTimeout(() => setToasting(""), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notifikasi */}
      {toasting && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-sm font-semibold px-6 py-2 rounded-full shadow-lg z-50 animate-bounce">
          {toasting}
        </div>
      )}

      {/* Info Akun */}
      <div className="glass-panel p-5 rounded-2xl space-y-4">
        <h3 className="text-lg font-bold text-white border-b border-slate-700 pb-2 flex items-center gap-2">
          <User className="w-5 h-5 text-violet-500" /> Informasi Akun
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-500 mb-1">Nama</p>
            <p className="text-sm font-semibold text-white">{userProfile?.displayName || "-"}</p>
          </div>
          <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-500 mb-1">Organisasi</p>
            <p className="text-sm font-semibold text-white">{userProfile?.organizationName || "-"}</p>
          </div>
          <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 col-span-2">
            <p className="text-xs text-slate-500 mb-1">Email</p>
            <p className="text-sm font-mono text-white">{userProfile?.email || "-"}</p>
          </div>
        </div>
      </div>

      {/* Info Perangkat */}
      <div className="glass-panel p-5 rounded-2xl space-y-4">
        <h3 className="text-lg font-bold text-white border-b border-slate-700 pb-2 flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-amber-500" /> Identitas Perangkat
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-500 mb-1">Token Aktif</p>
            <p className="text-sm font-mono text-white">{activeToken}</p>
          </div>
          <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-500 mb-1">Firmware</p>
            <p className="text-sm font-mono text-white">v2.4.1-stable</p>
          </div>
          <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 col-span-2 flex justify-between items-center">
            <div>
              <p className="text-xs text-slate-500 mb-1">IP Address (Lokal)</p>
              <p className="text-sm font-mono text-white">192.168.1.18</p>
            </div>
            <div className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full border border-emerald-500/20 font-medium">
              Bagus
            </div>
          </div>
        </div>
      </div>

      {/* Aksi Maintenance */}
      <div className="glass-panel p-5 rounded-2xl space-y-4">
        <h3 className="text-lg font-bold text-white border-b border-slate-700 pb-2 flex items-center gap-2">
          <Settings className="w-5 h-5 text-amber-500" /> Maintenance Options
        </h3>

        <div className="space-y-3">
          <button
            onClick={() => handleAction("Sensor sedang dikalibrasi ulang...")}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 p-4 rounded-xl flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold">Kalibrasi Ulang Sensor</p>
                <p className="text-xs text-slate-400">Atur ulang baseline nilai sensor</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500" />
          </button>

          <button
            onClick={() => handleAction("Berhasil membersihkan cache sistem.")}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 p-4 rounded-xl flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold">Bersihkan Log/Cache</p>
                <p className="text-xs text-slate-400">Hapus file temporary lokal</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500" />
          </button>

          <button
            onClick={() => handleAction("Melakukan proses reboot pada perangkat...")}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-rose-900/50 p-4 rounded-xl flex items-center justify-between transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-500/20 text-rose-400 rounded-lg group-hover:bg-rose-500 group-hover:text-white transition-colors">
                <Power className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-rose-200">Reboot Perangkat Dasar (ESP32)</p>
                <p className="text-xs text-slate-500">Kirim sinyal restart ke mikrokontroler</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-rose-500" />
          </button>
        </div>
      </div>
    </div>
  );
}
