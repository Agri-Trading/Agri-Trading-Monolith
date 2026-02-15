using Lotexa.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Lotexa.Infrastructure.Data.Configurations;

public class FarmerConfiguration : IEntityTypeConfiguration<Farmer>
{
    public void Configure(EntityTypeBuilder<Farmer> builder)
    {
        builder.Property(f => f.Name).IsRequired().HasMaxLength(100);
        builder.Property(f => f.Phone).HasMaxLength(20);
        builder.Property(f => f.Email).HasMaxLength(100);
        builder.HasMany(f => f.Addresses).WithOne(a => a.Farmer).HasForeignKey(a => a.FarmerId).OnDelete(DeleteBehavior.Cascade);
    }
}

public class FarmerAddressConfiguration : IEntityTypeConfiguration<FarmerAddress>
{
    public void Configure(EntityTypeBuilder<FarmerAddress> builder)
    {
        builder.Property(a => a.AddressLine1).IsRequired().HasMaxLength(200);
        builder.Property(a => a.AddressLine2).HasMaxLength(200);
        builder.Property(a => a.City).IsRequired().HasMaxLength(100);
        builder.Property(a => a.State).IsRequired().HasMaxLength(100);
        builder.Property(a => a.PinCode).IsRequired().HasMaxLength(10);
    }
}
