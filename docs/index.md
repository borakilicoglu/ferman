---
layout: home

hero:
  name: "ferman"
  text: "Inspect ports. Free them fast."
  tagline: "A cross-platform CLI for identifying and releasing busy ports with predictable output for humans and AI agents."
  image:
    src: /logo.svg
    alt: ferman logo
  actions:
    - theme: brand
      text: Get Started
      link: /#install
    - theme: alt
      text: GitHub
      link: https://github.com/borakilicoglu/ferman

features:
  - title: Human and agent friendly
    details: Use interactive prompts when you want safety, or use JSON output and exit codes when you need automation.
  - title: Cross-platform
    details: Supports macOS, Linux, and Windows with platform-specific process inspection behind a single CLI interface.
  - title: Release-ready workflow
    details: Ships with linting, tests, smoke checks, trusted publishing, and GitHub Pages docs.
---

## Overview

`ferman` is a small cross-platform DevOps CLI for identifying which process is using a port and releasing it safely when needed.

It is designed to work well for both humans and AI agents:

- interactive confirmation for safe termination
- `--force` for direct action
- `--dry` for inspection only
- `--json` for scripts, CI, and agents
- `--toon` for compact LLM-oriented structured output
- predictable exit codes for automation

## Install

Run without installing:

```bash
npx ferman 3000
```

Install globally:

```bash
npm install -g ferman
ferman 3000
```

## Tools

Core commands:

```bash
ferman 3000
ferman 3000 --force
ferman 3000 --dry
ferman 3000 --json
ferman 3000 --toon
```

Development commands:

```bash
npm run lint
npm test
npm run typecheck
npm run build
npm run smoke
npm run release:check
```

## Sponsor

If `ferman` helps you keep local development moving, you can support ongoing maintenance through GitHub Sponsors:

- https://github.com/sponsors/borakilicoglu

## Support

For bugs, regressions, and feature requests, use GitHub Issues:

- https://github.com/borakilicoglu/ferman/issues

## Resources

- Website: https://borakilicoglu.github.io/ferman/
- GitHub repo: https://github.com/borakilicoglu/ferman
- Official npm package: https://www.npmjs.com/package/ferman
- Docs: https://borakilicoglu.github.io/ferman/
- Contributing: https://github.com/borakilicoglu/ferman/blob/main/CONTRIBUTING.md
- Releases: https://github.com/borakilicoglu/ferman/releases
- License: https://github.com/borakilicoglu/ferman/blob/main/LICENSE
