# Arka Fork Changes

This file records the behavior added or adjusted in the `texteditors/atomic-editor` fork beyond Atomic Editor v0.6.2. It is intentionally organized by editor capability rather than by individual commits.

### Markdown Highlighting

Markdown punctuation and structural syntax receive additional highlighting so headings, emphasis, lists, links, tables, and similar source constructs remain easier to scan while editing. The inline-preview and table rendering paths use the same treatment, and the behavior is covered by editor tests.

### Table

Interactive Markdown tables retain normal text-editing behavior. Pasting into cells is restored and hardened, including clipboard content that contains multiple cells or rows. Quick clicks and clicks in the first cell keep the caret in the expected place instead of losing focus or selecting an unintended range.

### URL

Bare URLs stay visible in the editor instead of being incorrectly hidden as Markdown link syntax. Escaped URLs continue to render as text, and URL pasting works without interfering with table editing.

### Task Checkbox

Rendered Markdown task checkboxes have custom sizing, styling, and baseline alignment. This makes checkbox markers read cleanly beside the surrounding line text rather than sitting too low or appearing undersized.

### Spellcheck

`AtomicCodeMirrorEditor` now supports opt-in native spellchecking through `spellcheck` and `spellcheckLanguage` props. When enabled, Atomic marks both the CodeMirror editing host and its immediate text wrappers with native writing-assistance attributes. That lets browsers and WebViews supply their own misspelling underline, correction menu, language dictionary, and user dictionary, including hosts that require the attribute on the text wrapper rather than only on the editable root.

### Upstream Compatibility

The fork was merged with Atomic Editor v0.6.2. The merge preserves the fork's table-specific behavior while incorporating upstream changes, so the custom editor features continue to live on a current Atomic baseline.
