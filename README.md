# space7

A topic-based discussion app for Android and iOS. Each **Space** is one topic with a single continuous message thread, and good messages collect **Appreciations**.

Built with bare React Native (CLI, TypeScript) on top of the [space7-backend](https://github.com/Fishsticks53/space7-backend) API (Express, PostgreSQL, Socket.IO).

## Features

- **Accounts:** sign up with email verification (6-digit code), sign in with email or username, reset a forgotten password, sessions kept in the Keychain (iOS) or Keystore (Android).
- **Discover:** trending and recommended spaces, search by title, `#tag` or username.
- **Spaces:** create public or private spaces with up to 10 hashtags; join public spaces in one tap; join private ones with a single-use invite link (`space7://join/...`) or code.
- **Real-time chat:** messages and appreciations arrive live over Socket.IO; image messages; sort by recent or most appreciated; infinite scroll; delete your own messages.
- **Moderation (space creators):** share invite codes, lock or archive a space, remove members, delete any message.
- **Profiles:** stats (spaces, words, appreciations), bio and photo, other users' profiles, change password, delete account.
- **Notifications:** new messages, appreciations, invites used, spaces locked or archived, with an unread badge.

## Tech stack

| Area | Choice |
|---|---|
| App | React Native 0.87 (CLI, New Architecture), TypeScript |
| Navigation | React Navigation 7 (native stack + bottom tabs), deep links |
| Real time | socket.io-client |
| Secure storage | react-native-keychain |
| Media | react-native-image-picker |
| Icons and fonts | @react-native-vector-icons/ionicons, Outfit (bundled) |
| Tests | Jest, React Native Testing Library |
| CI | GitHub Actions: lint, typecheck, tests, Android debug build |

## Project structure

```
src/
  api/          typed client for every backend endpoint, plus response types
  auth/         AuthContext: session restore, sign in, sign out on expired token
  chat/         message list helpers and the message bubble
  components/   shared UI (Button, TextField, SpaceCard, Header, state views...)
  hooks/        useAsync (load, refresh, error) and useRefreshOnFocus
  navigation/   auth stack, tabs, app stack, route types
  screens/      one file per screen
  theme/        colors, fonts, borders
  config.ts     API host for debug and release builds
  socket.ts     shared authenticated Socket.IO connection
__tests__/      unit and screen tests
```

## Getting started

Requires Node 22.11+ and the [React Native environment setup](https://reactnative.dev/docs/set-up-your-environment) for Android and/or iOS.

```sh
npm install
npm start            # Metro bundler
npm run android      # build and run on an emulator or device
# iOS (macOS only):
bundle install && (cd ios && bundle exec pod install)
npm run ios
```

### Backend

Debug builds call a local backend at `http://localhost:5000` (`http://10.0.2.2:5000` from the Android emulator). Release builds call `https://space7backend.onrender.com`. Both are set in [`src/config.ts`](src/config.ts). See the backend repo for running it locally with Docker.

## Checks

```sh
npm run lint
npm run typecheck
npm test
```

## Release builds

Android release builds are signed with your upload key, read from Gradle properties so no secrets live in the repo. Add these to `~/.gradle/gradle.properties` (or set them as `ORG_GRADLE_PROJECT_<NAME>` environment variables in CI):

```properties
SPACE7_UPLOAD_STORE_FILE=/absolute/path/to/upload.keystore
SPACE7_UPLOAD_STORE_PASSWORD=...
SPACE7_UPLOAD_KEY_ALIAS=...
SPACE7_UPLOAD_KEY_PASSWORD=...
```

Then run `cd android && ./gradlew bundleRelease` for a Play Store bundle. Without these properties a release build falls back to the debug key, which is fine for local testing but cannot be uploaded.

For iOS, open `ios/Space7.xcworkspace` in Xcode, set your team under Signing & Capabilities, and archive.

## Credits

The Outfit typeface is used under the [SIL Open Font License](assets/Outfit-OFL.txt).
