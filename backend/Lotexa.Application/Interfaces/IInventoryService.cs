using Lotexa.Application.DTOs;

namespace Lotexa.Application.Interfaces;

public interface IInventoryService
{
    Task<decimal> GetAvailableQtyForLotAsync(int lotId, CancellationToken ct = default);
    Task<List<StockSummaryDto>> GetStockSummaryAsync(int? cropId, CancellationToken ct = default);
    Task<List<LotStockDto>> GetLotStockAsync(int? cropId, CancellationToken ct = default);
    Task<BreakEvenDto> GetBreakEvenAsync(int cropId, CancellationToken ct = default);
    Task<List<BreakEvenDto>> GetAllBreakEvensAsync(CancellationToken ct = default);
}
