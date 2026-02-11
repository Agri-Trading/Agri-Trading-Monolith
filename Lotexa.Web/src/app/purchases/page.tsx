"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Shell from "@/components/Shell";
import api from "@/lib/api";
import type {
  PurchaseLotDto,
  CropDto,
  FarmerDto,
  WarehouseDto,
  UnitOfMeasureDto,
} from "@/lib/types";

export default function PurchasesPage() {
  const [lots, setLots] = useState<PurchaseLotDto[]>([]);
  const [crops, setCrops] = useState<CropDto[]>([]);
  const [farmers, setFarmers] = useState<FarmerDto[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseDto[]>([]);
  const [uoms, setUoms] = useState<UnitOfMeasureDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    cropId: 0,
    farmerId: 0,
    warehouseId: 0,
    unitOfMeasureId: 0,
    quantity: "",
    buyPricePerUom: "",
    otherCharges: "0",
    purchaseDate: new Date().toISOString().slice(0, 10),
    notes: "",
  });

  const load = async () => {
    setLoading(true);
    try {
      const [lotsRes, cropsRes, farmersRes, warehousesRes, uomsRes] =
        await Promise.all([
          api.get("/purchases"),
          api.get("/crops"),
          api.get("/farmers"),
          api.get("/warehouses"),
          api.get("/unitsofmeasure"),
        ]);
      setLots(lotsRes.data);
      setCrops(cropsRes.data);
      setFarmers(farmersRes.data);
      setWarehouses(warehousesRes.data);
      setUoms(uomsRes.data);
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
      await api.post("/purchases", {
        cropId: form.cropId,
        farmerId: form.farmerId,
        warehouseId: form.warehouseId,
        unitOfMeasureId: form.unitOfMeasureId,
        quantity: parseFloat(form.quantity),
        buyPricePerUom: parseFloat(form.buyPricePerUom),
        otherCharges: parseFloat(form.otherCharges),
        purchaseDate: form.purchaseDate,
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
            <h2 className="text-2xl font-bold text-gray-900">Purchase Lots</h2>
            <p className="text-gray-500 mt-1">Manage commodity purchase lots</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
          >
            {showForm ? "Cancel" : "+ New Purchase"}
          </button>
        </div>

        {/* Create form */}
        {showForm && (
          <form
            onSubmit={handleCreate}
            className="bg-white rounded-xl border border-gray-200 p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <SelectField label="Crop" value={form.cropId} onChange={(v) => setForm({ ...form, cropId: +v })} options={crops.map((c) => ({ value: c.id, label: c.name }))} />
            <SelectField label="Farmer" value={form.farmerId} onChange={(v) => setForm({ ...form, farmerId: +v })} options={farmers.map((f) => ({ value: f.id, label: f.name }))} />
            <SelectField label="Warehouse" value={form.warehouseId} onChange={(v) => setForm({ ...form, warehouseId: +v })} options={warehouses.map((w) => ({ value: w.id, label: w.name }))} />
            <SelectField label="Unit" value={form.unitOfMeasureId} onChange={(v) => setForm({ ...form, unitOfMeasureId: +v })} options={uoms.map((u) => ({ value: u.id, label: `${u.code} - ${u.name}` }))} />
            <InputField label="Quantity" type="number" value={form.quantity} onChange={(v) => setForm({ ...form, quantity: v })} />
            <InputField label="Buy Price / UOM" type="number" value={form.buyPricePerUom} onChange={(v) => setForm({ ...form, buyPricePerUom: v })} />
            <InputField label="Other Charges" type="number" value={form.otherCharges} onChange={(v) => setForm({ ...form, otherCharges: v })} />
            <InputField label="Purchase Date" type="date" value={form.purchaseDate} onChange={(v) => setForm({ ...form, purchaseDate: v })} />
            <InputField label="Notes" type="text" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} />
            <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
              <button type="submit" disabled={saving} className="px-6 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                {saving ? "Saving..." : "Create Lot"}
              </button>
            </div>
          </form>
        )}

        {/* Table */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : lots.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No purchase lots yet.</div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500">
                  <th className="px-4 py-3 font-medium">Lot #</th>
                  <th className="px-4 py-3 font-medium">Crop</th>
                  <th className="px-4 py-3 font-medium">Farmer</th>
                  <th className="px-4 py-3 font-medium text-right">Qty</th>
                  <th className="px-4 py-3 font-medium text-right">Available</th>
                  <th className="px-4 py-3 font-medium text-right">Buy Price</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lots.map((lot) => (
                  <tr key={lot.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/purchases/${lot.id}`}
                        className="text-emerald-600 font-medium hover:underline"
                      >
                        {lot.lotNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{lot.cropName}</td>
                    <td className="px-4 py-3">{lot.farmerName}</td>
                    <td className="px-4 py-3 text-right">{lot.quantity}</td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-700">
                      {lot.availableQty}
                    </td>
                    <td className="px-4 py-3 text-right">{lot.buyPricePerUom}</td>
                    <td className="px-4 py-3">{lot.purchaseDate}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                          lot.isClosed
                            ? "bg-gray-100 text-gray-500"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {lot.isClosed ? "Closed" : "Open"}
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

function InputField({ label, type, value, onChange }: { label: string; type: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} step={type === "number" ? "any" : undefined} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
    </div>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: number; onChange: (v: string) => void; options: { value: number; label: string }[] }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none">
        <option value={0}>Select...</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
