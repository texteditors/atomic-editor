import { createRoot } from 'react-dom/client';
import { AtomicCodeMirrorEditor } from '@atomic-editor/editor';
import '@atomic-editor/editor/styles.css';
import './spellcheck.css';

function SpellcheckProbe() {
  return (
    <main className="spellcheck-probe">
      <section className="spellcheck-probe-panel">
        <h1>Plain contenteditable</h1>
        <div
          className="spellcheck-probe-input"
          contentEditable
          spellCheck
          lang="en-US"
          suppressContentEditableWarning
        >
          Type specil here.
        </div>
      </section>
      <section className="spellcheck-probe-panel">
        <h1>Atomic Editor</h1>
        <AtomicCodeMirrorEditor
          markdownSource={'Type specil here.'}
          documentId="spellcheck-probe"
          spellcheck
          spellcheckLanguage="en-US"
        />
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<SpellcheckProbe />);
