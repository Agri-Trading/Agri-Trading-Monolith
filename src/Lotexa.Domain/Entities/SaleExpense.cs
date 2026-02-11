namespace Lotexa.Domain.Entities;

public class SaleExpense : BaseEntity
{
    public int SaleId { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateOnly ExpenseDate { get; set; }

    public Sale Sale { get; set; } = null!;
}
