# MotoCraft Careers — Lead Collection Form

A mobile-friendly web form that collects job applications directly into the MotoCraft PostgreSQL database. No sign-in required. Leads appear instantly in the Android app with `source = "website"`.

---

## Campaign Tracking

Track which ad or channel each lead came from via URL parameters.

### Supported Parameters (priority order)

1. `campaign` — generic param for any source
2. `utm_campaign` — standard UTM param (Facebook Ads, Google Ads, etc.)
3. If neither is present → defaults to `"collected via website"`

### Facebook Ads

In Facebook Ads Manager, set the Website URL to:

```
https://motocraft-form.vercel.app/?utm_campaign={{campaign.name}}
```

Facebook replaces `{{campaign.name}}` with the actual campaign name dynamically. Spaces and special characters are auto-decoded before storing in the database.

**Examples of what gets stored:**

| URL                                    | Stored in DB             |
| -------------------------------------- | ------------------------ |
| `?campaign=fb_spring_2026`             | `fb_spring_2026`         |
| `?utm_campaign=Spring Sale 2026`       | `Spring Sale 2026`       |
| `?utm_campaign=FB%20-%20Service%20Ads` | `FB - Service Ads`       |
| _(no param)_                          | `collected via website`  |

### Google Ads

Same approach — use the `utm_campaign` parameter:

```
https://motocraft-form.vercel.app/?utm_campaign={campaignid}
```

Google's `{campaignid}` dynamic parameter inserts the numeric campaign ID, or you can use a custom param with the campaign name.

### Other Sources

Use the `campaign` param for any manual links, QR codes, email newsletters, etc.:

```
https://motocraft-form.vercel.app/?campaign=qr_code_bengaluru
https://motocraft-form.vercel.app/?campaign=email_newsletter_march
```

### Verify in Android App

After a lead comes in via a tracked link, open the Android app → the lead's detail screen shows the `campaignName` field. You can filter leads by campaign in the dashboard.

---

## Resume Upload Flow

1. Fill form + select resume (PDF, max 2 MB) → submit
2. A presigned S3 upload URL is fetched and the file is uploaded directly
3. The database is updated with the file reference
4. Resume appears in the Android app's in-app PDF viewer

---

## Privacy

Only the `campaign` / `utm_campaign` URL parameter is used — no cookies, no localStorage, no tracking pixels. Full disclosure in the [Privacy Policy](/privacy).

---

## Environment Variables

| Variable          | Description                       |
| ----------------- | --------------------------------- |
| `WEBSITE_API_KEY` | Shared secret for API auth        |
| `DATABASE_URL`    | PostgreSQL connection string      |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET_NAME` | S3 for resume storage |

---

## Development

```bash
npm install
npm run dev
```

Opens at `http://localhost:3000`. Add `?campaign=test` or `?utm_campaign=test` to test tracking.
