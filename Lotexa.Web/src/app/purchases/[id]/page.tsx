"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Shell from "@/components/Shell";
import api from "@/lib/api";
import type { PurchaseLotDto } from "@/lib/types";

type Tab = "expenses" | "tests" | "adjustments";

export default function PurchaseDetailPage() {
  const { id } = useParams();
  const [lot, setLot] = useState<PurchaseLotDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("expenses");

  const load = async () => {
    try {
      const res = await api.get(`/purchases/${id}`);
      setLot(res.data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  // Add expense
  const [expDesc, setExpDesc] = useState("");
  const [expAmt, setExpAmt] = useState("");
  const [expDate, setExpDate] = useState(new Date().toISOString().slice(0, 10));

  const addExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post(`/purchases/${id}/expenses`, { description: expDesc, amount: parseFloat(expAmt), expenseDate: expDate });
    setExpDesc(""); setExpAmt("");
    load();
  };

  // Add test
  const [testName, setTestName] = useState("");
  const [testResult, setTestResult] = useState("");
  const [testNotes, setTestNotes] = useState("");
  const [testDate, setTestDate] = useState(new Date().toISOString().slice(0, 10));

  const addTest = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post(`/purchases/${id}/tests`, { testName, result: testResult || null, notes: testNotes || null, testDate });
    setTestName(""); setTestResult(""); setTestNotes("");
    load();
  };

  // Add adjustment
  const [adjDelta, setAdjDelta] = useState("");
  const [adjReason, setAdjReason] = useState("");
  const [adjDate, setAdjDate] = useState(new Date().toISOString().slice(0, 10));

  const addAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post(`/purchases/${id}/adjustments`, { qtyDelta: parseFloat(adjDelta), reason: adjReason, adjustmentDate: adjDate });
    setAdjDelta(""); setAdjReason("");
    load();
  };

  const closeLot = async () => {
    if (!confirm("Close this lot? This cannot be undone.")) return;
    await api.post(`/purchases/${id}/close`);
    load();
  };

  if (loading) return <Shell><div className="text-center py-12 text-gray-400">Loading...</div></Shell>;
  if (!lot) return <Shell><div className="text-center py-12 text-gray-400">Lot not found.</div></Shell>;

  const unitCost = lot.quantity > 0 ? lot.totalCost / lot.quantity : 0;

  return (
    <Shell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{lot.lotNumber}</h2>
            <p className="text-gray-500 mt-1">
              {lot.cropName} from {lot.farmerName} &middot; {lot.purchaseDate}
            </p>
          </div>
          {!lot.isClosed && (
            <button onClick={closeLot} className="px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors">
              Close Lot
            </button>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card label="Quantity" value={lot.quantity.toString()} sub={lot.uomCode} />
          <Card label="Available" value={lot.availableQty.toString()} sub={lot.uomCode} highlight />
          <Card label="Buy Price" value={`${lot.buyPricePerUom}`} sub="per UOM" />
          <Card label="Total Cost" value={lot.totalCost.toFixed(2)} sub={`Unit: ${unitCost.toFixed(2)}`} />
        </div>

        {/* Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div><span className="text-gray-500">Warehouse</span><div className="font-medium">{lot.warehouseName}</div></div>
          <div><span className="text-gray-500">Other Charges</span><div className="font-medium">{lot.otherCharges}</div></div>
          <div><span className="text-gray-500">Status</span><div className="font-medium">{lot.isClosed ? "Closed" : "Open"}</div></div>
          {lot.notes && <div><span className="text-gray-500">Notes</span><div className="font-medium">{lot.notes}</div></div>}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
          {(["expenses", "tests", "adjustments"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors capitalize ${
                tab === t ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t} ({t === "expenses" ? lot.expenses.length : t === "tests" ? lot.tests.length : lot.adjustments.length})
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === "expenses" && (
          <div className="space-y-4">
            {!lot.isClosed && (
              <form onSubmit={addExpense} className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-end">
                <Field label="Description" value={expDesc} onChange={setExpDesc} />
                <Field label="Amount" value={expAmt} onChange={setExpAmt} type="number" />
                <Field label="Date" value={expDate} onChange={setExpDate} type="date" />
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700">Add</button>
              </form>
            )}
            <Table
              cols={["Description", "Amount", "Date"]}
              rows={lot.expenses.map((e) => [e.description, e.amount.toFixed(2), e.expenseDate])}
            />
          </div>
        )}

        {tab === "tests" && (
          <div className="space-y-4">
            {!lot.isClosed && (
              <form onSubmit={addTest} className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-end">
                <Field label="Test Name" value={testName} onChange={setTestName} />
                <Field label="Result" value={testResult} onChange={setTestResult} />
                <Field label="Notes" value={testNotes} onChange={setTestNotes} />
                <Field label="Date" value={testDate} onChange={setTestDate} type="date" />
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700">Add</button>
              </form>
            )}
            <Table
              cols={["Test Name", "Result", "Notes", "Date"]}
              rows={lot.tests.map((t) => [t.testName, t.result ?? "-", t.notes ?? "-", t.testDate])}
            />
          </div>
        )}

        {tab === "adjustments" && (
          <div className="space-y-4">
            {!lot.isClosed && (
              <form onSubmit={addAdjustment} className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-end">
                <Field label="Qty Delta" value={adjDelta} onChange={setAdjDelta} type="number" />
                <Field label="Reason" value={adjReason} onChange={setAdjReason} />
                <Field label="Date" value={adjDate} onChange={setAdjDate} type="date" />
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700">Add</button>
              </form>
            )}
            <Table
              cols={["Qty Delta", "Reason", "Date"]}
              rows={lot.adjustments.map((a) => [a.qtyDelta > 0 ? `+${a.qtyDelta}` : `${a.qtyDelta}`, a.reason, a.adjustmentDate])}
            />
          </div>
        )}
      </div>
    </Shell>
  );
}

function Card({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: boolean }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`text-xl font-bold mt-1 ${highlight ? "text-emerald-700" : "text-gray-900"}`}>{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} step={type === "number" ? "any" : undefined} required className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none w-36" />
    </div>
  );
}

function Table({ cols, rows }: { cols: string[]; rows: string[][] }) {
  if (rows.length === 0) return <p className="text-gray-400 text-sm">No records.</p>;
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-left text-gray-500">
            {cols.map((c) => <th key={c} className="px-4 py-3 font-medium">{c}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50">
              {row.map((cell, j) => <td key={j} className="px-4 py-3">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
