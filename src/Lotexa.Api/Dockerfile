FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy csproj files and restore
COPY Lotexa.Domain/Lotexa.Domain.csproj Lotexa.Domain/
COPY Lotexa.Application/Lotexa.Application.csproj Lotexa.Application/
COPY Lotexa.Infrastructure/Lotexa.Infrastructure.csproj Lotexa.Infrastructure/
COPY Lotexa.Api/Lotexa.Api.csproj Lotexa.Api/
RUN dotnet restore Lotexa.Api/Lotexa.Api.csproj

# Copy everything and build
COPY . .
RUN dotnet publish Lotexa.Api/Lotexa.Api.csproj -c Release -o /app/publish --no-restore

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 5000

ENTRYPOINT ["dotnet", "Lotexa.Api.dll"]
