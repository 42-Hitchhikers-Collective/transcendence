# Phaser Race Conditions — Diagnosis & Fixes

Documenting every console error thrown by the Phaser game canvas during navigation, why each one occurs, and how it was resolved.

---

## The Problem: Navigating Away From the Game

When a player leaves the game page (back to profile, to a lobby, etc.), React unmounts the `<PhaserGame>` component, which calls `game.destroy(true)`. Phaser begins tearing down:

1. `sys.game` → set to `null`
2. `scene.add` (GameObjectFactory) → null
3. `scene.tweens` (TweenManager) → null
4. `scene.input` (InputPlugin) → null
5. `displayList` → null

But during this teardown, events can still fire because they were **already queued** in the JavaScript event loop before the destroy began:

| Event source | Why it fires during teardown |
|-------------|------------------------------|
| **Socket.IO messages** (`room_state`, `show_colors`, `uno`) | WebSocket messages arrive asynchronously and are dispatched via EventBus |
| **Phaser input events** (`drag`, `drop`, `dragend`) | Mouse events queued in the game loop before the destroy started are processed during the current frame |
| **Global EventBus** | `Phaser.Events.EventEmitter` is a singleton — it survives scene destruction |

---

## Error #1 — `cardsToDraw.toString()` crashes

```
TypeError: can't access property "toString", numberOfCards is undefined
    renderText RenderManager.ts:106
    render RenderManager.ts:48
    onRoomState GameScene.ts:110
```

**Why:** The server sends `room_state` with `cardsToDraw` set to `undefined` when no penalty cards are pending. `renderText()` called `.toString()` on it without checking.

**Fix:** Added early return in `renderText()`:
```ts
private renderText(numberOfCards: number | undefined) {
    this.pendingDrawText?.destroy();
    if (!numberOfCards) return; // bail if undefined or 0
    // ... render text
}
```

**File:** `managers/RenderManager.ts`

---

## Error #2 — `displayList is null` during `render()`

```
TypeError: can't access property "add", this.displayList is null
    renderDrawPile RenderManager.ts:132
    render RenderManager.ts:48
    onRoomState GameScene.ts:110
```

**Why:** A `room_state` socket event arrived after navigation began. The scene's `displayList` was already destroyed, but `render()` tried to call `this.scene.add.image()` anyway.

**Fix:** Added scene-alive guard at the top of `render()`:
```ts
render(room: FrontendRoom) {
    if (!this.scene || !(this.scene as any).sys?.game) return;
    // ... rest of render
}
```

`sys.game` is the root Phaser `Game` instance — it's the first thing Phaser nulls during destruction, so checking it before any `scene.add.*` call prevents all cascading crashes.

**File:** `managers/RenderManager.ts`

---

## Error #3 — `scene.add` is null in `showWildColorButtons()`

```
TypeError: Cannot read properties of null (reading 'add')
    UIManager.showWildColorButtons UIManager.ts:17
    GameScene.selectColor GameScene.ts:116
```

**Why:** Socket event `show_colors` fired after scene destruction. `UIManager.showWildColorButtons()` tried to call `this.scene.add.container()` on a destroyed factory.

**Fix:** Added `isSceneAlive()` guard to both `showWildColorButtons()` and `showPassTurnButtons()`:
```ts
private isSceneAlive(): boolean {
    return !!(this.scene && (this.scene as any).sys?.game);
}

showWildColorButtons() {
    if (!this.isSceneAlive()) return;
    // ... create UI
}
```

**File:** `managers/UIManager.ts`

---

## Error #4 — `scene.add` is null in `uno()` / `error()`

```
TypeError: Cannot read properties of null (reading 'add')
    Announcement.uno Announcemente.ts
    GameScene.uno_announcemente GameScene.ts
```

**Why:** Same pattern — socket event `uno` or `error` fired during teardown, `Announcement` methods accessed `this.scene.add` which was already null.

**Fix:** Added `isSceneAlive()` guard to `uno()` and `error()`:
```ts
uno() {
    if (!this.isSceneAlive()) return;
    // ... create announcement sprite
}
```

**File:** `managers/Announcemente.ts`

---

## Error #5 — `this.add.text()` is null in `showNotTurn()`

```
TypeError: Cannot read properties of null (reading 'add')
    GameScene.showNotTurn GameScene.ts:131
    InputManager.onDrop InputManager.ts:44
```

**Why:** This one is triggered by **Phaser input events**, not socket events. During teardown, a queued `drop` event calls `InputManager.onDrop()` → `EventBus.emit("not_turn")` → `GameScene.showNotTurn()` → `this.add.text()`. The scene's `add` factory is already null.

**Fix:** Added guard directly in the scene method:
```ts
private showNotTurn() {
    if (!(this as any).sys?.game) return;
    // ... create "It's not your turn" text
}
```

**File:** `scenes/GameScene.ts`

---

## Error #6 — `scene.tweens.add()` is null in InputManager

```
TypeError: Cannot read properties of null (reading 'add')
    InputManager.resetCard InputManager.ts
```

**Why:** Phaser drag/drop events fire during teardown. `onDrop()`, `onDrag()`, `onDragEnd()` all call `resetCard()` which does `this.scene.tweens.add()`. The tween manager is already destroyed.

**Fix:** Added `isSceneAlive()` guard to all three input handlers:
```ts
private onDrag(...) {
    if (!this.isSceneAlive()) return;
    // ...
}
private onDrop(...) {
    if (!this.isSceneAlive()) return;
    // ...
}
private onDragEnd(...) {
    if (!this.isSceneAlive()) return;
    // ...
}
```

**File:** `managers/InputManager.ts`

---

## Error #7 — AudioContext crashes

```
InvalidStateError: Cannot suspend a closed AudioContext
    Phaser audio manager
```

**Why:** Phaser's sound manager tries to suspend/resume the AudioContext when the browser tab visibility changes. During navigation, the context gets closed, then the visibility change handler tries to resume it.

**Fix:** Disabled audio entirely since the game doesn't use any sounds:
```ts
const config = {
    // ...
    audio: {
        noAudio: true, // prevents AudioContext suspend/resume errors
    },
};
```

**File:** `PhaserGame.tsx`

---

## Error #8 — `erasableSyntaxOnly` TypeScript errors

```
This syntax is not allowed when 'erasableSyntaxOnly' is enabled.
```

### What was the original code?

The original code used TypeScript's **parameter properties** — a convenience syntax that declares AND assigns a class field in one line:

```ts
// Original — 1 line, does 3 things
constructor(private scene: Phaser.Scene) {}
//         ^^^^^^^   ^^^^^
//         1. declares private class field "scene"
//         2. sets type to Phaser.Scene
//         3. auto-assigns: this.scene = scene
```

This is perfectly valid, widely-used TypeScript. It saves boilerplate — instead of:

```ts
private scene: Phaser.Scene;          // declare field
constructor(scene: Phaser.Scene) {    // receive param
    this.scene = scene;               // assign
}
```

You write one clean line. Your teammate did NOTHING wrong here. This is standard TypeScript that works in 99% of projects.

### Why does it fail in THIS project?

Your `tsconfig.json` has a setting called `erasableSyntaxOnly`. Here's what it means:

**TypeScript has two kinds of syntax:**

| Kind | Example | What happens at compile time |
|------|---------|------------------------------|
| **Erasable** (type-only) | `: string`, `as User`, `interface Foo` | Just removed — produces zero JavaScript code |
| **Non-erasable** (emits code) | `private x` in constructor, `enum`, `namespace` | Generates actual JavaScript output |

`erasableSyntaxOnly: true` says: _"Only allow type annotations that can be erased. If the syntax would produce runtime JavaScript code, reject it."_

`constructor(private scene: Phaser.Scene)` generates `this.scene = scene` at runtime — so it's rejected.

### Why would anyone enable this?

Because it forces the project to be compatible with tools that **strip types without understanding TypeScript**. If you use a pure type-stripper (like `esbuild` in transpile-only mode, or Node.js `--experimental-strip-types`), it literally just deletes anything between `: Type` and the next `,` or `)`. It doesn't know what `private` means, so it would produce broken JavaScript:

```js
// Input:  constructor(private scene: Phaser.Scene) {}
// esbuild erasable-only output:
//         constructor(scene) {}    ← "private" was erased but "scene" stayed as a plain param
//                                     this.scene was NEVER ASSIGNED → undefined at runtime!
```

### The fix

Instead of the shorthand, we write it out explicitly:

```ts
// Before: 1 line, but generates runtime code (erasableSyntaxOnly rejects it)
constructor(private scene: Phaser.Scene) {}

// After: 3 lines, but each line is pure JS — no TypeScript magic
private scene: Phaser.Scene;          // ← type annotation ONLY, erases cleanly
constructor(scene: Phaser.Scene) {    // ← plain JS constructor with type annotation
    this.scene = scene;               // ← plain JS assignment
}
```

The `private scene: Phaser.Scene;` line is pure type annotation — when erased, the `private` keyword becomes a JavaScript `#scene` private field or just vanishes depending on your target. The `this.scene = scene` in the body is plain JavaScript that survives erasure.

### Files affected

All 5 managers had this pattern. Each was fixed the same way:

| File | Change |
|------|--------|
| `RenderManager.ts` | `private scene` → class field |
| `UIManager.ts` | `private scene` → class field |
| `Announcemente.ts` | `private scene` → class field |
| `BoardManager.ts` | `private scene` → class field |
| `InputManager.ts` | `private scene` → class field |

### TL;DR for your teammate

- The original code was **correct and idiomatic TypeScript** — not a mistake
- The `erasableSyntaxOnly` setting in `tsconfig.json` deliberately blocks this specific syntax
- This setting exists so the project can be compiled by tools that only strip types (like esbuild in our Vite setup)
- The fix is writing the assignment out explicitly in the constructor body — functionally identical, just more verbose

---

## Summary: The Guard Pattern

Every method that can be called asynchronously (via socket events or Phaser input events) after navigation now starts with:

```ts
// Check: has Phaser already started destroying this scene?
if (!this.scene || !(this.scene as any).sys?.game) return;
```

Or using the shared helper:
```ts
private isSceneAlive(): boolean {
    return !!(this.scene && (this.scene as any).sys?.game);
}
```

`sys.game` is the first thing Phaser nulls during destruction — it's the earliest possible signal that the scene is being torn down, so it prevents every downstream crash.

| File | Methods Guarded | Total |
|------|----------------|:----:|
| `RenderManager.ts` | `render()` | 1 |
| `UIManager.ts` | `showWildColorButtons()`, `showPassTurnButtons()` | 2 |
| `Announcemente.ts` | `uno()`, `error()` | 2 |
| `GameScene.ts` | `showNotTurn()` | 1 |
| `InputManager.ts` | `onDrag()`, `onDrop()`, `onDragEnd()` | 3 |

**9 methods across 5 files** — all now safely bail out instead of crashing when the player navigates away from the game.
