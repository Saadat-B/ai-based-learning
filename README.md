# Backend track: workspace

Source plan: `Backend track_ built stage by stage (2).html`

Each folder below is its own git repo with `CLAUDE.md`, `.claude/commands/` (/next, /quiz, /review,
/milestone, /mock dsa|lld|design|sql) and `learning/` (ROADMAP, PROGRESS, LOG). Open a terminal in one,
run `claude`, then `/next`.

## Recommended order
Never more than one main tier, one side track and DSA at the same time. Track D runs underneath everything.

1. **Foundations**: Tier 1, with Track Q phases Q1–Q3 alongside. Then Track F, testing out of what you already know.
2. **The core product**: Track E, then Tier 2, with Track N and Track Q phases Q4–Q8 alongside. Then Track O phases O1–O3, to deploy the shop.
3. **AI**: Tier 3 with Track L alongside, then Tier 4 with Track P alongside. Track S drills start here (one every week or two).
4. **Checkpoint: interview-ready** (full-stack, backend, AI-engineering roles). Start applying here.
5. **Agentic engineering and security**: Track A, with Track X phases X1–X3 alongside.
6. **Distributed systems**: Tier 5 with Track O phases O4–O5, then Tier 6 with Track B. (Fintech? Do the wallet/ledger phase right after Tier 2.)
7. **Scale and infrastructure**: Tier 7, with Track X phases X4–X7. Then Track O phases O6–O7, then Track J (enterprise) or Track G (infra / high-scale).
8. **Checkpoint: senior backend ready.**
9. **Depth**: Tier 8 (needs Track P), then Tier 9, Tier 10, and the remaining language track.

## Tiers
| Folder | App | Notes |
|---|---|---|
| tier-01-foundations | task-api | **In progress** |
| tier-02-ecommerce | shop-api | Copy LOG.md from Tier 1 first (see START-HERE.md) |
| tier-03-ai-applications | shop-assistant | Needs shop-api running; set a model spend limit before 13.1 |
| tier-04-ai-in-production | (same shop-assistant repo) | Only holds the Tier 4 ROADMAP/PROGRESS to swap into tier-03 |
| tier-05-concurrency-realtime | realtime-lab | |
| tier-06-time-money-data | systems-lab | |
| tier-07-scale-infra | helpdesk-saas | Phase 35 uses real AWS: budget alarm + teardown |
| tier-08-ml-under-the-hood | ml-lab | Python |
| tier-09-advanced-apps | advanced-lab | |
| tier-10-build-the-tools | build-the-tools | Node built-ins only, ends with your own Raft |

## Side tracks (in side-tracks/)
| Track | Folder | When |
|---|---|---|
| D | track-D-dsa-practice | From day one, a few problems every week |
| Q | track-Q-sql-lab | Alongside Tier 1 (Q1–Q3); Q4–Q8 alongside Tier 2 |
| F | track-F-frontend-lab | After Tier 1; finish before stage 4.5 |
| E | track-E-node-internals-lab | After Tier 1; finish before Tier 2 Phase 9 |
| N | track-N-net-os-lab | Alongside Tier 2 |
| O | track-O-ops-lab | O1–O3 after Tier 2; O4–O5 with Tier 5; O6–O7 after Tier 7 AWS/K8s (costs money, tear down) |
| L | track-L-lld-practice | Alongside Tier 3, after O1–O3 |
| P | track-P-python-lab | Alongside Tier 4; before Tier 8 |
| S | track-S-system-design-drills | From Tier 3 on, one drill every week or two |
| A | track-A-agent-lab | After Tier 4 |
| X | track-X-security-lab | X1–X3 with Track A; X4–X7 with Tier 7. Only attack systems you own or legal labs |
| B | track-B-db-lab | After Q1–Q6 and Tier 2; with Tier 6 |
| J | track-J-java-lab | After Tier 7 (enterprise targets) |
| G | track-G-go-lab | After Tier 7 (infra targets) |

## Loop per stage
Brief → Build small → Walk through → Predict, then run → Break it → Quiz gate → Log → commit (`stage 1.1: skeleton`), `/clear`, `/next`.
Run `/milestone N` at the end of each phase and `/review` every few stages.
