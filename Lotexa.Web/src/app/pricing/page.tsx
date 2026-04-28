"use client";
import { useEffect, useState } from "react";
import Shell from "@/components/Shell";
import api from "@/lib/api";

interface LotPricing {
  lotId: number;
  lotNumber: string;
  farmerName: string;
  warehouseName: string;
  purchaseDate: string;
  availableQtyKundal: number;
  buyPricePerKundal: number;
  expensesPerKundal: number;
  unitCostPerKundal: number;
}

interface CropPricing {
  cropId: number;
  cropName: string;
  uomName: string;
  kundalFactor: number; // kundal per 1 original UOM — used to convert API inputs/outputs
  totalAvailableQtyKundal: number;
  weightedAvgCostPerKundal: number;
  lots: LotPricing[];
}

interface PreviewAllocation {
  lotNumber: string;
  qtyFromLot: number;
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
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {crops.map((c) => (
          <div
            key={c.cropId}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-900">{c.cropName}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {fmt(c.totalAvailableQtyKundal)} kundal
              </span>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Weighted Avg Cost</span>
                <span className="font-medium text-gray-900">
                  ₹{fmt(c.weightedAvgCostPerKundal)} / kundal
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Break-even</span>
                <span className="font-medium text-amber-600">
                  ₹{fmt(c.weightedAvgCostPerKundal)} / kundal
                </span>
              </div>
              <div className="border-t border-gray-100 pt-1.5 space-y-1">
                {[5, 10, 15].map((m) => (
                  <div key={m} className="flex justify-between text-xs">
                    <span className="text-gray-400">+{m}% target</span>
                    <span className="font-semibold text-emerald-600">
                      ₹{fmt(pct(m)(c.weightedAvgCostPerKundal))} / kundal
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Per-crop expandable lot tables */}
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
              <span className="text-gray-400 text-xs">
                {expanded.has(c.cropId) ? "▲ Hide" : "▼ Show lots"}
              </span>
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
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">
                        Avail (kundal)
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">
                        Buy Price / kundal
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">
                        Expenses / kundal
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-amber-600 bg-amber-50">
                        Unit Cost / kundal
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-emerald-600 bg-emerald-50">
                        +10% / kundal
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-emerald-600 bg-emerald-50">
                        +15% / kundal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {c.lots.map((l) => (
                      <tr key={l.lotId} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-xs text-emerald-600">{l.lotNumber}</td>
                        <td className="px-4 py-3 text-gray-700">{l.farmerName}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{l.warehouseName}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{l.purchaseDate}</td>
                        <td className="px-4 py-3 text-right text-gray-700">
                          {fmt(l.availableQtyKundal)}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700">
                          ₹{fmt(l.buyPricePerKundal)}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-500 text-xs">
                          {l.expensesPerKundal > 0 ? `₹${fmt(l.expensesPerKundal)}` : "—"}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-amber-700 bg-amber-50">
                          ₹{fmt(l.unitCostPerKundal)}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-emerald-700 bg-emerald-50">
                          ₹{fmt(pct(10)(l.unitCostPerKundal))}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-emerald-700 bg-emerald-50">
                          ₹{fmt(pct(15)(l.unitCostPerKundal))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 border-t border-gray-200">
                      <td colSpan={4} className="px-4 py-2.5 text-xs font-medium text-gray-500">
                        Crop average
                      </td>
                      <td className="px-4 py-2.5 text-right text-xs font-semibold text-gray-700">
                        {fmt(c.totalAvailableQtyKundal)}
                      </td>
                      <td colSpan={2} />
                      <td className="px-4 py-2.5 text-right text-xs font-bold text-amber-700 bg-amber-50">
                        ₹{fmt(c.weightedAvgCostPerKundal)}
                      </td>
                      <td className="px-4 py-2.5 text-right text-xs font-bold text-emerald-700 bg-emerald-50">
                        ₹{fmt(pct(10)(c.weightedAvgCostPerKundal))}
                      </td>
                      <td className="px-4 py-2.5 text-right text-xs font-bold text-emerald-700 bg-emerald-50">
                        ₹{fmt(pct(15)(c.weightedAvgCostPerKundal))}
                      </td>
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
  const [qtyKundal, setQtyKundal] = useState("");
  const [pricePerKundal, setPricePerKundal] = useState("");
  const [preview, setPreview] = useState<ProfitPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedCrop = crops.find((c) => c.cropId === cropId);

  useEffect(() => {
    if (selectedCrop) {
      setPricePerKundal(pct(10)(selectedCrop.weightedAvgCostPerKundal).toFixed(2));
      setPreview(null);
    }
  }, [cropId, selectedCrop]);

  const run = async () => {
    if (!cropId || !qtyKundal || !pricePerKundal || !selectedCrop) return;
    setLoading(true);
    setError("");
    setPreview(null);

    // Convert kundal inputs back to original UOM for the API
    const { kundalFactor } = selectedCrop;
    const qtyForApi = parseFloat(qtyKundal) / kundalFactor;
    const priceForApi = parseFloat(pricePerKundal) * kundalFactor;

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
      {/* Form */}
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
                  {c.cropName} ({fmt(c.totalAvailableQtyKundal)} kundal available)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity (kundal)
            </label>
            <input
              type="number"
              step="any"
              min="0"
              value={qtyKundal}
              onChange={(e) => setQtyKundal(e.target.value)}
              placeholder="e.g. 5"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sell Price / kundal (₹)
              {selectedCrop && (
                <span className="ml-1 text-xs text-gray-400">
                  break-even ₹{fmt(selectedCrop.weightedAvgCostPerKundal)}
                </span>
              )}
            </label>
            <input
              type="number"
              step="any"
              min="0"
              value={pricePerKundal}
              onChange={(e) => setPricePerKundal(e.target.value)}
              placeholder="Enter sell price"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>
        </div>

        {/* Quick-fill margin buttons */}
        {selectedCrop && (
          <div className="mt-3 flex flex-wrap gap-2">
            {[5, 10, 15, 20].map((m) => (
              <button
                key={m}
                onClick={() =>
                  setPricePerKundal(pct(m)(selectedCrop.weightedAvgCostPerKundal).toFixed(2))
                }
                className="px-3 py-1 text-xs rounded-full border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
              >
                +{m}% → ₹{fmt(pct(m)(selectedCrop.weightedAvgCostPerKundal))} / kundal
              </button>
            ))}
          </div>
        )}

        <div className="mt-4">
          <button
            onClick={run}
            disabled={!cropId || !qtyKundal || !pricePerKundal || loading}
            className="px-5 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Calculating…" : "Calculate Profit / Loss"}
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>

      {/* Results */}
      {preview && selectedCrop && (
        <div className="space-y-4">
          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Revenue", value: `₹${fmt(preview.revenue)}`, highlight: null },
              { label: "Estimated Cost (FIFO)", value: `₹${fmt(preview.estimatedCost)}`, highlight: null },
              {
                label: "Net Profit / Loss",
                value: `₹${fmt(preview.estimatedProfit)}`,
                highlight: preview.estimatedProfit >= 0 ? true : false,
              },
              {
                label: "Margin %",
                value: marginPct !== null ? `${marginPct}%` : "—",
                highlight: preview.estimatedProfit >= 0 ? true : false,
              },
            ].map((s) => (
              <div key={s.label} className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">{s.label}</p>
                <p
                  className={`text-lg font-bold mt-0.5 ${
                    s.highlight === true
                      ? "text-emerald-600"
                      : s.highlight === false
                      ? "text-red-600"
                      : "text-gray-900"
                  }`}
                >
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          {/* Verdict banner */}
          <div
            className={`rounded-lg px-5 py-3 text-sm font-medium flex items-center gap-2 ${
              preview.estimatedProfit >= 0
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {preview.estimatedProfit >= 0 ? "✓" : "✗"}
            {preview.estimatedProfit >= 0
              ? `Selling ${fmt(parseFloat(qtyKundal))} kundal of ${preview.cropName} at ₹${fmt(parseFloat(pricePerKundal))} / kundal yields a profit of ₹${fmt(preview.estimatedProfit)} (${marginPct}% margin).`
              : `Selling at ₹${fmt(parseFloat(pricePerKundal))} / kundal results in a loss of ₹${fmt(Math.abs(preview.estimatedProfit))}. Raise the price above ₹${fmt(selectedCrop.weightedAvgCostPerKundal)} / kundal to break even.`}
          </div>

          {/* FIFO allocation table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <h4 className="text-sm font-medium text-gray-900">FIFO Lot Allocation</h4>
              <p className="text-xs text-gray-400 mt-0.5">
                Stock drawn from these lots in purchase-date order
              </p>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">Lot #</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-gray-500">
                    Qty (kundal)
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-gray-500">
                    Cost / kundal
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-gray-500">
                    Sell / kundal
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-gray-500">
                    Profit / kundal
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {preview.allocations.map((a) => {
                  const { kundalFactor } = selectedCrop;
                  // Convert API values (per original UOM) to per kundal
                  const qtyKundalAlloc = a.qtyFromLot * kundalFactor;
                  const costPerKundal = a.costPerUom / kundalFactor;
                  const sellPerKundal = parseFloat(pricePerKundal);
                  const profitPerKundal = sellPerKundal - costPerKundal;
                  return (
                    <tr key={a.lotNumber} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-mono text-xs text-emerald-600">{a.lotNumber}</td>
                      <td className="px-5 py-3 text-right text-gray-700">{fmt(qtyKundalAlloc)}</td>
                      <td className="px-5 py-3 text-right text-amber-700">₹{fmt(costPerKundal)}</td>
                      <td className="px-5 py-3 text-right text-gray-700">₹{fmt(sellPerKundal)}</td>
                      <td
                        className={`px-5 py-3 text-right font-semibold ${
                          profitPerKundal >= 0 ? "text-emerald-600" : "text-red-600"
                        }`}
                      >
                        {profitPerKundal >= 0 ? "+" : ""}₹{fmt(profitPerKundal)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function PricingPage() {
  const [crops, setCrops] = useState<CropPricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "simulator">("overview");

  useEffect(() => {
    api
      .get<CropPricing[]>("/reports/pricing")
      .then(({ data }) => setCrops(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Shell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pricing</h1>
          <p className="text-gray-500 mt-1">
            Per-lot cost breakdown and profit simulation — all prices in ₹ per kundal
          </p>
        </div>

        <div className="flex bg-gray-100 rounded-lg p-1 gap-1 w-fit">
          {(["overview", "simulator"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                tab === t
                  ? "bg-white text-emerald-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "overview" ? "Pricing Overview" : "Profit Simulator"}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center py-12 text-gray-400">Loading…</p>
        ) : tab === "overview" ? (
          <PricingOverview crops={crops} />
        ) : (
          <ProfitSimulator crops={crops} />
        )}
      </div>
    </Shell>
  );
}
