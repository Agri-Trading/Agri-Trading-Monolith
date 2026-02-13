"use client";
import { useEffect, useState } from "react";
import Shell from "@/components/Shell";
import api from "@/lib/api";
import type { FarmerDto } from "@/lib/types";

export default function FarmersPage() {
  const [farmers, setFarmers] = useState<FarmerDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pinCode: "",
  });

  const load = async () => {
    setLoading(true);
    try { setFarmers((await api.get("/farmers")).data); } catch { } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/farmers", {
        name: form.name,
        phone: form.phone,
        email: form.email || null,
        addresses: form.addressLine1
          ? [{ addressLine1: form.addressLine1, addressLine2: form.addressLine2 || null, city: form.city, state: form.state, pinCode: form.pinCode, isPrimary: true }]
          : [],
      });
      setShowForm(false);
      setForm({ name: "", phone: "", email: "", addressLine1: "", addressLine2: "", city: "", state: "", pinCode: "" });
      load();
    } catch { } finally { setSaving(false); }
  };

  return (
    <Shell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Farmers</h2>
            <p className="text-gray-500 mt-1">Manage farmer profiles and addresses</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
          >
            {showForm ? "Cancel" : "+ New Farmer"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Inp label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
              <Inp label="Phone *" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} type="tel" required />
              <Inp label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} type="email" />
            </div>
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Primary Address</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Inp label="Address Line 1" value={form.addressLine1} onChange={(v) => setForm({ ...form, addressLine1: v })} />
                <Inp label="Address Line 2" value={form.addressLine2} onChange={(v) => setForm({ ...form, addressLine2: v })} />
                <Inp label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
                <Inp label="State" value={form.state} onChange={(v) => setForm({ ...form, state: v })} />
                <Inp label="PIN Code" value={form.pinCode} onChange={(v) => setForm({ ...form, pinCode: v })} />
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={saving} className="px-6 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                {saving ? "Saving..." : "Create Farmer"}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : farmers.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No farmers yet.</div>
        ) : (
          <div className="space-y-3">
            {farmers.map((f) => (
              <div key={f.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div
                  className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedId(expandedId === f.id ? null : f.id)}
                >
                  <div>
                    <div className="font-medium text-gray-900">{f.name}</div>
                    <div className="text-xs text-gray-500">
                      {f.phone && <span>📞 {f.phone}</span>}
                      {f.phone && f.email && <span> | </span>}
                      {f.email && <span>✉️ {f.email}</span>}
                      {!f.phone && !f.email && "No contact info"}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${f.isActive ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                      {f.isActive ? "Active" : "Inactive"}
                    </span>
                    <span className="text-gray-400">{expandedId === f.id ? "▲" : "▼"}</span>
                  </div>
                </div>

                {expandedId === f.id && f.addresses.length > 0 && (
                  <div className="border-t border-gray-200 px-5 py-4">
                    <h4 className="text-xs font-semibold text-gray-500 mb-2 uppercase">Addresses</h4>
                    <div className="space-y-2">
                      {f.addresses.map((a) => (
                        <div key={a.id} className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                          <div>{a.addressLine1}{a.addressLine2 ? `, ${a.addressLine2}` : ""}</div>
                          <div>{a.city}, {a.state} - {a.pinCode}</div>
                          {a.isPrimary && <span className="text-xs text-emerald-600 font-medium">Primary</span>}
                        </div>
                      ))}
                    </div>
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

function Inp({ label, value, onChange, type = "text", required }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
    </div>
  );
}
