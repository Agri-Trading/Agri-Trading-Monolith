namespace Lotexa.Domain.Entities;

public class Farmer : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? UserId { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<FarmerAddress> Addresses { get; set; } = new List<FarmerAddress>();
    public ICollection<PurchaseLot> PurchaseLots { get; set; } = new List<PurchaseLot>();
}
