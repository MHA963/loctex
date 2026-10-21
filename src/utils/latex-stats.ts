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

/**
 * Strips LaTeX command markup from text while retaining the enclosed word tokens.
 * E.g., `\textbf{Hello} world` -> `Hello world`
 */
export function stripLatexMarkup(text: string): string {
  let cleaned = text;

  // Unpack common inline formatting macros with one argument: \macro{content} -> content
  // Repeat to handle nesting e.g. \textbf{\textit{word}}
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

const OUTSIDE_TEXT_ENV_REGEX =
  /\\begin\{(?:abstract|tabular\*?|table\*?)\}[\s\S]*?\\end\{(?:abstract|tabular\*?|table\*?)\}/gi;

/**
 * Computes all 8 document statistics for the provided LaTeX document text.
 */
export function computeDocumentStatistics(latexSource: string): DocumentStatistics {
  if (!latexSource || !latexSource.trim()) {
    return { ...EMPTY_STATISTICS };
  }

  // 1. Strip comments
  let workingText = stripLatexComments(latexSource);

  // 2. Isolate body if \begin{document} is present
  const docStart = workingText.indexOf('\\begin{document}');
  if (docStart !== -1) {
    const afterStart = docStart + '\\begin{document}'.length;
    const docEnd = workingText.indexOf('\\end{document}', afterStart);
    workingText = docEnd !== -1 ? workingText.slice(afterStart, docEnd) : workingText.slice(afterStart);
  }

  // 3. Count Display Math & remove from working text
  let numberOfMathDisplayed = 0;

  // Environment display math: \begin{equation} ... \end{equation}
  const envDisplayMatches = workingText.match(DISPLAY_MATH_ENV_REGEX);
  if (envDisplayMatches) {
    numberOfMathDisplayed += envDisplayMatches.length;
    workingText = workingText.replace(DISPLAY_MATH_ENV_REGEX, ' ');
  }

  // $$ ... $$ display math
  const doubleDollarRegex = /\$\$[\s\S]*?\$\$/g;
  const doubleDollarMatches = workingText.match(doubleDollarRegex);
  if (doubleDollarMatches) {
    numberOfMathDisplayed += doubleDollarMatches.length;
    workingText = workingText.replace(doubleDollarRegex, ' ');
  }

  // \[ ... \] display math
  const bracketDisplayRegex = /\\\[[\s\S]*?\\\]/g;
  const bracketDisplayMatches = workingText.match(bracketDisplayRegex);
  if (bracketDisplayMatches) {
    numberOfMathDisplayed += bracketDisplayMatches.length;
    workingText = workingText.replace(bracketDisplayRegex, ' ');
  }

  // 4. Count Inline Math & remove from working text
  let numberOfMathInlines = 0;

  // \( ... \) inline math
  const parenInlineRegex = /\\\([\s\S]*?\\\)/g;
  const parenInlineMatches = workingText.match(parenInlineRegex);
  if (parenInlineMatches) {
    numberOfMathInlines += parenInlineMatches.length;
    workingText = workingText.replace(parenInlineRegex, ' ');
  }

  // $ ... $ inline math (single dollar, non-escaped)
  const singleDollarRegex = /(?<!\\)\$(?!\$)([\s\S]*?)(?<!\\)\$/g;
  const singleDollarMatches = workingText.match(singleDollarRegex);
  if (singleDollarMatches) {
    numberOfMathInlines += singleDollarMatches.length;
    workingText = workingText.replace(singleDollarRegex, ' ');
  }

  // 5. Count Figures
  let numberOfFigures = 0;
  // Match figure environments: \begin{figure} / \begin{figure*} / \begin{wrapfigure}
  const figureEnvRegex = /\\begin\{(?:figure\*?|wrapfigure)\}/gi;
  const figureEnvMatches = workingText.match(figureEnvRegex);
  const figureEnvCount = figureEnvMatches ? figureEnvMatches.length : 0;
  numberOfFigures += figureEnvCount;

  // Standalone \includegraphics outside figure environments
  // First, extract all figure env blocks to count any standalone graphics outside them
  const figureBlockRegex = /\\begin\{(?:figure\*?|wrapfigure)\}[\s\S]*?\\end\{(?:figure\*?|wrapfigure)\}/gi;
  const textWithoutFigures = workingText.replace(figureBlockRegex, ' ');
  const standaloneGraphics = textWithoutFigures.match(/\\includegraphics(?:\*|\[[^\]]*\])?\{[^{}]*\}/gi);
  if (standaloneGraphics) {
    numberOfFigures += standaloneGraphics.length;
  }

  // 6. Count Headers and Words in Headers
  let numberOfHeaders = 0;
  let wordsInHeaders = 0;

  const headerCommandRegex = new RegExp(
    `\\\\(${HEADER_NAMES.join('|')})\\*?(?:\\[[^\\]]*\\])?\\s*\\{`,
    'g'
  );

  let match: RegExpExecArray | null;
  const headerRanges: { start: number; end: number; text: string }[] = [];

  while ((match = headerCommandRegex.exec(workingText)) !== null) {
    const braceStartIndex = match.index + match[0].length - 1;
    const braceEndIndex = findMatchingBrace(workingText, braceStartIndex);
    if (braceEndIndex !== -1) {
      const headerContent = workingText.slice(braceStartIndex + 1, braceEndIndex);
      headerRanges.push({
        start: match.index,
        end: braceEndIndex + 1,
        text: headerContent,
      });
      numberOfHeaders++;
      wordsInHeaders += countWords(headerContent);
    }
  }

  // Remove headers from working text (in reverse order to preserve indices)
  for (let i = headerRanges.length - 1; i >= 0; i--) {
    const r = headerRanges[i];
    workingText = workingText.slice(0, r.start) + ' ' + workingText.slice(r.end);
  }

  // 7. Count Words Outside Text (captions, footnotes, thanks, abstract, tables)
  let wordsOutsideText = 0;

  // Outside text environments (abstract, tabular, table)
  const outsideEnvs = workingText.match(OUTSIDE_TEXT_ENV_REGEX);
  if (outsideEnvs) {
    for (const envText of outsideEnvs) {
      wordsOutsideText += countWords(envText);
    }
    workingText = workingText.replace(OUTSIDE_TEXT_ENV_REGEX, ' ');
  }

  // Outside text commands: \caption{...}, \footnote{...}, \thanks{...}, \marginpar{...}
  const outsideCommandRegex = /\\(?:caption\*?|footnote|thanks|marginpar)(?:\[[^\]]*\])?\s*\{/g;
  const outsideRanges: { start: number; end: number; text: string }[] = [];

  while ((match = outsideCommandRegex.exec(workingText)) !== null) {
    const braceStartIndex = match.index + match[0].length - 1;
    const braceEndIndex = findMatchingBrace(workingText, braceStartIndex);
    if (braceEndIndex !== -1) {
      const outsideContent = workingText.slice(braceStartIndex + 1, braceEndIndex);
      outsideRanges.push({
        start: match.index,
        end: braceEndIndex + 1,
        text: outsideContent,
      });
      wordsOutsideText += countWords(outsideContent);
    }
  }

  // Remove outside commands from working text
  for (let i = outsideRanges.length - 1; i >= 0; i--) {
    const r = outsideRanges[i];
    workingText = workingText.slice(0, r.start) + ' ' + workingText.slice(r.end);
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
