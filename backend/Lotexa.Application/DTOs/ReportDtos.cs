namespace Lotexa.Application.DTOs;

public class StockSummaryDto
{
    public int CropId { get; set; }
    public string CropName { get; set; } = string.Empty;
    public decimal TotalAvailableQty { get; set; }
}

public class LotStockDto
{
    public int LotId { get; set; }
    public string LotNumber { get; set; } = string.Empty;
    public string CropName { get; set; } = string.Empty;
    public string FarmerName { get; set; } = string.Empty;
    public DateOnly PurchaseDate { get; set; }
    public decimal Quantity { get; set; }
    public decimal AvailableQty { get; set; }
    public int DaysSincePurchase { get; set; }
    public decimal UnitCost { get; set; }
}

public class ProfitPreviewDto
{
    public string CropName { get; set; } = string.Empty;
    public decimal SaleQty { get; set; }
    public decimal SellPricePerUom { get; set; }
    public decimal Revenue { get; set; }
    public decimal EstimatedCost { get; set; }
    public decimal EstimatedProfit { get; set; }
    public List<PreviewAllocationDto> Allocations { get; set; } = new();
}

public class PreviewAllocationDto
{
    public string LotNumber { get; set; } = string.Empty;
    public decimal QtyFromLot { get; set; }
    public decimal CostPerUom { get; set; }
}

public class BreakEvenDto
{
    public int CropId { get; set; }
    public string CropName { get; set; } = string.Empty;
    public decimal WeightedAvgCostPerUom { get; set; }
    public decimal TotalAvailableQty { get; set; }
}

public class SaleProfitDto
{
    public int SaleId { get; set; }
    public string CropName { get; set; } = string.Empty;
    public string TraderName { get; set; } = string.Empty;
    public DateOnly SaleDate { get; set; }
    public decimal Quantity { get; set; }
    public decimal SellPricePerUom { get; set; }
    public decimal Revenue { get; set; }
    public decimal TotalCost { get; set; }
    public decimal SaleExpenses { get; set; }
    public decimal NetProfit { get; set; }
}
