import { describe, expect, it, afterEach } from 'vitest';
import { createRef } from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import {
  AtomicCodeMirrorEditor,
  type AtomicCodeMirrorEditorHandle,
} from '../AtomicCodeMirrorEditor';

const hosts: HTMLElement[] = [];

function mount(element: React.ReactNode) {
  const host = document.createElement('div');
  host.style.width = '600px';
  host.style.height = '400px';
  document.body.appendChild(host);
  hosts.push(host);
  const root = createRoot(host);
  act(() => {
    root.render(element);
  });
  return { host, root };
}

afterEach(() => {
  for (const host of hosts.splice(0)) host.remove();
});

describe('AtomicCodeMirrorEditor', () => {
  it('mounts and exposes the initial markdown via the imperative handle', () => {
    const handleRef = createRef<AtomicCodeMirrorEditorHandle | null>() as {
      current: AtomicCodeMirrorEditorHandle | null;
    };

    mount(
      <AtomicCodeMirrorEditor
        markdownSource={'# Hello\n\nWorld.'}
        editorHandleRef={handleRef}
      />,
    );

    expect(handleRef.current).not.toBeNull();
    expect(handleRef.current?.getMarkdown()).toBe('# Hello\n\nWorld.');
  });

  it('renders `.cm-content` with the raw markdown visible in the DOM', () => {
    const { host } = mount(
      <AtomicCodeMirrorEditor markdownSource={'**bold** and *em*'} />,
    );
    const content = host.querySelector('.cm-content');
    expect(content).not.toBeNull();
    // Raw delimiters stay in the doc even though inline-preview may
    // hide them from view on inactive lines — they remain in the
    // `state.doc` and therefore the underlying DOM text.
    expect(content?.textContent).toContain('bold');
    expect(content?.textContent).toContain('em');
  });

  it('renders highlight syntax with the expected preview class', () => {
    const { host } = mount(
      <AtomicCodeMirrorEditor markdownSource={'This has ==highlighted text== in it.'} />,
    );

    const highlight = host.querySelector('.cm-atomic-highlight');
    expect(highlight).not.toBeNull();
    expect(highlight?.textContent).toContain('highlighted text');
  });

  it('renders highlight syntax inside table cells', () => {
    const { host } = mount(
      <AtomicCodeMirrorEditor
        markdownSource={[
          '| Plain | Highlight |',
          '| --- | --- |',
          '| text | ==glow== |',
        ].join('\n')}
      />,
    );

    const highlight = host.querySelector('.cm-atomic-table-cell-source .cm-atomic-highlight');
    expect(highlight).not.toBeNull();
    expect(highlight?.textContent).toContain('glow');
  });

  it('keeps bare URLs visible on inactive lines', () => {
    const { host } = mount(
      <AtomicCodeMirrorEditor markdownSource={'- https://example.com'} />,
    );

    const content = host.querySelector('.cm-content');
    expect(content).not.toBeNull();
    expect(content?.textContent).toContain('https://example.com');
  });
});
