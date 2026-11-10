# Roadmap: Track S, System design drills

Repo: system-design-drills. Start after Tier 2; one drill every week or two, alongside the tiers.

## Phase S1: Method
A repeatable way to run any design interview.

### S1.1 The framework
Goal: Drive a design interview in a clear order.
Build:
- A one-page template: requirements, estimates, API, data model, high-level design, deep dives, trade-offs
Understand:
- What interviewers listen for at each step
- Clarifying questions that change the design
Break it:
- Skip requirements in one drill and see how the design goes wrong
Quiz focus:
- What do you ask in the first five minutes?
Done when: You use the framework without looking at it.

### S1.2 Estimation
Goal: Back-of-envelope numbers you can do in your head.
Build:
- Latency and throughput numbers to memorise
- Five estimation drills
Understand:
- QPS from daily users
- Storage over five years
- Bandwidth
Break it:
- Estimate, then compare with a real system's published numbers
Quiz focus:
- Estimate storage for a photo app with 10 million daily users.
Done when: Your estimates land within an order of magnitude.

Phase S1 milestone: A full drill using the framework.

## Phase S2: Classic backend designs
Common interview questions, including ones you haven't built.

### S2.1 URL shortener and pastebin
Goal: Read-heavy design with ID generation.
Build:
- A full timed drill
Understand:
- ID generation options
- Caching hot links
- Analytics on clicks
Break it:
- Defend your ID scheme against collisions and enumeration
Quiz focus:
- How do you generate short IDs across many servers?
Done when: You can design it in 30 minutes.

### S2.2 Web crawler
Goal: Distributed crawling with politeness.
Build:
- A full timed drill
Understand:
- Frontier queues
- Politeness per domain
- Deduplication
Break it:
- Handle a site that generates infinite URLs
Quiz focus:
- How do you stop a crawler getting trapped?
Done when: Your design handles traps and politeness.

### S2.3 Distributed cache and CDN
Goal: Caching at global scale.
Build:
- A full timed drill
Understand:
- Consistent hashing
- Eviction
- Cache invalidation across regions
Break it:
- Remove a cache node and explain what moves
Quiz focus:
- Why consistent hashing?
Done when: You can explain consistent hashing with a drawing.

### S2.4 Typeahead
Goal: Autocomplete for a large search product.
Build:
- A full timed drill
Understand:
- Tries vs precomputed prefixes
- Ranking suggestions
- Latency budget
Break it:
- Handle trending queries appearing suddenly
Quiz focus:
- How do suggestions stay fresh?
Done when: Your design meets a 100 ms budget.

### S2.5 Payment system
Goal: Payments at scale, building on your wallet work.
Build:
- A full timed drill
Understand:
- Idempotency, ledgers and reconciliation at scale
- External provider failures
Break it:
- Handle the provider being down for an hour
Quiz focus:
- How do you guarantee a customer is never charged twice?
Done when: Your design is safe under every failure you can name.

### S2.6 File sync
Goal: Dropbox or Google Drive style sync.
Build:
- A full timed drill
Understand:
- Chunking and deduplication
- Conflict handling
- Metadata vs blob storage
Break it:
- Edit the same file offline on two devices
Quiz focus:
- How do you sync a 10 GB file that changed by 1 MB?
Done when: Your design handles conflicts and large files.

Phase S2 milestone: Two back-to-back timed drills.

## Phase S3: Frontend system design
The design round frontend and full-stack roles increasingly include.

### S3.1 Autocomplete component
Goal: Design a reusable autocomplete for many teams.
Build:
- A full timed drill
Understand:
- Component API
- Caching and request handling
- Accessibility
Break it:
- Defend your API against three different use cases
Quiz focus:
- How do you make it work for both local and remote data?
Done when: Your design covers API, performance and accessibility.

### S3.2 News feed client
Goal: Design a feed client for web.
Build:
- A full timed drill
Understand:
- Pagination
- Normalised client state
- Optimistic interactions
- Virtualisation
Break it:
- Handle a post being edited while it's on screen
Quiz focus:
- How do you keep a liked count consistent across the feed?
Done when: You cover data, rendering and performance.

### S3.3 Collaborative editor or chat client
Goal: Design a real-time client.
Build:
- A full timed drill
Understand:
- Connection handling
- Offline support
- State reconciliation
Break it:
- Handle the server rejecting an optimistic change
Quiz focus:
- How does the client recover after being offline?
Done when: Your design handles offline and conflicts.

Phase S3 milestone: One frontend design mock.

## Phase S4: Mock interviews
Full mocks with interruptions and scoring.

### S4.1 Timed mocks
Goal: Run full 45-minute mocks with `/mock design`.
Build:
- Weekly mocks on unseen problems, scored on a rubric
Understand:
- Managing time
- Handling interviewer pushback
Break it:
- Do one mock where the interviewer changes a requirement halfway
Quiz focus:
- How do you respond when the interviewer disagrees with your choice?
Done when: Three mocks passed in a row.

Phase S4 milestone: Three passed mocks in a row.

## Track S finish line
You can run a 45-minute design interview from requirements to trade-offs without prompting, and pass three mocks in a row.
