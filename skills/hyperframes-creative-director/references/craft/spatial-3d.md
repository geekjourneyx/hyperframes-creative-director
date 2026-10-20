# Spatial 3D

Status: original guidance and paired source authored; integration, visual inspection and listening pending. The `strong` and `weak` names identify design intentions, not observed reviewer scores. [Study setup](../../examples/craft-studies/README.md) · [dictionary](../showreel-index.md).

## spatial-product-stage

1. **Purpose:** Use depth and light to clarify object construction.
2. **Use / prerequisites:** Use physical objects or concepts with meaningful layers; have geometry/assets or label a synthetic study.
3. **Avoid when:** Avoid rotating real UI away from readability or implying nonexistent product internals.
4. **Controls:** Use real depth, occlusion, perspective, coherent lighting and controlled camera travel. Finish with a stable recognizable subject.
5. **Matched contrast:** Original WebGL panel geometry settles into a lit three-quarter view; weak keeps orbiting the same geometry and loses a stable reading axis.
6. **Implementation:** [spatial-3d.mjs](../../examples/craft-studies/scenes/spatial-3d.mjs). WebGL mesh, depth testing, perspective camera and directional shading; a growing window mask in the foreground panel reveals supporting layers behind it. This coordinates light, mask and spatial movement without an external dependency. CSS label is an illustrative overlay, not a texture on real hardware.
7. **Verification / cost:** Inspect silhouette, depth ordering and final hold; actual export and GPU startup require verification. Moderate cost; simplify mesh/light before abandoning the spatial idea.
8. **Sources / evidence:** User 3D; #6 light; #16 device. Issue proposals are traceable in [the index](../craft-index.md); these new examples remain unverified hypotheses about craft outcomes.

## camera-through-content

1. **Purpose:** Explain relationships through motivated spatial travel.
2. **Use / prerequisites:** Use a journey with landmarks or layers that viewers need to understand.
3. **Avoid when:** Avoid an unrelated tunnel, unmotivated spin or parallax that changes real evidence identity.
4. **Controls:** Tie travel to a narrative destination, retain landmarks, control near-plane occlusion and settle for reading.
5. **Matched contrast:** The camera approaches separated panels and ends with their relationship visible; weak oscillates its orientation and never gives the same stable arrival.
6. **Implementation:** [spatial-3d.mjs](../../examples/craft-studies/scenes/spatial-3d.mjs). Same spatial module; view/projection are reconstructed from absolute time, with explicit WebGL failure diagnostics.
7. **Verification / cost:** Seek backward and cold-start; play near intersections and the final hold. Lower geometry complexity for budget, retaining landmarks.
8. **Sources / evidence:** User content-led camera; #6 infinite zoom/isometric; #14 deterministic seek. Issue proposals are traceable in [the index](../craft-index.md); these new examples remain unverified hypotheses about craft outcomes.
