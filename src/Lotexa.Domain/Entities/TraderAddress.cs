namespace Lotexa.Domain.Entities;

public class TraderAddress : BaseEntity
{
    public int TraderId { get; set; }
    public string AddressLine1 { get; set; } = string.Empty;
    public string? AddressLine2 { get; set; }
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string PinCode { get; set; } = string.Empty;
    public bool IsPrimary { get; set; }

    public Trader Trader { get; set; } = null!;
}
