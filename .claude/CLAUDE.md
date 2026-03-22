## Standard Development Workflow

Use Read, Grep, Glob, and Bash tools directly for exploring and modifying code.
No special indexing or pipeline required — straightforward approach.

### Tools Available
- **Read**: Read file contents (preferred over cat/head/tail)
- **Glob**: Find files by pattern (preferred over find/ls)
- **Grep**: Search file contents (preferred over grep/rg)
- **Edit**: Edit existing files (preferred over sed/awk)
- **Write**: Create new files or complete rewrites
- **Bash**: System commands and terminal operations

### When to Use Each Tool
- Searching for files: Use Glob
- Searching file contents: Use Grep  
- Reading files: Use Read
- Modifying files: Use Edit
- Creating files: Use Write
- Shell operations: Use Bash

### Key Principles
1. Always read a file before editing it
2. Use Edit for targeted changes, Write for complete rewrites
3. Use Glob + Grep for exploring, not manual bash searches
4. Commit frequently with clear messages
5. Test builds after significant changes
