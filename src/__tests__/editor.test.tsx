import { describe, expect, it, afterEach, vi } from 'vitest';
import { act, createRef } from 'react';
import { createRoot } from 'react-dom/client';
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

  it('keeps bare URLs visible on inactive lines', () => {
    const { host } = mount(
      <AtomicCodeMirrorEditor markdownSource={'- https://example.com'} />,
    );

    const content = host.querySelector('.cm-content');
    expect(content).not.toBeNull();
    expect(content?.textContent).toContain('https://example.com');
  });

  it.each([
    ['same-text markdown link', '[https://example.com](https://example.com)'],
    ['angle autolink', '<https://example.com>'],
    ['escaped URL slashes', String.raw`https:\/\/example.com`],
  ])('renders %s as clean visible URL text', (_name, markdown) => {
    const { host } = mount(
      <AtomicCodeMirrorEditor markdownSource={markdown} />,
    );

    expect(host.querySelector('.cm-content')?.textContent).toBe(
      'https://example.com',
    );
  });

  it.each([
    ['https://example.com', 'https://example.com'],
    [
      '[https://label.example](https://destination.example)',
      'https://destination.example',
    ],
  ])('opens the correct URL for %s', (markdown, expectedUrl) => {
    const onLinkClick = vi.fn();
    const { host } = mount(
      <AtomicCodeMirrorEditor
        markdownSource={markdown}
        onLinkClick={onLinkClick}
      />,
    );
    const link = host.querySelector<HTMLElement>('.cm-atomic-link');
    expect(link).not.toBeNull();

    vi.spyOn(link!, 'getClientRects').mockReturnValue([
      {
        left: 0,
        right: 100,
        top: 0,
        bottom: 20,
      } as DOMRect,
    ] as unknown as DOMRectList);
    const computedStyle = vi
      .spyOn(window, 'getComputedStyle')
      .mockReturnValue({ fontSize: '16px' } as CSSStyleDeclaration);
    try {
      act(() => {
        link?.dispatchEvent(
          new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            button: 0,
            clientX: 95,
            clientY: 10,
          }),
        );
      });
    } finally {
      computedStyle.mockRestore();
    }

    expect(onLinkClick).toHaveBeenCalledWith(expectedUrl);
  });
});
