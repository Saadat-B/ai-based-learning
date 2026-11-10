# Roadmap: Tier 2, Ecommerce

App: shop-api, an ecommerce backend with customers, sellers and admins. Builds on Tier 1 patterns.

## Phase 4: Catalog
A new repo, `shop-api`, starting from the patterns you own from Tier 1. Then the product catalog: modeling money, variants and category trees.

### 4.1 Fresh start from Tier 1 patterns
Goal: A new `shop-api` repo with layers, validation, errors, Docker, tests and CI in place.
Build:
- The Tier 1 skeleton recreated in a new repo: layers, AppError, validate middleware, Compose with Postgres, test setup and CI
- No catalog code yet
Understand:
- Every file in the skeleton, explained by you before Claude explains it
- What you'd change from Tier 1 now that you've seen it work
Break it:
- Ask Claude to introduce three subtle bugs into the skeleton without telling you where, then find them with the tests and logs
Quiz focus:
- Explain the request path through this skeleton end to end.
- Which Tier 1 decision would you change for an ecommerce app, and why?
Done when: You explained the skeleton before Claude did, and found all three planted bugs.

### 4.2 Catalog schema
Goal: Products, variants, categories and attributes modeled for real shop data.
Build:
- Products and variants (SKU, price, stock) with prices stored as integer paise
- A category tree using an adjacency list (`parent_id`)
- Product attributes in JSONB, with a reasoned choice of what stays in columns
Understand:
- Why money is stored as integers in the smallest unit, never floats
- Product vs variant: what a customer buys is a variant
- Adjacency list vs materialized path vs closure table for trees
- When JSONB is the right call and when it hides a schema you should have designed
Break it:
- Store prices as floats and sum `0.1 + 0.2` across a cart
- Put a filterable field in JSONB and try to index and filter on it
Quiz focus:
- Why integers for money, and how do you display ₹1,299.50 from them?
- Why is stock on the variant and not the product?
- When would you regret using JSONB here?
Done when: You can defend every table and column type in the catalog.

### 4.3 Catalog API: browse and filter
Goal: Customers can browse categories, filter, sort and page through products quickly.
Build:
- `GET /products` with filters for category (including subcategories), price range and in-stock
- Sorting by price, newest and name, with cursor pagination
- `GET /products/:slug` with variants
- A recursive CTE to fetch a category and all its children
Understand:
- Recursive CTEs and how they walk a tree
- Which filter combinations need composite indexes
- Why slugs in URLs, and how to keep them unique
- Latest wins: aborting the previous request when filters change quickly
- Request waterfalls, and when one aggregated endpoint beats many small calls
Break it:
- Seed 200k products and EXPLAIN your slowest filter combination, then fix it
- Create a category loop (A is parent of B, B of A) and see what the recursive query does
- Change filters rapidly with a slow backend and check the results always match the last filter
Quiz focus:
- How does a recursive CTE terminate, and what happens when the data has a cycle?
- Which index serves `category + price range + sort by price`?
- A page makes six sequential API calls on load. How do you make it faster?
Done when: Your slowest browse query has a measured plan and an index that fixes it.

### 4.4 Response shapes and HTTP caching
Goal: Public responses expose only what they should and can be cached by clients.
Build:
- Separate public and admin response shapes, so cost price and internal fields never leak
- `ETag` and `Cache-Control` on product reads, with 304 responses
- `If-Match` on admin product updates, returning 412 when someone else saved first
Understand:
- Why the database row is never the API response
- How ETags and conditional requests save bandwidth
- Which responses are safe to cache publicly and which never are
- Lost updates when two admins edit the same product
Break it:
- Return the raw row and find what leaked
- Send `If-None-Match` and confirm the 304, then change the product and confirm it doesn't 304
Quiz focus:
- What's the difference between `Cache-Control: no-cache` and `no-store`?
- How would you generate an ETag for a product, and when does it change?
- Two admins save the same product. How do you stop one silently overwriting the other?
Done when: No internal field can reach a customer, and repeat reads return 304.

### 4.5 Storefront: rendering strategies
Goal: A Next.js storefront for the catalog, with each page rendered in the way that suits it.
Build:
- The repo reorganized into `apps/api` and `apps/web` (Next.js App Router), sharing types
- Category pages with static generation and revalidation, product pages server-rendered
- Metadata, sitemaps and structured data for search engines
- Client components only where interaction needs them
Understand:
- CSR vs SSR vs SSG vs ISR, and when each fits
- React Server Components and what runs where
- Hydration, and why hydration errors happen
- How rendering choice affects SEO and caching
Break it:
- Render the current time in a server component and in a client one, and trigger a hydration mismatch
- Make a product page fully client-rendered and check what a search engine crawler sees
Quiz focus:
- Which rendering strategy for a category page, a product page and the cart? Why?
- What causes a hydration error, and how do you fix one?
Done when: Every page's rendering strategy is chosen on purpose and you can defend it.

### 4.6 Technical SEO
Goal: Search engines crawl and index the storefront efficiently, with no duplicate-content mess and no lost rankings when things change.
Build:
- Canonical URLs and `noindex` rules for filter and sort combinations
- `robots.txt` and sitemaps split by type, updated when products change
- 301 redirects when slugs change, with no redirect chains
- Clear rules for out-of-stock (keep the page) and deleted products (410 or a redirect to the closest category)
- Open Graph and Twitter card tags for link previews
- hreflang tags, ready for a second language or region
- Search Console set up on the deployed site
Understand:
- How crawlers discover, render and index pages, including JavaScript-rendered ones
- Crawl budget, and why faceted navigation wastes it
- 301 vs 302, and what redirect chains cost
- 404 vs 410 vs redirect for removed products, and the effect on rankings
- Canonical tags as a hint, not a command
Break it:
- Let every filter combination be indexable and count how many unique URLs a crawler could find
- Change a product's slug without a redirect and check what happens to old links
- Chain three redirects together and measure the extra round trips
- Paste a product link into WhatsApp with and without Open Graph tags
Quiz focus:
- Filters create 50,000 near-duplicate URLs. How do you stop that hurting the store's search ranking?
- A product is discontinued. What should its URL return, and why?
- Google shows a page as "crawled, currently not indexed." What do you check?
Done when: Crawlers see one canonical URL per product and category, old URLs redirect in one hop, and links preview properly when shared.

Phase 4 milestone: 8–10 questions across Phase 4, including: design the catalog schema for a shop with sizes and colours, from scratch.

## Phase 5: Auth and RBAC
Real users, real tokens, and three roles: customer, seller and admin.

### 5.1 Registration and login
Goal: Users sign up and log in safely.
Build:
- Password hashing with bcrypt or argon2
- Case-insensitive unique email
- Generic login errors and rate limiting on login
Understand:
- Why slow hashes, and what the cost factor does
- Why "invalid email or password" instead of saying which one
- How attackers use timing differences and user enumeration
Break it:
- Register `A@x.com` and `a@x.com`
- Time logins for an existing vs a missing email
- Hammer the login route and watch the limiter kick in
Quiz focus:
- Why bcrypt and not SHA-256 for passwords?
- How can a login endpoint leak which emails exist?
Done when: You can list every way this login could be attacked and what stops each one.

### 5.2 Access and refresh tokens
Goal: Short-lived access tokens with rotating refresh tokens and reuse detection.
Build:
- 15-minute JWT access tokens
- Refresh tokens in an httpOnly cookie, stored hashed, rotated on every use
- Reuse detection that revokes the whole token family
- Logout and logout-everywhere
- A client interceptor that refreshes once when many calls get 401 together, queues them, then retries them
Understand:
- Sessions vs JWTs, and what each makes easy or hard
- Why refresh tokens rotate, and what reuse tells you
- Where tokens live in the browser and why
- CSRF risk with cookie-based refresh, and what SameSite does
Break it:
- Use an old refresh token after rotation
- Edit a JWT's payload and send it
- Let an access token expire mid-session
- Expire the access token while five calls are in flight and count the refresh requests
Quiz focus:
- A JWT can't be revoked before it expires. How do you live with that?
- Walk through what happens when a stolen refresh token is used.
- Five requests get 401 at the same moment. How many refresh calls should happen, and how do you ensure that?
Done when: You can draw the full token lifecycle, including theft.

### 5.3 Roles, permissions and ownership
Goal: Customers, sellers and admins can each do exactly what they should.
Build:
- Roles, permissions and a role-permission table
- `requirePermission` middleware
- Ownership checks, so sellers edit only their own products
Understand:
- Role checks vs permission checks
- IDOR, and why 404 can be safer than 403
- Where authorization belongs: middleware, service or query
Break it:
- As seller A, edit seller B's product by changing the id
- Remove one permission and see what breaks
Quiz focus:
- What's an IDOR, and how does your code prevent it?
- Why are permissions more flexible than checking role names?
Done when: Every write endpoint has both a permission check and an ownership rule.

### 5.4 Account lifecycle
Goal: Email verification, password reset and password change done securely.
Build:
- Mailpit in Compose to catch emails locally
- Verification and reset tokens: random, hashed in the database, single-use, expiring
- Changing a password revokes other sessions
Understand:
- Why reset tokens are hashed like passwords
- Why a reset request responds the same whether the email exists or not
- What should happen to existing sessions after a reset
Break it:
- Use a reset link twice
- Use one after it expires
- Request a reset for an email that doesn't exist and compare responses
Quiz focus:
- Why hash a reset token if it's random already?
- What can go wrong if password change doesn't revoke sessions?
Done when: Every token in the system is single-purpose, expiring and stored hashed.

### 5.5 Login with Google
Goal: OAuth sign-in alongside passwords, with safe account linking.
Build:
- Google OAuth with `state` and PKCE
- Linking a Google login to an existing account by verified email
Understand:
- The authorization code flow, step by step
- What `state` and PKCE each protect against
- The account-takeover risk in careless linking
Break it:
- Remove the `state` check and reason about the attack it allowed
- Link accounts on an unverified email and find the takeover
Quiz focus:
- Walk through the OAuth code flow from click to logged in.
- Why is linking on an unverified email dangerous?
Done when: You can explain OAuth without saying "and then it just works".

### 5.6 Auth in the browser
Goal: Login, sessions and protected pages work smoothly in the storefront, including when tokens expire.
Build:
- Login and signup pages with server-side form handling
- Protected routes enforced on the server, not only hidden in the UI
- Silent token refresh with the single-refresh queue from 5.2
- Session state shared across tabs with BroadcastChannel
Understand:
- Why hiding a button is not authorization
- Where auth checks belong in a Next.js app
- Keeping tabs in sync on logout
Break it:
- Log out in one tab and keep using another
- Open a protected page directly with JavaScript disabled
Quiz focus:
- A user logs out in one tab. What should the other tabs do, and how?
- Where must the check that protects the orders page actually happen?
Done when: No page shows private data without a server-side check, and tabs agree on who's logged in.

Phase 5 milestone: 8–10 questions across Phase 5, including: an interviewer asks you to design auth for a marketplace. Go.

## Phase 6: Media
Product images uploaded straight to object storage, processed in the background and served efficiently.

### 6.1 Presigned uploads
Goal: Clients upload images directly to storage, never through your API.
Build:
- MinIO in Compose as local S3
- An endpoint that issues presigned PUT URLs with type and size limits
- Upload records that go from pending to confirmed
Understand:
- Why big files shouldn't pass through the API server
- How a presigned URL grants narrow, temporary access
- Why the database tracks uploads at all
Break it:
- Upload a 50 MB file and a `.exe` with a presigned URL
- Use a presigned URL after it expires
Quiz focus:
- What does a presigned URL actually sign?
- Why might an upload succeed in storage but be missing in your database?
Done when: Uploads never touch your API process.

### 6.2 Background processing with a database queue
Goal: Thumbnails and resized images are generated off the request path.
Build:
- A worker process that resizes images with sharp
- Jobs taken from a table with `SELECT … FOR UPDATE SKIP LOCKED`
- Retry counts and a failed state
Understand:
- Why slow work leaves the request path
- How SKIP LOCKED lets several workers share a table safely
- The limits of a database as a queue (you'll compare with Redis in Phase 8)
Break it:
- Run two workers without SKIP LOCKED and catch double processing
- Kill a worker mid-job and see what happens to that job
Quiz focus:
- What does SKIP LOCKED do, and why does it matter for workers?
- How do you recover a job a crashed worker was holding?
Done when: Several workers process images without duplicates or lost jobs.

### 6.3 Serving and cleanup
Goal: Images are served with long-lived caching and nothing is left orphaned.
Build:
- Public URLs with versioned keys and long cache headers
- A cleanup job for abandoned pending uploads
- Deleting a product deletes its objects
Understand:
- Why versioned keys make long caching safe
- Where a CDN would sit and what it would cache
- Orphaned data between two systems
Break it:
- Replace an image under the same key and see stale caches
- Start uploads and abandon them, then run cleanup
Quiz focus:
- Why change the key instead of overwriting an image?
- How do you keep a database and object storage consistent?
Done when: Storage contains only objects your database knows about.

Phase 6 milestone: 6–8 questions across Phase 6, including: design image upload for a marketplace with a million sellers.

## Phase 7: Cart and checkout
The first real contention problem: many buyers, limited stock, and money that must add up.

### 7.1 Cart
Goal: Guest and logged-in carts that merge on login.
Build:
- Guest carts by cookie, user carts in the database
- Merge on login with clear rules for duplicates
- Prices always recalculated server-side
- Optimistic cart updates in the client wrapper, rolled back when the server rejects them
Understand:
- Why the server never trusts a client price
- Merge rules and their edge cases
- Where cart data should live and for how long
- Optimistic UI, and what happens when the server disagrees
Break it:
- Send a tampered price from the client
- Log in with items in both carts
Quiz focus:
- What happens to a cart item whose price changed since it was added?
- Why recalculate totals on the server every time?
- An optimistic add-to-cart fails. What should the user see?
Done when: Nothing the client sends can change what it pays.

### 7.2 Stock under contention
Goal: Stock never goes negative, however many buyers race for it.
Build:
- A naive read-then-write version first
- Then an atomic `UPDATE … SET stock = stock - $1 WHERE id = $2 AND stock >= $1`
- Then `SELECT … FOR UPDATE`, and an optimistic version column, to compare
Understand:
- Race conditions in read-then-write
- Atomic conditional updates vs pessimistic vs optimistic locking
- Which to pick for hot items vs quiet items
Break it:
- Fire 100 concurrent buyers at 3 units with k6 or autocannon and count oversells for each approach
Quiz focus:
- Why does read-then-write oversell even inside a transaction under read committed?
- Optimistic vs pessimistic locking: when does each win?
Done when: You have oversell counts for each approach in LOG.md.

### 7.3 Checkout transaction
Goal: Placing an order is all-or-nothing and deadlock-free.
Build:
- One transaction that creates the order, snapshots item prices and reserves stock
- Locks taken in a consistent order (sorted variant ids)
- A reservation expiry for unpaid orders
Understand:
- Why order items snapshot the price
- How deadlocks happen and how lock ordering prevents them
- Reserving stock vs decrementing on payment
Break it:
- Two carts locking the same variants in opposite orders, and read the deadlock error
- Kill the process mid-checkout
Quiz focus:
- What causes a deadlock, and how does Postgres resolve one?
- Reserve at checkout or at payment: what are the trade-offs?
Done when: Concurrent checkouts never oversell, deadlock or half-save.

### 7.4 Idempotent checkout
Goal: Retries and double-clicks never create two orders.
Build:
- An `Idempotency-Key` header on checkout
- Stored request fingerprints and responses
- Handling two identical requests arriving at the same time
Understand:
- Why networks force retries and retries force idempotency
- What to store and for how long
- Same key with a different body
- Why disabling the button on the client isn't enough
Break it:
- Double-submit checkout
- Send two identical requests in parallel
- Reuse a key with a different cart
Quiz focus:
- How does an idempotency key work, end to end?
- What do you return when the first request with that key is still running?
- Why isn't a disabled submit button enough to prevent duplicate orders?
Done when: No retry pattern you can think of creates a duplicate order.

### 7.5 Pricing: discounts, GST and rounding
Goal: Totals are correct to the paisa.
Build:
- Coupon rules with limits and expiry
- GST calculation per line
- A clear rounding policy applied in one place
Understand:
- Integer maths and where rounding must happen
- Line-level vs order-level discounts
- Coupon usage limits under concurrency
Break it:
- Round at different steps and compare totals
- Redeem a single-use coupon from two sessions at once
Quiz focus:
- Where should rounding happen, and why only once?
- How do you enforce "one use per customer" under concurrent requests?
Done when: The same cart always produces the same total, to the paisa.

### 7.6 Cart and checkout UI
Goal: A cart and checkout that feel instant, are accessible, and can't submit twice.
Build:
- Optimistic cart updates with rollback
- Checkout forms validated with the same zod schemas as the API
- Keyboard and screen-reader friendly form errors
- Submit button states plus the idempotency key from 7.4
Understand:
- Sharing validation between client and server
- Accessible error messages and focus management
- Why the UI and the server both guard against double submits
Break it:
- Double-click pay on a slow network
- Fill the form with only a keyboard, then with a screen reader
Quiz focus:
- Why validate on both client and server if they use the same schema?
- How do you make form errors accessible?
Done when: Checkout works by keyboard and screen reader, and never double-submits.

Phase 7 milestone: 8–10 questions across Phase 7, including: the flash sale has 100 units and 50,000 buyers. Walk through what your system does.

## Phase 8: Orders and payments
Order lifecycles, a real payment gateway in test mode, queues and the outbox pattern.

### 8.1 Order state machine
Goal: Orders move only through valid states, with a full history.
Build:
- States from pending payment through paid, packed, shipped and delivered, plus cancelled and refunded
- Transitions defined in one place and enforced
- An order history table
Understand:
- Why explicit state machines beat status strings set anywhere
- Guarding transitions in the database as well as in code
- Using history for support and audits
Break it:
- Ship a cancelled order
- Run two transitions on the same order concurrently
Quiz focus:
- How do you stop two concurrent requests making conflicting transitions?
- Why keep history instead of just the current status?
Done when: An invalid transition can't happen, from any code path.

### 8.2 Razorpay payments and webhooks
Goal: Orders get paid through Razorpay test mode, confirmed by verified webhooks.
Build:
- Create a Razorpay order at checkout
- Verify the payment signature
- A webhook endpoint with signature verification, stored event ids and out-of-order handling
- Release reserved stock when payment never arrives
Understand:
- Why the webhook, not the browser redirect, is the source of truth
- Why webhooks arrive twice or out of order
- HMAC signature verification
Break it:
- Replay a webhook
- Send events in the wrong order
- Forge a webhook without the secret
Quiz focus:
- The user paid but closed the tab before the redirect. What happens?
- How do you make webhook handling idempotent?
Done when: Duplicate, late or forged webhooks can't corrupt an order.

### 8.3 Queues with BullMQ
Goal: Post-payment work runs in reliable background jobs.
Build:
- Redis and BullMQ in Compose
- Jobs for confirmation emails and invoice generation
- Retries with exponential backoff and a dead-letter view
Understand:
- Why a queue instead of doing it in the request
- At-least-once delivery and why jobs must be idempotent
- Redis queue vs the database queue from 6.2
Break it:
- Make the email job fail and watch the retries
- Kill Redis with jobs in flight
Quiz focus:
- Why must queue jobs be idempotent?
- When is a database queue good enough?
Done when: A failing job retries, then lands somewhere you can see and replay it.

### 8.4 Outbox pattern
Goal: Events are never lost between the database and the queue.
Build:
- An outbox table written in the same transaction as the order change
- A relay that publishes outbox rows to the queue and marks them sent
Understand:
- The dual-write problem
- How the outbox gives at-least-once publishing
- Why consumers still need idempotency
Break it:
- Crash between committing the order and enqueuing the job, without the outbox, and lose an event
- Repeat with the outbox
Quiz focus:
- Explain the dual-write problem with an example from this app.
- Why doesn't the outbox give exactly-once delivery?
Done when: You can crash the app at any line and no event is lost.

### 8.5 Scheduled and delayed jobs
Goal: Time-based work runs reliably.
Build:
- A delayed job that cancels unpaid orders after 15 minutes
- A daily summary job
- Transactional email templates
Understand:
- Delayed jobs vs cron
- What happens to scheduled work during deploys
- Timezones: store UTC, show IST
Break it:
- Pay at minute 14:59 while the cancel job runs
- Restart workers while delayed jobs are pending
Quiz focus:
- Payment and auto-cancel happen at the same moment. Who wins, and how do you make sure it's correct?
Done when: Timed jobs survive restarts and race safely with user actions.

### 8.6 End-to-end tests with Playwright
Goal: The main buying journey is tested in a real browser on every push.
Build:
- Playwright tests for browse, cart, checkout and a mocked payment
- Test data set up through the API, not the UI
- Tests running in CI with traces saved on failure
Understand:
- What end-to-end tests catch that integration tests miss
- Why flaky tests happen and how to avoid them
- Keeping end-to-end suites small and valuable
Break it:
- Add a fixed `sleep` and a race, and watch the test flake
- Break the checkout button and read the Playwright trace
Quiz focus:
- Why do end-to-end tests become flaky, and what do you do about it?
- Which journeys deserve end-to-end tests?
Done when: A broken checkout fails CI with a trace showing exactly where.

Phase 8 milestone: 8–10 questions across Phase 8, including: tell the story of a payment that was charged but the order stayed pending, and how your design prevents it.

## Phase 9: Performance and deployment
Measure first, then cache, limit and profile. Then put the shop on a real server.

### 9.1 Baseline load test
Goal: Real numbers for browsing and checkout before any optimization.
Build:
- k6 scripts for browse, product detail and checkout
- Recorded p50, p95, p99 and throughput
Understand:
- Why percentiles instead of averages
- Throughput vs latency
- How to load test without fooling yourself
Break it:
- Run the load generator on the same machine and see how it skews results
Quiz focus:
- Why does p99 matter more than the average?
- What's the bottleneck in your baseline, and how do you know?
Done when: Baseline numbers are written down before anything changes.

### 9.2 Redis caching
Goal: Hot catalog reads come from cache, and stay correct.
Build:
- Cache-aside for product detail and category lists
- Invalidation on product updates
- TTL jitter and single-flight protection against stampedes
Understand:
- Cache-aside vs write-through
- The two hard parts: invalidation and stampedes
- What should never be cached
Break it:
- Expire a hot key under load and watch the database spike
- Update a price and serve the stale one
Quiz focus:
- What's a cache stampede and two ways to prevent it?
- Why is stock a bad thing to cache?
Done when: You have before-and-after numbers and no stale-price bug.

### 9.3 Rate limiting
Goal: Abuse is limited without hurting real users.
Build:
- A Redis-backed limiter, starting with fixed window, then sliding window or token bucket
- Per-user and per-IP limits
- 429 with `Retry-After`
Understand:
- The trade-offs between limiting algorithms
- Why the limiter must be shared across instances
- Different limits for login, browse and checkout
Break it:
- Burst at a window boundary to get double the limit with fixed windows
Quiz focus:
- Why does a fixed window allow bursts at the boundary?
- Why can't you rate limit with an in-memory counter behind a load balancer?
Done when: You can pick and justify an algorithm for each route.

### 9.4 Event loop and profiling
Goal: Find and fix work that blocks the event loop, applying what you learned in Track E.
Build:
- An event loop lag metric
- A CPU profile of a slow endpoint
- Heavy work moved to a worker thread
Understand:
- What blocking the event loop does to every other request
- Reading a flame graph
- Worker threads vs extra processes
Break it:
- Add synchronous hashing or a huge `JSON.stringify` and measure every route's latency
Quiz focus:
- One slow endpoint makes all endpoints slow. Why, in Node specifically?
- How do you find which function is blocking?
Done when: You can show a flame graph and explain what you fixed from it.

### 9.5 Deploy to a VPS
Goal: The shop runs on a real server with HTTPS.
Build:
- A production Compose file
- Nginx as reverse proxy with TLS from Let's Encrypt
- Health checks, restart policies and gzip
- A domain of your own pointed at the server, with a CDN in front of static assets
Understand:
- What a reverse proxy does for you
- How DNS points your domain at the server
- How TLS certificates are issued and renewed
- Why the app shouldn't be exposed directly
- Keep-alive timeouts between Nginx and Node, and why a mismatch causes random 502s
Break it:
- Stop the app container and read Nginx's 502
- Let the certificate setup fail and diagnose it
- Set Node's keep-alive timeout below Nginx's and catch the intermittent 502s under load
Quiz focus:
- What happens, step by step, when a browser opens your HTTPS URL?
- Why put Nginx in front of Node at all?
- You see occasional 502s only under load behind the proxy. What do you check first?
Done when: The shop is live at a real HTTPS URL and survives a reboot.

### 9.6 Frontend performance
Goal: The storefront scores well on Core Web Vitals on a mid-range phone.
Build:
- Measurements of LCP, INP and CLS with Lighthouse and real-user data
- Optimized images with correct sizes and lazy loading
- Code splitting and a bundle size budget
- Cache headers and a CDN for static assets
Understand:
- What each Core Web Vital measures
- Why the network and the main thread are the usual bottlenecks
- How caching headers on assets differ from API caching
Break it:
- Load a huge hero image without dimensions and watch layout shift
- Import a heavy library on the home page and measure the damage
Quiz focus:
- Your LCP is 4 seconds on mobile. Walk through finding the cause.
- What causes layout shift, and how do you prevent it?
Done when: Core Web Vitals pass on a throttled mid-range phone profile.

Phase 9 milestone: 8–10 questions across Phase 9, including: walk through your load test results and every change that moved the numbers.

## Phase 10: Search
From Postgres full-text search to a dedicated engine, and the consistency trade-off that comes with it.

### 10.1 Postgres full-text search
Goal: Product search with ranking and typo tolerance, inside Postgres.
Build:
- A generated `tsvector` column with a GIN index
- Ranking by relevance
- `pg_trgm` for typos and partial words
Understand:
- How full-text search differs from LIKE
- What GIN indexes store
- Where Postgres search runs out
Break it:
- Compare `LIKE '%shirt%'` and full-text on 200k products
- Search with typos
Quiz focus:
- Why can't a normal B-tree index help `LIKE '%term%'`?
- When is Postgres search enough?
Done when: Search is fast and handles plurals and typos.

### 10.2 Meilisearch
Goal: A dedicated search engine kept in sync through events.
Build:
- Meilisearch in Compose
- Products indexed through the outbox from Phase 8
- Facets and filters
Understand:
- Why search lives in a separate system
- Eventual consistency between the database and the index
- Full reindexing vs incremental updates
Break it:
- Update a product and search before the sync arrives
- Stop the sync, make changes, then rebuild the index
Quiz focus:
- Your search shows an out-of-stock item as in stock. Why, and what do you do about it?
- How do you reindex without downtime?
Done when: You can rebuild the index from scratch with no downtime.

### 10.3 Autocomplete and relevance
Goal: Search that feels fast and finds the right things.
Build:
- An autocomplete endpoint with debounce-friendly responses
- Relevance tuning
- Logging of zero-result queries
Understand:
- Latency budgets for autocomplete
- Tuning relevance with real queries
- Using zero-result logs to improve search
- Debounce plus abort: fewer requests, and only the latest result shown
Break it:
- Hit autocomplete on every keystroke at load
- Type fast against a slow backend and catch results arriving out of order
Quiz focus:
- How would you decide whether a relevance change made search better?
- Why do you need both debounce and request cancellation?
Done when: You've improved one result based on logged queries.

### 10.4 Search box component
Goal: An autocomplete search box that's fast, correct and accessible.
Build:
- A combobox component with keyboard navigation
- Debounce plus abort, showing only the latest results
- Loading, empty and error states
- Correct ARIA roles and announcements
Understand:
- The combobox accessibility pattern
- Why out-of-order responses are a UI bug
Break it:
- Type fast against a slow backend and look for stale results
- Use the search box with only a keyboard
Quiz focus:
- Design an autocomplete component as you would in a frontend interview.
Done when: The search box handles fast typing, slow networks and keyboard-only use.

Phase 10 milestone: 6–8 questions across Phase 10, including: design search for a 10-million-product catalog.

## Phase 11: Admin and reporting
Aggregations, bulk data in and out, and an audit trail.

### 11.1 Reporting queries
Goal: Sales reports that are correct and fast.
Build:
- Sales by day, category and seller
- Window functions for running totals and rankings
- IST day boundaries handled correctly
Understand:
- GROUP BY vs window functions
- `date_trunc` and timezone handling
- Why reports are usually slow queries
Break it:
- Group by UTC day and find orders landing on the wrong IST date
Quiz focus:
- What's the difference between GROUP BY and a window function?
- Why does a UTC report show the wrong sales for an Indian business day?
Done when: Reports match a hand-checked sample, to the paisa and the day.

### 11.2 Summary tables
Goal: Reports stay fast as orders grow.
Build:
- A materialized view or summary table refreshed by a job
- A comparison of live vs precomputed query times
Understand:
- Freshness vs speed
- Refresh strategies
- Where read replicas would come in
Break it:
- Refresh during heavy load and watch for locking
Quiz focus:
- When is a materialized view the wrong choice?
Done when: The dashboard query is fast with 1M orders.

### 11.3 Bulk product import
Goal: Sellers upload a CSV of thousands of products safely.
Build:
- Streaming CSV parsing in a background job
- Per-row validation with an error report
- Batched inserts or `COPY`
- Progress the seller can check
Understand:
- Streaming vs loading the whole file
- Partial success vs all-or-nothing imports
- Why batches beat row-by-row inserts
Break it:
- Import 100k rows row by row, then batched, and compare
- Include bad rows and check the report
Quiz focus:
- Should one bad row fail the whole import? Defend your answer.
- Why stream the file?
Done when: A 100k-row import finishes quickly with a clear report.

### 11.4 Streaming exports
Goal: Large order exports without running out of memory.
Build:
- A CSV export streamed from a database cursor to the response
- Backpressure handled correctly
Understand:
- Node streams and backpressure
- Why loading all rows first fails at scale
Break it:
- Export 1M rows the naive way and watch memory
Quiz focus:
- What is backpressure, and what happens if you ignore it?
Done when: Memory stays flat while exporting a million rows.

### 11.5 Audit log
Goal: Every admin action is recorded and can't be quietly changed.
Build:
- An append-only audit table with who, what, before and after
- Recorded from the service layer
Understand:
- Why audit logs are append-only
- What to record and what never to record
Break it:
- Try to update an audit row through the app
Quiz focus:
- An admin changed a price and denies it. How does your system settle it?
Done when: Any admin change can be traced to a person and a time.

Phase 11 milestone: 8–10 questions across Phase 11, including: a seller says their sales report is wrong. Walk through your investigation.

## Phase 12: API styles
Making the API something other people can depend on: versioning, docs, GraphQL and outgoing webhooks.

### 12.1 Versioning and deprecation
Goal: The API can change without breaking existing clients.
Build:
- URL versioning with `/v1`
- A breaking change shipped as `/v2` for one endpoint
- `Deprecation` and `Sunset` headers on the old one
Understand:
- Breaking vs non-breaking changes
- URL vs header versioning
- How to retire a version
Break it:
- Rename a field in place and see which tests and clients break
Quiz focus:
- Is adding a field a breaking change? Is removing one? Making one required?
Done when: You can classify any change as breaking or not.

### 12.2 OpenAPI docs
Goal: Accurate API docs generated from the code.
Build:
- An OpenAPI spec generated from the zod schemas
- A docs page
- A test that fails when responses drift from the spec
Understand:
- Why generated docs stay accurate
- Contract testing
Break it:
- Change a response without updating the schema
Quiz focus:
- How do you keep docs and code from drifting apart?
Done when: The docs can't go stale without a test failing.

### 12.3 GraphQL for the catalog
Goal: A GraphQL endpoint for catalog reads, protected against abuse.
Build:
- A GraphQL server for products, variants and categories
- DataLoader to batch queries
- Query depth and complexity limits
Understand:
- When GraphQL helps and when REST is simpler
- Why GraphQL makes N+1 easy
- Why GraphQL needs query cost limits
Break it:
- Query products with variants without DataLoader and count queries
- Send a deeply nested query
Quiz focus:
- How does DataLoader fix N+1?
- Why can't you rate limit GraphQL by request count alone?
Done when: You can argue REST vs GraphQL for this shop.

### 12.4 Outgoing webhooks for sellers
Goal: Sellers get reliable, signed order notifications.
Build:
- Webhook subscriptions per seller
- Signed payloads, retries with backoff and a delivery log
Understand:
- Being the sender: signing, retries and timeouts
- Why receivers need idempotency
Break it:
- Point a webhook at an endpoint that times out, then one that returns 500
Quiz focus:
- How do you design webhooks so a slow receiver can't hurt your system?
Done when: Failed deliveries retry, then stop, and are visible to the seller.

Phase 12 milestone: 6–8 questions across Phase 12, including: you're publishing this API to 500 partner stores. What do you change?

## Tier 2 finish line
The shop is live on your VPS. A k6 run covers browsing and checkout with no oversells and no duplicate orders. Run a 15-question quiz across Phases 4–12, write the README with an architecture diagram and decision list, and turn five LOG.md entries into interview stories. Phases 7 and 8 should supply at least two of them.
