"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Cpu, Mail, Lock, ArrowRight, Loader2, KeyRound, ArrowLeft, Send } from "lucide-react";
import { loginWithEmail, resetPassword } from "@/lib/auth-helpers";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetMessage, setResetMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Email dan password wajib diisi.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      await loginWithEmail(email.trim(), password);
      router.push("/");
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
        setError("Email atau password salah.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Terlalu banyak percobaan. Coba lagi nanti.");
      } else {
        setError("Gagal masuk. Periksa koneksi Anda.");
      }
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Email wajib diisi untuk reset password.");
      return;
    }
    setLoading(true);
    setError("");
    setResetMessage("");
    try {
      await resetPassword(email.trim());
      setResetMessage("Link reset password telah dikirim ke email Anda.");
    } catch (err: any) {
      console.error(err);
      setError("Gagal mengirim link reset password. Pastikan email sudah terdaftar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      <div className="glass-panel p-8 rounded-3xl shadow-2xl w-full max-w-sm text-center fade-in relative z-10">
        {/* Logo */}
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.15)] relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="radiation-wave bg-emerald-500/20 w-full h-full"></div>
          </div>
          <Cpu className="text-emerald-400 w-10 h-10 relative z-10" />
        </div>

        <h1 className="text-2xl font-extrabold mb-1">
          Amaranggana<span className="text-emerald-500">Farm</span>
        </h1>
        <p className="text-slate-400 text-sm mb-8">
          {isForgotPassword ? "Reset password akun Anda" : "Masuk ke dashboard IoT Anda"}
        </p>

        {isForgotPassword ? (
          <form className="space-y-4" onSubmit={handleResetPassword}>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input
                id="reset-email"
                type="email"
                required
                placeholder="Email yang terdaftar"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder-slate-600"
              />
            </div>
            <button
              id="reset-submit"
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Mengirim...
                </>
              ) : (
                <>
                  <span>Kirim Link Reset</span>
                  <Send className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={handleLogin}>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
            <input
              id="login-email"
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder-slate-600"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
            <input
              id="login-password"
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder-slate-600"
            />
          </div>
          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Masuk...
              </>
            ) : (
              <>
                <span>Masuk</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
        )}

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <p className="text-rose-400 text-sm">{error}</p>
          </div>
        )}
        
        {resetMessage && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-emerald-400 text-sm">{resetMessage}</p>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-slate-700/50">
          {isForgotPassword ? (
            <button
              onClick={() => {
                setIsForgotPassword(false);
                setError("");
                setResetMessage("");
              }}
              className="w-full flex justify-center text-slate-400 hover:text-emerald-400 text-sm transition-colors items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Login
            </button>
          ) : (
            <button
              onClick={() => {
                setIsForgotPassword(true);
                setError("");
                setResetMessage("");
              }}
              className="w-full flex justify-center text-slate-400 hover:text-emerald-400 text-sm transition-colors items-center gap-2"
            >
              Lupa Password?
            </button>
          )}
        </div>
      </div>

      <p className="text-slate-600 text-xs mt-6 relative z-10">
        © 2026 AmarangganaFarm IoT System
      </p>
    </div>
  );
}
