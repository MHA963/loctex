# 🖋️ LocTex: The Personal LaTeX Research Studio & Offline Journal

> An offline-first, self-hosted LaTeX research studio and scientific notebook designed to replace cloud-dependent tools like Overleaf with zero latency, complete data privacy, and publication-ready compilation.

---

## 🌟 Key Features

### 1. 🚀 Offline-First Native Compilation
- **Local TeX Engines**: Compiles directly using your local `pdflatex` (MiKTeX / TeX Live) or `tectonic` binary.
- **Automated Multi-Pass Citations**: Automatically runs `bibtex` and multi-pass resolution for cross-references and citations.
- **Zero Cloud Latency & Total Privacy**: Your unpublished papers, patents, and research notes never leave your machine.
- **Space-Safe Execution**: Reliable child process execution on Windows, macOS, and Linux, even with spaces or hyphens in directory paths.

### 2. 📄 HiDPI Retina Vector PDF Viewer & Click-to-Jump Navigation
- **Crisp Vector Rendering**: Powered by PDF.js with HiDPI canvas scaling, zoom controls (50%–250%), and fit-to-width computation.
- **Bi-Directional Source Synchronization**: Click any equation, text, or figure caption in the compiled PDF viewer to automatically jump to and focus the corresponding line in the LaTeX source editor.
- **Interactive Text Layer**: Native text selection and copy-paste directly from the compiled PDF preview.

### 3. 📚 Academic Starter Templates
Scaffold publication-ready manuscripts in seconds with built-in templates:
- **IEEEtran Paper (`IEEEtran`)**: Double-column IEEE Transactions and Conference format with author blocks, index terms, equations, and bibliography.
- **Academic Research Article (`article`)**: Standard single-column journal paper with abstract, equations, and section structure.
- **Beamer Presentation (`beamer`)**: Academic slide deck with Madrid theme, outline frames, and theorem blocks.
- **Academic CV / Resume (`article` + `titlesec`)**: Elegant curriculum vitae format for researchers, appointments, publications, and skills.

### 4. 📦 Flexible Export Options
- **Export as PDF**: Direct download of the compiled, high-resolution vector PDF.
- **Export as ZIP**: Packages the complete project directory—including all `.tex` sources, `.bib` bibliographies, images, and figures—into a standard archive compatible with Overleaf and arXiv submission.

### 5. 💻 Modern CodeMirror 6 Editor & Diagnostics
- **LaTeX Highlighting & Completion**: Responsive syntax highlighting, bracket matching, and auto-complete.
- **Live Error Diagnostics**: Real-time log parser extracting exact error messages, file names, and line numbers.
- **Typography Toolbar**: Format selections with bold (`\textbf`), italic (`\textit`), underline (`\underline`), and code (`\texttt`).
- **Version Timeline**: Automatic SQLite-backed version snapshots recorded on compilation.

### 6. 📓 Daily Research Journal
- Integrated lab notebook mode for recording daily experiments, hypotheses, mathematical derivations, and observations alongside your formal papers.

---

## 🛠️ Architecture & Tech Stack

```text
loctex/
├── src/                         # React 19 Frontend Shell
│   ├── components/
│   │   ├── PdfCanvas.tsx        # PDF.js Vector Canvas & Click-to-Source Jump
│   │   ├── EditorPane.tsx       # CodeMirror 6 LaTeX Editor
│   │   ├── HeaderPill.tsx       # Typography, Zoom & Compile Controls
│   │   ├── Sidebar.tsx          # File Tree, Version Timeline & Export Menu
│   │   ├── Modals.tsx           # Starter Template Picker & ZIP Importer
│   │   └── ProjectsDashboard.tsx# Projects Grid & Workspace Overview
│   └── App.tsx                  # Workspace Orchestration & State Sync
├── server/                      # Fastify Backend Server
│   ├── compiler/
│   │   ├── tectonic-runner.ts   # Space-Safe TeX & Multi-Pass BibTeX Runner
│   │   └── error-parser.ts      # LaTeX Error & Warning AST Parser
│   ├── db/database.ts           # SQLite Persistent Store (Projects & Snapshots)
│   ├── services/
│   │   ├── synctex-parser.ts    # SyncTeX Binary Stream Parser
│   │   └── zip-service.ts       # Secure ZIP Import / Export Engine
│   └── index.ts                 # REST API Endpoints with Path Traversal Defense
└── tests/                       # Vitest Test Suite (13 Passing Tests)
```

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide Icons, PDF.js, CodeMirror 6, KaTeX.
- **Backend**: Node.js, Fastify, TypeScript (`tsx`), SQLite3, JSZip.
- **Compiler**: Local `pdflatex` / `tectonic` / `bibtex`.

---

## 🚀 Getting Started

### Prerequisites
1. **Node.js** (v18 or higher)
2. **TeX Distribution**: [MiKTeX](https://miktex.org/) (Windows), [MacTeX](https://tug.org/mactex/) (macOS), or [TeX Live](https://tug.org/texlive/) (Linux). Alternatively, [Tectonic](https://tectonic-typesetting.github.io/).

### Installation

```bash
# Clone the repository
git clone https://github.com/MHA963/loctex.git
cd loctex

# Install dependencies
npm install
```

### Running Locally

```bash
# Start the Fastify backend server (Port 4173)
npm run server

# In a separate terminal, start the Vite frontend (Port 5173)
npm run dev
```

Open your browser at `http://localhost:5173` to start writing.

---

## 🧪 Testing & Verification

Run the automated test suite with Vitest:

```bash
npm test
```

Run static type checking and production build:

```bash
npm run build
```

---

## 🔒 Security & Privacy

- **Local Storage**: All projects and databases are stored locally in `loctex_data/` on your filesystem.
- **Path Containment**: Built-in boundary verification protects file CRUD handlers against directory traversal attacks.
- **Binary Asset Protection**: Prevents binary graphics (`.png`, `.jpg`, `.pdf`) from being corrupted by auto-save routines.

---

## 📄 License

MIT License. Designed and built for reproducible academic research and private manuscript authoring.
