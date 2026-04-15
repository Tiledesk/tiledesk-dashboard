## Goal

Refactor `knowledge-bases2` to decouple UI from business logic **without modifying** anything under `src/app/knowledge-bases/` to keep rollback immediate.

## Constraints

- **Do not edit** any file in `src/app/knowledge-bases/`.
- New code must live in `src/app/knowledge-bases2/` (or other non-`knowledge-bases` shared areas only if strictly necessary).
- Keep changes incremental and behavior-preserving at each step.

## Current pain points (summary)

- Page component is a “god component” (~4k LOC): routing, dialogs, permissions, storage, API calls, UI flags.
- Subscriptions are inconsistent (some lack `takeUntil`), making behavior timing/leaks harder to reason about.
- Feature is still partially coupled to `knowledge-bases` via imports of modals/menu (needs cloning into `knowledge-bases2` to fully decouple).

## Step-by-step refactor plan (rollback-safe)

### Step 0 — Baseline safety

- Add `REFRACTOR_STEPS.md` (this file) to track changes.
- Ensure `app.routing.ts` routes point to `KnowledgeBases2Module` (already done).

### Step 1 — Introduce a Facade (no template changes yet)

- Add `facade/knowledge-bases2.facade.ts` to own:
  - page init orchestration
  - selected namespace state
  - loading/error state
- Keep the component calling facade methods, but keep existing fields working.

### Step 2 — Centralize permissions

- Add `services/kb-permissions.service.ts`:
  - Convert `{ role, matchedPermissions } -> typed permissions flags`
  - Remove permission branching logic from the component over time.

### Step 3 — Subscription hygiene

- Replace naked `.subscribe()` in `knowledge-bases2.component.ts` with:
  - `takeUntil(this.unsubscribe$)` (current pattern), or
  - `async pipe` once the facade exposes streams
- First target: `auth.project_bs`, `route.params`, `translate.get(...)` chains.

### Step 4 — Clone UI dependencies from `knowledge-bases` into `knowledge-bases2`

Goal: stop importing from `../knowledge-bases/...`.

- Copy `menu/` and `modals/` folders into `knowledge-bases2/` (same structure).
- Update imports in:
  - `knowledge-bases2/knowledge-bases.module.ts`
  - `knowledge-bases2/knowledge-bases.component.ts`
  to use local `./modals/...` and `./menu/...`.

### Step 5 — Split into presentational components

Extract child components (in `knowledge-bases2/components/`), with `@Input/@Output`:

- Namespace selector
- KB table wrapper
- Unanswered questions panel
- Chatbot actions panel

### Step 6 — Cleanups and typing

- Replace `any` with feature-level interfaces (`Namespace`, `KbItem`, `Quota`, `PermissionsState`).
- Replace scattered boolean flags with a small UI state model.

## Done criteria

- `knowledge-bases2` builds and runs **without importing** anything from `knowledge-bases`.
- Page logic is testable via facade/services.
- Component file size reduced substantially (target < 600 LOC).

## Progress (updated)

- **Step 5**: done
  - Done: namespace sidebar (`KbNamespaceSidebarComponent`)
  - Done: selected namespace header (`KbSelectedNamespaceHeaderComponent`)
  - Done: header actions + tab switcher (`KbHeaderActionsComponent`)
  - Done: contents tab wrapper (`KbContentsTabComponent`)
  - Done: unanswered tab wrapper (`KbUnansweredTabComponent`)
  - Done: chatbot actions panel (`KbChatbotActionsPanelComponent`)
- **Step 6**: done
  - Added `models/kb-types.ts` + `models/kb-ui-state.ts`
  - Typed new presentational components (removed `any` from their public API)
  - Introduced `ui` state object in `KnowledgeBases2Component` with compatibility getters

