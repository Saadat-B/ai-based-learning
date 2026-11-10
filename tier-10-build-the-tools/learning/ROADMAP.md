# Roadmap: Tier 10, Build the tools

Repo: build-the-tools, Node built-ins only.

## Phase 49: Rate limiter and API gateway
A working reverse proxy and gateway built on `node:http`, to understand what Nginx and API gateways do for you.

### 49.1 A reverse proxy from scratch
Goal: A proxy that forwards requests and streams bodies without buffering them.
Build:
- The `build-the-tools` repo, using only Node built-ins plus test tools
- Request forwarding with streamed bodies
- Correct handling of hop-by-hop headers and keep-alive
Understand:
- What a reverse proxy actually does
- Streaming vs buffering bodies
- Hop-by-hop vs end-to-end headers
Break it:
- Buffer whole bodies, then upload a 1 GB file through the proxy
Quiz focus:
- Why must a proxy stream bodies instead of buffering them?
Done when: Large uploads pass through with flat memory.

### 49.2 Rate limiting algorithms
Goal: Four algorithms built and compared, then made distributed.
Build:
- Fixed window, sliding log, sliding window counter and token bucket
- A distributed version using Redis with atomic Lua scripts
Understand:
- Each algorithm's accuracy, memory and burst behaviour
- Why distributed limiters need atomic operations
Break it:
- Run the distributed version without atomic scripts under concurrency
Quiz focus:
- Which algorithm would you pick for a public API, and why?
Done when: You can compare the algorithms with your own measurements.

### 49.3 Routing, auth and config reload
Goal: A gateway with routes, edge authentication and live config changes.
Build:
- A route table
- JWT verification at the edge
- Config reload without dropping connections
Understand:
- Auth at the edge vs in services
- Hot reload without downtime
Break it:
- Reload config while a load test is running
Quiz focus:
- How do you change routing without restarting the gateway?
Done when: Config changes apply live with zero failed requests.

### 49.4 Resilience
Goal: The gateway protects services instead of amplifying failures.
Build:
- Timeouts, retries with a retry budget and a circuit breaker
- Load shedding
- A benchmark against Nginx
Understand:
- Retry budgets
- Circuit breaker states
- Why your proxy is slower than Nginx and where the time goes
Break it:
- Retry without a budget during an outage and watch the load multiply
Quiz focus:
- How can retries turn a small outage into a big one?
Done when: An upstream outage stays contained.

Phase 49 milestone: 6–8 questions across Phase 49, including: design an API gateway for 100 internal services.

## Phase 50: Message queue
A small log-based message queue with its own network protocol, to understand Kafka and BullMQ from the inside.

### 50.1 An append-only log
Goal: Messages written durably to segment files.
Build:
- An append-only log split into segment files
- Offsets and an index
- Checksums per record
- fsync policies
Understand:
- Why logs are append-only
- Durability vs throughput trade-offs of fsync
- Torn writes and how checksums catch them
Break it:
- Kill the process mid-write and recover
Quiz focus:
- What does fsync guarantee, and what does it cost?
Done when: The log survives crashes without silent corruption.

### 50.2 Protocol, producers and consumers
Goal: Producers and consumers talk to the broker over TCP.
Build:
- A binary protocol with length-prefixed frames
- Produce and fetch requests
- Consumer offsets and acknowledgements
- Redelivery after a timeout
Understand:
- Message framing on a TCP stream
- At-least-once delivery from first principles
Break it:
- Send frames split across TCP packets
Quiz focus:
- Why can't you assume one TCP read is one message?
Done when: Messages are delivered at least once across crashes.

### 50.3 Partitions and consumer groups
Goal: Work spread across consumers with ordering per key.
Build:
- Partitions selected by key
- Consumer groups with partition assignment
- Rebalancing when consumers join or leave
Understand:
- Why ordering is per partition, not global
- What happens during a rebalance
Break it:
- Remove a consumer mid-stream and check for lost or duplicated messages
Quiz focus:
- Why does Kafka only guarantee order within a partition?
Done when: Rebalances don't lose messages.

### 50.4 Retention, dead letters and backpressure
Goal: The broker stays healthy when consumers are slow or messages are bad.
Build:
- Retention by size and time
- Dead-letter handling
- Backpressure for slow consumers
- A comparison with Kafka and BullMQ
Understand:
- Retention vs consumption
- Backpressure in a broker
Break it:
- Run a consumer that's ten times slower than producers
Quiz focus:
- What did building this teach you about choosing a queue?
Done when: You can explain any queue's design choices from experience.

Phase 50 milestone: 6–8 questions across Phase 50, including: design a message queue for a million messages a second.

## Phase 51: Key-value store
A Redis-compatible store with persistence and replication, built up from a hash map.

### 51.1 In-memory store with RESP
Goal: A store that `redis-cli` can talk to.
Build:
- The RESP protocol
- GET, SET, DEL and EXPIRE
- Lazy and active expiry
Understand:
- How Redis's protocol works
- Expiry strategies and their costs
Break it:
- Set a million keys with short TTLs and watch memory
Quiz focus:
- Why does Redis use both lazy and active expiry?
Done when: `redis-cli` works against your server.

### 51.2 Durability
Goal: Data survives restarts and crashes.
Build:
- A write-ahead log with fsync options
- Snapshots and log compaction
- Crash recovery
Understand:
- WAL vs snapshots
- Recovery time vs durability
Break it:
- Kill the process with kill -9 and recover
Quiz focus:
- What data can you lose with each fsync setting?
Done when: Recovery restores exactly what was promised as durable.

### 51.3 LSM tree basics
Goal: Storage that handles data bigger than memory.
Build:
- A memtable flushed to sorted files
- Compaction
- Bloom filters for faster lookups
Understand:
- LSM trees vs B-trees
- Read, write and space amplification
Break it:
- Measure reads before and after compaction
Quiz focus:
- Why are LSM trees fast for writes?
Done when: You can explain how databases like RocksDB and Cassandra store data.

### 51.4 Replication
Goal: A leader with followers, and failover you understand.
Build:
- Asynchronous leader-follower replication
- Replication lag tracking
- Manual failover
Understand:
- Async vs sync replication
- Split brain and how fencing prevents it
- Consistency choices
Break it:
- Cut the leader off from followers and promote a follower
Quiz focus:
- What data can you lose in an async failover?
Done when: Failover works and you know exactly what it can lose.

### 51.5 Benchmark and design doc
Goal: Your store measured against Redis and written up.
Build:
- A redis-benchmark comparison
- A design document covering every decision
Understand:
- Where your implementation is slower and why
Break it:
- Find the first bottleneck under load
Quiz focus:
- Present your design in five minutes as if to an interviewer.
Done when: You have a design doc you'd share publicly.

Phase 51 milestone: 6–8 questions across Phase 51, including: design a distributed key-value store.

## Phase 52: Distributed systems and Raft
The theory behind every distributed system you've built, then your key-value store made fault-tolerant with your own implementation of Raft, the consensus algorithm behind etcd and many others.

### 52.1 Distributed systems fundamentals
Goal: The ideas that explain why distributed systems behave the way they do.
Build:
- Quorum reads and writes across three copies of your key-value store
- A small simulation of Lamport and vector clocks
- Notes connecting each idea to something you built in earlier tiers
Understand:
- CAP and PACELC, and what they actually claim
- Consistency models: linearizable, sequential, causal and eventual
- Quorums and why R + W > N matters
- Why exactly-once delivery is impossible in general, and what systems do instead
- Failure detection and why a slow node looks like a dead one
Break it:
- Partition the three copies and read stale data with a weak quorum
Quiz focus:
- What does CAP really say, and why is it often misquoted?
- How do vector clocks detect concurrent updates?
Done when: You can explain any earlier tier's design choices in these terms.

### 52.2 Leader election
Goal: Raft nodes elect one leader and recover when it fails.
Build:
- Raft nodes with terms, randomized election timeouts and vote requests
- A deterministic test harness that drops, delays and partitions messages
Understand:
- Terms and why they only increase
- Why timeouts are randomized
- Why a deterministic test harness matters for distributed code
Break it:
- Give every node the same timeout and watch repeated split votes
Quiz focus:
- How does Raft avoid electing two leaders in the same term?
Done when: Elections converge to one leader under every failure your harness can produce.

### 52.3 Log replication
Goal: The leader replicates commands so every node applies them in the same order.
Build:
- AppendEntries with consistency checks
- Commit index and applying committed entries
- Followers catching up after being offline
Understand:
- When an entry counts as committed
- How a follower's log is repaired after it diverges
Break it:
- Crash the leader halfway through replicating an entry
Quiz focus:
- When is a write safe to acknowledge to the client?
Done when: All nodes apply the same commands in the same order, even across crashes.

### 52.4 Safety under failure
Goal: Prove your implementation stays correct under partitions and crashes.
Build:
- Randomized chaos tests that partition, crash and restart nodes thousands of times
- A linearizability check on the recorded client history
Understand:
- The election restriction and why it protects committed entries
- Why an old leader cut off by a partition can't commit anything
- Testing distributed systems by checking histories
Break it:
- Remove the election restriction and let the chaos tests find the bug
Quiz focus:
- An old leader on the minority side keeps accepting writes. What happens to them?
Done when: Thousands of randomized failure runs pass the linearizability check.

### 52.5 A replicated key-value store
Goal: Your Phase 51 store runs on Raft and survives node failures.
Build:
- The key-value store's writes going through the Raft log
- Linearizable reads
- Snapshots and log compaction
- A comparison with etcd's behaviour
Understand:
- Why reads need care in a replicated store
- How snapshots keep the log from growing forever
- Changing cluster membership, at a high level
Break it:
- Kill the leader during a load test and measure the pause before writes resume
Quiz focus:
- How would you explain etcd's guarantees to a teammate, using your own implementation?
Done when: The store keeps serving correct data while you kill nodes.

Phase 52 milestone: 8–10 questions across Phase 52, including: a three-node cluster is split two and one during a write. Walk through exactly what Raft does.

## Tier 10 finish line
Your proxy, queue and key-value store each survive a crash test and a load test, and each has a design doc. Your Raft-replicated store passes thousands of randomized failure runs. Run a 15-question quiz across Phases 49–52, and present one of the four as a five-minute system design answer.
