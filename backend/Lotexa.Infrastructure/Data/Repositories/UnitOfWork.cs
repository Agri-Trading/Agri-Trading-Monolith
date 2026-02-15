using Lotexa.Application.Interfaces;
using Microsoft.EntityFrameworkCore.Storage;

namespace Lotexa.Infrastructure.Data.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly LotexaDbContext _context;
    private readonly Dictionary<Type, object> _repositories = new();
    private IDbContextTransaction? _transaction;

    private IPurchaseLotRepository? _purchaseLots;
    private ISaleRepository? _sales;
    private IQuoteRepository? _quotes;

    public UnitOfWork(LotexaDbContext context)
    {
        _context = context;
    }

    public IPurchaseLotRepository PurchaseLots =>
        _purchaseLots ??= new PurchaseLotRepository(_context);

    public ISaleRepository Sales =>
        _sales ??= new SaleRepository(_context);

    public IQuoteRepository Quotes =>
        _quotes ??= new QuoteRepository(_context);

    public IRepository<T> Repository<T>() where T : class
    {
        var type = typeof(T);
        if (!_repositories.ContainsKey(type))
            _repositories[type] = new Repository<T>(_context);
        return (IRepository<T>)_repositories[type];
    }

    public async Task<int> SaveChangesAsync(CancellationToken ct = default)
        => await _context.SaveChangesAsync(ct);

    public async Task BeginTransactionAsync(CancellationToken ct = default)
    {
        _transaction = await _context.Database.BeginTransactionAsync(ct);
    }

    public async Task CommitAsync(CancellationToken ct = default)
    {
        if (_transaction != null)
        {
            await _transaction.CommitAsync(ct);
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public async Task RollbackAsync(CancellationToken ct = default)
    {
        if (_transaction != null)
        {
            await _transaction.RollbackAsync(ct);
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public void Dispose()
    {
        _transaction?.Dispose();
        _context.Dispose();
    }
}
