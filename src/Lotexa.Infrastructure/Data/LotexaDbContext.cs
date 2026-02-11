using Lotexa.Domain.Entities;
using Lotexa.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Lotexa.Infrastructure.Data;

public class LotexaDbContext : IdentityDbContext<ApplicationUser>
{
    public LotexaDbContext(DbContextOptions<LotexaDbContext> options) : base(options) { }

    public DbSet<Crop> Crops => Set<Crop>();
    public DbSet<UnitOfMeasure> UnitsOfMeasure => Set<UnitOfMeasure>();
    public DbSet<Warehouse> Warehouses => Set<Warehouse>();
    public DbSet<Farmer> Farmers => Set<Farmer>();
    public DbSet<FarmerAddress> FarmerAddresses => Set<FarmerAddress>();
    public DbSet<Trader> Traders => Set<Trader>();
    public DbSet<TraderAddress> TraderAddresses => Set<TraderAddress>();
    public DbSet<PurchaseLot> PurchaseLots => Set<PurchaseLot>();
    public DbSet<LotExpense> LotExpenses => Set<LotExpense>();
    public DbSet<LotTest> LotTests => Set<LotTest>();
    public DbSet<LotAdjustment> LotAdjustments => Set<LotAdjustment>();
    public DbSet<PriceQuote> PriceQuotes => Set<PriceQuote>();
    public DbSet<Sale> Sales => Set<Sale>();
    public DbSet<SaleAllocation> SaleAllocations => Set<SaleAllocation>();
    public DbSet<SaleExpense> SaleExpenses => Set<SaleExpense>();
    public DbSet<Payment> Payments => Set<Payment>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.ApplyConfigurationsFromAssembly(typeof(LotexaDbContext).Assembly);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            if (entry.State == EntityState.Modified)
                entry.Entity.UpdatedAt = DateTime.UtcNow;
        }
        return base.SaveChangesAsync(cancellationToken);
    }
}
