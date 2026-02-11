export interface AuthResponse { token: string; email: string; role: string; expiresAt: string }
export interface CropDto { id: number; name: string; description?: string; isActive: boolean }
export interface UnitOfMeasureDto { id: number; code: string; name: string; isActive: boolean }
export interface WarehouseDto { id: number; name: string; location?: string; isActive: boolean }
export interface FarmerDto { id: number; name: string; phone?: string; email?: string; isActive: boolean; addresses: FarmerAddressDto[] }
export interface FarmerAddressDto { id: number; addressLine1: string; addressLine2?: string; city: string; state: string; pinCode: string; isPrimary: boolean }
export interface TraderDto { id: number; name: string; phone?: string; email?: string; isActive: boolean; addresses: TraderAddressDto[] }
export interface TraderAddressDto { id: number; addressLine1: string; addressLine2?: string; city: string; state: string; pinCode: string; isPrimary: boolean }
export interface LotExpenseDto { id: number; description: string; amount: number; expenseDate: string }
export interface LotTestDto { id: number; testName: string; result?: string; notes?: string; testDate: string }
export interface LotAdjustmentDto { id: number; qtyDelta: number; reason: string; adjustmentDate: string }
export interface PurchaseLotDto { id: number; lotNumber: string; cropId: number; cropName: string; farmerId: number; farmerName: string; warehouseId: number; warehouseName: string; unitOfMeasureId: number; uomCode: string; quantity: number; buyPricePerUom: number; otherCharges: number; purchaseDate: string; notes?: string; isClosed: boolean; availableQty: number; totalCost: number; expenses: LotExpenseDto[]; tests: LotTestDto[]; adjustments: LotAdjustmentDto[] }
export interface SaleAllocationDto { id: number; purchaseLotId: number; lotNumber: string; quantityAllocated: number; costPerUomAtAllocation: number }
export interface SaleExpenseDto { id: number; description: string; amount: number; expenseDate: string }
export interface PaymentDto { id: number; amount: number; paymentDate: string; paymentMethod?: string; referenceNumber?: string; notes?: string }
export interface SaleDto { id: number; cropId: number; cropName: string; traderId: number; traderName: string; quantity: number; sellPricePerUom: number; saleDate: string; notes?: string; revenue: number; totalCost: number; netProfit: number; allocations: SaleAllocationDto[]; expenses: SaleExpenseDto[]; payments: PaymentDto[] }
export interface PriceQuoteDto { id: number; cropId: number; cropName: string; traderId: number; traderName: string; pricePerUom: number; quoteDate: string; notes?: string; isActive: boolean }
export interface StockSummaryDto { cropId: number; cropName: string; totalAvailableQty: number }
export interface LotStockDto { lotId: number; lotNumber: string; cropName: string; farmerName: string; purchaseDate: string; quantity: number; availableQty: number; daysSincePurchase: number; unitCost: number }
export interface ProfitPreviewDto { cropName: string; saleQty: number; sellPricePerUom: number; revenue: number; estimatedCost: number; estimatedProfit: number; allocations: { lotNumber: string; qtyFromLot: number; costPerUom: number }[] }
export interface BreakEvenDto { cropId: number; cropName: string; weightedAvgCostPerUom: number; totalAvailableQty: number }
export interface SaleProfitDto { saleId: number; cropName: string; traderName: string; saleDate: string; quantity: number; sellPricePerUom: number; revenue: number; totalCost: number; saleExpenses: number; netProfit: number }
