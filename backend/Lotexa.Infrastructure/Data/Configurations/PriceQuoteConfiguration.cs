using Lotexa.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Lotexa.Infrastructure.Data.Configurations;

public class PriceQuoteConfiguration : IEntityTypeConfiguration<PriceQuote>
{
    public void Configure(EntityTypeBuilder<PriceQuote> builder)
    {
        builder.Property(q => q.PricePerUom).HasPrecision(18, 4);
        builder.Property(q => q.QuoteDate).HasColumnType("date");
        builder.Property(q => q.Notes).HasMaxLength(1000);

        builder.HasOne(q => q.Crop).WithMany(c => c.PriceQuotes).HasForeignKey(q => q.CropId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(q => q.Trader).WithMany(t => t.PriceQuotes).HasForeignKey(q => q.TraderId).OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(q => q.QuoteDate);
    }
}
