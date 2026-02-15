namespace Lotexa.Domain.Entities;

public class SaleAllocation : BaseEntity
{
    public int SaleId { get; set; }
    public int PurchaseLotId { get; set; }
    public decimal QuantityAllocated { get; set; }
    public decimal CostPerUomAtAllocation { get; set; }

    public Sale Sale { get; set; } = null!;
    public PurchaseLot PurchaseLot { get; set; } = null!;
}
