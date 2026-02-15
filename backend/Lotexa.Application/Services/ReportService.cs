using Lotexa.Application.DTOs;
using Lotexa.Application.Interfaces;
using Lotexa.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Lotexa.Application.Services;

public class ReportService : IReportService
{
    private readonly IUnitOfWork _uow;

    public ReportService(IUnitOfWork uow)
    {
        _uow = uow;
    }

    public async Task<SaleProfitDto> GetSaleProfitAsync(int saleId, CancellationToken ct = default)
    {
        var sale = await _uow.Sales.Query()
            .Include(s => s.Allocations)
            .Include(s => s.Expenses)
            .Include(s => s.Crop)
            .Include(s => s.Trader)
            .FirstOrDefaultAsync(s => s.Id == saleId, ct)
            ?? throw new InvalidOperationException($"Sale {saleId} not found");

        var revenue = sale.Quantity * sale.SellPricePerUom;
        var totalCost = sale.Allocations.Sum(a => a.QuantityAllocated * a.CostPerUomAtAllocation);
        var saleExpenses = sale.Expenses.Sum(e => e.Amount);

        return new SaleProfitDto
        {
            SaleId = sale.Id,
            CropName = sale.Crop.Name,
            TraderName = sale.Trader.Name,
            SaleDate = sale.SaleDate,
            Quantity = sale.Quantity,
            SellPricePerUom = sale.SellPricePerUom,
            Revenue = revenue,
            TotalCost = totalCost,
            SaleExpenses = saleExpenses,
            NetProfit = revenue - totalCost - saleExpenses
        };
    }
}
