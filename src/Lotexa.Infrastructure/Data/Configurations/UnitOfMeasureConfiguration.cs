using Lotexa.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Lotexa.Infrastructure.Data.Configurations;

public class UnitOfMeasureConfiguration : IEntityTypeConfiguration<UnitOfMeasure>
{
    public void Configure(EntityTypeBuilder<UnitOfMeasure> builder)
    {
        builder.Property(u => u.Code).IsRequired().HasMaxLength(10);
        builder.Property(u => u.Name).IsRequired().HasMaxLength(50);
        builder.HasIndex(u => u.Code).IsUnique();
    }
}
