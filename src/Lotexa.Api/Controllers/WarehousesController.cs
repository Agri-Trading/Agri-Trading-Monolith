using Lotexa.Application.DTOs;
using Lotexa.Application.Interfaces;
using Lotexa.Domain.Entities;
using Lotexa.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Lotexa.Api.Controllers;

[ApiController]
[Route("api/warehouses")]
[Authorize]
public class WarehousesController : ControllerBase
{
    private readonly IUnitOfWork _uow;
    public WarehousesController(IUnitOfWork uow) => _uow = uow;

    [HttpGet]
    public async Task<ActionResult<List<WarehouseDto>>> GetAll(CancellationToken ct)
    {
        var items = await _uow.Repository<Warehouse>().GetAllAsync(ct);
        return Ok(items.Select(w => new WarehouseDto { Id = w.Id, Name = w.Name, Location = w.Location, IsActive = w.IsActive }));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<WarehouseDto>> Get(int id, CancellationToken ct)
    {
        var w = await _uow.Repository<Warehouse>().GetByIdAsync(id, ct);
        if (w == null) return NotFound();
        return Ok(new WarehouseDto { Id = w.Id, Name = w.Name, Location = w.Location, IsActive = w.IsActive });
    }

    [HttpPost]
    [Authorize(Roles = UserRoles.Admin)]
    public async Task<ActionResult<WarehouseDto>> Create([FromBody] CreateWarehouseRequest request, CancellationToken ct)
    {
        var wh = new Warehouse { Name = request.Name, Location = request.Location };
        await _uow.Repository<Warehouse>().AddAsync(wh, ct);
        await _uow.SaveChangesAsync(ct);
        return Ok(new WarehouseDto { Id = wh.Id, Name = wh.Name, Location = wh.Location, IsActive = wh.IsActive });
    }

    [HttpPut("{id}")]
    [Authorize(Roles = UserRoles.Admin)]
    public async Task<ActionResult> Update(int id, [FromBody] CreateWarehouseRequest request, CancellationToken ct)
    {
        var wh = await _uow.Repository<Warehouse>().GetByIdAsync(id, ct);
        if (wh == null) return NotFound();
        wh.Name = request.Name;
        wh.Location = request.Location;
        _uow.Repository<Warehouse>().Update(wh);
        await _uow.SaveChangesAsync(ct);
        return Ok(new WarehouseDto { Id = wh.Id, Name = wh.Name, Location = wh.Location, IsActive = wh.IsActive });
    }
}
