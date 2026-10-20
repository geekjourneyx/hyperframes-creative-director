# Keyframe approval

Use one `BRIEF.md` and actual PNG/JPEG/WebP images. The template frontmatter specifies the flat technical keys width, height, fps, durationSeconds and audioRequired. Additional metadata is allowed; duplicate technical keys are rejected. Keep the Keyframes table's ID / Time / Path / Kind columns. Times are seconds inside the film duration. Paths are relative to the workspace. Mark concept images honestly; rendered frames come from the intended scene implementation.

Inspect each image for source fidelity, composition, hierarchy, text, crop, safe area and consistent direction. Fix obvious issues before requesting approval. Still frames do not prove motion or audio. Include those intentions and remaining risks in the brief.

The auxiliary CLI supports this sequence:

```bash
node <skill>/scripts/director.mjs submit --workspace <film>
# After actual visual inspection, write .director/keyframe-review.json.
# After the user approves the displayed brief and keyframes:
node <skill>/scripts/director.mjs approve --workspace <film> --confirmation <confirmation.json>
node <skill>/scripts/director.mjs check-approval --workspace <film>
```

`submit` returns the briefDigest. A keyframe review contains that digest, inspected keyframe IDs, reviewer identity, status (`pass`, `changes_required`, `unverified`) and findings. A passing review has no unresolved findings. Start with the following record and replace the digest with the value returned by `submit`:

```json
{
  "briefDigest": "<digest returned by submit>",
  "reviewer": "<actual reviewing agent or person>",
  "status": "unverified",
  "inspected": [],
  "findings": []
}
```

After actually viewing each image, add its ID to `inspected`, record problems in `findings`, and set `status` to `pass` only when every current image has been inspected and findings are resolved. If image viewing is unavailable, retain `unverified`; decoding or file existence is insufficient. No tool should automatically manufacture a passing visual review.

A confirmation contains `actor: "user"`, the actual `text`, ISO timestamp `at`, and `sourceRef` identifying the user message. Create the confirmation file inside the film workspace only after the user responds, using the real message values:

```json
{
  "actor": "user",
  "text": "<verbatim user confirmation>",
  "at": "<actual ISO 8601 timestamp with timezone>",
  "sourceRef": "<actual user message reference>"
}
```

These are placeholders, not an approval fixture. User approval must apply to the version shown. These records prevent mistakes; they are not a secure authorization system and cannot authenticate a message by themselves.

Changing brief bytes or image bytes invalidates the approval. `check-approval` also invalidates incomplete stored evidence and returns the phase to `awaiting_approval`. Re-submit, re-review and show the revision; the old record cannot approve new content. Routine animation or loading fixes do not need fresh creative approval. Material semantic drift in the final result requires renewed approval even if the stored files have not changed.

Urgency, a deadline, or approval of copy alone does not waive approval of unseen keyframes. If the user expressly waives the usual workflow, follow that explicit instruction and report the missing review honestly. Do not write fake approval records to make auxiliary tooling pass. An overridden workflow has no normal approved-delivery certification.
