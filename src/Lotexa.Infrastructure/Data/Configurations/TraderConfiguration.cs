using Lotexa.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Lotexa.Infrastructure.Data.Configurations;

public class TraderConfiguration : IEntityTypeConfiguration<Trader>
{
    public void Configure(EntityTypeBuilder<Trader> builder)
    {
        builder.Property(t => t.Name).IsRequired().HasMaxLength(100);
        builder.Property(t => t.Phone).HasMaxLength(20);
        builder.Property(t => t.Email).HasMaxLength(100);
        builder.HasMany(t => t.Addresses).WithOne(a => a.Trader).HasForeignKey(a => a.TraderId).OnDelete(DeleteBehavior.Cascade);
    }
}

public class TraderAddressConfiguration : IEntityTypeConfiguration<TraderAddress>
{
    public void Configure(EntityTypeBuilder<TraderAddress> builder)
    {
        builder.Property(a => a.AddressLine1).IsRequired().HasMaxLength(200);
        builder.Property(a => a.AddressLine2).HasMaxLength(200);
        builder.Property(a => a.City).IsRequired().HasMaxLength(100);
        builder.Property(a => a.State).IsRequired().HasMaxLength(100);
        builder.Property(a => a.PinCode).IsRequired().HasMaxLength(10);
    }
}
