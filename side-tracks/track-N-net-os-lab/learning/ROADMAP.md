# Roadmap: Track N, Networking, OS and Linux

Repo: net-os-lab. Start after Tier 1 and run it alongside Tier 2.

## Phase N1: Networking
From DNS to HTTP/3, seen with real tools.

### N1.1 DNS
Goal: Trace a name to an address.
Build:
- `dig` traces from root servers to an answer
- TTL and caching experiments
Understand:
- Recursive vs authoritative resolvers
- Record types
- Why DNS changes take time
Break it:
- Point a domain at a new IP and watch stale answers
Quiz focus:
- Why did your DNS change take hours to reach some users?
Done when: You can trace any lookup.

### N1.2 TCP
Goal: See connections, handshakes and their costs.
Build:
- `tcpdump` or Wireshark captures of a connection
- Experiments with keep-alive
Understand:
- Three-way handshake
- Slow start and why new connections are slow
- TIME_WAIT
Break it:
- Open thousands of short connections and watch TIME_WAIT pile up
Quiz focus:
- Why is reusing connections faster?
Done when: You can read a TCP capture.

### N1.3 TLS
Goal: Watch a TLS handshake and inspect certificates.
Build:
- `openssl s_client` against real sites
- A local certificate chain
Understand:
- Handshake steps
- Certificate chains and trust
- What HTTPS hides and what it doesn't
Break it:
- Serve an expired or self-signed certificate
Quiz focus:
- What does a certificate prove?
Done when: You can explain any TLS error.

### N1.4 HTTP/1.1, 2 and 3
Goal: Compare the protocol versions with measurements.
Build:
- The same page loaded over each version
- Header compression and multiplexing observed
Understand:
- Head-of-line blocking at HTTP and TCP level
- Why HTTP/3 uses QUIC over UDP
Break it:
- Load 100 small files over HTTP/1.1 and HTTP/2
Quiz focus:
- What problem does HTTP/2 solve that HTTP/3 solves better?
Done when: You can explain when each version helps.

### N1.5 Load balancers and proxies
Goal: Layer 4 vs layer 7, NAT and what proxies see.
Build:
- An L4 and an L7 proxy in front of two servers
- Client IP preservation with headers
Understand:
- L4 vs L7 load balancing
- X-Forwarded-For and its spoofing risk
- NAT
Break it:
- Trust X-Forwarded-For from clients and spoof an IP
Quiz focus:
- Why can't you trust X-Forwarded-For blindly?
Done when: You can choose L4 or L7 for a given need.

Phase N1 milestone: 8–10 questions across Phase N1, including: what happens when you type a URL and press enter?

## Phase N2: Operating systems
Processes, memory and I/O, as they affect your Node services.

### N2.1 Processes and threads
Goal: See how Node uses processes and threads.
Build:
- Observe Node's threads with OS tools
- The libuv thread pool saturated with file and crypto work
Understand:
- Processes vs threads
- What the libuv thread pool does
- Why Node is single-threaded only for your JavaScript
Break it:
- Run many crypto operations at once and watch the thread pool queue
Quiz focus:
- Which Node operations use the thread pool?
Done when: You can explain where every thread in a Node process comes from.

### N2.2 Memory
Goal: Virtual memory, the heap and the OOM killer.
Build:
- Process memory examined with OS tools
- A heap that grows until the container is OOM killed
Understand:
- Virtual vs resident memory
- Stack vs heap
- Garbage collection pauses
Break it:
- Exceed a container memory limit
Quiz focus:
- Why can a process be killed while the heap looks fine?
Done when: You can read a process's memory picture.

### N2.3 File descriptors and I/O
Goal: Sockets, file descriptors and event notification.
Build:
- `lsof` on a running server
- Hit the file descriptor limit
Understand:
- Everything is a file descriptor
- epoll and non-blocking I/O
Break it:
- Lower `ulimit -n` and load test
Quiz focus:
- What does "too many open files" mean on a web server?
Done when: You understand how one thread serves thousands of sockets.

### N2.4 Containers underneath
Goal: What Docker actually does in the kernel.
Build:
- A container built by hand with namespaces and cgroups
Understand:
- Namespaces vs cgroups
- Why containers aren't VMs
Break it:
- Escape attempts from a privileged container, in a throwaway VM
Quiz focus:
- What isolates one container from another?
Done when: You can explain a container without saying "lightweight VM".

Phase N2 milestone: 8–10 questions across Phase N2, including: how can Node handle 10,000 connections on one thread?

## Phase N3: Linux and debugging
The commands you reach for when production misbehaves.

### N3.1 Shell fluency
Goal: Move fast on a server.
Build:
- Log analysis with `grep`, `awk`, `sort`, `uniq` and `jq`
- SSH config and tunnels
Understand:
- Pipes and text processing
- SSH tunnels for reaching private services
Break it:
- Find the top 10 slowest endpoints in an access log from the shell
Quiz focus:
- How would you find the IP sending the most requests from a log?
Done when: You can answer log questions in one pipeline.

### N3.2 Performance triage
Goal: Find whether CPU, memory, disk or network is the bottleneck.
Build:
- `top`, `vmstat`, `iostat` and `ss` on a loaded server
Understand:
- USE method: utilisation, saturation, errors
- Load average
Break it:
- Saturate disk I/O and diagnose it
Quiz focus:
- Load average is 20 on 4 cores. What does that mean?
Done when: You can name the bottleneck within minutes.

### N3.3 Tracing and profiling
Goal: See what a process is doing right now.
Build:
- `strace` on a stuck process
- `perf` and a flame graph for a CPU-bound Node process
Understand:
- System calls
- Sampling profilers
Break it:
- Make a process hang on a network call and find it with strace
Quiz focus:
- A process is stuck at 0% CPU. What do you check?
Done when: You can find what a stuck process is waiting on.

### N3.4 Incident drill
Goal: Handle "the server is slow" end to end.
Build:
- A timed drill with planted problems
Understand:
- A calm, systematic order of checks
Break it:
- Diagnose three planted problems in 30 minutes
Quiz focus:
- Walk through your first five minutes when an API gets slow.
Done when: You find all planted problems within the time.

Phase N3 milestone: A live drill: Claude describes symptoms, you diagnose from the shell.

## Track N finish line
You can explain what happens when a URL is typed, down to packets and syscalls, and diagnose a slow server from the shell. Run a 12-question quiz across Phases N1–N3.
