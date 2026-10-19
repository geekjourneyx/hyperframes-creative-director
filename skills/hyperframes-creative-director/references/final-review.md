# Review the delivered file

Inspect the final MP4 after HyperFrames rendering and FFmpeg postprocessing. Compare it with the source, approved brief and actual keyframes. Watch the whole film with sound; inspect important cuts continuously and use extracted images for layout details. A video-track check does not mean playback was observed. Audio-track presence does not mean someone listened.

Use an independent reviewer with a fresh context when available. Supply source material, approved brief/keyframes, final MP4, evidence and provenance. Do not supply the director's own quality verdict first. If no independent reviewer is available, perform an honest self-review and label `reviewerMode: "self-review"`. If playback or listening is unavailable, set it to `unverified`; the decision stays partial. Do not manufacture reviewer observations to make an integration test or deadline look successful.

Assess communication and craft in context: factual accuracy, clarity, concept, originality, visual coherence, readable typography, temporal continuity, sound and meaningful rhythm. No fixed genre, palette, number of shots, particle count or aesthetic score is mandatory. Technical checks enforce delivery facts; creative feedback explains what the viewer experiences and why a change would improve it.

Write `.director/review.json` with:

```json
{
  "schemaVersion": 1,
  "videoSha256": "SHA256_FROM_EVIDENCE",
  "briefDigest": "CURRENT_APPROVED_DIGEST",
  "reviewerMode": "independent",
  "playback": "unverified",
  "audio": "unverified",
  "findings": [],
  "limitations": ["Playback has not been observed yet."]
}
```

Each finding has `id`, `category` (`technical`, `content`, `visual`, `motion`, `creative`), `severity` (`blocker`, `major`, `minor`), `expected`, `observed`, nonempty workspace file paths in `evidence`, optional `[start,end]` seconds in `range`, and `resolution` (`open`, `fixed`, `intentional`). An intentional choice needs `rationale`; technical failures and factual errors cannot be waived that way. Candidate finding IDs must match the detector check IDs. Fixing a candidate requires fresh inspection: if the same candidate persists in the new evidence, explain its intentional disposition or leave it open.

Use `not-applicable` for audio only when the final file has no audio track. Missing mandatory checks produce `partial`; failed checks, stale approvals, unresolved technical/factual errors at any severity, and unresolved major/blocker findings produce `changes_required`. Minor visual or creative findings can remain in a ready report. Only complete evidence with observed playback can produce `ready`. Self-review remains visible even when ready. A ready result is a workflow assessment, not a guarantee of artistic impact or a substitute for the user's acceptance.

Prioritize repairs by viewer impact and cost. Keep the previous candidate so improvements can be compared. After repair, recheck the affected interval and the full film, and bind the review to the new video hash. Respect the user's budget; do one complete review and necessary repair pass by default, then discuss scope if significant additional time or cost is needed. Do not loop endlessly toward an arbitrary score.

If the user rejects a version, it is not accepted delivery even if the tools pass. Record the rejection and requested revision. Major changes to the concept, claims, format or keyframes require renewed approval. Implementation fixes that preserve the approved intent do not require another creative approval round.

Present the [review summary](../templates/REVIEW.md), final video, editable project, provenance and any limitations. Never claim a human or agent watched or heard material that it did not actually observe.
