# Lighting Materials

Status: original guidance and paired source authored; integration, visual inspection and listening pending. The `strong` and `weak` names identify design intentions, not observed reviewer scores. [Study setup](../../examples/craft-studies/README.md) · [dictionary](../showreel-index.md).

## light-reveal

1. **Purpose:** Use changing light to explain form.
2. **Use / prerequisites:** Use where silhouette, surface or craftsmanship belongs to the story.
3. **Avoid when:** Avoid bloom that erases edges or light that implies an unmodeled physical feature.
4. **Controls:** Coordinate sweep direction, edge highlight and contact shadow; hold the fully revealed subject. Bright scenes can use directional light too.
5. **Matched contrast:** An original “FORM / 01” panel gains edge and surface response under one light; weak overlays an unrelated bright wash.
6. **Implementation:** [lighting-materials.mjs](../../examples/craft-studies/scenes/lighting-materials.mjs). CSS surface gradients and deterministic sweep transforms simulate a material study; not a physically based renderer.
7. **Verification / cost:** Inspect highlight rolloff and label contrast, then play the sweep. Low GPU cost; reduce blur layers if needed without losing direction.
8. **Sources / evidence:** #6 rim/sweep; #15 optional cinematic recipe. Issue proposals are traceable in [the index](../craft-index.md); these new examples remain unverified hypotheses about craft outcomes.

## material-depth

1. **Purpose:** Ground objects with surface, shadow and separation.
2. **Use / prerequisites:** Use layered paper, coated surfaces or product material with a coherent lighting setup.
3. **Avoid when:** Avoid adding grain solely to imply quality; texture must not compete with evidence.
4. **Controls:** Align contact/occlusion cues, constrain texture contrast, use a consistent light origin and believable spacing.
5. **Matched contrast:** The paired panel uses quiet texture and a grounded shadow; weak texture competes with the same label and an oversized glow detaches it.
6. **Implementation:** [lighting-materials.mjs](../../examples/craft-studies/scenes/lighting-materials.mjs). Same CSS study; an optional decoded texture asset can replace the procedural pattern. Missing supplied textures reject readiness.
7. **Verification / cost:** Inspect at export size and crop; distinguish intentional stylization from contradictory cues. Low/moderate cost; omit texture before losing hierarchy.
8. **Sources / evidence:** #6 paper/grain; user material/depth. Issue proposals are traceable in [the index](../craft-index.md); these new examples remain unverified hypotheses about craft outcomes.
