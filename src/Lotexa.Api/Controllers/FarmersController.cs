using System.Security.Claims;
using Lotexa.Application.DTOs;
using Lotexa.Application.Interfaces;
using Lotexa.Domain.Entities;
using Lotexa.Domain.Enums;
using Lotexa.Infrastructure.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lotexa.Api.Controllers;

[ApiController]
[Route("api/farmers")]
[Authorize]
public class FarmersController : ControllerBase
{
    private readonly IUnitOfWork _uow;
    private readonly UserManager<ApplicationUser> _userManager;

    public FarmersController(IUnitOfWork uow, UserManager<ApplicationUser> userManager)
    {
        _uow = uow;
        _userManager = userManager;
    }

    [HttpGet]
    public async Task<ActionResult<List<FarmerDto>>> GetAll(CancellationToken ct)
    {
        IQueryable<Farmer> query = _uow.Repository<Farmer>().Query().Include(f => f.Addresses);

        if (User.IsInRole(UserRoles.Farmer))
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            query = query.Where(f => f.UserId == userId);
        }

        var farmers = await query.ToListAsync(ct);
        return Ok(farmers.Select(MapToDto));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<FarmerDto>> Get(int id, CancellationToken ct)
    {
        var farmer = await _uow.Repository<Farmer>().Query()
            .Include(f => f.Addresses)
            .FirstOrDefaultAsync(f => f.Id == id, ct);
        if (farmer == null) return NotFound();
        return Ok(MapToDto(farmer));
    }

    [HttpPost]
    [Authorize(Roles = $"{UserRoles.Admin},{UserRoles.Farmer}")]
    public async Task<ActionResult<FarmerDto>> Create([FromBody] CreateFarmerRequest request, CancellationToken ct)
    {
        var farmer = new Farmer
        {
            Name = request.Name,
            Phone = request.Phone,
            Email = request.Email,
            Addresses = request.Addresses.Select(a => new FarmerAddress
            {
                AddressLine1 = a.AddressLine1,
                AddressLine2 = a.AddressLine2,
                City = a.City,
                State = a.State,
                PinCode = a.PinCode,
                IsPrimary = a.IsPrimary
            }).ToList()
        };

        if (User.IsInRole(UserRoles.Farmer))
        {
            farmer.UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }
        else if (User.IsInRole(UserRoles.Admin))
        {
            // Auto-create Identity user for this farmer
            var email = request.Email ?? $"{request.Phone}@lotexa.local";
            var existingUser = await _userManager.FindByEmailAsync(email);
            if (existingUser == null)
            {
                var appUser = new ApplicationUser
                {
                    UserName = email,
                    Email = email,
                    PhoneNumber = request.Phone,
                    FullName = request.Name,
                    EmailConfirmed = true
                };
                var defaultPassword = $"{request.Phone}@123";
                var result = await _userManager.CreateAsync(appUser, defaultPassword);
                if (result.Succeeded)
                {
                    await _userManager.AddToRoleAsync(appUser, UserRoles.Farmer);
                    farmer.UserId = appUser.Id;
                }
            }
        }

        await _uow.Repository<Farmer>().AddAsync(farmer, ct);
        await _uow.SaveChangesAsync(ct);
        return Ok(MapToDto(farmer));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = UserRoles.Admin)]
    public async Task<ActionResult> Update(int id, [FromBody] CreateFarmerRequest request, CancellationToken ct)
    {
        var farmer = await _uow.Repository<Farmer>().Query()
            .Include(f => f.Addresses)
            .FirstOrDefaultAsync(f => f.Id == id, ct);
        if (farmer == null) return NotFound();

        farmer.Name = request.Name;
        farmer.Phone = request.Phone;
        farmer.Email = request.Email;
        _uow.Repository<Farmer>().Update(farmer);
        await _uow.SaveChangesAsync(ct);
        return Ok(MapToDto(farmer));
    }

    private static FarmerDto MapToDto(Farmer f) => new()
    {
        Id = f.Id,
        Name = f.Name,
        Phone = f.Phone,
        Email = f.Email,
        IsActive = f.IsActive,
        Addresses = f.Addresses.Select(a => new FarmerAddressDto
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
