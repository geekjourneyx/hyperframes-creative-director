# Seekable creative scenes

Let HyperFrames own time, media and export. Let a scene compute its image from an absolute time in seconds. Choose HTML/SVG for readable typography, Canvas for drawing, WebGL/Three.js for GPU scenes, and footage where appropriate. These are options, not quotas.

The [minimal example](../examples/seekable-canvas/index.html) has Canvas and WebGL modes. Copy its three files into an initialized film workspace. The default uses Canvas; `?mode=webgl` selects the shader in preview. For WebGL export, select that factory in the entry script rather than relying on a preview URL query. Neither mode needs an external CDN or paid API.

The installed HyperFrames 0.8.174 runtime dispatches `hf-seek` with `event.detail.time`. Its three adapter participates even without a Three.js scene. A finite root duration is required. `data-no-timeline` marks a composition driven by this adapter; without it the CLI waits for a GSAP timeline that will never register. Do not add a dummy timeline. Register asynchronous construction in `window.__hf.buildReady` before starting it; reject failed resource loads with a useful diagnostic. Check the installed official skills and CLI before relying on this contract after an upgrade.

The included integration tests load the actual installed runtime and call its player transport, not a manually dispatched event. They test backward/random seeks, cold starts, seeds and a cut boundary. A separate CLI export test covers compilation and final MP4 output. Identical pixels are tested within the same browser and renderer; cross-GPU bit equality is not promised.

Use whichever time strategy fits the idea:

| Strategy | Appropriate use | Cost |
| --- | --- | --- |
| Analytical functions of time | Typography, orbital motion, procedural shaders | Low |
| Seeded fixed-step reconstruction | Short physical simulations | Work increases with seek time |
| Deterministic checkpoints and replay | Longer simulations | Memory, checkpoint validation |

Avoid accumulated animation state, unseeded randomness, wall-clock time and network requests during capture. Prepare fonts, textures and assets first. Test seeks in order `0, 1, 2, 1, 0, 2`, then cold-start each time. Inspect frames immediately around cuts and continuous motion, including the exported video. Preserve an approved concept when changing implementation; substantial visual or factual changes need renewed approval.

Sources: [official adapter](https://github.com/heygen-com/hyperframes/blob/main/skills/hyperframes-animation/adapters/three.md), [official core contract](https://github.com/heygen-com/hyperframes/blob/main/skills/hyperframes-core/SKILL.md). Version-specific behavior is verified by this repository's tests, not a compatibility promise for every future version.
