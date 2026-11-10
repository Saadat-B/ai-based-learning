# Roadmap: Tier 5, Concurrency and real-time

Monorepo: realtime-lab with apps/booking, apps/chat, services/notify and apps/feed, sharing one Compose file.

## Phase 24: Ticket booking
A seat-booking system for shows and matches. Ecommerce stock was a number; here every seat is unique, holds expire, and thousands of people want the same row at the same second.

### 24.1 Monorepo, venues and seat maps
Goal: The `realtime-lab` monorepo is set up, and the booking app models venues, shows and seats.
Build:
- An npm workspaces monorepo with `apps/booking`, shared config and one Compose file for the whole tier
- Venues with sections, rows and seats
- Shows, with a per-show seat inventory table generated from the venue
Understand:
- Why seat state belongs to a show, not to the seat
- Generating inventory per show vs computing it on read
- When a monorepo helps and what it costs
Break it:
- Generate a 50,000-seat stadium and time the seat map query, then index it
- Create two shows at the same venue and book the same seat in both
Quiz focus:
- Why a `show_seats` table instead of a status column on `seats`?
- How does the seat map query stay fast for a stadium?
Done when: You can return a full stadium seat map for one show quickly.

### 24.2 Seat holds that expire
Goal: Users can hold several seats for 10 minutes, all or nothing.
Build:
- Holding multiple seats atomically in one statement
- A `held_until` timestamp with lazy expiry on read
- A sweeper job that releases expired holds
Understand:
- All-or-nothing holds and why partial holds are worse than failure
- Lazy expiry vs active sweeping, and why you often want both
- Clock assumptions: whose clock decides when a hold ends
Break it:
- Hold 4 seats when one of them is taken and confirm nothing is held
- Let a hold expire while the user is still on the payment page
Quiz focus:
- How do you hold 4 seats atomically, so you never hold 3?
- Why use the database's clock rather than the app server's?
Done when: Holds are atomic and nothing stays held forever.

### 24.3 Contention and distributed locks
Goal: Thousands of concurrent hold requests for the same seats, with no double holds.
Build:
- Row locks in Postgres as the baseline
- An alternative using Redis atomic operations or a Lua script
- A simple distributed lock with a TTL, then fencing tokens
Understand:
- Database locks vs Redis-based coordination
- Why a lock with a TTL can be held by two processes at once
- How fencing tokens make that safe
Break it:
- Make the work take longer than the lock TTL and catch two holders
- Run 2,000 concurrent requests for 10 seats with each approach and record results
Quiz focus:
- Your lock expired while you were still working. What can go wrong, and what fixes it?
- When is Postgres alone enough, and when would you reach for Redis?
Done when: You have measured numbers for each approach and know why fencing matters.

### 24.4 Virtual waiting room
Goal: Big on-sales admit users at a controlled rate instead of melting the system.
Build:
- A waiting room that queues users and issues signed admission tokens
- A configurable admission rate
- Booking endpoints that reject requests without a valid token
Understand:
- Admission control vs rate limiting
- Fairness: first come first served vs randomized
- Why the check must happen on the booking API, not just in the UI
Break it:
- Call the booking API directly, skipping the waiting room
- Admit too fast and watch the database
Quiz focus:
- Why isn't rate limiting enough for a big on-sale?
- How do you stop people skipping the queue?
Done when: An on-sale load test stays stable and nobody bypasses the queue.

### 24.5 Payment races and reconciliation
Goal: Holds, payments and confirmations stay correct even when timing goes wrong.
Build:
- Hold → pay → confirm flow with a mock payment provider
- Handling a payment that arrives after the hold expired
- A reconciliation job comparing payments with bookings
Understand:
- Why distributed flows need a reconciliation step
- Refund vs honouring a late payment, as a business and technical choice
- Idempotent confirmation
Break it:
- Send a payment success one second after the hold expires
- Send the same confirmation twice
Quiz focus:
- A user paid but their seats were released. What does your system do?
- What does a reconciliation job check, and how often should it run?
Done when: Every payment ends as a booking or a refund, never neither.

Phase 24 milestone: 8–10 questions across Phase 24, including: design the booking system for a sold-out cricket final.

## Phase 25: Chat
Long-lived connections change everything: state lives on servers, messages need ordering and delivery guarantees, and scaling out needs a way for servers to talk.

### 25.1 WebSocket basics
Goal: Authenticated WebSocket connections that stay healthy.
Build:
- A `ws` server sharing the HTTP server in `apps/chat`
- Authentication during the upgrade handshake
- Ping/pong heartbeats that close dead connections
Understand:
- How the HTTP upgrade turns into a WebSocket
- Why authentication happens at connect time
- Half-open connections and why heartbeats exist
- Polling vs long polling vs SSE vs WebSockets
Break it:
- Cut the network on a client without closing the socket and watch the server
- Connect with an expired token
Quiz focus:
- What happens on the wire when a WebSocket connection opens?
- How does the server find out a client vanished without closing?
- When is plain polling the right answer?
Done when: Dead connections are cleaned up within a known time.

### 25.2 Rooms, messages and history
Goal: Messages are stored, ordered and paged reliably.
Build:
- Rooms and membership
- Messages persisted with a per-room sequence number
- History pagination by sequence
Understand:
- Why timestamps alone can't order messages
- Per-room sequences and how to generate them safely
- Paging chat history backwards
Break it:
- Send two messages in the same millisecond from different clients
- Generate sequences without a lock and find gaps or duplicates
Quiz focus:
- How do you guarantee message order within a room?
- Why page history by sequence instead of offset?
Done when: Every client sees the same order for every room.

### 25.3 Delivery guarantees
Goal: Messages arrive exactly once from the user's point of view.
Build:
- Client-generated message ids for deduplication
- Server acks and client retries
- Catch-up on reconnect from the last seen sequence
- Read receipts
Understand:
- At-most-once, at-least-once and effectively-once
- Why dedupe ids come from the client
- Delivered vs read
Break it:
- Drop the connection right after sending, before the ack
- Reconnect after missing 50 messages
Quiz focus:
- The client never got an ack. Should it resend, and what stops a duplicate?
- How does a reconnecting client know what it missed?
Done when: No message is lost or shown twice across disconnects.

### 25.4 Presence and typing
Goal: Online status and typing indicators that don't lie.
Build:
- Presence in Redis with TTLs refreshed by heartbeats
- Typing indicators as ephemeral events, never stored
- Last seen times
Understand:
- Ephemeral vs durable data
- Why TTLs beat explicit offline events
- The cost of presence at scale
Break it:
- Crash a server and see whether its users stay online forever
Quiz focus:
- Why use TTLs for presence instead of an offline event?
- Why aren't typing events stored?
Done when: Presence corrects itself after crashes.

### 25.5 Scaling across instances
Goal: Chat works with users connected to different servers.
Build:
- Two chat instances behind Nginx with WebSocket proxying
- Redis pub/sub to fan messages out across instances
- Graceful draining of connections on deploy
Understand:
- Why one server's memory can't know about another's sockets
- Pub/sub vs streams for fan-out
- Connection limits and draining during deploys
Break it:
- Put two users on different instances without pub/sub
- Restart one instance while users are mid-conversation
Quiz focus:
- User A is on server 1 and user B on server 2. Trace a message between them.
- How do you deploy a chat server without dropping everyone?
Done when: Messages flow across instances, and deploys only cause quick reconnects.

### 25.6 Chat UI
Goal: A chat interface that stays fast with thousands of messages and flaky connections.
Build:
- A virtualized message list
- Optimistic sends with pending and failed states
- Unread markers and jump-to-latest
- Connection status and automatic reconnect
Understand:
- List virtualization
- Keeping scroll position when older messages load above
Break it:
- Load 10,000 messages without virtualization
- Go offline, send three messages, then come back online
Quiz focus:
- How do you render a chat with 50,000 messages smoothly?
- What should the UI show for a message that hasn't been acknowledged?
Done when: The chat stays smooth at 10,000 messages and recovers from disconnects.

Phase 25 milestone: 8–10 questions across Phase 25, including: design chat for one million concurrent users.

## Phase 26: Notification service
Your first standalone service. Booking and chat publish events, and this service owns delivery across channels.

### 26.1 A service with a boundary
Goal: `services/notify` runs with its own database and consumes events from the other apps.
Build:
- The notify service with its own schema
- Booking and chat publishing events to Redis Streams
- A consumer group in notify that processes and acknowledges events
Understand:
- Why a service owns its own data
- Event contracts and versioning
- Redis Streams consumer groups vs pub/sub vs job queues
Break it:
- Stop notify while events keep arriving, then start it again
- Change an event's shape without versioning it
Quiz focus:
- Why can notify miss nothing with Streams but would with pub/sub?
- How do you change an event format without breaking consumers?
Done when: Notify can be down for an hour and catch up fully.

### 26.2 Channels and templates
Goal: One event can become an email, an SMS, a push or an in-app message.
Build:
- Channel adapters: email via Mailpit, a mock SMS provider, web push, in-app
- Templates with variables
- A routing step that decides channels per event
Understand:
- The adapter pattern for providers
- Why templates live in the service, not the callers
- Choosing channels by urgency
Break it:
- Render a template with a missing variable
Quiz focus:
- Why should booking not know how notifications are sent?
Done when: Adding a channel needs no change in booking or chat.

### 26.3 Preferences, quiet hours and digests
Goal: Users control what they get and when.
Build:
- Per-user, per-channel preferences and opt-outs
- Quiet hours in the user's timezone
- Digests that batch low-priority notifications
Understand:
- Mandatory vs optional notifications
- Timezone handling for quiet hours
- Batching to cut noise and cost
Break it:
- Send at 23:59 to a user whose quiet hours start at midnight in another timezone
Quiz focus:
- Which notifications must ignore opt-outs, and why?
- How do you build a daily digest without missing or duplicating items?
Done when: No user gets a message they opted out of.

### 26.4 Reliability at the edges
Goal: Provider failures don't lose or duplicate notifications.
Build:
- Retries with backoff per channel
- Failover to a second provider
- Dedupe keys so one event sends one notification
- Per-user and per-provider rate limits
- A dead-letter list with replay
Understand:
- Why sending is at-least-once and how dedupe fixes it
- Circuit breakers for failing providers
- Protecting users from notification floods
Break it:
- Make the SMS provider fail 50% of the time
- Replay a batch of events and check for duplicates
Quiz focus:
- The provider timed out. Did the SMS send? What do you do?
- Why rate limit per user as well as per provider?
Done when: A flaky provider causes delays, never losses or duplicates.

### 26.5 Live in-app notifications
Goal: In-app notifications appear instantly with a correct unread count.
Build:
- Server-Sent Events for live delivery
- Unread counts and mark-as-read
- Catch-up on reconnect
Understand:
- SSE vs WebSockets, and why SSE fits one-way updates
- Keeping counters correct under concurrency
Break it:
- Mark the same notification read from two tabs at once
- Reconnect after missing notifications
Quiz focus:
- When would you choose SSE over WebSockets?
- How do you keep an unread count accurate?
Done when: Counts stay correct across tabs and reconnects.

Phase 26 milestone: 8–10 questions across Phase 26, including: design notifications for 50 million users.

## Phase 27: Social feed
Follows, posts and home timelines: the classic fan-out problem, measured instead of memorized.

### 27.1 Follows, posts and counters
Goal: A social graph with fast follower and like counts.
Build:
- Users, follows and posts in `apps/feed`
- Denormalized follower and like counters
- A seed with ordinary users and a few celebrities with huge followings
Understand:
- Why counters get denormalized
- Hot-row contention on popular counters
- Approximate vs exact counts
Break it:
- Have 5,000 users like one post concurrently and watch the counter row
Quiz focus:
- Why is a like counter on a viral post a contention problem?
- Name two ways to make it scale.
Done when: Counters stay fast and close to correct under load.

### 27.2 Fan-out on read
Goal: Home timelines built at read time, measured.
Build:
- A timeline query joining follows and recent posts
- Load tests for users following 50 vs 2,000 accounts
Understand:
- Why fan-out on read is simple and slow for heavy readers
- Where the query cost grows
Break it:
- Load the timeline for a user following 2,000 accounts
Quiz focus:
- What makes fan-out on read slow, and for whom?
Done when: You have read latency numbers by follow count.

### 27.3 Fan-out on write
Goal: Precomputed timelines that make reads instant.
Build:
- Per-user timelines in Redis sorted sets
- Background workers that push new posts to followers
- Handling deletes and unfollows
Understand:
- Moving cost from read time to write time
- Memory cost of storing timelines
- Eventual consistency in feeds
Break it:
- Have a celebrity with 500,000 followers post
- Delete a post after it fanned out
Quiz focus:
- Why does fan-out on write break for celebrities?
- How do deletes reach timelines that already contain the post?
Done when: Reads are fast and you know exactly where writes get expensive.

### 27.4 Hybrid fan-out
Goal: Normal users fan out on write; celebrities are merged in at read time.
Build:
- A follower threshold that switches strategy
- A read path that merges stored timelines with celebrity posts
Understand:
- Why real systems mix both strategies
- Choosing and tuning the threshold
Break it:
- Set the threshold too low, then too high, and measure both
Quiz focus:
- Walk through how a hybrid feed builds one user's timeline.
Done when: Both a celebrity post and a heavy reader stay fast.

### 27.5 Ranking and pagination
Goal: Feeds ordered by more than time, still paged correctly.
Build:
- A simple score combining recency and engagement
- Cursor pagination over a ranked feed
- Caching the first page
Understand:
- Why ranked feeds break naive pagination
- Score snapshots for stable paging
Break it:
- Let scores change while a user scrolls and look for repeats
Quiz focus:
- How do you paginate a feed whose order keeps changing?
Done when: Scrolling never repeats or skips posts.

### 27.6 Infinite feed UI
Goal: An infinite feed that scrolls smoothly and remembers where you were.
Build:
- Infinite scroll with cursor pagination and prefetching
- Virtualization with variable-height posts
- Lazy-loaded images and scroll restoration on back navigation
Understand:
- IntersectionObserver vs scroll events
- Variable-height virtualization
- Scroll restoration
Break it:
- Open a post, go back, and see whether the position is kept
- Scroll for 5 minutes and watch memory
Quiz focus:
- Design an infinite news feed client for a frontend system design interview.
Done when: Scrolling is smooth, memory is flat, and back navigation keeps the position.

Phase 27 milestone: 8–10 questions across Phase 27, including: design the home timeline for a Twitter-sized app.

## Tier 5 finish line
All four apps run together from one Compose file. A booking confirmation and a message to an offline user both arrive through the notification service. Load tests cover an on-sale, chat across two instances, and a celebrity post. Run a 15-question quiz across Phases 24–27, document how the services talk to each other, and turn five LOG.md entries into interview stories.
