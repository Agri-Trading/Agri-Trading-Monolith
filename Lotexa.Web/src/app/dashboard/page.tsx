"use client";
import { useState, useEffect } from "react";
import Shell from "@/components/Shell";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { StockSummaryDto, BreakEvenDto, PurchaseLotDto, SaleDto } from "@/lib/types";

const UOM_OPTIONS = [
  { label: "kg", factor: 1 },
  { label: "quintal", factor: 100 },
  { label: "ton", factor: 1000 },
];

/* ─── Safe number formatting helper ─── */
function fmt(value: number | null | undefined, fractionDigits?: number): string {
  if (value == null || isNaN(value)) return "0";
  return value.toLocaleString(undefined, {
    minimumFractionDigits: fractionDigits ?? 0,
    maximumFractionDigits: fractionDigits ?? 2,
  });
}

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";
  const isFarmer = user?.role === "Farmer";
  const isBuyer = user?.role === "Buyer";

  // Admin data
  const [stock, setStock] = useState<StockSummaryDto[]>([]);
  const [breakEven, setBreakEven] = useState<BreakEvenDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Farmer/Buyer data
  const [purchases, setPurchases] = useState<PurchaseLotDto[]>([]);
  const [sales, setSales] = useState<SaleDto[]>([]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const promises: Promise<void>[] = [];

    if (isAdmin) {
      promises.push(
        api.get("/reports/stock").then((r) => setStock(Array.isArray(r.data) ? r.data : [])).catch(() => setStock([])),
        api.get("/reports/breakeven").then((r) => setBreakEven(Array.isArray(r.data) ? r.data : [])).catch(() => setBreakEven([]))
      );
    }
    if (isFarmer) {
      promises.push(
        api.get("/purchases").then((r) => setPurchases(Array.isArray(r.data) ? r.data : [])).catch(() => setPurchases([]))
      );
    }
    if (isBuyer) {
      promises.push(
        api.get("/sales").then((r) => setSales(Array.isArray(r.data) ? r.data : [])).catch(() => setSales([]))
      );
    }

    Promise.allSettled(promises)
      .then((results) => {
        const failed = results.filter((r) => r.status === "rejected");
        if (failed.length > 0) setError("Some data could not be loaded.");
      })
      .finally(() => setLoading(false));
  }, [isAdmin, isFarmer, isBuyer]);

  return (
    <Shell>
      <div className="animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
            <span className="ml-3 text-gray-500">Loading dashboard…</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm">
            ⚠️ {error}
          </div>
        )}

        {!loading && (
          <>
            {/* ─── Admin: Stock + Break-Even ─── */}
            {isAdmin && (
              <>
                <Section title="📦 Current Stock (in kg)">
                  {stock.length === 0 ? (
                    <EmptyState text="No stock data available" />
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {stock.map((s) => (
                        <StockCard key={s.cropId} item={s} />
                      ))}
                    </div>
                  )}
                </Section>

                <Section title="📊 Break-Even Prices">
                  {breakEven.length === 0 ? (
                    <EmptyState text="No break-even data" />
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {breakEven.map((b) => (
                        <div key={b.cropId} className="glass-card p-4">
                          <p className="text-sm font-semibold text-gray-700">{b.cropName ?? "Unknown"}</p>
                          <p className="text-xl font-bold text-amber-600 mt-1">
                            ₹{fmt(b.weightedAvgCostPerUom, 2)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Qty in stock: {fmt(b.totalAvailableQty)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </Section>
              </>
            )}

            {/* ─── Farmer: Recent Purchases ─── */}
            {isFarmer && (
              <Section title="🛒 Your Recent Purchases">
                {purchases.length === 0 ? (
                  <EmptyState text="No purchases found" />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left text-gray-500">
                          <th className="pb-2 font-medium">Lot #</th>
                          <th className="pb-2 font-medium">Crop</th>
                          <th className="pb-2 font-medium">Qty</th>
                          <th className="pb-2 font-medium">UOM</th>
                          <th className="pb-2 font-medium">Price/unit</th>
                          <th className="pb-2 font-medium">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {purchases.slice(0, 10).map((p) => (
                          <tr key={p.id} className="border-b border-gray-100 hover:bg-emerald-50/50">
                            <td className="py-2.5 font-mono text-xs">{p.lotNumber ?? "—"}</td>
                            <td className="py-2.5">{p.cropName ?? "—"}</td>
                            <td className="py-2.5 font-semibold">{fmt(p.quantity)}</td>
                            <td className="py-2.5 text-gray-500">{p.uomCode ?? "—"}</td>
                            <td className="py-2.5">₹{fmt(p.buyPricePerUom)}</td>
                            <td className="py-2.5 text-gray-500">{p.purchaseDate ?? "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Section>
            )}

            {/* ─── Buyer: Recent Sales ─── */}
            {isBuyer && (
              <Section title="💰 Your Recent Sales">
                {sales.length === 0 ? (
                  <EmptyState text="No sales found" />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left text-gray-500">
                          <th className="pb-2 font-medium">Crop</th>
                          <th className="pb-2 font-medium">Qty</th>
                          <th className="pb-2 font-medium">Price/unit</th>
                          <th className="pb-2 font-medium">Revenue</th>
                          <th className="pb-2 font-medium">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sales.slice(0, 10).map((s) => (
                          <tr key={s.id} className="border-b border-gray-100 hover:bg-emerald-50/50">
                            <td className="py-2.5">{s.cropName ?? "—"}</td>
                            <td className="py-2.5 font-semibold">{fmt(s.quantity)}</td>
                            <td className="py-2.5">₹{fmt(s.sellPricePerUom)}</td>
                            <td className="py-2.5 font-semibold text-emerald-700">₹{fmt(s.revenue)}</td>
                            <td className="py-2.5 text-gray-500">{s.saleDate ?? "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Section>
            )}
          </>
        )}
      </div>
    </Shell>
  );
}

/* ─── Stock Card with UOM Switcher ─── */
function StockCard({ item }: { item: StockSummaryDto }) {
  const [uom, setUom] = useState("kg");
  const factor = UOM_OPTIONS.find((u) => u.label === uom)?.factor ?? 1;
  const displayQty = (item.totalAvailableQty ?? 0) / factor;

  return (
    <div className="stock-card">
      <div className="flex items-start justify-between">
        <p className="text-sm font-semibold text-gray-700">{item.cropName ?? "Unknown"}</p>
        <select className="uom-select" value={uom} onChange={(e) => setUom(e.target.value)}>
          {UOM_OPTIONS.map((o) => (
            <option key={o.label} value={o.label}>{o.label}</option>
          ))}
        </select>
      </div>
      <div className="text-2xl font-bold text-emerald-700 mt-2">
        {fmt(displayQty, 2)}
        <span className="text-sm font-normal text-gray-500 ml-1">{uom}</span>
      </div>
    </div>
  );
}

/* ─── Helpers ─── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
      {children}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="text-gray-400 text-sm py-8 text-center">{text}</p>;
}
