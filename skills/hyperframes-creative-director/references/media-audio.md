# Media, music and final-file evidence

Source material should serve the concept. Use original generated graphics, supplied assets, captured product UI or licensed footage. Verify factual product claims against the source. Keep real UI recognizable and readable; invented UI must be described as a concept. A link to a license is not proof that every use is permitted.

Maintain `sources.json` as an array of `{path, source, license, permission, evidence}`. `path` is relative to the film workspace. `permission: "resolved"` means the creator has checked the specific use and recorded its basis in `evidence`; this helper only checks completeness. Record unknown permissions honestly and resolve them before ready delivery. Original code needs a source entry only when it produces a separately tracked asset; no external assets means an empty array is valid.

For stock media, record the exact item URL in `source`, the specific license reference in `license`, and the acquisition date, origin and attribution obligations in `evidence`. In v0.1 these are free-text records reviewed by the agent; the validator checks nonempty fields and resolved permission, not typed stock-specific metadata or legal validity. Do not infer authorization from that structural check.

For music, consider user-supplied licensed tracks and sites such as [Pixabay Music](https://pixabay.com/music/) and [Mixkit Music](https://mixkit.co/free-stock-music/). Check the current terms on the selected track. Save attribution requirements and acquisition evidence. Do not assume a site's entire catalog grants the same permissions. Search, download and paid generation depend on available tools and the user's scope.

Plan a sound arc, meaningful accents and room for speech. BPM and beat detection help locate candidates, but align to the actual waveform and listen. A hold, offbeat entrance, silence or a film without music can be deliberate. Never force every cut onto a beat. FFmpeg can prepare, mix and encode sound; inspect the final muxed file after any postproduction change.

`inspect` checks full decode, streams, dimensions, CFR timestamps, duration and required audio. It extracts images and continuous excerpts around selected times and cut boundaries. Black intervals, silence and near-full-scale peaks are candidates for contextual review, not automatic defects. This is not a complete flicker detector, loudness compliance checker or perceptual music-sync judge. Watch the whole final MP4 with sound; screenshots cannot verify motion or listening.

Evidence belongs to the final file's SHA-256. Reinspect and rereview after replacing, remuxing or editing it. Missing tools, failed extraction and unobserved playback remain explicit limitations. Do not present a preview or a collection of images as a verified video.

## Optional final-file measurements and anchors

`inspectVideo` adds advisory `audioMetrics` (integrated LUFS and true peak dBTP) using FFmpeg loudnorm **input** measurements on the final muxed file's first audio stream. It does not normalize or rewrite that file. Missing tools, malformed/non-finite reports and digital silence remain `unverified`; absence of an audio stream is `not-applicable`. Pass `measureAudioMetrics: false` to the JS helper to disable this optional pass. Existing evidence without the field remains valid. Required checks and delivery readiness are unchanged; a measured value does not certify listening or a target.

The separate `audioMeasurement` path/hash locates the raw tool report bound to `videoSha256`. It is advisory provenance, not an authenticated independent review or a new delivery gate. If distributing multiple audio tracks, select and assess every required track separately; this helper only measures `0:a:0`. Record the project's delivery target and source when one exists. Neither −14 LUFS nor −1.5 dBTP is universal.

For music synchronization, keep a lightweight project note (not a required schema): source/license evidence, soundtrack SHA-256, crop start in seconds, BPM if relevant, anchor source-time seconds, intended film-time seconds, candidate/observed status and actual listening reference. A `verified` label alone proves nothing. Example: an observed source accent at 12.4 s with a 10 s crop maps to film 2.4 s before any intentional sound lead. Five frames at 30 fps means 0.167 s, not 0.05 s. Convert beats/hits to final seconds/frames; choose any one-frame tolerance only for explicitly synchronized events. Offbeat cuts, silent films and intentional time remapping remain valid. Re-measure/listen after soundtrack crop or rate changes.

Risers, impacts, whooshes, J-cuts, ducking and fade-outs are optional mechanisms. Preserve intelligible speech and purposeful contrast. The [motion/sound study](craft/motion-sound.md) supplies an original deterministic WAV source; its actual mux and listening remain unverified.
