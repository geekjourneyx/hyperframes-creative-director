# Media, music and final-file evidence

Source material should serve the concept. Use original generated graphics, supplied assets, captured product UI or licensed footage. Verify factual product claims against the source. Keep real UI recognizable and readable; invented UI must be described as a concept. A link to a license is not proof that every use is permitted.

Maintain `sources.json` as an array of `{path, source, license, permission, evidence}`. `path` is relative to the film workspace. `permission: "resolved"` means the creator has checked the specific use and recorded its basis in `evidence`; this helper only checks completeness. Record unknown permissions honestly and resolve them before ready delivery. Original code needs a source entry only when it produces a separately tracked asset; no external assets means an empty array is valid.

For stock media, record the exact item URL in `source`, the specific license reference in `license`, and the acquisition date, origin and attribution obligations in `evidence`. In v0.1 these are free-text records reviewed by the agent; the validator checks nonempty fields and resolved permission, not typed stock-specific metadata or legal validity. Do not infer authorization from that structural check.

For music, consider user-supplied licensed tracks and sites such as [Pixabay Music](https://pixabay.com/music/) and [Mixkit Music](https://mixkit.co/free-stock-music/). Check the current terms on the selected track. Save attribution requirements and acquisition evidence. Do not assume a site's entire catalog grants the same permissions. Search, download and paid generation depend on available tools and the user's scope.

Plan a sound arc, meaningful accents and room for speech. BPM and beat detection help locate candidates, but align to the actual waveform and listen. A hold, offbeat entrance, silence or a film without music can be deliberate. Never force every cut onto a beat. FFmpeg can prepare, mix and encode sound; inspect the final muxed file after any postproduction change.

`inspect` checks full decode, streams, dimensions, CFR timestamps, duration and required audio. It extracts images and continuous excerpts around selected times and cut boundaries. Black intervals, silence and near-full-scale peaks are candidates for contextual review, not automatic defects. This is not a complete flicker detector, loudness compliance checker or perceptual music-sync judge. Watch the whole final MP4 with sound; screenshots cannot verify motion or listening.

Evidence belongs to the final file's SHA-256. Reinspect and rereview after replacing, remuxing or editing it. Missing tools, failed extraction and unobserved playback remain explicit limitations. Do not present a preview or a collection of images as a verified video.
