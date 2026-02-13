"use client";
import { useEffect, useState } from "react";
import Shell from "@/components/Shell";
import api from "@/lib/api";
import type { CropDto, UnitOfMeasureDto, WarehouseDto } from "@/lib/types";

type Section = "crops" | "uom" | "warehouses";

export default function MasterDataPage() {
  const [section, setSection] = useState<Section>("crops");

  return (
    <Shell>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Master Data</h2>
          <p className="text-gray-500 mt-1">Manage crops, units of measure, and warehouses</p>
        </div>

        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
          {([
            { key: "crops", label: "Crops" },
            { key: "uom", label: "Units of Measure" },
            { key: "warehouses", label: "Warehouses" },
          ] as { key: Section; label: string }[]).map((s) => (
            <button
              key={s.key}
              onClick={() => setSection(s.key)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${section === s.key ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {section === "crops" && <CropsSection />}
        {section === "uom" && <UomSection />}
        {section === "warehouses" && <WarehousesSection />}
      </div>
    </Shell>
  );
}

function CropsSection() {
  const [items, setItems] = useState<CropDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setItems((await api.get("/crops")).data); } catch { } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/crops", { name, description: desc || null });
      setName(""); setDesc("");
      load();
    } catch { } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleAdd} className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none w-48" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
          <input type="text" value={desc} onChange={(e) => setDesc(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none w-48" />
        </div>
        <button type="submit" disabled={saving} className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 disabled:opacity-50">
          {saving ? "Adding..." : "Add Crop"}
        </button>
      </form>

      {loading ? <p className="text-gray-400 text-sm">Loading...</p> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 text-left text-gray-500"><th className="px-4 py-3 font-medium">Name</th><th className="px-4 py-3 font-medium">Description</th><th className="px-4 py-3 font-medium">Active</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                  <td className="px-4 py-3 text-gray-500">{c.description ?? "-"}</td>
                  <td className="px-4 py-3"><Badge active={c.isActive} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function UomSection() {
  const [items, setItems] = useState<UnitOfMeasureDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setItems((await api.get("/units-of-measure")).data); } catch { } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/units-of-measure", { code, name });
      setCode(""); setName("");
      load();
    } catch { } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleAdd} className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Code</label>
          <input type="text" value={code} onChange={(e) => setCode(e.target.value)} required className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none w-24" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none w-48" />
        </div>
        <button type="submit" disabled={saving} className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 disabled:opacity-50">
          {saving ? "Adding..." : "Add UOM"}
        </button>
      </form>

      {loading ? <p className="text-gray-400 text-sm">Loading...</p> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 text-left text-gray-500"><th className="px-4 py-3 font-medium">Code</th><th className="px-4 py-3 font-medium">Name</th><th className="px-4 py-3 font-medium">Active</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-medium text-gray-900">{u.code}</td>
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3"><Badge active={u.isActive} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function WarehousesSection() {
  const [items, setItems] = useState<WarehouseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setItems((await api.get("/warehouses")).data); } catch { } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/warehouses", { name, location: location || null });
      setName(""); setLocation("");
      load();
    } catch { } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleAdd} className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none w-48" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none w-48" />
        </div>
        <button type="submit" disabled={saving} className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 disabled:opacity-50">
          {saving ? "Adding..." : "Add Warehouse"}
        </button>
      </form>

      {loading ? <p className="text-gray-400 text-sm">Loading...</p> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 text-left text-gray-500"><th className="px-4 py-3 font-medium">Name</th><th className="px-4 py-3 font-medium">Location</th><th className="px-4 py-3 font-medium">Active</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((w) => (
                <tr key={w.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{w.name}</td>
                  <td className="px-4 py-3 text-gray-500">{w.location ?? "-"}</td>
                  <td className="px-4 py-3"><Badge active={w.isActive} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Badge({ active }: { active: boolean }) {
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
      {active ? "Active" : "Inactive"}
    </span>
  );
}
