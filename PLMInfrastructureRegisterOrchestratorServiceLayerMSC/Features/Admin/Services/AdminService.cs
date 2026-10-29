using System;
using System.Collections.Concurrent;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Data;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Exceptions;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Admin.Assertion;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Admin.Models;
using PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Helpers;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Admin.Services
{
    public sealed class AdminService
    {
        private const int MaxFailedAttempts = 5;
        private static readonly TimeSpan LockoutWindow = TimeSpan.FromMinutes(10);
        private static readonly TimeSpan TokenLifetime = TimeSpan.FromDays(30);

        // In-memory, per-process - resets on restart and isn't shared across
        // multiple backend instances. Acceptable for this app's current
        // single-instance deployment (see PRD_ADMIN_EMAIL_PASSWORD_LOGIN.md).
        private static readonly ConcurrentDictionary<string, (int Count, DateTime WindowStart)> _failedAttemptsByEmail =
            new ConcurrentDictionary<string, (int, DateTime)>(StringComparer.OrdinalIgnoreCase);

        private readonly ApplicationDatabaseContext _dbContext;
        private readonly PasswordHasher<AdminAccountNexus> _passwordHasher = new PasswordHasher<AdminAccountNexus>();

        public AdminService(ApplicationDatabaseContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<AdminLoginResponseDTO> LoginAsynchronous(AdminLoginRequestDTO? request)
        {
            AdminAssertion.Current.AssertLoginRequest(request);

            string normalizedEmail = request!.Email.Trim();

            if (_failedAttemptsByEmail.TryGetValue(normalizedEmail, out var attempts) &&
                attempts.Count >= MaxFailedAttempts &&
                DateTime.UtcNow - attempts.WindowStart < LockoutWindow)
            {
                throw new TooManyAttemptsException(
                    "Too many failed login attempts. Please try again in a few minutes.");
            }

            AdminAccountNexus? account = await _dbContext.AdminAccounts
                .FirstOrDefaultAsync(a => a.Email.ToLower() == normalizedEmail.ToLower());

            bool isValid = account is not null &&
                _passwordHasher.VerifyHashedPassword(account, account.PasswordHash, request.Password)
                    != PasswordVerificationResult.Failed;

            if (!isValid)
            {
                RecordFailedAttempt(normalizedEmail);
                // Deliberately generic - never reveals whether the email exists.
                throw new UnauthorizedAccessException("Invalid email or password.");
            }

            _failedAttemptsByEmail.TryRemove(normalizedEmail, out _);

            string token = IssueJwt(account!.Email, account.FirstName, account.LastName);

            return new AdminLoginResponseDTO { Token = token };
        }

        private static void RecordFailedAttempt(string normalizedEmail)
        {
            _failedAttemptsByEmail.AddOrUpdate(
                normalizedEmail,
                _ => (1, DateTime.UtcNow),
                (_, existing) =>
                    DateTime.UtcNow - existing.WindowStart < LockoutWindow
                        ? (existing.Count + 1, existing.WindowStart)
                        : (1, DateTime.UtcNow));
        }

        private static string IssueJwt(string email, string firstName, string lastName)
        {
            string signingKey = ENValidatorHelper.Current.GetEnvKeyValue("JWT_SIGNING_KEY");
            SymmetricSecurityKey key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signingKey));
            SigningCredentials credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            JwtSecurityToken token = new JwtSecurityToken(
                claims: new[]
                {
                    new Claim(JwtRegisteredClaimNames.Sub, email),
                    // Plain short claim name, not ClaimTypes.Role - that constant
                    // is the long schemas.xmlsoap.org URI, which would be written
                    // into the JWT verbatim as an ugly, non-standard key. No
                    // endpoint validates this claim yet (see
                    // PRD_ADMIN_EMAIL_PASSWORD_LOGIN.md); a future authorization
                    // phase decides its own exact claim-type mapping then.
                    new Claim("role", "Admin"),
                    // Self-contained with the rest of the token - the frontend's
                    // AdminIdentityUtility decodes these alongside sub/exp to
                    // populate the profile card, so the displayed name always
                    // matches whichever token is currently stored and expires
                    // together with it (no separate storage key to go stale).
                    new Claim("firstName", firstName),
                    new Claim("lastName", lastName),
                },
                expires: DateTime.UtcNow.Add(TokenLifetime),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
