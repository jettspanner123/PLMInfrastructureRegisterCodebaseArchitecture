# Graph Report - PLMInfrastructureRegisterCodebaseArchitecture  (2026-10-19)

## Corpus Check
- 340 files · ~210,524 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 16 file(s) not represented in the graph (top: (none) 5, .vsidx 5, .db 1)

## Summary
- 1764 nodes · 3861 edges · 129 communities (103 shown, 26 thin omitted)
- Extraction: 95% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 172 edges (avg confidence: 0.84)
- Token cost: 1,143,619 input · 0 output

## Community Hubs (Navigation)
- Shared UI Component Library
- Resource Entity & Azure Flags
- Frontend Layout & Route Constants
- Backend Feature Namespaces
- Frontend Coding Conventions
- Configuration Constants Service
- Resources Screen & Search Bar
- Azure SDK Dependencies
- Clarifying Question Pause/Resume
- EF Core Data Layer
- Groq Tool-Call DTOs
- Chat Assistant HTTP Verbs
- Table Column Resize & Preferences
- Backend Controllers & Azure Client
- Legend & Custom Color Modals
- Environment Overview DTO & Errors
- Early Schema Migrations
- Environment Overview Frontend Service
- Splash Screen Components
- Neon AI Gateway & Auth Skills
- Domain Glossary (CONTEXT.md)
- Screen Features & Audit Trail
- App TypeScript Config
- Root Package Config
- Theme Toggle Component
- EnvironmentOverview Entity Fields
- Neon Auth & Triggers
- GitNexus Skill Docs
- EnvironmentOverview Migrations
- Badge & Card Components
- Node TypeScript Config
- Resource Cell Format DTO
- Data Backfill Migrations
- Subscriptions Frontend Service
- Chat Assistant Frontend Service
- EF DbContext & Chat Tables
- Product Requirement Docs (PRDs)
- Frontend Package Manifest
- Environment Cell Format Update DTO
- Resource Cell Format Update DTO
- Subscription & EnvOverview Migrations
- Azure Sync Service
- ChatMessage Entity
- IG Naming Convention Migrations
- Repo Governance & Patterns
- Configuration Constants Assertion
- Custom Color Backfill Migration
- Frontend Runtime Dependencies
- Frontend Build Tooling Deps
- Ask Question Response DTO
- Resource Cell Format Entity
- Backend Dev Port Config
- Design System Tokens
- TanStack Query Keys
- EnvironmentOverview Table Utility
- Uptime Schedule Text Parser
- Create EnvironmentOverview Request DTO
- EnvironmentOverview Cell Format Entity
- Turborepo Pipeline Config
- Lakebase Hybrid Search
- Env Key Validator Helper
- Groq Wire-Format DTOs
- EnvironmentOverview Models Namespace
- Backend NuGet Dependencies
- EF Migration Snapshot & Columns
- Table Cell Selection (Drag)
- Cell Format Rendering Helper
- Chat Assistant Request Assertions
- Chat Message DTO
- Groq Request Shape
- Neon Platform Features
- Groq Response DTOs
- EnvironmentOverview Request Assertions
- EnvironmentOverview Cell Format DTO
- Neon Object Storage
- Postgres Egress Anti-Patterns
- Resource Cell Format Color Utility
- Frontend Dev Port Config
- Subscription Feature Decisions
- Agent Workflow Discipline Rules
- Action Items Line Parser
- Backend Route Factory
- EnvironmentOverview Status History Entity
- Configuration Constant Entity
- Backend Package Manifest
- Subscriptions Request Assertions
- Answer Question Request DTO
- Chat Conversation Entity
- Add Custom Color Request DTO
- Add Legend Entry Request DTO
- Resources Request Assertions
- Oxlint Rules Config
- Frontend NPM Scripts
- Ask Clarifying Question Args DTO
- Update Custom Color Request DTO
- Update Legend Entry Request DTO
- Available Azure Subscriptions DTO
- Neon Branching Strategies
- ConfiguredSubscription Entity
- Chat Conversation Summary DTO
- Groq Function Call DTO
- Update Environment Field Request DTO
- Update Environment Status Request DTO
- Update Uptime Schedule Request DTO
- Resource Status Enum
- Neon SDK & Logs
- App Entry Point & OG Strategy
- InfraGrid Social Share Card
- Dancing AI Agent Mascot
- Env Cell Format Frontend Models
- Backend Scope Discipline Rules
- Groq Function Output DTO
- Spinner Field Migration
- Configuration Constants Migration
- Environment Tag Backfill Migration
- Custom Colors Migration
- Custom Colors Reset Migration
- Custom Color Repair Migration
- Underline Format Migration
- Start/Stop Tags Migration
- Uptime Schedule Option Migration
- Legend Entries Migration
- GitNexus & Turbo Agent Blocks
- Frontend Template Config
- Root TypeScript Config
- Async Naming Rules
- Claude Session Resume Note
- Render PORT Variable
- We.PLM Logo Asset

## God Nodes (most connected - your core abstractions)
1. `ResourceNexus` - 73 edges
2. `PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Migrations` - 57 edges
3. `react` - 55 edges
4. `APIResponse` - 42 edges
5. `PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Data` - 38 edges
6. `EnvironmentOverviewDTO` - 32 edges
7. `ApplicationDatabaseContext` - 30 edges
8. `lucide-react` - 29 edges
9. `ValidationException` - 28 edges
10. `ChatAssistantService` - 25 edges

## Surprising Connections (you probably didn't know these)
- `Code Quality & Pre-Generation Checklist` --semantically_similar_to--> `Build and Verification Rules`  [INFERRED] [semantically similar]
  PLMInfrastructureRegisterClientServiceLayerMSC/CODING-RULES.md → PLMInfrastructureRegisterOrchestratorServiceLayerMSC/CODING-RULES.md
- `Research Before Writing Code Rule` --semantically_similar_to--> `AI Agent Repository Inspection Rules`  [INFERRED] [semantically similar]
  PLMInfrastructureRegisterClientServiceLayerMSC/CODING-RULES.md → PLMInfrastructureRegisterOrchestratorServiceLayerMSC/CODING-RULES.md
- `Ask When Pattern Not Covered Rule` --semantically_similar_to--> `Agent Assumption Policy`  [INFERRED] [semantically similar]
  PLMInfrastructureRegisterClientServiceLayerMSC/CODING-RULES.md → PLMInfrastructureRegisterOrchestratorServiceLayerMSC/CODING-RULES.md
- `Ask When Pattern Not Covered Rule` --semantically_similar_to--> `No-Hallucination Rules`  [INFERRED] [semantically similar]
  PLMInfrastructureRegisterClientServiceLayerMSC/CODING-RULES.md → PLMInfrastructureRegisterOrchestratorServiceLayerMSC/CODING-RULES.md
- `Reuse Component Before Writing New Code Rule` --semantically_similar_to--> `Existing Code Is the Source of Truth`  [INFERRED] [semantically similar]
  PLMInfrastructureRegisterClientServiceLayerMSC/CODING-RULES.md → PLMInfrastructureRegisterOrchestratorServiceLayerMSC/CODING-RULES.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Bind-the-repository-first pattern across GitNexus task skills** — claude_skills_gitnexus_debugging_skill, claude_skills_gitnexus_exploring_skill, claude_skills_gitnexus_impact_analysis_skill, claude_skills_gitnexus_refactoring_skill [EXTRACTED 1.00]
- **Neon Functions application instrumentation and observability integrations** — claude_skills_neon_functions_skill, claude_skills_neon_functions_references_sentry, claude_skills_neon_functions_references_mastra_studio [EXTRACTED 1.00]
- **Neon Functions caller-authentication guidance across SKILL, MCP, and production hardening docs** — claude_skills_neon_functions_skill, claude_skills_neon_functions_references_mcp, claude_skills_neon_functions_references_production_hardening [INFERRED 0.85]
- **Neon Backend Primitives Bundle** — _claude_skills_neon_skill_neon_platform, _claude_skills_neon_postgres_skill_lakebase_postgres, _claude_skills_neon_references_auth_managed_better_auth, _claude_skills_neon_object_storage_skill_neon_object_storage, _claude_skills_neon_skill_functions_primitive, _claude_skills_neon_skill_ai_gateway_primitive, _claude_skills_neon_skill_data_api_primitive [EXTRACTED 1.00]
- **Lakebase Search Capability Group** — _claude_skills_neon_postgres_skill_lakebase_search, _claude_skills_neon_postgres_references_vector_search_lakebase_vector_extension, _claude_skills_neon_postgres_references_full_text_search_lakebase_text_extension, _claude_skills_neon_postgres_references_hybrid_search_hybrid_search_concept, _claude_skills_neon_postgres_references_lakebase_search_drizzle_drizzle_orm_schema_management [EXTRACTED 1.00]
- **Postgres Egress Anti-Pattern Set** — _claude_skills_neon_postgres_egress_optimizer_skill_select_star_antipattern, _claude_skills_neon_postgres_egress_optimizer_skill_missing_pagination_antipattern, _claude_skills_neon_postgres_egress_optimizer_skill_high_frequency_static_query_antipattern, _claude_skills_neon_postgres_egress_optimizer_skill_application_side_aggregation_antipattern, _claude_skills_neon_postgres_egress_optimizer_skill_join_duplication_antipattern [EXTRACTED 1.00]
- **Core Register Domain Model** — context_resource, context_sync, context_resource_status, context_dynamic_field, context_manual_field [EXTRACTED 0.90]
- **Settings Page Feature Bundle** — plminfrastructureregisteragentdocumentationnmsc_prd_prd_one_9_10_26_settings_page, plminfrastructureregisteragentdocumentationnmsc_prd_prd_one_9_10_26_settings_sidebar, plminfrastructureregisteragentdocumentationnmsc_prd_prd_one_9_10_26_assetsphere_sidebar, plminfrastructureregisteragentdocumentationnmsc_prd_prd_one_9_10_26_subscriptions_sidebar_option, plminfrastructureregisteragentdocumentationnmsc_prd_prd_one_9_10_26_editing_sidebar_option [EXTRACTED 0.90]
- **Sync Scope and Matching Decisions** — plminfrastructureregisteragentdocumentationnmsc_todo_resource_identity_matching_key_todo_azure_resource_id_decision, plminfrastructureregisteragentdocumentationnmsc_todo_storage_account_sync_support_todo_vm_only_scope_decision, plminfrastructureregisteragentdocumentationnmsc_todo_manual_physical_machine_entry_todo_feature [INFERRED 0.75]
- **Clarifying-Question Pause/Resume Round Trip** — plminfrastructureregisteragentdocumentationnmsc_knowledge_base_how_gen_ui_works_ask_clarifying_question_tool, plminfrastructureregisteragentdocumentationnmsc_knowledge_base_how_gen_ui_works_persistpendingquestionandbuilddto, plminfrastructureregisteragentdocumentationnmsc_knowledge_base_how_gen_ui_works_chatmessagenexus, plminfrastructureregisterclientservicelayermsc_src_features_chatassistant_components_clarifyingquestioncardsharedcomponent, plminfrastructureregisteragentdocumentationnmsc_knowledge_base_how_gen_ui_works_answerquestionasynchronous [EXTRACTED 1.00]
- **Shared-Element Morph Recipe (Motion + Manual FLIP)** — plminfrastructureregisteragentdocumentationnmsc_shared_element_morph_animation_guide_motion_library, plminfrastructureregisteragentdocumentationnmsc_shared_element_morph_animation_guide_layoutid_portal_bug, plminfrastructureregisteragentdocumentationnmsc_shared_element_morph_animation_guide_manual_flip_technique, plminfrastructureregisterclientservicelayermsc_src_shared_components_chatassistantsharedcomponent [EXTRACTED 1.00]
- **Edit Mode Features Shipped Ungated Pending Admin Auth** — plminfrastructureregisteragentdocumentationnmsc_todo_admin_gated_row_deletion_and_edit_mode_todo_edit_mode_feature, plminfrastructureregisteragentdocumentationnmsc_todo_admin_gated_row_deletion_and_edit_mode_todo_row_soft_deletion, plminfrastructureregisteragentdocumentationnmsc_todo_admin_gated_row_deletion_and_edit_mode_todo_resource_cell_formatting, plminfrastructureregisteragentdocumentationnmsc_todo_admin_gated_row_deletion_and_edit_mode_todo_environmentoverviewstatushistorynexus [INFERRED 0.85]
- **Singleton Pattern Across the Stack** — plminfrastructureregisterclientservicelayermsc_coding_rules_singleton_service_architecture, plminfrastructureregisterorchestratorservicelayermsc_coding_rules_singleton_rules, plminfrastructureregisterorchestratorservicelayermsc_coding_rules_global_helpers_singleton [INFERRED 0.85]
- **Feature-Based Vertical Slice Architecture** — plminfrastructureregisterclientservicelayermsc_coding_rules_directory_topology, plminfrastructureregisterorchestratorservicelayermsc_coding_rules_feature_architecture, plminfrastructureregisterorchestratorservicelayermsc_coding_rules_feature_models [INFERRED 0.80]
- **Ask-Before-Assuming Workflow Discipline** — plminfrastructureregisterclientservicelayermsc_coding_rules_ask_when_pattern_not_covered, plminfrastructureregisterorchestratorservicelayermsc_coding_rules_no_hallucination_rules, plminfrastructureregisterorchestratorservicelayermsc_coding_rules_agent_assumption_policy [INFERRED 0.85]

## Communities (129 total, 26 thin omitted)

### Community 0 - "Shared UI Component Library"
Cohesion: 0.10
Nodes (46): Button Design System & Micro-Interactions, Categorized Component Library Catalog, PermissionGuardSharedComponent.tsx, CellFormatColorDef, CellFormatCON, CellFormatTextColorDef, CreateOptionModalController(), CreateOptionModalControllerProps (+38 more)

### Community 1 - "Resource Entity & Azure Flags"
Cohesion: 0.03
Nodes (62): ResourceNexus, ApacheSupportRequired, AtosAgentDeployed, AzureMonitoringSetupRequired, AzureResourceId, BackupRequired, BackupSchedule, BackupStatus (+54 more)

### Community 2 - "Frontend Layout & Route Constants"
Cohesion: 0.05
Nodes (38): ApplicationLayoutWidthCON, ApplicationRouteCON, ApplicationStickyHeaderCON, ApplicationTableDensityCON, TableHeightControlStaticComponent(), NavigationCON, NavItemDef, NavigationController() (+30 more)

### Community 3 - "Backend Feature Namespaces"
Cohesion: 0.07
Nodes (15): PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Utilities, PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentOverview.Assertion, PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Resources.Utilities, PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Resources.Services, PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentOverview.Services, PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Helpers, PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.ConfigurationConstants.Services, PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.ChatAssistant.Services (+7 more)

### Community 4 - "Frontend Coding Conventions"
Cohesion: 0.06
Nodes (43): Frontend Abbreviations Policy, ApplicationNetworkAPIConfiguration, Case Conventions, Component Hierarchy & Controller Roles, Constant & Configuration Classes (*CON.ts), Client Directory Topology, Explicit Component Signatures & JSX Return Types, Isolated Global Type Files (src/Types/*Type.ts) (+35 more)

### Community 5 - "Configuration Constants Service"
Cohesion: 0.12
Nodes (20): ConflictException, ConfigurationConstantsService, CustomColorOptionDTO, Color, ColorName, CreatedAt, CreatedBy, Format (+12 more)

### Community 6 - "Resources Screen & Search Bar"
Cohesion: 0.09
Nodes (22): ApplicationSearchBarCON, ResourceColumnCON, ResourceColumnDef, ResourcesScreenController(), ResourceTableUtility, ResourceInterfaceModel, InfrastructureRegisterScreenRoute(), GlobalSearchEntityType (+14 more)

### Community 7 - "Azure SDK Dependencies"
Cohesion: 0.08
Nodes (15): PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.ChatAssistant, PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Sync.Models, PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.ChatAssistant.Assertion, PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentOverview, PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Subscriptions.Assertion, PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.Sync, PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Models, PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.ConfigurationConstants (+7 more)

### Community 8 - "Clarifying Question Pause/Resume"
Cohesion: 0.08
Nodes (28): AnswerQuestionAsynchronous, ask_clarifying_question Tool, ChatMessageNexus (pending-question row), get_environment_action_items Tool, handleAnswerQuestion, PersistPendingQuestionAndBuildDTO, query_environment_overview Tool, query_resources Tool (+20 more)

### Community 10 - "Groq Tool-Call DTOs"
Cohesion: 0.09
Nodes (18): GroqInputMessageDTO, Content, Role, GroqResponseDTO, Output, ChatAssistantService, GetEnvironmentActionItemsArgsDTO, Environment (+10 more)

### Community 11 - "Chat Assistant HTTP Verbs"
Cohesion: 0.14
Nodes (6): EnvironmentOverviewController, APIResponse, Data, Errors, Message, Status

### Community 12 - "Table Column Resize & Preferences"
Cohesion: 0.12
Nodes (10): ApplicationTableHeightCON, ApplicationUserPreferenceKeyCON, ColumnResizeHandleProps, EnvironmentOverviewColumnWidthService, UseColumnWidthsResult, EnvironmentOverviewRowHeightService, RowResizeHandleProps, UseRowHeightsResult (+2 more)

### Community 13 - "Backend Controllers & Azure Client"
Cohesion: 0.10
Nodes (16): ChatAssistantController, ConfigurationConstantsController, AddSubscriptionRequestDTO, AzureSubscriptionId, ConfiguredSubscriptionDTO, AzureSubscriptionId, DisplayName, Id (+8 more)

### Community 14 - "Legend & Custom Color Modals"
Cohesion: 0.11
Nodes (12): AddCustomColorModalControllerProps, AddLegendModalControllerProps, ResourcesService, AddCustomColorOptionRequestInterfaceModel, AddLegendEntryRequestInterfaceModel, CustomColorOptionInterfaceModel, LegendEntryInterfaceModel, ResourceCellFormatInterfaceModel (+4 more)

### Community 15 - "Environment Overview DTO & Errors"
Cohesion: 0.12
Nodes (17): NotFoundException, EnvironmentOverviewDTO, ActionItemsUpdates, ConfigurationCustomisationVersion, CurrentUptimeSchedule, DNSURL, Environment, Id (+9 more)

### Community 17 - "Environment Overview Frontend Service"
Cohesion: 0.12
Nodes (8): EnvironmentOverviewService, AddActionItemRequestInterfaceModel, CreateEnvironmentOverviewRequestInterfaceModel, EnvironmentOverviewCellFormatInterfaceModel, UpdateActionItemRequestInterfaceModel, UpdateEnvironmentOverviewFieldRequestInterfaceModel, UpdateEnvironmentOverviewStatusRequestInterfaceModel, UpdateUptimeScheduleRequestInterfaceModel

### Community 18 - "Splash Screen Components"
Cohesion: 0.11
Nodes (15): SplashScreenLogoStaticComponent(), SplashScreenLogoStaticComponentProps, SplashScreenCON, SplashScreenController(), SplashScreenControllerProps, queryClient, ApplicationRouter, CreatableCustomSelectSharedComponentProps (+7 more)

### Community 19 - "Neon AI Gateway & Auth Skills"
Cohesion: 0.15
Nodes (20): Neon AI Gateway Skill, Neon AI Gateway, Mastra (agent framework), Vercel AI SDK (agent building), Managed Better Auth Implementation Guide, Self-managed Better Auth Guide, Neon Auth Skill, Better Auth / Managed Better Auth (+12 more)

### Community 20 - "Domain Glossary (CONTEXT.md)"
Cohesion: 0.16
Nodes (16): Dynamic Field, Manual Field, PLM Infrastructure Register, Resource, Resource Status, Sync, ADMIN_GATED_ROW_DELETION_AND_EDIT_MODE_TODO, PermissionGuardSharedComponent (+8 more)

### Community 21 - "Screen Features & Audit Trail"
Cohesion: 0.14
Nodes (13): Environment Overview Screen, Infrastructure Register (Resources) Screen, EnvironmentOverviewStatusHistoryNexus (audit log), Infrastructure Register Cell Formatting (IG_ResourceCellFormatTBL), Soft Delete via IsDeleted/DeletedAt on EnvironmentOverviewNexus, ViewEditModeCON, ControllBlockSharedComponentProps, SegmentedControlOption (+5 more)

### Community 22 - "App TypeScript Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+11 more)

### Community 23 - "Root Package Config"
Cohesion: 0.11
Nodes (17): devDependencies, turbo, name, packageManager, private, scripts, build, clean (+9 more)

### Community 24 - "Theme Toggle Component"
Cohesion: 0.16
Nodes (9): ApplicationThemeCON, AnimatedThemeToggleSharedComponent(), AnimatedThemeToggleSharedComponentProps, getThemeTransitionClipPaths(), polygonCollapsed(), TransitionVariant, ThemeToggleSharedComponentProps, ApplicationThemeUtility (+1 more)

### Community 25 - "EnvironmentOverview Entity Fields"
Cohesion: 0.11
Nodes (18): EnvironmentOverviewNexus, ActionItemsUpdates, ConfigurationCustomisationVersion, CurrentUptimeSchedule, DeletedAt, DisplayOrder, DNSURL, Environment (+10 more)

### Community 26 - "Neon Auth & Triggers"
Cohesion: 0.18
Nodes (15): Managed Better Auth, Self-Managed Better Auth, Claimable Neon, Function Trigger, Schedule Trigger (cron), parseEnv (@neon/env), AI Gateway, Data API (+7 more)

### Community 27 - "GitNexus Skill Docs"
Cohesion: 0.24
Nodes (17): GitNexus CLI Commands Skill, GitNexus Debugging Skill, GitNexus Exploring Skill, GitNexus Guide Skill, context tool, cypher tool, detect_changes tool, explain tool (+9 more)

### Community 28 - "EnvironmentOverview Migrations"
Cohesion: 0.15
Nodes (4): AddEnvironmentOverviewStatusHistory, AddEnvironmentOverviewSoftDelete, AddResourceCellFormat, AddChatConversationHistory

### Community 29 - "Badge & Card Components"
Cohesion: 0.17
Nodes (9): BadgeSharedComponentProps, CardSharedComponent(), CardSharedComponentProps, DataTableContainerSharedComponent, DataTableContainerSharedComponentProps, TableHorizontalScrollPillSharedComponent(), TableHorizontalScrollPillSharedComponentProps, ApplicationHorizontalScrollPillUtility (+1 more)

### Community 30 - "Node TypeScript Config"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 31 - "Resource Cell Format DTO"
Cohesion: 0.14
Nodes (10): ResourceCellFormatDTO, BackgroundColorKey, BackgroundOpacity, ColumnKey, IsBold, IsItalic, IsUnderline, ResourceId (+2 more)

### Community 32 - "Data Backfill Migrations"
Cohesion: 0.16
Nodes (4): BackfillFunctionColumn, FixEnvironmentOverviewStatusColumn, AddEnvironmentOverviewSponsorOptions, AddCellFormatTextColor

### Community 33 - "Subscriptions Frontend Service"
Cohesion: 0.23
Nodes (6): ApplicationNetworkAPIConfiguration, EditSubscriptionDisplayNameModalControllerProps, SubscriptionsService, AvailableAzureSubscriptionInterfaceModel, ConfiguredSubscriptionInterfaceModel, SubscriptionDeletionResultInterfaceModel

### Community 34 - "Chat Assistant Frontend Service"
Cohesion: 0.20
Nodes (6): ChatAssistantService, AnswerQuestionRequestInterfaceModel, APIResponseInterfaceModel, AskQuestionRequestInterfaceModel, ChatConversationSummaryInterfaceModel, ChatMessageInterfaceModel

### Community 35 - "EF DbContext & Chat Tables"
Cohesion: 0.14
Nodes (11): ApplicationDatabaseContext, ChatConversations, ChatMessages, ConfigurationConstants, ConfiguredSubscriptions, EnvironmentOverviewCellFormats, EnvironmentOverviews, EnvironmentOverviewStatusHistories (+3 more)

### Community 36 - "Product Requirement Docs (PRDs)"
Cohesion: 0.15
Nodes (15): Add Environment Smooth Scroll (Example PRD), Environment Overview Columns Dropdown (Example PRD), Infrastructure Register Columns Dropdown, PRD Example (9/10/2026), Add Environment Smooth Scroll, AssetSphere Sidebar, Configure Subscriptions Link, Editing Sidebar Option (Color Management) (+7 more)

### Community 37 - "Frontend Package Manifest"
Cohesion: 0.14
Nodes (13): name, private, type, version, @babel/core, babel-plugin-react-compiler, oxlint, tailwindcss (+5 more)

### Community 38 - "Environment Cell Format Update DTO"
Cohesion: 0.15
Nodes (13): EnvironmentOverviewCellFormatTargetDTO, ColumnKey, EnvironmentOverviewId, UpdateEnvironmentOverviewCellFormatRequestDTO, BackgroundColorKey, BackgroundOpacity, Cells, ClearBackgroundColor (+5 more)

### Community 39 - "Resource Cell Format Update DTO"
Cohesion: 0.15
Nodes (13): ResourceCellFormatTargetDTO, ColumnKey, ResourceId, UpdateResourceCellFormatRequestDTO, BackgroundColorKey, BackgroundOpacity, Cells, ClearBackgroundColor (+5 more)

### Community 40 - "Subscription & EnvOverview Migrations"
Cohesion: 0.19
Nodes (3): AddConfiguredSubscriptions, AddEnvironmentOverview, AddEnvironmentOverviewCellFormat

### Community 42 - "ChatMessage Entity"
Cohesion: 0.15
Nodes (12): ChatMessageNexus, ConversationId, CreatedAt, Id, IsSkipped, MessageKind, PendingInputStateJson, Role (+4 more)

### Community 43 - "IG Naming Convention Migrations"
Cohesion: 0.17
Nodes (3): AddResources, RenameTablesToIGConvention, AddCellFormatBackgroundOpacity

### Community 44 - "Repo Governance & Patterns"
Cohesion: 0.18
Nodes (7): AssetSphere Canonical Client Architecture, *CON.ts Constant Class Pattern, EmptyStateSharedComponent, SignForge Sibling Codebase, Class-Based Singleton Service Architecture (ClassName.current), TanstackQueryClientService Hub Pattern, Zustand Reactive State Store Pattern

### Community 45 - "Configuration Constants Assertion"
Cohesion: 0.18
Nodes (5): ConfigurationConstantsAssertion, Current, AddConfigurationConstantOptionRequestDTO, Value, DatabaseConnectionStringUtility

### Community 46 - "Custom Color Backfill Migration"
Cohesion: 0.17
Nodes (3): InitialCreate, BackfillCustomColorIds, AddEnvironmentOverviewUptimeScheduleNote

### Community 47 - "Frontend Runtime Dependencies"
Cohesion: 0.17
Nodes (12): dependencies, lucide-react, motion, react, react-dom, react-markdown, remark-gfm, sonner (+4 more)

### Community 48 - "Frontend Build Tooling Deps"
Cohesion: 0.17
Nodes (12): devDependencies, @babel/core, babel-plugin-react-compiler, oxlint, @rolldown/plugin-babel, @types/babel__core, @types/node, @types/react (+4 more)

### Community 49 - "Ask Question Response DTO"
Cohesion: 0.17
Nodes (10): AskQuestionResponseDTO, Answer, ConversationId, PendingQuestion, ClarifyingQuestionDTO, AllowMultiple, Description, Heading (+2 more)

### Community 50 - "Resource Cell Format Entity"
Cohesion: 0.17
Nodes (11): ResourceCellFormatNexus, BackgroundColorKey, BackgroundOpacity, ColumnKey, Id, IsBold, IsItalic, IsUnderline (+3 more)

### Community 51 - "Backend Dev Port Config"
Cohesion: 0.18
Nodes (10): Backend Dev Port 8294, ASPNETCORE_ENVIRONMENT, applicationUrl, commandName, dotnetRunMessages, environmentVariables, launchBrowser, profiles (+2 more)

### Community 52 - "Design System Tokens"
Cohesion: 0.20
Nodes (7): Hairline Border & Divider System, Brand Sapphire Accent (#0C2086), Dual-Canvas Color Token System, Modal Architecture & Backdrop Physics, Radii & Elevation Vocabulary, Tri-Font Typography System, Type Scale & Hierarchy Reference Table

### Community 53 - "TanStack Query Keys"
Cohesion: 0.29
Nodes (3): TanstackQueryKeysCON, AddConfigurationConstantOptionRequestInterfaceModel, ConfigurationConstantsService

### Community 54 - "EnvironmentOverview Table Utility"
Cohesion: 0.40
Nodes (5): EnvironmentOverviewColumnDef, EnvironmentOverviewCON, EnvironmentOverviewTableUtility, DraftEnvironmentOverviewRowInterfaceModel, EnvironmentOverviewInterfaceModel

### Community 55 - "Uptime Schedule Text Parser"
Cohesion: 0.25
Nodes (4): EMPTY_PARSED, ParsedUptimeSchedule, UPTIME_SCHEDULE_WEEKDAYS, UptimeScheduleTextUtility

### Community 56 - "Create EnvironmentOverview Request DTO"
Cohesion: 0.18
Nodes (11): CreateEnvironmentOverviewRequestDTO, ActionItemsUpdates, ConfigurationCustomisationVersion, CurrentUptimeSchedule, DNSURL, Environment, Priority1, Priority2 (+3 more)

### Community 57 - "EnvironmentOverview Cell Format Entity"
Cohesion: 0.18
Nodes (11): EnvironmentOverviewCellFormatNexus, BackgroundColorKey, BackgroundOpacity, ColumnKey, EnvironmentOverviewId, Id, IsBold, IsItalic (+3 more)

### Community 58 - "Turborepo Pipeline Config"
Cohesion: 0.18
Nodes (10): outputs, cache, cache, persistent, $schema, tasks, build, clean (+2 more)

### Community 59 - "Lakebase Hybrid Search"
Cohesion: 0.33
Nodes (8): lakebase_bm25 Index, lakebase_text Extension, Hybrid Search, Reciprocal Rank Fusion (RRF), Drizzle ORM Lakebase Search Schema Management, lakebase_ann Index, lakebase_vector Extension, Lakebase Search

### Community 60 - "Env Key Validator Helper"
Cohesion: 0.22
Nodes (4): ENKeyNotFoundException, Key, ENValidatorHelper, Current

### Community 62 - "EnvironmentOverview Models Namespace"
Cohesion: 0.20
Nodes (3): PLMInfrastructureRegisterOrchestratorServiceLayerMSC.Features.EnvironmentOverview.Models, AddActionItemRequestDTO, Note

### Community 63 - "Backend NuGet Dependencies"
Cohesion: 0.20
Nodes (9): net10.0, Azure.Identity (1.21.0), Azure.ResourceManager (1.14.0), Azure.ResourceManager.Compute (1.17.0), Azure.ResourceManager.Network (1.17.0), Microsoft.AspNetCore.OpenApi (10.0.11), Microsoft.EntityFrameworkCore.Design (10.0.12), Npgsql.EntityFrameworkCore.PostgreSQL (10.0.3) (+1 more)

### Community 65 - "Table Cell Selection (Drag)"
Cohesion: 0.22
Nodes (8): computeRectangleForAxis(), TableSelectionDragAxis, TableSelectionMouseHandlers, TableSelectionPoint, TableSelectionRectangle, TableSelectionService, UseTableSelectionParams, UseTableSelectionResult

### Community 67 - "Chat Assistant Request Assertions"
Cohesion: 0.20
Nodes (6): ChatAssistantAssertion, Current, AskQuestionRequestDTO, ClientId, ConversationId, Question

### Community 68 - "Chat Message DTO"
Cohesion: 0.20
Nodes (9): ChatMessageDTO, CreatedAt, Id, IsSkipped, MessageKind, Role, Text, ToolCallArguments (+1 more)

### Community 69 - "Groq Request Shape"
Cohesion: 0.20
Nodes (10): GroqRequestDTO, Input, Instructions, Model, Tools, GroqToolDefinitionDTO, Description, Name (+2 more)

### Community 70 - "Neon Platform Features"
Cohesion: 0.22
Nodes (8): Autoscaling, Connection Pooling (PgBouncer), Instant Restore, IP Allow Lists, Lakebase Postgres, Logical Replication, Read Replicas, Scale to Zero

### Community 71 - "Groq Response DTOs"
Cohesion: 0.22
Nodes (9): GroqResponseContentItemDTO, Text, Type, GroqResponseOutputItemDTO, Arguments, CallId, Content, Name (+1 more)

### Community 72 - "EnvironmentOverview Request Assertions"
Cohesion: 0.28
Nodes (4): EnvironmentOverviewAssertion, Current, UpdateActionItemRequestDTO, ReplacementLineText

### Community 73 - "EnvironmentOverview Cell Format DTO"
Cohesion: 0.22
Nodes (9): EnvironmentOverviewCellFormatDTO, BackgroundColorKey, BackgroundOpacity, ColumnKey, EnvironmentOverviewId, IsBold, IsItalic, IsUnderline (+1 more)

### Community 74 - "Neon Object Storage"
Cohesion: 0.29
Nodes (7): AWS S3 Client (direct), buckets Declaration in neon.ts, Files SDK, Neon Object Storage, Presigned URL, storage_object_created Trigger, Neon CLI

### Community 75 - "Postgres Egress Anti-Patterns"
Cohesion: 0.29
Nodes (7): Application-Side Aggregation Anti-Pattern, High-Frequency Query on Static Data, JOIN Duplication Anti-Pattern, Missing Pagination Anti-Pattern, pg_stat_statements, SELECT * Anti-Pattern, neon inspect db Diagnostics

### Community 77 - "Frontend Dev Port Config"
Cohesion: 0.25
Nodes (6): Frontend Dev Port 4637, Program.cs CORS Config, @rolldown/plugin-babel, @tailwindcss/vite, vite, @vitejs/plugin-react

### Community 78 - "Subscription Feature Decisions"
Cohesion: 0.25
Nodes (3): CONTEXT.md — Resource Status Rules, Configure Subscriptions Feature, Admin-Gated Row Deletion & Edit Mode (deferred, blocked on auth)

### Community 80 - "Action Items Line Parser"
Cohesion: 0.32
Nodes (4): ActionItemsLineParserUtility, LEADING_DATE_REGEX, MONTH_ABBREVIATIONS, ParsedActionItemsLine

### Community 81 - "Backend Route Factory"
Cohesion: 0.25
Nodes (7): ApplicationRouteFactory, ChatAssistantRoutes, ConfigurationConstantsRoutes, EnvironmentOverviewRoutes, ResourcesRoutes, SubscriptionsRoutes, SyncRoutes

### Community 82 - "EnvironmentOverview Status History Entity"
Cohesion: 0.25
Nodes (7): EnvironmentOverviewStatusHistoryNexus, ChangedAt, ChangedByClientId, EnvironmentOverviewId, Id, NewStatus, PreviousStatus

### Community 83 - "Configuration Constant Entity"
Cohesion: 0.25
Nodes (7): ConfigurationConstantClass, ConfigurationKey, ConfigurationValue, CreatedAt, Id, Notes, UpdatedAt

### Community 84 - "Backend Package Manifest"
Cohesion: 0.25
Nodes (7): name, private, scripts, build, dev, lint, version

### Community 85 - "Subscriptions Request Assertions"
Cohesion: 0.33
Nodes (4): ValidationException, ValidationErrors, SubscriptionsAssertion, Current

### Community 86 - "Answer Question Request DTO"
Cohesion: 0.29
Nodes (6): AnswerQuestionRequestDTO, ConversationId, FreeTextAnswer, IsSkipped, MessageId, SelectedOptions

### Community 87 - "Chat Conversation Entity"
Cohesion: 0.29
Nodes (6): ChatConversationNexus, AnonymousClientId, CreatedAt, Id, Title, UpdatedAt

### Community 88 - "Add Custom Color Request DTO"
Cohesion: 0.29
Nodes (5): AddCustomColorOptionRequestDTO, Color, ColorName, CreatedByClientId, Format

### Community 89 - "Add Legend Entry Request DTO"
Cohesion: 0.29
Nodes (5): AddLegendEntryRequestDTO, Color, CreatedByClientId, Format, Name

### Community 91 - "Oxlint Rules Config"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 92 - "Frontend NPM Scripts"
Cohesion: 0.33
Nodes (6): scripts, build, clean, dev, lint, preview

### Community 93 - "Ask Clarifying Question Args DTO"
Cohesion: 0.33
Nodes (5): AskClarifyingQuestionArgsDTO, AllowMultiple, Description, Heading, Options

### Community 94 - "Update Custom Color Request DTO"
Cohesion: 0.33
Nodes (4): UpdateCustomColorOptionRequestDTO, Color, ColorName, Format

### Community 95 - "Update Legend Entry Request DTO"
Cohesion: 0.33
Nodes (4): UpdateLegendEntryRequestDTO, Color, Format, Name

### Community 96 - "Available Azure Subscriptions DTO"
Cohesion: 0.40
Nodes (3): AvailableAzureSubscriptionDTO, AzureSubscriptionId, DisplayName

### Community 97 - "Neon Branching Strategies"
Cohesion: 0.50
Nodes (4): Branching in CI/CD, Normal Branch, Reset from Parent, Schema-Only Branch (Beta)

### Community 98 - "ConfiguredSubscription Entity"
Cohesion: 0.40
Nodes (4): ConfiguredSubscription, AzureSubscriptionId, DisplayName, Id

### Community 99 - "Chat Conversation Summary DTO"
Cohesion: 0.40
Nodes (4): ChatConversationSummaryDTO, Id, Title, UpdatedAt

### Community 100 - "Groq Function Call DTO"
Cohesion: 0.40
Nodes (5): GroqFunctionCallItemDTO, Arguments, CallId, Name, Type

### Community 101 - "Update Environment Field Request DTO"
Cohesion: 0.40
Nodes (3): UpdateEnvironmentOverviewFieldRequestDTO, FieldName, Value

### Community 102 - "Update Environment Status Request DTO"
Cohesion: 0.40
Nodes (3): UpdateEnvironmentOverviewStatusRequestDTO, ChangedByClientId, Status

### Community 103 - "Update Uptime Schedule Request DTO"
Cohesion: 0.40
Nodes (3): UpdateUptimeScheduleRequestDTO, CurrentUptimeSchedule, UptimeScheduleNote

### Community 104 - "Resource Status Enum"
Cohesion: 0.40
Nodes (4): ResourceStatus, Decommissioned, Running, Stopped

### Community 105 - "Neon SDK & Logs"
Cohesion: 0.50
Nodes (4): Branch-Scoped Logs, Loki-Compatible Read API, @neon/sdk, @neondatabase/api-client (legacy)

### Community 106 - "App Entry Point & OG Strategy"
Cohesion: 0.50
Nodes (3): index.html Entry Point, InfraGrid Application, main.tsx Module Script

### Community 107 - "InfraGrid Social Share Card"
Cohesion: 0.83
Nodes (4): og-image.png (InfraGrid Social Share Card), "Azure Infrastructure Register" Tagline, InfraGrid (Product Name), We.PLM (Organization Brand)

### Community 108 - "Dancing AI Agent Mascot"
Cohesion: 0.50
Nodes (4): Dancing AI Agent Mascot Animation (webm), Dancing AI Agent Mascot Character, Dancing AI Agent Mascot (Static Image), InfraGrid App UI Branding

### Community 111 - "Groq Function Output DTO"
Cohesion: 0.50
Nodes (4): GroqFunctionCallOutputItemDTO, CallId, Output, Type

### Community 122 - "GitNexus & Turbo Agent Blocks"
Cohesion: 0.67
Nodes (3): GitNexus Code Intelligence, Turborepo Agent Guidance Block, GitNexus Code Intelligence (CLAUDE.md copy)

### Community 123 - "Frontend Template Config"
Cohesion: 0.67
Nodes (3): Oxlint Type-Aware Configuration, React Compiler (enabled), React + TypeScript + Vite Template

## Ambiguous Edges - Review These
- `Dancing AI Agent Mascot (Static Image)` → `Dancing AI Agent Mascot Animation (webm)`  [AMBIGUOUS]
  PLMInfrastructureRegisterClientServiceLayerMSC/src/Assets/Images/DancingAIAgentMascotImage.png · relation: shares_data_with
- `Utility vs Helper Distinction` → `Feature Architecture`  [AMBIGUOUS]
  PLMInfrastructureRegisterClientServiceLayerMSC/CODING-RULES.md · relation: conceptually_related_to

## Knowledge Gaps
- **425 isolated node(s):** `tailwindcss`, `@babel/core`, `@types/babel__core`, `@types/node`, `@types/react` (+420 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 696 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **26 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AnswerQuestionAsynchronous` connect `Clarifying Question Pause/Resume` to `Backend Feature Namespaces`?**
  _High betweenness centrality (0.296) - this node is a cross-community bridge._
- **What connects `tailwindcss`, `@babel/core`, `@types/babel__core` to the rest of the system?**
  _425 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Shared UI Component Library` be split into smaller, more focused modules?**
  _Cohesion score 0.09833187006145742 - nodes in this community are weakly interconnected._
- **Why does `react` connect `Badge & Card Components` to `Shared UI Component Library`, `Table Cell Selection (Drag)`, `Frontend Layout & Route Constants`, `Frontend Package Manifest`, `Resources Screen & Search Bar`, `Clarifying Question Pause/Resume`, `Table Column Resize & Preferences`, `Splash Screen Components`, `Screen Features & Audit Trail`, `Theme Toggle Component`?**
  _High betweenness centrality (0.137) - this node is a cross-community bridge._
- **Should `Resource Entity & Azure Flags` be split into smaller, more focused modules?**
  _Cohesion score 0.03225806451612903 - nodes in this community are weakly interconnected._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `Dancing AI Agent Mascot (Static Image)` and `Dancing AI Agent Mascot Animation (webm)`?**
  _Edge tagged AMBIGUOUS (relation: shares_data_with) - confidence is low._
- **What is the exact relationship between `Utility vs Helper Distinction` and `Feature Architecture`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._