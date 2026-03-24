# Contributing

Thanks for contributing to `ferman`.

## Setup

```bash
npm install
```

## Local Checks

Run the standard checks before opening a PR:

```bash
npm run lint
npm test
npm run typecheck
npm run build
```

For a release-grade check:

```bash
npm run release:check
```

## Commit Workflow

This repository uses Husky. The pre-commit hook runs:

```bash
npm test
```

Keep commits small and make sure user-facing changes are reflected in `README.md` or `CHANGELOG.md` when relevant.

## Release Flow

1. Update code and tests
2. Update `CHANGELOG.md`
3. Run `npm run release:check`
4. Bump the version
5. Push the branch and version tag
