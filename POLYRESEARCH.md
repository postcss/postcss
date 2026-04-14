# Polyresearch protocol

This is the coordination protocol for polyresearch. It defines how agents find work, run experiments, submit candidates, and verify each other's results using the `polyresearch` CLI together with `gh` and `git`. GitHub Issues, PRs, branches, and structured comments remain the shared activity log. No external services.

Drop this file into your repository unchanged. Put project-specific coordination values in `PROGRAM.md`. Do not modify the protocol sections.

**Companion files.** This file works alongside two project-specific files and an optional directory:

- **PROGRAM.md** — the research playbook. Describes the research goal, which files you can edit (gitignore-style patterns), strategy, and constraints. Read this before every experiment.
- **PREPARE.md** — the evaluation setup. Describes how to set up, run experiments, parse the metric, and what the ground truth is. This is the trust boundary. Do not modify anything it references.
- **results.tsv** — the lab notebook. Every experiment ever run, including failures. Maintained by the lead on `main`.
- **.polyresearch/** — the reproducible environment. When present, use it for setup and execution. Do not modify it.

---

## Configuration

Protocol parameters are set as `key: value` lines in `PROGRAM.md`. The CLI scans every line for `key: value` pairs where the key is a single `snake_case` word. Lines that don't match (headings, prose, blank lines) are ignored.

Example (in `PROGRAM.md`):

```
lead_github_login: alice
maintainer_github_login: alice
auto_approve: true
metric_tolerance: 0.01
metric_direction: higher_is_better
min_queue_depth: 5
cli_version: 0.3.2
```

**Parameter reference:**

- `required_confirmations` — Number of independent review records needed before the lead decides a PR. `0` means the lead decides without peer review. Default: `0`.
- `metric_tolerance` — Maximum allowed divergence between reviewer metrics for agreement. No default — the maintainer must set this based on the domain and hardware variance.
- `metric_direction` — `lower_is_better` or `higher_is_better`.
- `lead_github_login` — GitHub login that is authorized to perform lead-only actions such as approval, sync, policy checks, decisions, and admin repairs.
- `maintainer_github_login` — GitHub login for the human maintainer who can `/approve` or `/reject` thesis issues and candidate PRs when human review is enabled.
- `auto_approve` — If `true`, the lead auto-approves generated theses and decides PRs without waiting for a maintainer slash command. If `false`, the maintainer must `/approve` first. Default: `true`.
- `assignment_timeout` — Time before an uncompleted claim expires and the thesis returns to the queue. Default: `24h`.
- `review_timeout` — Time before an incomplete review claim expires. Default: `12h`.
- `min_queue_depth` — Minimum number of unclaimed approved theses the lead should keep available. If the queue drops below this, the lead generates enough new theses to refill it. Default: `5`.
- `max_queue_depth` — Maximum number of unclaimed approved theses the lead should allow in the queue at once. When omitted, there is no upper bound.
- `cli_version` — Exact version of the `polyresearch` CLI that all nodes must use. When set, the CLI checks its own version at startup and refuses to run if it does not match. When omitted, no version check is performed.

The parameter definitions live here. Concrete project values live in `PROGRAM.md`.

---

## Roles

**Maintainer.** The human who owns the project. Writes PROGRAM.md and PREPARE.md. Approves or rejects theses and PRs when human review is enabled. Picks the tooling (agent, model, sandbox). Polyresearch does not mandate any specific tooling.

**Contributor.** A machine running an agent. Claims theses, runs experiments, submits candidates, and reviews others' work. You are a contributor unless told otherwise.

**Lead.** A machine running an agent dedicated to project management. The lead generates theses from results history, runs policy checks on candidate PRs, decides PRs (merge or close), and maintains `results.tsv` as sole writer. One per project. The lead does not claim theses, run experiments, submit candidates, or participate in peer review. If your instructions say "you are the lead," follow the lead loop only.

When `auto_approve` is `false`, `lead_github_login` and `maintainer_github_login` must be different GitHub accounts. Human-in-the-loop review does not work if the lead and the maintainer share the same GitHub identity.

In practice, the maintainer usually runs the lead and at least one contributor as separate agent instances. Contributors may share the lead's GitHub login because the protocol uses node IDs for attribution, but the lead and maintainer still must be different GitHub accounts when `auto_approve` is `false`. The lead may spend many iterations idle between duty cycles; that is expected and preferable to blocking contributors behind GitHub-visible work.

---

## Starting a session

When you start, before doing anything else:

1. Read POLYRESEARCH.md (this file), PROGRAM.md, and PREPARE.md.
2. Read results.tsv to understand experiment history and avoid repeating dead ends. If you are the lead and results.tsv is empty or missing rows for theses that have already been resolved, check closed issues with `gh issue list --label thesis --state closed`, update the ledger, and only then enter the main loop. A stale results.tsv will cause duplicate thesis generation.
3. Run `git log --oneline -20` on `main` to see recent state.
4. If `.polyresearch/` exists, run its setup. Otherwise follow PREPARE.md setup instructions.
5. Check your GitHub identity. Run `gh api user --jq '.login'` to see which GitHub account you are operating as. If your instructions specify a particular GitHub user (for example, "contribute as user X"), verify the result matches. If it does not, stop and report the mismatch before proceeding. If your instructions do not specify a user, proceed with whatever account `gh` is currently authenticated as.
6. Create a distinct node ID for this session before running other `polyresearch` commands. This is required when multiple agents share the same checkout or when one GitHub login runs several workers in parallel:

   ```bash
   LOGIN=$(gh api user --jq '.login')
   MACHINE_ID="$(hostname -s)-$(xxd -l2 -p /dev/urandom)"
   export POLYRESEARCH_NODE_ID="${LOGIN}/${MACHINE_ID}"
   ```

7. If `.polyresearch-node.toml` does not exist yet, run `polyresearch init --node "$MACHINE_ID"`. The CLI writes the fallback file used when `POLYRESEARCH_NODE_ID` is unset and records any optional node-specific `resource_policy`.
8. Identify your role. If your instructions say "you are the lead," follow the lead loop. Otherwise, follow the contributor loop.

---

## Node configuration

Each node keeps a local `.polyresearch-node.toml` file at the repo root:

```toml
node_id = "alice/mac.lan-a3f2"
resource_policy = "8-core machine with 2 GPUs. Run up to 4 parallel evaluations. Keep GPUs saturated. Stay under 50 API calls/min."
```

- `node_id` identifies the machine or worker. Keep it stable for the lifetime of that worker or agent session.
- `resource_policy` is optional natural language guidance for that node only. It is not project state.
- Set or update it with `polyresearch init --resource-policy "..."`.
- `POLYRESEARCH_NODE_ID` overrides `node_id` for the current process. Use it when multiple agents share one checkout or when one GitHub login needs several concurrent nodes.
- If `POLYRESEARCH_NODE_ID` is unset, the CLI falls back to `.polyresearch-node.toml`.

If `resource_policy` is absent, the default policy applies:

> Maximize throughput. Never leave claimable theses idle while experiments could be running. Run evaluations in parallel when the evaluator supports it. Interleave duties with long-running evaluations.

Run `polyresearch pace` regularly. It prints the effective resource policy alongside recent node activity so the agent can compare expectation vs reality and adjust parallelism or claim rate.

---

## Mandatory CLI

Use `polyresearch` for every protocol mutation: claiming theses, posting attempts, releasing claims, submitting candidates, syncing `results.tsv`, policy checks, decisions, and any repair actions.

GitHub remains the visible event log, and the CLI emits the same human-readable structured comments described below. Manual raw GitHub edits are non-canonical and may be ignored by the lead and the tooling. Exceptional recovery goes through explicit CLI admin or repair commands.

---

## Duties

Run `polyresearch duties` at the start of every loop iteration and after completing any experiment. If it reports blocking items, resolve them before starting new work. The CLI also enforces this: `claim` and `generate` will refuse to proceed if blocking duties exist.

Blocking duties exist when:

- A node has an active claim with no posted attempts.
- A node has an improved attempt with no submit or release.
- (Lead) Decidable PRs have not been decided.
- (Lead) Open PRs have not been policy-checked.

This mechanism exists because GitHub visibility is a shared resource. Other contributors, the lead, and the maintainer cannot see local-only work. A node that runs experiments without posting results is invisible to the project.

---

## The contributor loop

LOOP FOREVER:

0. **Check duties.** Run `polyresearch duties`. If any blocking items are reported, resolve each one before continuing. The CLI will also block `claim` if duties are outstanding.
1. **Check pace.** Run `polyresearch pace`. Compare the effective resource policy against recent throughput and adjust how many experiments you run in parallel.
2. **Check for theses.** Run `polyresearch status` and look for theses that are **approved and unclaimed**. The CLI derives canonical state from the comment trail and ignores invalid raw events.
3. **If a claimable thesis exists:**
  a. Run `polyresearch claim <issue-number>`.
   b. The CLI posts the `polyresearch:claim` comment and creates a git worktree from `main` at `.worktrees/<issue-number>-<slug>/` on branch `thesis/<issue-number>-<slug>`. Change into that worktree before editing.
   c. Read PROGRAM.md for direction and constraints.
   d. Run experiments from inside that thesis worktree. Each attempt uses its own sub-branch: `thesis/<issue-number>-<slug>-attempt-<n>`. If you run attempts in parallel, use one worktree per active attempt.
   e. For each attempt:
      - Make your changes within the editable surface defined in PROGRAM.md.
      - Commit your changes.
      - Run the experiment per PREPARE.md. Redirect output: `<run-command> > run.log 2>&1`.
      - Parse the metric per PREPARE.md.
      - Run `polyresearch attempt <issue-number> --metric <value> --baseline <value> --observation <observation> --summary "<summary>"`.
   f. **If you find an improvement:** check out the improved attempt branch, then run `polyresearch submit <issue-number>`. The CLI pushes the current branch and opens the candidate PR to `main`.
   g. **If no improvement after exhausting ideas:** run `polyresearch release <issue-number> --reason <reason>`. The thesis returns to the queue for another contributor.
   h. When the thesis is released or later resolved, remove its worktree with `git worktree remove` and return to the main worktree before claiming again.
4. **Check for review work.** Run `polyresearch status` and look for PRs with a `polyresearch:policy-pass` comment and **no** `polyresearch:decision` comment. These need peer review. Skip PRs you authored.
5. **If a reviewable PR exists:**
  a. Run `polyresearch review-claim <pr-number>`.
   b. Check out the **candidate SHA** (the PR head).
   c. Run the evaluation per PREPARE.md. Record the candidate metric.
   d. Check out the **base SHA** (the PR's merge base on `main`).
   e. Run the same evaluation. Record the baseline metric.
   f. If `.polyresearch/` exists, compute its content hash: `find .polyresearch/ -type f | sort | xargs sha256sum | sha256sum`.
   g. Run `polyresearch review <pr-number> --metric <candidate> --baseline <baseline> --observation <observation>`. Your `baseline_metric` is your own measurement. Do not copy it from results.tsv or the candidate's self-report.
6. Repeat from step 0.

If there are no theses to claim and no PRs to review, wait briefly and check again.

**NEVER STOP.** Once the loop has begun, do not pause to ask the human if you should continue. Do not ask "should I keep going?" or "is this a good stopping point?" The human might be asleep or away and expects you to work indefinitely until manually stopped. If you run out of ideas during experimentation, think harder — re-read PROGRAM.md, study results.tsv for patterns in what worked and failed, try combining previous near-misses, try more radical changes. The loop runs until the human interrupts you.

**Crashes.** If an experiment crashes (OOM, bug, timeout), use your judgment. If it's something simple (typo, missing import), fix it and re-run. If the idea is fundamentally broken, log it as `crashed` in the attempt comment and move on.

**Timeouts.** If a run exceeds twice the expected time budget (per PREPARE.md), kill it and treat it as a crash.

---

## The lead loop

The lead runs a separate management loop from the repository root worktree, which stays on `main`.

**Priority order within each iteration.** GitHub-visible duties run first, in this order:

0. `polyresearch duties` — resolve any blocking items (decidable PRs, stale results.tsv, etc.).
1. `polyresearch pace` — compare your effective resource policy against recent node throughput.
2. `polyresearch sync` (always before other lead actions).
3. Process open PRs: `policy-check` and `decide` any that are ready. When `auto_approve` is `false`, assign ready PRs to `maintainer_github_login` and wait for `/approve`.
4. Check queue depth; `generate` if below `min_queue_depth`.
5. If there is no immediate GitHub-visible work, wait briefly and repeat from step 0.

The lead never claims theses or runs experiments. Keeping `main` current is the lead's full-time job.

### Maintain results.tsv

You are the sole writer. This step runs first on every lead-loop iteration. Do not generate theses, run policy checks, or decide PRs until results.tsv is current.

1. Run `polyresearch sync`.
2. The CLI reconciles canonical attempt history against `results.tsv`, appends any missing rows, and commits the updated `results.tsv` on `main`.
3. Canonical history may ignore invalid raw GitHub events. Resolve any audit findings through CLI admin or repair commands before continuing. A dirty audit blocks `policy-check`, `decide`, and `generate`.

Only after results.tsv accounts for every known attempt may you proceed to the rest of the lead loop.

After any new thesis resolution later in the same iteration, append those rows before the next iteration begins.

The event table below defines what to log:


| Event                                 | Data source                                              | Action                                               |
| ------------------------------------- | -------------------------------------------------------- | ---------------------------------------------------- |
| PR merged (`accepted`)                | `polyresearch:review` records on the PR                  | Append row with verified metric                      |
| PR closed (any non-accepted outcome)  | `polyresearch:review` records + `polyresearch:decision`  | Append row with observed metric and decision outcome |
| Attempt discarded (never became a PR) | `polyresearch:attempt` comments on thesis issue          | Append row with self-reported metric                 |
| Thesis closed without any candidate   | `polyresearch:release` + `polyresearch:attempt` comments | Append rows for all logged attempts                  |


### Generate theses

Complete all of these before opening any new thesis issue:

1. Confirm `polyresearch audit` is clean and `results.tsv` is current. The maintain step above must be done first.
2. Read results.tsv and PROGRAM.md. Identify patterns in what worked, what failed, and what has not been tried yet.
3. Run `polyresearch status` and read every existing thesis title and body, open and closed.
4. Read annotations on closed theses. Treat them as negative knowledge. Do not repeat those directions unless you can explain why the new attempt is materially different.

Queue depth check:

- Count the number of open theses that are approved and unclaimed, using [Deriving state](#deriving-state).
- If `auto_approve` is `false`, also count open submitted theses that are waiting on maintainer review. They still occupy queue capacity and should prevent unbounded generation.
- If `max_queue_depth` is set and that count is already at or above `max_queue_depth`, do not open new theses this iteration.
- If that count is already at or above `min_queue_depth`, do not open new theses this iteration.
- If that count is below `min_queue_depth`, open only enough new theses to bring the queue back to `min_queue_depth`.

Deduplication:

- Before opening each new thesis, verify it does not duplicate an existing open or closed thesis.
- Two theses are duplicates if they test substantially the same hypothesis, even if the wording differs.
- If an idea already failed, do not re-propose it unless you can point to a concrete reason the new attempt is materially different. State that reason in the thesis body.
- If an idea was already merged, do not re-propose it.

Open new GitHub Issues with the `thesis` label by running `polyresearch generate --title "<title>" --body "<body>"`.

- If `auto_approve` is `true`, the CLI auto-approves the thesis by posting a `polyresearch:approval` comment.
- If `auto_approve` is `false`, the CLI leaves the thesis in `Submitted`, assigns it to `maintainer_github_login`, and waits for the maintainer to comment `/approve` or `/reject`.

Before opening more theses, the lead must read maintainer `/approve` and `/reject` comments on existing theses and PRs. Treat those comments as directional input: approval reasons suggest promising directions, rejection reasons constrain future generation. This guidance does not override `PROGRAM.md`, `PREPARE.md`, or the measured results history.

Guard against path dependence. If recent accepted theses share the same approach, generate at least one thesis that tries a fundamentally different direction from the current baseline.

### Policy check

When a candidate PR is opened, run `polyresearch policy-check <pr-number>`. The CLI diffs it against the editable surface in PROGRAM.md. If any file is outside the editable surface, it posts a `polyresearch:decision` with `outcome: policy_rejection` and closes the PR. No evaluation runs.

If the candidate passes, the CLI posts a `polyresearch:policy-pass` comment. The PR is now eligible for peer review.

### Decide PRs

When `required_confirmations` review records have been posted on a PR, run `polyresearch decide <pr-number>`.

If `auto_approve` is `false`, the lead assigns the PR to `maintainer_github_login` and waits for a maintainer `/approve` before posting a decision. A maintainer `/reject` means do not accept the current candidate; the lead should close or supersede that PR and use the feedback to guide the next thesis or attempt.

Otherwise apply these rules:

- All reviewers observed `improved` and their metrics agree within `metric_tolerance`: post `outcome: accepted`, **merge** the PR, close the thesis issue.
- All reviewers observed `no_improvement` and agree: post `outcome: non_improvement`, **close** the PR, close the thesis issue.
- Reviewer metrics diverge beyond `metric_tolerance`: post `outcome: disagreement`, **close** the PR, close the thesis issue.
- The `base_sha` in any review record does not match current `main` HEAD: post `outcome: stale`, **close** the PR. The thesis returns to the queue.
- All or most reviewers reported `crashed` or `infra_failure`: post `outcome: infra_failure`, **close** the PR. The thesis returns to the queue.

If `required_confirmations` is `0`, skip peer review. The lead decides using this procedure:

1. Run the normal policy check. Reject anything outside the editable surface.
2. The candidate's self-reported metric must beat the frozen evaluator baseline beyond `metric_tolerance`.
3. The candidate's self-reported metric must also meet or exceed the best accepted metric currently recorded in `results.tsv` on `main`. If it beats the frozen baseline but regresses the current best, close the PR with `outcome: non_improvement` and leave the thesis open for a fresh attempt.
4. If the PR cannot merge cleanly, resolve the merge conflict and then merge or close based on the metric rules above. Do not close a PR solely because it has a merge conflict.

Do not use `outcome: stale` when `required_confirmations` is `0`. In that mode there are no review records, so there is no `base_sha` evidence to compare. If the candidate was evaluated before a newer prompt was merged to `main`, the self-reported baseline may be stale. Rule 3 above (must meet or exceed the best accepted metric in `results.tsv`) serves as the staleness guard in zero-confirmation mode.

For `accepted` outcomes, the merge must succeed before the decision comment is posted. If the PR has a merge conflict, resolve it before deciding. Do not post an irrevocable `accepted` decision on an unmergeable PR.

---

## Thesis lifecycle

A thesis is a GitHub Issue with the `thesis` label. Its state is not stored anywhere. It is derived from the comments on the issue and any associated PR.

```
Submitted → Approved → Claimed → Experimenting ─┬→ CandidateSubmitted → InReview ─┬→ Merged
     │                                           │                                  ├→ ClosedNoImprovement
     │                                           │                                  ├→ ClosedDisagreement
     │                                           │                                  └→ ClosedStale
     │                                           │
     │                                           ├→ ReleasedNoImprovement → Exhausted
     │                                           └→ ReleasedTimeoutOrInfra (returns to Approved)
     │
     └→ Rejected (maintainer closes issue)
```

### Deriving state

Scan the comment trail on the issue to reconstruct the current state:

- Issue exists with `thesis` label → **Submitted**
- Has a `/approve` comment or a `polyresearch:approval` comment → **Approved**
- Has a `polyresearch:claim` with no subsequent `polyresearch:release` for the same node → **Claimed**
- Is approved, has no active claim or open PR, and has a `polyresearch:release` with `reason: no_improvement` → **Exhausted**
- Claimed and has an open PR from a thesis branch → **CandidateSubmitted**
- PR has a `polyresearch:policy-pass` comment → **InReview**
- PR has a `polyresearch:decision` comment → **Resolved** (check `outcome` for terminal state)

No mutable labels to get out of sync. The comment trail is the truth.

Exhausted theses stay open for history, but they are not claimable and do not count toward queue depth.

When `auto_approve` is `false`, a generated thesis stays in **Submitted** until the maintainer comments `/approve`.

---

## Branching

```
repo-root/                                 (main worktree on `main`)
  ├── .git
  ├── .worktrees/                          (gitignored)
  │     ├── 12-rmsnorm/                    (worktree on `thesis/12-rmsnorm`)
  │     └── 12-rmsnorm-attempt-2/          (optional parallel attempt worktree)
  └── ...                                  (lead stays here)
```

- The repository root is the main worktree. The lead stays here on `main`.
- `main` is the accepted ledger. Only verified improvements land here.
- Each claim creates a thesis worktree under `.worktrees/<issue-number>-<slug>/` on branch `thesis/<issue-number>-<slug>`.
- Each attempt gets its own sub-branch: `thesis/<issue-number>-<slug>-attempt-<n>`, forked from the thesis branch.
- When running attempts in parallel, create one worktree per active attempt.
- The candidate PR merges the best attempt's sub-branch into `main`.
- Discarded attempts stay as unmerged branches. They are data, not waste.
- Remove thesis worktrees with `git worktree remove` once the thesis is released or resolved.
- Pass `--no-worktree` to `polyresearch claim` to skip worktree creation and create a branch in the current checkout instead. Useful in sandboxed environments that restrict worktree creation.

---

## Structured comments

All protocol state transitions happen through structured comments on GitHub Issues and PRs. Each structured comment has a human-readable summary line followed by an HTML metadata block. Comments are append-only, attributed, and auditable.

One label remains: `thesis` on issues, for discovery via `gh issue list --label thesis`. Everything else is a structured comment.

Structured comments emitted by `polyresearch` are canonical. Maintainer `/approve` and `/reject` slash commands are also canonical. Other raw manual comments that resemble protocol events may still be visible on GitHub, but the lead and the tooling may ignore them if they do not pass validation.

### Format

```
Visible summary line for humans.

<!-- polyresearch:<type>
key: value
key: value
-->
```

The visible summary line is required so humans can understand the protocol state in GitHub's rendered UI. Agents parse only the HTML block. Keep the summary short and include the comment type and the most important fields.

### Maintainer slash commands (issues and PRs)

```
/approve Optional reason or guidance.
```

```
/reject Optional reason or guidance.
```

The maintainer writes `/approve` or `/reject` at the start of a comment body on a thesis issue or candidate PR. Any remaining text is free-form feedback for the lead to consider.

### On thesis issues

**Approval** (maintainer, plain-text slash command):

`/approve` on the issue is a valid approval signal. `/reject` means the thesis should not be pursued in its current form.

**Approval** (lead auto-approval):

```
Polyresearch approval: thesis #12.

<!-- polyresearch:approval
thesis: 12
-->
```

Both forms are valid approval signals. The protocol recognizes either.

**Claim** (contributor claims a thesis):

```
Polyresearch claim: thesis #12 by node `alice/node-7f83`.

<!-- polyresearch:claim
thesis: 12
node: alice/node-7f83
-->
```

**Release** (contributor releases a claim without submitting a candidate):

```
Polyresearch release: thesis #12 by node `alice/node-7f83` (`reason: no_improvement`).

<!-- polyresearch:release
thesis: 12
node: alice/node-7f83
reason: no_improvement | timeout | infra_failure
-->
```

**Attempt** (contributor records a completed experiment):

```
Polyresearch attempt: thesis #12, branch `thesis/12-rmsnorm-attempt-1`, metric `1.0050`, observation `no_improvement`.

<!-- polyresearch:attempt
thesis: 12
branch: thesis/12-rmsnorm-attempt-1
metric: 1.0050
baseline_metric: 0.9934
observation: improved | no_improvement | crashed | infra_failure
summary: Switched to GeLU activation, regression on val_bpb
annotations: [{"category":"failure_analysis","task_id":"task-7","text":"Tool selection drifted after step 2"}]   # optional
-->
```

The optional `annotations` field is a JSON array of objects with:

- `category` — short machine-friendly label such as `failure_analysis`, `observation`, or `hypothesis`
- `task_id` — optional benchmark task ID
- `text` — the human-readable note

When `annotations` are present, the visible part of the comment may also include a short `Annotations:` section above the HTML metadata block.

**Annotation** (informational note on a thesis issue):

```
Polyresearch annotation: thesis #12 by node `alice/node-7f83`.

Tried the retrieval-heavy direction twice. It regressed on tool-use tasks.

<!-- polyresearch:annotation
thesis: 12
node: alice/node-7f83
-->
```

Annotations are informational only. They do not change thesis state.

### On candidate PRs

**Approval or rejection** (maintainer, plain-text slash command):

`/approve` on the PR authorizes the lead to proceed when `auto_approve` is `false`. `/reject` means the current candidate should not be accepted in its current form.

**Policy pass** (lead confirms candidate is within editable surface):

```
Polyresearch policy pass: thesis #12, candidate `a1b2c3d`.

<!-- polyresearch:policy-pass
thesis: 12
candidate_sha: a1b2c3d
-->
```

**Review claim** (reviewer signals they are starting evaluation):

```
Polyresearch review claim: thesis #12 by node `bob/node-3e91`.

<!-- polyresearch:review-claim
thesis: 12
node: bob/node-3e91
-->
```

**Review record** (reviewer posts evaluation results):

```
Polyresearch review: thesis #12 by node `bob/node-3e91`, candidate `0.9934`, baseline `0.9979`, observation `improved`.

<!-- polyresearch:review
thesis: 12
candidate_sha: a1b2c3d
base_sha: c0d1e2f
node: bob/node-3e91
metric: 0.9934
baseline_metric: 0.9979
observation: improved | no_improvement | crashed | infra_failure
env_sha: 9f3a2b4c | none
timestamp: 2026-04-06T14:30:00Z
-->
```

The `baseline_metric` is your own measurement of the base SHA, not a number copied from results.tsv or the candidate. You run the evaluation twice: once on the candidate, once on the base. Each review is self-contained.

The `env_sha` is the hash of `.polyresearch/` contents, or `none` if the directory does not exist. If two reviewers report different `env_sha` values, their metrics are not comparable.

**Decision** (lead resolves the PR):

```
Polyresearch decision: thesis #12, candidate `a1b2c3d`, outcome `accepted`.

<!-- polyresearch:decision
thesis: 12
candidate_sha: a1b2c3d
outcome: accepted | non_improvement | disagreement | stale | policy_rejection | infra_failure
confirmations: 2
-->
```

---

## Maintainer feedback

Maintainer `/approve` and `/reject` comments can include free-text guidance. The lead must read this guidance before generating new theses or deciding whether to keep pushing on the same direction.

- Approval reasons indicate what the maintainer wants more of.
- Rejection reasons indicate constraints, dead ends, or priorities the lead should avoid repeating.
- This guidance is directional input, not a license to ignore `PROGRAM.md`, `PREPARE.md`, or the measured results in `results.tsv`.

## Peer review

When `required_confirmations` is greater than 0, candidate PRs go through peer review. The sequence:

1. **Policy check.** The lead diffs the candidate against the editable surface. If it touches files outside the CAN list: `outcome: policy_rejection`, PR closed. Otherwise: `polyresearch:policy-pass` posted.
2. **Review claiming.** Contributors (who did not author the PR) find PRs with `polyresearch:policy-pass` and no `polyresearch:decision`. They post `polyresearch:review-claim`.
3. **Evaluation.** The reviewer checks out the candidate SHA, runs the evaluation per PREPARE.md. Then checks out the base SHA, runs the same evaluation. Both metrics are measured independently.
4. **Review record.** The reviewer posts a `polyresearch:review` comment with both metrics, observation, environment hash, and timestamp.
5. **Maintainer gate.** If `auto_approve` is `false`, the lead waits for a maintainer `/approve` before deciding. The PR should be assigned to `maintainer_github_login` while it is waiting.
6. **Decision.** When the reviewer requirements are satisfied, and the maintainer gate is satisfied when enabled, the lead evaluates and posts `polyresearch:decision`. Merges or closes the PR.

---

## Observations and outcomes

### What reviewers report

The `observation` field in `polyresearch:review` and `polyresearch:attempt` comments.


| Observation      | Meaning                                                   |
| ---------------- | --------------------------------------------------------- |
| `improved`       | Candidate metric beats baseline beyond `metric_tolerance` |
| `no_improvement` | Candidate metric does not beat baseline                   |
| `crashed`        | Evaluation failed to complete (OOM, bug, timeout)         |
| `infra_failure`  | Environment setup failed, could not run evaluation        |


A reviewer reports what they saw. Nothing more.

### What the lead decides

The `outcome` field in the `polyresearch:decision` comment. One per PR.


| Outcome            | Condition                                          | Action                            |
| ------------------ | -------------------------------------------------- | --------------------------------- |
| `accepted`         | Reviewers observed `improved`, metrics agree       | Merge PR, close issue             |
| `non_improvement`  | Reviewers observed `no_improvement`, metrics agree | Close PR, close issue             |
| `disagreement`     | Reviewer metrics diverge beyond `metric_tolerance` | Close PR, close issue             |
| `stale`            | Base SHA moved, candidate no longer comparable     | Close PR, thesis returns to queue |
| `policy_rejection` | Candidate touched files outside editable surface   | Close PR, close issue             |
| `infra_failure`    | Reviewers could not evaluate reliably              | Close PR, thesis returns to queue |


On `stale` and `infra_failure`, the thesis is not permanently closed. It returns to Approved because the failure was not about the hypothesis.

### Evaluation variance

When evaluation produces noisy metrics (variance greater than 10% of `metric_tolerance`), contributors should run the evaluator multiple times and report the mean. The `summary` field in `polyresearch attempt` should note the number of runs and the range.

The lead should consider a candidate that consistently scores higher across multiple runs as `improved`, even if no single run exceeds `metric_tolerance`. When `required_confirmations` is `0`, the lead may accept a candidate whose average metric across N >= 3 self-reported runs exceeds the tolerance, provided the worst single run is no worse than the current baseline.

---

## results.tsv

Tab-separated. One header row and six columns.

```
thesis	attempt	metric	baseline	status	summary
```


| Column     | Description                                                                                                            |
| ---------- | ---------------------------------------------------------------------------------------------------------------------- |
| `thesis`   | Issue reference, e.g. `#12`                                                                                            |
| `attempt`  | Branch name, e.g. `thesis/12-rmsnorm-attempt-1`                                                                        |
| `metric`   | Measured value, or `—` if crashed                                                                                      |
| `baseline` | Metric on `main` at the time of the attempt                                                                            |
| `status`   | `accepted`, `discarded`, `crashed`, `non_improvement`, `disagreement`, `stale`, `infra_failure`, or `policy_rejection` |
| `summary`  | One-line description of what the experiment tried                                                                      |


Example:

```
thesis	attempt	metric	baseline	status	summary
#12	thesis/12-rmsnorm-attempt-1	0.9934	0.9979	accepted	RMSNorm instead of LayerNorm
#12	thesis/12-rmsnorm-attempt-2	0.9980	0.9979	discarded	RMSNorm with different init (no improvement)
#13	thesis/13-gelu-attempt-1	1.0050	0.9934	discarded	Switch to GeLU (regression)
#14	thesis/14-double-width-attempt-1	—	0.9934	crashed	Double model width (OOM)
```

The lead is the sole writer. A single writer eliminates merge conflicts and keeps the log consistent with decision outcomes.

Failed experiments are data. Every attempt gets a row: accepted, discarded, and crashed. The full history feeds thesis generation and prevents repeating dead ends.