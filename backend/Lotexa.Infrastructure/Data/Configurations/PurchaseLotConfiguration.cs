using Lotexa.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Lotexa.Infrastructure.Data.Configurations;

public class PurchaseLotConfiguration : IEntityTypeConfiguration<PurchaseLot>
{
    public void Configure(EntityTypeBuilder<PurchaseLot> builder)
    {
        builder.Property(l => l.LotNumber).IsRequired().HasMaxLength(50);
        builder.HasIndex(l => l.LotNumber).IsUnique();
        builder.Property(l => l.Quantity).HasPrecision(18, 4);
        builder.Property(l => l.BuyPricePerUom).HasPrecision(18, 4);
        builder.Property(l => l.OtherCharges).HasPrecision(18, 4);
        builder.Property(l => l.PurchaseDate).HasColumnType("date");
        builder.Property(l => l.Notes).HasMaxLength(1000);

        builder.HasOne(l => l.Crop).WithMany(c => c.PurchaseLots).HasForeignKey(l => l.CropId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(l => l.Farmer).WithMany(f => f.PurchaseLots).HasForeignKey(l => l.FarmerId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(l => l.Warehouse).WithMany(w => w.PurchaseLots).HasForeignKey(l => l.WarehouseId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(l => l.UnitOfMeasure).WithMany(u => u.PurchaseLots).HasForeignKey(l => l.UnitOfMeasureId).OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(l => l.PurchaseDate);
        builder.HasIndex(l => l.CropId);
    }
}

public class LotExpenseConfiguration : IEntityTypeConfiguration<LotExpense>
{
    public void Configure(EntityTypeBuilder<LotExpense> builder)
    {
        builder.Property(e => e.Description).IsRequired().HasMaxLength(200);
        builder.Property(e => e.Amount).HasPrecision(18, 4);
        builder.Property(e => e.ExpenseDate).HasColumnType("date");
        builder.HasOne(e => e.PurchaseLot).WithMany(l => l.Expenses).HasForeignKey(e => e.PurchaseLotId).OnDelete(DeleteBehavior.Cascade);
    }
}

public class LotTestConfiguration : IEntityTypeConfiguration<LotTest>
{
    public void Configure(EntityTypeBuilder<LotTest> builder)
    {
        builder.Property(t => t.TestName).IsRequired().HasMaxLength(100);
        builder.Property(t => t.Result).HasMaxLength(500);
        builder.Property(t => t.Notes).HasMaxLength(1000);
        builder.Property(t => t.TestDate).HasColumnType("date");
        builder.HasOne(t => t.PurchaseLot).WithMany(l => l.Tests).HasForeignKey(t => t.PurchaseLotId).OnDelete(DeleteBehavior.Cascade);
    }
}

public class LotAdjustmentConfiguration : IEntityTypeConfiguration<LotAdjustment>
{
    public void Configure(EntityTypeBuilder<LotAdjustment> builder)
    {
        builder.Property(a => a.QtyDelta).HasPrecision(18, 4);
        builder.Property(a => a.Reason).IsRequired().HasMaxLength(500);
        builder.Property(a => a.AdjustmentDate).HasColumnType("date");
        builder.HasOne(a => a.PurchaseLot).WithMany(l => l.Adjustments).HasForeignKey(a => a.PurchaseLotId).OnDelete(DeleteBehavior.Cascade);
    }
}
