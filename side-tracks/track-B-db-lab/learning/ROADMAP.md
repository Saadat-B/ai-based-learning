# Roadmap: Track B, Databases in depth

Repo: db-lab. Start after Track Q’s core phases (Q1–Q6) and Tier 2, and finish before Tier 5.

## Phase B1: Postgres internals
What happens inside Postgres when you read and write.

### B1.1 Pages and B-tree indexes
Goal: See how rows and indexes are stored.
Build:
- Inspect pages and index structure with Postgres extensions
- Index-only scans
Understand:
- Heap pages and tuples
- B-tree structure
- Covering indexes
Break it:
- Bloat a table with updates and inspect it
Quiz focus:
- Why are updates expensive in Postgres?
Done when: You can explain an index scan at page level.

### B1.2 MVCC and vacuum
Goal: Understand how Postgres handles concurrent versions of rows.
Build:
- Observe row versions and visibility
- Vacuum and autovacuum behaviour
Understand:
- MVCC
- Dead tuples and bloat
- Transaction ID wraparound
Break it:
- Hold a transaction open for an hour and watch bloat grow
Quiz focus:
- Why does a long-running transaction hurt the whole database?
Done when: You can explain bloat and how to prevent it.

### B1.3 How isolation is implemented
Goal: Explain how Postgres provides each isolation level internally.
Build:
- Your Track Q anomaly setups rerun while inspecting snapshots with `pg_current_snapshot()`
- Predicate locks under serializable observed in `pg_locks`
Understand:
- Snapshots and visibility rules
- How serializable snapshot isolation detects dangerous patterns
- Why serializable can abort transactions that looked fine
Break it:
- Run the write-skew case under serializable and find the predicate locks that caught it
Quiz focus:
- How does Postgres detect write skew under serializable?
Done when: You can explain why each anomaly does or doesn't happen at each level.

### B1.4 WAL and replication internals
Goal: How durability and replication work.
Build:
- Inspect WAL activity
- Logical replication to a second database
Understand:
- WAL and checkpoints
- Physical vs logical replication
Break it:
- Kill Postgres mid-write and observe recovery
Quiz focus:
- How does Postgres recover after a crash?
Done when: You can explain crash recovery.

### B1.5 The query planner
Goal: Why Postgres chooses the plans it does.
Build:
- Experiments with statistics and plan changes
- Fixing a bad plan
Understand:
- Cost estimates and statistics
- Why plans change as data grows
Break it:
- Make stale statistics produce a bad plan
Quiz focus:
- A query got slow overnight with no code change. Why?
Done when: You can explain and fix a bad plan.

Phase B1 milestone: 8–10 questions across Phase B1, including: walk through what happens when two transactions update the same row.

## Phase B2: NoSQL
Other data models, and how to choose.

### B2.1 MongoDB modelling
Goal: Documents, embedding and references.
Build:
- The Tier 2 catalog modelled in MongoDB
Understand:
- Embed vs reference
- Schema design from access patterns
Break it:
- Embed an ever-growing array and hit document size limits
Quiz focus:
- When do you embed and when do you reference?
Done when: Your Mongo model fits its access patterns.

### B2.2 MongoDB in practice
Goal: Indexes, aggregation and transactions.
Build:
- Indexes and aggregation pipelines
- Multi-document transactions
Understand:
- Aggregation pipeline stages
- Transaction costs in MongoDB
Break it:
- Run a report without indexes on a million documents
Quiz focus:
- When are MongoDB transactions a warning sign?
Done when: Reports run fast with the right indexes.

### B2.3 DynamoDB single-table design
Goal: Key-value design driven by access patterns.
Build:
- The wallet or orders modelled with single-table design locally
Understand:
- Partition and sort keys
- Secondary indexes
- Hot partitions
Break it:
- Put all writes on one partition key
Quiz focus:
- Why must you know your queries before designing a DynamoDB table?
Done when: Every access pattern is served by a key or index.

### B2.4 Wide-column stores
Goal: Cassandra-style modelling for huge write volumes.
Build:
- Chat messages modelled for a wide-column store
Understand:
- Partition keys and clustering columns
- Tunable consistency
Break it:
- Create an unbounded partition
Quiz focus:
- How would you store a billion chat messages?
Done when: Your model avoids unbounded partitions.

### B2.5 Choosing a database
Goal: Write the decision, with trade-offs.
Build:
- A one-page database choice for three apps from this roadmap
Understand:
- Consistency, query flexibility, scale and operations
- Why Postgres is a sensible default
Break it:
- Argue against your own choice
Quiz focus:
- When would you not use Postgres?
Done when: Your choices survive a devil's-advocate review.

Phase B2 milestone: Model one app in three databases and defend the choice.

## Track B finish line
You can explain MVCC, isolation anomalies and index internals, model the same domain in Postgres, MongoDB and DynamoDB, and write a defensible database choice for any app in this roadmap.
