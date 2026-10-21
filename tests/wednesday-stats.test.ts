import { describe, it, expect } from 'vitest';
import {
  computeDocumentStatistics,
  countWords,
  stripLatexComments,
  stripLatexMarkup,
} from '../src/utils/latex-stats.ts';

describe('Wednesday Document Statistics: 8 Core Academic Metrics', () => {
  describe('Comment Stripping & Markup Cleaners', () => {
    it('strips % comments but preserves escaped \\% currency and percentage signs', () => {
      const input = [
        '\\section{Taxation Report}',
        '% This is a secret author comment',
        'Inflation rose by 5\\% this year. % trailing comment',
      ].join('\n');

      const cleaned = stripLatexComments(input);
      expect(cleaned).toContain('5\\% this year.');
      expect(cleaned).not.toContain('secret author comment');
      expect(cleaned).not.toContain('trailing comment');
    });

    it('strips LaTeX macros leaving readable word tokens', () => {
      const input = '\\textbf{Robust} \\textit{statistical} \\underline{analysis} with \\LaTeX.';
      const stripped = stripLatexMarkup(input);
      expect(stripped).toContain('Robust');
      expect(stripped).toContain('statistical');
      expect(stripped).toContain('analysis');
      expect(countWords(input)).toBe(4);
    });
  });

  describe('8 Metrics Verification on Realistic LaTeX Document', () => {
    const sampleLatex = `
\\documentclass{article}
\\usepackage{graphicx}
\\usepackage{amsmath}

\\title{Deep Learning Architecture for Quantum Chemistry}
\\author{LocTex Research Team}

\\begin{document}
\\maketitle

\\begin{abstract}
This paper presents neural network surrogates for quantum density estimation.
\\end{abstract}

\\section{Introduction}
Quantum molecular dynamics requires substantial computational resources.
Recent advancements demonstrate that neural operators accelerate simulation by orders of magnitude.
As shown by Smith et al., the energy $E = mc^2$ governs relativistic limits, while \\( \\psi(x) = A e^{ikx} \\) models the wave packet.

\\begin{figure}[htbp]
  \\centering
  \\includegraphics[width=0.8\\linewidth]{figures/model_diagram.png}
  \\caption{Detailed overview of our multi-scale message passing neural architecture.}
  \\label{fig:diagram}
\\end{figure}

\\subsection{Mathematical Formulation}
The total system Hamiltonian satisfies the stationary equation:
\\begin{equation}
  \\hat{H} \\Psi = E \\Psi
\\end{equation}
Furthermore, the coupled wave equation simplifies to:
\\[
  \\nabla^2 \\phi - \\frac{1}{c^2} \\frac{\\partial^2 \\phi}{\\partial t^2} = 0
\\]
Additional boundary conditions follow the tensor equation:
$$
  T_{\\mu\\nu} = \\rho u_\\mu u_\\nu + p g_{\\mu\\nu}
$$

\\section{Experimental Results}
We evaluated our benchmark across five synthetic datasets\\footnote{All benchmark code is openly available on GitHub.}.
A secondary snapshot is displayed below:
\\includegraphics[width=0.5\\linewidth]{figures/convergence.png}

\\begin{table}[h]
  \\centering
  \\begin{tabular}{l c}
    Method & Accuracy \\\\
    Baseline & 84.2 \\\\
    LocTex & 99.1
  \\end{tabular}
\\end{table}

\\end{document}
`;

    it('computes all 8 metrics with mathematical consistency', () => {
      const stats = computeDocumentStatistics(sampleLatex);

      // 1. Headers: \title, \section{Introduction}, \subsection{Mathematical Formulation}, \section{Experimental Results}
      expect(stats.numberOfHeaders).toBe(4);
      expect(stats.wordsInHeaders).toBeGreaterThan(0);

      // 2. Figures: 1 figure env + 1 standalone \includegraphics
      expect(stats.numberOfFigures).toBe(2);

      // 3. Math Inlines: $E = mc^2$ and \( \psi(x) = A e^{ikx} \)
      expect(stats.numberOfMathInlines).toBe(2);

      // 4. Math Displayed: \begin{equation}, \[, $$
      expect(stats.numberOfMathDisplayed).toBe(3);

      // 5. Outside text: abstract, caption, footnote, table/tabular
      expect(stats.wordsOutsideText).toBeGreaterThan(0);

      // 6. Words in Text: main body prose text
      expect(stats.wordsInText).toBeGreaterThan(0);

      // 7. Core Invariant: Total Words = Words in Text + Words in Headers + Words outside text
      expect(stats.words).toBe(
        stats.wordsInText + stats.wordsInHeaders + stats.wordsOutsideText
      );
    });

    it('handles documents without \\begin{document} gracefully', () => {
      const snippet = [
        '\\section{Single Section Title}',
        'This is five words text.',
        '\\begin{figure}',
        '  \\caption{Figure caption words}',
        '\\end{figure}',
        'An inline formula is $x + y = z$.',
        '\\begin{align}',
        '  a &= b + c \\\\',
        '  d &= e + f',
        '\\end{align}',
      ].join('\n');

      const stats = computeDocumentStatistics(snippet);
      expect(stats.numberOfHeaders).toBe(1);
      expect(stats.wordsInHeaders).toBe(3); // "Single Section Title"
      expect(stats.numberOfFigures).toBe(1);
      expect(stats.numberOfMathInlines).toBe(1);
      expect(stats.numberOfMathDisplayed).toBe(1);
      expect(stats.wordsOutsideText).toBe(3); // "Figure caption words"
      expect(stats.wordsInText).toBe(9); // "This is five words text" (5) + "An inline formula is" (4)
      expect(stats.words).toBe(stats.wordsInText + stats.wordsInHeaders + stats.wordsOutsideText);
    });

    it('returns zeroed statistics on empty or whitespace strings', () => {
      const stats = computeDocumentStatistics('   \n  \t ');
      expect(stats).toEqual({
        words: 0,
        wordsInText: 0,
        wordsInHeaders: 0,
        wordsOutsideText: 0,
        numberOfHeaders: 0,
        numberOfFigures: 0,
        numberOfMathInlines: 0,
        numberOfMathDisplayed: 0,
      });
    });
  });
});
