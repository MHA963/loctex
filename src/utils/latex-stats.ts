/**
 * Pure LaTeX Document Statistics Engine.
 *
 * Accurately analyzes LaTeX documents to compute the 8 core academic metrics:
 * 1. Words (Total = Text + Headers + Outside text)
 * 2. Words in Text (body prose text)
 * 3. Words in Headers (\title, \section, \subsection, etc.)
 * 4. Words outside text (\caption, \footnote, abstract, tables)
 * 5. Number of headers
 * 6. Number of figures (\begin{figure}, standalone \includegraphics)
 * 7. Number of math inlines ($...$, \(...\))
 * 8. Number of math displayed ($$...$$, \[...\], \begin{equation}, \begin{align})
 */

export interface DocumentStatistics {
  words: number;
  wordsInText: number;
  wordsInHeaders: number;
  wordsOutsideText: number;
  numberOfHeaders: number;
  numberOfFigures: number;
  numberOfMathInlines: number;
  numberOfMathDisplayed: number;
}

export const EMPTY_STATISTICS: DocumentStatistics = {
  words: 0,
  wordsInText: 0,
  wordsInHeaders: 0,
  wordsOutsideText: 0,
  numberOfHeaders: 0,
  numberOfFigures: 0,
  numberOfMathInlines: 0,
  numberOfMathDisplayed: 0,
};

/**
 * Strips comments from LaTeX text. Line comments starting with % are removed,
 * taking care not to strip escaped \% signs.
 */
export function stripLatexComments(rawText: string): string {
  return rawText
    .split('\n')
    .map((line) => {
      let inEscape = false;
      for (let i = 0; i < line.length; i++) {
        if (line[i] === '\\') {
          inEscape = !inEscape;
          continue;
        }
        if (line[i] === '%' && !inEscape) {
          return line.slice(0, i);
        }
        inEscape = false;
      }
      return line;
    })
    .join('\n');
}

/**
 * Finds the index of the matching closing brace '}' for the opening brace '{' at openIndex.
 */
export function findMatchingBrace(text: string, openIndex: number): number {
  let depth = 0;
  for (let i = openIndex; i < text.length; i++) {
    if (text[i] === '\\') {
      i++;
      continue;
    }
    if (text[i] === '{') depth++;
    if (text[i] === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

const METADATA_MACROS = [
  'label',
  'ref',
  'pageref',
  'autoref',
  'eqref',
  'cite',
  'citep',
  'citet',
  'citealt',
  'citealp',
  'nocite',
  'includegraphics',
  'bibliography',
  'bibliographystyle',
  'input',
  'include',
  'documentclass',
  'usepackage',
  'usetikzlibrary',
  'pagestyle',
  'thispagestyle',
  'pagenumbering',
  'geometry',
];

const METADATA_MACRO_REGEX = new RegExp(
  `\\\\(?:${METADATA_MACROS.join('|')})(?:\\*|\\[[^\\]]*\\])?\\s*\\{[^{}]*\\}`,
  'gi'
);

/**
 * Strips LaTeX command markup from text while retaining the enclosed word tokens.
 * E.g., `\textbf{Hello} world` -> `Hello world`
 */
export function stripLatexMarkup(text: string): string {
  let cleaned = text;

  // First, completely discard metadata macros whose arguments are labels or filenames
  cleaned = cleaned.replace(METADATA_MACRO_REGEX, ' ');

  // Unpack common inline formatting macros with one argument: \macro{content} -> content
  for (let pass = 0; pass < 3; pass++) {
    cleaned = cleaned.replace(
      /\\[a-zA-Z]+(?:\*|\[[^\]]*\])?\{([^{}]*)\}/g,
      ' $1 '
    );
  }

  // Remove leftover macros without arguments or with options: \LaTeX, \noindent, \hline, etc.
  cleaned = cleaned.replace(/\\[a-zA-Z]+(?:\*|\[[^\]]*\])?/g, ' ');

  // Replace braces, brackets, and math symbols with spaces
  cleaned = cleaned.replace(/[{}[\]()\\~&^_#$]/g, ' ');

  return cleaned;
}

/**
 * Counts word tokens in raw LaTeX text after stripping markup.
 */
export function countWords(rawText: string): number {
  if (!rawText || !rawText.trim()) return 0;
  const stripped = stripLatexMarkup(rawText);
  // Split on whitespace and non-alphanumeric punctuation
  const tokens = stripped
    .replace(/[.,;:!?/|"“”‘’'`\-–—]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter((token) => /[a-zA-Z0-9]/.test(token));

  return tokens.length;
}

const HEADER_NAMES = [
  'title',
  'part',
  'chapter',
  'section',
  'subsection',
  'subsubsection',
  'paragraph',
  'subparagraph',
];

const DISPLAY_MATH_ENV_REGEX =
  /\\begin\{(?:equation\*?|align\*?|gather\*?|multline\*?|eqnarray\*?|displaymath\*?)\}[\s\S]*?\\end\{(?:equation\*?|align\*?|gather\*?|multline\*?|eqnarray\*?|displaymath\*?)\}/gi;

const FIGURE_ENV_REGEX =
  /\\begin\{(?:figure\*?|wrapfigure)\}[\s\S]*?\\end\{(?:figure\*?|wrapfigure)\}/gi;

const TABLE_ENV_REGEX =
  /\\begin\{(?:table\*?|tabular\*?)\}[\s\S]*?\\end\{(?:table\*?|tabular\*?)\}/gi;

const ABSTRACT_ENV_REGEX =
  /\\begin\{abstract\}[\s\S]*?\\end\{abstract\}/gi;

/**
 * Computes all 8 document statistics for the provided LaTeX document text.
 */
export function computeDocumentStatistics(latexSource: string): DocumentStatistics {
  if (!latexSource || !latexSource.trim()) {
    return { ...EMPTY_STATISTICS };
  }

  // 1. Strip comments
  let fullCleaned = stripLatexComments(latexSource);

  // 2. Count Figures
  let numberOfFigures = 0;
  const figureEnvMatches = fullCleaned.match(/\\begin\{(?:figure\*?|wrapfigure)\}/gi);
  if (figureEnvMatches) {
    numberOfFigures += figureEnvMatches.length;
  }
  // Standalone \includegraphics outside figure environments
  const textWithoutFigures = fullCleaned.replace(FIGURE_ENV_REGEX, ' ');
  const standaloneGraphics = textWithoutFigures.match(/\\includegraphics(?:\*|\[[^\]]*\])?\{[^{}]*\}/gi);
  if (standaloneGraphics) {
    numberOfFigures += standaloneGraphics.length;
  }

  // 3. Count Display Math & remove from text
  let numberOfMathDisplayed = 0;
  const envDisplayMatches = fullCleaned.match(DISPLAY_MATH_ENV_REGEX);
  if (envDisplayMatches) {
    numberOfMathDisplayed += envDisplayMatches.length;
    fullCleaned = fullCleaned.replace(DISPLAY_MATH_ENV_REGEX, ' ');
  }

  const doubleDollarRegex = /\$\$[\s\S]*?\$\$/g;
  const doubleDollarMatches = fullCleaned.match(doubleDollarRegex);
  if (doubleDollarMatches) {
    numberOfMathDisplayed += doubleDollarMatches.length;
    fullCleaned = fullCleaned.replace(doubleDollarRegex, ' ');
  }

  const bracketDisplayRegex = /\\\[[\s\S]*?\\\]/g;
  const bracketDisplayMatches = fullCleaned.match(bracketDisplayRegex);
  if (bracketDisplayMatches) {
    numberOfMathDisplayed += bracketDisplayMatches.length;
    fullCleaned = fullCleaned.replace(bracketDisplayRegex, ' ');
  }

  // 4. Count Inline Math & remove from text
  let numberOfMathInlines = 0;
  const parenInlineRegex = /\\\([\s\S]*?\\\)/g;
  const parenInlineMatches = fullCleaned.match(parenInlineRegex);
  if (parenInlineMatches) {
    numberOfMathInlines += parenInlineMatches.length;
    fullCleaned = fullCleaned.replace(parenInlineRegex, ' ');
  }

  const singleDollarRegex = /(?<!\\)\$(?!\$)([\s\S]*?)(?<!\\)\$/g;
  const singleDollarMatches = fullCleaned.match(singleDollarRegex);
  if (singleDollarMatches) {
    numberOfMathInlines += singleDollarMatches.length;
    fullCleaned = fullCleaned.replace(singleDollarRegex, ' ');
  }

  // 5. Count Headers and Words in Headers (scanned across full document to include preamble \title)
  let numberOfHeaders = 0;
  let wordsInHeaders = 0;

  const headerCommandRegex = new RegExp(
    `\\\\(${HEADER_NAMES.join('|')})\\*?(?:\\[[^\\]]*\\])?\\s*\\{`,
    'g'
  );

  let match: RegExpExecArray | null;
  const headerRanges: { start: number; end: number; text: string }[] = [];

  while ((match = headerCommandRegex.exec(fullCleaned)) !== null) {
    const braceStartIndex = match.index + match[0].length - 1;
    const braceEndIndex = findMatchingBrace(fullCleaned, braceStartIndex);
    if (braceEndIndex !== -1) {
      const headerContent = fullCleaned.slice(braceStartIndex + 1, braceEndIndex);
      headerRanges.push({
        start: match.index,
        end: braceEndIndex + 1,
        text: headerContent,
      });
      numberOfHeaders++;
      wordsInHeaders += countWords(headerContent);
    }
  }

  // Remove headers from fullCleaned
  for (let i = headerRanges.length - 1; i >= 0; i--) {
    const r = headerRanges[i];
    fullCleaned = fullCleaned.slice(0, r.start) + ' ' + fullCleaned.slice(r.end);
  }

  // 6. Count Words Outside Text (captions, footnotes, thanks, abstract, tables, figures)
  let wordsOutsideText = 0;

  // Extract and count abstract
  const abstractMatches = fullCleaned.match(ABSTRACT_ENV_REGEX);
  if (abstractMatches) {
    for (const abs of abstractMatches) {
      wordsOutsideText += countWords(abs);
    }
    fullCleaned = fullCleaned.replace(ABSTRACT_ENV_REGEX, ' ');
  }

  // Extract and count table environments
  const tableMatches = fullCleaned.match(TABLE_ENV_REGEX);
  if (tableMatches) {
    for (const tbl of tableMatches) {
      wordsOutsideText += countWords(tbl);
    }
    fullCleaned = fullCleaned.replace(TABLE_ENV_REGEX, ' ');
  }

  // Extract captions and notes from figure environments before stripping figures
  const figureMatches = fullCleaned.match(FIGURE_ENV_REGEX);
  if (figureMatches) {
    for (const fig of figureMatches) {
      // Find captions inside this figure
      const captionMatches = fig.match(/\\caption(?:\*|\[[^\]]*\])?\{[^{}]*\}/gi);
      if (captionMatches) {
        for (const cap of captionMatches) {
          wordsOutsideText += countWords(cap);
        }
      }
    }
    fullCleaned = fullCleaned.replace(FIGURE_ENV_REGEX, ' ');
  }

  // Outside text commands: \caption{...}, \footnote{...}, \thanks{...}, \marginpar{...}
  const outsideCommandRegex = /\\(?:caption\*?|footnote|thanks|marginpar)(?:\[[^\]]*\])?\s*\{/g;
  const outsideRanges: { start: number; end: number; text: string }[] = [];

  while ((match = outsideCommandRegex.exec(fullCleaned)) !== null) {
    const braceStartIndex = match.index + match[0].length - 1;
    const braceEndIndex = findMatchingBrace(fullCleaned, braceStartIndex);
    if (braceEndIndex !== -1) {
      const outsideContent = fullCleaned.slice(braceStartIndex + 1, braceEndIndex);
      outsideRanges.push({
        start: match.index,
        end: braceEndIndex + 1,
        text: outsideContent,
      });
      wordsOutsideText += countWords(outsideContent);
    }
  }

  for (let i = outsideRanges.length - 1; i >= 0; i--) {
    const r = outsideRanges[i];
    fullCleaned = fullCleaned.slice(0, r.start) + ' ' + fullCleaned.slice(r.end);
  }

  // 7. Isolate body prose if \begin{document} is present (ignoring packages, preamble config)
  let workingText = fullCleaned;
  const docStart = workingText.indexOf('\\begin{document}');
  if (docStart !== -1) {
    const afterStart = docStart + '\\begin{document}'.length;
    const docEnd = workingText.indexOf('\\end{document}', afterStart);
    workingText = docEnd !== -1 ? workingText.slice(afterStart, docEnd) : workingText.slice(afterStart);
  }

  // 8. Remaining is Words in Text (body prose)
  const wordsInText = countWords(workingText);

  // 9. Total Words = Text + Headers + Outside
  const words = wordsInText + wordsInHeaders + wordsOutsideText;

  return {
    words,
    wordsInText,
    wordsInHeaders,
    wordsOutsideText,
    numberOfHeaders,
    numberOfFigures,
    numberOfMathInlines,
    numberOfMathDisplayed,
  };
}
