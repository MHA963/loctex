# 📝 LocTex — Offline-First LaTeX Research Studio & Daily Journal

> A modern, self-hosted, offline-first LaTeX research studio and daily engineering journal designed as a private, high-performance alternative to Overleaf.

---

## 🌟 Key Features

- **💻 Native Windows Desktop Application (.exe)**:
  - **NSIS Installer**: `LocTex-Setup-1.0.0.exe` with customizable installation directory and desktop shortcuts.
  - **Portable Executable**: `LocTex-1.0.0-Portable.exe` running standalone without administrative installation.
  - **Frameless Window**: Custom macOS-style traffic light window controls (minimize, maximize, close) with native drag regions.
  - **Data Isolation**: Persistent SQLite state and TeX projects saved to `%APPDATA%/LocTex/loctex_data`.
- **🤖 Local AI Fast-Edit & Repair (Qwen 2.5 Coder)**:
  - **Sub-Second LaTeX Edits**: Instant atomic `SEARCH/REPLACE` diff patches (via Ollama `qwen2.5-coder:1.5b` or `3b`).
  - **Diagnostic Error Auto-Repair**: One-click "Qwen Fix" button on compiler errors and warnings in the diagnostic drawer.
  - **Offline Heuristic Fallback**: Deterministic rule-based auto-healing when Ollama daemon is offline.
- **🎨 Comprehensive Full-App Theming**:
  - Four high-contrast palettes: **Dark Gold**, **Neon Green**, **Charcoal Slate**, and **Warm Sepia Paper**.
  - Dynamic CodeMirror syntax highlighting tokens and synchronized light/dark chrome.
- **⚡ Offline-First Architecture**: Completely decoupled from third-party cloud services. Works without internet access using your local TeX distribution (`pdflatex`, `xelatex`, `tectonic`).
- **🎯 Precise Vector PDF Sync**: Real-time PDF preview with SyncTeX support for bidirectional synchronization between your LaTeX source code and compiled PDF canvas.
- **📚 Curated Academic Starter Templates**:
  - **IEEEtran**: Standard IEEE conference and transaction manuscript template with BibTeX citations.
  - **Academic Article**: Elegant two-column academic paper with abstract, math, algorithms, and references.
  - **Beamer Presentation**: Clean slides with custom theme, block callouts, and multi-column support.
  - **Academic CV / Resume**: Professional curriculum vitae layout with structured sections and typography.
- **📦 Project Export Suite**: One-click exports directly from the sidebar:
  - **Export as PDF**: Instantly downloads the compiled production-ready PDF.
  - **Export as ZIP**: Packages the entire project bundle (source files, bibliography, figures) for archiving or journal submission.
- **🔍 Intelligent LaTeX Diagnostic Parser & Auto-Healing**: Real-time log parser categorizing undefined control sequences, missing citations, and font expansion auto-injection (`\usepackage{lmodern}`).
- **🔒 Zero-Trust Path Hardening**: Backend path containment assertions block path traversal attacks across all file system operations.
- **💾 Local SQLite State Engine**: Lightweight, fast metadata storage for project organization, compilation settings, and version snapshots.

---

## 🛠️ Tech Stack

- **Desktop Framework**: Electron, `electron-builder` (NSIS installer & portable Windows executable).
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, CodeMirror 6 with dynamic syntax tokens.
- **Backend**: Fastify 5 (Node.js), TypeScript, `tsx`, `@fastify/static`.
- **Local AI**: Qwen 2.5 Coder (`1.5B` / `3B`) via local Ollama endpoint (`127.0.0.1:11434`) with heuristic fallback.
- **Database & Persistence**: SQLite (`sqlite3` with WAL mode), `%APPDATA%/LocTex/loctex_data`.
- **LaTeX Compilation**: Local TeX Live / MiKTeX (`pdflatex`, `synctex`) or Tectonic.
- **Testing & Quality**: Vitest unit & integration test suite (7 suites, 24 automated tests).

---

## 🚀 Getting Started

### Prerequisites

1. **Node.js** (v18+ or v20+ recommended)
2. **TeX Distribution**:
   - **Windows**: [MiKTeX](https://miktex.org/) or [TeX Live](https://tug.org/texlive/) (ensure `pdflatex` and `synctex` are in your system `PATH`)
   - **Linux**: `sudo apt install texlive-full`
   - **macOS**: [MacTeX](https://www.tug.org/mactex/)
3. **Optional Local AI**: [Ollama](https://ollama.com/) with `ollama run qwen2.5-coder:1.5b`

### Installation & Local Development

```bash
# Clone repository
git clone https://github.com/MHA963/loctex.git
cd loctex

# Install dependencies
npm install

# Start development server
npm run dev
```

- **Frontend UI**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://127.0.0.1:4173](http://127.0.0.1:4173)

---

## 📦 Building Native Windows Executables (.exe)

LocTex can be packaged into standalone Windows applications using `electron-builder`:

```bash
# Build production bundle and package Windows installer & portable .exe
npm run dist:win

# Run desktop app in development mode
npm run electron:dev
```

This outputs production artifacts into `release/`:
- **`LocTex-Setup-1.0.0.exe`**: Full Windows NSIS installer with desktop shortcut and custom directory options.
- **`LocTex-1.0.0-Portable.exe`**: Single-file portable executable requiring zero installation.

---

## 🧪 Testing

LocTex includes an automated test suite verifying core components including templates, database persistence, error parsing, ZIP packing/unpacking, SyncTeX handling, Ollama AI patching, and desktop storage isolation:

```bash
npm test
```

---

## 📁 Project Structure

```text
loctex/
├── electron/               # Electron desktop process & IPC bridges
│   ├── main.cjs            # Main process lifecycle, window creation, server manager
│   └── preload.cjs         # Safe context isolation bridge for window controls
├── src/                    # Frontend React application
│   ├── components/         # CodeMirror editor, PDF viewer, sidebar, modals, Qwen assistant
│   ├── App.tsx             # Main application orchestrator & workspace layout
│   ├── index.css           # Semantic color tokens and theme definitions
│   └── main.tsx            # React root mount
├── server/                 # Fastify backend service
│   ├── index.ts            # REST API endpoints, static serving, starter templates
│   ├── compiler/           # Tectonic/pdfTeX runner, error parser, auto-healing
│   ├── db/                 # SQLite database schema and persistence methods
│   └── services/           # Ollama service, ZIP packaging, SyncTeX parser
├── tests/                  # Vitest automated test suites (7 test files)
├── electron-builder.json   # NSIS installer and portable executable configuration
└── package.json            # Scripts, main entry point, and dependencies
```

---

## 📄 License

MIT License. Designed and maintained for researchers and engineers who value privacy, speed, and offline autonomy.

