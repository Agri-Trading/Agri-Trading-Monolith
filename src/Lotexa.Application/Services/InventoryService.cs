using Lotexa.Application.DTOs;
using Lotexa.Application.Interfaces;
using Lotexa.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Lotexa.Application.Services;

public class InventoryService : IInventoryService
{
    private readonly IUnitOfWork _uow;

    public InventoryService(IUnitOfWork uow)
    {
        _uow = uow;
    }

    public async Task<decimal> GetAvailableQtyForLotAsync(int lotId, CancellationToken ct = default)
    {
        var lot = await _uow.PurchaseLots.Query()
            .Include(l => l.Adjustments)
            .Include(l => l.SaleAllocations)
            .FirstOrDefaultAsync(l => l.Id == lotId, ct);

        if (lot == null) return 0;

        return lot.Quantity
            + lot.Adjustments.Sum(a => a.QtyDelta)
            - lot.SaleAllocations.Sum(sa => sa.QuantityAllocated);
    }

    public async Task<List<StockSummaryDto>> GetStockSummaryAsync(int? cropId, CancellationToken ct = default)
    {
        var query = _uow.PurchaseLots.Query()
            .Include(l => l.Adjustments)
            .Include(l => l.SaleAllocations)
            .Include(l => l.Crop)
            .Where(l => !l.IsClosed)
            .AsQueryable();

        if (cropId.HasValue)
            query = query.Where(l => l.CropId == cropId.Value);

        var lots = await query.ToListAsync(ct);

        return lots
            .GroupBy(l => new { l.CropId, l.Crop.Name })
            .Select(g => new StockSummaryDto
            {
                CropId = g.Key.CropId,
                CropName = g.Key.Name,
                TotalAvailableQty = g.Sum(l =>
                    l.Quantity
                    + l.Adjustments.Sum(a => a.QtyDelta)
                    - l.SaleAllocations.Sum(sa => sa.QuantityAllocated))
            })
            .Where(s => s.TotalAvailableQty > 0)
            .ToList();
    }

    public async Task<List<LotStockDto>> GetLotStockAsync(int? cropId, CancellationToken ct = default)
    {
        var query = _uow.PurchaseLots.Query()
            .Include(l => l.Adjustments)
            .Include(l => l.SaleAllocations)
            .Include(l => l.Crop)
            .Include(l => l.Farmer)
            .Include(l => l.Expenses)
            .Where(l => !l.IsClosed)
            .AsQueryable();

        if (cropId.HasValue)
            query = query.Where(l => l.CropId == cropId.Value);

        var lots = await query.ToListAsync(ct);
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        return lots.Select(l =>
        {
            var availableQty = l.Quantity
                + l.Adjustments.Sum(a => a.QtyDelta)
                - l.SaleAllocations.Sum(sa => sa.QuantityAllocated);

            var totalExpenses = l.Expenses.Sum(e => e.Amount);
            var unitCost = l.BuyPricePerUom + (l.OtherCharges + totalExpenses) / l.Quantity;

            return new LotStockDto
            {
                LotId = l.Id,
                LotNumber = l.LotNumber,
                CropName = l.Crop.Name,
                FarmerName = l.Farmer.Name,
                PurchaseDate = l.PurchaseDate,
                Quantity = l.Quantity,
                AvailableQty = availableQty,
                DaysSincePurchase = today.DayNumber - l.PurchaseDate.DayNumber,
                UnitCost = unitCost
            };
        })
        .Where(l => l.AvailableQty > 0)
        .ToList();
    }

    public async Task<BreakEvenDto> GetBreakEvenAsync(int cropId, CancellationToken ct = default)
    {
        var lots = await _uow.PurchaseLots.Query()
            .Include(l => l.Adjustments)
            .Include(l => l.SaleAllocations)
            .Include(l => l.Expenses)
            .Include(l => l.Crop)
            .Where(l => l.CropId == cropId && !l.IsClosed)
            .ToListAsync(ct);

        var cropName = lots.FirstOrDefault()?.Crop.Name ?? "";
        decimal totalQty = 0;
        decimal totalCost = 0;

        foreach (var l in lots)
        {
            var available = l.Quantity
                + l.Adjustments.Sum(a => a.QtyDelta)
                - l.SaleAllocations.Sum(sa => sa.QuantityAllocated);

            if (available <= 0) continue;

            var totalExpenses = l.Expenses.Sum(e => e.Amount);
            var unitCost = l.BuyPricePerUom + (l.OtherCharges + totalExpenses) / l.Quantity;

            totalQty += available;
            totalCost += available * unitCost;
        }

        return new BreakEvenDto
        {
            CropId = cropId,
            CropName = cropName,
            TotalAvailableQty = totalQty,
            WeightedAvgCostPerUom = totalQty > 0 ? totalCost / totalQty : 0
        };
    }
}
