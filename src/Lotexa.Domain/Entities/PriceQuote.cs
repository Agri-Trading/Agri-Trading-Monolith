namespace Lotexa.Domain.Entities;

public class PriceQuote : BaseEntity
{
    public int CropId { get; set; }
    public int TraderId { get; set; }
    public decimal PricePerUom { get; set; }
    public DateOnly QuoteDate { get; set; }
    public string? Notes { get; set; }
    public bool IsActive { get; set; } = true;

    public Crop Crop { get; set; } = null!;
    public Trader Trader { get; set; } = null!;
}
