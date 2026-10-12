import React, { useState } from 'react';
import { UploadCloud, FileText, X, Check, BookOpen, Presentation, UserCheck, Layers } from 'lucide-react';

interface ImportZipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (projectName: string, base64Zip: string) => void;
}

export const ImportZipModal: React.FC<ImportZipModalProps> = ({ isOpen, onClose, onImport }) => {
  const [name, setName] = useState('');
  const [base64Zip, setBase64Zip] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      if (!name) {
        setName(file.name.replace(/\.zip$/i, ''));
      }

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        setBase64Zip(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirm = () => {
    if (base64Zip) {
      onImport(name || 'Imported Project', base64Zip);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-[var(--accent-primary)]" />
            <h2 className="text-sm font-bold text-[var(--text-primary)]">Import Overleaf / Prism ZIP</h2>
          </div>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-[var(--text-secondary)] mb-1">Project Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. My Overleaf Paper"
              className="w-full bg-[var(--bg-primary)] border border-[var(--border-color-subtle)] rounded-lg px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
            />
          </div>

          <div>
            <label className="block text-[var(--text-secondary)] mb-1">Select .ZIP Archive</label>
            <label className="border-2 border-dashed border-[var(--border-color-subtle)] hover:border-[var(--accent-primary)] rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-[var(--bg-primary)]/50">
              <UploadCloud className="w-8 h-8 text-[var(--text-muted)] mb-2" />
              <span className="text-xs text-[var(--text-primary)] font-medium">
                {fileName || 'Click to select or drag & drop ZIP file'}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] mt-1">Supports Overleaf, Prism, and standard TeX packages</span>
              <input type="file" accept=".zip" onChange={handleFileChange} className="hidden" />
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-[var(--border-color-subtle)] text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!base64Zip}
            className="px-4 py-1.5 rounded-lg bg-[var(--accent-primary)] text-black font-semibold text-xs hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            Import Project
          </button>
        </div>
      </div>
    </div>
  );
};

export interface TemplateOption {
  id: string;
  name: string;
  description: string;
  badge: string;
  icon: React.FC<{ className?: string }>;
}

export const STARTER_TEMPLATES: TemplateOption[] = [
  {
    id: 'ieeetran',
    name: 'IEEEtran Paper',
    description: 'Double-column IEEE Transactions/Conference template with author block, keywords & math.',
    badge: 'IEEEtran',
    icon: BookOpen,
  },
  {
    id: 'article',
    name: 'Academic Research Article',
    description: 'Standard single-column journal article with abstract, equations, and bibliography.',
    badge: 'Article',
    icon: FileText,
  },
  {
    id: 'beamer',
    name: 'Beamer Presentation',
    description: 'Academic slide deck with Madrid theme, title frame, theorems, and bullet points.',
    badge: 'Beamer',
    icon: Presentation,
  },
  {
    id: 'cv',
    name: 'Academic CV / Resume',
    description: 'Curriculum Vitae layout for researchers, publications, education, and honors.',
    badge: 'Curriculum Vitae',
    icon: UserCheck,
  },
];

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, template: string) => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('ieeetran');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (name.trim()) {
      onCreate(name.trim(), selectedTemplate);
      setName('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none">
      <div className="w-full max-w-xl bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color-subtle)]">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[var(--accent-primary)]" />
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)]">Create New Document</h2>
              <p className="text-[11px] text-[var(--text-muted)]">Select a starter template to scaffold your manuscript</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded-md hover:bg-[var(--bg-surface-hover)]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Document Title</label>
          <input
            type="text"
            value={name}
            autoFocus
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Real-Time Neural Quantization for Edge Devices"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && name.trim()) {
                handleSubmit();
              }
            }}
            className="w-full bg-[var(--bg-primary)] border border-[var(--border-color-subtle)] rounded-lg px-3.5 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2">Choose Starter Template</label>
          <div className="grid grid-cols-2 gap-2.5">
            {STARTER_TEMPLATES.map((tmpl) => {
              const isSelected = selectedTemplate === tmpl.id;
              const IconComp = tmpl.icon;
              return (
                <div
                  key={tmpl.id}
                  onClick={() => setSelectedTemplate(tmpl.id)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 shadow-sm'
                      : 'border-[var(--border-color-subtle)] bg-[var(--bg-primary)]/40 hover:bg-[var(--bg-primary)] hover:border-[var(--border-color)]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1.5 mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-[var(--accent-primary)] text-black' : 'bg-[#24221e] text-[var(--accent-primary)]'}`}>
                        <IconComp className="w-3.5 h-3.5" />
                      </div>
                      <span className={`text-xs font-semibold ${isSelected ? 'text-[var(--accent-primary)]' : 'text-[var(--text-primary)]'}`}>
                        {tmpl.name}
                      </span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[var(--accent-primary)] shrink-0" />}
                  </div>
                  <p className="text-[10.5px] text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                    {tmpl.description}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[9.5px]">
                    <span className="px-1.5 py-0.5 rounded bg-[#24221e] text-[#8c887e] font-mono">
                      {tmpl.badge}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-color-subtle)]">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-[var(--border-color-subtle)] text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="px-5 py-1.5 rounded-lg bg-[var(--accent-primary)] text-black font-semibold text-xs hover:opacity-90 disabled:opacity-50 transition-opacity shadow-sm"
          >
            Create Document
          </button>
        </div>
      </div>
    </div>
  );
};
