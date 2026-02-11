"use client";
import { useEffect, useState } from "react";
import Shell from "@/components/Shell";
import api from "@/lib/api";
import type { SaleDto, CropDto, TraderDto } from "@/lib/types";

export default function SalesPage() {
  const [sales, setSales] = useState<SaleDto[]>([]);
  const [crops, setCrops] = useState<CropDto[]>([]);
  const [traders, setTraders] = useState<TraderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [form, setForm] = useState({
    cropId: 0,
    traderId: 0,
    quantity: "",
    sellPricePerUom: "",
    saleDate: new Date().toISOString().slice(0, 10),
    notes: "",
  });

  const load = async () => {
    setLoading(true);
    try {
      const [salesRes, cropsRes, tradersRes] = await Promise.all([
        api.get("/sales"),
        api.get("/crops"),
        api.get("/traders"),
      ]);
      setSales(salesRes.data);
      setCrops(cropsRes.data);
      setTraders(tradersRes.data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/sales", {
        cropId: form.cropId,
        traderId: form.traderId,
        quantity: parseFloat(form.quantity),
        sellPricePerUom: parseFloat(form.sellPricePerUom),
        saleDate: form.saleDate,
        notes: form.notes || null,
      });
      setShowForm(false);
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      if (msg) alert(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Sales</h2>
            <p className="text-gray-500 mt-1">FIFO-allocated sales with profit tracking</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
          >
            {showForm ? "Cancel" : "+ New Sale"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Crop</label>
              <select value={form.cropId} onChange={(e) => setForm({ ...form, cropId: +e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none">
                <option value={0}>Select...</option>
                {crops.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trader</label>
              <select value={form.traderId} onChange={(e) => setForm({ ...form, traderId: +e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none">
                <option value={0}>Select...</option>
                {traders.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <Inp label="Quantity" type="number" value={form.quantity} onChange={(v) => setForm({ ...form, quantity: v })} />
            <Inp label="Sell Price / UOM" type="number" value={form.sellPricePerUom} onChange={(v) => setForm({ ...form, sellPricePerUom: v })} />
            <Inp label="Sale Date" type="date" value={form.saleDate} onChange={(v) => setForm({ ...form, saleDate: v })} />
            <Inp label="Notes" type="text" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} />
            <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
              <button type="submit" disabled={saving} className="px-6 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                {saving ? "Creating..." : "Create Sale (FIFO)"}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : sales.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No sales yet.</div>
        ) : (
          <div className="space-y-3">
            {sales.map((s) => (
              <div key={s.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div
                  className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="font-medium text-gray-900">{s.cropName}</div>
                      <div className="text-xs text-gray-500">{s.traderName} &middot; {s.saleDate}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-right">
                      <div className="text-gray-500">Qty</div>
                      <div className="font-semibold">{s.quantity}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-500">Revenue</div>
                      <div className="font-semibold">{s.revenue.toFixed(2)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-500">Profit</div>
                      <div className={`font-bold ${s.netProfit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                        {s.netProfit.toFixed(2)}
                      </div>
                    </div>
                    <span className="text-gray-400">{expandedId === s.id ? "▲" : "▼"}</span>
                  </div>
                </div>

                {expandedId === s.id && (
                  <div className="border-t border-gray-200 px-5 py-4 space-y-4">
                    {/* FIFO Allocations */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">FIFO Allocations</h4>
                      <div className="bg-gray-50 rounded-lg overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-gray-500">
                              <th className="px-3 py-2 text-left font-medium">Lot #</th>
                              <th className="px-3 py-2 text-right font-medium">Qty</th>
                              <th className="px-3 py-2 text-right font-medium">Cost/UOM</th>
                              <th className="px-3 py-2 text-right font-medium">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {s.allocations.map((a) => (
                              <tr key={a.id}>
                                <td className="px-3 py-2 font-mono">{a.lotNumber}</td>
                                <td className="px-3 py-2 text-right">{a.quantityAllocated}</td>
                                <td className="px-3 py-2 text-right">{a.costPerUomAtAllocation.toFixed(2)}</td>
                                <td className="px-3 py-2 text-right font-medium">
                                  {(a.quantityAllocated * a.costPerUomAtAllocation).toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Expenses */}
                    {s.expenses.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Expenses</h4>
                        <div className="flex flex-wrap gap-2">
                          {s.expenses.map((ex) => (
                            <span key={ex.id} className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded">
                              {ex.description}: {ex.amount.toFixed(2)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Payments */}
                    {s.payments.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Payments</h4>
                        <div className="flex flex-wrap gap-2">
                          {s.payments.map((p) => (
                            <span key={p.id} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                              {p.amount.toFixed(2)} - {p.paymentMethod ?? "N/A"} ({p.paymentDate})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}

function Inp({ label, type, value, onChange }: { label: string; type: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} step={type === "number" ? "any" : undefined} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
    </div>
  );
}
