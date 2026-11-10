# Roadmap: Track G, Go

Repo: go-lab. Start after Tier 5, once the concurrency and real-time work makes Go’s strengths obvious.

## Phase G1: The language
Go's simplicity, and the habits it asks you to unlearn.

### G1.1 Go for a TypeScript developer
Goal: Write everyday Go fluently.
Build:
- Exercises by hand: structs, methods, interfaces, maps and slices
- Packages and modules
Understand:
- Implicit interfaces
- Zero values
- Why Go has no classes or exceptions
Break it:
- Write a TypeScript-style class hierarchy in Go and see why it fights the language
Quiz focus:
- How do Go interfaces differ from TypeScript interfaces?
Done when: You write Go that looks like Go.

### G1.2 Errors
Goal: Explicit error handling done well.
Build:
- Error wrapping with `%w`, `errors.Is` and `errors.As`
- Custom error types
Understand:
- Errors as values
- Wrapping and inspecting errors
- When panic is acceptable
Break it:
- Ignore an error and trace the bug it causes
Quiz focus:
- Why does Go return errors instead of throwing?
Done when: Every error is handled or deliberately passed up with context.

### G1.3 Pointers, slices and maps
Goal: Go's memory model in practice.
Build:
- Experiments with value vs pointer receivers
- Slice append and capacity behaviour
- Generics for a small utility
Understand:
- Values vs pointers
- How slices share an underlying array
- When generics help in Go
Break it:
- Append to a slice copy and change the original by accident
Quiz focus:
- Why can appending to one slice change another?
Done when: No slice or pointer surprises.

Phase G1 milestone: 8–10 questions across Phase G1, including: explain how slices share memory, with a drawing.

## Phase G2: Concurrency
Goroutines, channels and cancellation: the reason many teams choose Go.

### G2.1 Goroutines and channels
Goal: Concurrent programs with goroutines and channels.
Build:
- Fan-out and fan-in pipelines
- Buffered vs unbuffered channels
Understand:
- Goroutines vs threads vs Node's event loop
- Channel blocking semantics
Break it:
- Create a deadlock and read the runtime's message
- Leak goroutines and count them
Quiz focus:
- When does sending on a channel block?
- How do goroutine leaks happen?
Done when: Your pipelines never leak or deadlock.

### G2.2 Context and cancellation
Goal: Timeouts and cancellation that flow through the whole program.
Build:
- `context` passed through handlers, database calls and outbound requests
- Deadlines and cancellation
Understand:
- Why context is the first argument everywhere
- Propagating cancellation
Break it:
- Drop the context in one layer and watch work continue after the client leaves
Quiz focus:
- How does Go cancel work when a client disconnects?
Done when: Cancelling a request stops all its work.

### G2.3 Sync and the race detector
Goal: Shared state done safely.
Build:
- Mutexes, WaitGroups, `sync.Once` and atomics
- Tests run with the race detector
Understand:
- Channels vs mutexes
- Data races and how the detector finds them
Break it:
- Write a data race and catch it with `-race`
Quiz focus:
- When would you use a mutex instead of a channel?
Done when: The race detector finds nothing.

### G2.4 Concurrency patterns
Goal: Worker pools, rate limiting and graceful shutdown.
Build:
- A bounded worker pool
- Rate limiting with a ticker
- Graceful shutdown on signals
Understand:
- Bounding concurrency
- Draining work on shutdown
Break it:
- Shut down while jobs are in flight
Quiz focus:
- How do you stop a worker pool without losing jobs?
Done when: Shutdown finishes or hands back every job.

Phase G2 milestone: 8–10 questions across Phase G2, including: design a worker pool that shuts down cleanly.

## Phase G3: Services in Go
A real service with Go's standard tooling.

### G3.1 HTTP and Postgres
Goal: A REST service with the standard library and a light router.
Build:
- `net/http` with a small router
- Postgres with pgx, and type-safe queries with sqlc
- Middleware for logging and auth
Understand:
- How Go's HTTP server handles each request
- Code generation with sqlc vs an ORM
Break it:
- Forget to close a response body and watch connections leak
Quiz focus:
- What happens if you don't close response bodies in Go?
Done when: The service is small, fast and readable.

### G3.2 Testing, benchmarks and profiling
Goal: Go's built-in tooling for correctness and speed.
Build:
- Table-driven tests
- Benchmarks
- CPU and memory profiles with pprof
Understand:
- Table-driven testing
- Reading pprof output
- Allocations and why they matter
Break it:
- Find an allocation hotspot with pprof and remove it
Quiz focus:
- How do you find what's slow in a Go service?
Done when: You can show a profile before and after an optimization.

### G3.3 Shipping a port
Goal: One earlier component rebuilt in Go and compared.
Build:
- The Tier 10 rate limiter or the Tier 6 scheduler ported to Go
- A tiny static binary in a minimal container image
- A load test against the Node version
Understand:
- Static binaries and minimal images
- Where Go's performance advantage actually comes from
Break it:
- Run both versions under the same load and compare latency and memory
Quiz focus:
- When would you choose Go over Node for a new service?
Done when: You have a measured, honest comparison.

Phase G3 milestone: 6–8 questions across Phase G3, including: compare your Go port with the Node original, with numbers.

## Track G finish line
You've built a concurrent Go service with clean cancellation, tests, benchmarks and profiles, and ported one earlier component to Go with measured results. Run a 12-question quiz across Phases G1–G3.
