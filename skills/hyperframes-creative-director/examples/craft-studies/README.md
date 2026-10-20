# Paired craft studies

Six original 6-second source studies, each with `strong` and `weak` variants using matched subject/copy. The names describe intended craft differences, not validated rankings. **No new study has been rendered, visually inspected or listened to in this upgrade.** Automated tests and creative evaluation are paused at the user's request. These are a dictionary, not a ready film or a required storyboard.

## Preview and export after validation resumes

Requirements are the repository's pinned HyperFrames 0.8.174, Node 22+, Chromium and FFmpeg/ffprobe. Do not install or run these commands while validation is paused. From the repository root, choose a new, unused workspace:

```bash
npx hyperframes init workspaces/craft-study --non-interactive
cp -R skills/hyperframes-creative-director/examples/craft-studies/. workspaces/craft-study/
npx hyperframes preview workspaces/craft-study
```

Edit the copied `config.mjs` to select `family` and `variant`. Families are `typography`, `product-evidence`, `lighting-materials`, `masks-transitions`, `spatial-3d`, and `motion-sound`. This list selects these fixtures only; it is not a permitted-technique enum for films. The optional query `?family=spatial-3d&variant=weak` selects a preview. **Export selection must be written to config.mjs**, since the CLI does not use that preview query.

The HTML root declares `data-width`, `data-height`, `data-duration` and `data-fps`. Change the copied HTML dimensions for export; the JS reads those same attributes. For the Chinese vertical fixture, set `locale: 'zh'`, change the root to 360×640 (or the intended delivery size), and provide a suitable local CJK font through `fontUrl`. `?family=typography&locale=zh&portrait=1` is a preview shortcut. The long copy is “把分散的信息，变成清晰的下一步。” Inspect actual glyphs and wrapping; system fallback and passing bounds checks do not prove correct glyphs.

`fontUrl` and `textureUrl` refer to supplied local workspace assets; missing resources reject readiness. A valid image is decoded before use in the material study. Fonts/textures are not fetched during seek. No third-party media is bundled. The geometry, prose, illustrative UI and synthetic sound source are original. Replace illustrative UI with genuine sourced product evidence before making real claims.

```bash
npx hyperframes render workspaces/craft-study -o workspaces/craft-study/final.mp4 --quality draft
```

For a user's film, follow the normal brief/keyframe approval and final-file review. The standalone source-fixture command is not approval evidence. Keep generated media under ignored workspaces or eval-runs; never commit it into this installed example.

## Optional motion/sound variant

In the copied workspace, select `motion-sound`, then generate a local WAV (the script refuses to overwrite an existing file):

```bash
node make-audio.mjs sound.wav strong
```

Add this element inside the composition root in the copied `index.html` **before rendering**, so HyperFrames can discover the source and mux it:

```html
<audio id="study-sound" src="sound.wav" preload="auto" data-start="0" data-duration="6"></audio>
```

HyperFrames owns audio playback and time. The source generator is not an audio renderer or mixer. For a matched weak comparison use `node make-audio.mjs weak.wav weak`, point the audio element to `weak.wav`, and select `variant: 'weak'`. Strong has silence before the designed 2.4 s arrival and a decaying tail; weak repeats the same tone across the quiet interval. Absence of the element intentionally produces a silent study. Listening to the final mux and checking timing remain necessary.

## Internal contract and review

Each family exports `createStudy({container, assets, variant})` with `{durationSeconds, ready, renderAt(timeSeconds), dispose()}`. Await `ready`. Fonts, textures, audio and WebGL startup failures remain explicit. Post-start context loss revokes the registered readiness promise and shows a fatal diagnostic; actual renderer response still awaits integration verification. Construction is registered in `window.__hf.buildReady.scene`; the installed runtime sends `hf-seek`. There is no independent clock, animation loop, dummy GSAP timeline or new plugin API. The WebGL study uses actual mesh geometry, perspective, depth testing, directional shading and a window mask revealing the supporting layers; the material study is a CSS approximation, labeled accordingly.

The authored integration suite uses the installed runtime for backward/cold seeks, failure cases and a Chinese portrait layout; it also invokes the official renderer for all six strong studies, compares exported frames to preview and checks the sound arrival. It has **not been executed**. Run only after the user resumes validation:

```bash
node --test tests/audio.test.mjs
node --test tests/integration/craft.spec.mjs
```

Those test commands run from the repository root. Review at least 0.8, 2.4 and 4.6 seconds, the mask match at 3−1/fps and 3 seconds, continuous playback, small-screen reading and the actual sound. Render and compare both variants before asserting the intended contrast worked. A still cannot establish pace or sound quality. WebGL pixels may vary across GPUs; repeatability is scoped to one renderer/environment. No screenshot, preview URL, export hash or reviewer observation is fabricated here; add them to the dictionary only after actual inspection.
