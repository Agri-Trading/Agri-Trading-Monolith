using Lotexa.Domain.Entities;

namespace Lotexa.Application.Interfaces;

public interface IQuoteRepository : IRepository<PriceQuote>
{
    Task<PriceQuote?> GetLatestQuoteAsync(int cropId, CancellationToken ct = default);
}
