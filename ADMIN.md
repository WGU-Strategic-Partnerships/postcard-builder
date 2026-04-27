# Admin Guide — WGU Postcard Builder

Operational workflows for the people who run this thing. For architecture and code structure, see `README.md`.

## URLs

| Purpose | URL |
|---|---|
| **Builder** (public, embedded in SharePoint) | https://postcard-builder.vercel.app/ |
| **Admin** (sign-in required) | https://postcard-builder.vercel.app/admin.html |
| **Supabase dashboard** (Bentley only) | https://supabase.com/dashboard/project/zkvotdzwccztdmwagtjs |
| **GitHub repo** | https://github.com/bentley-wgu/postcard-builder |

## How content flows

```
[Supabase database]  ←─ admin.html writes  ←─ Design team
        │
        └─ Postcard Builder reads ─→ [Public users]
```

The postcard builder loads facts/stats/quotes/CTAs from Supabase at page load.
The admin page edits the same data. Changes are live for builder users within seconds — no code deploy required.

## Adding a new admin

1. **Create their user in Supabase**
   - Open the [Supabase dashboard](https://supabase.com/dashboard/project/zkvotdzwccztdmwagtjs) → **Authentication → Users**
   - Click **Add user → Create new user**
   - Enter their work email
   - Generate a strong temporary password (use 1Password)
   - Toggle **Auto Confirm User** to **ON**
   - Click **Create user**

2. **Send them their credentials securely** — 1Password share, Slack DM, or whatever your team uses for sensitive handoffs. Don't put a plain password in regular email.

3. **Send them this onboarding message:**

   > Library admin sign-in: open https://postcard-builder.vercel.app/admin.html, choose the **Password** tab, enter your email and the temp password I sent. After you sign in, click **Change password** in the top-right and set your own.

4. They take it from there.

## Forgotten password

The current setup doesn't have self-service password reset because reset links go through email, which gets blocked or pre-scanned by corporate security.

When someone is locked out:

1. Go to **Supabase → Authentication → Users**
2. Find their row, click the **⋯** menu
3. If you see **Update user** or **Set password** — set a new temp password directly
4. If only **Send password recovery** is available and their email is the corporate-scanner kind, the reset link will likely be consumed before they click it. Easiest fallback:
   - Delete their user (⋯ → Delete user)
   - Recreate them via **Create new user** with a fresh temp password
   - Hand them the new password securely
   - They sign in and rotate it via Change password

## Removing an admin

**Supabase → Authentication → Users →** click their row → **⋯ → Delete user.** Their session is invalidated; they'll be signed out within ~60 seconds.

## What admins can edit

| Section | What it controls | Pick limit on builder |
|---|---|---|
| **Facts** | Numbered fast-fact lines on back of card | Pick 5 |
| **Stats** | Big-number stats in lime band on back | Pick 3 |
| **Quotes** | Pull-quote testimonial above back CTA | Pick 1 (or write custom in the builder) |
| **Front CTAs** | Action line on front, above URL | Pick 1 |
| **Back CTAs** | Two-line action in navy bar at back bottom | Pick 1 |

Each section has a help tip in the admin UI explaining design intent and length constraints.

## What admins **cannot** edit (locked for brand)

- Logo, headline ("Talent. On Demand."), color palette, swirl pattern
- Layout / element positions
- The "Why partner with WGU." back-side title

These are locked in the code for brand consistency. Changing them requires a developer (open a PR against the GitHub repo).

## Stable IDs

Every library item has an `external_id` (`f1`, `s2`, `q5`, `fc1`, `bc3`, etc.). These IDs are baked into share-link URLs from the builder — when someone shares `…?s=ENCODED`, the encoded state references items by their `external_id`. **Don't manually edit external_ids in Supabase.** Editing the *content* of an item is fine; deleting an item that's referenced by an existing share link will silently drop that selection from the link's recipients.

## Deployment

- Pushing to `main` on GitHub auto-deploys to Vercel within ~1 minute.
- The Vercel deployment is at `postcard-builder.vercel.app` (Hobby tier, free).
- To map a custom domain (e.g., `postcard.partners.wgu.edu`), use Vercel's **Domains** settings — requires DNS access for whoever owns that subdomain.

## When the team scales beyond ~10 admins

The current password-based setup is fine for small teams. If it starts to feel like overhead, two upgrade paths in increasing order of effort:

1. **Custom SMTP** (Resend or Postmark, ~30 min) — emails come from a domain you control, much less likely to be pre-scanned. Magic-link auth becomes reliable; admins can self-service their own resets.
2. **Microsoft 365 OAuth** (requires IT cooperation to register an Azure AD app) — admins sign in with existing WGU credentials. No passwords to manage. The right enterprise answer.

Both can be added without disrupting existing admins.

## Common questions

**Q: An edit didn't show up in the builder.**
A: Hard-refresh the builder tab (Cmd+Shift+R / Ctrl+Shift+R). Also check the admin shows a green "Saved" pill confirming the write actually went through.

**Q: I see "Couldn't load library content" in the builder.**
A: Supabase is unreachable. Check the project status at the dashboard. Most outages are short.

**Q: Can I undo a delete?**
A: Not from the UI. Supabase keeps point-in-time backups on paid plans. On the free tier, deletes are permanent. Practical advice: deleting items that are still in use will silently drop them from existing share-links.

**Q: How do I see who edited what?**
A: Supabase tracks `created_at` and `updated_at` per row but not "who" (the admin app uses RLS that lets all authenticated users edit everything). For multi-admin audit logging, we'd need to add a `last_modified_by` column and a small change. Not in scope today.
