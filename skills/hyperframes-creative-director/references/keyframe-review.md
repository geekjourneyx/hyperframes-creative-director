# Keyframe approval

Use one `BRIEF.md` and actual PNG/JPEG/WebP images. The template frontmatter specifies width, height, fps, durationSeconds and audioRequired. Keep the Keyframes table's ID / Time / Path / Kind columns. Times are seconds inside the film duration. Paths are relative to the workspace. Mark concept images honestly; rendered frames come from the intended scene implementation.

Inspect each image for source fidelity, composition, hierarchy, text, crop, safe area and consistent direction. Fix obvious issues before requesting approval. Still frames do not prove motion or audio. Include those intentions and remaining risks in the brief.

The auxiliary CLI supports this sequence:

```bash
node <skill>/scripts/director.mjs submit --workspace <film>
# After actual visual inspection, write .director/keyframe-review.json.
# After the user approves the displayed brief and keyframes:
node <skill>/scripts/director.mjs approve --workspace <film> --confirmation <confirmation.json>
node <skill>/scripts/director.mjs check-approval --workspace <film>
```

`submit` returns the briefDigest. A keyframe review contains that digest, inspected keyframe IDs, reviewer identity, status (`pass`, `changes_required`, `unverified`) and findings. A passing review has no unresolved findings. Record real observation; no tool should automatically manufacture a passing visual review.

A confirmation contains `actor: "user"`, the actual `text`, ISO timestamp `at`, and `sourceRef` identifying the user message. User approval must apply to the version shown. These records prevent mistakes; they are not a secure authorization system and cannot authenticate a message by themselves.

Changing brief bytes or image bytes invalidates the approval. Re-submit, re-review and show the revision. Routine animation or loading fixes do not need fresh creative approval. Material semantic drift in the final result requires renewed approval even if the stored files have not changed.

If the user expressly waives the usual workflow, follow that explicit instruction and report the missing review honestly. Do not write fake approval records to make auxiliary tooling pass. An overridden workflow has no normal approved-delivery certification.
