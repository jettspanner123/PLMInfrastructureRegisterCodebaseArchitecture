using System;

namespace PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Admin.Models
{
    public sealed class AdminAccountNexus
    {
        public Guid Id { get; set; }

        public string Email { get; set; } = string.Empty;

        public string FirstName { get; set; } = string.Empty;

        public string LastName { get; set; } = string.Empty;

        // Produced by PasswordHasher<AdminAccountNexus>.HashPassword(...) -
        // never a raw/plaintext password, never compared via string equality.
        public string PasswordHash { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }
    }
}
