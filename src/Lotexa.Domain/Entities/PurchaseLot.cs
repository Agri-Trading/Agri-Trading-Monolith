namespace Lotexa.Domain.Entities;

public class PurchaseLot : BaseEntity
{
    public string LotNumber { get; set; } = string.Empty;
    public int CropId { get; set; }
    public int FarmerId { get; set; }
    public int WarehouseId { get; set; }
    public int UnitOfMeasureId { get; set; }
    public decimal Quantity { get; set; }
    public decimal BuyPricePerUom { get; set; }
    public decimal OtherCharges { get; set; }
    public DateOnly PurchaseDate { get; set; }
    public string? Notes { get; set; }
    public bool IsClosed { get; set; }

    public Crop Crop { get; set; } = null!;
    public Farmer Farmer { get; set; } = null!;
    public Warehouse Warehouse { get; set; } = null!;
    public UnitOfMeasure UnitOfMeasure { get; set; } = null!;

    public ICollection<LotExpense> Expenses { get; set; } = new List<LotExpense>();
    public ICollection<LotTest> Tests { get; set; } = new List<LotTest>();
    public ICollection<LotAdjustment> Adjustments { get; set; } = new List<LotAdjustment>();
    public ICollection<SaleAllocation> SaleAllocations { get; set; } = new List<SaleAllocation>();
}
