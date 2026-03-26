# ferman v0.1.9

This release improves recommendation quality around local development loops and adds watch-time hints for ports that reappear during repeated checks.

## Changed

- Improved `--plan` recommendations for common app and service port scenarios
- Expanded `--doctor` diagnosis guidance for likely stale dev loops and multi-process listeners
- Added watch-mode hints for ports that reappear or stay attached to the same process family
- Added an install-size badge to the README package metadata row
- Aligned the MCP server version with the published package version
