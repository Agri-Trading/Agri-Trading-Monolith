using Lotexa.Domain.Entities;

namespace Lotexa.Application.Interfaces;

public interface ISaleRepository : IRepository<Sale>
{
    Task<Sale?> GetSaleWithDetailsAsync(int saleId, CancellationToken ct = default);
}
