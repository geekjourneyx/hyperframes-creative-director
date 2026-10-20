# Evaluation protocol

This repository provides a protocol and reporting tools. It does not establish a creative-quality advantage over the earlier skill, another framework or another model.

Use the five public briefs in `cases.json` for regression. Compare the new director with a stated baseline under the same model, tools, source assets, runtime, budget and review conditions. Start with one product, one WebGL and one montage pilot. A full matrix is five briefs × three conditions × three repetitions = 45 films; choose and document the three conditions before running it. Keep reviewer ablations separate. User films require genuine brief/keyframe approval; synthetic approvals belong only to clearly identified software test fixtures.

Each JSONL row records `runId`, `caseId`, `condition`, `repetition`, `model`, `harnessVersion`, `sourceCommit`, `seed`, `environment`, `assetsSet`, `budget`, `firstDeliverable`, `finalDeliverable`, `contentErrors`, `renderDefects`, `interventions`, `elapsedSeconds`, `tokens`, `cost`, `reviewMode`, `outputPath`. Mark interrupted and failed attempts with false deliverable flags. Use null for unknown numeric metrics and missing output paths. Record the model's exact identity, renderer/browser/OS versions, token/time/money limits, and asset manifest. Do not silently replace a failed attempt.

```bash
node evals/scripts/report.mjs eval-runs/runs.jsonl
```

The report preserves failures in denominators, unknown costs and separate control groups. It is descriptive, not a significance test. Compare matched case/repetition/seed groups. Do not rank results pooled across budgets, models, assets or review modes.

Import `writeBlindPackage(runs, {seed, outputDir})` to prepare pairs from exactly two conditions. Choose a new directory under ignored `eval-runs/`. Give the reviewer only the copied `reviewer/` directory and neutral briefs; keep `private-mapping.json` outside their access. The code changes filenames, not embedded title cards, metadata or watermarks. Audit these identity clues and disclose imperfect blinding rather than altering substantive content. Same filesystem access is not true isolation. Failed outputs are null, and must be reported as missing rather than removed from the study. The private map retains condition and source paths; never publish it with anonymous review materials.

Record pair judgments as `{pairId, choice: "A" | "B" | "tie", reasons, evidence}`. Use the qualitative rubric and inspect full videos with sound. Keep human/independent-agent judgments distinguishable from self-review.

Process evaluations inspect actual action traces: rendering before approval, fake user confirmations, absent keyframes, changed approved content, claiming playback without tools, tool failures, and stopping at a plan when a film was requested. Treat an explicit user change to the approval workflow separately from pressure to bypass an unchanged requirement. Test that the agent explains limitations and proceeds on authorized work without fabricating evidence. Keywords alone are insufficient.

An independent party should retain unseen briefs and outcomes. Development agents must not inspect that holdout. Record public-case contamination and report regression, pilot and holdout results separately. Rerun the same controls when models improve; remove constraints only when evidence supports doing so. No public pilot or holdout creative comparison has been run for v0.1.

## Craft upgrade pilot

**Status: protocol prepared; no films, tests, renders, playback or listening run.** The user paused automated verification pending their environment and further instruction. Do not publish a results report until real observations exist.

Compare baseline commit `94435add17ac5af8095cbc99dfbe748fd37d7c3a` with the exact upgraded PR commit recorded at run time. Use four public cases in `cases.json` marked `pilot: "craft-upgrade"`, one film per condition: four matched pairs/eight films. The existing five regression briefs remain unchanged. This is a public diagnostic pilot, not an unseen holdout or a powered superiority test.

Freeze before either condition: exact model/harness and system instructions, source/asset manifest and rights, renderer/browser/OS, format/duration, seed where supported, token/time/money caps and approval/revision opportunities. Supply real product evidence and the requested brand assets to both; asset descriptions in cases.json are requirements, not files already provided. Keep the baseline free of new reference injection. Count all failed and interrupted attempts. A failed output remains missing in its pair, not silently regenerated or excluded.

Use the existing JSONL/report/blind-package format. Record first/final deliverability, factual errors, render defects, user interventions, revisions, elapsed time, tokens and cost. Add timestamped paired judgments on clarity, source fidelity, coherence, craft and motion/sound. Give reviewers neutral briefs and actual complete films, never technique counts, source condition labels or the author's scores. Record ties, disagreement, uncertainty and imperfect blinding. Self-review is not independent review; a second agent with access to the private map is not truly blind.

At least one brief has a content relationship absent from the detailed examples. Review whether a useful custom approach, adaptation or library-free direction emerged, and whether unnecessary library reading consumed budget. Do not reward novelty by itself or penalize an apt familiar technique. Bright, Chinese, silent and spatial cases must remain viable without inheriting dark palettes, mandatory drops or catalog membership.

When resumed, run targeted regressions and the six source-study exports before expensive paired films. Review both strong/weak variants and publish previews only after actual inspection. If quality gains are mixed, retain conditionally useful references and repair harmful guidance. Report descriptive outcomes, costs and limitations in `docs/evaluations/craft-upgrade-pilot.md` only after the experiment; there is intentionally no results file yet. Repeat promising comparisons with new runs and independently held unseen briefs before claiming general improvement.
