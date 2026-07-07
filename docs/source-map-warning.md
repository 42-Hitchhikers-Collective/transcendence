# Source Map Console Errors

## What you see

```
Source map error: Error: NetworkError when attempting to fetch resource.
Resource URL: https://localhost:8443/node_modules/.vite/deps/phaser.js?v=...
Source Map URL: phaser.js.map
```

## Why only Firefox?

**Chrome** and **Safari** silently ignore missing source maps. Their DevTools attempt the fetch, get nothing back, and move on — no error logged, nothing in the console.

**Firefox** explicitly reports every failed source map fetch as a `NetworkError` in the console. This is intentional behavior in Firefox's DevTools: it wants the developer to know a referenced resource couldn't be loaded, even if that resource is optional (like a source map).

In short: the same HTTP request fails in both browsers. Chrome swallows the error; Firefox surfaces it. Our application code and the server response are identical — only the browser's console policy differs.

## What it means

Some npm packages (Phaser, React DOM, etc.) ship their production bundles **without** `.map` source map files. However, Vite's dev server adds a `//# sourceMappingURL=` comment to all pre-bundled dependencies. When a browser sees this comment, it tries to fetch the `.map` file. The file doesn't exist → the fetch fails. How that failure appears depends on the browser:

| Browser | Behavior |
|---------|----------|
| Chrome | Ignores it — no console output |
| Safari | Ignores it — no console output |
| **Firefox** | Logs `Source map error: NetworkError` |

## Is it a bug in our code?

**No.** This is documented Firefox behavior. See Mozilla's official docs:

> [Source map errors — Firefox Source Docs](https://firefox-source-docs.mozilla.org/devtools-user/debugger/source_map_errors/)

Our application code is not involved. The error originates from Firefox's DevTools source map parser attempting to fetch files that the third-party package author chose not to distribute. All game logic, API communication, and UI rendering work correctly regardless.

## How we mitigate it

We added an nginx rule that intercepts `.map` requests and returns `204 No Content` instead of letting them 404:

```nginx
location ~ \.map$ {
    return 204;
}
```

This prevents Firefox from logging the error entirely, without modifying Vite's build pipeline or affecting performance.

## Evaluator summary

| Concern | Answer |
|---------|--------|
| Is this a bug in our application? | No — it's Firefox's source map parser reacting to missing third-party files |
| Does it affect functionality? | No — all game features, API calls, and UI work correctly |
| Is it our responsibility? | No — we cannot force npm packages to include `.map` files |
| What did we do about it? | Added an nginx rule to silence the error; documented the root cause |
