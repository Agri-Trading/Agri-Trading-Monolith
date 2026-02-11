namespace Lotexa.Domain.Entities;

public class LotExpense : BaseEntity
{
    public int PurchaseLotId { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateOnly ExpenseDate { get; set; }

    public PurchaseLot PurchaseLot { get; set; } = null!;
}
