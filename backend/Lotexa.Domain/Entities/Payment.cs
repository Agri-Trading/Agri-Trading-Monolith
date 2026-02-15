namespace Lotexa.Domain.Entities;

public class Payment : BaseEntity
{
    public int SaleId { get; set; }
    public decimal Amount { get; set; }
    public DateOnly PaymentDate { get; set; }
    public string? PaymentMethod { get; set; }
    public string? ReferenceNumber { get; set; }
    public string? Notes { get; set; }

    public Sale Sale { get; set; } = null!;
}
