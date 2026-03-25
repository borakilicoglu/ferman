# ferman v0.1.4

This release expands the Node-oriented workflow and makes watch mode quieter for automation.

## Added

- `--node-ports` for listing active Node.js processes together with listening ports
- `--changed-only` for watch mode output that only emits on changes
- `--self` for including the current `ferman` invocation in node-oriented listings

## Changed

- Cleaned `--node` output by normalizing command strings and filtering self-wrapper noise by default
- Expanded smoke coverage to include node-oriented commands
- Updated README and docs to cover the new node and watch workflows
