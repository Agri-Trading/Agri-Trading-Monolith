namespace Lotexa.Domain.Entities;

public class Sale : BaseEntity
{
    public int CropId { get; set; }
    public int TraderId { get; set; }
    public decimal Quantity { get; set; }
    public decimal SellPricePerUom { get; set; }
    public DateOnly SaleDate { get; set; }
    public string? Notes { get; set; }

    public Crop Crop { get; set; } = null!;
    public Trader Trader { get; set; } = null!;

    public ICollection<SaleAllocation> Allocations { get; set; } = new List<SaleAllocation>();
    public ICollection<SaleExpense> Expenses { get; set; } = new List<SaleExpense>();
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
}
