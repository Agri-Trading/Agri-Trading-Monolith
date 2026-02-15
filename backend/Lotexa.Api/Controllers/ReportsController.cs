using Lotexa.Application.DTOs;
using Lotexa.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Lotexa.Api.Controllers;

[ApiController]
[Route("api/reports")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly IInventoryService _inventoryService;
    private readonly IFifoSaleAllocationService _fifoService;
    private readonly IReportService _reportService;

    public ReportsController(
        IInventoryService inventoryService,
        IFifoSaleAllocationService fifoService,
        IReportService reportService)
    {
        _inventoryService = inventoryService;
        _fifoService = fifoService;
        _reportService = reportService;
    }

    [HttpGet("stock")]
    public async Task<ActionResult<List<StockSummaryDto>>> GetStock([FromQuery] int? cropId, CancellationToken ct)
        => Ok(await _inventoryService.GetStockSummaryAsync(cropId, ct));

    [HttpGet("lot-stock")]
    public async Task<ActionResult<List<LotStockDto>>> GetLotStock([FromQuery] int? cropId, CancellationToken ct)
        => Ok(await _inventoryService.GetLotStockAsync(cropId, ct));

    [HttpGet("profit-preview")]
    public async Task<ActionResult<ProfitPreviewDto>> ProfitPreview(
        [FromQuery] int cropId, [FromQuery] decimal qty, [FromQuery] decimal sellPrice, CancellationToken ct)
        => Ok(await _fifoService.PreviewProfitAsync(cropId, qty, sellPrice, ct));

    [HttpGet("breakeven")]
    public async Task<ActionResult> BreakEven([FromQuery] int? cropId, CancellationToken ct)
    {
        if (cropId.HasValue)
            return Ok(await _inventoryService.GetBreakEvenAsync(cropId.Value, ct));

        return Ok(await _inventoryService.GetAllBreakEvensAsync(ct));
    }

    [HttpGet("sale-profit/{saleId}")]
    public async Task<ActionResult<SaleProfitDto>> SaleProfit(int saleId, CancellationToken ct)
    {
        try
        {
            return Ok(await _reportService.GetSaleProfitAsync(saleId, ct));
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
