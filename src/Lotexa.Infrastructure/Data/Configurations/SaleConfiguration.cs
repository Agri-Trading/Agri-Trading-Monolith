using Lotexa.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Lotexa.Infrastructure.Data.Configurations;

public class SaleConfiguration : IEntityTypeConfiguration<Sale>
{
    public void Configure(EntityTypeBuilder<Sale> builder)
    {
        builder.Property(s => s.Quantity).HasPrecision(18, 4);
        builder.Property(s => s.SellPricePerUom).HasPrecision(18, 4);
        builder.Property(s => s.SaleDate).HasColumnType("date");
        builder.Property(s => s.Notes).HasMaxLength(1000);

        builder.HasOne(s => s.Crop).WithMany(c => c.Sales).HasForeignKey(s => s.CropId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(s => s.Trader).WithMany(t => t.Sales).HasForeignKey(s => s.TraderId).OnDelete(DeleteBehavior.Restrict);
    }
}

public class SaleAllocationConfiguration : IEntityTypeConfiguration<SaleAllocation>
{
    public void Configure(EntityTypeBuilder<SaleAllocation> builder)
    {
        builder.Property(a => a.QuantityAllocated).HasPrecision(18, 4);
        builder.Property(a => a.CostPerUomAtAllocation).HasPrecision(18, 4);

        builder.HasOne(a => a.Sale).WithMany(s => s.Allocations).HasForeignKey(a => a.SaleId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(a => a.PurchaseLot).WithMany(l => l.SaleAllocations).HasForeignKey(a => a.PurchaseLotId).OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(a => new { a.SaleId, a.PurchaseLotId }).IsUnique();
    }
}

public class SaleExpenseConfiguration : IEntityTypeConfiguration<SaleExpense>
{
    public void Configure(EntityTypeBuilder<SaleExpense> builder)
    {
        builder.Property(e => e.Description).IsRequired().HasMaxLength(200);
        builder.Property(e => e.Amount).HasPrecision(18, 4);
        builder.Property(e => e.ExpenseDate).HasColumnType("date");
        builder.HasOne(e => e.Sale).WithMany(s => s.Expenses).HasForeignKey(e => e.SaleId).OnDelete(DeleteBehavior.Cascade);
    }
}

public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        builder.Property(p => p.Amount).HasPrecision(18, 4);
        builder.Property(p => p.PaymentDate).HasColumnType("date");
        builder.Property(p => p.PaymentMethod).HasMaxLength(50);
        builder.Property(p => p.ReferenceNumber).HasMaxLength(100);
        builder.Property(p => p.Notes).HasMaxLength(1000);
        builder.HasOne(p => p.Sale).WithMany(s => s.Payments).HasForeignKey(p => p.SaleId).OnDelete(DeleteBehavior.Cascade);
    }
}
