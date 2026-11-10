# Roadmap: Track P, Python and its ecosystem

Repo: python-lab. Start alongside Tier 4, and finish before Tier 8, which is in Python. It also helps in the AI tiers, where most libraries are Python-first.

## Phase P1: The language
Python idioms, and where your JavaScript habits will mislead you.

### P1.1 Python for a TypeScript developer
Goal: Read and write everyday Python fluently.
Build:
- Short exercises written by hand: comprehensions, unpacking, f-strings, dicts and sets
- The same small utilities written in TypeScript and Python side by side
Understand:
- Mutable default arguments and other classic traps
- Truthiness differences from JavaScript
- Modules and imports
Break it:
- Use a list as a default argument and watch it carry over between calls
Quiz focus:
- Why is `def f(items=[])` a bug?
- How do Python's scoping rules differ from JavaScript's?
Done when: You write idiomatic Python without translating from JavaScript in your head.

### P1.2 Types and tooling
Goal: Typed Python checked like TypeScript.
Build:
- Type hints checked with mypy or pyright
- Linting and formatting with ruff
- Dataclasses and Pydantic models
Understand:
- Gradual typing and what the checker can't see
- Dataclasses vs Pydantic models
Break it:
- Pass the wrong type at runtime to a typed function with no validation
Quiz focus:
- Do Python type hints do anything at runtime?
Done when: Your code passes strict type checking.

### P1.3 Iterators, generators, decorators and context managers
Goal: The features that make Python feel like Python.
Build:
- A generator pipeline for processing a large file
- A retry decorator
- A context manager for timing and cleanup
Understand:
- Lazy evaluation with generators
- How decorators wrap functions
- `with` and resource cleanup
Break it:
- Read a 2 GB file into a list vs streaming it with a generator
Quiz focus:
- When would you write a generator instead of returning a list?
- What does a context manager guarantee?
Done when: You use these features where they fit, not just because they exist.

### P1.4 Concurrency: threads, processes and asyncio
Goal: Python's concurrency options compared with Node's event loop.
Build:
- The same I/O task with threads, asyncio and processes
- A CPU-bound task with each, measured
Understand:
- The GIL and what it does and doesn't block
- asyncio vs Node's event loop
- When multiprocessing is the answer
Break it:
- Run CPU-bound work in threads and see no speedup
- Call a blocking function inside async code
Quiz focus:
- Why don't threads speed up CPU-bound Python?
- What happens if you call a blocking function inside an asyncio app?
Done when: You can choose the right concurrency model for any task.

Phase P1 milestone: 8–10 questions across Phase P1, including: rewrite this JavaScript snippet as idiomatic Python and explain the differences.

## Phase P2: A web service in Python
The Tier 1 task API rebuilt the Python way.

### P2.1 Project setup with uv
Goal: A modern Python project with reproducible dependencies.
Build:
- A project managed with uv: dependencies, lockfile, scripts
- Virtual environments understood, not just used
Understand:
- Why Python needs virtual environments
- Lockfiles in Python vs npm
Break it:
- Install a package globally and break another project
Quiz focus:
- What problem do virtual environments solve?
Done when: A fresh clone runs with one command.

### P2.2 FastAPI and Pydantic
Goal: The task API with validation and automatic docs.
Build:
- CRUD routes with Pydantic request and response models
- Dependency injection for config and database sessions
- Error handling and the generated OpenAPI docs
Understand:
- How FastAPI uses type hints for validation
- Sync vs async route handlers
- Dependencies in FastAPI
Break it:
- Make a blocking database call inside an async route under load
Quiz focus:
- How does FastAPI know how to validate a request?
- When should a FastAPI route be `async def`?
Done when: The API matches your Express version's behaviour.

### P2.3 SQLAlchemy and Alembic
Goal: Database access and migrations the Python way.
Build:
- SQLAlchemy models and queries
- Alembic migrations
- Relationships with eager and lazy loading
Understand:
- Unit of work and sessions
- Lazy loading and N+1 in SQLAlchemy
- Alembic autogenerate and its limits
Break it:
- Trigger N+1 through a lazy relationship
Quiz focus:
- How does a SQLAlchemy session differ from a pg pool client?
Done when: Queries are efficient and migrations are reviewed, not blindly generated.

### P2.4 Testing with pytest
Goal: A test suite as solid as your Tier 1 one.
Build:
- pytest with fixtures for the database and client
- Parametrized tests
- Coverage in CI
Understand:
- Fixtures and their scopes
- Parametrization
Break it:
- Share a database fixture across tests without cleanup
Quiz focus:
- How do pytest fixtures compare with beforeEach?
Done when: The suite runs in CI and catches regressions.

Phase P2 milestone: 8–10 questions across Phase P2, including: compare your FastAPI and Express versions file by file.

## Phase P3: Where Python shines
The parts of the ecosystem that are the reason teams pick Python.

### P3.1 Background jobs
Goal: Work queues in Python.
Build:
- Celery or a lighter queue with Redis for emails and reports
- Retries and scheduled tasks
Understand:
- How Python workers compare with BullMQ
- Prefork vs async workers
Break it:
- Kill a worker mid-task
Quiz focus:
- What happens to a Celery task when its worker dies?
Done when: Jobs retry safely and you can compare the setup with BullMQ.

### P3.2 Data work
Goal: pandas and scripts for everyday data tasks.
Build:
- A report script with pandas
- A CLI tool with argument parsing
Understand:
- DataFrames vs loops
- When pandas is the wrong tool
Break it:
- Loop over a million rows vs vectorizing
Quiz focus:
- Why are vectorized operations faster?
Done when: You reach for Python first for data scripts.

### P3.3 The Python AI ecosystem
Goal: How AI work looks in Python, compared with your Node version.
Build:
- The Tier 3 RAG flow rebuilt in Python with the provider SDK
- A look at popular orchestration frameworks, with what they hide
Understand:
- Why most AI tooling is Python-first
- When a framework helps and when plain code is clearer
Break it:
- Debug a framework-generated prompt you didn't write
Quiz focus:
- Would you use an orchestration framework in production? Why or why not?
Done when: You can work on a Python AI codebase confidently.

Phase P3 milestone: 6–8 questions across Phase P3, including: when would you choose Python over Node for a new service?

## Track P finish line
You've ported the Tier 1 task API to FastAPI with typed models, migrations and tests, and can explain where Python's concurrency model differs from Node's. Run a 12-question quiz across Phases P1–P3.
