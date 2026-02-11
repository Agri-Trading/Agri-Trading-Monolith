"use client";
import { useEffect, useState } from "react";
import Shell from "@/components/Shell";
import api from "@/lib/api";
import type { PriceQuoteDto, CropDto, TraderDto } from "@/lib/types";

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<PriceQuoteDto[]>([]);
  const [crops, setCrops] = useState<CropDto[]>([]);
  const [traders, setTraders] = useState<TraderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    cropId: 0,
    traderId: 0,
    pricePerUom: "",
    quoteDate: new Date().toISOString().slice(0, 10),
    notes: "",
  });

  const load = async () => {
    setLoading(true);
    try {
      const [quotesRes, cropsRes, tradersRes] = await Promise.all([
        api.get("/quotes"),
        api.get("/crops"),
        api.get("/traders"),
      ]);
      setQuotes(quotesRes.data);
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
      await api.post("/quotes", {
        cropId: form.cropId,
        traderId: form.traderId,
        pricePerUom: parseFloat(form.pricePerUom),
        quoteDate: form.quoteDate,
        notes: form.notes || null,
      });
      setShowForm(false);
      load();
    } catch {
      /* ignore */
    } finally {
      setSaving(false);
    }
  };

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Price Quotes</h2>
            <p className="text-gray-500 mt-1">Track trader quotes per crop</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
          >
            {showForm ? "Cancel" : "+ New Quote"}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price / UOM</label>
              <input type="number" step="any" value={form.pricePerUom} onChange={(e) => setForm({ ...form, pricePerUom: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quote Date</label>
              <input type="date" value={form.quoteDate} onChange={(e) => setForm({ ...form, quoteDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
            </div>
            <div className="flex items-end">
              <button type="submit" disabled={saving} className="px-6 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                {saving ? "Saving..." : "Add Quote"}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : quotes.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No quotes yet.</div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500">
                  <th className="px-4 py-3 font-medium">Crop</th>
                  <th className="px-4 py-3 font-medium">Trader</th>
                  <th className="px-4 py-3 font-medium text-right">Price / UOM</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Notes</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {quotes.map((q) => (
                  <tr key={q.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{q.cropName}</td>
                    <td className="px-4 py-3">{q.traderName}</td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-700">{q.pricePerUom}</td>
                    <td className="px-4 py-3">{q.quoteDate}</td>
                    <td className="px-4 py-3 text-gray-500">{q.notes ?? "-"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${q.isActive ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                        {q.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Shell>
  );
}
