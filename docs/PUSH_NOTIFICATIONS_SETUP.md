# Push notifications (app)

The Rust API owns notification history. This app registers an FCM token after sign-in and opens Alerts destinations when a notification is tapped.

Full backend, credential, and iOS checklist: `E:\Desktop\studysync-backend-rs\docs\PUSH_NOTIFICATIONS_SETUP.md`.

## Without Firebase

The Android debug build must succeed without `android/app/google-services.json`. Alerts still work. Notification settings explain development mode instead of showing a fake enabled state.

Do not commit `google-services.json`, `GoogleService-Info.plist`, or service-account JSON.

## Android live delivery

1. Create a free Firebase project (Spark). Skip Analytics if you want.
2. Register Android package `com.studysync.app`.
3. Place `google-services.json` in `android/app/`.
4. Rebuild the app.
5. Point the Rust API at a local service-account JSON (`PUSH_ENABLED=true`).
6. Sign in, allow notifications, and trigger a friend request or DM.

`google-services.json` is public app config. The service-account key is private server config.

## iOS (untested on Windows)

See the backend setup guide section 10. Do not fabricate Apple Team IDs or entitlements in this repository.
