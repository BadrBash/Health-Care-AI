# PulseTrack release preparation

This branch prepares the Expo build configuration. It does not mean the app
has passed release testing or that a binary has been built.

## Current distribution target

- Android: installable APK shared directly with users.
- iOS: deferred. Revisit an iOS/TestFlight or App Store build separately.
- Expo project: initialize with EAS before the first cloud build.
- App identifiers currently in app.json: com.pulsetrack.app (Android and iOS).
  Do not change these after distribution without planning an app migration.

## 1. Configure Supabase

The app reads these variables from src/lib/supabaseClient.ts:

- EXPO_PUBLIC_SUPABASE_URL
- EXPO_PUBLIC_SUPABASE_ANON_KEY

For local development, copy .env.example to .env.local and fill in the
Supabase Project URL and anon/publishable key from the Supabase dashboard.

For EAS, add both variables to the Expo project's production environment.
They are client-visible values because EXPO_PUBLIC_ variables are embedded
in the application bundle. Never add a Supabase service_role key, database
password, or other privileged secret to the app or EAS public variables.

The repository contains migrations that enable owner-scoped RLS for
heart_rate_logs, step_logs, water_logs, and daily_goals. Apply the migrations
to the intended Supabase project and verify the policies in the Supabase
dashboard. A migration file in Git does not prove that it has been applied
to the live project.

## 2. Initialize EAS

From the repository root:

```bash
npm ci
npx expo-doctor
npx eas-cli@latest login
npx eas-cli@latest init
```

During initialization, link the existing Expo project or create one. EAS
will write the real project ID into app.json. Do not invent or leave an empty
project ID for a build.

## 3. Build an installable Android APK

After configuring the production Supabase variables in the linked EAS
project:

```bash
npx eas-cli@latest build --platform android --profile public-apk
```

The build profile explicitly requests an APK. The separate `production`
profile is reserved for a future store-oriented Android App Bundle build.

Install the APK on multiple physical Android devices before sharing it.
Keep the Android signing credentials backed up in the Expo account and do
not reset them between releases, or users may be unable to update the app
without uninstalling it.

## 4. Required release gates

- [ ] Confirm the Supabase URL and anon/publishable key belong to the intended project.
- [ ] Confirm all migrations in supabase/migrations have been applied to that project.
- [ ] Verify RLS is enabled on every table used by the app.
- [ ] Test with two separate user accounts: each account must see, update, and delete only its own records.
- [ ] Test signed-out access; private health records must not be readable or writable.
- [ ] Test sign-up, sign-in, sign-out, password reset, and session persistence on a physical device.
- [ ] Test the production build with network loss, slow network, empty data, and Supabase errors.
- [ ] Add a public privacy policy explaining health data collection, use, storage, sharing, retention, and account/data deletion.
- [ ] Provide a user-facing account/data deletion process before public release.
- [ ] Verify app icon, splash screen, app name, version, and Android permissions.
- [ ] Verify all health measurements and calculations are clearly described as wellness information, not medical diagnosis or emergency monitoring.
- [ ] Complete the native health integration work described below, or clearly disclose that those metrics are manually entered.

## 5. Health data integration status

The current app has manual logging flows for heart rate, steps, and water intake.
The current dependency list does not include a native Apple Health or Android
Health Connect integration package. The Apple Health usage-description strings
in app.json are permission explanations only; they do not implement data
reading or writing.

The requested target is both manual entry and automatic import. Treat automatic
health import as a separate implementation milestone:
- Android: evaluate Health Connect support and its permission/data-type requirements.
- iOS: evaluate HealthKit support and its entitlements and permission flows.
- Use a development build with native modules; Expo Go alone is not sufficient
  for arbitrary custom native health modules.
- Ask for explicit consent, explain each requested data type, handle revoked
  permissions, and never assume missing readings mean zero.
- Do not claim automatic tracking until it has been implemented and tested on
  real Android and iOS devices.

## 6. Public APK distribution

After a successful build and device testing, publish the APK as a versioned
GitHub Release or through a download page. Include the version, release date,
supported Android version range, file size, and SHA-256 checksum. Explain that
Android may ask users to allow installation from the browser or file manager.
Keep a stable download page so users can find later updates.

## Important

Do not publish a public build while the Supabase project configuration, RLS
verification, privacy policy, account deletion, and device testing are still
incomplete. This checklist is intentionally conservative because the app
handles personal health-related data.
