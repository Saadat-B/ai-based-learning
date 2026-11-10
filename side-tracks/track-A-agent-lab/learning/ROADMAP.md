# Roadmap: Track A, Agentic engineering

Repo: agent-lab. Start after Tier 4, once agents, evals and LLMOps are in place.

## Phase A1: Build a harness
A small coding agent built from scratch: the loop, tools, permissions, sandbox, context management and subagents. In effect, a mini Claude Code.

### A1.1 The minimal loop
Goal: A working agent loop in a few hundred lines.
Build:
- A loop that sends messages, runs requested tools and feeds results back
- Stop reasons, streaming output and a step limit
- A transcript of every turn
Understand:
- What the harness does vs what the model does
- Why the loop is simple and the hard parts are around it
- The context window as the agent's working memory
Break it:
- Remove the step limit and give the agent an impossible task
Quiz focus:
- What does a harness add on top of a model API call?
Done when: Your agent completes a simple multi-step task end to end.

### A1.2 Tools, permissions and sandboxing
Goal: The agent can read, edit and run code without being able to damage anything.
Build:
- File read, write and edit tools with path allow-lists
- A shell tool that runs inside a Docker sandbox
- Permission modes: always ask, allow listed, deny
- Detection of dangerous commands
Understand:
- Why an edit tool beats rewriting whole files
- Least privilege for agents
- Containers as a sandbox and their limits
Break it:
- Ask the agent to delete files outside its workspace
- Plant a malicious instruction in a file it reads
Quiz focus:
- How do you let an agent run shell commands safely?
- Why ask for permission per action instead of once per session?
Done when: Nothing the agent does can escape its sandbox or skip a required approval.

### A1.3 Context management
Goal: Long sessions stay within the context window without losing what matters.
Build:
- Token budgeting per turn
- Truncation of large tool results with a way to fetch more
- Compaction that summarizes old turns into notes
- File references instead of pasting whole files
Understand:
- What to keep, summarize or drop
- Why bigger context isn't always better
- Compaction failures and how to detect them
Break it:
- Run a long session until compaction and check what was forgotten
Quiz focus:
- How does your harness decide what stays in context?
Done when: Hour-long sessions stay coherent.

### A1.4 Interruption and resumption
Goal: Users can stop the agent at any time and pick up later.
Build:
- Cancelling a running model call or tool
- Sessions persisted to disk and resumed
- Clean handling of half-finished tool calls
Understand:
- Cancellation through every layer, as in Tier 1
- What state a session needs to resume
Break it:
- Interrupt during a file write
- Kill the process and resume the session
Quiz focus:
- What has to happen when the user hits stop mid-tool?
Done when: Interrupts never leave files half-written or sessions broken.

### A1.5 Subagents and skills
Goal: The agent can delegate work and load knowledge only when needed.
Build:
- Subagents with their own isolated context and limited tools
- Skill files loaded on demand: a description of the goal and tools, not a fixed script
- Results from subagents returned as short summaries
Understand:
- Why isolated context keeps the main agent focused
- Describing outcomes instead of writing step-by-step scripts
- When delegation costs more than it saves
Break it:
- Give a subagent full access and watch its noise flood the main context
Quiz focus:
- When should an agent spawn a subagent?
- Why would a skill file replace an install script?
Done when: Delegation measurably improves a long task.

Phase A1 milestone: 8–10 questions across Phase A1, including: walk through everything your harness does between a user message and the final answer.

## Phase A2: Graph orchestration
Workflows as state graphs: built by hand first, then compared with a framework.

### A2.1 A state graph from scratch
Goal: A small runtime for graphs of steps with typed shared state.
Build:
- Nodes, edges and conditional routing
- Typed state passed between nodes
- A visual dump of the graph
Understand:
- Graphs vs plain code vs free-running agents
- Designing the shared state
Break it:
- Route to a node that doesn't exist
Quiz focus:
- When is a graph clearer than a loop?
Done when: The Tier 3 return workflow runs on your graph runtime.

### A2.2 Branches and cycles
Goal: Parallel steps and controlled loops.
Build:
- Fan-out and fan-in of parallel nodes
- A generate-then-verify cycle with an exit condition
Understand:
- Merging parallel results
- Loops that terminate
- Verification steps as the core of reliable agents
Break it:
- Remove the exit condition from the cycle
Quiz focus:
- How do you stop a generate-verify loop from running forever?
Done when: Parallel branches merge correctly and every cycle terminates.

### A2.3 Checkpoints and interrupts
Goal: Graphs that pause, resume and replay.
Build:
- State checkpointed after every node
- A human interrupt mid-graph, resumed later
- Replaying from an earlier checkpoint
Understand:
- Checkpointing for durability and debugging
- Interrupts as part of the graph, not a hack
Break it:
- Kill the process mid-graph and resume
- Replay from a checkpoint with a changed input
Quiz focus:
- How does checkpointing help with debugging agents?
Done when: Any run can be paused, resumed or replayed.

### A2.4 A framework, compared
Goal: The same graph in LangGraph or a similar framework.
Build:
- The A2.3 workflow rebuilt in a framework
- A list of what the framework handles and what it hides
Understand:
- Framework benefits vs lock-in
- Reading framework-generated prompts and state
Break it:
- Debug a failing node inside the framework
Quiz focus:
- Would you use a graph framework in production? Defend it.
Done when: You can choose a framework, or no framework, with reasons.

### A2.5 The collapse test
Goal: Check whether a multi-step pipeline could be replaced by a single model call.
Build:
- One of your Tier 3–4 pipelines rebuilt as a single call with good context
- Quality, cost and latency compared with the original
Understand:
- Why end-to-end often beats hand-built pipelines as models improve
- Verifiability as the deciding factor
Break it:
- Collapse a pipeline whose output you can't verify automatically and judge the risk
Quiz focus:
- How do you decide which parts of a pipeline to keep as code?
Done when: You have a measured verdict for at least one pipeline.

### A2.6 A deep research agent
Goal: An agent that plans, searches, reads and writes a cited report, running on your graph runtime.
Build:
- A planner that splits a question into sub-questions
- Parallel search and reading nodes
- A synthesis step with citations, and a check that every claim has a source
- A cost cap per report
Understand:
- Why deep research is a graph, not a single call
- Breadth vs depth, and controlling cost
- Handling weak or conflicting sources
Break it:
- Ask a question where sources contradict each other and see how the report handles it
Quiz focus:
- How would you design a deep research feature with predictable cost?
Done when: Reports are cited, cost-capped and reproducible from checkpoints.

Phase A2 milestone: 8–10 questions across Phase A2, including: design the graph for a refund agent with an approval step and a retry loop.

## Phase A3: Agent evals and reliability
Measuring agents by whether they finish real tasks, reliably and affordably.

### A3.1 Task suites
Goal: A suite of realistic tasks with automatic checks.
Build:
- 20–30 coding or support tasks, each with tests that decide success
- A sandbox that resets between runs
Understand:
- Outcome-based grading
- Why task design matters more than the grader
Break it:
- Write a task whose tests can be passed without solving it, then fix it
Quiz focus:
- How do you stop agents gaming a task's checks?
Done when: Every task has a check you trust.

### A3.2 Trajectory evals
Goal: Judging how the agent got there, not only whether it did.
Build:
- Step-level checks: wrong tools, wasted steps, unsafe actions
- An LLM judge over whole trajectories, calibrated against your own grading
Understand:
- Outcome vs process evaluation
- Efficiency as a quality signal
Break it:
- Find a task the agent passes with a dangerous step along the way
Quiz focus:
- Why grade trajectories if the outcome is right?
Done when: Unsafe or wasteful paths are caught even when tasks pass.

### A3.3 Reliability numbers
Goal: Success rates that reflect what users experience.
Build:
- Each task run several times
- Pass@k vs pass^k (succeeds every time)
- Cost and time per successful task
Understand:
- Why one run tells you little
- Consistency vs best-case capability
Break it:
- Compare pass@1, pass@5 and pass^5 on your suite
Quiz focus:
- What does pass^k tell you that pass@k doesn't?
Done when: You report reliability, not just best-case success.

### A3.4 Designing for verifiability
Goal: Agents that check their own work against real signals.
Build:
- Tests, type checks and linters wired in as the agent's feedback
- Tasks rewritten to be verifiable where they weren't
Understand:
- Why models are strongest where outputs can be verified
- Jagged capability: brilliant at verifiable tasks, odd elsewhere
- Turning vague goals into checkable ones
Break it:
- Give the agent a task with no way to check itself and compare quality
Quiz focus:
- Why are models so much better at code than at some everyday judgement?
- How do you make a task verifiable?
Done when: Your agents verify their own output wherever possible.

### A3.5 Self-improving loops
Goal: Agents that get better from their own failures, without silently getting worse.
Build:
- Failed eval cases turned into proposed prompt or skill changes by a model
- Changes accepted only when the full eval suite improves
- An agent-maintained knowledge base of lessons learned, reviewed before it's used
Understand:
- Reflection and feedback loops
- Why self-improvement needs an eval gate
- Overfitting to your own eval set
Break it:
- Let the loop accept a change without running the full suite and watch an old case regress
Quiz focus:
- What stops a self-improving agent from fixing one case while breaking others?
Done when: Improvements are automatic, measured and reversible.

Phase A3 milestone: 8–10 questions across Phase A3, including: your agent passes 80% of tasks once but users complain. What's going on?

## Phase A4: Agentic engineering practice
Working with coding agents as a professional: fast, but with your understanding and quality bar intact.

### A4.1 Vibe coding vs agentic engineering
Goal: Know which one you're doing, and why it matters.
Build:
- A short write-up comparing a vibe-coded prototype with a feature built through your stage loop
- Specs and acceptance tests written before handing work to an agent
Understand:
- Vibe coding raises the floor; agentic engineering keeps the professional quality bar
- You can delegate the typing but not the understanding
- Specs and tests as the real interface to an agent
Break it:
- Vibe-code a feature, then try to debug it a week later
Quiz focus:
- What separates agentic engineering from vibe coding?
Done when: You write specs and tests first by habit.

### A4.2 Configuring coding agents
Goal: Your agent setup does the routine checking for you.
Build:
- A refined `CLAUDE.md` and custom commands
- Hooks that run type checks, tests and lint after edits
- Skills and MCP servers added to your dev loop
Understand:
- What belongs in project instructions
- Hooks as automatic guardrails
- Keeping agent configuration small and current
Break it:
- Remove the hooks for a day and count what slips through
Quiz focus:
- What would you put in a team's `CLAUDE.md`?
Done when: Every agent edit is checked automatically.

### A4.3 Parallel agents
Goal: Several agents working at once without stepping on each other.
Build:
- Git worktrees with one agent per task
- Splitting work into independent tasks
- Merging results and resolving conflicts
Understand:
- Why parallel work needs independent tasks
- Where the human becomes the bottleneck
- Orchestrating many agents with quality gates
Break it:
- Give two agents overlapping tasks and handle the conflict
Quiz focus:
- How do you split a feature so three agents can work on it at once?
Done when: Three agents finish a feature in parallel and it merges cleanly.

### A4.4 Reviewing agent code
Goal: Catch what agents get wrong before it ships.
Build:
- A review checklist for agent output: bloated code, brittle abstractions, missing error handling, security gaps
- Automated quality gates in CI: types, tests, security scans, coverage
Understand:
- Typical failure patterns in agent-written code
- Taste: knowing when working code is still bad code
- Why review is the new bottleneck
Break it:
- Review a large agent-written change with and without the checklist
Quiz focus:
- What do coding agents most often get subtly wrong?
Done when: Agent code meets the same bar as code you'd write yourself.

### A4.5 Agents in CI, and building for agents
Goal: Agents run safely in automation, and your own software is easy for agents to use.
Build:
- A headless agent triggered by issues or failing CI, with limited permissions
- Docs, skills and an MCP server that make one of your apps agent-friendly
Understand:
- Permission scoping for unattended agents
- Designing software for agents as users, not just humans
Break it:
- Give the CI agent write access to main and reason about the risk
Quiz focus:
- What makes a product easy for an AI agent to use?
Done when: An agent can fix a failing build on a branch, and another agent can use your app through its docs and tools.

Phase A4 milestone: 8–10 questions across Phase A4, including: an agent opened 30 pull requests overnight. How do you decide what merges?

## Track A finish line
You've built a working coding-agent harness with sandboxing and subagents, a checkpointed graph runtime, and an agent eval suite with reliability numbers. Your own repos are set up for parallel agents with automated quality gates. Run a 15-question quiz across Phases A1–A4, and give a five-minute talk on vibe coding vs agentic engineering using your own work as examples.
