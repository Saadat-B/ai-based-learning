# Roadmap: Track Q, SQL and Postgres, hands-on

Repo: sql-lab. Start alongside Tier 1, since its Phase 2 uses Postgres. Finish Q1–Q3 before Tier 2, and do Q4–Q8 alongside Tier 2.

## Phase Q1: Foundations
The environment, the basics, and the NULL and type traps that cause real bugs.

### Q1.1 Practice environment
Goal: Postgres and pgAdmin running, with data worth querying.
Build:
- Docker Compose with Postgres and pgAdmin 4, the server connection pre-registered
- A sample database such as Pagila loaded
- A generated shop dataset (customers, products, orders, order items, events) with millions of rows
- psql available alongside pgAdmin
Understand:
- Finding your way around pgAdmin: browser tree, Query Tool, data output, history
- psql basics: `\d`, `\dt`, `\x`, `\timing`
- Why containers talk to each other by service name
Break it:
- Point pgAdmin (in Docker) at `localhost` and read the error, then fix it
Quiz focus:
- Why can't pgAdmin inside Docker reach Postgres at `localhost`?
Done when: You can open pgAdmin, run a query against millions of rows, and time it.

### Q1.2 Querying basics
Goal: Filter, sort and shape results confidently.
Build:
- 25 exercises with WHERE, ORDER BY, LIMIT, DISTINCT, IN, BETWEEN, LIKE and ILIKE
Understand:
- The logical order a query runs in: FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY, LIMIT
Break it:
- Use a SELECT alias inside WHERE and read the error
Quiz focus:
- Why can't WHERE use an alias defined in SELECT, but ORDER BY can?
Done when: You write simple queries without checking syntax.

### Q1.3 NULL
Goal: Never get surprised by NULL again.
Build:
- Exercises on comparisons, COALESCE, NULLIF and NULLs in aggregates and sorting
Understand:
- Three-valued logic
- Why `NULL = NULL` isn't true
- How aggregates treat NULLs
Break it:
- Filter with `WHERE status != 'shipped'` and find the rows that silently disappear
Quiz focus:
- Why does `!=` drop rows where the column is NULL?
Done when: You spot NULL traps in other people's queries.

### Q1.4 Data types
Goal: Choose the right type for every column.
Build:
- Experiments with integer sizes, numeric vs double, text vs varchar, timestamp vs timestamptz, uuid, enum vs lookup table, jsonb and arrays
Understand:
- Why money is numeric or integer paise, never double
- What timestamptz actually stores
- When an enum becomes a migration headache
Break it:
- Sum prices stored as double
- Store a timestamp without time zone, then change the session time zone
Quiz focus:
- timestamp or timestamptz for an order's created time? Why?
Done when: You can defend every column type in a schema.

### Q1.5 Tables and constraints
Goal: Schemas that protect your data.
Build:
- Tables with primary keys, foreign keys with ON DELETE rules, UNIQUE, CHECK, NOT NULL, defaults, identity columns and generated columns
- ALTER TABLE changes
Understand:
- Identity vs serial
- Constraints as the last line of defence
- What each ON DELETE option does
Break it:
- Insert rows that break each constraint
- Delete a parent row that has children under each ON DELETE rule
Quiz focus:
- Why put a CHECK in the database when the API validates too?
Done when: Bad data can't get in, whatever the app does.

Phase Q1 milestone: 20 timed exercises across Phase Q1, checked against expected results.

## Phase Q2: Joins and aggregation
Combining and summarizing data correctly, including the traps that inflate numbers.

### Q2.1 Joins
Goal: Every join type, used correctly.
Build:
- Exercises with inner, left, right, full, cross and self joins
Understand:
- Join conditions in ON vs filters in WHERE, especially on outer joins
Break it:
- Filter a left-joined table in WHERE and watch it turn into an inner join
Quiz focus:
- Why did your LEFT JOIN start dropping rows?
Done when: Your outer joins keep exactly the rows you intend.

### Q2.2 Semi-joins and anti-joins
Goal: Find what exists, and what doesn't.
Build:
- The same questions with EXISTS, IN, NOT EXISTS, NOT IN and LEFT JOIN … IS NULL
Understand:
- Why NOT IN fails when the subquery contains a NULL
- Which forms the planner treats the same way
Break it:
- Put one NULL in a NOT IN subquery and get zero rows back
Quiz focus:
- Why can NOT IN return nothing at all?
Done when: You default to NOT EXISTS and can explain why.

### Q2.3 Aggregation
Goal: Correct totals, counts and groupings.
Build:
- GROUP BY and HAVING, COUNT variants, the FILTER clause, string_agg and array_agg, ROLLUP and GROUPING SETS
Understand:
- COUNT(*) vs COUNT(col) vs COUNT(DISTINCT col)
- How joins before grouping inflate sums
Break it:
- Join orders to order items, then sum order totals and get a number that's far too big
Quiz focus:
- Why did your revenue double after adding a join?
Done when: Your totals match a hand-checked sample.

### Q2.4 Subqueries and set operations
Goal: Pick the clearest form for each question.
Build:
- Scalar, correlated and derived-table subqueries
- UNION vs UNION ALL, INTERSECT, EXCEPT
Understand:
- When a correlated subquery is fine and when it's slow
- Why UNION costs more than UNION ALL
Break it:
- Time a correlated subquery against an equivalent join on the big dataset
Quiz focus:
- When would you use UNION instead of UNION ALL?
Done when: You can rewrite a query three ways and pick the best.

Phase Q2 milestone: 20 timed exercises across Phase Q2.

## Phase Q3: Intermediate SQL
CTEs, recursion, window functions, time zones and writing data well.

### Q3.1 CTEs
Goal: Readable multi-step queries.
Build:
- Long queries rewritten as CTEs
- Data-modifying CTEs
Understand:
- When CTEs are inlined and when they're materialized
- Readability vs performance
Break it:
- Force materialization on a CTE and compare the plan
Quiz focus:
- Do CTEs make queries slower in Postgres?
Done when: Your complex queries read top to bottom.

### Q3.2 Recursive CTEs
Goal: Walk trees and generate sequences.
Build:
- Category trees, org charts and a generated calendar
Understand:
- How recursion terminates
- Detecting cycles
Break it:
- Create a cycle in the tree and run without a guard
Quiz focus:
- How does a recursive CTE know when to stop?
Done when: You can query any hierarchy safely.

### Q3.3 Window functions: ranking
Goal: Rankings and top-N per group.
Build:
- ROW_NUMBER, RANK, DENSE_RANK and NTILE with PARTITION BY
- Top 3 products per category
Understand:
- Window functions vs GROUP BY
- Ties in each ranking function
Break it:
- Use RANK where ROW_NUMBER was needed and count the extra rows
Quiz focus:
- ROW_NUMBER, RANK or DENSE_RANK for "top 3 per category"? Why?
Done when: Top-N-per-group feels routine.

### Q3.4 Window functions: offsets and frames
Goal: Running totals, moving averages and comparisons with previous rows.
Build:
- LAG, LEAD, running totals, 7-day moving averages, FIRST_VALUE and LAST_VALUE
Understand:
- Window frames: ROWS vs RANGE
- The default frame when ORDER BY is present
Break it:
- Use LAST_VALUE with the default frame and get the current row instead of the last
Quiz focus:
- Why does LAST_VALUE return the current row by default?
Done when: You set frames on purpose.

### Q3.5 Dates and time zones
Goal: Time-based reports that are right for India.
Build:
- date_trunc, intervals and calendars with generate_series
- Reports by IST day with AT TIME ZONE
- Filling gaps in time series
Understand:
- How timestamptz and session time zones interact
- Why gaps in data hide in charts
Break it:
- Group sales by UTC day for an Indian business and find misplaced orders
Quiz focus:
- How do you produce a daily report with zero rows for days with no sales?
Done when: Daily reports match the IST calendar exactly.

### Q3.6 Writing data
Goal: Inserts, updates and upserts done well.
Build:
- INSERT … SELECT, UPDATE … FROM, DELETE … USING, ON CONFLICT upserts, RETURNING, and COPY for bulk loads
Understand:
- Upserts and the unique constraint they need
- Why COPY is far faster than many INSERTs
Break it:
- Run an upsert without a matching unique constraint
- Load 1M rows with single INSERTs vs COPY
Quiz focus:
- How does ON CONFLICT decide what counts as a conflict?
Done when: You can load and update data in bulk safely.

Phase Q3 milestone: 20 timed exercises across Phase Q3, mostly window functions.

## Phase Q4: Advanced querying
Postgres features and classic patterns that come up in real work and interviews.

### Q4.1 JSONB
Goal: Query and build JSON inside Postgres.
Build:
- Queries with `->`, `->>`, `@>` and `?`
- JSON path queries
- Building API-shaped JSON with jsonb_build_object and json_agg
Understand:
- When JSONB is right and when columns are better
- Which JSONB queries can use an index
Break it:
- Filter on a JSONB field without a GIN index on the big table
Quiz focus:
- When would you move a JSONB field into its own column?
Done when: You can shape JSON responses in SQL.

### Q4.2 Full-text and fuzzy search
Goal: Search text without another system.
Build:
- tsvector, ts_rank and websearch_to_tsquery
- pg_trgm similarity for typos
Understand:
- Full-text vs LIKE
- Stemming and dictionaries
Break it:
- Search with a typo using full-text, then with trigrams
Quiz focus:
- When is Postgres search enough?
Done when: Searches handle plurals and typos.

### Q4.3 Arrays and LATERAL
Goal: Per-row subqueries and array handling.
Build:
- unnest, ANY and array operators
- LATERAL joins for the latest 3 orders per customer
Understand:
- What LATERAL makes possible
- LATERAL vs window functions for top-N
Break it:
- Solve top-N per group with LATERAL and with a window function, then compare plans
Quiz focus:
- When does LATERAL beat a window function?
Done when: You reach for LATERAL when it fits.

### Q4.4 Classic patterns
Goal: Problems that show up again and again.
Build:
- Gaps and islands (consecutive login days)
- Sessionization of events
- Pivots with FILTER
- Keeping only the latest row per key
Understand:
- Recognising each pattern from the question
Break it:
- Solve one pattern two ways and compare
Quiz focus:
- Find users who logged in on 3 or more consecutive days.
Done when: You recognise the pattern before writing anything.

Phase Q4 milestone: 12 timed exercises across Phase Q4.

## Phase Q5: Performance
Reading plans in pgAdmin's visual EXPLAIN and making slow queries fast on millions of rows.

### Q5.1 Reading query plans
Goal: Understand any plan, in text and in pgAdmin's graphical view.
Build:
- EXPLAIN, EXPLAIN ANALYZE and BUFFERS on the big dataset
- The same plans in pgAdmin's visual EXPLAIN
Understand:
- Seq scan, index scan, bitmap scan and index-only scan
- Nested loop, hash and merge joins
- Estimated vs actual rows
Break it:
- Run EXPLAIN ANALYZE on a DELETE and discover it really deleted the rows; then redo it inside BEGIN … ROLLBACK
Quiz focus:
- Why can EXPLAIN ANALYZE be dangerous on a write?
- Estimated rows are 10, actual are 1 million. What does that tell you?
Done when: You can point to the expensive step in any plan.

### Q5.2 B-tree indexes
Goal: The everyday index, used precisely.
Build:
- Single-column, composite and covering (INCLUDE) indexes
- Indexes that remove sorts
Understand:
- Column order and the leftmost prefix rule
- Index-only scans and the visibility map
Break it:
- Create a composite index in the wrong order and compare plans
Quiz focus:
- An index on (a, b): which queries does it help?
Done when: You design indexes from the queries, not the columns.

### Q5.3 Specialized indexes
Goal: The right index type for each job.
Build:
- Partial, expression (`lower(email)`), GIN, BRIN and hash indexes on suitable data
Understand:
- When each index type fits
- The write and storage cost of every index
Break it:
- Index a time-series table with B-tree and with BRIN and compare size and speed
Quiz focus:
- When would you choose a partial index?
Done when: Every index you create has a reason.

### Q5.4 When indexes aren’t used
Goal: Diagnose and fix ignored indexes.
Build:
- Queries that skip an index because of functions on columns, type casts, low selectivity, OR conditions and leading wildcards
Understand:
- How the planner weighs an index against a scan
- Statistics and ANALYZE
Break it:
- Make stale statistics produce a bad plan, then fix it with ANALYZE
Quiz focus:
- Your index exists but the plan shows a seq scan. What do you check?
Done when: You can explain any ignored index.

### Q5.5 Finding slow queries
Goal: Find what to fix in a real workload.
Build:
- pg_stat_statements enabled and read
- Slow query logging and auto_explain
- Unused and duplicate indexes found with the statistics views
Understand:
- Total time vs mean time when prioritising
- Why the slowest query isn't always the one to fix first
Break it:
- Run a mixed workload and find the top offenders
Quiz focus:
- How do you decide which slow query to fix first?
Done when: You can run a tuning session from evidence.

### Q5.6 Big tables
Goal: Paging, counting and changing large tables safely.
Build:
- Offset vs keyset pagination
- Fast approximate counts
- Batched updates and deletes
Understand:
- Why exact counts are slow
- Why huge single updates hurt everything else
Break it:
- Update 5M rows in one statement, then in batches, and compare locks and time
Quiz focus:
- How would you delete 50M old rows from a live table?
Done when: Big changes never lock up the database.

Phase Q5 milestone: A tuning session: make the five slowest queries in a workload fast, with before-and-after plans.

## Phase Q6: Transactions and locking, hands-on
Two pgAdmin Query Tool tabs side by side, watching transactions and locks interact live.

### Q6.1 Transactions
Goal: Control exactly what commits.
Build:
- BEGIN, COMMIT, ROLLBACK and savepoints
- pgAdmin's auto-commit setting vs psql's behaviour
Understand:
- Autocommit
- Savepoints for partial rollback
Break it:
- Leave a transaction open in one tab and watch the other tab hang
Quiz focus:
- Why did a forgotten open transaction block other queries?
Done when: You always know whether you're inside a transaction.

### Q6.2 Isolation levels and anomalies
Goal: See every anomaly happen with your own eyes.
Build:
- Lost updates, non-repeatable reads, phantoms and write skew reproduced across two tabs
- The same tests at each isolation level
- Retrying on serialization failures
Understand:
- Read committed vs repeatable read vs serializable in Postgres
- Why serializable needs retries
Break it:
- Reproduce write skew with two doctors going off call at once
Quiz focus:
- What is write skew, and which isolation level prevents it?
Done when: You can reproduce any anomaly on demand.

### Q6.3 Locks and deadlocks
Goal: Find who is blocking whom, and why.
Build:
- Row locks: FOR UPDATE, FOR SHARE, NOWAIT, SKIP LOCKED
- Blocking chains found with pg_locks and pg_stat_activity
- A deadlock reproduced and read from the log
- lock_timeout
Understand:
- Row locks vs table locks
- How Postgres detects deadlocks
Break it:
- Make two tabs deadlock on purpose
Quiz focus:
- A query is hanging. How do you find what it's waiting for?
Done when: You can untangle any blocking chain.

### Q6.4 Advisory locks and queues
Goal: Coordination patterns built on Postgres.
Build:
- Advisory locks for one-at-a-time jobs
- A job queue using SKIP LOCKED with several workers
Understand:
- Session vs transaction advisory locks
- Why SKIP LOCKED makes queues possible
Break it:
- Run three workers without SKIP LOCKED and catch double processing
Quiz focus:
- How does SKIP LOCKED let workers share a table?
Done when: Your queue never processes a job twice.

Phase Q6 milestone: Reproduce every anomaly and a deadlock from memory, in two tabs.

## Phase Q7: Database programming and operations
What lives inside the database, and how to look after it.

### Q7.1 Views and materialized views
Goal: Saved queries and precomputed results.
Build:
- Views for reporting
- Materialized views refreshed concurrently
Understand:
- Views vs materialized views
- Refresh costs and locking
Break it:
- Refresh a materialized view without CONCURRENTLY while it's being read
Quiz focus:
- When is a materialized view the wrong choice?
Done when: You know when to precompute.

### Q7.2 Functions and triggers
Goal: Logic inside Postgres, used carefully.
Build:
- SQL and PL/pgSQL functions
- Triggers for `updated_at` and an audit table
Understand:
- When logic belongs in the database vs the app
- Hidden costs of triggers
Break it:
- Add a slow trigger and measure insert speed
Quiz focus:
- Should business rules live in triggers? Defend your answer.
Done when: Triggers do small, obvious jobs only.

### Q7.3 Roles, permissions and row-level security
Goal: Least privilege inside the database.
Build:
- An app role with only the rights it needs
- Schemas and GRANTs
- Row-level security policies
Understand:
- Owners vs users
- How RLS policies are applied
Break it:
- Connect as a superuser and see RLS ignored
Quiz focus:
- Why shouldn't your app connect as the database owner?
Done when: The app role can do exactly what it needs.

### Q7.4 Operations
Goal: Backups, monitoring and the settings that matter.
Build:
- pg_dump and pg_restore
- Watching pg_stat_activity, cancelling and terminating queries
- Checking bloat and vacuum activity
- Key settings such as work_mem and shared_buffers
Understand:
- pg_cancel_backend vs pg_terminate_backend
- Why work_mem affects sorts and hashes
Break it:
- Set work_mem too low and find the disk sort in the plan
Quiz focus:
- How do you safely stop a runaway query?
Done when: You can back up, restore and monitor a database confidently.

Phase Q7 milestone: 8–10 questions across Phase Q7, including: a production query is stuck. Walk through what you do.

## Phase Q8: Interview SQL drills
The SQL questions interviews actually ask, timed.

### Q8.1 Classic problems
Goal: Fast, correct answers to the standard questions.
Build:
- Nth highest salary, duplicates, department top earners, employees earning more than their managers
Understand:
- Talking through your approach as you write
Break it:
- Solve each two ways
Quiz focus:
- Find the second highest salary in each department.
Done when: You solve each in a few minutes.

### Q8.2 Analytics problems
Goal: Product and business questions in SQL.
Build:
- Retention cohorts, funnels, month-over-month growth, rolling daily active users
Understand:
- Translating a business question into SQL step by step
Break it:
- Check one answer by hand on a small sample
Quiz focus:
- Build a weekly retention cohort table.
Done when: Analytics questions don't slow you down.

### Q8.3 Timed mocks
Goal: Real interview conditions.
Build:
- Mocks with `/mock sql` on unseen problems
Understand:
- Clarifying questions that change the query
Break it:
- Do one mock with a requirement changed halfway
Quiz focus:
- What do you ask before writing a single line?
Done when: Two mocks passed in a row.

Phase Q8 milestone: Two passed timed mocks with `/mock sql`.

## Track Q finish line
You can write any reporting query with joins, CTEs and window functions, read a plan in pgAdmin's visual EXPLAIN and fix it with the right index, and reproduce isolation anomalies and lock waits in two tabs. Pass two timed SQL mocks with `/mock sql`.
