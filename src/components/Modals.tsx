import React, { useState } from 'react';
import { UploadCloud, FileText, X, Check } from 'lucide-react';

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

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-sm bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[var(--text-primary)]">Create New Document</h2>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <label className="block text-xs text-[var(--text-secondary)] mb-1">Document Title</label>
          <input
            type="text"
            value={name}
            autoFocus
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Deep Learning Paper"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && name.trim()) {
                onCreate(name);
                onClose();
              }
            }}
            className="w-full bg-[var(--bg-primary)] border border-[var(--border-color-subtle)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-[var(--border-color-subtle)] text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)]"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (name.trim()) {
                onCreate(name);
                onClose();
              }
            }}
            disabled={!name.trim()}
            className="px-4 py-1.5 rounded-lg bg-[var(--accent-primary)] text-black font-semibold text-xs hover:opacity-90 disabled:opacity-50"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};
