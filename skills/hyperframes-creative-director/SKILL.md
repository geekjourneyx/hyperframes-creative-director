---
name: hyperframes-creative-director
description: "Use when creating, revising, or reviewing a promotional film, product launch video, article-to-video piece, kinetic typography, or creative short from a topic, story, product, or source material with HyperFrames and optional Canvas/WebGL."
---

# HyperFrames Creative Director

Turn the user's content into a distinctive, complete film. Let the content guide the concept and the concept guide the technique. Default to English, approximately 30 seconds, 1080p and 30 fps; honor explicit language, duration and platform requests. State the chosen format in the brief.

## Workflow

1. **Understand.** Read the actual source. Identify the audience, essential message, factual claims and desired response. Explore a compelling visual idea. Consult [creative direction](references/creative-direction.md) only when useful.
2. **Prepare.** Follow [environment checks](references/environment.md). Check Node, the official HyperFrames CLI and skills, browser, fonts, and FFmpeg/ffprobe. Install missing dependencies within the user's permissions. For a new film, create a separate workspace with `npx hyperframes init my-video`; work inside that directory. For a revision, inspect the existing film workspace and approval state before changing it. Never initialize over an existing project.
3. **Show the direction.** Produce one [BRIEF.md](templates/BRIEF.md) and actual keyframe images. Include copy, narrative, sound direction and keyframe locations. Label images `concept` or `rendered`. Inspect the images for clarity, composition, readability and source fidelity before showing them. If image viewing is unavailable, report the visual review as unverified; image decoding alone is insufficient.
4. **Obtain approval.** Follow [keyframe review and approval](references/keyframe-review.md). Ask the user to approve the brief and displayed keyframes together. Text-only approval does not establish approval of unseen images. Urgency or approval of copy alone does not waive keyframe approval. Record the user's actual confirmation, never a confirmation invented by the agent. Wait before full animation or film production. Material changes to copy, concept, format or approved images require renewed approval; routine technical fixes do not. If the user explicitly changes this workflow, describe the changed scope honestly.
5. **Produce.** Use HyperFrames for composition, timing, preview and export. Select HTML/SVG, Canvas/WebGL, Three.js, generated or licensed media as the concept needs. For programmed scenes, read [seekable Canvas/WebGL](references/hyperframes-canvas.md); for assets and sound, read [media and audio](references/media-audio.md). Use one seekable clock and prepare assets before rendering. Run `check-approval` immediately before each full render, then `npx hyperframes preview` and `npx hyperframes render`; inspect installed CLI help for version-specific options. Use the official background preview option for an agent-managed handoff when supported.
6. **Review and improve.** Follow [final review](references/final-review.md). Review the actual exported MP4, including continuous motion and sound. Compare keyframes with the approved direction. Separate technical failures, factual mistakes, contextual visual issues and creative judgments. Repair the highest-impact issues, retain the better version and recheck adjacent shots and the complete film. A screenshot sheet cannot verify timing or sound. Report unavailable checks as unverified.
7. **Deliver.** Supply the MP4, reproducible source, brief, keyframes, media provenance and a concise review. Never present self-review as independent review or inferred quality as observed evidence.

## Creative freedom

Choose style, shot count, color, camera, pacing, music and effects freely. No mandatory twist, generated background, particle count, fixed director template or aesthetic score threshold. A quiet scene can be effective. A programmed scene can be sufficient.

Use independent reviewer context when available: source facts, approved brief, keyframes and film first; omit the author's self-score and justification. Technical checks support judgment; they do not certify creativity or audience response.

Run `node <installed-skill>/scripts/director.mjs help` for helper commands. Resolve the installed skill directory from the host's skill entry; do not assume the current working directory is this repository. Helpers use Node built-ins and the installed media/HyperFrames tools. They record observations supplied by the agent, not authenticated user identities or automated aesthetic judgments.
