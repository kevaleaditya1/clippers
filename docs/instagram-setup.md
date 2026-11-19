# Instagram connection setup

Instagram publishing needs a Business or Creator account and a Meta developer app.
New Meta apps may offer Unified Login instead of the older Instagram Login flow.
Choose the mode that matches the app dashboard; their tokens are not interchangeable.

## Unified Login

Set up the Instagram content-management use case and create a compatible Facebook
Login for Business configuration. Review its assets and permissions, request only
those needed, and register a public HTTPS callback ending in
`/api/social/callback/instagram`.

```dotenv
INSTAGRAM_LOGIN_MODE=unified
INSTAGRAM_APP_ID=
INSTAGRAM_APP_SECRET=
INSTAGRAM_LOGIN_CONFIG_ID=
INSTAGRAM_OAUTH_REDIRECT_BASE_URL=https://app.example.com
SOCIAL_PUBLIC_MEDIA_BASE_URL=https://app.example.com
```

In Unified mode, use the **Meta** app ID and secret. The configuration ID comes
from the compatible configuration in the app dashboard. Keep credentials in local
environment files, and restart the API and worker when they change. The selected
configuration determines the permissions that Meta requests from the account owner.
Connect one Instagram account at a time; additional accounts can be connected
separately. Select the business portfolio that owns the Instagram account.

The Instagram callback override leaves existing YouTube callbacks unchanged.
The browser must be signed into SupoClip on the HTTPS hostname before starting
Instagram authorization, and that origin must be in Better Auth's trusted origins.
Instagram must be able to fetch the token-gated media URL. Localhost is not public.
A stable tunnel hostname remains the same across restarts, but the local PC, app,
and tunnel connector must be running for it to work.

Unified Login uses business integration tokens and `graph.facebook.com`. The app
stores the assigned Instagram account ID, business ID, and configuration ID with
the encrypted token. It uses the assigned Instagram asset ID for publishing, not
the `/me` system-user ID. If a grant expires or is revoked, reconnect the account.

See [Meta's Unified Login setup guide](https://developers.facebook.com/documentation/instagram-platform/instagram-api-with-unified-login/get-started).

## Existing Instagram Login apps

Leave `INSTAGRAM_LOGIN_MODE=instagram` (the default), and use the **Instagram** app
ID and secret. This retains the existing `graph.instagram.com` flow and long-lived
Instagram user tokens. Do not change modes for an existing connection without
reconnecting that account.
