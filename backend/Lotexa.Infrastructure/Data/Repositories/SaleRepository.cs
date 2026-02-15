using Lotexa.Application.Interfaces;
using Lotexa.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Lotexa.Infrastructure.Data.Repositories;

public class SaleRepository : Repository<Sale>, ISaleRepository
{
    public SaleRepository(LotexaDbContext context) : base(context) { }

    public async Task<Sale?> GetSaleWithDetailsAsync(int saleId, CancellationToken ct = default)
    {
        return await _dbSet
            .Include(s => s.Crop)
            .Include(s => s.Trader)
            .Include(s => s.Allocations)
                .ThenInclude(a => a.PurchaseLot)
            .Include(s => s.Expenses)
            .Include(s => s.Payments)
            .FirstOrDefaultAsync(s => s.Id == saleId, ct);
    }
}
