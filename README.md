# 📝 LocTex — Offline-First LaTeX Research Studio & Daily Journal

> A modern, self-hosted, offline-first LaTeX research studio and daily engineering journal designed as a private, high-performance alternative to Overleaf.

---

## 🌟 Key Features

- **⚡ Offline-First Architecture**: Completely decoupled from third-party cloud services. Works without internet access using your local TeX distribution (`pdflatex`, `xelatex`, `lualatex`).
- **🎯 Precise Vector PDF Sync**: Real-time PDF preview with SyncTeX support for bidirectional synchronization between your LaTeX source code and compiled PDF canvas.
- **📚 Curated Academic Starter Templates**:
  - **IEEEtran**: Standard IEEE conference and transaction manuscript template with BibTeX citations.
  - **Academic Article**: Elegant two-column academic paper with abstract, math, algorithms, and references.
  - **Beamer Presentation**: Clean slides with custom theme, block callouts, and multi-column support.
  - **Academic CV / Resume**: Professional curriculum vitae layout with structured sections and typography.
- **📦 Project Export Suite**: One-click exports directly from the sidebar:
  - **Export as PDF**: Instantly downloads the compiled production-ready PDF.
  - **Export as ZIP**: Packages the entire project bundle (source files, bibliography, figures) for archiving or journal submission.
- **🔍 Intelligent LaTeX Diagnostic Parser**: Real-time log parser categorizing undefined control sequences, missing citations, and math syntax errors with direct line-number links.
- **🔒 Zero-Trust Path Hardening**: Backend path containment assertions block path traversal attacks across all file system operations.
- **💾 Local SQLite State Engine**: Lightweight, fast metadata storage for project organization, compilation settings, and version snapshots.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Monaco Editor (LaTeX language syntax & IntelliSense).
- **Backend**: Fastify (Node.js), TypeScript, `tsx`.
- **Database & Persistence**: SQLite (`better-sqlite3`), Local file system storage (`loctex_data/`).
- **LaTeX Compilation**: Local TeX Live / MiKTeX (`pdflatex`, `synctex`).
- **Testing & Quality**: Vitest unit & integration test suite.

---

## 🚀 Getting Started

### Prerequisites

1. **Node.js** (v18+ or v20+ recommended)
2. **TeX Distribution**:
   - **Windows**: [MiKTeX](https://miktex.org/) or [TeX Live](https://tug.org/texlive/) (ensure `pdflatex` and `synctex` are in your system `PATH`)
   - **Linux**: `sudo apt install texlive-full`
   - **macOS**: [MacTeX](https://www.tug.org/mactex/)

### Installation

```bash
# Clone repository
git clone https://github.com/MHA963/loctex.git
cd loctex

# Install dependencies
npm install
```

### Running Locally

```bash
# Start backend and frontend simultaneously
npm run dev
```

- **Frontend UI**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://127.0.0.1:4173](http://127.0.0.1:4173)

---

## 🧪 Testing

LocTex includes an automated test suite verifying core components including templates, database persistence, error parsing, ZIP packing/unpacking, and SyncTeX handling:

```bash
npm test
```

---

## 📁 Project Structure

```text
loctex/
├── src/                    # Frontend React application
│   ├── components/         # Monaco editor, PDF viewer, sidebar, modal dialogues
│   ├── App.tsx             # Main application orchestrator & workspace layout
│   └── main.tsx            # React root mount
├── server/                 # Fastify backend service
│   ├── index.ts            # REST API endpoints, compiler runner, starter templates
│   └── services/           # DB access, ZIP packaging, SyncTeX parser
├── tests/                  # Vitest automated test suites
├── loctex_data/            # Local data directory (projects, SQLite DB, ignored in git)
└── package.json            # Scripts and dependencies
```

---

## 📄 License

MIT License. Designed and maintained for researchers and engineers who value privacy, speed, and offline autonomy.
