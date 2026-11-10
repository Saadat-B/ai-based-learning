# Roadmap: Track X, Security

Repo: security-lab. Start X1–X3 alongside Track A, right after Tier 4. Do X4–X7 alongside Tier 7, where the infrastructure they protect is built.

## Phase X1: Foundations
The crypto every developer needs, threat modelling, and a legal place to practise attacks.

### X1.1 Crypto for developers
Goal: Use cryptography correctly without inventing any.
Build:
- Small examples of hashing, symmetric and asymmetric encryption, signing and HMAC
- Secure random tokens
- Password storage with argon2 or bcrypt
Understand:
- Encoding vs hashing vs encryption vs signing
- Why fast hashes are wrong for passwords
- Why you never write your own crypto
Break it:
- Base64-encode a token that someone called "encrypted" and decode it
- Store SHA-256 password hashes for test accounts and crack them with a wordlist, offline
Quiz focus:
- What's the difference between encrypting and signing a token?
- Why is bcrypt slow on purpose?
Done when: You can pick the right primitive for any job.

### X1.2 Threat modelling
Goal: Find what could go wrong before attackers do.
Build:
- A data-flow diagram of the Tier 2 shop with trust boundaries
- A STRIDE threat list, ranked by risk
Understand:
- Trust boundaries
- STRIDE categories
- Ranking threats by likelihood and impact
Break it:
- Pick your top threat and check whether the shop really defends against it
Quiz focus:
- Walk through the top three threats to your shop.
Done when: You have a ranked threat list for the shop.

### X1.3 Lab setup and rules
Goal: A safe, legal environment for attacking.
Build:
- Burp Suite Community as an intercepting proxy
- OWASP Juice Shop running locally
- A PortSwigger Web Security Academy account
Understand:
- Why you only test systems you own or are explicitly allowed to test
- Intercepting and modifying requests
Break it:
- Change a price in an intercepted request to Juice Shop
Quiz focus:
- Why can't client-side checks be trusted?
Done when: You can intercept and replay any request in your lab.

Phase X1 milestone: 8–10 questions across Phase X1, including: hashing, encryption, encoding and signing. When do you use each?

## Phase X2: Attacking web apps
Learning attacks by performing them in labs, then assessing your own shop.

### X2.1 Injection
Goal: SQL, NoSQL, command and template injection.
Build:
- PortSwigger labs on each type, including blind SQL injection
- A review of your shop for every query and shell call
Understand:
- Why parameterization fixes injection at the root
- Blind injection and how data leaks one bit at a time
Break it:
- Exploit a blind SQL injection lab without automated tools
Quiz focus:
- How can an attacker extract data when the page shows no errors?
Done when: You can find and fix injection anywhere.

### X2.2 XSS and client-side attacks
Goal: Reflected, stored and DOM XSS, clickjacking and open redirects.
Build:
- Labs for each XSS type
- CSP tested against your payloads
- Clickjacking and open redirect labs
Understand:
- Where untrusted data enters the page
- What CSP stops and what it doesn't
- Why open redirects help phishing
Break it:
- Get a stored XSS past a weak CSP in a lab
Quiz focus:
- Your CSP is set. Can you still be vulnerable to XSS?
Done when: No input in your shop reaches the page unescaped.

### X2.3 Access control and business logic
Goal: The bugs scanners miss.
Build:
- IDOR and privilege escalation labs
- Price tampering and mass assignment attempts on your shop
- A race condition that redeems a single-use coupon twice with parallel requests
Understand:
- Why access control bugs are the most common serious finding
- Business logic flaws
- Race conditions as a security bug
Break it:
- Send 20 parallel coupon redemptions with Burp and count successes
Quiz focus:
- How would you test an app for IDOR systematically?
Done when: Your shop's ownership checks and coupon limits hold under attack.

### X2.4 Server-side attacks
Goal: SSRF, path traversal, file uploads and more.
Build:
- SSRF, path traversal and file upload labs
- XXE and request smuggling, at a high level
- Your shop's upload and webhook features tested
Understand:
- Why SSRF is so dangerous in the cloud
- Validating file uploads by content, not name
- Why proxies and servers disagreeing on requests is exploitable
Break it:
- Upload a file that claims to be an image but isn't
Quiz focus:
- How do you safely accept user file uploads?
Done when: Uploads, URLs and file paths in your shop are safe.

### X2.5 Node and token attacks
Goal: Attacks specific to your stack.
Build:
- Prototype pollution in a vulnerable Node app
- JWT attacks: the none algorithm, weak secrets cracked offline, header injection
- ReDoS revisited from Track E
Understand:
- How prototype pollution works and how to prevent it
- Why JWT libraries must pin the algorithm
Break it:
- Pollute Object.prototype through a merge function and escalate privileges
Quiz focus:
- What is prototype pollution, and how do you prevent it in Node?
Done when: Your services are safe from Node-specific and token attacks.

### X2.6 Assess your own shop
Goal: A full security assessment of the Tier 2 shop.
Build:
- A structured test using your threat model
- A findings report with severity, evidence and fixes
- Fixes and retests
Understand:
- Writing findings people act on
- Severity ratings
Break it:
- Hand the report to Claude acting as a skeptical engineering manager
Quiz focus:
- Present your top finding and its fix in two minutes.
Done when: Every high finding is fixed and retested.

Phase X2 milestone: A full assessment of your shop, with a findings report and retests.

## Phase X3: Authentication hardening
Beyond passwords and JWTs: MFA, passkeys and stopping account takeover.

### X3.1 Multi-factor authentication
Goal: TOTP-based MFA with safe enrolment and recovery.
Build:
- TOTP enrolment with QR codes
- Backup codes
- Step-up authentication for sensitive actions
Understand:
- How TOTP works
- Why recovery is the weak point of MFA
Break it:
- Bypass MFA through a careless recovery flow
Quiz focus:
- How can attackers get around MFA?
Done when: MFA can't be skipped through any side door.

### X3.2 Passkeys
Goal: Passwordless login with WebAuthn.
Build:
- Passkey registration and login
- Fallback for devices without passkeys
Understand:
- Public-key authentication
- Why passkeys resist phishing
Break it:
- Try to replay a captured login response
Quiz focus:
- Why can't a phishing site use a stolen passkey login?
Done when: Users can log in with passkeys.

### X3.3 Account takeover defences
Goal: Stop credential stuffing and stolen passwords.
Build:
- Breached-password checks using a k-anonymity API
- Detection of credential stuffing patterns
- New-device alerts and session revocation
Understand:
- Credential stuffing vs brute force
- How k-anonymity protects the password being checked
Break it:
- Simulate a credential stuffing run against your own login and see what catches it
Quiz focus:
- How do you detect credential stuffing when every attempt uses a different IP?
Done when: Stuffing attempts are detected and slowed.

### X3.4 Recovery and sessions
Goal: Account recovery and sessions that can't be hijacked.
Build:
- Reset links built safely without trusting the Host header
- Session fixation protection
- Listing and revoking active sessions
Understand:
- Host header injection in reset emails
- Session fixation
Break it:
- Poison a password reset link with a forged Host header in your lab
Quiz focus:
- How could an attacker get your reset link sent to their own domain?
Done when: Recovery and sessions survive every attack you try.

Phase X3 milestone: 8–10 questions across Phase X3, including: design login for a payments app.

## Phase X4: Edge defences
WAFs, DDoS, bots and layered rate limiting in front of your apps.

### X4.1 A WAF on Nginx
Goal: ModSecurity with the OWASP Core Rule Set in front of your shop.
Build:
- ModSecurity with the Core Rule Set, in detection-only mode first
- Tuning false positives
- Blocking mode once tuned
Understand:
- What a WAF can and can't stop
- Paranoia levels
- Why you start in detection mode
Break it:
- Replay your X2 attacks with the WAF on and off
- Find a legitimate request the WAF blocks
Quiz focus:
- Why isn't a WAF a substitute for fixing vulnerabilities?
Done when: The WAF blocks your known attacks without blocking real users.

### X4.2 Managed WAFs
Goal: Cloudflare or AWS WAF compared with your own.
Build:
- Managed rule sets and a few custom rules
- Geo and reputation-based rules
- A comparison with ModSecurity
Understand:
- Managed vs self-run WAFs
- Rule ordering and actions
Break it:
- Write a custom rule that blocks too much, then narrow it
Quiz focus:
- When would you choose a managed WAF?
Done when: You can configure either kind with confidence.

### X4.3 DDoS
Goal: How denial-of-service attacks work and what actually defends against them.
Build:
- Slowloris against your own local Nginx, then fixed with timeouts
- A CDN absorbing a flood in a test setup
- A plan for L3/4 and L7 attacks
Understand:
- Volumetric vs protocol vs application-layer attacks
- Why rate limiting isn't DDoS protection
- Autoscaling vs cost during an attack
Break it:
- Exhaust your local Nginx connections with slow requests
Quiz focus:
- Your site is being flooded. What helps, at which layer?
Done when: You have a DDoS plan you can explain layer by layer.

### X4.4 Bots and layered rate limiting
Goal: Stop abuse without hurting real users.
Build:
- Bot signals and challenge pages
- Protection against card testing on checkout and signup spam
- A rate-limiting design across edge, gateway, app and account levels
Understand:
- Bot detection trade-offs
- CAPTCHA costs to real users
- Which limit belongs at which layer
Break it:
- Run a scripted signup flood and watch which layer stops it
Quiz focus:
- Design rate limiting for a checkout endpoint, layer by layer.
Done when: Each abuse case is stopped at the cheapest layer that can stop it.

Phase X4 milestone: 8–10 questions across Phase X4, including: your checkout is being hit by card testing. What do you do at each layer?

## Phase X5: Network and access
Keeping private things private: VPNs, zero trust and service identity.

### X5.1 VPNs and private access
Goal: Reach private services without exposing them.
Build:
- WireGuard or Tailscale between your laptop and servers
- Postgres and pgAdmin reachable only over the VPN
- Bastion host vs AWS SSM Session Manager compared
Understand:
- Why databases and admin tools must never be public
- VPN vs bastion vs SSM
Break it:
- Scan your own server from outside and confirm only intended ports respond
Quiz focus:
- How should engineers reach a production database?
Done when: Nothing private is reachable from the internet.

### X5.2 Zero trust and service identity
Goal: Services prove who they are to each other.
Build:
- mTLS between two services
- Short-lived service credentials
Understand:
- Zero trust vs network perimeter
- mTLS and certificate rotation
Break it:
- Call a service without a client certificate
Quiz focus:
- Why isn't being inside the VPC enough to trust a request?
Done when: Every internal call is authenticated.

### X5.3 Network policies and egress control
Goal: Limit what a compromised service could reach.
Build:
- Kubernetes network policies with default deny
- Egress allow-lists
Understand:
- Lateral movement
- Why egress control limits SSRF and data theft
Break it:
- From a compromised pod, try to reach the database and the internet
Quiz focus:
- How does egress control limit the damage from SSRF?
Done when: A compromised pod can reach only what it needs.

Phase X5 milestone: 8–10 questions across Phase X5, including: how should engineers reach the production database?

## Phase X6: Supply chain and containers
Securing what you build on and what you ship.

### X6.1 npm supply chain
Goal: Dependencies you can trust.
Build:
- Lockfiles enforced in CI
- Install scripts disabled where possible
- Automated dependency updates with review
- Package provenance checks and an SBOM
Understand:
- Typosquatting and compromised maintainers
- Why install scripts are risky
Break it:
- Inspect what a popular package's install script actually does
Quiz focus:
- A dependency was compromised. How do you find out if you're affected?
Done when: You know exactly what code you ship.

### X6.2 Container hardening
Goal: Images and pods with minimal attack surface.
Build:
- Image scanning with Trivy
- Minimal or distroless images
- Non-root users, read-only filesystems and dropped capabilities
- Kubernetes pod security standards
Understand:
- Why fewer packages means fewer vulnerabilities
- Container escape risks
Break it:
- Run a privileged container and see what it can reach on the host, in a throwaway VM
Quiz focus:
- What makes a container image secure?
Done when: Your images scan clean and run with least privilege.

### X6.3 Secrets management
Goal: Secrets that rotate and never leak.
Build:
- Vault or AWS Secrets Manager
- Short-lived database credentials
- Secret scanning and a rotation drill
Understand:
- Static vs dynamic secrets
- Rotation without downtime
Break it:
- Rotate the database password while the app is under load
Quiz focus:
- Why are short-lived credentials safer?
Done when: Secrets rotate without downtime.

Phase X6 milestone: 6–8 questions across Phase X6, including: a dependency you use was compromised yesterday. What do you do?

## Phase X7: Detection and response
Noticing attacks and handling incidents well.

### X7.1 Security logging and alerts
Goal: Know when something suspicious happens.
Build:
- Logs for logins, permission changes and admin actions
- Alerts for suspicious patterns such as impossible travel
- CloudTrail and GuardDuty on your AWS account
Understand:
- What to log for security without logging secrets
- Alert fatigue
Break it:
- Trigger each alert on purpose
Quiz focus:
- Which security events would you alert on first?
Done when: Suspicious activity reaches you within minutes.

### X7.2 Incident response
Goal: Handle a security incident calmly and correctly.
Build:
- A response runbook: detect, contain, eradicate, recover, review
- Drills: a leaked AWS key, a compromised admin account, exposed customer data
Understand:
- Containment before investigation
- Breach notification duties under India's DPDP Act, at a high level
Break it:
- Run the leaked-key drill against the clock
Quiz focus:
- Your AWS key is on GitHub. What do you do in the first 15 minutes?
Done when: Each drill is contained quickly and written up.

### X7.3 Security as a practice
Goal: Make security part of everyday work.
Build:
- A security checklist for pull requests
- A security.txt and responsible disclosure policy
- Notes on reducing PCI DSS scope by letting the payment gateway handle cards
Understand:
- Shifting security left
- Why payment gateways shrink your compliance burden
Break it:
- Review a teammate's pull request using only the checklist
Quiz focus:
- How would you build security into a small team's workflow?
Done when: Security checks happen by default, not by memory.

Phase X7 milestone: Three incident drills, each with a written postmortem.

## Track X finish line
You've found and fixed real vulnerabilities in your own shop with a written report, run a WAF in front of it with tuned rules, reached private services only through a VPN, and handled three incident drills with runbooks. Run a 15-question quiz across Phases X1–X7.
