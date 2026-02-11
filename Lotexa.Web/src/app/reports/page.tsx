"use client";
import { useState } from "react";
import Shell from "@/components/Shell";
import api from "@/lib/api";
import type { LotStockDto, ProfitPreviewDto, SaleProfitDto, CropDto } from "@/lib/types";
import { useEffect } from "react";

type ReportTab = "lot-stock" | "profit-preview" | "sale-profit";

export default function ReportsPage() {
  const [tab, setTab] = useState<ReportTab>("lot-stock");
  const [crops, setCrops] = useState<CropDto[]>([]);

  useEffect(() => {
    api.get("/crops").then((r) => setCrops(r.data)).catch(() => {});
  }, []);

  return (
    <Shell>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
          <p className="text-gray-500 mt-1">Lot aging, profit preview, and sale profit analysis</p>
        </div>

        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
          {([
            { key: "lot-stock", label: "Lot Stock Aging" },
            { key: "profit-preview", label: "Profit Preview" },
            { key: "sale-profit", label: "Sale Profit" },
          ] as { key: ReportTab; label: string }[]).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                tab === t.key ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "lot-stock" && <LotStockReport crops={crops} />}
        {tab === "profit-preview" && <ProfitPreviewReport crops={crops} />}
        {tab === "sale-profit" && <SaleProfitReport />}
      </div>
    </Shell>
  );
}

function LotStockReport({ crops }: { crops: CropDto[] }) {
  const [data, setData] = useState<LotStockDto[]>([]);
  const [cropId, setCropId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reports/lot-stock${cropId ? `?cropId=${cropId}` : ""}`);
      setData(res.data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Crop (optional)</label>
          <select value={cropId} onChange={(e) => setCropId(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none">
            <option value="">All</option>
            {crops.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <button onClick={load} disabled={loading} className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50">
          {loading ? "Loading..." : "Load"}
        </button>
      </div>

      {data.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-500">
                <th className="px-4 py-3 font-medium">Lot #</th>
                <th className="px-4 py-3 font-medium">Crop</th>
                <th className="px-4 py-3 font-medium">Farmer</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium text-right">Qty</th>
                <th className="px-4 py-3 font-medium text-right">Available</th>
                <th className="px-4 py-3 font-medium text-right">Days</th>
                <th className="px-4 py-3 font-medium text-right">Unit Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((d) => (
                <tr key={d.lotId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-emerald-600">{d.lotNumber}</td>
                  <td className="px-4 py-3">{d.cropName}</td>
                  <td className="px-4 py-3">{d.farmerName}</td>
                  <td className="px-4 py-3">{d.purchaseDate}</td>
                  <td className="px-4 py-3 text-right">{d.quantity}</td>
                  <td className="px-4 py-3 text-right font-semibold">{d.availableQty}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                      d.daysSincePurchase > 90 ? "bg-red-50 text-red-600" : d.daysSincePurchase > 30 ? "bg-yellow-50 text-yellow-600" : "bg-emerald-50 text-emerald-600"
                    }`}>
                      {d.daysSincePurchase}d
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">{d.unitCost.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ProfitPreviewReport({ crops }: { crops: CropDto[] }) {
  const [cropId, setCropId] = useState("");
  const [qty, setQty] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [preview, setPreview] = useState<ProfitPreviewDto | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!cropId || !qty || !sellPrice) return;
    setLoading(true);
    try {
      const res = await api.get(`/reports/profit-preview?cropId=${cropId}&qty=${qty}&sellPrice=${sellPrice}`);
      setPreview(res.data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Crop</label>
          <select value={cropId} onChange={(e) => setCropId(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none">
            <option value="">Select...</option>
            {crops.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
          <input type="number" step="any" value={qty} onChange={(e) => setQty(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none w-32" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sell Price / UOM</label>
          <input type="number" step="any" value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none w-32" />
        </div>
        <button onClick={load} disabled={loading} className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50">
          {loading ? "Loading..." : "Preview"}
        </button>
      </div>

      {preview && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Stat label="Revenue" value={preview.revenue.toFixed(2)} />
            <Stat label="Est. Cost" value={preview.estimatedCost.toFixed(2)} />
            <Stat label="Est. Profit" value={preview.estimatedProfit.toFixed(2)} highlight={preview.estimatedProfit >= 0} />
            <Stat label="Crop" value={preview.cropName} />
          </div>

          {preview.allocations.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-gray-500">
                    <th className="px-4 py-3 font-medium">Lot #</th>
                    <th className="px-4 py-3 font-medium text-right">Qty from Lot</th>
                    <th className="px-4 py-3 font-medium text-right">Cost / UOM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {preview.allocations.map((a, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono">{a.lotNumber}</td>
                      <td className="px-4 py-3 text-right">{a.qtyFromLot}</td>
                      <td className="px-4 py-3 text-right">{a.costPerUom.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SaleProfitReport() {
  const [saleId, setSaleId] = useState("");
  const [data, setData] = useState<SaleProfitDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    if (!saleId) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/reports/sale-profit/${saleId}`);
      setData(res.data);
    } catch {
      setData(null);
      setError("Sale not found.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sale ID</label>
          <input type="number" value={saleId} onChange={(e) => setSaleId(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none w-32" />
        </div>
        <button onClick={load} disabled={loading} className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50">
          {loading ? "Loading..." : "Lookup"}
        </button>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {data && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Stat label="Crop" value={data.cropName} />
            <Stat label="Trader" value={data.traderName} />
            <Stat label="Sale Date" value={data.saleDate} />
            <Stat label="Qty" value={data.quantity.toString()} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Stat label="Revenue" value={data.revenue.toFixed(2)} />
            <Stat label="COGS" value={data.totalCost.toFixed(2)} />
            <Stat label="Sale Expenses" value={data.saleExpenses.toFixed(2)} />
            <Stat label="Net Profit" value={data.netProfit.toFixed(2)} highlight={data.netProfit >= 0} />
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`text-lg font-bold mt-0.5 ${highlight === true ? "text-emerald-600" : highlight === false ? "text-red-600" : "text-gray-900"}`}>
        {value}
      </div>
    </div>
  );
}
