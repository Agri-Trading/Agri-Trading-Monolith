namespace Lotexa.Application.DTOs;

public class SaleDto
{
    public int Id { get; set; }
    public int CropId { get; set; }
    public string CropName { get; set; } = string.Empty;
    public int TraderId { get; set; }
    public string TraderName { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal SellPricePerUom { get; set; }
    public DateOnly SaleDate { get; set; }
    public string? Notes { get; set; }
    public decimal Revenue { get; set; }
    public decimal TotalCost { get; set; }
    public decimal NetProfit { get; set; }
    public List<SaleAllocationDto> Allocations { get; set; } = new();
    public List<SaleExpenseDto> Expenses { get; set; } = new();
    public List<PaymentDto> Payments { get; set; } = new();
}

public class CreateSaleRequest
{
    public int CropId { get; set; }
    public int TraderId { get; set; }
    public decimal Quantity { get; set; }
    public decimal SellPricePerUom { get; set; }
    public DateOnly SaleDate { get; set; }
    public string? Notes { get; set; }
}

public class SaleAllocationDto
{
    public int Id { get; set; }
    public int PurchaseLotId { get; set; }
    public string LotNumber { get; set; } = string.Empty;
    public decimal QuantityAllocated { get; set; }
    public decimal CostPerUomAtAllocation { get; set; }
}

public class SaleExpenseDto
{
    public int Id { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateOnly ExpenseDate { get; set; }
}

public class CreateSaleExpenseRequest
{
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateOnly ExpenseDate { get; set; }
}

public class PaymentDto
{
    public int Id { get; set; }
    public decimal Amount { get; set; }
    public DateOnly PaymentDate { get; set; }
    public string? PaymentMethod { get; set; }
    public string? ReferenceNumber { get; set; }
    public string? Notes { get; set; }
}

public class CreatePaymentRequest
{
    public decimal Amount { get; set; }
    public DateOnly PaymentDate { get; set; }
    public string? PaymentMethod { get; set; }
    public string? ReferenceNumber { get; set; }
    public string? Notes { get; set; }
}
