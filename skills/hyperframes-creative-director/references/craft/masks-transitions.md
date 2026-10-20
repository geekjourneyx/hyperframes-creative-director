# Masks Transitions

Status: original guidance and paired source authored; integration, visual inspection and listening pending. The `strong` and `weak` names identify design intentions, not observed reviewer scores. [Study setup](../../examples/craft-studies/README.md) · [dictionary](../showreel-index.md).

## semantic-mask

1. **Purpose:** Make revelation express the subject’s transformation.
2. **Use / prerequisites:** Use when a boundary such as a frame, fold, portal or source region belongs to the idea.
3. **Avoid when:** Avoid decorative wipes that hide crucial evidence or make reading order unpredictable.
4. **Controls:** Anchor the mask to a meaningful object; reveal supporting content in a stable coordinate system. Keep a final unmasked hold.
5. **Matched contrast:** A frame labeled “Find the connection” opens to expose linked source and result; weak wipes the same content diagonally with an unrelated rotating boundary.
6. **Implementation:** [masks-transitions.mjs](../../examples/craft-studies/scenes/masks-transitions.mjs). CSS clip-path with analytical progress in the masks-transitions module.
7. **Verification / cost:** Inspect just before/after the reveal and continuous occlusion; check text remains readable after release. Low cost; fall back to a simpler content-shaped crop.
8. **Sources / evidence:** User semantic masks; #6 iris/ripple. Issue proposals are traceable in [the index](../craft-index.md); these new examples remain unverified hypotheses about craft outcomes.

## match-transition

1. **Purpose:** Preserve an intentional visual relationship across a cut.
2. **Use / prerequisites:** Use matching shapes, positions, movement or gaze between two source-bound scenes.
3. **Avoid when:** Avoid forcing an attractive match that suggests a false factual relationship.
4. **Controls:** Align the key shape and focal point at the cut, then change context; choose timing from reading and motion intent.
5. **Matched contrast:** A source rectangle becomes a result rectangle at the same position at 3 s; weak jumps position and orientation with the same content.
6. **Implementation:** [masks-transitions.mjs](../../examples/craft-studies/scenes/masks-transitions.mjs). Same module, piecewise renderAt at the 3-second boundary.
7. **Verification / cost:** Inspect 3−1/fps and 3 s plus playback across the cut. A cut still needs motion review; no universal fastest-motion rule.
8. **Sources / evidence:** #6 match cuts; #10 dictionary boundary. Issue proposals are traceable in [the index](../craft-index.md); these new examples remain unverified hypotheses about craft outcomes.
