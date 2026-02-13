"use client";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import Image from "next/image";
import { ReactNode } from "react";

const allNav = [
  { href: "/dashboard", label: "Dashboard", icon: "📊", roles: ["Admin", "Farmer", "Buyer"] },
  { href: "/purchases", label: "Purchases", icon: "🛒", roles: ["Admin", "Farmer"] },
  { href: "/sales", label: "Sales", icon: "💰", roles: ["Admin", "Buyer"] },
  { href: "/quotes", label: "Quotes", icon: "📋", roles: ["Admin", "Buyer"] },
  { href: "/farmers", label: "Farmers", icon: "🌾", roles: ["Admin", "Farmer"] },
  { href: "/traders", label: "Traders", icon: "🤝", roles: ["Admin", "Buyer"] },
  { href: "/reports", label: "Reports", icon: "📈", roles: ["Admin", "Farmer", "Buyer"] },
  { href: "/master", label: "Master Data", icon: "⚙️", roles: ["Admin"] },
];

export default function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const nav = allNav.filter((n) => user && n.roles.includes(user.role));

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-60 sidebar-gradient flex flex-col shadow-xl">
        {/* Logo */}
        <div className="p-5 border-b border-white/10 flex items-center gap-3">
          <Image src="/logo.png" alt="Lotexa" width={42} height={42} className="rounded-lg" />
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide">Lotexa</h1>
            <p className="text-[10px] text-emerald-300/80 tracking-widest uppercase">Every Lot Counts</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {nav.map((n) => (
            <button
              key={n.href}
              onClick={() => router.push(n.href)}
              className={`nav-link w-full text-left ${pathname === n.href ? "active" : ""}`}
            >
              <span className="text-base">{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>

        {/* User / Logout */}
        <div className="p-4 border-t border-white/10">
          <p className="text-xs text-emerald-200 truncate">{user?.email}</p>
          <p className="text-[10px] text-emerald-400/60 mb-2">{user?.role}</p>
          <button
            onClick={() => { logout(); router.push("/login"); }}
            className="w-full text-xs py-1.5 rounded-md bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
    </div>
  );
}
