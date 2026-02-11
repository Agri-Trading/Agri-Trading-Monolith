namespace Lotexa.Domain.Entities;

public class LotAdjustment : BaseEntity
{
    public int PurchaseLotId { get; set; }
    public decimal QtyDelta { get; set; }
    public string Reason { get; set; } = string.Empty;
    public DateOnly AdjustmentDate { get; set; }

    public PurchaseLot PurchaseLot { get; set; } = null!;
}
