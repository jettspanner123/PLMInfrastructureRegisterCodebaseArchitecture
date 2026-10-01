using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Data;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Resources.Services;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Sync.Services;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Helpers;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Utilities;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddControllers()
    .AddJsonOptions(options => options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));

string pooledConnectionUrl = ENValidatorHelper.Current.GetEnvKeyValue("DATABASE_URL");
string npgsqlConnectionString = DatabaseConnectionStringUtility.ConvertNeonUriToNpgsqlConnectionString(pooledConnectionUrl);

builder.Services.AddDbContext<ApplicationDatabaseContext>(options =>
    options.UseNpgsql(npgsqlConnectionString));

builder.Services.AddScoped<ResourcesService>();
builder.Services.AddScoped<SyncService>();

const string FrontendDevelopmentOriginPolicy = "FrontendDevelopmentOriginPolicy";

builder.Services.AddCors(options =>
{
    options.AddPolicy(FrontendDevelopmentOriginPolicy, policy =>
    {
        policy.WithOrigins("http://localhost:5173")
            .WithMethods("GET");
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseCors(FrontendDevelopmentOriginPolicy);

app.MapControllers();

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast =  Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast");

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
