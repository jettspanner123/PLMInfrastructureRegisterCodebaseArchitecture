using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Data;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.ChatAssistant.Services;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.ConfigurationConstants.Services;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentOverview.Services;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Resources.Services;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Subscriptions.Services;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Sync.Services;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Helpers;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Utilities;

var builder = WebApplication.CreateBuilder(args);

// Render (and Heroku-style platforms generally) assign the listen port
// dynamically via PORT, unknown until the container actually starts - only
// set there, never locally, so this leaves launchSettings.json's own ports
// in charge of local dev entirely untouched.
string? renderAssignedPort = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrWhiteSpace(renderAssignedPort))
{
    builder.WebHost.UseUrls($"http://0.0.0.0:{renderAssignedPort}");
}

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
builder.Services.AddScoped<ResourceCellFormatColorService>();
builder.Services.AddScoped<SyncService>();
builder.Services.AddScoped<SubscriptionsService>();
builder.Services.AddScoped<EnvironmentOverviewService>();
builder.Services.AddScoped<ConfigurationConstantsService>();
builder.Services.AddHttpClient<ChatAssistantService>();

const string FrontendOriginPolicy = "FrontendOriginPolicy";

// Local dev's origin is always allowed; FRONTEND_PRODUCTION_ORIGIN (e.g. the
// deployed Vercel URL) is optional - only set in deployed environments, so
// this reads it via TryGetEnvKeyValue rather than the throwing
// GetEnvKeyValue local dev never configures.
List<string> allowedFrontendOrigins = new() { "http://localhost:5173" };
if (ENValidatorHelper.Current.TryGetEnvKeyValue("FRONTEND_PRODUCTION_ORIGIN", out string? productionOrigin))
{
    allowedFrontendOrigins.Add(productionOrigin!);
}

builder.Services.AddCors(options =>
{
    options.AddPolicy(FrontendOriginPolicy, policy =>
    {
        policy.WithOrigins(allowedFrontendOrigins.ToArray())
            .WithMethods("GET", "POST", "PUT", "DELETE")
            .WithHeaders("Content-Type");
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Render terminates TLS at its own edge and talks plain HTTP to the
// container - redirecting to HTTPS in here as well has nothing to redirect
// to and breaks requests. Only applies locally (see renderAssignedPort
// above), where this app really does serve both schemes itself.
if (string.IsNullOrWhiteSpace(renderAssignedPort))
{
    app.UseHttpsRedirection();
}

app.UseCors(FrontendOriginPolicy);

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
