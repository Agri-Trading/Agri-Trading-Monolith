using Lotexa.Domain.Entities;

namespace Lotexa.Application.Interfaces;

public interface IPurchaseLotRepository : IRepository<PurchaseLot>
{
    Task<PurchaseLot?> GetLotWithDetailsAsync(int lotId, CancellationToken ct = default);
    Task<List<PurchaseLot>> GetLotsByCropOrderedByDateAsync(int cropId, CancellationToken ct = default);
}
