namespace Lotexa.Domain.Entities;

public class Warehouse : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Location { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<PurchaseLot> PurchaseLots { get; set; } = new List<PurchaseLot>();
}
