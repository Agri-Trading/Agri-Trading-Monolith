namespace Lotexa.Domain.Entities;

public class Crop : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<PurchaseLot> PurchaseLots { get; set; } = new List<PurchaseLot>();
    public ICollection<Sale> Sales { get; set; } = new List<Sale>();
    public ICollection<PriceQuote> PriceQuotes { get; set; } = new List<PriceQuote>();
}
