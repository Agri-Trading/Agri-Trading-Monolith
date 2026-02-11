using Lotexa.Application.DTOs;
using Lotexa.Application.Interfaces;
using Lotexa.Domain.Entities;
using Lotexa.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Lotexa.Api.Controllers;

[ApiController]
[Route("api/units-of-measure")]
[Authorize]
public class UnitsOfMeasureController : ControllerBase
{
    private readonly IUnitOfWork _uow;
    public UnitsOfMeasureController(IUnitOfWork uow) => _uow = uow;

    [HttpGet]
    public async Task<ActionResult<List<UnitOfMeasureDto>>> GetAll(CancellationToken ct)
    {
        var items = await _uow.Repository<UnitOfMeasure>().GetAllAsync(ct);
        return Ok(items.Select(u => new UnitOfMeasureDto { Id = u.Id, Code = u.Code, Name = u.Name, IsActive = u.IsActive }));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UnitOfMeasureDto>> Get(int id, CancellationToken ct)
    {
        var u = await _uow.Repository<UnitOfMeasure>().GetByIdAsync(id, ct);
        if (u == null) return NotFound();
        return Ok(new UnitOfMeasureDto { Id = u.Id, Code = u.Code, Name = u.Name, IsActive = u.IsActive });
    }

    [HttpPost]
    [Authorize(Roles = UserRoles.Admin)]
    public async Task<ActionResult<UnitOfMeasureDto>> Create([FromBody] CreateUnitOfMeasureRequest request, CancellationToken ct)
    {
        var uom = new UnitOfMeasure { Code = request.Code, Name = request.Name };
        await _uow.Repository<UnitOfMeasure>().AddAsync(uom, ct);
        await _uow.SaveChangesAsync(ct);
        return Ok(new UnitOfMeasureDto { Id = uom.Id, Code = uom.Code, Name = uom.Name, IsActive = uom.IsActive });
    }

    [HttpPut("{id}")]
    [Authorize(Roles = UserRoles.Admin)]
    public async Task<ActionResult> Update(int id, [FromBody] CreateUnitOfMeasureRequest request, CancellationToken ct)
    {
        var uom = await _uow.Repository<UnitOfMeasure>().GetByIdAsync(id, ct);
        if (uom == null) return NotFound();
        uom.Code = request.Code;
        uom.Name = request.Name;
        _uow.Repository<UnitOfMeasure>().Update(uom);
        await _uow.SaveChangesAsync(ct);
        return Ok(new UnitOfMeasureDto { Id = uom.Id, Code = uom.Code, Name = uom.Name, IsActive = uom.IsActive });
    }
}
