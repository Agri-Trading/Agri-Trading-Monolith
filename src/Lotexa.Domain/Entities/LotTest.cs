namespace Lotexa.Domain.Entities;

public class LotTest : BaseEntity
{
    public int PurchaseLotId { get; set; }
    public string TestName { get; set; } = string.Empty;
    public string? Result { get; set; }
    public string? Notes { get; set; }
    public DateOnly TestDate { get; set; }

    public PurchaseLot PurchaseLot { get; set; } = null!;
}
