# StudySync frontend

React Native (CLI) + TypeScript client for the **Rust** API in `E:\Desktop\studysync-backend-rs`.

This is a **separate Git repository**. It is not a monorepo with the backend. Do not copy this tree into `studysync-app` or the Flask backend.

Visual identity: warm canvas (`#F6F2EB`), espresso text, forest-green actions (`#365A46`), caramel as a small brand accent. Tokens live in `src/theme/tokens.ts`. Do not scatter hex values in screens.

## Git

Local `main` only. Do not add a GitHub remote or push until that is an explicit later task.

Confirmed repository root: `E:\Desktop\studysync-frontend`.

## API contract (source of truth: Rust backend)

- Origin: `SERVER_HOST`/`SERVER_PORT`, default `0.0.0.0:8080`
- Prefix: `/api/v1`
- JSON field names: **camelCase**
- Errors: `{"error":{"code":"...","message":"..."}}`
- Auth: `Authorization: Bearer <accessToken>`
- Access JWT TTL: 15 minutes
- Refresh: `POST /api/v1/auth/refresh` with `{ "refreshToken": "..." }` **rotates** the refresh token (old session revoked)
- Logout: `POST /api/v1/auth/logout` with the refresh token, HTTP **204**
- Profile: `GET /api/v1/me`
- Groups: `GET /api/v1/groups/mine`

## Configure the API URL

Set `apiBaseUrlOverride` in `src/config/overrides.ts` when the defaults are wrong (physical devices). Leave it `null` for emulator/simulator defaults.

| Runtime | Base URL |
| --- | --- |
| Android emulator | `http://10.0.2.2:8080` |
| iOS simulator | `http://127.0.0.1:8080` |
| Physical device | `http://<LAN-IP>:8080` (phone and PC on the same Wi-Fi; Windows firewall must allow 8080) |

**Do not use `localhost` from an Android emulator.** It refers to the emulator itself, not the host running the Rust API.

The app talks HTTP in development. Debug Android allows cleartext; iOS allows local networking. Production HTTPS is a later concern.

Never commit JWT secrets, production URLs with credentials, or refresh tokens.

## Run

1. Start Postgres + the Rust API from `studysync-backend-rs` (`cargo run`, port 8080).
2. `npm start` in this repo.
3. `npm run android` when an emulator/SDK is installed.

Windows cannot build iOS here (no Xcode).

## Checks

```powershell
npm run typecheck
npm run lint
npx prettier --check "src/**/*.{ts,tsx}" "__tests__/**/*.{ts,tsx}"
npm test
```

## Architecture

```
src/config     API origin (no URLs in screens)
src/api        typed DTOs, fetch client, error mapping
src/auth       Keychain refresh store, in-memory access token, session
src/theme      color, type, space, radius, motion tokens
src/screens    Login, Register, Home (profile + groups)
src/navigation splash / signed-out / signed-in
src/components buttons, fields, chips, avatars, group rows
```

Refresh credentials use **react-native-keychain** (Keystore/Keychain). Access tokens stay in process memory. They are not written to AsyncStorage.

Concurrent `token_expired` retries share one in-flight `POST /auth/refresh` on `SessionController`.

## Phase 8A scope

Implemented: register, login, session restore, `/me`, `/groups/mine`, logout.

Not in this phase: DMs, group chat WebSockets, media, matching, notifications, account deletion.

## Middleware / extra services

None. Auth, authorization, and rate limits stay in the Rust API. A future reverse proxy or BFF should only be added if a concrete deployment requirement appears (for example TLS termination or a web client). Do not add a third repository yet.

## Android package path

The CLI created `com/com.studysync.app` from `--package-name com.studysync.app`. Sources were moved to `android/app/src/main/java/com/studysync/app/` to match `package com.studysync.app`.
