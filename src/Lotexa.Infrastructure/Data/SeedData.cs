using Lotexa.Domain.Entities;
using Lotexa.Domain.Enums;
using Lotexa.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Lotexa.Infrastructure.Data;

public static class SeedData
{
    public static async Task InitializeAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<LotexaDbContext>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();

        await context.Database.EnsureCreatedAsync();

        await SeedRolesAsync(roleManager);
        await SeedAdminUserAsync(userManager, configuration);
        await SeedMasterDataAsync(context);
    }

    private static async Task SeedRolesAsync(RoleManager<IdentityRole> roleManager)
    {
        string[] roles = { UserRoles.Admin, UserRoles.Farmer, UserRoles.Buyer };
        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new IdentityRole(role));
        }
    }

    private static async Task SeedAdminUserAsync(UserManager<ApplicationUser> userManager, IConfiguration config)
    {
        var adminEmail = config["AdminUser:Email"] ?? "admin@lotexa.com";
        var adminPassword = config["AdminUser:Password"] ?? "Admin@123";

        if (await userManager.FindByEmailAsync(adminEmail) == null)
        {
            var admin = new ApplicationUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                FullName = "System Administrator",
                EmailConfirmed = true
            };
            var result = await userManager.CreateAsync(admin, adminPassword);
            if (result.Succeeded)
                await userManager.AddToRoleAsync(admin, UserRoles.Admin);
        }
    }

    private static async Task SeedMasterDataAsync(LotexaDbContext context)
    {
        if (!await context.UnitsOfMeasure.AnyAsync())
        {
            context.UnitsOfMeasure.AddRange(
                new UnitOfMeasure { Code = "QTL", Name = "Quintal" },
                new UnitOfMeasure { Code = "KG", Name = "Kilogram" },
                new UnitOfMeasure { Code = "MT", Name = "Metric Ton" },
                new UnitOfMeasure { Code = "BAG", Name = "Bag" },
                new UnitOfMeasure { Code = "NOS", Name = "Numbers" },
                new UnitOfMeasure { Code = "LTR", Name = "Litre" }
            );
            await context.SaveChangesAsync();
        }

        if (!await context.Crops.AnyAsync())
        {
            context.Crops.AddRange(
                new Crop { Name = "Corn (Maize)", Description = "Yellow corn / maize" },
                new Crop { Name = "Ragi", Description = "Finger millet" },
                new Crop { Name = "Jowar", Description = "Sorghum" },
                new Crop { Name = "Bajra", Description = "Pearl millet" },
                new Crop { Name = "Urad Dal", Description = "Black gram" }
            );
            await context.SaveChangesAsync();
        }

        if (!await context.Warehouses.AnyAsync())
        {
            context.Warehouses.Add(new Warehouse
            {
                Name = "Main Storage",
                Location = "Sankarankovil, Tenkasi"
            });
            await context.SaveChangesAsync();
        }
    }
}
