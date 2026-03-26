# Releasing

This project uses simple tag-based releases.

## Prerequisites

- npm account with publish access
- `NPM_TOKEN` configured in GitHub Actions if automated publishing will be used
- Clean working tree

## Local Release Checklist

1. Update `package.json` version
2. Update `CHANGELOG.md`
3. Run `npm test`
4. Run `npm run typecheck`
5. Run `npm run build`
6. Commit the release changes
7. Create a git tag such as `v0.1.0`
8. Push the branch and tag
9. Publish with `npm publish --access public` or let GitHub Actions publish from the tag

Use GitHub Releases for release notes. Do not add `RELEASE_NOTES_*.md` files to the repository.

## Example

```bash
npm version patch
npm test
npm run typecheck
npm run build
git push origin main
git push origin --tags
```

## GitHub Tag Release

The included publish workflow runs on tags matching `v*`.

Expected flow:

1. Push a version tag
2. GitHub Actions runs tests and build
3. npm publish runs using `NPM_TOKEN`

## Recommended GitHub Secrets

- `NPM_TOKEN`: npm automation token with publish permission
