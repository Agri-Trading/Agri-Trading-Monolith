using System.Security.Claims;
using Lotexa.Application.DTOs;
using Lotexa.Application.Interfaces;
using Lotexa.Domain.Entities;
using Lotexa.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lotexa.Api.Controllers;

[ApiController]
[Route("api/traders")]
[Authorize]
public class TradersController : ControllerBase
{
    private readonly IUnitOfWork _uow;
    public TradersController(IUnitOfWork uow) => _uow = uow;

    [HttpGet]
    public async Task<ActionResult<List<TraderDto>>> GetAll(CancellationToken ct)
    {
        IQueryable<Trader> query = _uow.Repository<Trader>().Query().Include(t => t.Addresses);

        if (User.IsInRole(UserRoles.Buyer))
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            query = query.Where(t => t.UserId == userId);
        }

        var traders = await query.ToListAsync(ct);
        return Ok(traders.Select(MapToDto));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TraderDto>> Get(int id, CancellationToken ct)
    {
        var trader = await _uow.Repository<Trader>().Query()
            .Include(t => t.Addresses)
            .FirstOrDefaultAsync(t => t.Id == id, ct);
        if (trader == null) return NotFound();
        return Ok(MapToDto(trader));
    }

    [HttpPost]
    [Authorize(Roles = $"{UserRoles.Admin},{UserRoles.Buyer}")]
    public async Task<ActionResult<TraderDto>> Create([FromBody] CreateTraderRequest request, CancellationToken ct)
    {
        var trader = new Trader
        {
            Name = request.Name,
            Phone = request.Phone,
            Email = request.Email,
            Addresses = request.Addresses.Select(a => new TraderAddress
            {
                AddressLine1 = a.AddressLine1,
                AddressLine2 = a.AddressLine2,
                City = a.City,
                State = a.State,
                PinCode = a.PinCode,
                IsPrimary = a.IsPrimary
            }).ToList()
        };

        if (User.IsInRole(UserRoles.Buyer))
            trader.UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        await _uow.Repository<Trader>().AddAsync(trader, ct);
        await _uow.SaveChangesAsync(ct);
        return Ok(MapToDto(trader));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = UserRoles.Admin)]
    public async Task<ActionResult> Update(int id, [FromBody] CreateTraderRequest request, CancellationToken ct)
    {
        var trader = await _uow.Repository<Trader>().Query()
            .Include(t => t.Addresses)
            .FirstOrDefaultAsync(t => t.Id == id, ct);
        if (trader == null) return NotFound();

        trader.Name = request.Name;
        trader.Phone = request.Phone;
        trader.Email = request.Email;
        _uow.Repository<Trader>().Update(trader);
        await _uow.SaveChangesAsync(ct);
        return Ok(MapToDto(trader));
    }

    private static TraderDto MapToDto(Trader t) => new()
    {
        Id = t.Id,
        Name = t.Name,
        Phone = t.Phone,
        Email = t.Email,
        IsActive = t.IsActive,
        Addresses = t.Addresses.Select(a => new TraderAddressDto
        {
            Id = a.Id,
            AddressLine1 = a.AddressLine1,
            AddressLine2 = a.AddressLine2,
            City = a.City,
            State = a.State,
            PinCode = a.PinCode,
            IsPrimary = a.IsPrimary
        }).ToList()
    };
}
