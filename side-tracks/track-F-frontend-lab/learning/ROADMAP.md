# Roadmap: Track F, Browser and frontend fundamentals

Repo: frontend-lab. Start after Tier 1 and finish before stage 4.5 in Tier 2.

## Phase F1: JavaScript in depth
The language features that interviews probe and bugs come from.

### F1.1 Scope, closures and this
Goal: Predict what any function sees and what `this` is.
Build:
- Small experiments with scope, closures and the four `this` rules
- A counter, a memoize helper and a once helper
Understand:
- Lexical scope and closures
- How `this` is decided at call time
- Arrow functions and `this`
Break it:
- Pass a method as a callback and lose `this`
Quiz focus:
- What does a closure capture: the value or the variable?
- Why does `this` change when a method is passed as a callback?
Done when: You can predict `this` in any snippet.

### F1.2 Prototypes and classes
Goal: See what classes compile down to.
Build:
- Inheritance written with prototypes, then with classes
- A look at what TypeScript emits
Understand:
- The prototype chain
- Classes as syntax over prototypes
Break it:
- Modify `Object.prototype` and see what breaks
Quiz focus:
- How does property lookup work in JavaScript?
Done when: You can draw the prototype chain for any class hierarchy.

### F1.3 The event loop and promises
Goal: Predict the order of any mix of sync code, promises and timers.
Build:
- A promise implementation from scratch, passing basic tests
- Ordering puzzles with microtasks and macrotasks
Understand:
- Call stack, microtask queue and task queue
- Why promises resolve before timers
- How async/await maps onto promises
Break it:
- Block the main thread with a loop and watch timers drift
Quiz focus:
- Order these logs: sync, `setTimeout 0`, `Promise.then`, `queueMicrotask`.
- How does async/await work under the hood?
Done when: You can predict the output of any event-loop puzzle.

### F1.4 Memory and leaks
Goal: Find and fix memory leaks in browser code.
Build:
- Heap snapshots in DevTools
- Leaks from listeners, timers, closures and detached DOM nodes, then fixes
Understand:
- Garbage collection reachability
- Common leak patterns in SPAs
Break it:
- Add listeners on every render without cleanup and watch memory climb
Quiz focus:
- Your SPA slows down after an hour. How do you find a leak?
Done when: You can find a leak from a heap snapshot.

### F1.5 Machine-coding drills
Goal: Write the classic utilities by hand, timed.
Build:
- Debounce, throttle, a promise concurrency pool, an event emitter, deep clone, curry, `Promise.all` and retry with backoff, each written without help in under 20 minutes
Understand:
- Edge cases interviewers check in each
- Testing your own utility quickly
Break it:
- Run each against an edge-case test list Claude gives you
Quiz focus:
- Write a function that runs at most 3 promises at a time.
Done when: All drills pass their edge-case tests within the time limit.

Phase F1 milestone: 8–10 questions across Phase F1, including: explain the output of a tricky async snippet, step by step.

## Phase F2: Browser internals
From HTML to pixels, and what makes a page slow or janky.

### F2.1 From HTML to pixels
Goal: Explain the rendering pipeline and see each step in DevTools.
Build:
- A performance recording of a page load, annotated
- Experiments with render-blocking CSS and scripts
Understand:
- DOM, CSSOM, render tree, layout, paint and composite
- `defer` vs `async` scripts
- The critical rendering path
Break it:
- Put a slow script in the head without `defer`
Quiz focus:
- Why does CSS block rendering?
- `async` vs `defer`: what's the difference?
Done when: You can annotate a performance recording step by step.

### F2.2 Jank and layout thrashing
Goal: Keep animations and interactions at 60 frames per second.
Build:
- A deliberately janky animation, then fixed
- Batching DOM reads and writes
- requestAnimationFrame and compositor-only properties
Understand:
- The 16 ms frame budget
- Layout thrashing
- Why `transform` animates better than `top`
Break it:
- Read `offsetHeight` inside a write loop and measure
Quiz focus:
- What is layout thrashing and how do you avoid it?
Done when: Your animation holds 60 fps on a throttled CPU.

### F2.3 Events and the DOM
Goal: Handle events efficiently at scale.
Build:
- Event delegation for a large list
- Passive listeners for scroll and touch
- Custom events
Understand:
- Capture vs bubble
- Delegation
- Why passive listeners improve scrolling
Break it:
- Attach 10,000 listeners vs one delegated listener and compare
Quiz focus:
- How does event delegation work, and why use it?
Done when: You can handle events for any list size with one listener.

### F2.4 Storage and the security model
Goal: Know where data can live in the browser and who can read it.
Build:
- Experiments with cookies, localStorage, sessionStorage and IndexedDB
- Same-origin policy tests
- A basic Content Security Policy
Understand:
- Cookie flags: HttpOnly, Secure, SameSite
- Same-origin policy and CORS from the browser's side
- Why tokens in localStorage are debated
Break it:
- Read a token from localStorage with an injected script
Quiz focus:
- Where should auth tokens live in the browser, and why?
Done when: You can choose storage for any data and justify it.

### F2.5 Workers
Goal: Move work off the main thread.
Build:
- A Web Worker for a heavy computation
- A basic service worker that caches assets
Understand:
- Web Workers vs service workers
- Messaging and transferable objects
Break it:
- Run the computation on the main thread and try to scroll
Quiz focus:
- When would you use a Web Worker?
Done when: Heavy work no longer freezes the page.

Phase F2 milestone: 8–10 questions across Phase F2, including: what happens from typing a URL to seeing pixels, browser side.

## Phase F3: React internals
How React decides what to render, and how to keep it fast and correct.

### F3.1 A mini React
Goal: Build a tiny React to understand rendering and reconciliation.
Build:
- `createElement`, a render function and a simple diffing reconciler
- A `useState` implementation
Understand:
- Virtual DOM and reconciliation
- Why keys matter in lists
- How hooks rely on call order
Break it:
- Use array indexes as keys in a reorderable list
- Call a hook inside a condition
Quiz focus:
- Why must hooks be called in the same order every render?
- What do keys do?
Done when: Your mini React renders and updates a todo list.

### F3.2 Re-renders and memoization
Goal: Find and fix unnecessary re-renders with evidence.
Build:
- A slow component tree measured with the React Profiler
- Fixes with `memo`, `useMemo`, `useCallback` and state colocation
Understand:
- What triggers a re-render
- When memoization helps and when it costs more
- Colocating state
Break it:
- Wrap everything in `memo` and measure whether it helped
Quiz focus:
- A parent re-renders and the whole tree follows. Options?
Done when: You can justify every memoization with a profile.

### F3.3 Hooks in depth
Goal: Write effects and custom hooks without stale data or races.
Build:
- Data fetching in an effect with cleanup and abort
- Custom hooks for debounce and media queries
- Fixes for stale closures
Understand:
- Effect cleanup
- Stale closures
- Race conditions when props change quickly
- Strict mode double-invoking effects
Break it:
- Change the selected id rapidly and catch old data showing
Quiz focus:
- Why does this effect show stale data?
- Why does React run effects twice in development?
Done when: Effects never show stale results.

### F3.4 State architecture
Goal: Put each piece of state in the right place.
Build:
- The same app with local state, context, a small store and TanStack Query
- Server state caching, invalidation and optimistic updates with TanStack Query
Understand:
- Server state vs client state
- Why context can cause re-renders
- Cache invalidation on the client
Break it:
- Put fast-changing state in a top-level context and profile
Quiz focus:
- Where should server data live in a React app, and why?
Done when: You can place any piece of state and defend it.

### F3.5 Concurrent rendering and Suspense
Goal: Keep the UI responsive during heavy updates.
Build:
- Transitions for slow updates
- Suspense boundaries for loading states
- Error boundaries
Understand:
- Urgent vs non-urgent updates
- How Suspense changes loading design
Break it:
- Filter a 20,000-item list with and without a transition
Quiz focus:
- What does `useTransition` actually change?
Done when: Typing stays responsive during heavy re-renders.

Phase F3 milestone: 8–10 questions across Phase F3, including: why does this component re-render, and how would you stop it?

## Phase F4: Forms, accessibility and testing
The parts of frontend work that separate polished products from demos.

### F4.1 Forms
Goal: Forms that validate well and share rules with the backend.
Build:
- A multi-step form with zod validation shared with an API
- Controlled and uncontrolled versions, compared
Understand:
- Controlled vs uncontrolled inputs
- Validation timing and UX
Break it:
- Validate on every keystroke for a 50-field form and profile it
Quiz focus:
- When are uncontrolled inputs the better choice?
Done when: The form is fast, clear and shares rules with the server.

### F4.2 Accessibility
Goal: Components that work with a keyboard and a screen reader.
Build:
- An accessibility audit and fixes for an existing page
- Semantic HTML first, ARIA only where needed
- Testing with a screen reader
Understand:
- Semantic elements vs divs
- Focus order and visible focus
- When ARIA helps and when it hurts
Break it:
- Build a clickable div and try to use it by keyboard
Quiz focus:
- Why is a `button` better than a `div` with an onClick?
Done when: The page passes an audit and works fully by keyboard.

### F4.3 Design system components
Goal: Reusable components with good APIs.
Build:
- A button, input, modal with focus trap and a combobox
- Component APIs using composition
Understand:
- Designing component props
- Composition vs configuration
- Focus trapping in modals
Break it:
- Open a modal and tab past it into the page behind
Quiz focus:
- How would you design a reusable select component's API?
Done when: Your components are accessible and easy to compose.

### F4.4 Frontend testing
Goal: Tests that give confidence without breaking on every change.
Build:
- Component tests with Testing Library
- API mocking with MSW
- A first Playwright test
Understand:
- Testing behaviour, not implementation
- What to mock and where
Break it:
- Test implementation details, then refactor and watch tests break
Quiz focus:
- What makes a frontend test brittle?
Done when: Refactors don't break tests unless behaviour changed.

Phase F4 milestone: 6–8 questions across Phase F4, including: review this form component for accessibility and testability.

## Track F finish line
You can explain the event loop, the rendering pipeline and React re-renders without notes, you've built a mini React, and you can write the classic machine-coding utilities by hand under time pressure. Run a 15-question quiz across Phases F1–F4.
