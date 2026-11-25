# Contract: `FrontendDesignSchema` on the existing ConfigurationConstants endpoint

No new endpoint. This adds one new allow-listed `fieldName` value to the existing, already-public `GET /ConfigurationConstants/{fieldName}` endpoint.

## Request

```
GET /ConfigurationConstants/FrontendDesignSchema
```

Identical shape to every other existing call (e.g. `GET /ConfigurationConstants/Sponsor`) — no new route, no new query parameters, no new headers.

## Response

```json
{
  "status": true,
  "message": "Options retrieved successfully.",
  "data": ["ATLASCOPCO"],
  "errors": []
}
```

Same `APIResponse<List<string>>` envelope every other field on this endpoint already returns. `data` holds exactly one element once seeded; an empty array is a valid response (treated as the `AtlasCopco` default by the frontend, per data-model.md).

## Write-side

None. `POST /ConfigurationConstants/{fieldName}/Options` (the existing "add option" endpoint) is never called for this `fieldName` by any part of this feature — the value is seeded once via migration and changed only by editing the database row directly, per the confirmed "pure backend/database setting, no in-app UI" clarification.

## Backward compatibility

Fully additive: one new dictionary entry in `ConfigurationConstantsAssertion.OptionsFieldNameToConfigurationKey`, one new seeded row. Every existing `fieldName` (`Status`, `Sponsor`, `ResourceCellFormatColor`, `UptimeScheduleType`, `OnDemandStatus`) and every existing caller of this endpoint is unaffected.
