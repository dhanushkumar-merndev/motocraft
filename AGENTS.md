# Agent Form App — Website Lead Collection

## Overview

A public, mobile-friendly web form that collects leads directly into the same Postgres DB & S3 bucket as the existing MotoCraft app. No Firebase auth required for form submission. Leads submitted via this form appear instantly in the Android app with `source = "website"`.

---

## Backend Endpoints (New Public Routes)

All live under `app/api/leads/` — **no Firebase auth**. Secured by a shared secret via `x-api-key` header.

### `POST /api/leads`

Create a lead. Returns `{ id }` for resume upload flow.

**Header:** `x-api-key: <WEBSITE_API_KEY>`

```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "9876543210",
  "positionApplyingFor": "service_manager",
  "location": "Yes",
  "campaignName": "fb_campaign_123"
}
```

**Backend processing:**
| Field | Rule |
|-------|------|
| `source` | `"website"` |
| `status` | `"new"` |
| `department` | Inferred via `inferDepartment(positionApplyingFor)` |
| `location` | `"Yes"` → `"Bengaluru"`, `"No"` → `"no"` |
| `sheetRowNumber` | `null` |
| `campaignName` | If empty/missing → `"collected via website"` |
| `createdTime` | `new Date()` |
| `id` | Auto-generated UUID via `defaultRandom()` |

**Response:**

```json
{ "success": true, "data": { "id": "uuid-here" } }
```

### `GET /api/leads/{id}/resume-upload-url`

Returns a presigned S3 PUT URL (5 min TTL).

**Header:** `x-api-key: <WEBSITE_API_KEY>`

**Response:**

```json
{
  "success": true,
  "data": { "uploadUrl": "...", "fileKey": "resumes/{id}/..." }
}
```

### `POST /api/leads/{id}/resume`

Confirm resume upload. Updates DB with `resumeFileKey`, `resumeUploadedAt`, inserts `lead_events` row.

**Header:** `x-api-key: <WEBSITE_API_KEY>`

```json
{ "fileKey": "resumes/{id}/...pdf" }
```

**Response:**

```json
{ "success": true, "data": { "lead": {...}, "resumeUrl": "..." } }
```

### CORS

The new public routes must handle browser CORS. Add to each route's `OPTIONS` handler:

```typescript
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, x-api-key",
    },
  });
}
```

And include these headers in `GET`/`POST` responses (already returned via `NextResponse.json`).

### API Key

Store in env: `WEBSITE_API_KEY=some-random-string`. Validated in each route:

```typescript
const apiKey = request.headers.get("x-api-key");
if (apiKey !== process.env.WEBSITE_API_KEY) {
  return error("UNAUTHORIZED", "Invalid API key", 401);
}
```

---

## Form UI — Visual Design

### Color Palette

### Typography

- Font stack: `system-ui, -apple-system, sans-serif`
- Heading: `1.5rem / 600` (title), `0.875rem / 500` (card title)
- Labels: `0.8rem / 500`, color `var(--text-muted)`
- Input text: `0.95rem / 400`, color `var(--text)`
- Error text: `0.75rem`, color `var(--error)`

### Input Fields

All inputs follow the same pattern:

```
┌─────────────────────────────────┐
│ Label                           │
│ ┌─────────────────────────────┐ │
│ │                             │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

| Property          | Value                               |
| ----------------- | ----------------------------------- |
| Background        | `var(--surface)`                    |
| Border            | `1px solid var(--border)`           |
| Border radius     | `12px`                              |
| Padding           | `14px 16px`                         |
| Focus border      | `1px solid var(--primary)`          |
| Focus ring        | `0 0 0 3px rgba(225, 29, 72, 0.15)` |
| Transition        | `all 0.2s ease`                     |
| Width             | `100%`                              |
| Text color        | `var(--text)`                       |
| Placeholder color | `var(--text-muted)`                 |

### Dropdown / Select

Same visual as inputs but with a custom chevron. Options have `14px` padding, `var(--surface)` hover background, dark dropdown panel.

### Submit Button

```
┌─────────────────────────────────┐
│     Submit Application          │
└─────────────────────────────────┘
```

| Property      | Value                                             |
| ------------- | ------------------------------------------------- |
| Background    | `var(--primary)`                                  |
| Hover         | `var(--primary-hover)`                            |
| Text          | `#FFFFFF`, `600` weight                           |
| Padding       | `16px`                                            |
| Border radius | `12px`                                            |
| Width         | `100%`                                            |
| Cursor        | `pointer` on idle, `not-allowed` while submitting |
| Transition    | `background 0.2s ease`                            |
| Disabled      | `opacity: 0.6`, `cursor: not-allowed`             |

### File Upload (Resume)

A styled upload zone:

```
┌─────────────────────────────────┐
│  Upload Resume (optional)       │
│  ┌───────────────────────────┐  │
│  │  Drag & drop or click     │  │
│  │  📄 resume.pdf (120 KB)   │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

| Property                | Value                                 |
| ----------------------- | ------------------------------------- |
| Drop zone border        | `2px dashed var(--border)`            |
| Drop zone border radius | `12px`                                |
| Drop zone padding       | `24px`                                |
| Drop zone hover         | `border-color: var(--primary)`        |
| Selected file           | Show filename + size, green checkmark |
| Accepted types          | `application/pdf`                     |
| Max size                | `2 MB`                                |

### Success State

After submission, show:

```
┌─────────────────────────────────┐
│                                 │
│      ✓ Application Submitted    │
│                                 │
│   Thank you, John! We'll be     │
│   in touch within 2-3 business  │
│   days.                         │
│                                 │
│         [Submit Another]        │
│                                 │
└─────────────────────────────────┘
```

### Layout

- Centered card, max-width `480px`
- Card: `var(--card-bg)` background, `24px` padding, `16px` border radius
- Gap between fields: `20px`
- Responsive: full width on mobile with `16px` horizontal padding
- Background: dark gradient or solid `var(--bg)`

---

## Form Fields — Order & Validation

| #   | Field        | Type        | Validation                   | Notes                          |
| --- | ------------ | ----------- | ---------------------------- | ------------------------------ |
| 1   | Full Name    | Text input  | Required, min 2 chars        | Auto-capitalize words          |
| 2   | Email        | Email input | Required, valid email format | Type="email"                   |
| 3   | Phone Number | Tel input   | Required, 10 digits          | Strip non-digits, max 10 chars |
| 4   | Location     | Dropdown    | Required                     | 2 options: "Yes" / "No"        |
| 5   | Position     | Dropdown    | Required                     | 8 options (see below)          |
| 6   | Resume       | File upload | Optional                     | PDF only, max 2 MB             |

### Location Dropdown

| Display               | Stored value |
| --------------------- | ------------ |
| Yes, I'm in Bengaluru | `"Yes"`      |
| No                    | `"No"`       |

Backend converts: `"Yes"` → `"Bengaluru"`, `"No"` → `"no"`

### Position Dropdown

| Display          | `positionApplyingFor` value (sent to API) |
| ---------------- | ----------------------------------------- |
| Sales Manager    | `sales_manager`                           |
| Sales Executive  | `sales_executive`                         |
| Test Rider       | `test_rider`                              |
| Receptionist     | `receptionist`                            |
| Service Manager  | `service_manager`                         |
| Service Advisor  | `service_advisor`                         |
| Technician       | `technician`                              |
| Parts Manager    | `parts_manager`                           |
| Parts Supervisor | `parts_supervisor`                        |

### Department (Auto-inferred, not displayed)

| Position                                                 | Department            |
| -------------------------------------------------------- | --------------------- |
| Sales Manager, Sales Executive, Test Rider, Receptionist | `Sales`               |
| Service Manager, Service Advisor, Technician             | `Service`             |
| Parts Manager, Parts Supervisor                          | `Parts & Accessories` |

---

## Campaign Tracking

```
https://motocraft-form.vercel.app/?campaign=fb_spring_2026
```

- Read `campaign` from `URLSearchParams` on page load
- If param missing or empty → use `"collected via website"`
- Send raw value in `campaignName` field of `POST /api/leads`

---

## Resume Upload Flow

After lead creation, if user selected a resume:

1. **`POST /api/leads`** → get `{ id }` in response
2. **`GET /api/leads/{id}/resume-upload-url`** → get `{ uploadUrl, fileKey }`
3. **`PUT`** raw file bytes to `uploadUrl` (direct S3, no auth header needed, just `Content-Type: application/pdf`)
4. **`POST /api/leads/{id}/resume`** with `{ "fileKey": "..." }` → backend confirms, DB updated

The upload URL expires in 5 minutes. If it expires, call `GET` again to get a fresh one.

No loading spinners during upload — show a simple progress bar using `XMLHttpRequest` `upload.onprogress` (or `fetch` is fine for <2 MB files).

---

## How Leads Look in the Android App

- `source` = `"website"` (visible in lead detail)
- `status` = `"new"` → appears in the "New" tab
- `department` = inferred from position → filterable in dashboard
- `campaignName` = FB campaign or `"collected via website"` → filterable
- Resume appears in the detail screen's in-app PDF viewer (cached per leadId)
- No sheet row number displayed (handled safely with null checks)

---

## Tech Stack

| Layer        | Technology                                                         |
| ------------ | ------------------------------------------------------------------ |
| Hosting      | Vercel (same project, new routes)                                  |
| Framework    | Next.js App Router (existing)                                      |
| Database     | Postgres via Drizzle ORM (existing)                                |
| File storage | AWS S3 (existing)                                                  |
| Frontend     | Vanilla HTML/CSS/JS or React SPA (hosted separately or via Vercel) |
| Form domain  | Separate from main app (e.g., `motocraft-form.vercel.app`)         |

---

## File Structure (Backend — New Files)

```
app/api/leads/
├── route.ts                  # POST /api/leads — create lead
├── [id]/
│   ├── resume-upload-url/
│   │   └── route.ts          # GET presigned URL
│   └── resume/
│       └── route.ts          # POST confirm upload
```

Each route reuses existing services from `src/services/resume.service.ts` and `src/utils/normalize.ts`.

---

## Logos

Copy these files to the form project's assets directory:

| File                  | Absolute path                                                                                                    | Usage                                         |
| --------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Login logo (PNG)      | `/home/dhanush/AndroidStudioProjects/MotoCraftApp/app/src/main/res/drawable-nodpi/motocraft_login_logo.png`      | Main brand logo (full width, dark background) |
| App icon (PNG)        | `/home/dhanush/AndroidStudioProjects/MotoCraftApp/app/src/main/res/drawable-nodpi/motocraft_app_icon.png`        | Favicon / OG image                            |
| Icon foreground (PNG) | `/home/dhanush/AndroidStudioProjects/MotoCraftApp/app/src/main/res/drawable-nodpi/motocraft_icon_foreground.png` | Transparent-background icon for light/dark    |

No SVG exists — convert the PNGs to WebP or SVG as needed for the web.

---

## Implementation Order

1. Create `POST /api/leads` route with API key validation
2. Create `GET /api/leads/{id}/resume-upload-url` route
3. Create `POST /api/leads/{id}/resume` route
4. Add CORS `OPTIONS` handlers to all three
5. Add `WEBSITE_API_KEY` to Vercel environment variables
6. Build the form frontend (theme, fields, validation, resume upload)
7. Deploy form frontend to Vercel
8. Test end-to-end: submit form → check Android app for new lead
