using Lotexa.Application.DTOs;
using Lotexa.Application.Interfaces;
using Lotexa.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lotexa.Api.Controllers;

[ApiController]
[Route("api/purchases")]
[Authorize]
public class PurchasesController : ControllerBase
{
    private readonly IUnitOfWork _uow;
    private readonly IInventoryService _inventoryService;

    public PurchasesController(IUnitOfWork uow, IInventoryService inventoryService)
    {
        _uow = uow;
        _inventoryService = inventoryService;
    }

    [HttpPost]
    public async Task<ActionResult<PurchaseLotDto>> Create([FromBody] CreatePurchaseLotRequest request, CancellationToken ct)
    {
        var lotNumber = $"LOT-{DateTime.UtcNow:yyyyMMdd}-{Random.Shared.Next(1000, 9999)}";
        var lot = new PurchaseLot
        {
            LotNumber = lotNumber,
            CropId = request.CropId,
            FarmerId = request.FarmerId,
            WarehouseId = request.WarehouseId,
            UnitOfMeasureId = request.UnitOfMeasureId,
            Quantity = request.Quantity,
            BuyPricePerUom = request.BuyPricePerUom,
            OtherCharges = request.OtherCharges,
            PurchaseDate = request.PurchaseDate,
            Notes = request.Notes
        };

        await _uow.Repository<PurchaseLot>().AddAsync(lot, ct);
        await _uow.SaveChangesAsync(ct);

        var created = await _uow.PurchaseLots.GetLotWithDetailsAsync(lot.Id, ct);
        return Ok(MapToDto(created!));
    }

    [HttpGet]
    public async Task<ActionResult<List<PurchaseLotDto>>> GetAll(
        [FromQuery] int? cropId, [FromQuery] int? farmerId,
        [FromQuery] DateOnly? from, [FromQuery] DateOnly? to, CancellationToken ct)
    {
        var query = _uow.PurchaseLots.Query()
            .Include(l => l.Crop).Include(l => l.Farmer).Include(l => l.Warehouse)
            .Include(l => l.UnitOfMeasure).Include(l => l.Expenses)
            .Include(l => l.Tests).Include(l => l.Adjustments).Include(l => l.SaleAllocations)
            .AsQueryable();

        if (cropId.HasValue) query = query.Where(l => l.CropId == cropId.Value);
        if (farmerId.HasValue) query = query.Where(l => l.FarmerId == farmerId.Value);
        if (from.HasValue) query = query.Where(l => l.PurchaseDate >= from.Value);
        if (to.HasValue) query = query.Where(l => l.PurchaseDate <= to.Value);

        var lots = await query.OrderByDescending(l => l.PurchaseDate).ToListAsync(ct);
        return Ok(lots.Select(MapToDto));
    }

    [HttpGet("{lotId}")]
    public async Task<ActionResult<PurchaseLotDto>> Get(int lotId, CancellationToken ct)
    {
        var lot = await _uow.PurchaseLots.GetLotWithDetailsAsync(lotId, ct);
        if (lot == null) return NotFound();
        return Ok(MapToDto(lot));
    }

    [HttpPost("{lotId}/expenses")]
    public async Task<ActionResult<LotExpenseDto>> AddExpense(int lotId, [FromBody] CreateLotExpenseRequest request, CancellationToken ct)
    {
        var lot = await _uow.Repository<PurchaseLot>().GetByIdAsync(lotId, ct);
        if (lot == null) return NotFound();

        var expense = new LotExpense
        {
            PurchaseLotId = lotId,
            Description = request.Description,
            Amount = request.Amount,
            ExpenseDate = request.ExpenseDate
        };
        await _uow.Repository<LotExpense>().AddAsync(expense, ct);
        await _uow.SaveChangesAsync(ct);
        return Ok(new LotExpenseDto { Id = expense.Id, Description = expense.Description, Amount = expense.Amount, ExpenseDate = expense.ExpenseDate });
    }

    [HttpPost("{lotId}/tests")]
    public async Task<ActionResult<LotTestDto>> AddTest(int lotId, [FromBody] CreateLotTestRequest request, CancellationToken ct)
    {
        var lot = await _uow.Repository<PurchaseLot>().GetByIdAsync(lotId, ct);
        if (lot == null) return NotFound();

        var test = new LotTest
        {
            PurchaseLotId = lotId,
            TestName = request.TestName,
            Result = request.Result,
            Notes = request.Notes,
            TestDate = request.TestDate
        };
        await _uow.Repository<LotTest>().AddAsync(test, ct);
        await _uow.SaveChangesAsync(ct);
        return Ok(new LotTestDto { Id = test.Id, TestName = test.TestName, Result = test.Result, Notes = test.Notes, TestDate = test.TestDate });
    }

    [HttpPost("{lotId}/adjustments")]
    public async Task<ActionResult<LotAdjustmentDto>> AddAdjustment(int lotId, [FromBody] CreateLotAdjustmentRequest request, CancellationToken ct)
    {
        var lot = await _uow.Repository<PurchaseLot>().GetByIdAsync(lotId, ct);
        if (lot == null) return NotFound();
        if (lot.IsClosed) return BadRequest(new { message = "Cannot adjust a closed lot" });

        var adj = new LotAdjustment
        {
            PurchaseLotId = lotId,
            QtyDelta = request.QtyDelta,
            Reason = request.Reason,
            AdjustmentDate = request.AdjustmentDate
        };
        await _uow.Repository<LotAdjustment>().AddAsync(adj, ct);
        await _uow.SaveChangesAsync(ct);
        return Ok(new LotAdjustmentDto { Id = adj.Id, QtyDelta = adj.QtyDelta, Reason = adj.Reason, AdjustmentDate = adj.AdjustmentDate });
    }

    [HttpPost("{lotId}/close")]
    public async Task<ActionResult> Close(int lotId, CancellationToken ct)
    {
        var lot = await _uow.Repository<PurchaseLot>().GetByIdAsync(lotId, ct);
        if (lot == null) return NotFound();
        lot.IsClosed = true;
        _uow.Repository<PurchaseLot>().Update(lot);
        await _uow.SaveChangesAsync(ct);
        return Ok(new { message = "Lot closed" });
    }

    private static PurchaseLotDto MapToDto(PurchaseLot l)
    {
        var availableQty = l.Quantity
            + l.Adjustments.Sum(a => a.QtyDelta)
            - l.SaleAllocations.Sum(sa => sa.QuantityAllocated);
        var totalExpenses = l.Expenses.Sum(e => e.Amount);

        return new PurchaseLotDto
        {
            Id = l.Id,
            LotNumber = l.LotNumber,
            CropId = l.CropId,
            CropName = l.Crop?.Name ?? "",
            FarmerId = l.FarmerId,
            FarmerName = l.Farmer?.Name ?? "",
            WarehouseId = l.WarehouseId,
            WarehouseName = l.Warehouse?.Name ?? "",
            UnitOfMeasureId = l.UnitOfMeasureId,
            UomCode = l.UnitOfMeasure?.Code ?? "",
            Quantity = l.Quantity,
            BuyPricePerUom = l.BuyPricePerUom,
            OtherCharges = l.OtherCharges,
            PurchaseDate = l.PurchaseDate,
            Notes = l.Notes,
            IsClosed = l.IsClosed,
            AvailableQty = availableQty,
            TotalCost = (l.BuyPricePerUom * l.Quantity) + l.OtherCharges + totalExpenses,
            Expenses = l.Expenses.Select(e => new LotExpenseDto { Id = e.Id, Description = e.Description, Amount = e.Amount, ExpenseDate = e.ExpenseDate }).ToList(),
            Tests = l.Tests.Select(t => new LotTestDto { Id = t.Id, TestName = t.TestName, Result = t.Result, Notes = t.Notes, TestDate = t.TestDate }).ToList(),
            Adjustments = l.Adjustments.Select(a => new LotAdjustmentDto { Id = a.Id, QtyDelta = a.QtyDelta, Reason = a.Reason, AdjustmentDate = a.AdjustmentDate }).ToList()
        };
    }
}
