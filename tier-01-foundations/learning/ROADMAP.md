# Roadmap: Tier 1, Foundations

App: task manager API (projects, tasks, tags). Auth arrives in Tier 2.

## Phase 1: API basics
Express 5, REST design, middleware, validation and errors, all on an in-memory store so nothing distracts from HTTP.

### 1.1 Project skeleton and request lifecycle
Goal: A running Express 5 server with a health route and configuration read from the environment.
Build:
- `package.json` with `"type": "module"`, TypeScript in strict mode, `tsx` for development and `tsc` for type checks
- `src/app.ts` builds the app, `src/server.ts` calls `listen()`
- `GET /health` returning status and uptime
- The same health route written once with plain `node:http`, to compare
- A config module that reads and validates `PORT` and `NODE_ENV` once
- Graceful shutdown on SIGTERM
Understand:
- What Express adds on top of `node:http`, seen by writing the health route both ways
- Why the app and the listening server live in separate files
- The path of a request from socket accept to your handler and back
- Why config is validated at startup instead of read lazily
- What TypeScript checks at compile time, and what it can't check at runtime
Break it:
- Start two servers on the same port and read the error
- Remove `PORT` and see whether startup fails loudly or quietly
- Run `curl -v` and explain every request and response header
Quiz focus:
- What does Express do for you that `node:http` doesn't?
- Why export `app` separately from the code that calls `listen()`?
- What should happen to in-flight requests when the process gets SIGTERM?
Done when: You can draw a request's journey from socket to response without looking at the code.

### 1.2 Tasks resource, in memory
Goal: Full CRUD for tasks stored in an array, with correct methods and status codes.
Build:
- `GET /tasks`, `GET /tasks/:id`, `POST /tasks`, `PUT` and `PATCH /tasks/:id`, `DELETE /tasks/:id`
- 201 with a `Location` header on create, 204 on delete, 404 for unknown ids
Understand:
- Resource-oriented URL design
- PUT vs PATCH, and which methods are safe or idempotent
- Why 204 has no body and 201 points to the new resource
- 404 vs 400 and when each applies
Break it:
- Send the same DELETE twice
- POST the same body twice, then PUT the same body twice, and compare
- PATCH an id that doesn't exist
Quiz focus:
- Is DELETE still idempotent if the second call returns 404?
- When would you choose PUT over PATCH?
- Why isn't POST idempotent, and what problem does that cause on retries?
Done when: You can justify every status code the API returns.

### 1.3 Middleware pipeline
Goal: Request IDs, timed request logging and a body size limit, in the right order.
Build:
- Request ID middleware that reads or sets `X-Request-Id`
- A logger that records method, path, status and duration on response finish
- `express.json()` with a size limit
- A 404 fallthrough for unknown routes
- CORS allowing one known origin
- A tiny `client/api.js` fetch wrapper with request and response hooks, used by a demo script
Understand:
- How `next()` passes control and what happens if nobody responds
- Why order matters, and where the logger must sit to see the final status
- App-level vs router-level middleware
- Why logging happens on the response `finish` event
- Changing every call at once: middleware on the server, one API wrapper with interceptors on the client
- CORS, and why the browser sends an OPTIONS preflight first
Break it:
- Remove `next()` from one middleware and watch the request hang
- Move the logger below the routes
- Send a 2 MB JSON body
- Add a header to every client call by changing only the wrapper
- Call the API from a page on another origin with CORS removed
Quiz focus:
- A request hangs forever with no error. Which middleware bug causes that?
- Why log on `finish` rather than when the request arrives?
- What does a request ID help you do in production?
- You need to add a header to 40 API calls. What do you change?
Done when: You can predict what happens when any middleware is moved or removed.

### 1.4 Validation and input safety
Goal: Bad input is rejected at the edge with clear, consistent errors.
Build:
- zod schemas for create and update, plus params and query
- A reusable validate middleware
- Unknown fields stripped; a consistent 400 body listing field errors
- Request types inferred from the schemas with `z.infer`, so validation and types can't drift
Understand:
- Validating at the boundary instead of deep in the code
- Parsing vs validating, and coercing query strings
- Mass assignment, and how whitelisting fields prevents it
- The 400 vs 422 debate, and why consistency matters more than the choice
Break it:
- POST `{"id": 999, "title": ""}`
- Send `title` as a number
- Request `?limit=abc` and `?done=false`
Quiz focus:
- What is mass assignment, and how does your schema stop it?
- Why does `?done=false` need care with coercion?
- Where should validation stop and business rules begin?
Done when: No request body reaches a handler unchecked.

### 1.5 Error handling
Goal: Every failure returns the same error shape and nothing internal leaks.
Build:
- An `AppError` class with status, code and message
- A central error middleware and a 404 handler
- Malformed JSON mapped to 400; unknown errors become a generic 500 with the stack logged
- The request ID included in every error response
- Request timeouts on the server, and detecting a client that disconnects mid-request
- Cancellation in the client wrapper with `AbortController`
Understand:
- How Express 5 forwards rejected promises from async handlers
- Operational errors vs programmer errors
- Why stack traces never go to clients
- The four-argument error middleware signature
- Cancelling in the browser stops the waiting, but the server keeps working unless it checks
- Stale responses: an older request finishing after a newer one
Break it:
- Throw inside an async handler
- Send broken JSON
- Throw a plain string instead of an Error
- Fire request A, then B, with A made slow, and watch A's response overwrite B's. Then fix it with abort
Quiz focus:
- What changed between Express 4 and 5 for async errors?
- A user hits a 500. What do they see, and what do your logs contain?
- What breaks if someone throws a plain string instead of an Error?
- The user clicks one button, then another that fires a different call. How do you cancel the first, and does the server stop?
Done when: You can trace any error from where it's thrown to the JSON the client receives.

### 1.6 Layers and Docker
Goal: Code split into clear layers, running in a container.
Build:
- routes → controllers → services → repositories, with the in-memory store behind a repository
- A multi-stage Dockerfile that compiles TypeScript, using `npm ci`, a non-root user and a `.dockerignore`
- Running the container with env vars
Understand:
- What each layer is allowed to know about
- Why the repository layer turns Phase 2 into a swap rather than a rewrite
- Docker layer caching and why `package.json` is copied first
- Why containers shouldn't run as root
Break it:
- Change one source file and watch which layers rebuild
- Remove `.dockerignore` and compare build context size
- Run the container without its env vars
Quiz focus:
- Where does business logic live, and why not in the controller?
- Why copy `package.json` before the source in a Dockerfile?
- What's the difference between `npm ci` and `npm install`?
Done when: You could replace the storage without touching routes or controllers.

### 1.7 Git: branches, merging and rebasing
Goal: Use Git deliberately instead of by habit.
Build:
- Feature branches for each stage
- The same branch integrated once with merge and once with rebase
- Conflicts created on purpose and resolved by reading both sides
Understand:
- What a commit, a branch and HEAD actually are
- Merge vs rebase, and when each is the better choice
- Why you never rebase commits others already have
Break it:
- Edit the same lines on two branches and resolve the conflict without discarding either change
- Rebase a branch that's already been pushed and shared, and see what breaks for others
Quiz focus:
- When would you rebase, and when would you merge?
- What does `git pull --rebase` do differently from a plain pull?
Done when: You can integrate any branch cleanly and explain the resulting history.

### 1.8 Git: rewriting and recovering history
Goal: Clean up history and recover from mistakes without panic.
Build:
- Interactive rebase to squash, reorder and reword commits
- cherry-pick and stash
- Recovering lost work with reflog
Understand:
- Why reflog makes most Git mistakes recoverable
- What `reset --soft`, `--mixed` and `--hard` each do
- `--force-with-lease` vs `--force`
Break it:
- Hard-reset away a day's work, then recover it with reflog
- Force-push over a teammate's commit in a test repo and recover it
Quiz focus:
- You ran `git reset --hard` by mistake. How do you get your work back?
- Why use `--force-with-lease` instead of `--force`?
Done when: No Git mistake makes you lose work.

Phase 1 milestone: 8–10 mixed questions across Phase 1, including: walk through exactly what happens when `POST /tasks` receives invalid JSON.

## Phase 2: Data layer
Postgres replaces the array. Schema design, migrations, joins, indexes, pagination and transactions, each measured on real data.

### 2.1 Postgres in Compose
Goal: App and Postgres running together, connected through a pool.
Build:
- `docker-compose.yml` with app, Postgres, a named volume and a healthcheck
- A `pg` Pool configured from `DATABASE_URL`
- The health route checks the database too
Understand:
- Pool vs single client, and what pool size limits
- Why a named volume, and what happens without one
- Why `depends_on` alone doesn't mean the database is ready
Break it:
- Stop Postgres while the app is serving requests
- Set the pool max to 1 and fire parallel requests
- Delete the volume and restart
Quiz focus:
- What happens when every pool connection is busy?
- Why doesn't `depends_on` guarantee the database is ready?
Done when: You can explain the app's behaviour when the database disappears.

### 2.2 Schema and migrations
Goal: Users, projects, tasks, tags and a join table, created by migrations.
Build:
- Migrations with node-pg-migrate
- Constraints: NOT NULL, foreign keys, CHECK, UNIQUE
- Timestamps and sensible column types
Understand:
- Up and down migrations, and why applied migrations are never edited
- ON DELETE choices: CASCADE, RESTRICT, SET NULL
- Constraints as the last line of defence
Break it:
- Insert a task for a project that doesn't exist
- Edit an already-applied migration and run again
- Delete a project that still has tasks
Quiz focus:
- CASCADE or RESTRICT for projects → tasks: which, and why?
- If the API already validates, why put rules in the database too?
- How do you change a column safely once real data exists?
Done when: You can design the schema on paper and defend each constraint.

### 2.3 Repositories with raw SQL
Goal: The in-memory repository is swapped for a Postgres one.
Build:
- Parameterized queries for all task operations
- `RETURNING` on inserts and updates
- Row mapping from snake_case to camelCase
- A temporary `X-User-Id` header to stand in for auth until Tier 2
Understand:
- Why `$1` placeholders prevent SQL injection
- How `rowCount` drives 404s on update and delete
- How the layer swap proves the Phase 1 structure
Break it:
- Build one query by string concatenation and inject `' OR 1=1 --`
- Update a missing row and check the response
Quiz focus:
- Why do parameterized queries stop injection, at the protocol level?
- What does `RETURNING` save you?
Done when: Routes and controllers didn't change when storage did.

### 2.4 Relations and joins
Goal: Projects return their tasks and tags efficiently.
Build:
- `GET /projects/:id` with tasks and tags
- Tag assignment through the join table
- Aggregation with `json_agg`
Understand:
- Inner vs left joins, and which this endpoint needs
- Many-to-many through a join table
- The N+1 problem
Break it:
- Write the N+1 version first and log the query count for 50 tasks
- Replace it with a join and compare count and time
Quiz focus:
- What is N+1, and what are two ways to fix it?
- When does a LEFT JOIN change the result here?
Done when: You can count the queries an endpoint runs before you run it.

### 2.5 Indexes and query plans
Goal: Measured speedups from the right indexes on a million rows.
Build:
- A seed script for about 1M tasks
- `EXPLAIN ANALYZE` on the main list queries
- A composite index such as `(project_id, status, created_at)`
- `statement_timeout`, and cancelling a running query when the client disconnects
Understand:
- Sequential scan vs index scan
- Why column order in a composite index matters
- What indexes cost on writes
- Selectivity, and why Postgres sometimes ignores an index
Break it:
- Time queries before and after the index and log the numbers
- Create the index in the wrong column order
- Search with `LIKE '%term%'`
Quiz focus:
- Why might Postgres ignore your index?
- An index on `(a, b)`: does it help `WHERE b = ?`
- What's the cost of adding indexes everywhere?
- A user leaves a slow page. How do you stop the query still running in Postgres?
Done when: You have real before-and-after numbers in LOG.md.

### 2.6 Pagination
Goal: Task lists paginate correctly and stay fast on deep pages.
Build:
- Offset pagination first, then cursor pagination
- Stable ordering with an id tiebreaker
- An opaque encoded cursor
Understand:
- Why offset gets slower the deeper you go
- Why a tiebreaker column is required
- Trade-offs: no jumping to page N with cursors
Break it:
- Fetch page 50,000 with offset, then with a cursor
- Insert rows while paging with offset and spot duplicates
Quiz focus:
- Why does offset pagination repeat or skip rows?
- When is offset still the right choice?
Done when: You can pick a pagination style for any endpoint and defend it.

### 2.7 Transactions
Goal: Multi-step writes either fully happen or don't happen at all.
Build:
- Create a project with its first tasks and tags in one transaction
- Move tasks between projects atomically
- A small helper that runs a function inside a transaction
Understand:
- BEGIN, COMMIT and ROLLBACK
- Why a transaction needs one client, not `pool.query`
- Read committed, the default isolation level, and what it allows
Break it:
- Throw halfway through and confirm nothing was saved
- Run the steps with `pool.query` and see what goes wrong
Quiz focus:
- Why must a transaction use a single client from the pool?
- What can happen under read committed that can't under serializable?
Done when: You can spot which endpoints need a transaction.

### 2.8 ORM comparison
Goal: One repository rebuilt with an ORM, to compare honestly.
Build:
- The tasks repository rewritten with Drizzle or Prisma
- Logging of the SQL it generates
Understand:
- What an ORM saves and what it hides
- How ORM migrations differ from yours
- When to drop back to raw SQL
Break it:
- Trigger N+1 through ORM relation loading
Quiz focus:
- When would you choose raw SQL over an ORM in production?
- How would you notice an ORM generating bad queries?
Done when: You can argue either side of the ORM question with evidence.

Phase 2 milestone: 8–10 mixed questions across Phase 2, including: design the schema and indexes for this API from scratch, then explain your choices.

## Phase 3: Testing and CI
Tests are how you prove AI-written code does what you think. This phase makes that proof automatic on every push.

### 3.1 Test setup
Goal: Tests run against a separate database with one command.
Build:
- node:test with supertest
- A test database, migrated before the run
- `npm test` script
Understand:
- Why tests never touch the dev database
- Why tests import `app` instead of a running server
Break it:
- Point the tests at the dev database with seed data, and watch what happens
- Run two test files in parallel against one database
Quiz focus:
- Why import the app rather than calling a running server?
- What goes wrong when test files share a database in parallel?
Done when: A fresh clone can run the full suite with Docker and one command.

### 3.2 API integration tests
Goal: Every endpoint has tests for its main success and failure paths.
Build:
- Happy paths for all routes
- Error paths: 404, validation 400, malformed JSON
- Assertions on the shared error shape
Understand:
- What integration tests prove that unit tests can't
- Testing behaviour, not implementation
- Test names that read like a spec
Break it:
- Change one status code and see which tests fail
- Write a test that passes for the wrong reason, then fix it
Quiz focus:
- Which error paths are worth testing, and why?
- How can a test pass while the feature is broken?
Done when: Changing any response breaks at least one test.

### 3.3 Isolation and test data
Goal: Tests don't depend on each other or on leftover data.
Build:
- Factories for users, projects and tasks
- Cleanup between tests, by truncate or rollback
Understand:
- Test pollution and order dependence
- Truncate vs per-test transaction rollback
- Deterministic test data
Break it:
- Remove cleanup and add a test that counts rows
- Make one test depend on another's data
Quiz focus:
- Truncate vs rollback per test: what are the trade-offs?
- How do you find a test that only fails when run with others?
Done when: Any single test passes on its own and in the full suite.

### 3.4 Unit tests and mocking
Goal: Service logic is tested without a database where that makes sense.
Build:
- Unit tests for business rules such as status transitions or due dates
- A mocked repository for one service
Understand:
- When mocks help and when they lie
- What isn't worth testing
- Unit vs integration balance for an API like this
Break it:
- Make the mock return a shape the real repository never returns, and see the test pass while the app fails
Quiz focus:
- Give an example where a mock hides a real bug.
- What would you unit test here, and what would you leave to integration tests?
Done when: You can choose the right kind of test for any new behaviour.

### 3.5 CI with GitHub Actions
Goal: Every push and pull request runs the full suite automatically.
Build:
- A workflow with a Postgres service container
- npm caching, a `tsc --noEmit` type check, migrations, then tests
- A status badge in the README
Understand:
- Service containers and why CI starts from a clean database
- Why failing fast matters
- How branch protection would use this check
Break it:
- Push a failing test
- Break the database env var in CI and read the logs
Quiz focus:
- Tests pass locally but fail in CI. What are the first three things you check?
- Why does CI run migrations from scratch every time?
Done when: A broken change can't reach main without a red check.

### 3.6 TypeScript in depth
Goal: Types flow from the database to the API response to a typed client, and the compiler catches mistakes you used to find in production.
Build:
- Generics in the repository layer
- Discriminated unions for results and errors
- Utility types such as `Pick`, `Omit` and `Partial` for request and response shapes
- A small typed API client that shares types with the server
Understand:
- What TypeScript checks at compile time and what only runtime validation can check
- Narrowing with type guards and exhaustive `switch` statements
- `unknown` vs `any`, and why `as` casts hide bugs
Break it:
- Rename a field in the schema and let the compiler find every place to fix
- Cast an API response with `as` and pass in data of the wrong shape at runtime
Quiz focus:
- Why do you still need zod if you have TypeScript?
- When does a discriminated union beat throwing errors?
Done when: A renamed field breaks the build, not production.

### 3.7 Debugging as a method
Goal: Find any bug systematically instead of by guessing.
Build:
- A written method: reproduce, minimize, form a hypothesis, test it, fix, add a regression test
- Breakpoints in the Node debugger through your editor or `--inspect`
- `git bisect run` with a test to find the commit that broke something
Understand:
- Why reproducing comes first
- Logging vs breakpoints, and when each is better
- How bisect finds a bad commit among hundreds in a few steps
Break it:
- Ask Claude to plant a regression twenty commits back without telling you where, then find it with `git bisect run`
- Debug a planted bug using only the debugger, no console.log
Quiz focus:
- Walk through how you'd debug a bug you can only reproduce sometimes.
- How does git bisect work, and when is it the fastest tool?
Done when: You find planted bugs methodically and finish each fix with a regression test.

Phase 3 milestone: 8–10 mixed questions across Phase 3, including: how would you convince a team to trust AI-written code?

## Tier 1 finish line
Run a 12–15 question quiz across all three phases, write a README covering the architecture and key decisions, and turn three LOG.md entries into interview stories (situation, what you decided, what broke, the result).
