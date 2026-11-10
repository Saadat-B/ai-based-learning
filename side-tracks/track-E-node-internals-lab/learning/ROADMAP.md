# Roadmap: Track E, Node.js internals

Repo: node-internals-lab. Start after Tier 1, and finish before Phase 9 (performance) in Tier 2.

## Phase E1: Architecture and modules
What Node is made of, and how your code gets loaded and run.

### E1.1 How Node is built
Goal: V8, libuv, bindings and the core library, and how a process starts and exits.
Build:
- Experiments tracing startup, the first event loop turn and exit
- A process kept alive by a forgotten timer, then fixed with `unref`
Understand:
- What V8 does and what libuv does
- Why Node exits when nothing is pending
- What keeps a process alive
Break it:
- Leave an interval running and find out why the process never exits
Quiz focus:
- Why does a Node process exit on its own, and what stops it?
Done when: You can draw Node's architecture from memory.

### E1.2 CommonJS and ES modules
Goal: How modules are found, loaded and cached.
Build:
- The CommonJS wrapper function and require cache explored
- The same module in ESM: static imports, live bindings, top-level await
- Circular dependencies in both systems
- package.json `exports` and `type`
Understand:
- `module.exports` vs `exports`
- Why ESM imports are hoisted and static
- CJS and ESM interop rules
Break it:
- Create a circular require and get a half-filled export
- Import a CommonJS module from ESM and hit an interop error
Quiz focus:
- What happens with circular dependencies in CommonJS?
- What does "live binding" mean in ESM?
Done when: Module errors no longer surprise you.

### E1.3 Errors and process lifecycle
Goal: What happens when things go wrong.
Build:
- Handlers for uncaughtException and unhandledRejection
- Exit codes and exit events
Understand:
- Why crashing and restarting is safer than carrying on
- How unhandled rejections are treated
Break it:
- Leave a rejected promise unhandled and observe the crash
Quiz focus:
- Should you catch uncaughtException and keep running? Why not?
Done when: Your services fail loudly and restart cleanly.

Phase E1 milestone: 8–10 questions across Phase E1, including: what happens between typing `node app.js` and the process exiting?

## Phase E2: The event loop in depth
The loop's phases, every queue, and the thread pool.

### E2.1 The phases
Goal: Timers, pending callbacks, poll, check and close, and what happens in each.
Build:
- Experiments that show each phase
- Timer accuracy measured under load
Understand:
- How the poll phase waits for I/O
- Why `setTimeout(fn, 0)` isn't really 0
Break it:
- Compare `setTimeout(0)` and `setImmediate` at the top level and inside an `fs` callback
Quiz focus:
- Why is the order of `setTimeout(0)` and `setImmediate` unpredictable at the top level but fixed inside I/O callbacks?
Done when: You can say which phase any callback runs in.

### E2.2 nextTick, microtasks and setImmediate
Goal: The queues between phases, and the classic ordering question.
Build:
- Ordering puzzles mixing sync code, `process.nextTick`, promises, `queueMicrotask`, timers and `setImmediate`
- The same puzzles in CommonJS, in ES modules and inside I/O callbacks
- Recursive nextTick vs recursive setImmediate
Understand:
- The nextTick queue runs before promise callbacks, after each operation
- Why ES modules can flip that order
- Why nextTick exists, and why `queueMicrotask` is preferred in new code
Break it:
- Recursively schedule nextTick and watch I/O starve
- Do the same with setImmediate and see I/O still run
Quiz focus:
- What does `process.nextTick` do, and how is it different from `setImmediate`?
- Why can a promise callback run before nextTick in an ES module?
Done when: You answer nextTick questions confidently, with the gotchas.

### E2.3 The libuv thread pool
Goal: What runs on the pool, and what doesn't.
Build:
- Experiments with fs, `dns.lookup`, crypto and zlib under load
- Changing `UV_THREADPOOL_SIZE`
Understand:
- Thread pool work vs OS-level async I/O for sockets
- Why `dns.lookup` can slow down file reads
Break it:
- Run 5 `pbkdf2` calls with a pool of 4 and time them
- Slow DNS lookups and watch file operations queue behind them
Quiz focus:
- Which Node operations use the thread pool?
- Why can network sockets scale without the pool?
Done when: You can predict when the pool becomes a bottleneck.

### E2.4 Blocking the loop
Goal: Find and avoid work that freezes every request.
Build:
- Event loop lag measured under CPU work, sync APIs and huge JSON payloads
- A regular expression with catastrophic backtracking
Understand:
- Why one slow request slows all requests
- ReDoS and how to avoid it
Break it:
- Send crafted input to a vulnerable regex and watch the server stop responding
Quiz focus:
- How can a regular expression take down a Node server?
Done when: You spot blocking code in review.

Phase E2 milestone: Event-loop puzzles in CommonJS, ES modules and I/O callbacks, predicted before running.

## Phase E3: V8
How your JavaScript gets compiled, optimized and garbage collected.

### E3.1 The compilation pipeline
Goal: Interpreter, baseline and optimizing compilers, and warm-up.
Build:
- Functions traced with `--trace-opt` and `--trace-deopt`
- Warm-up effects measured
Understand:
- Why code gets faster after running a while
- What makes V8 deoptimize
Break it:
- Change argument types in a hot function and catch the deopt
Quiz focus:
- What causes a deoptimization?
Done when: You can read basic V8 trace output.

### E3.2 Hidden classes and inline caches
Goal: Why object shape matters for speed.
Build:
- Benchmarks with consistent vs inconsistent object shapes
- Monomorphic vs polymorphic vs megamorphic call sites
Understand:
- Hidden classes
- Inline caches
- Why `delete` on objects can hurt
Break it:
- Add properties in different orders and compare speed
Quiz focus:
- Why should objects be created with the same shape?
Done when: You know which patterns keep code fast.

### E3.3 Garbage collection
Goal: How V8 frees memory, and what it costs.
Build:
- GC traced with `--trace-gc` under load
- Heap limits changed with `--max-old-space-size`
Understand:
- Young and old generations
- Scavenges vs full mark-sweep-compact
- GC pauses and latency
Break it:
- Allocate heavily in a hot path and watch GC pauses grow
Quiz focus:
- Why can GC cause latency spikes?
Done when: You can read a GC trace.

### E3.4 Memory leaks
Goal: Find and fix leaks with heap snapshots.
Build:
- Leaks from global caches, listeners, closures holding requests and unbounded maps
- Heap snapshot comparison in DevTools
- Fixes using WeakMap, LRU caches and cleanup
Understand:
- Retainers and why objects stay alive
- WeakMap and WeakRef
Break it:
- Leak memory on every request and find the cause from two snapshots
Quiz focus:
- Your service's memory grows all day. How do you find out why?
Done when: You can find a leak from snapshots alone.

Phase E3 milestone: 8–10 questions across Phase E3, including: why did this function get slower after a small change?

## Phase E4: Buffers, streams and networking
Handling bytes, data flow and connections efficiently.

### E4.1 Buffers and encodings
Goal: Bytes vs strings, done right.
Build:
- Buffer experiments with UTF-8, base64 and binary data
- StringDecoder for chunked input
Understand:
- Why multibyte characters can split across chunks
- Buffer.allocUnsafe and its risk
Break it:
- Decode a chunk split in the middle of a Hindi character
Quiz focus:
- Why can converting each chunk to a string corrupt text?
Done when: Text from streams is never corrupted.

### E4.2 Streams
Goal: All four stream types and how data flows.
Build:
- Readable, writable, duplex and transform streams built from scratch
- Async iteration over streams
Understand:
- Flowing vs paused mode
- Object mode
Break it:
- Process a huge file with and without streams and compare memory
Quiz focus:
- When should you use a stream instead of reading the whole thing?
Done when: You build pipelines out of streams naturally.

### E4.3 Backpressure and pipeline
Goal: Keep fast producers from overwhelming slow consumers.
Build:
- write() return values and the drain event
- highWaterMark tuning
- stream.pipeline with proper error handling
Understand:
- What backpressure is and how Node signals it
- Why pipeline beats pipe for errors
Break it:
- Ignore backpressure while writing to a slow destination and watch memory
Quiz focus:
- What happens if you ignore the return value of write()?
Done when: Memory stays flat no matter how fast data arrives.

### E4.4 HTTP and sockets
Goal: How Node manages connections.
Build:
- Outbound calls with and without keep-alive agents
- maxSockets and connection pooling
- Server timeouts: headers, keep-alive and request
Understand:
- Connection reuse and its impact
- How fetch in Node manages connections
Break it:
- Make thousands of outbound calls without keep-alive and run out of ports
Quiz focus:
- Why did outbound calls start failing under load with no errors in your code?
Done when: Outbound calls reuse connections and time out correctly.

Phase E4 milestone: 8–10 questions across Phase E4, including: explain backpressure with an example from your own code.

## Phase E5: Concurrency and lifecycle
Using more than one thread or process, carrying context, and stopping cleanly.

### E5.1 Worker threads
Goal: Parallel CPU work inside one process.
Build:
- A worker pool for CPU-heavy tasks
- Transferring data and sharing memory with SharedArrayBuffer and Atomics
Understand:
- Copying vs transferring data
- When workers help and when they don't
Break it:
- Send large objects to workers by copying and measure the overhead
Quiz focus:
- When would worker threads not help?
Done when: CPU work no longer blocks requests.

### E5.2 Child processes and cluster
Goal: Multiple processes and how they talk.
Build:
- spawn, exec and fork with IPC
- The cluster module serving one port
Understand:
- Processes vs threads in Node
- Why containers often replace cluster
Break it:
- Kill a cluster worker under load and watch recovery
Quiz focus:
- Cluster or more containers: which, and why?
Done when: You can choose a scaling model for any workload.

### E5.3 AsyncLocalStorage
Goal: Per-request context across async calls.
Build:
- Request IDs carried into every log line with AsyncLocalStorage
Understand:
- How async context is tracked
- Its cost
Break it:
- Lose context through a callback-based library and fix it
Quiz focus:
- How do you get a request ID into logs from deep inside a call stack?
Done when: Every log line carries its request ID.

### E5.4 Signals and graceful shutdown
Goal: Stop without dropping requests or corrupting work.
Build:
- SIGTERM and SIGINT handlers that stop accepting, drain, close pools and exit
- A forced exit after a timeout
Understand:
- Why Node as PID 1 in Docker may not receive signals
- Shutdown order
Break it:
- Run Node as PID 1 without an init process and send SIGTERM
Quiz focus:
- Why didn't your container shut down gracefully?
Done when: Shutdown under load drops zero requests.

Phase E5 milestone: 8–10 questions across Phase E5, including: when would you use worker threads vs more processes?

## Phase E6: Diagnostics
Finding performance problems in running Node services.

### E6.1 CPU profiling
Goal: Find hotspots with evidence.
Build:
- CPU profiles with `--cpu-prof` and the DevTools inspector
- Flame graphs with a tool such as 0x
Understand:
- Reading flame graphs
- Sampling profilers and their limits
Break it:
- Plant a hotspot and find it from the flame graph only
Quiz focus:
- How do you find what's using the CPU in a Node service?
Done when: You can go from "it's slow" to the exact function.

### E6.2 Production diagnostics
Goal: Investigate live services safely.
Build:
- Event loop delay monitoring with perf_hooks
- Diagnostic reports and heap snapshots triggered by signal
- An incident drill with planted problems
Understand:
- What's safe to run in production
- Turning symptoms into hypotheses
Break it:
- Diagnose three planted problems in 30 minutes
Quiz focus:
- The p99 latency doubled after a deploy. Walk through your first 15 minutes.
Done when: You find all planted problems in time.

Phase E6 milestone: An incident drill: the service's p99 latency jumped. Diagnose it.

## Track E finish line
You can predict the output of any event-loop puzzle in CommonJS and ES modules, explain what uses the thread pool, find a memory leak from heap snapshots and a hotspot from a flame graph, and shut a service down cleanly. Run a 15-question quiz across Phases E1–E6.
