<p align="center">
  <img src="src-tauri/icons/128x128.png" alt="RunDeck Logo" width="128" height="128">
</p>

<h1 align="center">RunDeck</h1>

<p align="center">
  <strong>A modern terminal-based run configuration manager</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#development">Development</a> •
  <a href="#tech-stack">Tech Stack</a>
</p>

---

## Overview

RunDeck is a desktop application for managing and running multiple terminal processes simultaneously. Similar to IDE run configurations (like IntelliJ IDEA), it provides a unified interface to start, stop, restart, and monitor your development services.

## Features

- **Multiple Configuration Types**
  - Shell commands
  - Gradle tasks (auto-detects wrapper)
  - Maven goals (auto-detects wrapper)
  - Node.js scripts (auto-detects npm/yarn/pnpm)
  - Docker Compose
  - Spring Boot applications

- **Terminal Emulation**
  - Full PTY support with real terminal experience
  - Clickable links in terminal output
  - Search within terminal (Ctrl+F)
  - Scrollback buffer (10,000 lines)

- **Process Management**
  - Start, stop, and restart processes
  - Auto-restart on crash (configurable)
  - Environment variable management per configuration
  - Working directory support

- **Organization**
  - Folder-based organization
  - Drag-and-drop reordering
  - Color-coded configurations
  - Command palette (Ctrl+Shift+P)

- **User Experience**
  - Dark theme optimized for terminal use
  - Keyboard shortcuts for common actions
  - Status bar with process information
  - Customizable font and terminal settings

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [Rust](https://www.rust-lang.org/tools/install)
- [Tauri CLI](https://tauri.app/v1/guides/getting-started/prerequisites)

### Build from Source

```bash
# Clone the repository
git clone https://github.com/talayash/rundeck.git
cd rundeck

# Install dependencies
npm install

# Run in development mode
npm run tauri dev

# Build for production
npm run tauri build
```

## Usage

### Creating a Configuration

1. Click the **+** button in the sidebar or press `Ctrl+N`
2. Enter a name and select the configuration type
3. Configure the command/task, working directory, and environment variables
4. Click **Save**

### Running Configurations

- **Start**: Click the play button or select a config and press `Enter`
- **Stop**: Click the stop button
- **Restart**: Click the restart button
- **Clear Terminal**: Click the trash icon or press `Ctrl+L`

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+N` | New configuration |
| `Ctrl+Shift+P` | Command palette |
| `Ctrl+,` | Settings |
| `Ctrl+L` | Clear terminal |
| `Ctrl+F` | Search in terminal |
| `Ctrl+R` | Restart process |

### Environment Variables

For Java projects requiring a specific JDK version:

1. Edit the configuration
2. Go to the **Environment** tab
3. Add `JAVA_HOME` with the path to your JDK (e.g., `C:\Users\you\.jdks\corretto-17.0.18`)

## Development

### Project Structure

```
rundeck/
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── stores/             # Zustand state management
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   └── types/              # TypeScript types
├── src-tauri/              # Rust backend
│   └── src/
│       ├── lib.rs          # Tauri commands
│       ├── pty.rs          # PTY management
│       └── config.rs       # Configuration persistence
└── CLAUDE.md               # AI assistant guidance
```

### Commands

```bash
# Start development server
npm run tauri dev

# Build production release
npm run tauri build

# Run frontend only
npm run dev

# Type check
npm run build
```

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Backend**: Rust, Tauri 2
- **Terminal**: xterm.js with fit, search, and web-links addons
- **State Management**: Zustand
- **UI Components**: Radix UI primitives
- **Build Tool**: Vite

## License

MIT

---

<p align="center">
  Made with ❤️ using <a href="https://tauri.app">Tauri</a>
</p>
