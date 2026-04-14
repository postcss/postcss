# Evaluation

This is the evaluation setup. It tells agents and reviewers how to set up, run experiments, and measure results. Both experimenters and reviewers follow the same instructions.

This file is the trust boundary. The evaluation code it references is outside the editable surface. Agents cannot change how they are judged.

The maintainer writes this file. It rarely changes.

## Setup

One-time setup from the repository root:

```bash
npm install --force
```

Verify the benchmark runs correctly:

```bash
node .polyresearch/bench.js
```

You should see output with `METRIC_A:`, `METRIC_B:`, and `METRIC:` lines.

Verify the test suite passes:

```bash
npx uvu -r ts-node/register/transpile-only test "\.test\.(ts|js)$"
```

All 649 tests must pass.

## Running an experiment

From the worktree root (which contains your modified `lib/` files):

```bash
node .polyresearch/bench.js > run.log 2>&1
```

Then run the test suite:

```bash
npx uvu -r ts-node/register/transpile-only test "\.test\.(ts|js)$" > test.log 2>&1
```

**Both must succeed.** A performance improvement that breaks tests is rejected.

### Workload A: Parse + Stringify

1. Generates a deterministic ~44K-line CSS file using a seeded PRNG (seed 42).
2. Runs 3 warmup iterations (discarded).
3. Runs 10 timed iterations of `postcss.parse(css).toString()` and reports the **median** time in milliseconds as `METRIC_A`.
4. Computes a SHA-256 fingerprint of the stringify output to verify correctness.

### Workload B: Plugin Pipeline

1. Generates 250 deterministic CSS files (10-120 rules each, seed 7777).
2. Processes all 250 files through 4 plugins:
   - `bench-bulk-transform`: Once handler that adds `-webkit-` prefixes and strips comments.
   - `bench-decl-inspect`: Read-only Declaration visitor with per-file stats.
   - `bench-structure-inspect`: Read-only Rule + AtRule visitor.
   - `bench-namespace`: Once handler that namespaces class selectors.
3. Runs 1 warmup iteration (discarded).
4. Runs 5 timed iterations and reports the **median** total time as `METRIC_B`.
5. Computes a SHA-256 fingerprint of concatenated output to verify correctness.

### Composite metric

The primary metric is: `METRIC = METRIC_A + METRIC_B / 5`

This puts both workloads on a comparable scale. Both must improve (or at least not regress) to bring the composite down.

## Output format

A successful run prints this structure:

```
METRIC_A: 78.06
METRIC_A_MIN: 56.68
METRIC_A_MAX: 105.22
LINES: 44333
FINGERPRINT_A: 4b81f7a5026b

METRIC_B: 393.76
METRIC_B_MIN: 315.61
METRIC_B_MAX: 443.86
FILES: 250
OUTPUT_LENGTH: 2692873
FINGERPRINT_B: 93326a32dc4f

METRIC: 156.81
```

- `METRIC_A` is the median parse+stringify time in milliseconds.
- `METRIC_B` is the median plugin pipeline time in milliseconds.
- `METRIC` is the composite (primary metric for acceptance).
- `FINGERPRINT_A` must remain `4b81f7a5026b`.
- `FINGERPRINT_B` must remain `93326a32dc4f`.
- `OUTPUT_LENGTH` must remain `2692873`.
- `LINES` must remain `44333`.
- `FILES` must remain `250`.

If any correctness check fails, the experiment is rejected regardless of speed improvement.

## Parsing the metric

```bash
grep '^METRIC:' run.log | awk '{print $2}'
```

This produces a single number on stdout: the composite metric.

To inspect sub-metrics:

```bash
grep '^METRIC_A:' run.log | awk '{print $2}'
grep '^METRIC_B:' run.log | awk '{print $2}'
```

## Verifying tests

```bash
npx uvu -r ts-node/register/transpile-only test "\.test\.(ts|js)$" 2>&1 | tail -5
```

Expected output includes `Passed: 649` and no failures. If any test fails, the experiment is rejected.

## Ground truth

**Workload A:** Median wall-clock time of `postcss.parse(css).toString()` over 10 runs on a deterministic ~44K-line CSS file. Correctness enforced by SHA-256 fingerprint of the stringify output.

**Workload B:** Median wall-clock time of processing 250 files through a 4-plugin pipeline over 5 runs. Correctness enforced by SHA-256 fingerprint of concatenated plugin output and output length.

**Composite:** `METRIC_A + METRIC_B / 5`. Both workloads use `process.hrtime.bigint()` for nanosecond-resolution timing. The `/5` scaling factor puts both sub-metrics on roughly equal footing in the composite.

**Test suite:** All 649 existing tests must pass on the modified code.

The evaluation cannot be gamed by modifying the benchmark, the test files, or the plugin definitions — all are outside the editable surface.

## Environment

- **Runtime:** Node.js v22+ (the version in the project's CI).
- **Hardware:** Results are relative. The benchmark uses medians to reduce noise. Improvements of less than 3 ms on the composite may be within measurement variance and will not be accepted.
- **Expected wall time:** A full benchmark run takes approximately 30-90 seconds.
- **Kill threshold:** If a run exceeds 180 seconds, kill it and record as `crashed`.
