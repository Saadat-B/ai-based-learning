# Roadmap: Tier 9, Advanced apps

Monorepo: advanced-lab with apps/video, apps/delivery, apps/rides and apps/docs, sharing one Compose file.

## Phase 45: Video streaming
Large uploads that survive bad networks, a transcoding pipeline, and adaptive streaming that plays smoothly on a weak connection.

### 45.1 Monorepo and resumable uploads
Goal: The `advanced-lab` monorepo is set up, and large videos upload in chunks that resume after a network drop.
Build:
- An npm workspaces monorepo with `apps/video` and one Compose file for the tier, including MinIO
- S3 multipart uploads with presigned part URLs
- A client uploader that chunks, retries failed parts and resumes from the last completed part
- Checksums per part
Understand:
- Why a 2 GB upload can't be one request
- How multipart uploads track parts
- Cleaning up abandoned multipart uploads
Break it:
- Cut the network at 90% and resume
- Corrupt one part in transit and see the checksum catch it
Quiz focus:
- The upload died at 1.8 GB of 2 GB on mobile data. What happens with your design?
- Who pays for parts of uploads that were never completed?
Done when: Uploads resume after any interruption without starting over.

### 45.2 Transcoding pipeline
Goal: Uploaded videos become several qualities, processed by background workers.
Build:
- ffmpeg workers pulling jobs from a queue
- Renditions at 360p, 720p and 1080p
- Progress reporting the client can poll or subscribe to
- Thumbnails
Understand:
- Why transcoding is CPU-heavy and lives on separate workers
- Splitting work so one video can use several workers
- Poison jobs that fail forever
Break it:
- Upload a corrupt file and make sure it doesn't retry forever
- Kill a worker halfway through a long video
Quiz focus:
- How do you stop one broken video from blocking the queue?
- How would you transcode a 3-hour video faster?
Done when: Every upload ends as playable renditions or a clear failure.

### 45.3 Adaptive streaming with HLS
Goal: Playback switches quality to match the viewer's connection.
Build:
- HLS segments and manifests for each rendition
- A player page using hls.js
- Signed URLs for private videos
- Different cache rules for segments and manifests
Understand:
- How adaptive bitrate decides when to switch
- Why segments cache forever but manifests don't, for live content
- Protecting private videos without proxying every byte
Break it:
- Throttle the browser's network mid-playback and watch quality drop, then recover
- Share a signed URL after it expires
Quiz focus:
- How does the player decide to drop from 1080p to 360p?
- Why serve video from a CDN instead of your servers?
Done when: Playback stays smooth on a throttled connection.

### 45.4 Seeking, resume and view counts
Goal: Viewers can seek, resume where they left off, and views are counted honestly.
Build:
- HTTP Range requests with 206 responses for direct files
- Watch position saved every few seconds and on page close
- View counting with deduplication
Understand:
- How Range requests make seeking possible
- Saving progress without a request every second
- Why view counts are harder than incrementing a number
Break it:
- Seek in a file served without Range support
- Refresh the page 100 times and check the view count
Quiz focus:
- How do you count a view in a way that refreshing and bots can't inflate?
- How does the player resume at the right second on another device?
Done when: Seeking works, positions sync, and views resist simple inflation.

### 45.5 Storage and delivery cost
Goal: The cost of storing and serving video is understood and controlled.
Build:
- Lifecycle rules that move old renditions to cheaper storage
- Rough cost calculations for storage and egress
- Deleting rarely watched high renditions and regenerating on demand
Understand:
- Why egress, not storage, is usually the big bill
- Trade-offs of regenerating vs storing
Break it:
- Work out the monthly bill for 10,000 videos watched 100 times each
Quiz focus:
- Your video bill doubled. Where do you look first?
Done when: You can estimate the monthly cost of the platform from usage numbers.

### 45.6 Video player UI
Goal: A custom video player that's accessible and handles network trouble.
Build:
- Custom controls on top of hls.js
- Buffering and error states
- Captions and keyboard controls
Understand:
- Media element events
- Accessible media controls
Break it:
- Throttle the network to 3G and watch the player states
Quiz focus:
- Design a video player component for a frontend interview.
Done when: The player is usable by keyboard and honest about buffering.

Phase 45 milestone: 8–10 questions across Phase 45, including: design YouTube's upload-to-playback path.

## Phase 46: Food delivery
Three kinds of user at once, customers, restaurants and riders, with a long order lifecycle, maps, timers and live tracking.

### 46.1 Order lifecycle with timers
Goal: Orders move through a long lifecycle, with timeouts at each step.
Build:
- Restaurants, menus and orders in `apps/delivery`
- A state machine: placed, accepted, preparing, picked up, delivered, plus cancellations
- Timers at each step, such as auto-cancel if the restaurant doesn't accept in 3 minutes
Understand:
- State machines with several actors changing state
- Timers as scheduled jobs racing with user actions
- Who is allowed to make each transition
Break it:
- Have the restaurant accept at the exact moment the auto-cancel fires
- Let a rider mark an order delivered before pickup
Quiz focus:
- The restaurant accepts as the auto-cancel fires. Who wins, and how do you guarantee it?
Done when: Every timer and user action race resolves to one correct state.

### 46.2 Maps and delivery zones
Goal: Customers see restaurants that can actually deliver to them.
Build:
- PostGIS for locations
- Delivery zones as polygons
- Nearby restaurant queries with spatial indexes
- A basic ETA estimate
Understand:
- Points, polygons and spatial indexes
- Straight-line distance vs road distance
- Latitude and longitude order
Break it:
- Swap latitude and longitude and see where your restaurants land
- Query nearby without the spatial index
Quiz focus:
- Why can a restaurant 1 km away be undeliverable?
- How does a spatial index make "nearby" fast?
Done when: Zone and distance queries are correct and fast.

### 46.3 Rider assignment
Goal: Each order gets one rider quickly, even when riders ignore offers.
Build:
- Offers to the best available rider with an accept timeout
- Cascading to the next rider on timeout or rejection
- Protection against assigning one rider to two orders
Understand:
- Offer one at a time vs broadcast to many
- Locking a rider during an offer
- Riders going offline mid-offer
Break it:
- Have two orders offer the same rider at once
- Let a rider accept after their offer timed out
Quiz focus:
- How do you make sure a rider is never assigned two orders by accident?
- Broadcast or sequential offers: which, and why?
Done when: No double assignments under concurrent load.

### 46.4 Live tracking
Goal: Customers watch the rider move in near real time.
Build:
- Rider location updates every few seconds
- Latest positions in Redis GEO
- Updates pushed to the customer over SSE or WebSockets
- Ignoring updates older than the last one received
Understand:
- Update frequency vs battery, data and server cost
- Out-of-order updates on mobile networks
- Why you store the latest position, not every point, on the hot path
Break it:
- Send an old location after a newer one and watch the rider jump backwards
- Drop the rider's connection for a minute
Quiz focus:
- The rider's icon jumps backwards on the map. Why, and what fixes it?
- How often should a rider app send its location?
Done when: The map never jumps backwards and survives brief disconnects.

### 46.5 Dinner peak
Goal: The system stays useful when everyone orders at 8 pm.
Build:
- Restaurant capacity limits that pause new orders
- Batching two orders on one rider
- A degraded mode that turns off non-essential features under load
Understand:
- Back-pressure in the real world
- Batching trade-offs for food quality and ETA
- Choosing what to turn off first
Break it:
- Load test an 8 pm peak with and without capacity limits
Quiz focus:
- It's peak time and riders are scarce. What does your system do?
Done when: Peak load degrades gracefully instead of failing.

### 46.6 Live map UI
Goal: A live tracking map that moves smoothly instead of jumping.
Build:
- Marker animation between location updates
- Map rendering limits with many markers
- Battery-friendly update handling on mobile
Understand:
- Interpolating between updates
- requestAnimationFrame for animation
Break it:
- Render 2,000 moving markers
Quiz focus:
- Location updates arrive every 4 seconds. How does the map look smooth?
Done when: The rider moves smoothly and the map stays responsive.

Phase 46 milestone: 8–10 questions across Phase 46, including: design Swiggy's order flow from placing an order to delivery.

## Phase 47: Ride matching
Matching riders with drivers in seconds, with locations streaming in from a hundred thousand phones.

### 47.1 Geo-indexing
Goal: Find nearby drivers fast, at city scale.
Build:
- Driver positions indexed with H3 cells in `apps/rides`
- Nearby search over neighbouring cells
- A comparison with Redis GEO
Understand:
- Geohash vs H3
- Why searching only one cell misses drivers at the boundary
- Choosing a cell size
Break it:
- Search one cell only, with a driver just across the boundary
Quiz focus:
- Why search neighbouring cells, not just the rider's cell?
Done when: Nearby search is fast and never misses boundary drivers.

### 47.2 Matching
Goal: A ride request is matched to one driver within seconds.
Build:
- Candidate selection by distance and rating
- Offers with timeouts
- Locking a driver while an offer is open
Understand:
- Greedy nearest-driver vs batch matching
- Fairness to drivers
- Why matching is a contention problem
Break it:
- Have two riders request the same nearby driver at once
Quiz focus:
- Why might matching in small batches beat matching each request instantly?
Done when: No driver ever gets two trips at once.

### 47.3 Quotes and surge pricing
Goal: Riders see a price that holds, and prices respond to demand.
Build:
- Fare quotes with an expiry
- Surge multipliers per cell from supply and demand
- Honouring the quoted price at confirmation
Understand:
- Locking a price with a quote
- Computing surge without it flapping every second
- Price changes between viewing and confirming
Break it:
- Confirm a ride after the quote expired
- Let surge change between quote and confirm
Quiz focus:
- The rider saw ₹180 but surge rose before they tapped confirm. What do they pay?
Done when: Every charged price matches a valid quote.

### 47.4 Location firehose
Goal: Location updates from 100,000 drivers every few seconds, handled cheaply.
Build:
- Batched ingestion of driver locations
- Updates partitioned by cell
- Stale updates dropped
- Back-of-envelope throughput maths written in LOG.md
Understand:
- Estimating writes per second from user numbers
- Why the hot path stays in memory
- What to keep for history and what to throw away
Break it:
- Simulate 100,000 drivers and find the first bottleneck
Quiz focus:
- Do the maths: 100,000 drivers every 4 seconds. What does that mean for your design?
Done when: You can defend your design with numbers.

### 47.5 Disconnects mid-trip
Goal: Trips stay correct when phones lose signal.
Build:
- An offline queue in the driver client for trip events
- Idempotent trip events with sequence numbers
- Reconciling the trip on reconnect
Understand:
- Offline-first clients
- Ordering and deduplicating late events
- Which side is the source of truth
Break it:
- Go offline at pickup and come back after drop-off
Quiz focus:
- The driver's phone was offline for the whole trip. How do you still bill correctly?
Done when: Offline periods never corrupt a trip.

### 47.6 Offline-first driver app
Goal: The driver app works as a PWA that keeps working without signal.
Build:
- A service worker caching the app shell
- Trip events queued in IndexedDB while offline
- Background sync when the connection returns
Understand:
- Service worker lifecycle and update traps
- Offline storage options in the browser
Break it:
- Ship a new version and see users stuck on the old service worker
Quiz focus:
- How do you update a PWA without users getting stuck on an old version?
Done when: The app works offline and updates cleanly.

Phase 47 milestone: 8–10 questions across Phase 47, including: design Uber's matching for one city at peak.

## Phase 48: Collaborative editor
Several people typing in the same document at once, with nobody's work lost. The hardest problem in the tier.

### 48.1 Why naive saving fails
Goal: See exactly how concurrent edits get lost before fixing it.
Build:
- A plain text document in `apps/docs` saved as a whole on each change
- Two clients editing at once
Understand:
- Last-write-wins and lost work
- Why locking a whole document doesn't fit real collaboration
- Sending operations instead of snapshots
Break it:
- Type in two tabs at once and watch one person's edits vanish
Quiz focus:
- Why doesn't "save the whole document" work for collaboration?
Done when: You can show the lost-update problem live.

### 48.2 Operational transformation
Goal: A simple OT engine for text insertions and deletions.
Build:
- Insert and delete operations
- A server that orders operations and transforms them
- Clients that rebase their pending operations
Understand:
- What transforming an operation means
- Why OT needs a central server
- Where OT gets complicated
Break it:
- Delete a range while another user inserts inside it
Quiz focus:
- Two users insert at position 5 at once. What does OT do?
Done when: Concurrent edits converge to the same text for everyone.

### 48.3 CRDTs with Yjs
Goal: The editor rebuilt on a CRDT, and compared with your OT engine.
Build:
- Yjs documents synced over WebSockets
- Persisting updates and compacting them into snapshots
Understand:
- How CRDTs converge without a central order
- OT vs CRDT trade-offs
- Why CRDT history grows and needs compaction
Break it:
- Edit for an hour and measure the stored update size before and after compaction
Quiz focus:
- When would you choose a CRDT over OT?
Done when: You can explain why both approaches converge.

### 48.4 Cursors and offline editing
Goal: Users see each other's cursors, and offline edits merge on reconnect.
Build:
- Presence and cursor positions as ephemeral awareness data
- Offline editing with local persistence
- Merging on reconnect
Understand:
- Ephemeral vs persisted collaboration data
- Keeping cursors correct as text shifts
- What users expect after a long offline period
Break it:
- Edit offline in two tabs for ten minutes, then reconnect both
Quiz focus:
- Why are cursor positions not stored with the document?
Done when: Offline edits merge without losing anyone's work.

### 48.5 Scaling, permissions and history
Goal: Many documents across servers, with access control and version history.
Build:
- Routing every editor of a document to the same server
- Per-document permissions checked on connect and on every update
- Version history and restore
- Undo that only undoes your own changes
Understand:
- Why a document needs one home at a time
- Permission changes during a live session
- Per-user undo in a shared document
Break it:
- Remove someone's access while they're typing
- Restart the server hosting a busy document
Quiz focus:
- Someone loses edit access while connected. What should happen, immediately?
- Why should undo skip other people's changes?
Done when: Documents scale across servers and permissions apply live.

### 48.6 Editor UI
Goal: A collaborative editor interface with live cursors and clear sync status.
Build:
- An editor built on an editor framework bound to Yjs
- Remote cursors and selections
- Online, offline and syncing indicators
Understand:
- Why contenteditable is hard, and what editor frameworks solve
- Rendering remote cursors as text changes
Break it:
- Paste a huge document while two others are typing
Quiz focus:
- Why do most products use an editor framework instead of raw contenteditable?
Done when: Editing feels local even with several people in the document.

Phase 48 milestone: 8–10 questions across Phase 48, including: design Google Docs for 50 people editing one document.

## Tier 9 finish line
A 1 GB video uploads over a flaky connection, transcodes and plays adaptively. A simulated dinner peak and a 100,000-driver location stream both run with written throughput numbers. Three tabs editing one document offline and online converge with nothing lost. Run a 15-question quiz across Phases 45–48, and turn five LOG.md entries into interview stories, with one from each app plus your best design trade-off.
