namespace Lotexa.Domain.Entities;

public class Trader : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? UserId { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<TraderAddress> Addresses { get; set; } = new List<TraderAddress>();
    public ICollection<Sale> Sales { get; set; } = new List<Sale>();
    public ICollection<PriceQuote> PriceQuotes { get; set; } = new List<PriceQuote>();
}
