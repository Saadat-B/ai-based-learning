# Learning log

Template for each finished stage:

## [stage id] [title] (date)
- Built: what exists now that didn't before
- Decided: X over Y, because ...
- Broke: what I broke, how I found the cause, the fix
- Measured: any real numbers (timings, query counts, sizes)
- Quiz gaps: topics that weren't solid on the first try
- Interview line: one sentence I could say in an interview

---

## 1.1 Project skeleton and request lifecycle (2026-11-10)
- Built: ESM project from `npm init` (strict tsconfig with NodeNext, `types: ["node"]`), `src/raw-http.ts` (health route on bare `node:http`), `src/app.ts` (Express app, no listen), `src/config.ts` (zod validates PORT and NODE_ENV once at startup, frozen and inferred type), `src/server.ts` (listen + graceful shutdown on SIGTERM/SIGINT with an 8s force-exit), `.env` / `.env.example`, npm scripts (dev, dev:raw, typecheck, build, start).
- Decided:
  - PORT is required with no default, over `.default(3000)`, because quietly binding the wrong port is worse than a loud startup crash.
  - 8s shutdown timeout, over 5 minutes, because whatever stops the server only waits about 10s before SIGKILL; our timer must fire first.
  - Exit 0 for a clean shutdown, 1 for a forced one; `unref()` on the timer so a clean shutdown doesn't wait 8s.
  - `app.ts` and `server.ts` kept separate so importing the app never opens a port.
- Broke:
  - Second server on a taken port: Express printed one clean `EADDRINUSE` line (exit 1, handled in the listen callback); raw crashed with "Unhandled 'error' event" and a stack trace (exit 1 by accident).
  - Missing PORT: fails loudly, but says "expected number, received NaN", the same message as `PORT=abc`, because `coerce` runs `Number(undefined)` before validating. `PORT=99999` → "Too big". OPEN: optional fix so a missing PORT says "required".
  - SIGINT: Express logged both shutdown lines, exit 0; raw printed nothing, exit 130 (128 + 2).
  - Setup surprise: TypeScript 7 doesn't load `@types/*` automatically, so I added `"types": ["node"]`. Ports 3000 and 4000 are taken on this machine, so the app uses 4200 and raw uses 4201.
- Measured:
  - `/health?debug=1`: Express 200, raw 404 (`req.url` includes the query string).
  - Express-only response headers: `X-Powered-By`, `ETag`. The raw 404 had no Content-Length, so Node used `Transfer-Encoding: chunked`.
  - unref demo: B at 1.0s, A at 3.0s, exit at 3.0s.
  - `tsx` runs code with type errors (`port: number` printed `undefined`); `"4200" + 1` = `"42001"`.
- Quiz gaps:
  - Content-Length too big → client hangs waiting for bytes (partial at first).
  - The app/server split needs the concrete failure: importing runs `listen()`, so parallel tests hit EADDRINUSE and the process never exits (partial).
  - Event loop handles and `unref()` (missing, then solid).
  - With a SIGTERM handler, in-flight requests are NOT killed; only the force-exit timer cuts them off. The timer fires at signal time + 8s (missing → partial → solid).
  - Exit code 143 only when killed with no handler; when the signal is handled, our code picks 0 or 1 (partial).
  - zod vs TS: answer the reasoning, not the feature list. NaN is a `number`; TS guarantees types, not values (partial).
  - A hand-written interface next to a schema drifts; infer the type from one source of truth (missing, then solid).
  - Startup vs lazy validation: describe the concrete deploy sequence (partial).
- Interview line: "TypeScript checks types before the code runs, never real values, so I validate config with zod at startup: a missing variable crashes the deploy in the first second instead of breaking one endpoint days later. On SIGTERM the server stops taking connections, lets in-flight requests finish, and force-exits after a timeout shorter than the orchestrator's grace period."

## 1.2 Tasks resource, in memory (2026-11-13)
- Built: `src/tasks.ts`, an Express Router with an in-memory `Task[]` and all six routes: GET list, GET one, POST (201 + Location), PUT (full replace, all fields required), PATCH (only sent fields), DELETE (204, no body). `findTask` helper; `express.json()` and the router mounted in `app.ts`.
- Decided:
  - PUT on an unknown id returns 404, not create, because the server assigns ids; client-chosen ids would collide with `nextId`.
  - Validate the body before looking up the id (400 before 404), the same order in PUT and PATCH, matching where validation middleware will sit in 1.4.
  - In PATCH, `undefined` means "not sent, leave it", while a sent field must still be valid.
  - POST takes only `title` from the body; `id` and `done` are set by the server.
- Broke:
  - DELETE twice: 204, then 404. The state is the same both times, so it's still idempotent.
  - POST twice: two tasks (ids 1 and 2). PUT twice: same task, same state.
  - PATCH /tasks/99: `{"done":true}` → 404; `{"done":"yes"}` → 400 (validation runs first).
  - Predicted `PATCH {"done":true}` would fail on title; it didn't: absent (`undefined`) is not the same as empty (`""`).
- Measured:
  - 204 response carries no Content-Type, Content-Length or ETag.
  - `Number()` on ids: `/tasks/01`, `/tasks/1.0`, `/tasks/0x1` all hit task 1; `/tasks/1abc` → NaN → 404. To fix in 1.4 (positive int param, 400).
- Quiz gaps:
  - Idempotent means the same server STATE, not the same response (missing at first). Idempotency-Keys are a separate tool that makes POST safe to retry.
  - Who relies on idempotency: browsers (form resubmission prompt), retry libraries, Nginx retrying on another upstream; PATCH is treated as non-idempotent by Nginx by default (missing / partial).
  - PUT vs PATCH: PUT's full replace removes cleared fields (edit forms); PATCH avoids lost updates from stale copies on another device (partial).
  - The event loop stays alive while handles (listening server, sockets, timers) are open and exits when none remain; pm2 is unrelated (partial).
  - OPEN from 1.1: a missing PORT still says "received NaN" instead of "required".
- Interview line: "DELETE and PUT are idempotent because repeating them leaves the server in the same state even when the status code changes, so proxies and clients can retry them safely; POST isn't, so retries after a lost response create duplicates unless you add an Idempotency-Key."
