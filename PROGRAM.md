# Research program

This is the research playbook. It tells agents what to optimize, what they can touch, and what constraints to respect. Read this before every experiment.

The maintainer writes and edits this file. When the research direction shifts, update this file. Contributors pick up the change on their next session start.

required_confirmations: 0
metric_tolerance: 3
metric_direction: lower_is_better
lead_github_login: alanzabihi
maintainer_github_login: alanzabihi
auto_approve: true
assignment_timeout: 24h
review_timeout: 12h
min_queue_depth: 5
max_queue_depth: 10

## Goal

Reduce PostCSS's wall-clock processing time on **two workloads simultaneously**:

- **Workload A (parse + stringify):** Parse a deterministically generated ~44K-line CSS file into an AST and stringify it back. No plugins, no source maps. Tests the tokenizer, parser, and stringifier hot paths.
- **Workload B (plugin pipeline):** Process 250 deterministically generated CSS files (10-120 rules each) through a 4-plugin pipeline. Tests plugin dispatch, visitor pattern, container walk methods, AST mutation, and per-file overhead.

The benchmark reports a **composite metric**: `METRIC = METRIC_A + METRIC_B / 5`. Both sub-metrics are median wall-clock milliseconds. Lower is better.

An improvement must reduce the composite by at least **3 ms**. Neither sub-metric may regress by more than **3 ms** compared to its baseline.

Secondary constraint: correctness. Workload A must produce fingerprint `4b81f7a5026b`. Workload B must produce fingerprint `93326a32dc4f` with output length 2692873. All 649 existing tests must pass.

## What you CAN modify

- `lib/**/*.js` — all JavaScript source files under `lib/`, including the tokenizer, parser, stringifier, plugin execution engine (lazy-result), container/node classes, input handling, source map generation, and all node types.
- `lib/**/*.mjs` — the ESM wrapper.

## What you CANNOT modify

- `.polyresearch/` — the reproducible environment (benchmark harness)
- `POLYRESEARCH.md` — the coordination protocol
- `PROGRAM.md` — the research playbook
- `PREPARE.md` — the evaluation setup
- `results.tsv` — maintained by the lead on `main`
- `test/` — the test suite
- `docs/` — documentation
- `node_modules/` — dependencies
- `package.json` — dependency manifest
- `.github/` — CI and GitHub config
- `*.d.ts` files in `lib/` — TypeScript declarations (API contract)

## Constraints

1. **Correctness is non-negotiable.** The benchmark verifies Workload A via a SHA-256 fingerprint (`4b81f7a5026b`). Workload B must produce fingerprint `93326a32dc4f` with output length 2692873. If either check fails, the experiment is rejected.
2. **Tests must pass.** Run the full test suite to verify. A change that breaks any existing test is rejected regardless of performance gain.
3. **No new dependencies.** Do not add, remove, or upgrade entries in `package.json`. PostCSS has only 3 production dependencies (nanoid, picocolors, source-map-js). Optimize using existing code.
4. **Both workloads matter.** An optimization that helps Workload A but regresses Workload B (or vice versa) by more than 3 ms will not be accepted. The composite metric captures this, but reviewers also check sub-metrics independently.
5. **Expected run time.** A single benchmark invocation takes approximately 30-90 seconds depending on hardware. Kill and record as `crashed` if it exceeds 180 seconds.
6. **No `.d.ts` changes.** TypeScript declaration files are the public API contract. Do not modify them.

## Strategy

PostCSS processes CSS in a pipeline: **tokenize → parse → AST → plugins → stringify**. Each stage has different optimization characteristics.

### Hot path analysis

1. **Tokenizer (`lib/tokenize.js`, 266 lines)** — The single biggest CPU consumer. Takes ~90% of parse time per PostCSS's own documentation. Uses `charCodeAt()`, `indexOf()`, and regex `lastIndex` tricks for fast scanning. Already heavily hand-optimized.
2. **Parser (`lib/parser.js`, 611 lines)** — Consumes tokens and builds the AST. Creates Node objects (Root, Rule, AtRule, Declaration, Comment) and manages parent/child relationships.
3. **Stringifier (`lib/stringifier.js`, 353 lines)** — Walks the AST and builds the output CSS string. Uses string concatenation.
4. **Plugin execution (`lib/lazy-result.js`, 550 lines)** — Manages the visitor pattern. Prepares listener maps from plugin objects, walks the AST dispatching to registered visitors, handles re-walks when plugins mutate the tree.
5. **Container (`lib/container.js`, 447 lines)** — Base class for nodes with children. Provides `walk`* methods, `each`, `insertBefore`, `cloneBefore`, `remove`. Called heavily by both plugins and the visitor dispatch.
6. **Node (`lib/node.js`, 449 lines)** — Base class for all AST nodes. Provides `toProxy()` (Proxy-based access interception), `clone()`, `markDirty()`, property access.
7. **Input (`lib/input.js`, 273 lines)** — Wraps the input CSS string. Provides `fromOffset()` for source map position lookups. Called per-token during parsing.
8. **MapGenerator (`lib/map-generator.js`, 376 lines)** — Source map generation. Has memoization for file URLs and paths. Not exercised in Workload A (no map), but involved in Workload B stringify path.

### Promising directions

- **Tokenizer micro-optimizations**: lookup tables instead of switch/charCodeAt chains, fewer regex compilations, pre-computed character class bitmaps.
- **Parser object allocation**: reduce Node constructor overhead, reuse objects where possible, avoid unnecessary property initialization.
- **Stringifier string building**: use array accumulation + join instead of repeated concatenation, pre-size output buffers.
- **Visitor dispatch**: optimize `prepareVisitors()` listener map construction, reduce `getEvents()` overhead per node, minimize `toProxy()` cost (Proxy creation and interception).
- **Container walk methods**: reduce per-node overhead in `walkDecls`, `walkRules`, `walkComments`, `each`. These are called hundreds of times per file in Workload B.
- **Per-file overhead reduction**: in Workload B, 250 files share the same 4 plugins. Cache or reuse listener maps, processor state, or other per-file setup across files with identical plugin configurations.
- **Node.toProxy() cost**: Proxy objects add overhead to every property access during visitor callbacks. Consider whether the Proxy can be eliminated or its cost reduced for common operations.
- **Lazy initialization**: skip expensive setup for small files, defer work until actually needed.
- **Input.fromOffset()**: called during parsing to resolve line/column positions. Optimize the offset-to-position lookup.

### What to avoid

- **Breaking the Proxy contract**: Visitors receive proxied nodes. Removing the Proxy entirely would break plugins that depend on the mutation-tracking behavior (markDirty on property set). Consider making the Proxy cheaper rather than removing it.
- **Changing parse output structure**: The AST structure is a public API. Nodes must have the same properties and relationships after optimization.
- **Modifying string comparison semantics in tokenizer**: The tokenizer's character-code comparisons are precise. Changing them risks misclassifying tokens.

