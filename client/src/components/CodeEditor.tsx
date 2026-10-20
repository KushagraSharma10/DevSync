import Editor, { type BeforeMount, type OnMount } from '@monaco-editor/react'

type CodeEditorProps = {
  value: string
  onChange: (value: string) => void
  onCursorChange: (line: number, column: number) => void
}

const handleBeforeMount: BeforeMount = (monaco) => {
  monaco.editor.defineTheme('devsync-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '7D8590', fontStyle: 'italic' },
      { token: 'keyword', foreground: '79B8FF' },
      { token: 'number', foreground: 'F8C391' },
      { token: 'string', foreground: 'A5D6A7' },
      { token: 'type', foreground: '79B8FF' },
      { token: 'identifier', foreground: 'E6EDF7' },
      { token: 'delimiter', foreground: '8A96A8' },
      { token: 'function', foreground: 'A9C7E8' },
      { token: 'member', foreground: 'E6EDF7' },
      { token: 'variable', foreground: 'E6EDF7' },
    ],
    colors: {
      'editor.background': '#0A0D14',
      'editor.foreground': '#E6EDF7',
      'editorGutter.background': '#0A0D14',
      'editorLineNumber.foreground': '#5B6B82',
      'editorLineNumber.activeForeground': '#8A96A8',
      'editor.lineHighlightBackground': '#18223266',
      'editor.lineHighlightBorder': '#00000000',
      'editorCursor.foreground': '#4C8DFF',
      'editor.selectionBackground': '#2F6FE055',
      'editor.inactiveSelectionBackground': '#2F6FE033',
      'editor.selectionHighlightBackground': '#2F6FE033',
      'editorWidget.background': '#121826',
      'editorWidget.border': '#243044',
      'scrollbarSlider.background': '#24304488',
      'scrollbarSlider.hoverBackground': '#243044BB',
      'scrollbarSlider.activeBackground': '#243044DD',
    },
  })
}

export function CodeEditor({ value, onChange, onCursorChange }: CodeEditorProps) {
  const handleMount: OnMount = (editor) => {
    editor.setPosition({ lineNumber: 12, column: 23 })
    editor.revealLine(12)
    editor.focus()
    onCursorChange(12, 23)

    editor.onDidChangeCursorPosition((event) => {
      onCursorChange(event.position.lineNumber, event.position.column)
    })
  }

  return (
    <Editor
      height="100%"
      language="javascript"
      theme="devsync-dark"
      value={value}
      beforeMount={handleBeforeMount}
      onMount={handleMount}
      onChange={(next) => onChange(next ?? '')}
      loading={
        <div className="flex h-full items-center justify-center bg-(--bg) text-sm text-(--text-muted)">
          Loading editor…
        </div>
      }
      options={{
        minimap: { enabled: false },
        fontSize: 15,
        lineHeight: 1.65,
        fontFamily:
          "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
        padding: { top: 16, bottom: 16 },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        renderLineHighlight: 'line',
        folding: false,
        lineNumbersMinChars: 4,
        lineDecorationsWidth: 16,
        hideCursorInOverviewRuler: true,
        overviewRulerBorder: false,
        overviewRulerLanes: 0,
        guides: { indentation: false, bracketPairs: false },
        bracketPairColorization: { enabled: false },
        matchBrackets: 'near',
        selectionHighlight: true,
        occurrencesHighlight: 'off',
        smoothScrolling: true,
        cursorBlinking: 'smooth',
        scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10 },
      }}
    />
  )
}
