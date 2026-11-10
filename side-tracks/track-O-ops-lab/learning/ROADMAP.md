# Roadmap: Track O, Deployment and operations

Repo: ops-lab. Start right after Tier 2 with O1–O3, deploying the shop properly. Do O4–O5 alongside Tier 5, and O6–O7 once Tier 7’s AWS and Kubernetes phases are done.

## Phase O1: Linux servers
A bare VPS turned into a safe, well-run production host.

### O1.1 Hardening a fresh server
Goal: A new VPS that's locked down before anything runs on it.
Build:
- A non-root user with sudo and SSH key login only
- Password and root login disabled
- A firewall allowing only SSH, HTTP and HTTPS
- fail2ban and automatic security updates
Understand:
- Why SSH keys beat passwords
- Least exposure: closing every port you don't need
- What automatic updates should and shouldn't touch
Break it:
- Leave password login on for an hour and read the auth log
Quiz focus:
- What are the first five things you do on a new server?
Done when: Only your key can log in, and only three ports are open.

### O1.2 Running services
Goal: Apps that start on boot, restart on failure and log properly.
Build:
- The app as a systemd service, then compared with PM2
- Environment files and secrets with correct permissions
- Logs read with journalctl
Understand:
- systemd units and restart policies
- PM2 vs systemd vs containers
Break it:
- Kill the app process and watch it come back
- Reboot the server and check everything starts
Quiz focus:
- How do you make a Node app survive crashes and reboots?
Done when: The server recovers from crashes and reboots without you.

### O1.3 Disk, logs and resources
Goal: The server doesn't fall over from slow, boring causes.
Build:
- Log rotation with logrotate
- Disk, memory and inode monitoring
- Swap and the OOM killer configured deliberately
Understand:
- How a full disk takes down services
- Running out of inodes with free space left
Break it:
- Fill the disk with logs and watch what breaks
Quiz focus:
- The site is down and the disk is full. What do you do?
Done when: Logs rotate and you're alerted before the disk fills.

Phase O1 milestone: Rebuild the server from scratch using only your notes and scripts, timed.

## Phase O2: Nginx in depth
Beyond a basic reverse proxy: routing, load balancing, caching, rate limiting and debugging.

### O2.1 Configuration fundamentals
Goal: Read and write Nginx config confidently.
Build:
- Server blocks for several sites on one server
- Location blocks with exact, prefix and regex matches
- Static files with try_files, gzip and long cache headers
Understand:
- How Nginx picks a server block and a location
- Why location order surprises people
Break it:
- Write overlapping locations and predict which one wins before testing
Quiz focus:
- How does Nginx choose between a prefix and a regex location?
Done when: You can predict which block handles any request.

### O2.2 Proxying and load balancing
Goal: Spread traffic across app instances and handle failures.
Build:
- Upstreams with round-robin, least connections and IP hash
- Passive health checks and failover
- Correct proxy headers, timeouts and buffering
- WebSocket proxying
Understand:
- Load-balancing algorithms and when each fits
- Why the app needs X-Forwarded-For and X-Forwarded-Proto
- Proxy buffering and when to turn it off
Break it:
- Kill one of three app instances under load
- Forget to forward the protocol header and break redirects
Quiz focus:
- How does Nginx handle a failed upstream?
- Why did your app start redirecting HTTPS users to HTTP?
Done when: Losing an app instance causes no user-visible errors.

### O2.3 Caching and rate limiting
Goal: Take load off the app at the proxy.
Build:
- Proxy caching, including one-second micro-caching for hot pages
- Cache keys and bypass for logged-in users
- Rate limiting with limit_req and limit_conn
Understand:
- What's safe to cache at the proxy
- Burst handling in Nginx rate limits
- Proxy limits vs app-level limits
Break it:
- Cache a logged-in page by mistake and serve it to another user
- Flood an endpoint and watch the limiter respond
Quiz focus:
- How could proxy caching leak one user's data to another?
Done when: Hot pages are cached safely and abuse is throttled at the edge.

### O2.4 TLS and security headers
Goal: HTTPS done properly.
Build:
- Certificate renewal tested with certbot
- HTTP to HTTPS redirects, HTTP/2, HSTS and modern TLS settings
- Security headers set at the proxy
Understand:
- Certificate renewal and what happens when it fails
- HSTS and why it's hard to undo
Break it:
- Break renewal and see how close to expiry you'd notice
Quiz focus:
- What does HSTS do, and what's the risk of setting it carelessly?
Done when: Your site scores well on an SSL test and renewals are monitored.

### O2.5 Logs and debugging
Goal: Diagnose problems from Nginx alone.
Build:
- A log format with request time, upstream time and upstream address
- Log analysis for slow requests and error spikes
Understand:
- 502 vs 503 vs 504, and what each means at the proxy
- Request time vs upstream time
Break it:
- Make the app slow, then make it crash, and identify each from the logs
Quiz focus:
- How do you tell whether slowness is in Nginx or the app?
Done when: You can explain any 5xx from the logs.

Phase O2 milestone: 8–10 questions across Phase O2, including: users get intermittent 504s. Walk through it using Nginx logs.

## Phase O3: Domains, DNS, CDN and email
Everything between a user typing your domain and reaching your server, plus emails that actually arrive.

### O3.1 Domains and DNS
Goal: Your own domain pointing where it should.
Build:
- A domain with A, AAAA, CNAME and TXT records
- DNS managed through Cloudflare or Route 53
- A server migration done with lowered TTLs
Understand:
- Registrar vs DNS provider
- CNAME at the root and how ALIAS records solve it
- TTL strategy before a migration
Break it:
- Change an IP with a 24-hour TTL and watch stale answers
Quiz focus:
- How do you move a site to a new server without downtime?
Done when: DNS changes are planned, not hoped for.

### O3.2 CDN
Goal: A CDN in front of the site, configured deliberately.
Build:
- Cloudflare or CloudFront in front of the app
- Cache rules for static assets vs dynamic pages
- Cache purging on deploy
- Origin protected so traffic can't bypass the CDN
Understand:
- What a CDN caches and how it decides
- Cache keys and cookies
- Why the origin should only accept CDN traffic
Break it:
- Deploy new CSS without busting caches and see users get the old version
Quiz focus:
- Users see an old version after a deploy. Why, and how do you prevent it?
Done when: Static assets come from the edge and deploys never serve stale files.

### O3.3 Email deliverability
Goal: Order emails that land in the inbox.
Build:
- A transactional email provider set up for your domain
- SPF, DKIM and DMARC records
- Deliverability testing
Understand:
- What each record proves
- Why new domains land in spam
Break it:
- Send from your domain without SPF and DKIM and check where it lands
Quiz focus:
- Your order emails go to spam. What do you check?
Done when: Your emails pass SPF, DKIM and DMARC.

Phase O3 milestone: 8–10 questions across Phase O3, including: move a live site to a new server with no downtime.

## Phase O4: Deployment strategies
Shipping without downtime, and undoing a bad release in seconds.

### O4.1 Zero-downtime on one server
Goal: Deploys that users never notice.
Build:
- Two app instances behind Nginx, updated one at a time
- Readiness checks before traffic switches
Understand:
- Rolling updates
- Why connection draining matters
Break it:
- Deploy under a load test and count failed requests
Quiz focus:
- How do you deploy to one server with zero downtime?
Done when: A load test shows zero errors during deploys.

### O4.2 Blue-green
Goal: Switch between two full environments instantly.
Build:
- Blue and green environments with a traffic switch
- One-step rollback
Understand:
- Blue-green vs rolling
- Database changes that work with both versions
Break it:
- Deploy a version that needs a schema the old version can't use, and see rollback break
Quiz focus:
- Why do database migrations make rollbacks hard?
Done when: Rollback takes one command and works.

### O4.3 Canary releases
Goal: Release to a few users first, decided by metrics.
Build:
- Weighted traffic to a canary
- Automatic rollback when error rate or latency crosses a threshold
Understand:
- Choosing canary metrics
- How long a canary should run
Break it:
- Release a version with a subtle error rate increase
Quiz focus:
- What metrics would make you roll back a canary?
Done when: A bad canary rolls back without you.

### O4.4 Environments and releases
Goal: A safe path from commit to production.
Build:
- Staging and production with promotion of the same build
- Per-environment config
- Feature flags to separate deploying from releasing
- Migrations run safely as part of deploys
Understand:
- Build once, deploy many
- Deploy vs release
Break it:
- Promote a build that was rebuilt for production and find a difference
Quiz focus:
- Why should the exact same artifact go to staging and production?
Done when: Production only ever runs builds that passed staging.

Phase O4 milestone: Ship a deliberately broken release and watch the pipeline roll it back automatically.

## Phase O5: Backups and disaster recovery
Proving you can get your data and your service back.

### O5.1 Database backups
Goal: Backups you can restore to any moment.
Build:
- Scheduled logical backups with pg_dump
- Continuous WAL archiving with pgBackRest or WAL-G
- Backups stored off the server, encrypted
Understand:
- Logical vs physical backups
- Point-in-time recovery
- The 3-2-1 rule
Break it:
- Delete a table by accident and restore to one minute before
Quiz focus:
- How would you recover from a DELETE without a WHERE clause run at 3:42 pm?
Done when: You can restore to any point in the last week.

### O5.2 Restore drills
Goal: Backups proven by restoring them.
Build:
- A timed restore to a fresh server
- Recovery point and recovery time targets measured
Understand:
- RPO and RTO
- Why untested backups aren't backups
Break it:
- Restore from last week's backup and time it
Quiz focus:
- What are RPO and RTO, and what are yours?
Done when: You know, from a drill, how long recovery takes.

### O5.3 Rebuild from nothing
Goal: Recover the whole service, not just the data.
Build:
- Server setup scripted end to end
- A runbook for total loss
Understand:
- Infrastructure as code for recovery
- Runbooks that work under stress
Break it:
- Destroy the server and rebuild it from scripts and backups
Quiz focus:
- The server is gone. Walk through the next hour.
Done when: A full rebuild works from the runbook alone.

Phase O5 milestone: A full disaster drill: the server is gone. Restore everything within your targets.

## Phase O6: AWS beyond containers
The AWS building blocks Tier 7 doesn't cover, and keeping the bill under control.

### O6.1 EC2 and Auto Scaling
Goal: Self-healing, scaling groups of servers.
Build:
- Launch templates and an Auto Scaling group behind an Application Load Balancer
- Health checks and scaling policies
Understand:
- EC2 vs Fargate vs Lambda
- Scaling on the right metric
Break it:
- Terminate an instance and watch it get replaced
Quiz focus:
- When would you choose EC2 over Fargate?
Done when: Lost instances are replaced automatically.

### O6.2 CloudFront and Route 53
Goal: Global delivery and smart DNS on AWS.
Build:
- CloudFront in front of the load balancer and S3
- Route 53 health checks and failover routing
Understand:
- Routing policies: simple, weighted, latency and failover
- CDN caching on AWS
Break it:
- Fail the primary region's health check and watch DNS fail over
Quiz focus:
- How does DNS failover work, and what limits how fast it is?
Done when: Failover works and static content comes from the edge.

### O6.3 CloudWatch
Goal: Logs, metrics and alarms on AWS.
Build:
- Application logs in CloudWatch Logs
- Dashboards and alarms
Understand:
- Log retention and its cost
- Alarms that page vs alarms that don't
Break it:
- Leave logs on infinite retention and estimate the bill
Quiz focus:
- What would you alarm on for this service?
Done when: You get paged only for things that matter.

### O6.4 Cost management
Goal: Know and control what AWS costs.
Build:
- Cost Explorer reports and tagging by project
- Budgets with alerts
- A rightsizing review
Understand:
- The usual surprise costs: NAT gateways, data transfer, idle resources
- Reserved capacity and savings plans, at a high level
Break it:
- Find the most expensive thing in your account
Quiz focus:
- Your AWS bill doubled. Where do you look first?
Done when: You can explain every line of the bill.

Phase O6 milestone: 8–10 questions across Phase O6, including: design a highly available setup on EC2 and explain its monthly cost.

## Phase O7: Platforms and GitOps
Simpler and more advanced ways to run software, compared honestly.

### O7.1 Platforms as a service
Goal: Deploy the shop to platforms like Vercel, Render or Railway.
Build:
- The storefront and API deployed on a platform
- A comparison of effort, cost, limits and lock-in with your own setup
Understand:
- When a platform is the right answer
- What you give up
Break it:
- Hit a platform limit, such as function timeouts or cold starts
Quiz focus:
- When would you not run your own infrastructure?
Done when: You can recommend a hosting approach for any team size.

### O7.2 GitOps with Argo CD
Goal: Deployments driven by Git, on your Kubernetes setup.
Build:
- Argo CD on a kind cluster syncing from a repo
- Rollbacks by reverting commits
Understand:
- Push-based vs pull-based deploys
- Drift detection
Break it:
- Change something by hand in the cluster and watch Argo CD revert it
Quiz focus:
- What problem does GitOps solve?
Done when: The cluster always matches Git.

### O7.3 EKS for real
Goal: Run the helpdesk on managed Kubernetes, briefly.
Build:
- An EKS cluster created with Terraform or eksctl
- The Helm chart from Tier 7 deployed to it
- A complete teardown
Understand:
- What a managed control plane does for you
- EKS networking and its cost
Break it:
- Check the bill after an hour and confirm teardown removed everything
Quiz focus:
- What changes moving from kind to EKS?
Done when: The app runs on EKS, and nothing is left running afterwards.

Phase O7 milestone: 6–8 questions across Phase O7, including: a three-person startup asks how to deploy. What do you recommend?

## Track O finish line
You can take a bare server to a hardened, monitored production host behind Nginx and a CDN, deploy with blue-green and canary rollouts, restore the database to any point in time within your targets, and rebuild everything from scripts after losing the server. Run a 15-question quiz across Phases O1–O7.
