# HyperFrames Creative Director

An English-first Agent Skill for turning a topic, product, article or story into a distinctive promotional film with **HyperFrames + Canvas/WebGL + FFmpeg**.

Creative choices stay open. Review the brief and real keyframes first; inspect the exported film before delivery.

## Install

```bash
npx skills add geekjourneyx/hyperframes-creative-director
npx skills add heygen-com/hyperframes
```

The first command installs this director skill. The second installs the official HyperFrames skills; it does not by itself prove the video CLI, browser or media tools are ready. Use Node.js 22 or newer and check the installed HyperFrames version's requirements.

## Make a film

Ask your coding agent:

> Create a 30-second promotional film from this product README. First show me one brief and actual keyframes for approval. Use HyperFrames and whichever visual techniques fit the content.

The agent checks dependencies and creates a separate workspace:

```bash
npx hyperframes init my-video
cd my-video
npx hyperframes preview
npx hyperframes render
```

Full animation and production rendering follow approval of `BRIEF.md` and the displayed keyframes. Static sketches and keyframe previews can be prepared before approval. English is the default output language; explicitly request another language when needed. Choose aspect ratio and duration in the brief.

For an agent-managed preview handoff, the tested CLI also supports `npx hyperframes preview --background`, `--status` and `--stop`.

## Quality helpers

Run `node <installed-skill>/scripts/director.mjs help` from any directory. The host's skill entry identifies the installed directory; it is not necessarily the repository path. Helpers require Node.js and FFmpeg/ffprobe, with no separate npm install in the skill directory.

| Command | Purpose |
| --- | --- |
| `doctor --workspace PATH` | Inspect dependencies without downloading them |
| `init --parent PATH --name my-video` | Create a new isolated HyperFrames workspace |
| `submit --workspace PATH` | Decode actual keyframe images and record the current brief digest |
| `approve --workspace PATH --confirmation confirmation.json` | Record an observed user confirmation after keyframe review |
| `check-approval --workspace PATH` | Reject stale brief/image approval |
| `render --workspace PATH --output final.mp4` | Check approval and call the official renderer |
| `inspect --workspace PATH --video final.mp4` | Inspect the final file and extract frames and continuous excerpts |
| `delivery --workspace PATH --review .director/review.json` | Check approval, hashes, provenance and review completeness |

See the skill's [keyframe contract](skills/hyperframes-creative-director/references/keyframe-review.md), [media contract](skills/hyperframes-creative-director/references/media-audio.md) and [review contract](skills/hyperframes-creative-director/references/final-review.md) for the small JSON records. `sources.json` is required for delivery; use `[]` when there are no tracked media assets. An optional inspection expectation may supply cut times but cannot weaken the approved format or keyframe schedule.

These are workflow guardrails, not user authentication or a sandbox around the official CLI. Never fabricate approval or playback observations. Missing playback/listening produces a partial decision. A passed technical check cannot prove artistic merit or override the user's rejection.

## Design

- **Director:** understands content and designs the concept, shots and sound.
- **HyperFrames:** composes, seeks, previews and renders the film.
- **Canvas/WebGL:** optional procedural visuals, shaders and 3D.
- **FFmpeg:** media inspection, evidence extraction and post-production.
- **Reviewer:** checks actual final frames, motion, sound and content. Independent review is identified separately from self-review.

No fixed color palette, shot quota, mandatory generated assets or numerical creativity gate. Keep source claims accurate and media rights traceable. Black frames and silence may be intentional; automated detectors raise candidates for contextual review.

## Development

```bash
npm ci
npx playwright install chromium
npm test
npm run test:integration
npm run check:package
```

Install FFmpeg/ffprobe using your OS package manager. Integration checks require Chromium and FFmpeg; `CHROMIUM_PATH` can select an existing compatible Chromium executable. Missing tools fail integration tests rather than counting as a successful render. The synthetic pipeline uses explicitly labeled test approvals and leaves human playback/listening unverified.

The implementation baseline is HyperFrames 0.8.174 and Node.js 22+. Linux is exercised locally; the CI matrix also targets macOS, whose result must be checked on an actual run. Browser/GPU differences may affect pixels. The Canvas/WebGL example tests repeatability within one renderer, not universal bit-exact output. See [evaluation protocol](evals/README.md) for controlled comparisons. No creative pilot or holdout benchmark has established a win rate.

Verified integration coverage includes analytical scenes, successful delayed initialization, exported opening-frame comparison, audio presence and a corrupt final file. Failed font/texture loads, stateful simulations and valid-but-visually-wrong exports need additional fixtures and real visual review; they are not covered by these passes. Provenance validation checks lightweight records, not stock-specific typed metadata or legal authorization.

Known minor issues: silence candidates currently extend to the end of the film, so listen to locate their exact end; the stored `phase` does not automatically change on ready delivery or invalidated approval. Use `check-approval` and the current delivery decision rather than treating the stored phase as authoritative.

Official references: [HyperFrames](https://github.com/heygen-com/hyperframes), [documentation](https://hyperframes.heygen.com/introduction). Runtime behavior is version-sensitive; inspect the installed CLI and official skills when upgrading.

Local video projects, evaluation runs and `docs/superpowers/` are excluded from source control and release packages.

## License

Apache-2.0. This is an independently authored implementation. Third-party media and tools retain their own licenses.
