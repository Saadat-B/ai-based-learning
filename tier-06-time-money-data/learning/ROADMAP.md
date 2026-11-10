# Roadmap: Tier 6, Time, money, data

Monorepo: systems-lab with apps/scheduler, apps/wallet, apps/analytics and apps/leaderboard, sharing one Compose file.

## Phase 28: Job scheduler
Running the right work at the right time, exactly once in effect, across several servers that can crash at any moment.

### 28.1 Monorepo and the job model
Goal: The `systems-lab` monorepo is set up, and the scheduler stores jobs and computes when each runs next.
Build:
- An npm workspaces monorepo with `apps/scheduler` and one Compose file for the tier
- Jobs with a cron expression, timezone, payload and `next_run_at`
- Next-run calculation using a cron library, stored in UTC
Understand:
- Storing times in UTC and scheduling in the user's timezone
- What daylight saving does to cron: skipped and repeated hours
- Why `next_run_at` is stored instead of recomputed on every check
Break it:
- Schedule a 02:30 job in a timezone with daylight saving and step through the change night
- Schedule in server local time, then change the container's timezone
Quiz focus:
- A daily 02:30 job in New York. What happens on the night clocks go forward?
- Why store schedules in UTC and display them in local time?
Done when: You can predict every run time for a year, including DST nights.

### 28.2 Many instances, one run
Goal: Three scheduler instances never fire the same run twice.
Build:
- A naive version first, with in-process cron on every instance
- Then runs claimed from Postgres with `FOR UPDATE SKIP LOCKED`
- A `job_runs` table recording each attempt
Understand:
- Why in-process cron duplicates work as soon as you scale out
- Claiming work vs leader election
- Postgres advisory locks as a simple leader election
Break it:
- Run three instances with naive cron and count duplicate emails
- Swap to claims and repeat
Quiz focus:
- You scaled to three pods and every report email now arrives three times. Why, and what are two fixes?
- Claims or leader election: which would you pick here?
Done when: Any number of instances produce exactly one run per schedule.

### 28.3 Leases and crashed workers
Goal: Work held by a crashed worker is picked up again safely.
Build:
- Leases with an expiry, renewed by heartbeat
- Reclaiming expired leases
- Idempotency keys so a retried job has its effect once
Understand:
- At-least-once execution, and why exactly-once is about effects, not runs
- Leases vs locks
- How long pauses break leases
Break it:
- Kill a worker mid-job
- Freeze a worker past its lease, then let it resume, and catch both finishing
Quiz focus:
- A worker paused, lost its lease, then woke up and finished. What protects you?
- Why can't a scheduler guarantee exactly-once runs?
Done when: Crashes and pauses never cause a lost job or a double effect.

### 28.4 Retries, overlaps and missed runs
Goal: Clear rules for failures, slow jobs and downtime.
Build:
- Retries with exponential backoff and a max attempts limit
- An overlap policy: skip, queue or allow
- A misfire policy after downtime: run once, run all missed, or skip
Understand:
- Why a job slower than its interval needs a rule
- Catch-up after an outage, and when running every missed run is dangerous
- Jitter to avoid thundering herds at midnight
Break it:
- Make a 5-minute job take 7 minutes
- Stop the scheduler for an hour, then start it
- Schedule 10,000 jobs at exactly midnight
Quiz focus:
- The scheduler was down for 6 hours. What should happen to the hourly billing job?
- Why does everyone scheduling at midnight cause problems?
Done when: Every job has a stated policy for overlaps, failures and misfires.

### 28.5 Ops API and long-running requests
Goal: Jobs can be paused, triggered and watched, without long-hanging HTTP requests.
Build:
- Pause, resume and trigger-now endpoints
- Trigger-now returns 202 Accepted with a status URL
- Run history with durations and errors
- Job timeouts
Understand:
- The async request-reply pattern: 202, then poll or subscribe
- Polling with backoff vs SSE for status on the client
- Why a request should never wait for a 10-minute job
Break it:
- Make trigger-now wait for the job to finish and watch proxy and browser timeouts
- Poll status every 100 ms from many clients
Quiz focus:
- A button starts a report that takes 5 minutes. Design the API and the client behaviour.
- How should a client poll for status without hammering the server?
Done when: No endpoint waits on slow work, and clients get progress cheaply.

Phase 28 milestone: 8–10 questions across Phase 28, including: design a scheduler that runs a million user reminders a day.

## Phase 29: Wallet and ledger
Money done properly: double-entry bookkeeping, balances that never go negative, and reconciliation against the outside world.

### 29.1 Double-entry model
Goal: Every movement of money is a balanced journal entry.
Build:
- Accounts, journal entries and postings in `apps/wallet`, amounts in integer paise
- A database check that each entry's postings sum to zero
- Balances derived from postings
Understand:
- Why double entry makes money impossible to create or lose silently
- Debits and credits as signs, explained plainly
- Why ledgers are append-only
Break it:
- Post an entry that doesn't balance
- Try to update or delete a posting
Quiz focus:
- Why can't a wallet just have a balance column that goes up and down?
- How does the database guarantee every entry balances?
Done when: No code path can write an unbalanced or edited entry.

### 29.2 Transfers under concurrency
Goal: Concurrent transfers never overdraw an account.
Build:
- Atomic transfers between wallets
- Account rows locked in a consistent order
- A cached balance column kept in step with postings, and a check that they agree
Understand:
- Lost updates and overdrafts under concurrency
- Lock ordering to avoid deadlocks between opposite transfers
- When a cached balance is safe
Break it:
- Fire 200 concurrent withdrawals at one wallet
- Transfer A→B and B→A at the same time
Quiz focus:
- How do you stop two withdrawals both seeing enough balance?
- Why lock accounts in id order?
Done when: Load tests never produce a negative balance or a deadlock.

### 29.3 Top-ups, holds and reversals
Goal: Money from outside arrives safely, and mistakes are corrected without deleting history.
Build:
- Top-ups through a mock payment provider with idempotency keys
- Holds: authorize now, capture or release later
- Reversals as new entries
- A status endpoint for transfers
Understand:
- Authorize vs capture
- Why corrections are new entries, not edits
- The timeout question: did the payment go through?
Break it:
- Time out the client after the server committed, then retry
- Capture a hold twice
Quiz focus:
- The app timed out on a transfer. How does the client find out if it happened, without risking a double transfer?
- Why are reversals better than deletes?
Done when: Retries, timeouts and double captures can't move money twice.

### 29.4 Reconciliation
Goal: The ledger is checked against the provider's records every day.
Build:
- Importing a provider settlement CSV
- Matching it against ledger entries
- A mismatch report and a suspense account for unexplained money
Understand:
- Why your records and the provider's will drift
- Matching strategies and their failure modes
- What a suspense account is for
Break it:
- Remove a transaction from the provider file
- Add one the ledger has never seen
Quiz focus:
- The provider says you received ₹10,000 more than your ledger does. Walk through your process.
Done when: Every rupee is matched or explained.

### 29.5 Statements, rounding and precision
Goal: Accurate statements, and amounts that survive the trip through JSON.
Build:
- Statements with running balances using window functions
- Fee and interest calculations with an explicit rounding mode
- Amounts sent and received as strings or integer paise, never as JSON floats
Understand:
- Why JavaScript numbers are unsafe for money in transit
- Banker's rounding vs half-up, and when each is used
- Running balances in SQL
Break it:
- Send `10.1` as a JSON number from a JavaScript client and follow it through
- Round fees per transaction vs per statement and compare
Quiz focus:
- Why can a client sending `amount: 0.1 + 0.2` cause a bug?
- Where in the system should rounding happen?
Done when: Statements reconcile exactly with the ledger.

Phase 29 milestone: 8–10 questions across Phase 29, including: design the wallet behind a UPI app.

## Phase 30: Analytics pipeline
Collecting millions of events, moving them through Kafka, and answering questions about them quickly.

### 30.1 Event collection
Goal: Clients send events reliably, including when the tab is closing.
Build:
- A batched ingestion endpoint with schema validation
- Client batching, plus `navigator.sendBeacon` for page unload
- Event ids for deduplication
- Server receive time stored next to client time
Understand:
- Why `fetch` on unload loses events and `sendBeacon` doesn't
- Client clocks are wrong; how to handle skew
- Batching vs one request per event
Break it:
- Send an event with `fetch` on tab close and check whether it arrives
- Send events from a client with its clock set a day ahead
Quiz focus:
- Why use `sendBeacon` for the last event before a page closes?
- Which timestamp do you trust, the client's or the server's?
Done when: Events survive page closes, and timestamps are sane.

### 30.2 Kafka
Goal: Events flow through Kafka (Redpanda locally) with known ordering and delivery.
Build:
- Redpanda in Compose with a Kafka client
- A topic with partitions, keyed by user id
- A consumer group that commits offsets after processing
Understand:
- Partitions, keys and per-key ordering
- Consumer groups and rebalancing
- Offsets, and why commit timing decides duplicates vs losses
Break it:
- Crash a consumer after processing but before committing
- Add a consumer to the group and watch rebalancing
Quiz focus:
- How does Kafka keep one user's events in order?
- Commit before or after processing: what does each risk?
Done when: You can predict duplicates and ordering for any crash point.

### 30.3 Columnar storage
Goal: Events land in ClickHouse and queries over millions of rows are fast.
Build:
- ClickHouse in Compose
- Batched inserts from the consumer
- Tables partitioned by day and ordered for common queries
Understand:
- Row stores vs column stores
- Why analytics queries love columnar storage
- Why ClickHouse wants big batches
Break it:
- Insert row by row, then in batches, and compare
- Run the same aggregation in Postgres and ClickHouse on 10M events
Quiz focus:
- Why is a column store fast for "count events by day" and bad for updating one row?
Done when: Common queries over 10M events return quickly.

### 30.4 Rollups, late events and duplicates
Goal: Aggregates stay correct when events arrive late or twice.
Build:
- Per-minute and per-hour rollups
- Handling events that arrive hours late
- Deduplication by event id
Understand:
- Event time vs processing time
- Windows, and how late data reopens them
- Deduplication strategies at scale
Break it:
- Send a batch two hours late
- Replay a whole topic and check the counts
Quiz focus:
- Yesterday's numbers changed today. Is that a bug?
- How do you count unique events when duplicates are guaranteed?
Done when: Replays and late data don't corrupt totals.

### 30.5 Dashboard API
Goal: A fast dashboard API that handles time ranges, timezones and impatient users.
Build:
- Query endpoints for time series and top lists with timezone-aware ranges
- HyperLogLog-style approximate unique users
- Caching for common ranges
- Client-side abort when the range changes
Understand:
- Exact vs approximate counts, and when approximate is fine
- Why dashboards fire many queries, and how to batch them
- Cancelling queries the user no longer wants
Break it:
- Switch the date range rapidly and watch queries pile up on ClickHouse
Quiz focus:
- When is a 1% error in unique users acceptable?
- The user changes the range five times quickly. What should the client and server do?
Done when: The dashboard stays fast and never shows numbers from an old range.

### 30.6 Dashboard UI
Goal: A dashboard that handles big datasets without freezing.
Build:
- Charts for time series and top lists
- Heavy data transforms moved to a Web Worker
- Range changes that cancel stale requests
Understand:
- Main-thread budget
- When to downsample data before charting
Break it:
- Chart 500,000 points on the main thread
Quiz focus:
- The dashboard freezes when switching ranges. What do you do?
Done when: The dashboard stays responsive with large ranges.

Phase 30 milestone: 8–10 questions across Phase 30, including: design analytics for an app with 10 million daily users.

## Phase 31: Leaderboard
Rankings that update in real time for millions of players, and scores nobody can fake.

### 31.1 Sorted sets
Goal: Top players, your rank and the players around you, instantly.
Build:
- Redis sorted sets with `ZINCRBY`, top N and rank lookups in `apps/leaderboard`
- An around-me view
- A tie-breaking rule
Understand:
- How sorted sets keep ranking cheap
- Why SQL ranking gets slow at scale
- Ties, and why the earliest score usually wins
Break it:
- Give 1,000 players the same score and check rank stability
- Compute ranks with SQL on 5M rows and compare
Quiz focus:
- How do you break ties in a sorted set that only stores one score?
Done when: Rank lookups stay fast at 5M players.

### 31.2 Daily, weekly and all-time boards
Goal: Boards for different periods that reset at the right moment.
Build:
- Period keys with expiry
- Resets at IST midnight and Monday
- Archiving final standings
Understand:
- Key naming by period vs deleting and rebuilding
- Timezones for global games
Break it:
- Submit a score at 23:59:59 IST and see which board it lands on
Quiz focus:
- Your players are in India and the US. When does the daily board reset?
Done when: Every score lands on the right board at boundaries.

### 31.3 Source of truth and rebuilds
Goal: Redis can be lost without losing the leaderboard.
Build:
- Scores stored in Postgres as the source of truth
- A rebuild job that reloads Redis
- Notes on sharding a board too big for one key
Understand:
- Redis as a fast view, not the record
- Rebuilding without downtime
- Approximate ranks for very large boards
Break it:
- Flush Redis and rebuild while scores keep arriving
Quiz focus:
- Redis lost all its data. Walk through recovery with no wrong ranks.
Done when: A full Redis loss is recoverable with no lost scores.

### 31.4 Live updates and anti-cheat
Goal: Players see rank changes live, and fake scores are rejected.
Build:
- Rank changes pushed over SSE, throttled
- Server-authoritative scoring from game events, not client totals
- Rate limits and sanity checks on submissions
Understand:
- Why the client must never send its own final score
- Throttling updates for very active boards
Break it:
- Submit a score directly from the browser console
- Push every rank change to every viewer at 1,000 updates a second
Quiz focus:
- How do you stop players posting fake scores?
- How often should viewers get leaderboard updates?
Done when: The only way onto the board is playing.

Phase 31 milestone: 6–8 questions across Phase 31, including: design a live leaderboard for a 10-million-player game.

## Tier 6 finish line
All four apps run from one Compose file. Three scheduler instances run a week of simulated jobs with no duplicates. The wallet survives a 200-way concurrent load test and reconciles to the paisa. Analytics totals survive a full replay, and the leaderboard survives a Redis wipe. Run a 15-question quiz across Phases 28–31, and turn five LOG.md entries into interview stories, with at least one each from the scheduler and the wallet.
