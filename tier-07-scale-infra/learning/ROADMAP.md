# Roadmap: Tier 7, Scale and infrastructure

App: helpdesk-saas, a multi-tenant support-ticket product, split into services and run on AWS and Kubernetes.

## Phase 32: Multi-tenant SaaS
One app for the whole tier: `helpdesk-saas`, a support-ticket product used by many companies at once. Every phase after this one scales, splits, deploys, watches or secures it.

### 32.1 Tenancy model and tenant resolution
Goal: Many companies share one app, and every request knows which company it belongs to.
Build:
- Tenants, users, tickets and comments with a `tenant_id` on every tenant-owned table
- Tenant resolution from the subdomain, with a header fallback for local work
- A repository layer that requires a tenant on every query
Understand:
- Shared schema vs schema per tenant vs database per tenant
- Why one forgotten `WHERE tenant_id` is a data breach
- Composite indexes that start with `tenant_id`
Break it:
- Write one query without the tenant filter and read another company's tickets
- Send a request for one tenant with a token from another
Quiz focus:
- Which tenancy model would you choose for 5,000 small customers, and which for 5 banks?
- How do you make a missing tenant filter hard to write?
Done when: No code path can query tenant data without a tenant.

### 32.2 Row-level security
Goal: Postgres itself refuses to return another tenant's rows.
Build:
- RLS policies on every tenant table
- The tenant set per request with `SET LOCAL` inside a transaction
- A non-superuser app role, since superusers bypass RLS
Understand:
- Defence in depth: app filters plus database policies
- Why `SET` instead of `SET LOCAL` leaks across pooled connections
- RLS performance and how policies use indexes
Break it:
- Use `SET` instead of `SET LOCAL` and catch tenant B's request running as tenant A
- Connect as a superuser and watch RLS do nothing
Quiz focus:
- With a connection pool, how can one request inherit another tenant's setting?
- If you have RLS, do you still need tenant filters in queries?
Done when: Even a buggy query can't cross tenants.

### 32.3 Organizations, invitations and switching
Goal: People can belong to several companies and switch between them safely.
Build:
- Memberships with a role per organization
- Invitations with expiring, single-use tokens
- An active organization in the token, and an org switcher
Understand:
- Global identity vs per-tenant roles
- What switching organization does to existing tokens
- Invitation edge cases: existing user, wrong email, expired link
Break it:
- Switch organization in one tab while another tab keeps working with the old token
- Accept an invitation meant for a different email
Quiz focus:
- A user switches org in one tab. What should the other open tab do?
- Where does the active tenant live, and who is allowed to change it?
Done when: No stale tab or token can act in the wrong organization.

### 32.4 Plans, quotas and noisy neighbours
Goal: One heavy customer can't slow everyone else down.
Build:
- Plans with feature flags and limits
- Per-tenant rate limits and quotas
- Fair background job processing per tenant
Understand:
- The noisy neighbour problem
- Feature flags by plan vs by rollout
- Fair queueing so one tenant can't fill every worker
Break it:
- Have one tenant enqueue 100,000 jobs and measure everyone else's wait
- Exceed a quota and check the error the client gets
Quiz focus:
- One customer imports a million tickets and everyone's app slows. What do you change?
- How should a client react to a quota error vs a rate limit error?
Done when: A flood from one tenant barely moves other tenants' latency.

### 32.5 Tenant lifecycle
Goal: Companies can sign up, export their data and be deleted cleanly.
Build:
- Onboarding that provisions a tenant
- A full data export as a background job
- Tenant deletion in batches, with a grace period
Understand:
- Data protection duties under India's DPDP Act and GDPR, at a high level
- Why one giant cascading delete is dangerous
- Restoring a single tenant from backup
Break it:
- Delete a large tenant with one cascading DELETE and watch locks and replication
Quiz focus:
- How do you delete a tenant with 50 million rows without hurting others?
- A customer wants their data back from last Tuesday. Can you do it?
Done when: Tenants can leave completely without affecting anyone else.

### 32.6 Multi-tenant admin UI
Goal: An admin app that's safe across organizations and consistent in design.
Build:
- An organization switcher that keeps tabs consistent
- UI gated by plan features
- A small design system: buttons, inputs, modal with focus trap, table
Understand:
- Design system component APIs
- Focus management in modals
- Why feature gating in the UI is UX, not security
Break it:
- Switch organization in one tab with a form half-filled in another
Quiz focus:
- How would you design the API of a reusable modal component?
Done when: The UI never shows one organization's data under another's name.

Phase 32 milestone: 8–10 questions across Phase 32, including: design the data model and isolation for a SaaS used by 10,000 companies.

## Phase 33: Microservices
Splitting the helpdesk into services, then dealing with everything that splitting creates: network failures, distributed workflows and versioning.

### 33.1 Boundaries and data ownership
Goal: The app becomes a modular monolith first, then a few real services.
Build:
- Modules with explicit interfaces inside the monolith
- Identity and notifications split into separate services with their own databases
- No service reading another service's tables
Understand:
- Why a modular monolith comes first
- How to find boundaries: business capabilities and data ownership
- The shared-database anti-pattern
Break it:
- Let the tickets service read the identity database directly, then change an identity column
Quiz focus:
- When would you not split a monolith?
- Why must each service own its data?
Done when: Each service can change its schema without breaking the others.

### 33.2 Calls between services
Goal: Service-to-service calls fail gracefully instead of cascading.
Build:
- Internal calls over HTTP or gRPC
- Timeouts on every call
- Retries with backoff and jitter, only for safe operations
- A circuit breaker around the identity service
Understand:
- Why a missing timeout can take down every service
- Retry storms and why jitter matters
- Circuit breaker states
Break it:
- Make identity respond in 30 seconds and watch tickets with and without timeouts
- Retry without jitter during an outage
Quiz focus:
- One slow service brought the whole system down. Explain how, and what stops it.
- Which calls are safe to retry?
Done when: A dead dependency degrades one feature, not the whole product.

### 33.3 API gateway and BFF
Goal: Clients talk to one entry point that handles auth, routing and aggregation.
Build:
- A gateway that verifies tokens and routes to services
- A backend-for-frontend endpoint that aggregates several services for one screen
- Correlation IDs passed through every hop
Understand:
- Gateway vs BFF
- Auth at the edge vs in every service
- Why aggregation saves the client from request waterfalls
Break it:
- Drop the correlation ID at one hop and try to trace a failed request
Quiz focus:
- Should services trust the gateway's auth check, or verify again?
- Why would a mobile app want its own BFF?
Done when: One ID follows a request through every service.

### 33.4 Sagas
Goal: A workflow across services completes or cleans up after itself.
Build:
- Tenant signup as a saga: create org, set up billing, provision defaults
- Compensating actions for each step
- An orchestrator, then the same flow as choreography to compare
Understand:
- Why distributed transactions are avoided
- Orchestration vs choreography
- Compensations that are themselves idempotent
Break it:
- Fail the billing step after the org was created
- Crash the orchestrator mid-saga
Quiz focus:
- How do you undo step one when step three fails?
- Orchestration or choreography for signup? Defend it.
Done when: Every failure point ends fully done or fully undone.

### 33.5 Contracts and safe deploys
Goal: Services deploy independently without breaking each other.
Build:
- Versioned API and event schemas
- Consumer-driven contract tests in CI
- Backward-compatible changes deployed in the right order
Understand:
- Why deploy order matters between services
- Expand and contract for APIs and events
- Contract tests vs end-to-end tests
Break it:
- Deploy a provider change before its consumers are ready
Quiz focus:
- You need to rename a field used by three services. Walk through the deploys.
Done when: Any service can deploy alone without a coordinated release.

Phase 33 milestone: 8–10 questions across Phase 33, including: the interviewer says "let's split this into microservices." What do you ask first?

## Phase 34: Database scaling
Pooling, replicas, partitioning, sharding and schema changes on a live system with real traffic.

### 34.1 Connection pooling with PgBouncer
Goal: Many app instances share a small number of real database connections.
Build:
- PgBouncer in transaction mode in front of Postgres
- Pool sizes set from measured load
Understand:
- Why each Postgres connection is expensive
- Session vs transaction pooling
- What breaks in transaction mode: session settings, some prepared statements, advisory locks
Break it:
- Scale to 30 app instances without PgBouncer and hit the connection limit
- Use a session-level setting through transaction pooling
Quiz focus:
- Your app scaled out and Postgres started refusing connections. Why, and what fixes it?
- Name two things that stop working in transaction pooling mode.
Done when: Scaling app instances no longer scales database connections.

### 34.2 Read replicas
Goal: Reads move to replicas without users seeing stale data where it matters.
Build:
- A streaming replica in Compose
- Read routing for safe queries
- Read-your-writes for the user who just saved
Understand:
- Replication lag and where it bites
- Read-your-writes strategies
- Which queries must always go to the primary
Break it:
- Add artificial lag, edit a ticket, then reload and see the old version
Quiz focus:
- A user saves and the page shows the old data. Explain and fix it.
Done when: Replicas take read load and no user sees their own write disappear.

### 34.3 Partitioning
Goal: Large tables are partitioned by time and old data is cheap to drop.
Build:
- Time-partitioned ticket events
- Automatic creation of future partitions
- Dropping old partitions instead of deleting rows
Understand:
- Partition pruning
- DROP partition vs DELETE
- Choosing a partition key
Break it:
- Query without the partition key and see every partition scanned
- Insert into a month with no partition
Quiz focus:
- Why is dropping a partition so much cheaper than DELETE?
Done when: Old data leaves in milliseconds, not hours.

### 34.4 Sharding by tenant
Goal: Tenants spread across several databases, with routing handled in one place.
Build:
- Two Postgres shards and a tenant-to-shard directory
- Routing in the repository layer
- Moving one tenant between shards
Understand:
- Shard keys and why tenant id fits a SaaS
- Cross-shard queries and reports
- Hot tenants and resharding
Break it:
- Run a report across all tenants
- Move a tenant while it's receiving writes
Quiz focus:
- When do you shard, and what do you give up?
- One enormous tenant is overloading its shard. Options?
Done when: You can move a tenant between shards with no data loss.

### 34.5 Zero-downtime migrations
Goal: Schema changes ship while traffic keeps flowing.
Build:
- Expand and contract migrations
- Indexes created `CONCURRENTLY`
- Batched backfills
- `lock_timeout` on migrations
Understand:
- How a waiting ALTER TABLE blocks every query behind it
- Which changes rewrite a table
- Ordering code deploys and migrations
Break it:
- Run an ALTER behind a long transaction and watch the app freeze
- Create an index without CONCURRENTLY under load
Quiz focus:
- A two-second migration caused a ten-minute outage. How?
- Walk through renaming a column with zero downtime.
Done when: You can ship any common schema change without downtime.

Phase 34 milestone: 8–10 questions across Phase 34, including: the database is the bottleneck at 10x traffic. Walk through your options in order.

## Phase 35: AWS and Terraform
Running the helpdesk on AWS in Mumbai (ap-south-1), with all infrastructure written as Terraform code. Set a budget alarm before anything else.

### 35.1 Account safety and IAM
Goal: An AWS account that can't surprise you with a bill or a breach.
Build:
- Root account locked with MFA and unused
- An admin user or SSO with MFA
- A budget alarm with email alerts
Understand:
- IAM users, roles and policies
- Least privilege
- What happens when access keys leak to GitHub
Break it:
- Write an over-broad policy, then use the IAM policy simulator to see what it allows
Quiz focus:
- Why use roles instead of long-lived access keys?
- Your key was pushed to a public repo. What do you do in the first 10 minutes?
Done when: Billing alerts are on and no long-lived keys exist.

### 35.2 Terraform foundations
Goal: All infrastructure comes from code, with shared state that can't be corrupted.
Build:
- Terraform with remote state in S3 and state locking
- Modules and separate environments
- A plan in CI on every pull request
Understand:
- What state is and why it must be shared and locked
- Plan vs apply
- Drift when someone clicks in the console
Break it:
- Change a resource in the console and run plan
- Run two applies at once without locking
Quiz focus:
- Why must Terraform state be locked?
- Someone edited a security group by hand. What happens next apply?
Done when: Every resource is in code and plan shows no drift.

### 35.3 Networking
Goal: A VPC where only the load balancer faces the internet.
Build:
- A VPC with public and private subnets across two availability zones
- Security groups that only allow what's needed
- Outbound access for private subnets, with its cost understood
Understand:
- Public vs private subnets
- Security groups vs network ACLs
- Why NAT gateways can quietly cost a lot
Break it:
- Put the database in a public subnet and see what's exposed
- Remove a security group rule and trace the timeout
Quiz focus:
- Trace a request from the internet to your container and then to RDS.
- Why is the connection timing out instead of being refused?
Done when: Only the load balancer is reachable from the internet.

### 35.4 Managed services and ECS
Goal: The app runs on Fargate with RDS, ElastiCache and S3.
Build:
- RDS Postgres, ElastiCache Redis and S3
- Secrets from Secrets Manager or SSM
- The services on ECS Fargate behind an Application Load Balancer
Understand:
- Managed vs self-hosted trade-offs
- How containers get secrets without baking them in
- Health checks at the load balancer
Break it:
- Fail the health check path and watch tasks cycle
- Remove the task role's permission to read a secret
Quiz focus:
- Where should database passwords live, and how does the app get them?
Done when: The helpdesk is live on AWS from a fresh `terraform apply`.

### 35.5 Deploys and teardown
Goal: Merges deploy automatically, and failed deploys roll back.
Build:
- GitHub Actions authenticating to AWS with OIDC, no stored keys
- Images pushed to ECR and deployed
- Automatic rollback on failed health checks
- A teardown that removes everything
Understand:
- OIDC federation vs access keys in CI
- Rolling vs blue-green deploys
- Keeping the learning account cheap
Break it:
- Deploy an image that fails health checks
- Run teardown and confirm nothing billable remains
Quiz focus:
- How does GitHub Actions deploy without any AWS keys stored?
Done when: Deploys are automatic, rollbacks work, and teardown is clean.

### 35.6 Serverless functions
Goal: A webhook handler moved to AWS Lambda, with its limits understood.
Build:
- A Lambda function behind API Gateway for incoming webhooks
- Connection handling to RDS through RDS Proxy
- Concurrency limits and dead-letter queues
Understand:
- Cold starts and what affects them
- Why serverless functions exhaust database connections
- Pay-per-request vs always-on cost
Break it:
- Send 1,000 webhooks at once without RDS Proxy
- Measure cold-start latency
Quiz focus:
- When is serverless the wrong choice?
- Why do Lambdas and relational databases clash?
Done when: You can say when you'd choose Lambda and when you wouldn't, with numbers.

### 35.7 Edge functions
Goal: Logic running at the CDN edge for speed, with its limits understood.
Build:
- An edge function for geo-based routing and redirects
- Lightweight auth checks at the edge
- Cached responses varied by the right headers
Understand:
- What edge runtimes can and can't do
- Edge vs region vs origin
- Caching keys and `Vary`
Break it:
- Call the database from an edge function in another region and measure
Quiz focus:
- What belongs at the edge, and what doesn't?
Done when: You can place each piece of logic at the edge, region or origin and explain why.

Phase 35 milestone: 8–10 questions across Phase 35, including: design the AWS setup for this SaaS for 99.9% availability.

## Phase 36: Kubernetes
The same services on Kubernetes, locally first with kind, with every deploy and scaling behaviour understood.

### 36.1 Pods, deployments and services
Goal: The helpdesk runs on a local kind cluster.
Build:
- A kind cluster
- Deployments and Services for each service
- Postgres and Redis for local use
Understand:
- Pods vs deployments vs services
- How service discovery works with DNS
- Why `localhost` inside a container isn't your machine
Break it:
- Point a service at `localhost:5432`
- Delete a pod and watch it come back
Quiz focus:
- What does a Kubernetes Service give you that a pod IP doesn't?
Done when: Every service is reachable by name inside the cluster.

### 36.2 Config, secrets and probes
Goal: Pods get configuration safely and Kubernetes knows when they're healthy.
Build:
- ConfigMaps and Secrets
- Liveness, readiness and startup probes for each service
Understand:
- Liveness vs readiness vs startup
- Why a liveness probe that checks the database causes restart storms
- Kubernetes Secrets aren't encrypted by default
Break it:
- Make liveness depend on Postgres, then stop Postgres
- Set a startup probe too short for a slow boot
Quiz focus:
- The database blipped and every pod restarted. Why?
- What should a readiness probe check?
Done when: A database blip removes pods from traffic without restarting them.

### 36.3 Rolling updates without errors
Goal: Deploys finish with zero failed requests.
Build:
- Rolling update settings
- SIGTERM handling and a preStop delay
- Connection draining
Understand:
- What happens between a pod being told to stop and it leaving the Service
- Why requests fail during naive deploys
- maxSurge and maxUnavailable
Break it:
- Deploy under load without preStop and count failed requests
Quiz focus:
- Why do some requests fail during a rolling deploy, and how do you get to zero?
Done when: A load test shows zero errors during a deploy.

### 36.4 Resources and autoscaling
Goal: Pods have sensible limits and scale with load.
Build:
- CPU and memory requests and limits
- A Horizontal Pod Autoscaler
- Node.js heap size set to match the memory limit
Understand:
- Requests vs limits
- OOMKilled and CPU throttling
- Why Node needs `--max-old-space-size` in containers
Break it:
- Set the memory limit below what the app needs and watch OOMKilled
- Load test and watch the autoscaler react
Quiz focus:
- Pods keep getting OOMKilled but heap usage looks fine. What do you check?
- Why does a CPU limit make latency spiky?
Done when: The cluster scales under load without OOM kills.

### 36.5 Ingress, CronJobs and Helm
Goal: The whole stack installs with one Helm command.
Build:
- An ingress controller with TLS via cert-manager
- A Kubernetes CronJob for a nightly task
- A Helm chart with values per environment
Understand:
- Ingress vs LoadBalancer services
- CronJob concurrency policies and how they compare to your Tier 6 scheduler
- What Helm templating gives you
Break it:
- Make the CronJob overrun its schedule with concurrency allowed
Quiz focus:
- When would you use a CronJob instead of a scheduler service?
- What would change running this on EKS?
Done when: One command installs the full stack on a fresh cluster.

Phase 36 milestone: 8–10 questions across Phase 36, including: walk through everything that happens from `git push` to a new pod serving traffic.

## Phase 37: Observability and reliability
Seeing what the system is doing, deciding what "working" means, and proving it survives failure.

### 37.1 Structured logs
Goal: Logs are searchable, linked across services and free of secrets.
Build:
- JSON logs with request, trace and tenant ids
- Log levels used consistently
- Redaction for tokens, passwords and personal data
Understand:
- Why structured logs beat text
- What should never be logged
- Log volume and cost
Break it:
- Log a full request body and find the password in it
Quiz focus:
- Which fields belong on every log line?
- How do you find every log for one failed request across five services?
Done when: One query returns a request's full story, with no secrets in it.

### 37.2 Metrics and dashboards
Goal: Rate, errors and duration for every service on a dashboard.
Build:
- Prometheus metrics: request rate, errors and latency histograms
- Grafana dashboards per service
- Event loop lag and pool usage metrics
Understand:
- Histograms vs averages
- Label cardinality, and why user id as a label is a disaster
- RED and USE methods
Break it:
- Add `tenant_id` and `user_id` as labels and watch Prometheus memory
Quiz focus:
- Why can't you compute p99 from averages?
- Which labels are safe on a metric?
Done when: You can tell from the dashboard which service is unhealthy.

### 37.3 Distributed tracing
Goal: Any slow request can be traced through every service and query.
Build:
- OpenTelemetry in the gateway and every service
- Database and Redis spans
- Traces viewed in Jaeger or Tempo
Understand:
- Traces, spans and context propagation
- Sampling and its trade-offs
Break it:
- Add a slow query deep in one service and find it from the trace alone
Quiz focus:
- A request takes 3 seconds. How do you find which hop is slow?
Done when: Every slow request leads to the exact span responsible.

### 37.4 SLOs and alerts
Goal: Alerts fire for user pain, not for noise.
Build:
- SLIs and SLOs for ticket creation and the inbox view
- Error budget tracking
- Alerts on burn rate
Understand:
- SLI vs SLO vs SLA
- Alert on symptoms, not causes
- Alert fatigue
Break it:
- Alert on CPU over 80% and count false alarms during a load test
Quiz focus:
- Why alert on error budget burn instead of on individual errors?
Done when: Every alert means users are actually affected.

### 37.5 Resilience and chaos
Goal: The system survives the failures you deliberately cause, and you write it up properly.
Build:
- Load shedding when overloaded
- Bulkheads that isolate resources per dependency
- Chaos experiments: killed pods, added latency, a dead dependency
- A postmortem for one experiment
Understand:
- Graceful degradation
- Load shedding vs queueing
- Blameless postmortems
Break it:
- Add 2 seconds of latency to Redis and see what degrades
Quiz focus:
- Your system is at 200% capacity. What should it do?
- What goes in a good postmortem?
Done when: You have a written postmortem from a failure you caused and fixed.

### 37.6 Frontend observability
Goal: You can see what real users experience in the browser.
Build:
- Error tracking with source maps
- Real-user monitoring of Core Web Vitals
- Frontend traces linked to backend traces
Understand:
- Why lab scores differ from real users
- Source maps and keeping them private
Break it:
- Throw an error in production code and find it from a minified stack trace
Quiz focus:
- Users report slowness you can't reproduce. How do you investigate?
Done when: Frontend errors arrive with readable stack traces and linked backend traces.

Phase 37 milestone: 8–10 questions across Phase 37, including: you're on call and the error rate just doubled. Walk through your first 15 minutes.

## Phase 38: Security hardening
Attacking your own system the way a real attacker would, then closing every gap. Track X goes deeper on each of these areas.

### 38.1 OWASP API Top 10
Goal: The helpdesk is checked against the most common API attacks.
Build:
- A review of every endpoint for broken object-level authorization across tenants
- Mass assignment checks
- SSRF protection on customer-supplied webhook URLs
Understand:
- BOLA, the most common API bug
- SSRF, and why cloud metadata endpoints make it dangerous
- Allow-lists vs block-lists for outbound URLs
Break it:
- Register a webhook pointing at `169.254.169.254` and see what your server fetches
Quiz focus:
- What is SSRF, and how could a webhook URL leak your cloud credentials?
- How would you find BOLA bugs across 80 endpoints?
Done when: Every endpoint is reviewed and the SSRF hole is closed.

### 38.2 Secrets and supply chain
Goal: No secrets in code and no surprise dependencies.
Build:
- Secret scanning in CI
- Dependency audits and pinned versions
- Pinned base images and an SBOM
Understand:
- Why deleting a committed secret isn't enough
- Dependency risk and lockfiles
- What an SBOM is for
Break it:
- Commit a fake secret, delete it in the next commit, then find it in history
Quiz focus:
- A secret was committed six months ago. What do you do?
Done when: CI blocks secrets and known-vulnerable dependencies.

### 38.3 Browser-facing security
Goal: Customer-written ticket content can't attack other users.
Build:
- Sanitized rendering of rich-text ticket content
- Content Security Policy, HSTS and other headers
- Safe handling of uploaded attachments
Understand:
- Stored XSS through user content
- What CSP blocks and what it doesn't
- Why attachments are served from a separate domain
Break it:
- Put a script in a ticket comment and view it as an agent
Quiz focus:
- A customer can run JavaScript in your agents' browsers. What can they steal, and how do you stop it?
Done when: Malicious ticket content is inert.

### 38.4 Encryption, audit and compliance
Goal: Sensitive data is protected and every access to it is recorded.
Build:
- Encryption in transit and at rest
- Field-level encryption for sensitive personal data
- Per-tenant audit logs
- Key rotation
Understand:
- Encryption at rest vs field-level
- Envelope encryption and key management
- What auditors and enterprise customers ask for
Break it:
- Rotate a key and confirm old data still decrypts
Quiz focus:
- Why encrypt a field when the disk is already encrypted?
Done when: Keys rotate without downtime and every sensitive read is logged.

### 38.5 Threat model and pen test
Goal: A written threat model and a scan of the running system, with findings fixed.
Build:
- A STRIDE threat model for the helpdesk
- An OWASP ZAP scan against the staging environment
- Fixes for every high finding
Understand:
- Thinking like an attacker, system by system
- Prioritising findings by risk
Break it:
- Run the scan before and after fixes and compare
Quiz focus:
- Walk through the top three threats to this SaaS and your mitigations.
Done when: No high-severity findings remain.

Phase 38 milestone: 8–10 questions across Phase 38, including: an enterprise customer sends a 200-question security questionnaire. Which answers are you proudest of?

## Tier 7 finish line
helpdesk-saas runs as services on Kubernetes and has been deployed to AWS from Terraform, then torn down cleanly. A cross-tenant access attempt fails at both the app and the database. A deploy under load has zero errors, an injected failure is caught by alerts and traced to its cause, and the security scan has no high findings. Run a 15-question quiz across Phases 32–38, draw the full architecture, and turn five LOG.md entries into interview stories, including one postmortem.
