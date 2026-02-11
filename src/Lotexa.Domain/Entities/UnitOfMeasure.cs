namespace Lotexa.Domain.Entities;

public class UnitOfMeasure : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;

    public ICollection<PurchaseLot> PurchaseLots { get; set; } = new List<PurchaseLot>();
}
