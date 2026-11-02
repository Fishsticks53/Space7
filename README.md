# Space7

A topic-based discussion app. Each **Space** is one topic with a single continuous message thread, and messages can receive **Appreciations**.

Built with bare React Native (CLI, TypeScript). The API is [space7-backend](https://github.com/Fishsticks53/space7-backend).

> Work in progress: this repo replaces an earlier Expo prototype and is being built in stages.

## Development

Requires Node 22.11+, and the [React Native environment setup](https://reactnative.dev/docs/set-up-your-environment) for Android and/or iOS.

```sh
npm install
npm start          # Metro
npm run android    # or: npm run ios (after `bundle install && cd ios && bundle exec pod install`)
```

## Checks

```sh
npm run lint
npm run typecheck
npm test
```

CI runs these plus an Android debug build on every pull request.
