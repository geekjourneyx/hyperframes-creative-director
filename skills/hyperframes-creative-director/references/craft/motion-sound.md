# Motion Sound

Status: original guidance and paired source authored; integration, visual inspection and listening pending. The `strong` and `weak` names identify design intentions, not observed reviewer scores. [Study setup](../../examples/craft-studies/README.md) · [dictionary](../showreel-index.md).

## motion-phrasing

1. **Purpose:** Give a movement anticipation, arrival and readable rest.
2. **Use / prerequisites:** Use when timing can express gathering, release, impact or resolution.
3. **Avoid when:** Avoid keeping every element moving, snapping before comprehension, or prescribing a music beat to silent content.
4. **Controls:** Control travel interval, easing and settle separately; hold the result. Author in seconds or convert selected musical anchors explicitly.
5. **Matched contrast:** A carrier gathers, arrives at 2.4 s and becomes punctuation in “Make it clear.”; weak keeps bouncing past the same target.
6. **Implementation:** [motion-sound.mjs](../../examples/craft-studies/scenes/motion-sound.mjs). Absolute-time DOM transforms; optional generated original WAV is a deterministic authoring fixture, not a sound engine.
7. **Verification / cost:** Inspect seek repeatability and continuous motion; stills cannot prove timing. Low cost. Keep a silent variant valid.
8. **Sources / evidence:** #6 squash/carrier/lockup; #14 seek. Issue proposals are traceable in [the index](../craft-index.md); these new examples remain unverified hypotheses about craft outcomes.

## sound-punctuation

1. **Purpose:** Use contrast and an accent to support a meaningful arrival.
2. **Use / prerequisites:** Use an original or licensed track with measured/observed anchors; the study’s optional WAV is original synthesized sound.
3. **Avoid when:** Avoid assuming a verified flag proves listening, covering speech, or forcing music on a silent brief.
4. **Controls:** Create silence before the chosen arrival, place impact deliberately, and fade the tail. Record track hash/crop and fps-specific offsets.
5. **Matched contrast:** Strong optional sound lands at 2.4 s after silence; weak repeats the same tone across the quiet interval. Both accompany identical copy.
6. **Implementation:** [motion-sound.mjs](../../examples/craft-studies/scenes/motion-sound.mjs). Run the documented source WAV generator after testing resumes; HyperFrames owns the audio element and mux. Do not autoplay a second clock.
7. **Verification / cost:** Listen to the actual final export; measure LUFS/true peak separately from a project target. No target is universal and measurements never establish creative success.
8. **Sources / evidence:** #6 one-beat silence; #17 SFX; FFmpeg loudnorm. Issue proposals are traceable in [the index](../craft-index.md); these new examples remain unverified hypotheses about craft outcomes.
