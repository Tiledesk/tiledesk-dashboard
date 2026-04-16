# Refactor plan — Create new KB (Namespace)

This document defines a rollback-safe refactor plan for the **creation of a new KB**, which in this codebase corresponds to creating a **namespace**.

Reference functional workflow: `docs/workflow-creazione-kb-namespace.md`.

---

## Goals

- Make the "create KB/namespace" flow **modular, testable, and maintainable**.
- Make "create / rename / delete KB" always include **namespace + chatbot + department** actions as a single cohesive operation.
- Keep UI components thin: **view + bindings**, no orchestration.
- Centralize **side effects** (routing, state updates, refresh, localStorage, notifications) in one place.
- Keep behavior **100% compatible** with the current workflow, while strengthening the default behavior to always manage the linked chatbot and department.

---

## Constraints (rollback-safe / anti-regression)

- **Prefer changes only inside** `src/app/knowledge-bases2/`.
- **Avoid editing external folders** (especially `src/app/knowledge-bases/`) to keep rollback immediate.
- Refactor **incrementally**: every step must compile and keep the feature working.
- No UX changes unless explicitly required.

---

## Current workflow (must be preserved)

From the functional doc (`docs/workflow-creazione-kb-namespace.md`):

- **Gating**: show button only if `PERMISSION_TO_ADD_KB` and `kbPageConfig.sidebarNewNamespaceButton`.
- **Dialog**: open "Add namespace" modal, close with payload `{ namespaceName, hybrid }`.
- **Create namespace**: `POST {SERVER_BASE_URL}{project_id}/kb/namespace/` with `{ name, hybrid }`.
- **Persist last namespace**: `localStorage["last_kbnamespace-<projectId>"] = namespace`.
- **Post-create UI effects**:
  - set selected namespace
  - update route to `/project/:id/knowledge-bases/:namespaceId`
  - refresh namespace list in memory
  - refresh KB contents list with default params scoped by `namespaceId`
  - refresh "chatbots using namespace"
- **Chatbot + department management (new required behavior)**:
  - On KB creation, **always** create a chatbot with the **same name** as the KB/namespace and associate it to the KB.
  - Always create (or ensure) a department with the **same name** as the KB/namespace, link it to the chatbot, and associate it to the KB.
  - Failures in chatbot/department provisioning must be handled explicitly:
    - Namespace creation must not be silently left in a partially provisioned state.
    - The UI must show a clear error and provide a deterministic recovery path (retry provisioning, or rollback the namespace creation if allowed).
- **Error handling**: if plan limit reached, open specific "limit reached" dialog.
- **Success notification**: show "The KB has been successfully created".

---

## High-level design (target state)

### A) One orchestrator per KB lifecycle operation

Create dedicated workflows that manage namespace + chatbot + department as a single unit:

- `CreateKbWorkflow` (KB creation)
- `RenameKbWorkflow` (KB rename)
- `DeleteKbWorkflow` (KB deletion)

Each workflow runs:

1) open dialog/confirm → validate payload
2) perform the primary namespace operation (create / rename / delete)
3) perform chatbot + department operations (create/ensure, rename, delete/unhook) **always**
4) apply post-operation side effects (selection, route, refreshes, localStorage, notifications)
5) centralized error handling (including plan limit reached)

### B) Provisioning isolated and consistent

All chatbot/department operations belong to dedicated services (no UI code), used by the workflows.

Key rule:
- **Provisioning is not optional**. It is part of the KB lifecycle contract.
- Errors must be surfaced and must have a deterministic recovery path.

### C) Component becomes a thin view controller

`KnowledgeBases2Component` should only call the workflow entrypoint with UI context:

- `projectId`
- `payIsVisible`
- `hybridActive`
- flags/config required for gating

---

## Order of operations (create / rename / delete)

This section specifies the recommended order of calls to avoid partial states and to keep rollback/recovery deterministic.

### Create KB (namespace + chatbot + department)

**Recommended order**

1. **Create namespace** (primary resource).
2. **Create or ensure chatbot**:
   - chatbot name = namespace name
   - persist the link between namespace ↔ bot (prefer tags/metadata if available).
3. **Create or ensure department**:
   - department name = namespace name
   - link department ↔ bot
   - persist the link between namespace ↔ department (prefer tags/metadata if available).
4. Apply UI side effects (selection, navigate, refresh) and show success.

**Recovery / compensation rules**

- If namespace creation fails: stop (no resources created).
- If chatbot creation fails after namespace creation:
  - show an explicit error (KB created but not fully provisioned)
  - provide a single "Retry provisioning" action that retries steps 2–3 idempotently.
- If department creation/hook fails:
  - same approach: error + retry provisioning.
- If APIs allow rollback and the UX requires atomic behavior, the workflow can optionally offer:
  - "Undo KB creation" that deletes the namespace (and any partially created bot/dept if present).

### Rename KB (namespace + chatbot + department)

**Recommended order**

1. Validate new name (same validation rules as namespace name).
2. **Rename namespace**.
3. **Rename chatbot** to the same name.
4. **Rename department** to the same name.
5. Refresh UI state and show success.

**Recovery / compensation rules**

- If namespace rename fails: stop.
- If chatbot or department rename fails:
  - show an explicit error and offer "Retry rename" for the remaining resources.
  - do not silently leave inconsistent names.

### Delete KB (namespace + chatbot + department)

**Recommended order (safe cleanup-first)**

1. Confirm delete.
2. Resolve linked resources (botId, deptId) from stored associations (tags/metadata) or discovery.
3. **Unhook/cleanup department** (remove bot association if required by API).
4. **Delete department** (if it is KB-owned; avoid deleting if shared).
5. **Delete chatbot** (if it is KB-owned; avoid deleting if shared).
6. **Delete namespace**.
7. Refresh selection and lists; show success.

**Recovery / compensation rules**

- If namespace delete is attempted first, orphan resources may remain. Prefer cleanup-first unless backend guarantees cascade deletion.
- If any cleanup step fails:
  - show explicit error and offer "Retry delete cleanup".
  - the workflow should be able to re-run delete idempotently using the stored associations.

**Ownership rule (important)**

To safely delete chatbot/department, the system must know whether they are "owned" by the KB.
The refactor should introduce a deterministic ownership marker (e.g. tags like `kb_namespace_id`, `kb_bot_id`, `kb_dept_id`) so delete operations do not remove shared resources.

---

## Step-by-step plan (incremental, rollback-safe)

### Step 0 — Baseline safety and documentation

- **Do**: keep this file updated as steps are implemented.
- **Do not**: touch `src/app/knowledge-bases/`.

Done criteria:
- No functional changes.

---

### Step 1 — Introduce typed contracts for the flow

Create or extend types inside `src/app/knowledge-bases2/models/`:

- `CreateKbNamespaceDialogResult`
- `CreateKbNamespaceRequest`
- `CreateKbNamespaceResult`

Suggested shapes:
- `CreateKbNamespaceDialogResult { namespaceName: string; hybrid: boolean }`
- `CreateKbNamespaceRequest { projectId: string; payIsVisible: boolean; hybridActive: boolean }`
- `CreateKbNamespaceResult { namespace: KbNamespace; provisioning?: { attempted: boolean; ok?: boolean; errorMessage?: string } }`

Files:
- `src/app/knowledge-bases2/models/kb-types.ts` (or a dedicated `create-kb-namespace.types.ts`)

Done criteria:
- Types compile and are used by the new workflow skeleton.

---

### Step 2 — Add workflows for KB lifecycle

Add:
- `src/app/knowledge-bases2/workflows/create-kb.workflow.ts`
- `src/app/knowledge-bases2/workflows/rename-kb.workflow.ts`
- `src/app/knowledge-bases2/workflows/delete-kb.workflow.ts`

Responsibilities (Create):
- Open add-namespace dialog
- Create namespace (API)
- Create chatbot with **same name**, associate it to the namespace
- Create/ensure department with **same name**, link it to the chatbot, associate it to the namespace
- Apply side effects (selection, routing, refresh, notifications)
- Handle plan limit error with the correct dialog

Responsibilities (Rename):
- Rename namespace
- Rename chatbot and department consistently
- Update references/tags/associations if required
- Refresh UI state

Responsibilities (Delete):
- Confirm delete
- Delete/unhook chatbot and department associated to the namespace
- Delete namespace (or delete namespace first and then cleanup, based on API constraints)
- Refresh UI state and selection

Add:
- `src/app/knowledge-bases2/workflows/create-kb-namespace.workflow.ts`

Responsibilities:
- Open add-namespace dialog
- Validate payload
- Call namespace creation API
- Apply side effects (selection, routing, refresh, notifications)
- Handle plan limit error with the correct dialog

Suggested public APIs:
- `CreateKbWorkflow.startFromButtonClick(ctx: CreateKbNamespaceRequest): void`
- `RenameKbWorkflow.startFromRenameAction(ctx: { projectId: string; namespaceId: string; newName: string }): void`
- `DeleteKbWorkflow.startFromDeleteAction(ctx: { projectId: string; namespaceId: string }): void`

Done criteria:
- Workflow compiles; can be called from component without breaking anything.

---

### Step 3 — Centralize dialogs behind KB2 facade/service

Ensure KB2 has a single place to open dialogs (wrapping `MatDialog`) so the workflow does not depend on component internals.

Where:
- Prefer `src/app/knowledge-bases2/facade/knowledge-bases2.facade.ts`
- Or create `src/app/knowledge-bases2/services/kb-dialogs.service.ts`

Required methods:
- `openAddNamespace(...)`
- `openNsLimitReached(...)`

Done criteria:
- Workflow uses the dialogs wrapper, not direct component dialog logic.

---

### Step 4 — Isolate chatbot + department services (mandatory)

Add:
- `src/app/knowledge-bases2/services/kb-chatbot.service.ts`
- `src/app/knowledge-bases2/services/kb-department.service.ts`
- (optional) `src/app/knowledge-bases2/services/kb-associations.service.ts` to manage tags/links consistently

Responsibility:
- Create/rename/delete chatbot and department consistently for a namespace (same name contract).

Rules:
- This is part of the KB lifecycle contract: **not optional**.
- Errors must be handled by workflows with a deterministic recovery path (retry, or rollback if supported).

Done criteria:
- Workflow can call provisioning after namespace creation; errors do not break the flow.

---

### Step 5 — Move all post-create side-effects into the workflow

Side effects to centralize:
- set selected namespace (via `KbNamespaceSelectionService`)
- update namespaces list (via facade/state)
- navigate route to created namespace
- refresh contents list with default params scoped by namespace
- refresh chatbots using namespace
- success notification on completion

Done criteria:
- After creating a namespace, the UI behaves exactly the same as before, but the component no longer contains the orchestration.

---

### Step 6 — Simplify UI gating for the button

Expose a single boolean `canCreateNamespace`:
- `PERMISSION_TO_ADD_KB && kbPageConfig.sidebarNewNamespaceButton`

Done criteria:
- Template binds to `canCreateNamespace` and click handler calls workflow entrypoint.

---

### Step 7 — De-duplicate and harden error handling

Centralize:
- Plan limit reached → open limit dialog
- Generic error → consistent notify

Done criteria:
- No duplicated error branches spread across the component.

---

### Step 8 — Cleanup (optional, after stability)

- Reduce `KnowledgeBases2Component` size and remove dead code paths.
- Replace remaining `any` related to this flow with typed interfaces.
- Ensure all subscriptions in the flow are handled in one place (workflow/facade).

Done criteria:
- The "create namespace" flow is isolated, testable, and the component is significantly smaller.

---

## Regression checklist (must pass)

- **Dialog cancel**: no API calls, no state changes.
- **Happy path**: namespace created → selected → route updated → contents refreshed → success notify.
- **localStorage**: `last_kbnamespace-<projectId>` updated (best effort).
- **Chatbot + department**:
  - On create: both are created/ensured with the same name and associated to the KB.
  - On rename: both are renamed consistently.
  - On delete: both are deleted/unhooked consistently.
- **Plan limit reached**: correct modal is displayed.

