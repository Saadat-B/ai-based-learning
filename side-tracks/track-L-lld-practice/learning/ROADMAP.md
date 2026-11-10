# Roadmap: Track L, Low-level design

Repo: lld-practice. Start alongside Tier 3, after Track O’s first three phases.

## Phase L1: OOP and SOLID
The principles machine-coding rounds score you on.

### L1.1 OOP in TypeScript
Goal: Model a domain with classes, interfaces and composition.
Build:
- A small library-management model
Understand:
- Encapsulation, abstraction, polymorphism
- Composition over inheritance
- Interfaces vs abstract classes
Break it:
- Extend your model with a new requirement and count the files you touch
Quiz focus:
- When would you choose composition over inheritance?
Done when: New requirements touch few files.

### L1.2 SOLID
Goal: Apply each principle and recognise violations.
Build:
- Refactor a messy class through each principle
Understand:
- Each SOLID principle with a real example from your apps
Break it:
- Find SOLID violations in one of your Tier 2 services
Quiz focus:
- Give an example of the open/closed principle from your own code.
Done when: You can name violations and fix them.

Phase L1 milestone: Review a design Claude gives you and fix its SOLID violations.

## Phase L2: Design patterns
Patterns you've already used, named and applied on purpose.

### L2.1 Creational patterns
Goal: Factory, builder and singleton, and when not to use them.
Build:
- Each pattern applied in a small example
Understand:
- What each solves
- Why singletons complicate testing
Break it:
- Test code that uses a singleton
Quiz focus:
- When is a singleton a mistake?
Done when: You choose creational patterns deliberately.

### L2.2 Structural patterns
Goal: Adapter, decorator, facade and proxy.
Build:
- A payment adapter for two providers
- A decorator adding retries and logging
Understand:
- Wrapping vs inheriting
- Where you used these in earlier tiers
Break it:
- Add a third provider through the adapter
Quiz focus:
- Adapter vs facade: what's the difference?
Done when: You can add providers without changing callers.

### L2.3 Behavioural patterns
Goal: Strategy, observer, state, command and chain of responsibility.
Build:
- Pricing strategies, an order state machine, and middleware as a chain
Understand:
- How these map to things you built in Tiers 1–2
Break it:
- Add a new order state and count changes
Quiz focus:
- How is Express middleware a chain of responsibility?
Done when: You see these patterns in code you already wrote.

Phase L2 milestone: Identify the patterns in a codebase Claude shows you.

## Phase L3: Machine-coding problems
Classic 90-minute problems, timed and reviewed.

### L3.1 Parking lot
Goal: Design and code a parking lot system.
Build:
- A timed 90-minute attempt, then a review and a second pass
Understand:
- Identifying entities and responsibilities
- Designing for new vehicle and slot types
Break it:
- Add electric charging slots after finishing
Quiz focus:
- How does your design handle a new vehicle type?
Done when: A new requirement fits without rewrites.

### L3.2 Splitwise
Goal: Expense splitting with balances and simplification.
Build:
- A timed attempt with equal, exact and percentage splits
Understand:
- Modelling money safely
- Debt simplification
Break it:
- Add a new split type after finishing
Quiz focus:
- How do you avoid rounding errors in splits?
Done when: Splits always balance to the paisa.

### L3.3 LRU cache and rate limiter library
Goal: Data-structure-heavy designs.
Build:
- An LRU cache with O(1) operations
- A pluggable rate limiter library
Understand:
- Combining a hash map and a linked list
- Strategy pattern for algorithms
Break it:
- Add TTL support to the LRU cache
Quiz focus:
- Why does LRU need both a map and a list?
Done when: Both pass edge-case tests.

### L3.4 BookMyShow
Goal: Low-level design for ticket booking.
Build:
- A timed attempt covering shows, seats, holds and bookings
Understand:
- Concurrency concerns in the design
- Separating domain from infrastructure
Break it:
- Add seat categories and pricing after finishing
Quiz focus:
- Where do concurrency issues appear in your design?
Done when: The design handles holds and concurrency explicitly.

### L3.5 Mock rounds
Goal: Unseen problems under real conditions.
Build:
- Two mocks with `/mock lld` on problems you haven't seen
Understand:
- Time management in machine coding
- What to cut when time runs short
Break it:
- Finish one mock with a deliberately reduced scope and explain the cuts
Quiz focus:
- What do you build first in a 90-minute round?
Done when: You pass two unseen mocks.

Phase L3 milestone: One fully timed mock with `/mock lld`.

## Track L finish line
You can complete a 90-minute machine-coding problem with clean, extensible, tested code, and explain the patterns you used.
