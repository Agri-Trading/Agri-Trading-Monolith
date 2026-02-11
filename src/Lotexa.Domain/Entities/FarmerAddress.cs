namespace Lotexa.Domain.Entities;

public class FarmerAddress : BaseEntity
{
    public int FarmerId { get; set; }
    public string AddressLine1 { get; set; } = string.Empty;
    public string? AddressLine2 { get; set; }
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string PinCode { get; set; } = string.Empty;
    public bool IsPrimary { get; set; }

    public Farmer Farmer { get; set; } = null!;
}
