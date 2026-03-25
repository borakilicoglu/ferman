# ferman v0.1.5

This release adds an MCP wrapper so agents can use `ferman` as a structured local operations tool without going through the CLI surface directly.

## Added

- `ferman-mcp`, a stdio MCP wrapper over the existing port and process operations
- MCP tools for:
  - `inspect_ports`
  - `release_ports`
  - `doctor_ports`
  - `list_node_processes`
  - `list_node_ports`
  - `get_output_schema`

## Changed

- Expanded smoke coverage to verify the MCP entrypoint starts cleanly
- Updated README and docs to document MCP-based agent integration
