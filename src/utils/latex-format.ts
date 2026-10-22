/**
 * Pure, editor-agnostic LaTeX formatting engine.
 *
 * Every operation takes the full document plus a selection range and returns a single
 * replacement edit. Keeping this logic free of CodeMirror makes toggle/unwrap behaviour
 * deterministic and unit-testable.
 */

export type InlineToggleKind = 'bold' | 'italic' | 'underline';
export type FontFamilyCommand = 'default' | 'rm' | 'sf' | 'tt';
export type FontSizeCommand =
  | 'normalsize'
  | 'tiny'
  | 'scriptsize'
  | 'footnotesize'
  | 'small'
  | 'large'
  | 'Large'
  | 'LARGE'
  | 'huge'
  | 'Huge';

interface GroupSpec {
  id: string;
  /** Text inserted before the content, e.g. `\textbf{` or `{\small `. */
  prefix: string;
  /** Offset of the opening brace inside `prefix` (used for brace matching). */
  braceOffset: number;
}

export interface FormatEdit {
  from: number;
  to: number;
  insert: string;
  selectionFrom: number;
  selectionTo: number;
}

export interface SelectionFormatState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  fontFamily: FontFamilyCommand;
  fontSize: FontSizeCommand;
}

interface MatchedGroup {
  spec: GroupSpec;
  start: number;
  contentStart: number;
  contentEnd: number;
  end: number;
}

const PLACEHOLDER_TEXT = 'text';
const MAX_BACKWARD_SCAN = 400;

const commandSpec = (id: string, command: string): GroupSpec => ({
  id,
  prefix: `\\${command}{`,
  braceOffset: command.length + 1,
});

const declarationSpec = (id: string, declaration: string): GroupSpec => ({
  id,
  prefix: `{\\${declaration} `,
  braceOffset: 0,
});

const INLINE_TOGGLE_SPECS: Record<InlineToggleKind, GroupSpec> = {
  bold: commandSpec('bold', 'textbf'),
  italic: commandSpec('italic', 'textit'),
  underline: commandSpec('underline', 'underline'),
};

export const FONT_FAMILY_OPTIONS: { id: FontFamilyCommand; label: string; command: string | null }[] = [
  { id: 'default', label: 'Document Default', command: null },
  { id: 'rm', label: 'Serif (\\textrm)', command: 'textrm' },
  { id: 'sf', label: 'Sans Serif (\\textsf)', command: 'textsf' },
  { id: 'tt', label: 'Monospace (\\texttt)', command: 'texttt' },
];

export const FONT_SIZE_OPTIONS: { id: FontSizeCommand; label: string }[] = [
  { id: 'tiny', label: 'Tiny' },
  { id: 'scriptsize', label: 'Script' },
  { id: 'footnotesize', label: 'Footnote' },
  { id: 'small', label: 'Small' },
  { id: 'normalsize', label: 'Normal' },
  { id: 'large', label: 'Large' },
  { id: 'Large', label: 'Larger' },
  { id: 'LARGE', label: 'Largest' },
  { id: 'huge', label: 'Huge' },
  { id: 'Huge', label: 'Huger' },
];

const FONT_FAMILY_SPECS: GroupSpec[] = FONT_FAMILY_OPTIONS.filter((option) => option.command).map((option) =>
  commandSpec(option.id, option.command as string)
);

const FONT_SIZE_SPECS: GroupSpec[] = FONT_SIZE_OPTIONS.filter((option) => option.id !== 'normalsize').map((option) =>
  declarationSpec(option.id, option.id)
);

/** Returns the index of the brace closing the one at `openIndex`, or -1 when unbalanced. */
export function findMatchingBrace(documentText: string, openIndex: number): number {
  let depth = 0;
  for (let index = openIndex; index < documentText.length; index++) {
    const character = documentText[index];
    if (character === '\\') {
      index++;
      continue;
    }
    if (character === '{') depth++;
    if (character === '}') {
      depth--;
      if (depth === 0) return index;
    }
  }
  return -1;
}

function findEnclosingGroup(documentText: string, from: number, to: number, specs: GroupSpec[]): MatchedGroup | null {
  let innermost: MatchedGroup | null = null;

  for (const spec of specs) {
    let searchFrom = from;
    for (let attempt = 0; attempt < MAX_BACKWARD_SCAN && searchFrom >= 0; attempt++) {
      const start = documentText.lastIndexOf(spec.prefix, searchFrom);
      if (start === -1) break;

      const closeIndex = findMatchingBrace(documentText, start + spec.braceOffset);
      const end = closeIndex + 1;
      if (closeIndex !== -1 && end >= to) {
        const candidate: MatchedGroup = {
          spec,
          start,
          contentStart: start + spec.prefix.length,
          contentEnd: closeIndex,
          end,
        };
        if (!innermost || candidate.start > innermost.start) {
          innermost = candidate;
        }
        break;
      }
      searchFrom = start - 1;
    }
  }

  return innermost;
}

function unwrapGroup(documentText: string, group: MatchedGroup): FormatEdit {
  const innerContent = documentText.slice(group.contentStart, group.contentEnd);
  return {
    from: group.start,
    to: group.end,
    insert: innerContent,
    selectionFrom: group.start,
    selectionTo: group.start + innerContent.length,
  };
}

function wrapRange(documentText: string, from: number, to: number, spec: GroupSpec): FormatEdit {
  const selectedText = documentText.slice(from, to) || PLACEHOLDER_TEXT;
  return {
    from,
    to,
    insert: `${spec.prefix}${selectedText}}`,
    selectionFrom: from + spec.prefix.length,
    selectionTo: from + spec.prefix.length + selectedText.length,
  };
}

/** Wraps the selection in the macro, or removes the macro when the selection is already inside it. */
export function toggleInlineFormat(documentText: string, from: number, to: number, kind: InlineToggleKind): FormatEdit {
  const spec = INLINE_TOGGLE_SPECS[kind];
  const enclosing = findEnclosingGroup(documentText, from, to, [spec]);
  return enclosing ? unwrapGroup(documentText, enclosing) : wrapRange(documentText, from, to, spec);
}

/**
 * Applies a mutually-exclusive wrapper (only one font family / size at a time).
 * An existing wrapper of the same group is replaced; `chosenSpec === null` simply removes it.
 */
function applyExclusiveGroup(
  documentText: string,
  from: number,
  to: number,
  groupSpecs: GroupSpec[],
  chosenSpec: GroupSpec | null
): FormatEdit | null {
  const enclosing = findEnclosingGroup(documentText, from, to, groupSpecs);

  if (!enclosing) {
    return chosenSpec ? wrapRange(documentText, from, to, chosenSpec) : null;
  }

  const innerContent = documentText.slice(enclosing.contentStart, enclosing.contentEnd);
  if (!chosenSpec) {
    return unwrapGroup(documentText, enclosing);
  }

  return {
    from: enclosing.start,
    to: enclosing.end,
    insert: `${chosenSpec.prefix}${innerContent}}`,
    selectionFrom: enclosing.start + chosenSpec.prefix.length,
    selectionTo: enclosing.start + chosenSpec.prefix.length + innerContent.length,
  };
}

export function applyFontFamily(documentText: string, from: number, to: number, family: FontFamilyCommand): FormatEdit | null {
  const chosenSpec = FONT_FAMILY_SPECS.find((spec) => spec.id === family) ?? null;
  return applyExclusiveGroup(documentText, from, to, FONT_FAMILY_SPECS, chosenSpec);
}

export function applyFontSize(documentText: string, from: number, to: number, size: FontSizeCommand): FormatEdit | null {
  const chosenSpec = FONT_SIZE_SPECS.find((spec) => spec.id === size) ?? null;
  return applyExclusiveGroup(documentText, from, to, FONT_SIZE_SPECS, chosenSpec);
}

/** Inspects the macros wrapping the current selection so the toolbar can mirror the real document state. */
export function detectSelectionFormat(documentText: string, from: number, to: number): SelectionFormatState {
  const familyGroup = findEnclosingGroup(documentText, from, to, FONT_FAMILY_SPECS);
  const sizeGroup = findEnclosingGroup(documentText, from, to, FONT_SIZE_SPECS);

  return {
    bold: findEnclosingGroup(documentText, from, to, [INLINE_TOGGLE_SPECS.bold]) !== null,
    italic: findEnclosingGroup(documentText, from, to, [INLINE_TOGGLE_SPECS.italic]) !== null,
    underline: findEnclosingGroup(documentText, from, to, [INLINE_TOGGLE_SPECS.underline]) !== null,
    fontFamily: (familyGroup?.spec.id as FontFamilyCommand) ?? 'default',
    fontSize: (sizeGroup?.spec.id as FontSizeCommand) ?? 'normalsize',
  };
}

/** Applies a `FormatEdit` to a string (used by tests and non-CodeMirror callers). */
export function applyFormatEdit(documentText: string, edit: FormatEdit): string {
  return documentText.slice(0, edit.from) + edit.insert + documentText.slice(edit.to);
}
