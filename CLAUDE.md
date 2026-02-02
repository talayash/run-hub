# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RunDeck is a terminal-based run configuration manager built with Tauri 2, React 19, and TypeScript. It provides a GUI for managing and running multiple terminal processes (similar to IntelliJ's run configurations).

## Development Commands

```bash
# Start development server (frontend + Tauri)
npm run tauri dev

# Build for production
npm run tauri build

# Frontend only (Vite dev server)
npm run dev

# Type check
npm run build  # runs tsc && vite build
```

## Architecture

### Frontend (React/TypeScript)

**State Management**: Zustand stores in `src/stores/`
- `configStore.ts` - Run configurations and folders (persisted via Tauri)
- `processStore.ts` - Process lifecycle and terminal output
- `settingsStore.ts` - User preferences (font, cursor style, etc.)

**Terminal Integration**: xterm.js in `src/hooks/useTerminal.ts`
- Uses `@xterm/xterm` with fit, search, and web-links addons
- `TerminalBuffer` class batches output writes for performance
- Terminal instances communicate with Rust PTY via Tauri commands

**Command Building**: `src/utils/commandBuilder.ts`
- Transforms `RunConfig` into shell commands based on `ConfigType`
- Supports: shell, gradle, maven, node, docker, spring-boot
- Uses Windows-specific commands (cmd.exe, powershell.exe)

### Backend (Rust/Tauri)

**PTY Management**: `src-tauri/src/pty.rs`
- `PtyManager` maintains a map of active pseudo-terminals
- Uses `portable-pty` crate for cross-platform PTY support
- Emits `pty-output` and `pty-exit` events to frontend

**Tauri Commands** (in `src-tauri/src/lib.rs`):
- `spawn_process` - Start a new PTY process
- `write_to_process` - Send input to PTY
- `resize_pty` - Handle terminal resize
- `kill_process` - Terminate a process
- `get_config` / `set_config` - Persist app configuration

**Config Persistence**: `src-tauri/src/config.rs`
- Stores configuration in user's app data directory

### Data Types

```typescript
// Core configuration type (src/types/index.ts)
interface RunConfig {
  id: string;
  name: string;
  type: ConfigType;  // 'shell' | 'gradle' | 'maven' | 'node' | 'docker' | 'spring-boot'
  command?: string;
  workingDir?: string;
  env: Record<string, string>;
  args: string[];
  folderId?: string;
  autoRestart: boolean;
  restartDelay: number;
  maxRetries: number;
}
```

### Key Patterns

- Path alias: `@/` maps to `src/` (configured in tsconfig.json and vite.config.ts)
- UI components use Radix UI primitives with Tailwind CSS
- Frontend-backend communication via Tauri's `invoke()` and `listen()` APIs
- Drag-and-drop reordering uses @dnd-kit
