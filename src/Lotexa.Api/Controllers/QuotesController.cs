using Lotexa.Application.DTOs;
using Lotexa.Application.Interfaces;
using Lotexa.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lotexa.Api.Controllers;

[ApiController]
[Route("api/quotes")]
[Authorize]
public class QuotesController : ControllerBase
{
    private readonly IUnitOfWork _uow;
    public QuotesController(IUnitOfWork uow) => _uow = uow;

    [HttpPost]
    public async Task<ActionResult<PriceQuoteDto>> Create([FromBody] CreatePriceQuoteRequest request, CancellationToken ct)
    {
        var quote = new PriceQuote
        {
            CropId = request.CropId,
            TraderId = request.TraderId,
            PricePerUom = request.PricePerUom,
            QuoteDate = request.QuoteDate,
            Notes = request.Notes
        };
        await _uow.Repository<PriceQuote>().AddAsync(quote, ct);
        await _uow.SaveChangesAsync(ct);

        var created = await _uow.Repository<PriceQuote>().Query()
            .Include(q => q.Crop).Include(q => q.Trader)
            .FirstAsync(q => q.Id == quote.Id, ct);
        return Ok(MapToDto(created));
    }

    [HttpGet]
    public async Task<ActionResult<List<PriceQuoteDto>>> GetAll(
        [FromQuery] int? cropId, [FromQuery] DateOnly? from, [FromQuery] DateOnly? to, CancellationToken ct)
    {
        var query = _uow.Repository<PriceQuote>().Query()
            .Include(q => q.Crop).Include(q => q.Trader).AsQueryable();

        if (cropId.HasValue) query = query.Where(q => q.CropId == cropId.Value);
        if (from.HasValue) query = query.Where(q => q.QuoteDate >= from.Value);
        if (to.HasValue) query = query.Where(q => q.QuoteDate <= to.Value);

        var quotes = await query.OrderByDescending(q => q.QuoteDate).ToListAsync(ct);
        return Ok(quotes.Select(MapToDto));
    }

    [HttpGet("latest")]
    public async Task<ActionResult<PriceQuoteDto>> GetLatest([FromQuery] int cropId, CancellationToken ct)
    {
        var quote = await _uow.Quotes.GetLatestQuoteAsync(cropId, ct);
        if (quote == null) return NotFound();
        return Ok(MapToDto(quote));
    }

    private static PriceQuoteDto MapToDto(PriceQuote q) => new()
    {
        Id = q.Id,
        CropId = q.CropId,
        CropName = q.Crop?.Name ?? "",
        TraderId = q.TraderId,
        TraderName = q.Trader?.Name ?? "",
        PricePerUom = q.PricePerUom,
        QuoteDate = q.QuoteDate,
        Notes = q.Notes,
        IsActive = q.IsActive
    };
}
