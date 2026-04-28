"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Shell from "@/components/Shell";
import api from "@/lib/api";
import type { SaleDto } from "@/lib/types";

type Tab = "expenses" | "payments";

export default function SaleDetailPage() {
  const { id } = useParams();
  const [sale, setSale] = useState<SaleDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("expenses");

  const load = async () => {
    try {
      const res = await api.get(`/sales/${id}`);
      setSale(res.data);
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
  const [savingExp, setSavingExp] = useState(false);

  const addExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingExp(true);
    try {
      await api.post(`/sales/${id}/expenses`, {
        description: expDesc,
        amount: parseFloat(expAmt),
        expenseDate: expDate,
      });
      setExpDesc("");
      setExpAmt("");
      load();
    } finally {
      setSavingExp(false);
    }
  };

  // Add payment
  const [payAmt, setPayAmt] = useState("");
  const [payDate, setPayDate] = useState(new Date().toISOString().slice(0, 10));
  const [payMethod, setPayMethod] = useState("");
  const [payRef, setPayRef] = useState("");
  const [payNotes, setPayNotes] = useState("");
  const [savingPay, setSavingPay] = useState(false);

  const addPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPay(true);
    try {
      await api.post(`/sales/${id}/payments`, {
        amount: parseFloat(payAmt),
        paymentDate: payDate,
        paymentMethod: payMethod || null,
        referenceNumber: payRef || null,
        notes: payNotes || null,
      });
      setPayAmt("");
      setPayMethod("");
      setPayRef("");
      setPayNotes("");
      load();
    } finally {
      setSavingPay(false);
    }
  };

  if (loading) return <Shell><div className="text-center py-12 text-gray-400">Loading...</div></Shell>;
  if (!sale) return <Shell><div className="text-center py-12 text-gray-400">Sale not found.</div></Shell>;

  const saleExpensesTotal = sale.expenses.reduce((s, e) => s + e.amount, 0);
  const paymentsTotal = sale.payments.reduce((s, p) => s + p.amount, 0);
  const outstanding = sale.revenue - paymentsTotal;

  return (
    <Shell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{sale.cropName}</h2>
          <p className="text-gray-500 mt-1">
            {sale.traderName} &middot; {sale.saleDate}
            {sale.notes && <span> &middot; {sale.notes}</span>}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card label="Quantity" value={sale.quantity.toLocaleString("en-IN")} />
          <Card label="Sell Price / UOM" value={`₹${sale.sellPricePerUom.toFixed(2)}`} />
          <Card label="Revenue" value={`₹${sale.revenue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} highlight="blue" />
          <Card label="FIFO Cost" value={`₹${sale.totalCost.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
          <Card label="Sale Expenses" value={`₹${saleExpensesTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} highlight="orange" />
          <Card
            label="Net Profit"
            value={`₹${sale.netProfit.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            highlight={sale.netProfit >= 0 ? "green" : "red"}
          />
        </div>

        {/* FIFO Allocations */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700">FIFO Allocations</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500">
                  <th className="px-4 py-3 font-medium">Lot #</th>
                  <th className="px-4 py-3 font-medium text-right">Qty Allocated</th>
                  <th className="px-4 py-3 font-medium text-right">Cost / UOM</th>
                  <th className="px-4 py-3 font-medium text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sale.allocations.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-sm">{a.lotNumber}</td>
                    <td className="px-4 py-3 text-right">{a.quantityAllocated}</td>
                    <td className="px-4 py-3 text-right">₹{a.costPerUomAtAllocation.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-medium">
                      ₹{(a.quantityAllocated * a.costPerUomAtAllocation).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 font-semibold">
                  <td className="px-4 py-3 text-gray-600" colSpan={3}>Total FIFO Cost</td>
                  <td className="px-4 py-3 text-right">
                    ₹{sale.totalCost.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
          {(["expenses", "payments"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors capitalize ${
                tab === t ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "expenses"
                ? `Expenses (${sale.expenses.length})`
                : `Payments (${sale.payments.length})`}
            </button>
          ))}
        </div>

        {/* Expenses Tab */}
        {tab === "expenses" && (
          <div className="space-y-4">
            <form
              onSubmit={addExpense}
              className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-end"
            >
              <Field label="Description" value={expDesc} onChange={setExpDesc} />
              <Field label="Amount" value={expAmt} onChange={setExpAmt} type="number" />
              <Field label="Date" value={expDate} onChange={setExpDate} type="date" />
              <button
                type="submit"
                disabled={savingExp}
                className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 disabled:opacity-50"
              >
                {savingExp ? "Adding..." : "Add Expense"}
              </button>
            </form>

            {sale.expenses.length === 0 ? (
              <p className="text-gray-400 text-sm">No expenses recorded.</p>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left text-gray-500">
                      <th className="px-4 py-3 font-medium">Description</th>
                      <th className="px-4 py-3 font-medium text-right">Amount</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {sale.expenses.map((ex) => (
                      <tr key={ex.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">{ex.description}</td>
                        <td className="px-4 py-3 text-right text-orange-600 font-medium">
                          ₹{ex.amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-gray-500">{ex.expenseDate}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 font-semibold">
                      <td className="px-4 py-3 text-gray-600">Total</td>
                      <td className="px-4 py-3 text-right text-orange-700">
                        ₹{saleExpensesTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Payments Tab */}
        {tab === "payments" && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex flex-wrap gap-6 text-sm">
              <div>
                <span className="text-blue-600 font-medium">Revenue</span>
                <div className="text-gray-800 font-semibold">₹{sale.revenue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
              <div>
                <span className="text-blue-600 font-medium">Received</span>
                <div className="text-emerald-700 font-semibold">₹{paymentsTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
              <div>
                <span className="text-blue-600 font-medium">Outstanding</span>
                <div className={`font-semibold ${outstanding > 0 ? "text-red-600" : "text-emerald-600"}`}>
                  ₹{outstanding.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            <form
              onSubmit={addPayment}
              className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-end"
            >
              <Field label="Amount" value={payAmt} onChange={setPayAmt} type="number" />
              <Field label="Date" value={payDate} onChange={setPayDate} type="date" />
              <Field label="Method" value={payMethod} onChange={setPayMethod} placeholder="Cash / UPI / NEFT" />
              <Field label="Reference #" value={payRef} onChange={setPayRef} />
              <Field label="Notes" value={payNotes} onChange={setPayNotes} />
              <button
                type="submit"
                disabled={savingPay}
                className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 disabled:opacity-50"
              >
                {savingPay ? "Adding..." : "Record Payment"}
              </button>
            </form>

            {sale.payments.length === 0 ? (
              <p className="text-gray-400 text-sm">No payments recorded.</p>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left text-gray-500">
                      <th className="px-4 py-3 font-medium text-right">Amount</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Method</th>
                      <th className="px-4 py-3 font-medium">Reference</th>
                      <th className="px-4 py-3 font-medium">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {sale.payments.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-right text-emerald-700 font-medium">
                          ₹{p.amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-gray-500">{p.paymentDate}</td>
                        <td className="px-4 py-3">{p.paymentMethod ?? "-"}</td>
                        <td className="px-4 py-3 text-gray-500">{p.referenceNumber ?? "-"}</td>
                        <td className="px-4 py-3 text-gray-500">{p.notes ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 font-semibold">
                      <td className="px-4 py-3 text-right text-emerald-700">
                        ₹{paymentsTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td colSpan={4} className="px-4 py-3 text-gray-600">Total Received</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </Shell>
  );
}

function Card({
  label, value, highlight,
}: {
  label: string; value: string; highlight?: "blue" | "green" | "red" | "orange";
}) {
  const colorMap = {
    blue: "text-blue-700",
    green: "text-emerald-700",
    red: "text-red-600",
    orange: "text-orange-600",
  };
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`text-lg font-bold mt-1 ${highlight ? colorMap[highlight] : "text-gray-900"}`}>{value}</div>
    </div>
  );
}

function Field({
  label, value, onChange, type = "text", placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        step={type === "number" ? "any" : undefined}
        required={type === "number" || label === "Description"}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none w-36"
      />
    </div>
  );
}
