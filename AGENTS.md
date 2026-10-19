# Contributor instructions

- Write README, skill instructions, references, templates, code comments and user-facing messages in English. Default generated film language to English; honor user overrides.
- Preserve creative freedom. Add a general creative constraint only with evidence that it improves outcomes across tasks.
- Use official HyperFrames APIs and installed CLI help. Do not invent a second renderer or substitute manual seek events for real integration evidence.
- For a user's film, show actual reviewed keyframes and one brief before full production. Record genuine user approval. Never fabricate approval or review evidence.
- Run meaningful tests for state, filesystem, media and delivery behavior. Distinguish unit tests, actual render integration and creative evaluation.
- Use parameter arrays for subprocesses. Keep paths inside the intended workspace and do not overwrite existing projects.
- Keep `docs/superpowers/`, `.superpowers/`, `workspaces/`, `eval-runs/`, credentials and generated production media untracked. Never force-add them. Check the staged file list and package contents before publishing.
- Maintain the package allowlist. Do not include private plans in release archives, PR descriptions or attachments.
- Do not copy AGPL code from the earlier motion-director project into this independently authored Apache-2.0 implementation.
