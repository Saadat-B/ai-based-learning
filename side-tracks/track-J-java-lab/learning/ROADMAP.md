# Roadmap: Track J, Java and Spring

Repo: java-lab. Start after Tier 2. Prioritize it if you’re targeting banks, insurers or large enterprises, where Java and Spring dominate.

## Phase J1: Java and the JVM
Modern Java, and the runtime underneath it.

### J1.1 Java for a TypeScript developer
Goal: Write modern Java comfortably.
Build:
- Exercises by hand: classes, interfaces, records, enums, generics
- The Collections framework
Understand:
- Static typing without structural types
- Generics and type erasure
- Records vs classes
Break it:
- Use a raw generic type and hit a runtime ClassCastException
Quiz focus:
- What is type erasure, and what does it cost you?
Done when: You write idiomatic modern Java.

### J1.2 Streams, lambdas and Optional
Goal: Java's functional side.
Build:
- Collection processing rewritten with streams
- Optional instead of nulls
Understand:
- Streams vs loops
- Lazy evaluation in streams
- Optional's intended use
Break it:
- Use Optional as a field and parameter and see why it's discouraged
Quiz focus:
- When are streams the wrong choice?
Done when: You use streams where they read better, and loops where they don't.

### J1.3 Exceptions
Goal: Java's exception model.
Build:
- Checked and unchecked exceptions in a small service
- try-with-resources
Understand:
- Checked vs unchecked
- Why many teams avoid checked exceptions
Break it:
- Swallow an exception and debug the silent failure
Quiz focus:
- Checked or unchecked for a not-found error? Why?
Done when: Errors are handled consistently.

### J1.4 The JVM
Goal: Bytecode, JIT compilation, memory and garbage collection.
Build:
- Bytecode inspected with javap
- Heap and GC observed with JDK tools
- A warm-up effect measured
Understand:
- Bytecode and the JIT
- Heap generations and garbage collectors
- Why JVM apps start slow and then speed up
Break it:
- Run with a tiny heap and read the OutOfMemoryError
Quiz focus:
- Why does a Java service get faster after its first few minutes?
Done when: You can read basic GC and memory output.

Phase J1 milestone: 8–10 questions across Phase J1, including: explain what happens from `javac` to a running, JIT-compiled method.

## Phase J2: Spring Boot
The task API rebuilt in Spring Boot, with the magic explained.

### J2.1 Build tools and project structure
Goal: A Spring Boot project you understand end to end.
Build:
- A project with Maven or Gradle
- Profiles and configuration
Understand:
- Dependency management in Maven or Gradle
- How Spring Boot auto-configuration works
Break it:
- Add two conflicting dependency versions and resolve it
Quiz focus:
- What does Spring Boot auto-configuration do?
Done when: You can explain every file in the project.

### J2.2 Dependency injection
Goal: Spring's IoC container, explained.
Build:
- Services and repositories wired with constructor injection
- Bean scopes
Understand:
- Inversion of control and dependency injection
- Bean lifecycle and scopes
Break it:
- Create a circular dependency between beans
Quiz focus:
- Why prefer constructor injection over field injection?
Done when: You can explain how a bean gets created and injected.

### J2.3 REST API, validation and errors
Goal: The task API in Spring Web.
Build:
- Controllers, DTOs and Bean Validation
- A global exception handler with the same error shape as Tier 1
Understand:
- Controller advice
- DTOs vs entities in responses
Break it:
- Return entities directly and leak internal fields
Quiz focus:
- Why shouldn't controllers return JPA entities?
Done when: The API matches your Express version's behaviour.

### J2.4 Spring Data JPA and Hibernate
Goal: Database access with an ORM that does a lot for you.
Build:
- Entities, repositories and relationships
- Flyway migrations
- Fetch strategies
Understand:
- The persistence context
- Lazy loading, N+1 and LazyInitializationException
- When to write native queries
Break it:
- Trigger N+1, then fix it with a fetch join
- Access a lazy relationship outside a transaction
Quiz focus:
- What is the persistence context?
- How do you find and fix N+1 in Hibernate?
Done when: Every query the app runs is known and justified.

### J2.5 Transactions
Goal: How `@Transactional` really works.
Build:
- Transactional services with rollback rules
- Propagation settings tried out
Understand:
- Proxies and why self-invocation skips transactions
- Rollback on checked vs unchecked exceptions
- Propagation
Break it:
- Call a `@Transactional` method from the same class and watch it run without a transaction
Quiz focus:
- Why does calling a @Transactional method from the same class not start a transaction?
Done when: You can predict transactional behaviour in any call path.

### J2.6 Spring Security
Goal: Authentication and authorization with JWT.
Build:
- A security filter chain with JWT auth
- Method-level authorization
Understand:
- The filter chain
- Where authorization checks belong
Break it:
- Misorder a filter and let unauthenticated requests through
Quiz focus:
- Walk through what happens to a request in Spring Security.
Done when: Every endpoint is protected deliberately.

Phase J2 milestone: 8–10 questions across Phase J2, including: what actually happens when Spring sees `@Transactional`?

## Phase J3: Production Java
Concurrency, testing and running Java in containers.

### J3.1 Concurrency
Goal: Threads, executors and virtual threads.
Build:
- The same I/O-heavy task with a thread pool, CompletableFuture and virtual threads
- A race condition, then fixed
Understand:
- Platform threads vs virtual threads
- Thread pools and their sizing
- How this compares with Node and Go
Break it:
- Share a HashMap across threads without synchronization
Quiz focus:
- What do virtual threads change for a typical Spring service?
Done when: You can choose a concurrency approach and explain it.

### J3.2 Testing
Goal: Unit, slice and integration tests.
Build:
- JUnit 5 and Mockito unit tests
- Spring slice tests
- Integration tests against real Postgres with Testcontainers
Understand:
- Slice tests vs full context tests
- Why Testcontainers beats in-memory databases
Break it:
- Test against H2 and find a bug only Postgres shows
Quiz focus:
- Why not test against an in-memory database?
Done when: Tests are fast where they can be and real where they must be.

### J3.3 Observability and containers
Goal: Running a Spring service well in production.
Build:
- Actuator health and metrics with Micrometer and Prometheus
- A container image with sensible JVM memory settings
Understand:
- JVM memory inside containers
- Startup time and readiness
Break it:
- Set the container memory limit below the heap plus overhead
Quiz focus:
- How do you size JVM memory inside a container?
Done when: The service runs in a container with correct memory and health checks.

Phase J3 milestone: 6–8 questions across Phase J3, including: a Spring service in Kubernetes keeps getting OOMKilled. What do you check?

## Track J finish line
You've ported the Tier 1 API to Spring Boot with JPA, security and Testcontainers tests, and can explain what Spring does behind its annotations. Run a 12-question quiz across Phases J1–J3.
