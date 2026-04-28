"use client";
import { useEffect, useState } from "react";
import Shell from "@/components/Shell";
import api from "@/lib/api";
import type { PurchaseLotDto } from "@/lib/types";

interface LotPricing {
  lotId: number;
  lotNumber: string;
  farmerName: string;
  warehouseName: string;
  purchaseDate: string;
  availableQtyQuintal: number;
  buyPricePerQuintal: number;
  totalExpenses: number;
  expensesPerQuintal: number;
  unitCostPerQuintal: number;
}

interface CropPricing {
  cropId: number;
  cropName: string;
  uomName: string;
  quintalFactor: number;
  totalAvailableQtyQuintal: number;
  weightedAvgCostPerQuintal: number;
  lots: LotPricing[];
}

interface PreviewAllocation {
  lotNumber: string;
  qtyFromLot: number;
  buyPricePerUom: number;
  expensesPerUom: number;
  costPerUom: number;
}

interface ProfitPreview {
  cropName: string;
  saleQty: number;
  sellPricePerUom: number;
  revenue: number;
  estimatedCost: number;
  estimatedProfit: number;
  allocations: PreviewAllocation[];
}

const fmt = (n: number) =>
  n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const pct = (margin: number) => (v: number) => v * (1 + margin / 100);

// ─── Pricing Overview ──────────────────────────────────────────────────────────

function PricingOverview({ crops }: { crops: CropPricing[] }) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const toggle = (id: number) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  if (crops.length === 0)
    return <p className="text-center py-12 text-gray-400">No stock available for pricing.</p>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {crops.map((c) => (
          <div key={c.cropId} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-900">{c.cropName}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {fmt(c.totalAvailableQtyQuintal)} Quintal
              </span>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Weighted Avg Cost</span>
                <span className="font-medium text-gray-900">₹{fmt(c.weightedAvgCostPerQuintal)} / Quintal</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Break-even</span>
                <span className="font-medium text-amber-600">₹{fmt(c.weightedAvgCostPerQuintal)} / Quintal</span>
              </div>
              <div className="border-t border-gray-100 pt-1.5 space-y-1">
                {[5, 10, 15].map((m) => (
                  <div key={m} className="flex justify-between text-xs">
                    <span className="text-gray-400">+{m}% target</span>
                    <span className="font-semibold text-emerald-600">
                      ₹{fmt(pct(m)(c.weightedAvgCostPerQuintal))} / Quintal
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {crops.map((c) => (
          <div key={c.cropId} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <button
              onClick={() => toggle(c.cropId)}
              className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors"
            >
              <span className="font-medium text-gray-900 text-sm">
                {c.cropName}
                <span className="text-gray-400 font-normal text-xs ml-2">
                  ({c.lots.length} lot{c.lots.length !== 1 ? "s" : ""})
                </span>
              </span>
              <span className="text-gray-400 text-xs">{expanded.has(c.cropId) ? "▲ Hide" : "▼ Show lots"}</span>
            </button>

            {expanded.has(c.cropId) && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-t border-gray-100">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Lot #</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Farmer</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Warehouse</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Date</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Avail (Quintal)</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Buy Price / Quintal</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-orange-500">Total Expenses (₹)</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Expenses / Quintal</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-amber-600 bg-amber-50">Unit Cost / Quintal</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-emerald-600 bg-emerald-50">+10% / Quintal</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-emerald-600 bg-emerald-50">+15% / Quintal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {c.lots.map((l) => (
                      <tr key={l.lotId} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-xs text-emerald-600">{l.lotNumber}</td>
                        <td className="px-4 py-3 text-gray-700">{l.farmerName}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{l.warehouseName}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{l.purchaseDate}</td>
                        <td className="px-4 py-3 text-right text-gray-700">{fmt(l.availableQtyQuintal)}</td>
                        <td className="px-4 py-3 text-right text-gray-700">₹{fmt(l.buyPricePerQuintal)}</td>
                        <td className="px-4 py-3 text-right font-medium text-orange-600">
                          {l.totalExpenses > 0 ? `₹${fmt(l.totalExpenses)}` : "—"}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-500 text-xs">
                          {l.expensesPerQuintal > 0 ? `₹${fmt(l.expensesPerQuintal)}` : "—"}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-amber-700 bg-amber-50">₹{fmt(l.unitCostPerQuintal)}</td>
                        <td className="px-4 py-3 text-right font-semibold text-emerald-700 bg-emerald-50">₹{fmt(pct(10)(l.unitCostPerQuintal))}</td>
                        <td className="px-4 py-3 text-right font-semibold text-emerald-700 bg-emerald-50">₹{fmt(pct(15)(l.unitCostPerQuintal))}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 border-t border-gray-200">
                      <td colSpan={4} className="px-4 py-2.5 text-xs font-medium text-gray-500">Crop average</td>
                      <td className="px-4 py-2.5 text-right text-xs font-semibold text-gray-700">{fmt(c.totalAvailableQtyQuintal)}</td>
                      <td colSpan={3} />
                      <td className="px-4 py-2.5 text-right text-xs font-bold text-amber-700 bg-amber-50">₹{fmt(c.weightedAvgCostPerQuintal)}</td>
                      <td className="px-4 py-2.5 text-right text-xs font-bold text-emerald-700 bg-emerald-50">₹{fmt(pct(10)(c.weightedAvgCostPerQuintal))}</td>
                      <td className="px-4 py-2.5 text-right text-xs font-bold text-emerald-700 bg-emerald-50">₹{fmt(pct(15)(c.weightedAvgCostPerQuintal))}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Profit Simulator ──────────────────────────────────────────────────────────

function ProfitSimulator({ crops }: { crops: CropPricing[] }) {
  const [cropId, setCropId] = useState<number>(0);
  const [qtyQuintal, setQtyQuintal] = useState("");
  const [pricePerQuintal, setPricePerQuintal] = useState("");
  const [preview, setPreview] = useState<ProfitPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedCrop = crops.find((c) => c.cropId === cropId);

  useEffect(() => {
    if (selectedCrop) {
      setPricePerQuintal(pct(10)(selectedCrop.weightedAvgCostPerQuintal).toFixed(2));
      setPreview(null);
    }
  }, [cropId, selectedCrop]);

  const run = async () => {
    if (!cropId || !qtyQuintal || !pricePerQuintal || !selectedCrop) return;
    setLoading(true);
    setError("");
    setPreview(null);

    const { quintalFactor } = selectedCrop;
    const qtyForApi = parseFloat(qtyQuintal) / quintalFactor;
    const priceForApi = parseFloat(pricePerQuintal) * quintalFactor;

    try {
      const { data } = await api.get<ProfitPreview>(
        `/reports/profit-preview?cropId=${cropId}&qty=${qtyForApi}&sellPrice=${priceForApi}`
      );
      setPreview(data);
    } catch {
      setError("Could not calculate — check that sufficient stock exists for this crop.");
    } finally {
      setLoading(false);
    }
  };

  const marginPct =
    preview && preview.revenue > 0
      ? ((preview.estimatedProfit / preview.revenue) * 100).toFixed(1)
      : null;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Configure Sale Scenario</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Crop</label>
            <select
              value={cropId}
              onChange={(e) => setCropId(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            >
              <option value={0}>Select crop…</option>
              {crops.map((c) => (
                <option key={c.cropId} value={c.cropId}>
                  {c.cropName} ({fmt(c.totalAvailableQtyQuintal)} Quintal available)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (Quintal)</label>
            <input
              type="number" step="any" min="0"
              value={qtyQuintal}
              onChange={(e) => setQtyQuintal(e.target.value)}
              placeholder="e.g. 5"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sell Price / Quintal (₹)
              {selectedCrop && (
                <span className="ml-1 text-xs text-gray-400">
                  break-even ₹{fmt(selectedCrop.weightedAvgCostPerQuintal)}
                </span>
              )}
            </label>
            <input
              type="number" step="any" min="0"
              value={pricePerQuintal}
              onChange={(e) => setPricePerQuintal(e.target.value)}
              placeholder="Enter sell price"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>
        </div>

        {selectedCrop && (
          <div className="mt-3 flex flex-wrap gap-2">
            {[5, 10, 15, 20].map((m) => (
              <button
                key={m}
                onClick={() => setPricePerQuintal(pct(m)(selectedCrop.weightedAvgCostPerQuintal).toFixed(2))}
                className="px-3 py-1 text-xs rounded-full border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
              >
                +{m}% → ₹{fmt(pct(m)(selectedCrop.weightedAvgCostPerQuintal))} / Quintal
              </button>
            ))}
          </div>
        )}

        <div className="mt-4">
          <button
            onClick={run}
            disabled={!cropId || !qtyQuintal || !pricePerQuintal || loading}
            className="px-5 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Calculating…" : "Calculate Profit / Loss"}
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>

      {preview && selectedCrop && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Revenue", value: `₹${fmt(preview.revenue)}`, highlight: null },
              { label: "Estimated Cost (FIFO)", value: `₹${fmt(preview.estimatedCost)}`, highlight: null },
              { label: "Net Profit / Loss", value: `₹${fmt(preview.estimatedProfit)}`, highlight: preview.estimatedProfit >= 0 },
              { label: "Margin %", value: marginPct !== null ? `${marginPct}%` : "—", highlight: preview.estimatedProfit >= 0 },
            ].map((s) => (
              <div key={s.label} className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className={`text-lg font-bold mt-0.5 ${s.highlight === true ? "text-emerald-600" : s.highlight === false ? "text-red-600" : "text-gray-900"}`}>
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          <div className={`rounded-lg px-5 py-3 text-sm font-medium flex items-center gap-2 ${preview.estimatedProfit >= 0 ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
            {preview.estimatedProfit >= 0 ? "✓" : "✗"}
            {preview.estimatedProfit >= 0
              ? `Selling ${fmt(parseFloat(qtyQuintal))} Quintal of ${preview.cropName} at ₹${fmt(parseFloat(pricePerQuintal))} / Quintal yields a profit of ₹${fmt(preview.estimatedProfit)} (${marginPct}% margin).`
              : `Selling at ₹${fmt(parseFloat(pricePerQuintal))} / Quintal results in a loss of ₹${fmt(Math.abs(preview.estimatedProfit))}. Raise the price above ₹${fmt(selectedCrop.weightedAvgCostPerQuintal)} / Quintal to break even.`}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <h4 className="text-sm font-medium text-gray-900">FIFO Lot Allocation</h4>
              <p className="text-xs text-gray-400 mt-0.5">Stock drawn from these lots in purchase-date order</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">Lot #</th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-gray-500">Qty (Quintal)</th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-gray-500">Buy Price / Quintal</th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-orange-500">Expenses / Quintal</th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-amber-600">Unit Cost / Quintal</th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-gray-500">Sell / Quintal</th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-gray-500">Profit / Quintal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {preview.allocations.map((a) => {
                    const { quintalFactor } = selectedCrop;
                    const qtyQ = a.qtyFromLot * quintalFactor;
                    const buyPerQ = a.buyPricePerUom / quintalFactor;
                    const expPerQ = a.expensesPerUom / quintalFactor;
                    const costPerQ = a.costPerUom / quintalFactor;
                    const sellPerQ = parseFloat(pricePerQuintal);
                    const profitPerQ = sellPerQ - costPerQ;
                    return (
                      <tr key={a.lotNumber} className="hover:bg-gray-50">
                        <td className="px-5 py-3 font-mono text-xs text-emerald-600">{a.lotNumber}</td>
                        <td className="px-5 py-3 text-right text-gray-700">{fmt(qtyQ)}</td>
                        <td className="px-5 py-3 text-right text-gray-700">₹{fmt(buyPerQ)}</td>
                        <td className="px-5 py-3 text-right text-orange-600">{expPerQ > 0 ? `₹${fmt(expPerQ)}` : "—"}</td>
                        <td className="px-5 py-3 text-right text-amber-700 font-medium">₹{fmt(costPerQ)}</td>
                        <td className="px-5 py-3 text-right text-gray-700">₹{fmt(sellPerQ)}</td>
                        <td className={`px-5 py-3 text-right font-semibold ${profitPerQ >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                          {profitPerQ >= 0 ? "+" : ""}₹{fmt(profitPerQ)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Expense Report ────────────────────────────────────────────────────────────

function ExpenseReport() {
  const [lots, setLots] = useState<PurchaseLotDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  useEffect(() => {
    api.get<PurchaseLotDto[]>("/purchases")
      .then(({ data }) => setLots(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggle = (id: number) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  if (loading) return <p className="text-center py-12 text-gray-400">Loading…</p>;

  const lotsWithExpenses = lots.filter(
    (l) => l.otherCharges > 0 || l.expenses.length > 0
  );

  if (lotsWithExpenses.length === 0)
    return <p className="text-center py-12 text-gray-400">No lot expenses recorded yet.</p>;

  // Group by crop
  const byCrop = lotsWithExpenses.reduce<Record<string, PurchaseLotDto[]>>((acc, l) => {
    (acc[l.cropName] ??= []).push(l);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(byCrop).map(([crop, cropLots]) => {
          const total = cropLots.reduce(
            (s, l) => s + l.otherCharges + l.expenses.reduce((x, e) => x + e.amount, 0),
            0
          );
          return (
            <div key={crop} className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm font-semibold text-gray-900">{crop}</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">₹{fmt(total)}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                across {cropLots.length} lot{cropLots.length !== 1 ? "s" : ""}
              </p>
            </div>
          );
        })}
      </div>

      {/* Lot-level expense breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <h4 className="text-sm font-medium text-gray-900">Lot Expense Breakdown</h4>
          <p className="text-xs text-gray-400 mt-0.5">
            Expand a lot to see individual expense line items
          </p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">Lot #</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">Crop</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">Farmer</th>
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">Date</th>
              <th className="px-5 py-3 text-right text-xs font-medium text-gray-500">Other Charges</th>
              <th className="px-5 py-3 text-right text-xs font-medium text-gray-500">Add. Expenses</th>
              <th className="px-5 py-3 text-right text-xs font-medium text-orange-500">Total Expenses</th>
              <th className="px-5 py-3 text-center text-xs font-medium text-gray-500"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {lotsWithExpenses.map((l) => {
              const addExp = l.expenses.reduce((s, e) => s + e.amount, 0);
              const total = l.otherCharges + addExp;
              const isOpen = expanded.has(l.id);
              return (
                <>
                  <tr key={l.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-mono text-xs text-emerald-600">{l.lotNumber}</td>
                    <td className="px-5 py-3 text-gray-700">{l.cropName}</td>
                    <td className="px-5 py-3 text-gray-700">{l.farmerName}</td>
                    <td className="px-5 py-3 text-gray-500 text-xs">{l.purchaseDate}</td>
                    <td className="px-5 py-3 text-right text-gray-600">
                      {l.otherCharges > 0 ? `₹${fmt(l.otherCharges)}` : "—"}
                    </td>
                    <td className="px-5 py-3 text-right text-gray-600">
                      {addExp > 0 ? `₹${fmt(addExp)}` : "—"}
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-orange-600">₹{fmt(total)}</td>
                    <td className="px-5 py-3 text-center">
                      {l.expenses.length > 0 && (
                        <button
                          onClick={() => toggle(l.id)}
                          className="text-xs text-emerald-600 hover:underline"
                        >
                          {isOpen ? "▲ hide" : `▼ ${l.expenses.length} item${l.expenses.length !== 1 ? "s" : ""}`}
                        </button>
                      )}
                    </td>
                  </tr>
                  {isOpen && l.expenses.map((e) => (
                    <tr key={e.id} className="bg-orange-50">
                      <td colSpan={3} />
                      <td className="px-5 py-2 text-xs text-gray-500">{e.expenseDate}</td>
                      <td colSpan={2} className="px-5 py-2 text-xs text-gray-700">{e.description}</td>
                      <td className="px-5 py-2 text-right text-xs font-medium text-orange-700">₹{fmt(e.amount)}</td>
                      <td />
                    </tr>
                  ))}
                </>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 border-t border-gray-200">
              <td colSpan={6} className="px-5 py-2.5 text-xs font-medium text-gray-500">Grand Total</td>
              <td className="px-5 py-2.5 text-right text-sm font-bold text-orange-600">
                ₹{fmt(lotsWithExpenses.reduce((s, l) => s + l.otherCharges + l.expenses.reduce((x, e) => x + e.amount, 0), 0))}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

type Tab = "overview" | "simulator" | "expenses";

export default function PricingPage() {
  const [crops, setCrops] = useState<CropPricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("overview");

  useEffect(() => {
    api.get<CropPricing[]>("/reports/pricing")
      .then(({ data }) => setCrops(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Pricing Overview" },
    { key: "simulator", label: "Profit Simulator" },
    { key: "expenses", label: "Expense Report" },
  ];

  return (
    <Shell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pricing</h1>
          <p className="text-gray-500 mt-1">
            Per-lot cost breakdown and profit simulation — all prices in ₹ per Quintal
          </p>
        </div>

        <div className="flex bg-gray-100 rounded-lg p-1 gap-1 w-fit">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                tab === t.key ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center py-12 text-gray-400">Loading…</p>
        ) : tab === "overview" ? (
          <PricingOverview crops={crops} />
        ) : tab === "simulator" ? (
          <ProfitSimulator crops={crops} />
        ) : (
          <ExpenseReport />
        )}
      </div>
    </Shell>
  );
}
