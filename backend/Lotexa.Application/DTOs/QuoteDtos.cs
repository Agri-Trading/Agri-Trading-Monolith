namespace Lotexa.Application.DTOs;

public class PriceQuoteDto
{
    public int Id { get; set; }
    public int CropId { get; set; }
    public string CropName { get; set; } = string.Empty;
    public int TraderId { get; set; }
    public string TraderName { get; set; } = string.Empty;
    public decimal PricePerUom { get; set; }
    public DateOnly QuoteDate { get; set; }
    public string? Notes { get; set; }
    public bool IsActive { get; set; }
}

public class CreatePriceQuoteRequest
{
    public int CropId { get; set; }
    public int TraderId { get; set; }
    public decimal PricePerUom { get; set; }
    public DateOnly QuoteDate { get; set; }
    public string? Notes { get; set; }
}
