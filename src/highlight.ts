import { type InlineContext, type MarkdownConfig } from '@lezer/markdown';
import { tags as t } from '@lezer/highlight';

const HighlightDelim = { resolve: 'Highlight', mark: 'HighlightMark' };
let Punctuation = /[!"#$%&'()*+,\-.\/:;<=>?@\[\\\]^_`{|}~\xA1\u2010-\u2027]/;
try {
  Punctuation = new RegExp('[\\p{S}|\\p{P}]', 'u');
} catch {
  // Older runtimes fall back to the ASCII+Latin punctuation set above.
}

function parseHighlight(cx: InlineContext, next: number, pos: number): number {
  if (next !== 61 /* '=' */ || cx.char(pos + 1) !== 61 || cx.char(pos + 2) === 61) {
    return -1;
  }

  const before = cx.slice(pos - 1, pos);
  const after = cx.slice(pos + 2, pos + 3);
  const spacedBefore = /\s|^$/.test(before);
  const spacedAfter = /\s|^$/.test(after);
  const punctBefore = Punctuation.test(before);
  const punctAfter = Punctuation.test(after);

  return cx.addDelimiter(
    HighlightDelim,
    pos,
    pos + 2,
    !spacedAfter && (!punctAfter || spacedBefore || punctBefore),
    !spacedBefore && (!punctBefore || spacedAfter || punctAfter),
  );
}

/// Markdown extension for `==highlight==` syntax.
export const highlightMarkdown: MarkdownConfig = {
  defineNodes: [
    {
      name: 'Highlight',
      style: t.special(t.content),
    },
    {
      name: 'HighlightMark',
      style: t.processingInstruction,
    },
  ],
  parseInline: [
    {
      name: 'Highlight',
      parse: parseHighlight,
      after: 'Strikethrough',
    },
  ],
};
