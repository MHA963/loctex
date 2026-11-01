# 📝 LocTex — Offline-First Personal LaTeX & Research Studio

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tests](https://img.shields.io/badge/Tests-73%20passed-brightgreen.svg)]()
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20Linux%20%7C%20macOS-blue.svg)]()
[![Electron](https://img.shields.io/badge/Desktop-Electron%2033-violet.svg)]()
[![React](https://img.shields.io/badge/Frontend-React%2019-61dafb.svg)]()
[![Fastify](https://img.shields.io/badge/Backend-Fastify%205-black.svg)]()

> **LocTex** is a modern, offline-first personal LaTeX research studio and editor designed as a completely private, high-performance, and distraction-free alternative to cloud-based solutions like Overleaf.

---

## 👤 Author & Maintainer

- **Creator & Lead Developer**: **MHA** ([@MHA963](https://github.com/MHA963))
- **Repository**: [https://github.com/MHA963/loctex](https://github.com/MHA963/loctex)
- **Issues & Support**: [https://github.com/MHA963/loctex/issues](https://github.com/MHA963/loctex/issues)

---

## 🌟 Key Features

### 💻 Native Desktop Application & Web Interface
- **Windows Desktop Executables**:
  - **NSIS Installer**: `LocTex-Setup-1.0.0.exe` with desktop shortcut and customizable install paths.
  - **Portable Executable**: `LocTex-1.0.0-Portable.exe` running standalone with zero installation overhead.
  - **Frameless Window**: Custom macOS-style traffic light window controls (minimize, maximize, close) with native drag regions.
- **Local Browser Workspace**: Responsive web interface accessible at `http://localhost:4173`.
- **Startup Loading Animation**: Polished golden monogram and mathematical integral curve loading sequence with smooth fade transitions.

### 🤖 Local AI Research Copilot (Qwen 2.5 Coder)
- **100% Offline & Private**: Connects directly to local Ollama runtime (`qwen2.5-coder:1.5b`, `3b`, `7b`). Your research notes and manuscripts never leave your machine.
- **Fast-Edit & Auto-Repair**: One-click diagnostic error repair with atomic `SEARCH/REPLACE` diff applications directly into CodeMirror.
- **Heuristic Offline Fallback**: Deterministic rule-based auto-healing when Ollama daemon is offline (scalable font auto-expansion, boundary limits, and missing package recovery).
- **Persistent Project Chat**: Project-scoped conversational history stored locally in SQLite.

### ⚡ True Offline-First LaTeX Compilation
- **Dual Compiler Engine**: Automatically detects and leverages local TeX installations (`pdflatex`, `synctex`, `bibtex`, or `tectonic`).
- **Bidirectional SyncTeX Jumping**: Click on any paragraph in the compiled PDF canvas to jump directly to the corresponding LaTeX source line, or vice versa.
- **Automatic Overflow Prevention**: Non-destructive TeX preamble boundary guards prevent `Overfull \hbox` text from spilling over page margins.
- **Per-Project Compilation Queue**: Serializes concurrent compile requests to prevent auxiliary file (`.aux`, `.synctex`) write corruption.

### 📚 Academic Templates & Project Management
- **Starter Templates**:
  - **IEEEtran**: Standard IEEE conference and transaction manuscript with citation formatting.
  - **Academic Article**: Two-column academic article with abstract, equations, and references.
  - **Beamer Presentation**: Clean slide deck with custom dark/light theme blocks.
  - **Academic CV / Resume**: Curriculum vitae layout with modern typography.
- **Asset Hub & File Explorer**:
  - Upload, preview, and organize graphics (`.png`, `.jpg`, `.svg`, `.webp`, `.pdf`).
  - Strict AST SVG sanitization and MIME whitelisting for security.
- **Import / Export Suite**:
  - Export production-ready PDFs.
  - Import and export Overleaf-compatible ZIP archives.
  - Create and rollback project snapshots with point-in-time diffing.

### 🎨 Themes & Customization
- Four high-contrast palettes: **Dark Gold**, **Neon Green**, **Charcoal Slate**, and **Warm Sepia Paper**.
- Real-time word, character, and section statistics counter with visual reading time estimates.

---

## 🛡️ Security & Zero-Trust Model

LocTex is engineered with defense-in-depth principles:
- **TeX Command Sandboxing**: pdflatex runs with `-no-shell-escape` strictly enforced to block arbitrary shell execution (`\write18`).
- **Process Guardrails**: Child compilation processes are terminated after a 30-second ceiling to prevent infinite macro loops.
- **Path Confinement**: All file and asset operations pass through `resolveContainedPath`, blocking directory traversal (`../`), null bytes (`\0`), and Windows reserved device names (`CON`, `PRN`, `AUX`, `NUL`, etc.).
- **Asset Hardening**: SVG uploads undergo AST sanitization to strip executable tags (`<script>`, `<foreignObject>`) and inline event handlers (`onload`, `onclick`). Served with strict `Content-Security-Policy` and `X-Content-Type-Options: nosniff`.
- **Origin Isolation**: CORS is locked to local loopback adapters (`localhost`, `127.0.0.1`, and Electron webviews).

---

## 🛠️ Tech Stack & Architecture

| Layer | Technologies |
| :--- | :--- |
| **Desktop Platform** | Electron 33, `electron-builder` |
| **Frontend UI** | React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons |
| **Code Editor** | CodeMirror 6 (LaTeX legacy mode, custom theme highlighting, linting) |
| **PDF Rendering** | Mozilla PDF.js (`pdfjs-dist`), HTML5 Canvas text layers |
| **Backend API** | Fastify 5, Node.js 20, TypeScript, `@fastify/static`, `@fastify/cors` |
| **Local AI Copilot** | Ollama API, Qwen 2.5 Coder (`1.5B` / `3B` / `7B`), heuristic fallback parser |
| **Database** | SQLite (`sqlite3` with WAL mode) |
| **TeX Compilers** | TeX Live, MiKTeX, Tectonic |
| **Testing** | Vitest (13 test suites, 73 automated tests) |

---

## 🚀 Getting Started

### Prerequisites

1. **Node.js** (v18.0.0+ or v20.0.0+ recommended)
2. **TeX Distribution**:
   - **Windows**: [MiKTeX](https://miktex.org/) or [TeX Live](https://tug.org/texlive/) (ensure `pdflatex` is added to PATH)
   - **Linux**: `sudo apt install texlive-full`
   - **macOS**: [MacTeX](https://www.tug.org/mactex/)
3. **Optional Local AI**: [Ollama](https://ollama.com/)
   ```bash
   ollama pull qwen2.5-coder:1.5b
   ```

### Quick Start (Web / Local Development)

```bash
# 1. Clone repository
git clone https://github.com/MHA963/loctex.git
cd loctex

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

- **Frontend Client**: [http://localhost:5173](http://localhost:5173)
- **Backend API Server**: [http://127.0.0.1:4173](http://127.0.0.1:4173)

---

## 📦 Packaging Desktop Applications (.exe)

LocTex compiles into standalone Windows installers or portable executables:

```bash
# Package production desktop installers into /release directory
npm run dist:win

# Run desktop application in development mode
npm run electron:dev
```

Output directory:
- `release/LocTex-Setup-1.0.0.exe` (NSIS Installer)
- `release/LocTex-1.0.0-Portable.exe` (Standalone Portable)

---

## 🐳 Docker Deployment

You can run LocTex in an isolated containerized environment:

```bash
# Start LocTex container
npm run docker:up

# View logs
npm run docker:logs

# Stop containers
npm run docker:down
```

---

## 🧪 Testing

LocTex comes with an automated test suite covering database persistence, error parsing, SyncTeX parsing, desktop storage isolation, and security controls:

```bash
npm test
```

```text
✓ tests/wednesday-stats.test.ts (5 tests)
✓ tests/error-parser.test.ts (5 tests)
✓ tests/wednesday-toolbar.test.ts (14 tests)
✓ tests/ollama-service.test.ts (6 tests)
✓ tests/thursday-chat-ui.test.ts (7 tests)
✓ tests/db.test.ts (3 tests)
✓ tests/desktop-packaging.test.ts (4 tests)
✓ tests/zip-service.test.ts (2 tests)
✓ tests/synctex.test.ts (1 test)
✓ tests/thursday-chat-api.test.ts (6 tests)
✓ tests/templates.test.ts (3 tests)
✓ tests/monday-compile-pdf-asset.test.ts (8 tests)
✓ tests/tuesday-new-menu-and-paste.test.ts (9 tests)

Test Files:  13 passed (13)
Tests:       73 passed (73)
```

---

## ⚖️ Legal & Open Source Compliance

LocTex is open-source software licensed under the **[MIT License](LICENSE)**.

### Third-Party Software Notices & Trademarks
- **LaTeX**: LaTeX is a document preparation system originally developed by Leslie Lamport and built on Donald Knuth's TeX typesetting system.
- **PDF.js**: Licensed under the Apache License 2.0. Copyright Mozilla Foundation.
- **CodeMirror**: Licensed under the MIT License. Copyright Marijn Haverbeke and contributors.
- **Qwen 2.5 Coder**: Developed by Alibaba Cloud. Models accessed locally via Ollama.
- **Lucide Icons**: Licensed under the ISC License. Copyright Lucide Project.
- All other trademarks and registered trademarks are the property of their respective owners.

See [`LICENSE`](LICENSE) for complete terms.
