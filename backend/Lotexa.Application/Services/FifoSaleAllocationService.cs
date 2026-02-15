using Lotexa.Application.DTOs;
using Lotexa.Application.Interfaces;
using Lotexa.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Lotexa.Application.Services;

public class FifoSaleAllocationService : IFifoSaleAllocationService
{
    private readonly IUnitOfWork _uow;
    private readonly IInventoryService _inventoryService;

    public FifoSaleAllocationService(IUnitOfWork uow, IInventoryService inventoryService)
    {
        _uow = uow;
        _inventoryService = inventoryService;
    }

    public async Task<SaleDto> CreateSaleWithAllocationsAsync(CreateSaleRequest request, CancellationToken ct = default)
    {
        var eligibleLots = await _uow.PurchaseLots.Query()
            .Include(l => l.Adjustments)
            .Include(l => l.SaleAllocations)
            .Include(l => l.Expenses)
            .Include(l => l.Crop)
            .Where(l => l.CropId == request.CropId && !l.IsClosed)
            .OrderBy(l => l.PurchaseDate)
            .ThenBy(l => l.Id)
            .ToListAsync(ct);

        var lotsWithAvailability = eligibleLots.Select(l => new
        {
            Lot = l,
            Available = l.Quantity
                + l.Adjustments.Sum(a => a.QtyDelta)
                - l.SaleAllocations.Sum(sa => sa.QuantityAllocated),
            UnitCost = l.BuyPricePerUom + (l.OtherCharges + l.Expenses.Sum(e => e.Amount)) / l.Quantity
        }).Where(x => x.Available > 0).ToList();

        var totalAvailable = lotsWithAvailability.Sum(x => x.Available);
        if (totalAvailable < request.Quantity)
            throw new InvalidOperationException(
                $"Insufficient stock. Available: {totalAvailable}, Requested: {request.Quantity}");

        await _uow.BeginTransactionAsync(ct);
        try
        {
            var sale = new Sale
            {
                CropId = request.CropId,
                TraderId = request.TraderId,
                Quantity = request.Quantity,
                SellPricePerUom = request.SellPricePerUom,
                SaleDate = request.SaleDate,
                Notes = request.Notes
            };

            await _uow.Repository<Sale>().AddAsync(sale, ct);
            await _uow.SaveChangesAsync(ct);

            var allocations = new List<SaleAllocation>();
            var remaining = request.Quantity;

            foreach (var item in lotsWithAvailability)
            {
                if (remaining <= 0) break;

                var allocQty = Math.Min(remaining, item.Available);
                var allocation = new SaleAllocation
                {
                    SaleId = sale.Id,
                    PurchaseLotId = item.Lot.Id,
                    QuantityAllocated = allocQty,
                    CostPerUomAtAllocation = item.UnitCost
                };

                await _uow.Repository<SaleAllocation>().AddAsync(allocation, ct);
                allocations.Add(allocation);
                remaining -= allocQty;
            }

            await _uow.SaveChangesAsync(ct);
            await _uow.CommitAsync(ct);

            var revenue = sale.Quantity * sale.SellPricePerUom;
            var totalCost = allocations.Sum(a => a.QuantityAllocated * a.CostPerUomAtAllocation);

            return new SaleDto
            {
                Id = sale.Id,
                CropId = sale.CropId,
                CropName = eligibleLots.First().Crop.Name,
                TraderId = sale.TraderId,
                Quantity = sale.Quantity,
                SellPricePerUom = sale.SellPricePerUom,
                SaleDate = sale.SaleDate,
                Notes = sale.Notes,
                Revenue = revenue,
                TotalCost = totalCost,
                NetProfit = revenue - totalCost,
                Allocations = allocations.Select(a => new SaleAllocationDto
                {
                    Id = a.Id,
                    PurchaseLotId = a.PurchaseLotId,
                    LotNumber = eligibleLots.First(l => l.Id == a.PurchaseLotId).LotNumber,
                    QuantityAllocated = a.QuantityAllocated,
                    CostPerUomAtAllocation = a.CostPerUomAtAllocation
                }).ToList(),
                Expenses = new List<SaleExpenseDto>(),
                Payments = new List<PaymentDto>()
            };
        }
        catch
        {
            await _uow.RollbackAsync(ct);
            throw;
        }
    }

    public async Task<ProfitPreviewDto> PreviewProfitAsync(int cropId, decimal qty, decimal sellPrice, CancellationToken ct = default)
    {
        var eligibleLots = await _uow.PurchaseLots.Query()
            .Include(l => l.Adjustments)
            .Include(l => l.SaleAllocations)
            .Include(l => l.Expenses)
            .Include(l => l.Crop)
            .Where(l => l.CropId == cropId && !l.IsClosed)
            .OrderBy(l => l.PurchaseDate)
            .ThenBy(l => l.Id)
            .ToListAsync(ct);

        var lotsWithAvailability = eligibleLots.Select(l => new
        {
            Lot = l,
            Available = l.Quantity
                + l.Adjustments.Sum(a => a.QtyDelta)
                - l.SaleAllocations.Sum(sa => sa.QuantityAllocated),
            UnitCost = l.BuyPricePerUom + (l.OtherCharges + l.Expenses.Sum(e => e.Amount)) / l.Quantity
        }).Where(x => x.Available > 0).ToList();

        var previewAllocations = new List<PreviewAllocationDto>();
        var remaining = qty;
        decimal estimatedCost = 0;

        foreach (var item in lotsWithAvailability)
        {
            if (remaining <= 0) break;

            var allocQty = Math.Min(remaining, item.Available);
            previewAllocations.Add(new PreviewAllocationDto
            {
                LotNumber = item.Lot.LotNumber,
                QtyFromLot = allocQty,
                CostPerUom = item.UnitCost
            });

            estimatedCost += allocQty * item.UnitCost;
            remaining -= allocQty;
        }

        var revenue = qty * sellPrice;
        var cropName = eligibleLots.FirstOrDefault()?.Crop.Name ?? "";

        return new ProfitPreviewDto
        {
            CropName = cropName,
            SaleQty = qty,
            SellPricePerUom = sellPrice,
            Revenue = revenue,
            EstimatedCost = estimatedCost,
            EstimatedProfit = revenue - estimatedCost,
            Allocations = previewAllocations
        };
    }
}
