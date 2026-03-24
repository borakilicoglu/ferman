# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog and this project follows Semantic Versioning.

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
