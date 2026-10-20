# Typography

Status: original guidance and paired source authored; integration, visual inspection and listening pending. The `strong` and `weak` names identify design intentions, not observed reviewer scores. [Study setup](../../examples/craft-studies/README.md) · [dictionary](../showreel-index.md).

## semantic-type

1. **Purpose:** Make the sentence’s relationship visible.
2. **Use / prerequisites:** Use authored copy whose spatial relationship can carry meaning; keep words intact.
3. **Avoid when:** Avoid replacing product proof with a slogan, or making complex copy move before it can be read.
4. **Controls:** Tie alignment/spacing to meaning, reveal whole semantic units, settle into a readable final phrase. Break Chinese at meaningful boundaries; measure actual glyphs.
5. **Matched contrast:** “Make room for what matters” opens space around “what matters”; the weak variant types the same copy into an undifferentiated block.
6. **Implementation:** [typography.mjs](../../examples/craft-studies/scenes/typography.mjs). DOM text and absolute-time transforms; use the zh portrait option for long Chinese copy.
7. **Verification / cost:** Inspect words at 0.8, 2.4 and 4.6 s and phone size; play through the transition for reading time. Low cost; simplify movement before reducing type size.
8. **Sources / evidence:** #6; user feedback on isolated typewriter openings. Issue proposals are traceable in [the index](../craft-index.md); these new examples remain unverified hypotheses about craft outcomes.

## editorial-hierarchy

1. **Purpose:** Make reading order deliberate.
2. **Use / prerequisites:** Use when headline, supporting copy and source label compete for attention.
3. **Avoid when:** Avoid a rigid grid that breaks the intended language or gives a disclaimer more emphasis than the claim.
4. **Controls:** Control scale, line length, contrast, margins and negative space. Reflow portrait rather than uniformly shrinking landscape.
5. **Matched contrast:** The paired study holds the main phrase above quiet supporting copy; weak gives the same copy similar weight and poor line breaks.
6. **Implementation:** [typography.mjs](../../examples/craft-studies/scenes/typography.mjs). Same typography module; portrait 360×640 fixture and a declared CJK font can expose wrapping/glyph risk.
7. **Verification / cost:** Inspect bounding boxes plus actual glyph images; bounding boxes cannot detect tofu. Hold after settling. Low cost.
8. **Sources / evidence:** #6 Swiss grid; #12 locale; #18 glyph/overflow. Issue proposals are traceable in [the index](../craft-index.md); these new examples remain unverified hypotheses about craft outcomes.
