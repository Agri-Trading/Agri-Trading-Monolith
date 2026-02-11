"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: "📊", roles: ["Admin", "Farmer", "Buyer"] },
  { href: "/purchases", label: "Purchases", icon: "🌾", roles: ["Admin", "Farmer"] },
  { href: "/sales", label: "Sales", icon: "💰", roles: ["Admin", "Buyer"] },
  { href: "/quotes", label: "Quotes", icon: "📋", roles: ["Admin", "Buyer"] },
  { href: "/farmers", label: "Farmers", icon: "👨‍🌾", roles: ["Admin", "Farmer"] },
  { href: "/traders", label: "Traders", icon: "🤝", roles: ["Admin", "Buyer"] },
  { href: "/reports", label: "Reports", icon: "📈", roles: ["Admin", "Farmer", "Buyer"] },
  { href: "/master", label: "Master Data", icon: "⚙️", roles: ["Admin"] },
];

export default function Shell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.replace("/login");
  }, [user, router]);

  if (!user) return null;

  const visibleNav = nav.filter((n) => n.roles.includes(user.role));

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-5 border-b border-gray-200">
          <h1 className="text-xl font-bold text-emerald-700">Lotexa</h1>
          <p className="text-xs text-gray-500 mt-0.5">Agri Trading Platform</p>
        </div>
        <nav className="flex-1 py-3 overflow-y-auto">
          {visibleNav.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
                  active
                    ? "bg-emerald-50 text-emerald-700 font-medium border-r-2 border-emerald-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 truncate">{user.email}</div>
          <div className="flex items-center justify-between mt-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700">
              {user.role}
            </span>
            <button onClick={() => { logout(); router.push("/login"); }} className="text-xs text-gray-400 hover:text-red-600 transition-colors">
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
