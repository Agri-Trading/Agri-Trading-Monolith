using Lotexa.Application.DTOs;

namespace Lotexa.Application.Interfaces;

public interface IFifoSaleAllocationService
{
    Task<SaleDto> CreateSaleWithAllocationsAsync(CreateSaleRequest request, CancellationToken ct = default);
    Task<ProfitPreviewDto> PreviewProfitAsync(int cropId, decimal qty, decimal sellPrice, CancellationToken ct = default);
}
