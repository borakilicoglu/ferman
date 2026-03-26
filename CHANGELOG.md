# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog and this project follows Semantic Versioning.

## [Unreleased]

### Changed

- Improved `--plan` recommendations for common app and service port scenarios
- Expanded `--doctor` diagnosis guidance for likely stale dev loops and multi-process listeners
- Added watch-mode hints for ports that reappear or stay attached to the same process family

## [0.1.8] - 2026-03-25

### Added

- `--kill-all --name` for terminating matching processes by name or command pattern
- `--signal` for explicit process termination control on Unix-like systems
- `--filter` support for `--node` and `--node-ports`
- Generic process parser tests for Unix and Windows process inventories

### Changed

- Expanded README and docs to cover process targeting, filtered node listings, and custom kill signals
- Unified port and process termination flows behind the same signal-aware interface

## [0.1.7] - 2026-03-25

### Added

- `--list` for listing active listening ports across the system
- Parser tests for Unix and Windows listening-port inventory output

### Changed

- Decoded escaped process names in port-list output on Unix-like systems
- Expanded README and docs to cover listening-port inventory mode

## [0.1.6] - 2026-03-25

### Added

- Example MCP tool input and structured result documentation
- TOON output cleanup tests for empty arrays and null line removal

### Changed

- Cleaned TOON output for empty arrays and removed null-valued lines
- Improved `--node-ports` empty-state messaging and human-readable summaries
- Made doctor recommendations more action-oriented
- Added a startup banner for human-readable watch mode
- Aligned the MCP server version with the published package version

## [0.1.5] - 2026-03-25

### Added

- `ferman-mcp`, a stdio MCP wrapper over the existing port and process operations
- MCP tools for port inspection, release, doctor scans, Node.js process listing, Node.js port listing, and output schema retrieval

### Changed

- Expanded smoke coverage to verify the MCP entrypoint starts cleanly
- Updated README and docs to document MCP-based agent integration

## [0.1.4] - 2026-03-25

### Added

- `--node-ports` for listing active Node.js processes together with listening ports
- `--changed-only` for quieter watch mode output that emits only on result changes
- `--self` for including the current `ferman` invocation in node-oriented listings

### Changed

- Cleaned `--node` command output by normalizing command strings and filtering self-wrapper noise by default
- Expanded smoke coverage to include node-oriented commands
- Updated README and docs to cover the new node and watch workflows

## [0.1.3] - 2026-03-25

### Added

- `--node` mode for listing active Node.js processes
- Structured JSON and TOON output for Node.js process listings
- Parser-level tests for Unix `ps` and Windows `tasklist` Node process output

### Changed

- Expanded README and docs to cover Node.js process listing mode
- Clarified platform verification status for macOS, Linux, and Windows

## [0.1.2] - 2026-03-24

### Added

- Strong JSON contract with stable success and error shapes
- Stable machine-readable error codes
- Multi-port support with batch result summaries
- `--common` for common local development port scans
- `--plan` for non-destructive action recommendations
- `--doctor` for environment-level diagnosis
- `--json-schema` for structured output consumers
- `--watch` for repeated snapshot events
- Expanded README and VitePress docs to cover the AI-facing surface

### Changed

- Improved CLI machine output with recommendation and diagnosis layers
- Reworked docs structure around outputs and development workflows

## [0.1.1] - 2026-03-24

### Added

- ESLint, Prettier, Husky, and contributor guidance for a stronger local workflow
- `smoke` and `release:check` scripts for release validation
- Parser-level tests for Unix and Windows port detection
- Initial SVG brand asset for README and docs use

### Changed

- Updated README structure with badges, support links, and cleaner project sections
- Standardized user-facing CLI messages in English
- Improved release tooling around packaging and local npm cache handling

## [0.1.0] - 2026-03-24

### Added

- Initial `ferman` CLI MVP for inspecting and freeing busy ports
- Cross-platform providers for macOS, Linux, and Windows
- Support for `--force`, `--dry`, `--json`, and `--help`
- Machine-readable JSON output and predictable exit codes
- Interactive confirmation flow for safe process termination
- Vitest setup with initial unit and flow tests
- Basic project documentation and Vitest docs page

### Notes

- This is the first public release candidate for npm and GitHub tagging
