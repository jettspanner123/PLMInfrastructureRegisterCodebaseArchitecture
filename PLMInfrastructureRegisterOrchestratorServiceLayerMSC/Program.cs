using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Data;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Admin.Services;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.ChatAssistant.Services;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.ConfigurationConstants.Services;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.DowntimeAnnouncements.Services;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.CalendarActivities.Services;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentOverview.Services;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentUptimeRequests.Services;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.FeatureRequests.Services;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Jira.Services;
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
builder.Services.AddScoped<ResourceTableLegendService>();
builder.Services.AddScoped<SyncService>();
builder.Services.AddScoped<SubscriptionsService>();
builder.Services.AddHttpClient<EnvironmentOverviewService>();
builder.Services.AddScoped<ConfigurationConstantsService>();
builder.Services.AddHttpClient<ChatAssistantService>();
builder.Services.AddScoped<FeatureRequestsService>();
builder.Services.AddScoped<EnvironmentUptimeRequestsService>();
builder.Services.AddScoped<AdminService>();
builder.Services.AddScoped<DowntimeAnnouncementsService>();
builder.Services.AddScoped<CalendarActivitiesService>();
builder.Services.AddHttpClient<JiraService>();

// First real server-side admin check in this backend - every other
// "admin-only" action up to now is enforced client-side only (see
// AdminIdentityUtility.ts's own comment to that effect). AdminService
// already signs a JWT on login with a short "role" claim; this just
// starts actually validating it. No iss/aud claims exist on that token,
// so those checks stay off - turning them on would break every admin
// token already issued and stored in a browser today.
string jwtSigningKey = ENValidatorHelper.Current.GetEnvKeyValue("JWT_SIGNING_KEY");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        // Without this, JwtSecurityTokenHandler remaps the token's short
        // "role" claim to the long ClaimTypes.Role URI on the way in, so
        // RequireClaim("role", "Admin") below would never match it.
        options.MapInboundClaims = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateIssuerSigningKey = true,
            ValidateLifetime = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSigningKey)),
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireAdmin", policy =>
    {
        policy.RequireAuthenticatedUser();
        policy.RequireClaim("role", "Admin");
    });
});

const string FrontendOriginPolicy = "FrontendOriginPolicy";

// Local dev's origin is always allowed; FRONTEND_PRODUCTION_ORIGIN (e.g. the
// deployed Vercel URL(s)) is optional - only set in deployed environments, so
// this reads it via TryGetEnvKeyValue rather than the throwing
// GetEnvKeyValue local dev never configures. Comma-separated so this one
// shared backend can serve multiple production frontends at once (e.g. this
// project's own frontend plus a rebranded fork's) without needing a second
// env var per additional frontend.
List<string> allowedFrontendOrigins = new() { "http://localhost:4637" };
if (ENValidatorHelper.Current.TryGetEnvKeyValue("FRONTEND_PRODUCTION_ORIGIN", out string? productionOrigins))
{
    allowedFrontendOrigins.AddRange(
        productionOrigins!.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries));
}

builder.Services.AddCors(options =>
{
    options.AddPolicy(FrontendOriginPolicy, policy =>
    {
        policy.WithOrigins(allowedFrontendOrigins.ToArray())
            .WithMethods("GET", "POST", "PUT", "DELETE")
            // Authorization added for the Downtime Announcements feature -
            // the first fetch calls in this app to actually send the admin
            // JWT (see DowntimeAnnouncementsService.ts); without it here,
            // the browser's CORS preflight blocks the request entirely.
            .WithHeaders("Content-Type", "Authorization");
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

app.UseAuthentication();
app.UseAuthorization();

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
