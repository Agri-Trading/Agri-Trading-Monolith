using Lotexa.Application.Interfaces;
using Lotexa.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Lotexa.Infrastructure.Data.Repositories;

public class QuoteRepository : Repository<PriceQuote>, IQuoteRepository
{
    public QuoteRepository(LotexaDbContext context) : base(context) { }

    public async Task<PriceQuote?> GetLatestQuoteAsync(int cropId, CancellationToken ct = default)
    {
        return await _dbSet
            .Include(q => q.Crop)
            .Include(q => q.Trader)
            .Where(q => q.CropId == cropId && q.IsActive)
            .OrderByDescending(q => q.QuoteDate)
            .ThenByDescending(q => q.Id)
            .FirstOrDefaultAsync(ct);
    }
}
