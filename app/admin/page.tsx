"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import {
  getAllMitra,
  assignDeviceToUser,
  removeDeviceFromUser,
  adminRegisterMitra,
} from "@/lib/auth-helpers";
import {
  Shield,
  Users,
  Cpu,
  Plus,
  Trash2,
  ArrowLeft,
  Loader2,
  Building2,
  Mail,
  Search,
  ChevronDown,
  ChevronUp,
  X,
  CheckCircle,
  AlertTriangle,
  Lock,
} from "lucide-react";

interface MitraUser {
  uid: string;
  email: string;
  displayName: string;
  organizationName: string;
  deviceTokens: string[];
  createdAt: string;
  [key: string]: any;
}

export default function AdminPage() {
  const router = useRouter();
  const { user, userProfile, loading } = useAuth();
  const [mitraList, setMitraList] = useState<MitraUser[]>([]);
  const [loadingMitra, setLoadingMitra] = useState(true);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Assign device modal state
  const [assignModal, setAssignModal] = useState<{ open: boolean; userId: string; userName: string }>({
    open: false,
    userId: "",
    userName: "",
  });
  const [newDeviceToken, setNewDeviceToken] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Register Mitra modal state
  const [registerModal, setRegisterModal] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    displayName: "",
    organizationName: "",
    email: "",
    password: "",
  });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState("");

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchMitra = useCallback(async () => {
    try {
      const data = await getAllMitra();
      setMitraList(data as MitraUser[]);
    } catch (err) {
      console.error("Error fetching mitra:", err);
    } finally {
      setLoadingMitra(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && (!user || userProfile?.role !== "admin")) {
      router.push("/");
      return;
    }
    if (userProfile?.role === "admin") {
      fetchMitra();
    }
  }, [user, userProfile, loading, router, fetchMitra]);

  const handleAssignDevice = async () => {
    const token = newDeviceToken.trim();
    if (!token) return;

    setAssignLoading(true);
    try {
      await assignDeviceToUser(assignModal.userId, token);
      showToast(`Device "${token}" berhasil di-assign ke ${assignModal.userName}`);
      setAssignModal({ open: false, userId: "", userName: "" });
      setNewDeviceToken("");
      await fetchMitra();
    } catch (err) {
      console.error(err);
      showToast("Gagal assign device. Coba lagi.", "error");
    } finally {
      setAssignLoading(false);
    }
  };

  const handleRegisterMitra = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError("");
    if (!registerForm.displayName.trim() || !registerForm.organizationName.trim() || !registerForm.email.trim() || !registerForm.password.trim()) {
      setRegisterError("Semua field wajib diisi.");
      return;
    }
    if (registerForm.password.length < 6) {
      setRegisterError("Password minimal 6 karakter.");
      return;
    }

    setRegisterLoading(true);
    try {
      await adminRegisterMitra(
        registerForm.email.trim(),
        registerForm.password,
        registerForm.displayName.trim(),
        registerForm.organizationName.trim()
      );
      showToast("Mitra berhasil ditambahkan.");
      setRegisterModal(false);
      setRegisterForm({ displayName: "", organizationName: "", email: "", password: "" });
      fetchMitra();
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        setRegisterError("Email sudah terdaftar.");
      } else if (err.code === "auth/weak-password") {
        setRegisterError("Password terlalu lemah. Minimal 6 karakter.");
      } else if (err.code === "auth/invalid-email") {
        setRegisterError("Format email tidak valid.");
      } else if (err.code === "auth/operation-not-allowed") {
        setRegisterError("Email/Password sign-in belum diaktifkan di Firebase Console.");
      } else {
        setRegisterError("Gagal menambahkan mitra. Periksa koneksi.");
      }
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleRemoveDevice = async (userId: string, deviceToken: string, userName: string) => {
    try {
      await removeDeviceFromUser(userId, deviceToken);
      showToast(`Device "${deviceToken}" dihapus dari ${userName}`);
      await fetchMitra();
    } catch (err) {
      console.error(err);
      showToast("Gagal menghapus device.", "error");
    }
  };

  const filteredMitra = mitraList.filter(
    (m) =>
      m.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.organizationName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalDevices = mitraList.reduce((acc, m) => acc + (m.deviceTokens?.length || 0), 0);

  if (loading || (!user && loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-2xl mx-auto px-4 py-6 pb-12 relative">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-[60] px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-semibold animate-bounce ${
            toast.type === "success"
              ? "bg-emerald-500 text-white"
              : "bg-rose-500 text-white"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertTriangle className="w-4 h-4" />
          )}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between mb-8 fade-in">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="w-10 h-10 rounded-full glass-panel flex items-center justify-center hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-300" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-400" />
              Admin Panel
            </h1>
            <p className="text-xs text-slate-400">Kelola mitra & perangkat IoT</p>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6 fade-in">
        <div className="glass-panel p-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/15 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{mitraList.length}</p>
              <p className="text-xs text-slate-400">Total Mitra</p>
            </div>
          </div>
        </div>
        <div className="glass-panel p-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/15 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{totalDevices}</p>
              <p className="text-xs text-slate-400">Total Device</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Actions */}
      <div className="flex gap-2 mb-6 fade-in">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
          <input
            id="admin-search"
            type="text"
            placeholder="Cari mitra..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder-slate-600 text-sm"
          />
        </div>
        <button
          onClick={() => setRegisterModal(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 font-semibold text-sm whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Tambah Mitra</span>
        </button>
      </div>

      {/* Mitra List */}
      <div className="space-y-3 fade-in">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Daftar Mitra ({filteredMitra.length})
        </h2>

        {loadingMitra ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
          </div>
        ) : filteredMitra.length === 0 ? (
          <div className="glass-panel p-8 rounded-2xl text-center">
            <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">
              {searchQuery ? "Tidak ditemukan mitra." : "Belum ada mitra terdaftar."}
            </p>
          </div>
        ) : (
          filteredMitra.map((mitra) => (
            <div key={mitra.uid} className="glass-panel rounded-2xl overflow-hidden transition-all">
              {/* Mitra Header Row */}
              <button
                onClick={() => setExpandedUser(expandedUser === mitra.uid ? null : mitra.uid)}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center border border-violet-500/20 text-violet-400 font-bold text-sm">
                    {mitra.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-white text-sm">{mitra.displayName}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {mitra.organizationName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">
                    {mitra.deviceTokens?.length || 0} device
                  </span>
                  {expandedUser === mitra.uid ? (
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  )}
                </div>
              </button>

              {/* Expanded Details */}
              {expandedUser === mitra.uid && (
                <div className="px-4 pb-4 border-t border-slate-800/50 pt-3 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Mail className="w-3.5 h-3.5" />
                    {mitra.email}
                  </div>

                  {/* Devices */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-300">Perangkat:</p>
                    {mitra.deviceTokens && mitra.deviceTokens.length > 0 ? (
                      mitra.deviceTokens.map((token) => (
                        <div
                          key={token}
                          className="flex items-center justify-between bg-slate-900/50 rounded-xl px-3 py-2.5 border border-slate-800"
                        >
                          <div className="flex items-center gap-2">
                            <Cpu className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-mono text-white">{token}</span>
                          </div>
                          <button
                            onClick={() => handleRemoveDevice(mitra.uid, token, mitra.displayName)}
                            className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors"
                            title="Hapus device"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-600 italic">Belum ada device</p>
                    )}
                  </div>

                  {/* Add Device Button */}
                  <button
                    onClick={() =>
                      setAssignModal({
                        open: true,
                        userId: mitra.uid,
                        userName: mitra.displayName,
                      })
                    }
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-colors text-xs font-semibold"
                  >
                    <Plus className="w-4 h-4" />
                    Tambah Device
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Assign Device Modal */}
      {assignModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
          <div className="glass-panel w-full max-w-sm p-6 rounded-2xl shadow-2xl fade-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-white text-lg">Assign Device</h3>
              <button
                onClick={() => {
                  setAssignModal({ open: false, userId: "", userName: "" });
                  setNewDeviceToken("");
                }}
                className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-400 mb-4">
              Assign device token ke <span className="text-emerald-400 font-semibold">{assignModal.userName}</span>
            </p>

            <div className="relative mb-4">
              <Cpu className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input
                id="assign-device-token"
                type="text"
                placeholder="Masukkan device token ESP32"
                value={newDeviceToken}
                onChange={(e) => setNewDeviceToken(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAssignDevice()}
                className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder-slate-600 text-sm font-mono"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setAssignModal({ open: false, userId: "", userName: "" });
                  setNewDeviceToken("");
                }}
                className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors text-sm font-semibold border border-slate-700"
              >
                Batal
              </button>
              <button
                onClick={handleAssignDevice}
                disabled={assignLoading || !newDeviceToken.trim()}
                className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {assignLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register Mitra Modal */}
      {registerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 overflow-y-auto">
          <div className="glass-panel w-full max-w-sm p-6 rounded-2xl shadow-2xl fade-in my-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-white text-lg">Tambah Mitra Baru</h3>
              <button
                onClick={() => {
                  setRegisterModal(false);
                  setRegisterError("");
                }}
                className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form className="space-y-3" onSubmit={handleRegisterMitra}>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input
                  type="text"
                  required
                  placeholder="Nama Lengkap"
                  value={registerForm.displayName}
                  onChange={(e) => setRegisterForm({ ...registerForm, displayName: e.target.value })}
                  className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-emerald-500 transition-all placeholder-slate-600 text-sm"
                />
              </div>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input
                  type="text"
                  required
                  placeholder="Nama Organisasi / Usaha"
                  value={registerForm.organizationName}
                  onChange={(e) => setRegisterForm({ ...registerForm, organizationName: e.target.value })}
                  className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-emerald-500 transition-all placeholder-slate-600 text-sm"
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input
                  type="email"
                  required
                  placeholder="Email Mitra"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-emerald-500 transition-all placeholder-slate-600 text-sm"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input
                  type="password"
                  required
                  placeholder="Password Sementara"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-emerald-500 transition-all placeholder-slate-600 text-sm"
                />
              </div>

              {registerError && (
                <p className="text-rose-400 text-xs mt-2 px-1">{registerError}</p>
              )}

              <div className="flex gap-3 mt-5">
                <button
                  type="button"
                  onClick={() => {
                    setRegisterModal(false);
                    setRegisterError("");
                  }}
                  className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors text-sm font-semibold border border-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={registerLoading}
                  className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {registerLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  Tambah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
