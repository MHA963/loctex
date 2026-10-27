import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  FileText,
  FileCode,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Copy,
  Check,
  ArrowLeft,
  Eye,
  Code2,
} from 'lucide-react';

export type AssetCategory = 'image' | 'svg' | 'pdf' | null;

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.bmp']);

export function getAssetCategory(filePath: string): AssetCategory {
  if (!filePath || !filePath.includes('.')) return null;
  const ext = filePath.slice(filePath.lastIndexOf('.')).toLowerCase();
  if (IMAGE_EXTENSIONS.has(ext)) return 'image';
  if (ext === '.svg') return 'svg';
  if (ext === '.pdf') return 'pdf';
  return null;
}

export function isPreviewableAsset(filePath: string): boolean {
  return getAssetCategory(filePath) !== null;
}

export function buildIncludeGraphicsSnippet(filePath: string): string {
  const normalized = filePath.replace(/\\/g, '/');
  return `\\includegraphics[width=0.8\\linewidth,keepaspectratio]{${normalized}}`;
}

interface AssetPreviewPaneProps {
  projectId: string;
  filePath: string;
  svgSourceContent?: string;
  onEditSvgSource?: () => void;
  onBackToTex: () => void;
}

export const AssetPreviewPane: React.FC<AssetPreviewPaneProps> = ({
  projectId,
  filePath,
  onEditSvgSource,
  onBackToTex,
}) => {
  const category = getAssetCategory(filePath);
  const [zoom, setZoom] = useState<number>(100);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [cacheBuster, setCacheBuster] = useState<number>(() => Date.now());
  const [loadError, setLoadError] = useState<boolean>(false);

  useEffect(() => {
    setZoom(100);
    setDimensions(null);
    setLoadError(false);
    setCacheBuster(Date.now());
  }, [projectId, filePath]);

  const assetUrl = `/api/projects/${encodeURIComponent(projectId)}/asset?path=${encodeURIComponent(filePath)}&t=${cacheBuster}`;

  const handleCopyLatex = async () => {
    const snippet = buildIncludeGraphicsSnippet(filePath);
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore clipboard errors in headless environments
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[var(--bg-primary)] border-r border-[var(--border-color-subtle)] relative overflow-hidden select-none">
      {/* Top Asset Inspector Bar */}
      <div className="h-10 px-3 bg-[var(--bg-secondary)] border-b border-[var(--border-color-subtle)] flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onBackToTex}
            className="px-2 py-1 rounded bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color-subtle)] text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
            title="Return to main.tex code editor"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Code Editor</span>
          </button>

          <div className="flex items-center gap-1.5 min-w-0">
            {category === 'pdf' ? (
              <FileText className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            ) : category === 'svg' ? (
              <FileCode className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            ) : (
              <ImageIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            )}
            <span className="text-xs font-mono text-[var(--text-primary)] truncate" title={filePath}>
              {filePath}
            </span>
          </div>

          <span className="px-1.5 py-0.5 rounded bg-[var(--bg-surface)] border border-[var(--border-color-subtle)] text-[9px] font-mono uppercase tracking-wider text-[var(--accent-primary)]">
            {category === 'pdf' ? 'PDF Asset' : category === 'svg' ? 'SVG Vector' : 'Image Asset'}
          </span>

          {dimensions && (
            <span className="text-[10px] font-mono text-[var(--text-muted)]">
              {dimensions.width} × {dimensions.height}px
            </span>
          )}
        </div>

        {/* Right Controls: Zoom, SVG Code Toggle, Copy LaTeX Snippet */}
        <div className="flex items-center gap-1.5 shrink-0">
          {(category === 'image' || category === 'svg') && (
            <div className="flex items-center bg-[var(--bg-surface)] rounded border border-[var(--border-color-subtle)] px-1 py-0.5 gap-1">
              <button
                onClick={() => setZoom((z) => Math.max(25, z - 25))}
                className="p-0.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-mono text-[var(--text-secondary)] min-w-[36px] text-center">
                {zoom}%
              </span>
              <button
                onClick={() => setZoom((z) => Math.min(400, z + 25))}
                className="p-0.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoom(100)}
                className="p-0.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                title="Reset Zoom (100%)"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          )}

          {category === 'svg' && onEditSvgSource && (
            <button
              onClick={onEditSvgSource}
              className="px-2 py-1 rounded bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-color-subtle)] text-[10px] font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 transition-colors cursor-pointer"
              title="Switch to raw SVG XML code editor"
            >
              <Code2 className="w-3 h-3 text-amber-400" />
              <span>Edit XML</span>
            </button>
          )}

          <button
            onClick={handleCopyLatex}
            className="px-2 py-1 rounded bg-[var(--accent-primary)]/15 hover:bg-[var(--accent-primary)]/25 border border-[var(--accent-primary)]/40 text-[10px] font-mono text-[var(--accent-primary)] flex items-center gap-1 transition-colors cursor-pointer"
            title="Copy \includegraphics LaTeX command for this asset"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied \\includegraphics' : 'Copy \\includegraphics'}</span>
          </button>
        </div>
      </div>

      {/* Center Asset Viewport (Replaces Code Editor Space) */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-6 bg-[var(--bg-primary)] relative">
        {loadError ? (
          <div className="flex flex-col items-center gap-2 text-center max-w-sm p-6 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color-subtle)]">
            <Eye className="w-8 h-8 text-rose-400" />
            <div className="text-xs font-semibold text-[var(--text-primary)]">Unable to preview asset</div>
            <p className="text-[11px] text-[var(--text-muted)]">
              The file <span className="font-mono text-[var(--text-secondary)]">{filePath}</span> could not be loaded.
            </p>
          </div>
        ) : category === 'pdf' ? (
          <iframe
            src={assetUrl}
            title={`PDF Preview: ${filePath}`}
            className="w-full h-full rounded border border-[var(--border-color-subtle)] bg-white shadow-2xl"
          />
        ) : (
          <div
            className="relative flex items-center justify-center rounded-lg p-4 border border-[var(--border-color-subtle)] shadow-2xl transition-transform"
            style={{
              backgroundImage:
                'linear-gradient(45deg, #181715 25%, transparent 25%), linear-gradient(-45deg, #181715 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #181715 75%), linear-gradient(-45deg, transparent 75%, #181715 75%)',
              backgroundSize: '16px 16px',
              backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0',
              backgroundColor: '#121110',
            }}
          >
            <img
              src={assetUrl}
              alt={filePath}
              onLoad={(e) => {
                const img = e.currentTarget;
                if (img.naturalWidth && img.naturalHeight) {
                  setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
                }
              }}
              onError={() => setLoadError(true)}
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'center center',
                maxWidth: zoom === 100 ? '100%' : 'none',
                maxHeight: zoom === 100 ? '72vh' : 'none',
              }}
              className="object-contain block transition-transform duration-150"
            />
          </div>
        )}
      </div>
    </div>
  );
};
