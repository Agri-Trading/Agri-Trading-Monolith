using Lotexa.Application.Interfaces;
using Lotexa.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Lotexa.Infrastructure.Data.Repositories;

public class PurchaseLotRepository : Repository<PurchaseLot>, IPurchaseLotRepository
{
    public PurchaseLotRepository(LotexaDbContext context) : base(context) { }

    public async Task<PurchaseLot?> GetLotWithDetailsAsync(int lotId, CancellationToken ct = default)
    {
        return await _dbSet
            .Include(l => l.Crop)
            .Include(l => l.Farmer)
            .Include(l => l.Warehouse)
            .Include(l => l.UnitOfMeasure)
            .Include(l => l.Expenses)
            .Include(l => l.Tests)
            .Include(l => l.Adjustments)
            .Include(l => l.SaleAllocations)
            .FirstOrDefaultAsync(l => l.Id == lotId, ct);
    }

    public async Task<List<PurchaseLot>> GetLotsByCropOrderedByDateAsync(int cropId, CancellationToken ct = default)
    {
        return await _dbSet
            .Include(l => l.Adjustments)
            .Include(l => l.SaleAllocations)
            .Include(l => l.Expenses)
            .Where(l => l.CropId == cropId && !l.IsClosed)
            .OrderBy(l => l.PurchaseDate)
            .ThenBy(l => l.Id)
            .ToListAsync(ct);
    }
}
