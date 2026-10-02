# Coding Rules

## 1. General Principles

- Code must be clean, modular, strongly typed, and organized by feature.
- Use aggressive code splitting. Separate responsibilities into distinct classes/files whenever possible.
- Do not allow unrelated responsibilities to accumulate in a single class.
- Prefer reusable abstractions over duplicated implementations.
- Use the Singleton pattern whenever it is safe and appropriate.
- Singleton objects must be safe for application-wide use and must not contain request-specific or mutable per-user state.
- Use dependency injection for dependency management even when the implementation is registered as a Singleton.
- Do not introduce unnecessary architectural complexity merely for the sake of abstraction.

### Strong Typing

- Everything must be strongly and explicitly typed.
- Avoid `dynamic` and untyped `object` usage unless technically unavoidable.
- `var` is not permitted when an explicit type can reasonably be provided.
- Collections must use explicit generic types.
- Nullable reference types must be handled correctly.
- Code must compile without introducing nullable-reference warnings.

Example:

```csharp
string name = "Jett";
int age = 25;
double height = 6.1;
float weight = 90.5f;
bool isActive = true;
char grade = 'A';
decimal price = 99.99m;
long population = 1_000_000L;
```

---

# 2. Naming Conventions

All names must use PascalCase unless explicitly defined otherwise.

## Type-specific suffixes

Types/classes must use a suffix corresponding to their architectural/type category.

Examples:

```text
AuthenticationController
AuthenticationService
AuthenticationAssertion
AuthenticationMiddleware

UserClass
UserInterface
UserDTO
UserRecord
UserType
UserCON
UserUtility
UserHelper
UserValidator
UserException
```

Use the appropriate suffix rather than arbitrarily naming a type `Class`.

### Abbreviations

Prefer complete, fully-spelled words over abbreviations in class, file, and member names (e.g. `Database`, not `Db` — the EF Core context is `ApplicationDatabaseContext`, never `ApplicationDbContext`).

This rule governs code identifiers, file names, and folder names only. It does not apply to user-facing text (UI labels, column headers, displayed field names) — those may read however makes sense to the people using the app, including verbatim legacy terms like "PRIVATE IP ADDRESS".

The only recognized abbreviations are the following explicitly-approved application-wide terms, which must always be written in full capitals rather than a single leading capital:

- `EN` — Environment (e.g. `ENValidatorHelper`, `ENKeyNotFoundException`)
- `IP` — Internet Protocol (e.g. `PrivateIPAddress`)
- `DNS` — Domain Name System
- `URL` — Uniform Resource Locator
- `SMTP` — Simple Mail Transfer Protocol
- `OS` — Operating System
- `VM` — Virtual Machine
- `DBA` — Database Administrator
- `SLA` — Service Level Agreement
- `CET` — Central European Time
- `SXI` — the 3DExperience SXI license term
- `CPU` — Central Processing Unit
- `RAM` — Random Access Memory
- `GB` — Gigabyte

Do not introduce a new abbreviation without first adding it to this list.

### Standard Naming

```text
Classes          PascalCase + appropriate type suffix
Interfaces       PascalCase + Interface
DTOs             PascalCase + DTO
Records          PascalCase + Record
Types            PascalCase + Type
Constants        PascalCase + CON
Utilities        PascalCase + Utility
Helpers          PascalCase + Helper
Validators       PascalCase + Validator
Exceptions       PascalCase + Exception
Middleware        PascalCase + Middleware
Controllers       PascalCase + Controller
Services          PascalCase + Service
Assertions        PascalCase + Assertion
```

### Methods

Methods use PascalCase.

Asynchronous methods must use the full `Asynchronous` suffix.

```csharp
GetUser()
CreateAsset()
ValidateRequest()

GetUserAsynchronous()
CreateAssetAsynchronous()
ValidateRequestAsynchronous()
```

Do not use the abbreviated `Async` suffix.

### Fields and Parameters

```text
Private fields    _camelCase
Parameters        camelCase
Local variables   camelCase
Properties        PascalCase
```

---

# 3. Feature Architecture

A feature represents a distinct business/application capability.

Examples:

```text
Authentication
AssetInventory
UserManagement
AssetMaintenance
```

Technical infrastructure such as logging, middleware, database infrastructure, or configuration is not automatically considered a feature.

Each feature must follow the standardized structure:

```text
Features/
└── ${FeatureName}/
    ├── ${FeatureName}Controller.cs
    ├── Services/
    │   └── ${FeatureName}Service.cs
    ├── Assertion/
    │   └── ${FeatureName}Assertion.cs
    ├── Constants/
    ├── Models/
    └── Utilities/
```

---

# 4. Feature Models

All enums, structs, interfaces, records, classes, DTOs, and other data-representation types belonging specifically to a feature must be stored under:

```text
Features/${FeatureName}/Models/
```

Behavioral classes such as controllers, services, assertions, validators, middleware, helpers, and utilities must remain in their designated architectural folders even though they are technically classes.

All model filenames must follow the applicable naming convention.

---

# 5. Global Components

A component may be moved to a global location when it is used across multiple features or is explicitly intended to be application-wide.

Global structure:

```text
Service/
    *Service.cs

Constants/
    *CON.cs

Models/
    Interfaces/
        *Interface.cs

    Types/
        *Type.cs

    DTOs/
        *DTO.cs

    Classes/
        *Class.cs

    Records/
        *Record.cs

Utilities/
    *Utility.cs

Middlewares/
    *Middleware.cs

Helpers/
    *Helper.cs

Exceptions/
    *Exception.cs

Validators/
    *Validator.cs
```

Do not move feature-specific code into global folders merely because it might theoretically be reusable.

---

# 6. Singleton Rules

- Prefer Singleton when an object is stateless and safe for application-wide use.
- Singleton objects must not contain request-specific state, user-specific state, or mutable shared state unless explicitly designed for thread-safe concurrent access.
- Use dependency injection for Singleton dependencies where applicable.
- Controllers must not be manually implemented as Singleton objects.
- `DbContext` must not be Singleton.
- Request-specific state must never be stored in Singleton instances.
- Do not use Singleton merely to avoid dependency injection.

---

# 7. Dependency Injection

- Dependencies must be injected rather than manually instantiated where DI is applicable.
- Controllers must receive their dependencies through constructor injection.
- Controllers must not instantiate services using `new`.
- Services must not manually instantiate other application services when those services can be injected.
- Use Singleton registration when the component is stateless and safe for application-wide use.
- Use appropriate DI lifetimes when Singleton would create incorrect state or concurrency behavior.

---

# 8. Global Helpers

All global helper classes must follow the Singleton pattern.

Example:

```csharp
public sealed class ExampleHelper
{
    private static readonly ExampleHelper _current =
        new ExampleHelper();

    public static ExampleHelper Current => _current;

    private ExampleHelper()
    {
    }
}
```

Helpers must remain stateless unless thread-safe shared state is explicitly required.

---

# 9. Validators

Validators belong under:

```text
Validators/
```

or the appropriate feature-specific validation location when applicable.

Validators must:

- Follow the Singleton pattern.
- Contain a single public `bool Validate(...)` method.
- Perform only one type of validation.
- Return `true` when validation succeeds.
- Return `false` when validation fails.
- Not perform unrelated business logic.
- Not access request-specific mutable state.

Custom validators use:

```text
*Validator.cs
```

System/framework-specific validators use the designated system naming convention where applicable.

Private implementation details may be introduced when necessary, but the public validation contract must remain a single `Validate(...)` method.

---

# 10. Assertion Pattern

Every feature requiring request validation must have:

```text
Features/${FeatureName}/Assertion/${FeatureName}Assertion.cs
```

The assertion class must use the Singleton pattern.

Example:

```csharp
public sealed class AuthenticationAssertion
{
    private static readonly AuthenticationAssertion _current =
        new AuthenticationAssertion();

    public static AuthenticationAssertion Current => _current;

    private AuthenticationAssertion()
    {
    }

    public void AssertLoginRequest(LoginRequestDTO? request)
    {
        if (request is null)
        {
            throw new ValidationCException(
                "Login request body cannot be empty.");
        }

        if (string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Password))
        {
            throw new ValidationCException(
                new List<string>
                {
                    "Both email and password must be provided."
                });
        }
    }
}
```

Controllers should call the feature-specific assertion method rather than duplicating the same validation.

Correct:

```csharp
AuthenticationAssertion.Current.AssertLoginRequest(request);
```

Do not perform duplicate null checks in the controller when the assertion already performs them.

Assertion methods must satisfy C# nullable-reference analysis and must not introduce nullable warnings.

---

# 11. Controllers

Controllers must:

- Use the appropriate feature service.
- Validate requests through the feature Assertion class.
- Return structured `APIResponse<T>` responses.
- Use `try-catch` blocks for endpoint handling.
- Never contain business logic that belongs in services.
- Never directly access database infrastructure unless explicitly required by the architecture.
- Never expose persistence entities directly as API contracts.

Example:

```csharp
[HttpPost(ApplicationRouteFactory.AuthenticationRoutes.Login)]
[AllowAnonymous]
public async Task<ActionResult<APIResponse<AuthResponseDTO>>> LoginAsynchronous(
    [FromBody] LoginRequestDTO? request)
{
    try
    {
        AuthenticationAssertion.Current.AssertLoginRequest(request);

        AuthResponseDTO response =
            await _authenticationService.LoginAsynchronous(request);

        return Ok(
            APIResponse<AuthResponseDTO>.Succeeded(
                response,
                "Login successful.",
                200));
    }
    catch (ValidationCException valEx)
    {
        _logger.LogWarning(
            "Login validation failed: {Message}",
            valEx.Message);

        return BadRequest(
            APIResponse<AuthResponseDTO>.Failed(
                valEx.Message,
                valEx.ValidationErrors,
                400));
    }
    catch (Exception ex)
    {
        _logger.LogError(
            ex,
            "Unexpected error during login.");

        return StatusCode(
            500,
            APIResponse<AuthResponseDTO>.Failed(
                "An unexpected error occurred while processing the login request.",
                new List<string>(),
                500));
    }
}
```

---

# 12. API Response Rules

The response wrapper must always be named:

```text
APIResponse
```

Never use:

```text
ApiResponse
ApiResponseClass
APIResponseClass
```

Generic API responses must use:

```csharp
APIResponse<T>
```

Example:

```csharp
ActionResult<APIResponse<AuthResponseDTO>>
```

All standard API endpoints must return `APIResponse<T>`.

Exceptions may apply to protocol-specific responses such as file downloads or `204 No Content` responses where an envelope is technically inappropriate.

API responses must:

- Have consistent success/error structures.
- Use the correct HTTP status code.
- Never expose internal implementation details.
- Never expose stack traces.
- Never expose raw database errors.
- Never expose connection strings or filesystem paths.
- Never expose secrets.

---

# 13. API Endpoint Rules

Every API endpoint must begin with the exact prefix:

```text
/Api/V1
```

`/Api/V1` is mandatory for every API endpoint.

Endpoint paths must:

- Use PascalCase.
- Use complete names.
- Never use abbreviations.
- Never use lowercase route segments.
- Never use camelCase.
- Never use kebab-case.
- Never use snake_case.

Correct:

```text
/Api/V1/Authentication/Login
/Api/V1/AssetInventory/GetAsset
/Api/V1/AssetInventory/CreateAsset
/Api/V1/UserManagement/GetUser
```

Incorrect:

```text
/api/v1/authentication/login
/api/v1/asset-inventory/get-asset
/api/v1/user_management/getUser
/Api/V1/Auth/Login
/Api/V1/AssetInv/Get
```

Use complete names:

```text
Authentication
AssetInventory
UserManagement
GetAsset
CreateAsset
DeleteAsset
```

Do not abbreviate:

```text
Auth
AssetInv
UsrMgmt
Get
Create
```

unless the abbreviation is explicitly defined as an application-wide term.

---

# 14. Route Factory

Route strings must never be hardcoded directly in controllers.

All controller and action routes must reference:

```text
Factories/ApplicationRouteFactory.cs
```

Example:

```csharp
[ApiController]
[Route(ApplicationRouteFactory.AuthenticationRoutes.ControllerURL)]
public class AuthenticationController : ControllerBase
{
    [HttpPost(ApplicationRouteFactory.AuthenticationRoutes.Login)]
    public IActionResult Login(...)
    {
    }
}
```

The route factory must preserve the `/Api/V1` and PascalCase conventions.

Example:

```csharp
public static class ApplicationRouteFactory
{
    public static class AuthenticationRoutes
    {
        public const string ControllerURL =
            "/Api/V1/Authentication";

        public const string Login =
            "Login";
    }
}
```

The resulting endpoint is:

```text
/Api/V1/Authentication/Login
```

All endpoint route segments must use their complete PascalCase names.

Do not duplicate route literals between controllers.

---

# 15. JSON Property Naming

All API JSON property names must use PascalCase.

Correct:

```json
{
    "Status": true,
    "Message": "Hello, world"
}
```

Incorrect:

```json
{
    "status": true,
    "message": "Hello, world"
}
```

Incorrect:

```json
{
    "status": true,
    "message": "Hello, world"
}
```

Incorrect:

```json
{
    "status_message": "Hello, world"
}
```

C# response models must therefore expose PascalCase properties:

```csharp
public sealed class APIResponseClass
{
    public bool Status { get; set; }

    public string Message { get; set; }
}
```

When the response wrapper is generic, use:

```csharp
public sealed class APIResponse<T>
{
    public bool Status { get; set; }

    public string Message { get; set; }

    public T? Data { get; set; }
}
```

The JSON output must be:

```json
{
    "Status": true,
    "Message": "Hello, world",
    "Data": {}
}
```

The application-wide JSON serialization configuration must preserve PascalCase property names.

Do not introduce per-controller or per-endpoint serialization naming conventions.

---

# 16. Exception Handling

Controllers must handle known application exceptions explicitly.

At minimum, exception-to-status-code mappings must be defined consistently by the application.

Example:

```text
Validation exception       → 400
Unauthorized exception     → 401
Forbidden exception        → 403
Not found exception        → 404
Conflict exception         → 409
Unexpected exception       → 500
```

Unknown exceptions must return a generic error message.

Never return:

```csharp
ex.Message
```

as an unexpected-error response.

Exception details belong in logs, not API responses.

---

# 17. Logging

Use structured logging.

Preferred:

```csharp
_logger.LogWarning(
    "Authentication failed for user {UserId}",
    userId);
```

Avoid:

```csharp
_logger.LogWarning(
    $"Authentication failed for {userId}");
```

Never log:

- Passwords
- Authentication tokens
- Refresh tokens
- API keys
- Connection strings
- Authorization headers
- Secrets
- Sensitive credentials

---

# 18. DTO and Entity Separation

- Controllers must accept DTOs for API requests.
- Controllers must return DTOs for API responses.
- Persistence/database entities must not be directly exposed through API endpoints.
- DTO-to-entity and entity-to-DTO mapping must occur outside the controller.
- Business/domain models must remain separate from external API contracts where applicable.

---

# 19. Database Rules

- Database operations must use asynchronous APIs.
- Do not instantiate `DbContext` manually when it can be provided through DI.
- `DbContext` must not be registered as Singleton.
- User-controlled database input must be parameterized.
- Never construct SQL queries through unsafe string concatenation or interpolation.
- Do not expose database implementation details through API responses.
- Every table must be explicitly named via `entity.ToTable(...)` using the template `IG_{Name}TBL`, where `{Name}` is the PascalCase, fully-spelled entity name (e.g. `IG_ResourcesTBL`, `IG_ConfiguredSubscriptionsTBL`). Never rely on EF Core's default pluralized-class-name table naming.

---

# 20. Asynchronous Programming

- I/O-bound operations must use asynchronous APIs when available.
- Asynchronous methods must use the full `Asynchronous` suffix.
- Do not use `.Result` or `.Wait()` for asynchronous operations.
- Do not use `Task.Run()` as a substitute for asynchronous I/O.
- Propagate `CancellationToken` when the underlying operation supports cancellation.

Examples:

```csharp
GetUserAsynchronous()
CreateAssetAsynchronous()
UpdateAssetAsynchronous()
DeleteAssetAsynchronous()
```

Do not use:

```csharp
GetUserAsync()
CreateAssetAsync()
UpdateAssetAsync()
DeleteAssetAsync()
```

---

# 21. Security

- Never hardcode credentials, passwords, API keys, tokens, or connection strings.
- Never log secrets.
- Never return secrets to API clients.
- Never return raw exception details to clients.
- Never disable TLS/certificate validation merely to make an integration work.
- Do not bypass authorization checks.
- Do not trust client-provided identity, role, or authorization information.
- Validate external input before processing it.
- Database queries involving external input must be parameterized.

---

# 22. AI Agent Repository Rules

Before creating or modifying code, the AI agent must inspect the existing repository.

The agent should:

1. Inspect the relevant feature directory.
2. Search for existing implementations.
3. Search for existing services, models, utilities, validators, assertions, exceptions, and constants.
4. Inspect related interfaces and contracts.
5. Inspect dependency registration.
6. Inspect existing route definitions.
7. Reuse existing functionality whenever applicable.
8. Make the smallest change necessary to fulfill the task.
9. Build and/or test the affected code when possible.

The agent must not blindly create a new implementation when an equivalent implementation already exists.

---

# 23. No-Hallucination Rules

The AI agent must never invent:

- Classes
- Methods
- Properties
- Database tables
- Database columns
- API endpoints
- API contracts
- NuGet packages
- Framework APIs
- Configuration values
- Environment variables
- Versions
- File paths
- Namespaces
- Existing functionality
- Infrastructure resources
- External service capabilities

If required information cannot be determined from the repository, task, or available documentation:

- Do not guess.
- Do not fabricate an implementation.
- Ask for clarification when necessary.
- Otherwise explicitly identify the missing information.

A plausible assumption must never be presented as an established project fact.

---

# 24. Existing Code Is the Source of Truth

- Treat the existing repository architecture and implementation as the primary source of truth.
- Before creating a new abstraction, search for an existing equivalent.
- Preserve existing behavior unless the task explicitly requires behavior changes.
- Do not rewrite functioning code merely to make it conform to personal preferences.
- Do not change public contracts unless explicitly requested.
- Do not introduce architectural changes unrelated to the task.

---

# 25. Dependencies

- Do not introduce a new NuGet/package dependency without explicit approval.
- Prefer existing project dependencies when they can satisfy the requirement.
- Do not upgrade package versions unless explicitly requested or required and approved.
- Do not add external services or infrastructure dependencies without explicit approval.

---

# 26. Minimal-Change Rule

Until explicitly instructed otherwise:

- Change only the code required to complete the requested task.
- Do not refactor unrelated code.
- Do not rename unrelated classes or files.
- Do not move unrelated files.
- Do not rewrite unrelated methods.
- Do not perform opportunistic cleanup.
- Do not change formatting in unrelated files.
- Do not modify configuration unrelated to the task.

If a required change exposes an architectural problem outside the task, report it rather than silently expanding the scope.

---

# 27. File Modification Rules

The agent must not rename, move, or delete existing files unless:

1. The task explicitly requests it, or
2. The change is strictly necessary to implement the requested functionality.

When moving or renaming a file is necessary, all affected references must be updated and the project must be verified.

---

# 28. Testing

- New business logic should have corresponding tests.
- Tests must follow the existing project testing architecture.
- Do not invent a new testing framework when an existing one is already present.
- Tests must verify behavior rather than merely increasing code coverage.
- Existing tests must not be removed merely because they fail after a change.
- If an existing test becomes invalid because the requested behavior changed, update it consistently with the new requirement.

---

# 29. Build and Verification

After modifying code, the agent must build and/or test the affected project when the environment allows it.

The agent must never claim:

```text
"Build successful."
"Tests passed."
"Everything works."
"Implementation verified."
```

unless the corresponding verification was actually performed.

If verification cannot be performed, explicitly state:

```text
Build verification: Not performed.
Test verification: Not performed.
Reason: <reason>
```

Never imply successful verification based solely on code inspection.

---

# 30. Rule Precedence

When rules conflict, use the following priority:

1. Explicit task requirements
2. Security and correctness
3. Existing project architecture and public contracts
4. Feature-specific rules
5. Global coding rules
6. Formatting and stylistic preferences

A lower-priority rule must not override a higher-priority rule.

---

# 31. Agent Assumption Policy

The agent may make only trivial assumptions that do not affect:

- Architecture
- Behavior
- Security
- API contracts
- Data integrity
- External dependencies

For any assumption that could materially affect implementation:

- Ask for clarification, or
- Explicitly identify the assumption before proceeding when the task permits it.

Never silently make material architectural or behavioral assumptions.

---

# 32. Scope Discipline

The agent must remain within the scope of the requested task.

Do not:

- Add unrelated features.
- Refactor unrelated architecture.
- Upgrade dependencies.
- Change API contracts.
- Modify unrelated configuration.
- Change database schemas.
- Introduce new infrastructure.
- Replace existing libraries.

unless explicitly required or approved.

The objective is to implement the requested change while preserving existing functionality and architecture.
