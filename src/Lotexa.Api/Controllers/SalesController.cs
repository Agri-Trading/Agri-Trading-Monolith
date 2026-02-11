using Lotexa.Application.DTOs;
using Lotexa.Application.Interfaces;
using Lotexa.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lotexa.Api.Controllers;

[ApiController]
[Route("api/sales")]
[Authorize]
public class SalesController : ControllerBase
{
    private readonly IUnitOfWork _uow;
    private readonly IFifoSaleAllocationService _fifoService;

    public SalesController(IUnitOfWork uow, IFifoSaleAllocationService fifoService)
    {
        _uow = uow;
        _fifoService = fifoService;
    }

    [HttpPost]
    public async Task<ActionResult<SaleDto>> Create([FromBody] CreateSaleRequest request, CancellationToken ct)
    {
        try
        {
            var result = await _fifoService.CreateSaleWithAllocationsAsync(request, ct);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet]
    public async Task<ActionResult<List<SaleDto>>> GetAll(
        [FromQuery] int? cropId, [FromQuery] int? traderId,
        [FromQuery] DateOnly? from, [FromQuery] DateOnly? to, CancellationToken ct)
    {
        var query = _uow.Sales.Query()
            .Include(s => s.Crop).Include(s => s.Trader)
            .Include(s => s.Allocations).ThenInclude(a => a.PurchaseLot)
            .Include(s => s.Expenses).Include(s => s.Payments)
            .AsQueryable();

        if (cropId.HasValue) query = query.Where(s => s.CropId == cropId.Value);
        if (traderId.HasValue) query = query.Where(s => s.TraderId == traderId.Value);
        if (from.HasValue) query = query.Where(s => s.SaleDate >= from.Value);
        if (to.HasValue) query = query.Where(s => s.SaleDate <= to.Value);

        var sales = await query.OrderByDescending(s => s.SaleDate).ToListAsync(ct);
        return Ok(sales.Select(MapToDto));
    }

    [HttpGet("{saleId}")]
    public async Task<ActionResult<SaleDto>> Get(int saleId, CancellationToken ct)
    {
        var sale = await _uow.Sales.GetSaleWithDetailsAsync(saleId, ct);
        if (sale == null) return NotFound();
        return Ok(MapToDto(sale));
    }

    [HttpPost("{saleId}/expenses")]
    public async Task<ActionResult<SaleExpenseDto>> AddExpense(int saleId, [FromBody] CreateSaleExpenseRequest request, CancellationToken ct)
    {
        var sale = await _uow.Repository<Sale>().GetByIdAsync(saleId, ct);
        if (sale == null) return NotFound();

        var expense = new SaleExpense
        {
            SaleId = saleId,
            Description = request.Description,
            Amount = request.Amount,
            ExpenseDate = request.ExpenseDate
        };
        await _uow.Repository<SaleExpense>().AddAsync(expense, ct);
        await _uow.SaveChangesAsync(ct);
        return Ok(new SaleExpenseDto { Id = expense.Id, Description = expense.Description, Amount = expense.Amount, ExpenseDate = expense.ExpenseDate });
    }

    [HttpPost("{saleId}/payments")]
    public async Task<ActionResult<PaymentDto>> AddPayment(int saleId, [FromBody] CreatePaymentRequest request, CancellationToken ct)
    {
        var sale = await _uow.Repository<Sale>().GetByIdAsync(saleId, ct);
        if (sale == null) return NotFound();

        var payment = new Payment
        {
            SaleId = saleId,
            Amount = request.Amount,
            PaymentDate = request.PaymentDate,
            PaymentMethod = request.PaymentMethod,
            ReferenceNumber = request.ReferenceNumber,
            Notes = request.Notes
        };
        await _uow.Repository<Payment>().AddAsync(payment, ct);
        await _uow.SaveChangesAsync(ct);
        return Ok(new PaymentDto
        {
            Id = payment.Id, Amount = payment.Amount, PaymentDate = payment.PaymentDate,
            PaymentMethod = payment.PaymentMethod, ReferenceNumber = payment.ReferenceNumber, Notes = payment.Notes
        });
    }

    private static SaleDto MapToDto(Sale s)
    {
        var revenue = s.Quantity * s.SellPricePerUom;
        var totalCost = s.Allocations.Sum(a => a.QuantityAllocated * a.CostPerUomAtAllocation);
        var saleExpenses = s.Expenses.Sum(e => e.Amount);

        return new SaleDto
        {
            Id = s.Id,
            CropId = s.CropId,
            CropName = s.Crop?.Name ?? "",
            TraderId = s.TraderId,
            TraderName = s.Trader?.Name ?? "",
            Quantity = s.Quantity,
            SellPricePerUom = s.SellPricePerUom,
            SaleDate = s.SaleDate,
            Notes = s.Notes,
            Revenue = revenue,
            TotalCost = totalCost,
            NetProfit = revenue - totalCost - saleExpenses,
            Allocations = s.Allocations.Select(a => new SaleAllocationDto
            {
                Id = a.Id,
                PurchaseLotId = a.PurchaseLotId,
                LotNumber = a.PurchaseLot?.LotNumber ?? "",
                QuantityAllocated = a.QuantityAllocated,
                CostPerUomAtAllocation = a.CostPerUomAtAllocation
            }).ToList(),
            Expenses = s.Expenses.Select(e => new SaleExpenseDto { Id = e.Id, Description = e.Description, Amount = e.Amount, ExpenseDate = e.ExpenseDate }).ToList(),
            Payments = s.Payments.Select(p => new PaymentDto
            {
                Id = p.Id, Amount = p.Amount, PaymentDate = p.PaymentDate,
                PaymentMethod = p.PaymentMethod, ReferenceNumber = p.ReferenceNumber, Notes = p.Notes
            }).ToList()
        };
    }
}
