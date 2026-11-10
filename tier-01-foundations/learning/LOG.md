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
