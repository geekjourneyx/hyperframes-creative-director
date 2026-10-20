# Environment and workspaces

Check Node.js >=22, npm, the installed HyperFrames CLI, its official skills, browser, fonts, FFmpeg/ffprobe and the resources needed by this project. Run the bundled `director.mjs doctor --workspace <path>` through Node. It is a read-only inventory: unverified browser/GPU/network/font checks still require an actual capability test. Global CLI absence does not imply npx or project-local execution is unavailable.

Install official skills with `npx skills add heygen-com/hyperframes`. This installs agent guidance, not proof of a working video CLI. The official router may offer a smaller non-interactive core installation using `npx hyperframes skills update`; check current help and record which set was installed. Avoid unconditionally installing every optional skill. Read official runtime guidance as needed; the user's approved creative direction takes precedence over default aesthetic recipes.

Within the user's permissions, install missing dependencies and record versions. Do not silently upgrade global tools. Inspect `npx hyperframes --help`, `npx hyperframes doctor` and the installed package requirements. A missing browser, unavailable network or GPU limitation is a blocker or an explicit capability limitation, not a successful check.

Create a new directory for each film:

```bash
npx hyperframes init my-video
cd my-video
```

Never use an existing nonempty directory as an initialization target. Keep assets, keyframes, source, renders and review evidence together. Names with spaces must remain a single subprocess argument. Pin dependencies, record seeds and localize required assets before rendering.
