"use client";
import { useEffect, useState } from "react";
import Shell from "@/components/Shell";
import api from "@/lib/api";
import type { StockSummaryDto, BreakEvenDto, CropDto } from "@/lib/types";

export default function DashboardPage() {
  const [stock, setStock] = useState<StockSummaryDto[]>([]);
  const [breakEvens, setBreakEvens] = useState<BreakEvenDto[]>([]);
  const [crops, setCrops] = useState<CropDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [stockRes, cropsRes] = await Promise.all([
          api.get("/reports/stock"),
          api.get("/crops"),
        ]);
        setStock(stockRes.data);
        setCrops(cropsRes.data);

        const bePromises = (cropsRes.data as CropDto[]).map((c) =>
          api.get(`/reports/breakeven?cropId=${c.id}`).catch(() => null)
        );
        const beResults = await Promise.all(bePromises);
        setBreakEvens(
          beResults.filter((r) => r !== null).map((r) => r!.data)
        );
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Shell>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-500 mt-1">Stock overview and break-even analysis</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : (
          <>
            {/* Stock Summary Cards */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Current Stock</h3>
              {stock.length === 0 ? (
                <p className="text-gray-400 text-sm">No stock available yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stock.map((s) => (
                    <div
                      key={s.cropId}
                      className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
                    >
                      <div className="text-sm text-gray-500">{s.cropName}</div>
                      <div className="text-2xl font-bold text-emerald-700 mt-1">
                        {s.totalAvailableQty.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">Available Qty</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Break-even */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Break-Even Prices</h3>
              {breakEvens.length === 0 ? (
                <p className="text-gray-400 text-sm">No break-even data available.</p>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-left text-gray-500">
                        <th className="px-5 py-3 font-medium">Crop</th>
                        <th className="px-5 py-3 font-medium text-right">Avg Cost / UOM</th>
                        <th className="px-5 py-3 font-medium text-right">Total Available</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {breakEvens.map((b) => (
                        <tr key={b.cropId} className="hover:bg-gray-50">
                          <td className="px-5 py-3 font-medium text-gray-900">
                            {b.cropName}
                          </td>
                          <td className="px-5 py-3 text-right text-emerald-700 font-semibold">
                            {b.weightedAvgCostPerUom.toFixed(2)}
                          </td>
                          <td className="px-5 py-3 text-right text-gray-600">
                            {b.totalAvailableQty.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Crops quick list */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Registered Crops</h3>
              <div className="flex flex-wrap gap-2">
                {crops.map((c) => (
                  <span
                    key={c.id}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-emerald-50 text-emerald-700 border border-emerald-200"
                  >
                    {c.name}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </Shell>
  );
}
