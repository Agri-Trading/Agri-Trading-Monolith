using Lotexa.Application.DTOs;
using Lotexa.Application.Interfaces;
using Lotexa.Domain.Entities;
using Lotexa.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lotexa.Api.Controllers;

[ApiController]
[Route("api/crops")]
[Authorize]
public class CropsController : ControllerBase
{
    private readonly IUnitOfWork _uow;
    public CropsController(IUnitOfWork uow) => _uow = uow;

    [HttpGet]
    public async Task<ActionResult<List<CropDto>>> GetAll(CancellationToken ct)
    {
        var crops = await _uow.Repository<Crop>().GetAllAsync(ct);
        return Ok(crops.Select(c => new CropDto { Id = c.Id, Name = c.Name, Description = c.Description, IsActive = c.IsActive }));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CropDto>> Get(int id, CancellationToken ct)
    {
        var c = await _uow.Repository<Crop>().GetByIdAsync(id, ct);
        if (c == null) return NotFound();
        return Ok(new CropDto { Id = c.Id, Name = c.Name, Description = c.Description, IsActive = c.IsActive });
    }

    [HttpPost]
    [Authorize(Roles = UserRoles.Admin)]
    public async Task<ActionResult<CropDto>> Create([FromBody] CreateCropRequest request, CancellationToken ct)
    {
        var crop = new Crop { Name = request.Name, Description = request.Description };
        await _uow.Repository<Crop>().AddAsync(crop, ct);
        await _uow.SaveChangesAsync(ct);
        return Ok(new CropDto { Id = crop.Id, Name = crop.Name, Description = crop.Description, IsActive = crop.IsActive });
    }

    [HttpPut("{id}")]
    [Authorize(Roles = UserRoles.Admin)]
    public async Task<ActionResult> Update(int id, [FromBody] CreateCropRequest request, CancellationToken ct)
    {
        var crop = await _uow.Repository<Crop>().GetByIdAsync(id, ct);
        if (crop == null) return NotFound();
        crop.Name = request.Name;
        crop.Description = request.Description;
        _uow.Repository<Crop>().Update(crop);
        await _uow.SaveChangesAsync(ct);
        return Ok(new CropDto { Id = crop.Id, Name = crop.Name, Description = crop.Description, IsActive = crop.IsActive });
    }
}
