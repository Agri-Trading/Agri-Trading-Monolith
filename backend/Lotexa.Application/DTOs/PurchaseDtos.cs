namespace Lotexa.Application.DTOs;

public class PurchaseLotDto
{
    public int Id { get; set; }
    public string LotNumber { get; set; } = string.Empty;
    public int CropId { get; set; }
    public string CropName { get; set; } = string.Empty;
    public int FarmerId { get; set; }
    public string FarmerName { get; set; } = string.Empty;
    public int WarehouseId { get; set; }
    public string WarehouseName { get; set; } = string.Empty;
    public int UnitOfMeasureId { get; set; }
    public string UomCode { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal BuyPricePerUom { get; set; }
    public decimal OtherCharges { get; set; }
    public DateOnly PurchaseDate { get; set; }
    public string? Notes { get; set; }
    public bool IsClosed { get; set; }
    public decimal AvailableQty { get; set; }
    public decimal TotalCost { get; set; }
    public List<LotExpenseDto> Expenses { get; set; } = new();
    public List<LotTestDto> Tests { get; set; } = new();
    public List<LotAdjustmentDto> Adjustments { get; set; } = new();
}

public class CreatePurchaseLotRequest
{
    public int CropId { get; set; }
    public int FarmerId { get; set; }
    public int WarehouseId { get; set; }
    public int UnitOfMeasureId { get; set; }
    public decimal Quantity { get; set; }
    public decimal BuyPricePerUom { get; set; }
    public decimal OtherCharges { get; set; }
    public DateOnly PurchaseDate { get; set; }
    public string? Notes { get; set; }
}

public class LotExpenseDto
{
    public int Id { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateOnly ExpenseDate { get; set; }
}

public class CreateLotExpenseRequest
{
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateOnly ExpenseDate { get; set; }
}

public class LotTestDto
{
    public int Id { get; set; }
    public string TestName { get; set; } = string.Empty;
    public string? Result { get; set; }
    public string? Notes { get; set; }
    public DateOnly TestDate { get; set; }
}

public class CreateLotTestRequest
{
    public string TestName { get; set; } = string.Empty;
    public string? Result { get; set; }
    public string? Notes { get; set; }
    public DateOnly TestDate { get; set; }
}

public class LotAdjustmentDto
{
    public int Id { get; set; }
    public decimal QtyDelta { get; set; }
    public string Reason { get; set; } = string.Empty;
    public DateOnly AdjustmentDate { get; set; }
}

public class CreateLotAdjustmentRequest
{
    public decimal QtyDelta { get; set; }
    public string Reason { get; set; } = string.Empty;
    public DateOnly AdjustmentDate { get; set; }
}
