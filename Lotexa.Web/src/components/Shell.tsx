"use client";
import { useState } from "react";
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
  { href: "/pricing", label: "Pricing", icon: "🏷️", roles: ["Admin", "Buyer"] },
  { href: "/master", label: "Master Data", icon: "⚙️", roles: ["Admin"] },
];

export default function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const nav = allNav.filter((n) => user && n.roles.includes(user.role));

  const navigate = (href: string) => {
    router.push(href);
    setDrawerOpen(false);
  };

  const sidebarContent = (
    <>
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
            onClick={() => navigate(n.href)}
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
          onClick={() => { logout(); router.push("/login"); setDrawerOpen(false); }}
          className="w-full text-xs py-1.5 rounded-md bg-white/10 text-white hover:bg-white/20 transition-colors"
        >
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-60 sidebar-gradient flex-col shadow-xl shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Backdrop */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 sidebar-gradient flex flex-col shadow-xl transform transition-transform duration-300 ease-in-out md:hidden ${drawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Close button */}
        <button
          onClick={() => setDrawerOpen(false)}
          className="absolute top-4 right-4 text-white/70 hover:text-white p-1"
          aria-label="Close menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        {sidebarContent}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 shadow-sm">
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Open menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <Image src="/logo.png" alt="Lotexa" width={28} height={28} className="rounded-md" />
          <span className="font-semibold text-gray-800">Lotexa</span>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
