---
name: zero-cost-asset-optimizer
description: WebP/AVIF automated pipelines, Blurhash progressive loading placeholders, dynamic font subsetting, and lazy-loading observers.
---

# ⚡ Zero-Cost Asset Optimizer & Web Vitals Guard

The **Zero-Cost Asset Optimizer Skill** prevents network bloat, cumulative layout shift (CLS), and heavy initial bundle downloads.

## 🧭 1. Image Optimization Standards
1. **Modern Formats**: Always provide `<picture>` fallbacks with AVIF and WebP before PNG/JPG.
2. **Explicit Dimensions**: Every image MUST define `width` and `height` (or `aspect-ratio`) to eliminate layout shift (CLS).
3. **Progressive Blurhash**: Render low-resolution SVG/Blurhash placeholders while high-res images load over the network.

## 💻 2. Lazy Image with Blurhash Placeholder:
```tsx
import { useState } from 'react';

export const OptimizedImage = ({ src, alt, width, height, blurDataUrl }: { src: string; alt: string; width: number; height: number; blurDataUrl?: string }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="relative overflow-hidden" style={{ aspectRatio: `${width}/${height}` }}>
      {blurDataUrl && !isLoaded && (
        <img src={blurDataUrl} alt="placeholder" className="absolute inset-0 w-full h-full object-cover filter blur-md scale-105" />
      )}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
};
```
