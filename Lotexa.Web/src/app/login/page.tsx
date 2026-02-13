"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import Image from "next/image";

export default function LoginPage() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [loginForm, setLoginForm] = useState({ identifier: "", password: "" });
  const [regForm, setRegForm] = useState({ email: "", phoneNumber: "", password: "", fullName: "", role: "Farmer" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async () => {
    setError(""); setLoading(true);
    try {
      const res = await api.post("/auth/login", loginForm);
      login(res.data.token, res.data.email, res.data.role);
      router.push("/dashboard");
    } catch (e: any) {
      setError(e.response?.data?.message || "Login failed");
    } finally { setLoading(false); }
  };

  const handleRegister = async () => {
    setError(""); setLoading(true);
    try {
      const res = await api.post("/auth/register", regForm);
      login(res.data.token, res.data.email, res.data.role);
      router.push("/dashboard");
    } catch (e: any) {
      setError(e.response?.data?.message || "Registration failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-100 p-4">
      <div className="glass-card w-full max-w-md p-8 animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="Lotexa" width={160} height={160} className="mx-auto rounded-xl mb-3" />
          <p className="text-gray-400 text-xs tracking-widest uppercase">Agricultural Trading Platform</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg mb-6">
          <button onClick={() => { setTab("login"); setError(""); }}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${tab === "login" ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500"}`}>
            Sign In
          </button>
          <button onClick={() => { setTab("register"); setError(""); }}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${tab === "register" ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500"}`}>
            Register
          </button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">{error}</div>}

        {/* Login Form */}
        {tab === "login" && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Email or Phone</label>
              <input className="premium-input" placeholder="Enter email or phone number"
                value={loginForm.identifier}
                onChange={(e) => setLoginForm({ ...loginForm, identifier: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Password</label>
              <input className="premium-input" type="password" placeholder="••••••••"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} />
            </div>
            <button className="btn-primary w-full" onClick={handleLogin} disabled={loading}>
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </div>
        )}

        {/* Register Form */}
        {tab === "register" && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Full Name *</label>
              <input className="premium-input" placeholder="Full name" required
                value={regForm.fullName}
                onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Email *</label>
              <input className="premium-input" type="email" placeholder="email@example.com" required
                value={regForm.email}
                onChange={(e) => setRegForm({ ...regForm, email: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Phone Number *</label>
              <input className="premium-input" type="tel" placeholder="+91 9876543210" required
                value={regForm.phoneNumber}
                onChange={(e) => setRegForm({ ...regForm, phoneNumber: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Password *</label>
              <input className="premium-input" type="password" placeholder="Min 6 characters" required
                value={regForm.password}
                onChange={(e) => setRegForm({ ...regForm, password: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Role *</label>
              <select className="premium-input" value={regForm.role}
                onChange={(e) => setRegForm({ ...regForm, role: e.target.value })}>
                <option value="Farmer">Farmer</option>
                <option value="Buyer">Buyer</option>
              </select>
            </div>
            <button className="btn-primary w-full" onClick={handleRegister} disabled={loading}>
              {loading ? "Registering…" : "Create Account"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
