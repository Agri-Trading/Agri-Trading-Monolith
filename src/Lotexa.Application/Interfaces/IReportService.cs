using Lotexa.Application.DTOs;

namespace Lotexa.Application.Interfaces;

public interface IReportService
{
    Task<SaleProfitDto> GetSaleProfitAsync(int saleId, CancellationToken ct = default);
}
