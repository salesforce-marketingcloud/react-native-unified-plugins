# `shouldShowMessage` — Decision Flow

> Contributor reference. Every possible outcome of the native `shouldShow` gate, mapped through diagrams. Customer docs live in [`../README.md`](../README.md).

---

## The core problem, in one picture

```
   Native SDK gate                         JS decision handler
   ─────────────                            ────────────────────
   shouldShowMessage(msg) → Bool            async (msg) => bool
   returns SYNCHRONOUSLY                    resolves ASYNCHRONOUSLY
   on the SDK worker thread                 on the JS thread
                    ▲                                 ▲
                    └────── incompatible ─────────────┘
                    (the gate cannot await the bridge)
```

**Solution:** *defer-then-reshow.* Return `false` now, ask JS, and if JS approves, call `showMessage(id)` — which re-fires the gate — and let that second pass return `true`.

---

## Master decision flow

Every call to `shouldShowMessage(msg)` runs this exact tree:

```
                           SDK fires shouldShowMessage(msg)
                                        │
                                        ▼
                          ┌──────────────────────────┐
                          │ decisionEnabled == true? │
                          └──────────────┬───────────┘
                                         │
                       ┌─────────────────┴─────────────────┐
                       │ NO                                │ YES
                       │ (no JS decision handler)          │ (JS handler registered)
                       ▼                                   ▼
             ┌──────────────────┐               ┌──────────────────────────┐
             │ hop → emit       │               │ approvedIds.remove(id)?  │
             │   will_show      │               └────────────┬─────────────┘
             │ return TRUE      │                            │
             └──────────────────┘              ┌─────────────┴─────────────┐
                       │                       │ YES                       │ NO
                       │                       │ (this is the re-show pass)│ (first pass)
                       ▼                       ▼                           ▼
                    ┏━━━━━━━━┓        ┌──────────────────┐    ┌─────────────────────────┐
                    ┃ Case A ┃        │ (no emit)        │    │ hop → emit will_show    │
                    ┃ SHOWN  ┃        │ return TRUE      │    │ hop → emit decision_req │
                    ┗━━━━━━━━┛        └────────┬─────────┘    │ return FALSE            │
                                               │              └────────────┬────────────┘
                                               ▼                           │
                                            ┏━━━━━━━━┓                     ▼
                                            ┃ Case B ┃          ┌────────────────────┐
                                            ┃ SHOWN  ┃          │ SDK suppresses     │
                                            ┗━━━━━━━━┛          │ (this pass)        │
                                                                └─────────┬──────────┘
                                                                          │
                                                                          ▼
                                                              ┌────────────────────┐
                                                              │ JS runs handler(msg)│
                                                              └─────────┬──────────┘
                                                                        │
                                                            ┌───────────┴────────────┐
                                                            │ handler resolves...    │
                                                            └───────────┬────────────┘
                                                                        │
                                              ┌────────┬────────────────┴────────────┬────────────┐
                                              │ true   │ false                       │ throws     │
                                              ▼        ▼                             ▼            │
                                       (reply true) (reply false)          (log + reply false)    │
                                              │        │                             │            │
                                              ▼        ▼                             ▼            │
                                    ┌──────────────┐  ┏━━━━━━━━━━━━┓         ┏━━━━━━━━━━━━━━━━━┓  │
                                    │ approvedIds  │  ┃  Case D    ┃         ┃    Case E       ┃  │
                                    │  .add(id)    │  ┃ SUPPRESSED ┃         ┃ SUPPRESSED      ┃  │
                                    │ showMessage()│  ┃  (denied)  ┃         ┃  (fail-closed)  ┃  │
                                    └──────┬───────┘  ┗━━━━━━━━━━━━┛         ┗━━━━━━━━━━━━━━━━━┛  │
                                           │                                                      │
                                           ▼                                                      │
                                 (loops back to top of tree ─────────────────────────────────►────┘
                                  → hits "approvedIds.remove(id)? YES"
                                  → Case B)
                                                            ┏━━━━━━━━━━━━━━┓
                                                            ┃   Case C     ┃
                                                            ┃ APPROVED →   ┃
                                                            ┃ SHOWN via B  ┃
                                                            ┗━━━━━━━━━━━━━━┛
```

Legend: `┏ ┓` = a terminal outcome. `┌ ┐` = an intermediate step.

---

## Five outcomes, each in one diagram

### Case A — No decision handler, default show

The path a stock integration hits every time.

```
JS                       Native module               SDK
│                        │                           │
│                        │      shouldShow(msg)      │
│                        │◄──────────────────────────│
│                        │─ emit will_show ─────►    │
│                        │────────── true ──────────►│
│                        │                           │─ displays ─►
│                        │◄──── didShow(msg) ────────│
│─ did_show ◄────────────│                           │
│                        │                           │
│                        │◄──── didClose(msg,a) ─────│  (later, on dismiss)
│─ did_close ◄───────────│                           │
```

Emissions: **will_show → did_show → did_close.**

---

### Case B — Re-show pass (a message JS just approved)

Runs *after* Case C returned `true`. This pass is short and silent (no `will_show`).

```
JS                       Native module               SDK
│                        │                           │
│                        │      shouldShow(msg)      │
│                        │◄──────────────────────────│
│                        │ approvedIds has msg.id    │
│                        │ → remove it (one-shot)    │
│                        │────────── true ──────────►│
│                        │                           │─ displays ─►
│                        │◄──── didShow(msg) ────────│
│─ did_show ◄────────────│                           │
```

`will_show` intentionally not re-emitted — it already fired on the first pass.

---

### Case C — Decision handler approves → message shown

The full defer-then-reshow. First pass suppresses; second pass is Case B.

```
JS                          Native module              SDK
│                           │                          │
│                           │ ─── FIRST PASS ───       │
│                           │      shouldShow(msg)     │
│                           │◄─────────────────────────│
│                           │ decisionEnabled=true     │
│                           │ approvedIds empty        │
│                           │─ emit will_show ────►    │
│─ will_show ◄──────────────│                          │
│                           │─ emit decision_request ► │
│─ decision_request ◄───────│                          │
│                           │─────── false ───────────►│
│                           │                          │ (suppressed for now)
│                           │                          │
├─ handler(msg) runs ──►    │                          │
│  resolves true            │                          │
│                           │                          │
│─ resolveDecision(id,true)►│                          │
│                           │ approvedIds.add(id)      │
│                           │─ showMessage(id) ───────►│
│                           │                          │
│                           │ ─── SECOND PASS (Case B)─│
│                           │      shouldShow(msg)     │
│                           │◄─────────────────────────│
│                           │ approvedIds.remove(id)   │
│                           │─────── true ────────────►│
│                           │                          │─ displays ─►
│                           │◄──── didShow(msg) ───────│
│─ did_show ◄───────────────│                          │
│                           │                          │
│                           │◄──── didClose(msg,a) ────│
│─ did_close ◄──────────────│                          │
```

Emissions JS sees: **will_show → (internal decision_request) → did_show → did_close.** `will_show` appears once.

---

### Case D — Decision handler denies

```
JS                          Native module              SDK
│                           │                          │
│                           │      shouldShow(msg)     │
│                           │◄─────────────────────────│
│                           │─ emit will_show ────►    │
│─ will_show ◄──────────────│                          │
│                           │─ emit decision_request ► │
│─ decision_request ◄───────│                          │
│                           │─────── false ───────────►│
│                           │                          │ (suppressed permanently)
│                           │                          │
├─ handler(msg) runs ──►    │                          │
│  resolves false           │                          │
│                           │                          │
│─ resolveDecision(id,false)│                          │
│                           │ (early return, no-op)    │
│                           │                          │
│              — nothing further happens —             │
```

Emissions JS sees: **will_show only.** No `did_show`, no `did_close`. That's how you detect "was suppressed" downstream.

---

### Case E — Handler throws or rejects (fail-closed)

Identical wire behavior to Case D, plus a warn log. Suppression is the safe default.

```
JS                          Native module              SDK
│                           │                          │
│                           │      shouldShow(msg)     │
│                           │◄─────────────────────────│
│                           │─ emit will_show ────►    │
│                           │─ emit decision_request ► │
│                           │─────── false ───────────►│
│─ will_show ◄──────────────│                          │
│─ decision_request ◄───────│                          │
├─ handler(msg) throws ⚡    │                          │
│  (console.warn logged)    │                          │
│─ resolveDecision(id,false)│                          │
│                           │ (no-op)                  │
│                           │                          │
```

Message treated as suppressed — same as Case D.

---

## State that drives the tree

Only three variables branch the tree, one per axis. Everything else is derived.

```
┌────────────────────┬────────────────────┬──────────────────────────┐
│ decisionEnabled    │ approvedIds        │ handler resolution       │
├────────────────────┼────────────────────┼──────────────────────────┤
│ false → Case A     │ contains id  → B   │ (only relevant if enabled│
│ true  → next axis  │ empty        → C/D/E│  and approvedIds empty) │
│                    │                    │  true   → C (via B)      │
│                    │                    │  false  → D              │
│                    │                    │  throws → E              │
└────────────────────┴────────────────────┴──────────────────────────┘
```

Storage:

| Var | Android | iOS |
|---|---|---|
| `decisionEnabled` | `@Volatile Boolean` | `BOOL _decisionEnabled` under `NSLock` |
| `approvedIds` | `Collections.synchronizedSet<String>()` | `NSMutableSet<NSString*>` under `NSLock` |
| listener count (event gate) | `AtomicInteger listenerCount` | `atomic_bool _hasListeners` |

The listener-count gate is orthogonal to the decision tree — it silences emissions when JS has no active subscriber, regardless of the case. It never affects `shouldShow`'s return value.

---

## Where each step actually runs

```
   SDK worker thread                Native Modules queue           JS thread
   ─────────────────                ──────────────────────         ─────────
   shouldShowMessage                emit will_show                 emitter listener
   didShowMessage                   emit did_show                  decision handler
   didCloseMessage                  emit did_close                 resolveDecision call
   (reads decisionEnabled           emit decision_request          setDecisionHandlerEnabled call
    and approvedIds)                (build WritableMap /
                                     NSDictionary here)
```

Hop mechanism:

- **Android**: `BridgeQueue.runOnNativeModulesQueue(reactContext) { ... }` — a fire-and-forget helper in `sfmc-core`. Drops the work if the catalyst is torn down.
- **iOS**: `RCTEventEmitter`'s own dispatching. `emitEvent:body:` guards on `atomic_load(&_hasListeners)` before calling `sendEventWithName:`.

Never mutate a `WritableMap` / `NSDictionary` on the SDK worker thread. Always hop first.

---

## Registering, replacing, and clearing the handler

```
┌─────────────────────────────────────────┐   ┌─────────────────────────────────────┐
│ setInAppMessageDecisionHandler(fn)      │   │ setInAppMessageDecisionHandler(null)│
├─────────────────────────────────────────┤   ├─────────────────────────────────────┤
│ 1. _decisionHandler = fn                │   │ 1. NativeModule.setDecision-        │
│ 2. subscribe once to decision_request   │   │      HandlerEnabled(false)          │
│    (idempotent — later swaps            │   │    → decisionEnabled=false          │
│    reuse the same subscription)         │   │    → approvedIds.clear()            │
│ 3. NativeModule.setDecision-            │   │ 2. _decisionSub.remove()            │
│      HandlerEnabled(true)               │   │    _decisionSub = null              │
│    → decisionEnabled=true               │   │ 3. _decisionHandler = null          │
└─────────────────────────────────────────┘   └─────────────────────────────────────┘
```

- Handler swap doesn't touch the subscription — the listener reads `_decisionHandler` fresh each time, so replacing it mid-message is safe.
- Late arrivals after `null` land on Case A (default show) because the tree evaluates `decisionEnabled` first.

---

## Debugging cheatsheet

| Observation | Almost always means |
|---|---|
| No events at all | JS never subscribed via `IamModule.getEmitter().addListener(...)` — listener-count gate is 0. |
| `will_show` fires but message never shows, and no `did_show` | Case D or E. Check your handler's return value / error log. |
| Message appears twice | Something outside the tree called `showMessage(id)` — likely a double `resolveInAppMessageDecision(id, true)`. |
| Handler runs but nothing displays even on `true` | Confirm `resolveInAppMessageDecision` is being called — the `_decisionSub` chain must reach it. Also check `approvedIds.add(id)` and the second `shouldShow` pass. |
| `will_show` fires twice for one message | Bug — Case B is emitting `will_show` when it shouldn't. Both platforms must skip emission on the pre-approved re-show branch. |
| Bridge warnings on shutdown | Expected — `BridgeQueue` and `emitEvent:` both no-op when the catalyst is gone. |

---

## Source map

| File | What lives here |
|---|---|
| `src/IamModule.ts` | JS side: handler storage, `decision_request` subscription, `resolveInAppMessageDecision` fan-out |
| `src/types.ts` | `InAppMessage`, `IamEvent`, `InAppMessageDecisionHandler` |
| `android/.../SFMCIamModule.kt` | `WeakIamListener` + `onShouldShowMessage` decision tree + serialization |
| `ios/SFMCIamModule.mm` | `shouldShowInAppMessage:` decision tree + serialization dispatch |
| `ios/SFMCIamSerializer.swift` | Swift-side `InAppMessageDetails` → `NSDictionary` |
| `sfmc-core/.../BridgeQueue.kt` | Android SDK-thread → Native Modules queue hop |
