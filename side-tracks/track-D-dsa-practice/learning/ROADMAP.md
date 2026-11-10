# Roadmap: Track D, DSA practice

Repo: dsa-practice. Start alongside Tier 1 and keep going throughout: a few problems every week.

## Phase D1: Arrays and strings
The patterns behind most easy and medium problems.

### D1.1 Hashing and two pointers
Goal: Solve lookup and pair problems in linear time.
Build:
- 8 problems using hash maps and sets
- 6 problems with two pointers
Understand:
- Trading memory for time
- When sorted input enables two pointers
Break it:
- Test each solution on empty, single-element and duplicate-heavy input
Quiz focus:
- Why is this O(n) and not O(n²)?
Done when: You solve new problems of this kind in under 20 minutes.

### D1.2 Sliding window and prefix sums
Goal: Handle subarray and substring problems.
Build:
- 6 sliding-window problems, fixed and variable size
- 5 prefix-sum problems
Understand:
- Expanding and shrinking a window
- Prefix sums for range queries
Break it:
- Test with negative numbers where relevant
Quiz focus:
- Why do negative numbers break this sliding-window approach?
Done when: You can tell when a window works and when prefix sums are needed.

### D1.3 Binary search
Goal: Binary search on arrays and on answers.
Build:
- 6 problems on sorted arrays
- 4 problems that binary-search the answer
Understand:
- Loop invariants
- Off-by-one traps
- Searching over an answer range
Break it:
- Test at boundaries: first, last, missing
Quiz focus:
- How do you avoid infinite loops in binary search?
Done when: Your binary searches are correct first time at the boundaries.

Phase D1 milestone: A timed set of 3 mixed problems from Phase D1.

## Phase D2: Linear structures
Stacks, queues, lists and heaps.

### D2.1 Stacks and monotonic stacks
Goal: Matching and next-greater problems.
Build:
- 8 stack problems including monotonic stacks
Understand:
- When a stack is the natural structure
- Monotonic stack invariants
Break it:
- Trace your stack on a hand-made example
Quiz focus:
- Why is the monotonic stack approach O(n)?
Done when: You spot stack problems from the description.

### D2.2 Linked lists
Goal: Pointer problems without bugs.
Build:
- 6 linked-list problems: reversal, cycles, merging
Understand:
- Fast and slow pointers
- Dummy head nodes
Break it:
- Test with lists of length 0, 1 and 2
Quiz focus:
- How does cycle detection with two pointers work?
Done when: Your pointer code works on edge cases first try.

### D2.3 Heaps and intervals
Goal: Top-k, scheduling and merging problems.
Build:
- 5 heap problems
- 5 interval problems
Understand:
- Heaps for top-k
- Sorting intervals before merging
Break it:
- Test with overlapping and touching intervals
Quiz focus:
- Why use a heap of size k for top-k?
Done when: You solve top-k and interval problems confidently.

Phase D2 milestone: A timed set of 3 mixed problems from Phase D2.

## Phase D3: Trees and graphs
Traversals and the classic graph algorithms.

### D3.1 Trees
Goal: Recursive and iterative tree problems.
Build:
- 8 binary tree and BST problems
Understand:
- DFS orders and BFS by level
- Returning values up the recursion
Break it:
- Test on skewed trees
Quiz focus:
- When would you choose BFS over DFS on a tree?
Done when: Tree recursion feels natural.

### D3.2 BFS, DFS and grids
Goal: Graph traversal and grid problems.
Build:
- 6 graph and grid traversal problems
Understand:
- Visited sets
- Shortest path in unweighted graphs with BFS
Break it:
- Test on disconnected graphs
Quiz focus:
- Why does BFS find shortest paths in unweighted graphs?
Done when: You model grid problems as graphs quickly.

### D3.3 Topological sort and union-find
Goal: Dependency and connectivity problems.
Build:
- 4 topological sort problems
- 4 union-find problems
Understand:
- Detecting cycles in directed graphs
- Path compression
Break it:
- Test with cycles present
Quiz focus:
- How do you detect that a course schedule is impossible?
Done when: You can choose between DFS, BFS and union-find for connectivity.

### D3.4 Weighted shortest paths
Goal: Dijkstra and its limits.
Build:
- 3 Dijkstra problems
- 1 problem needing a different approach
Understand:
- Why Dijkstra fails with negative edges
Break it:
- Run Dijkstra on a negative edge and find the wrong answer
Quiz focus:
- When does Dijkstra give the wrong answer?
Done when: You can implement Dijkstra from memory.

Phase D3 milestone: A timed set of 3 mixed problems from Phase D3.

## Phase D4: Recursion and dynamic programming
Backtracking, DP and greedy.

### D4.1 Backtracking
Goal: Generate combinations, permutations and subsets.
Build:
- 6 backtracking problems
Understand:
- Choose, explore, unchoose
- Pruning
Break it:
- Count calls with and without pruning
Quiz focus:
- What's the time complexity of generating all subsets?
Done when: You write backtracking templates from memory.

### D4.2 1D dynamic programming
Goal: Turn recursion into DP.
Build:
- 6 one-dimensional DP problems, first as recursion, then memoized, then tabulated
Understand:
- State, transition and base case
- Top-down vs bottom-up
Break it:
- Run the plain recursion on large input and time it
Quiz focus:
- How do you identify the state in a DP problem?
Done when: You can derive a DP from a brute-force recursion.

### D4.3 2D and string DP
Goal: Grid, knapsack and string problems.
Build:
- 6 problems including knapsack, LCS and edit distance
Understand:
- Two-dimensional state
- Space optimisation
Break it:
- Reduce one solution from 2D to 1D memory
Quiz focus:
- Explain edit distance's transitions.
Done when: Classic DP problems are recognisable on sight.

### D4.4 Greedy
Goal: When the locally best choice is globally best.
Build:
- 5 greedy problems with an argument for why greedy works
Understand:
- Exchange arguments
- When greedy fails
Break it:
- Find a counterexample for a wrong greedy approach
Quiz focus:
- How do you convince an interviewer that greedy is correct?
Done when: You can justify or reject a greedy approach.

Phase D4 milestone: A timed set of 3 mixed problems from Phase D4.

## Phase D5: Mock rounds
Putting it together under real interview conditions.

### D5.1 Timed mixed sets
Goal: Solve unseen problems under time pressure.
Build:
- Weekly sets of 3 unseen problems in 60 minutes
Understand:
- Reading constraints for hints about complexity
- Talking while coding
Break it:
- Do one set while explaining aloud
Quiz focus:
- What do the input constraints tell you about the expected complexity?
Done when: You finish sets in time with tested code.

### D5.2 Full mock interviews
Goal: Simulate the real round with Claude as interviewer.
Build:
- Run `/mock dsa`: clarify, approach, code, test and complexity, with interruptions
Understand:
- What interviewers score besides correctness
Break it:
- Do one mock where you get stuck and recover with a hint
Quiz focus:
- How do you recover when you're stuck?
Done when: You pass two mocks in a row.

Phase D5 milestone: Two full mock rounds passed.

## Track D finish line
You can recognise the pattern behind a new problem within a few minutes, and pass two timed mock rounds of two medium problems in 45 minutes each.
