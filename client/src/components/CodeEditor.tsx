import Editor, { type BeforeMount, type OnMount } from '@monaco-editor/react'
import {
  forwardRef,
  useImperativeHandle,
  useRef,
  type MutableRefObject,
} from 'react'
import { diffSpan } from '../lib/textMerge'
import { useUiStore } from '../stores/uiStore'

type MonacoStandaloneEditor = Parameters<OnMount>[0]

export type CodeEditorHandle = {
  applyRemote: (content: string) => void
  getValue: () => string
}

type CodeEditorProps = {
  /** Seed text for first mount (room remounts with key=roomCode). */
  initialValue?: string
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

  monaco.editor.defineTheme('devsync-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '6B7A90', fontStyle: 'italic' },
      { token: 'keyword', foreground: '1E5BBF' },
      { token: 'number', foreground: 'B45309' },
      { token: 'string', foreground: '047857' },
      { token: 'type', foreground: '1E5BBF' },
      { token: 'identifier', foreground: '0F172A' },
      { token: 'delimiter', foreground: '64748B' },
      { token: 'function', foreground: '1D4ED8' },
      { token: 'member', foreground: '0F172A' },
      { token: 'variable', foreground: '0F172A' },
    ],
    colors: {
      'editor.background': '#FFFFFF',
      'editor.foreground': '#0F172A',
      'editorGutter.background': '#FFFFFF',
      'editorLineNumber.foreground': '#94A3B8',
      'editorLineNumber.activeForeground': '#64748B',
      'editor.lineHighlightBackground': '#F0F4FA88',
      'editor.lineHighlightBorder': '#00000000',
      'editorCursor.foreground': '#2F6FE0',
      'editor.selectionBackground': '#2F6FE028',
      'editor.inactiveSelectionBackground': '#2F6FE018',
      'editor.selectionHighlightBackground': '#2F6FE018',
      'editorWidget.background': '#FFFFFF',
      'editorWidget.border': '#D5DEE9',
      'scrollbarSlider.background': '#D5DEE988',
      'scrollbarSlider.hoverBackground': '#D5DEE9BB',
      'scrollbarSlider.activeBackground': '#D5DEE9DD',
    },
  })
}

/** Apply remote text as a minimal range edit so the cursor stays put (C2). */
function applyMinimalRemoteEdit(editor: MonacoStandaloneEditor, next: string) {
  const model = editor.getModel()
  if (!model) return

  const prev = model.getValue()
  if (prev === next) return

  const { start, end, text } = diffSpan(prev, next)
  const startPos = model.getPositionAt(start)
  const endPos = model.getPositionAt(end)

  // Let Monaco adjust markers/cursors for the edit — do not force full replace.
  editor.executeEdits('devsync-remote', [
    {
      range: {
        startLineNumber: startPos.lineNumber,
        startColumn: startPos.column,
        endLineNumber: endPos.lineNumber,
        endColumn: endPos.column,
      },
      text,
      forceMoveMarkers: true,
    },
  ])
}

export const CodeEditor = forwardRef<CodeEditorHandle, CodeEditorProps>(
  function CodeEditor(
    { initialValue = '', onChange, onCursorChange },
    ref,
  ) {
    const theme = useUiStore((state) => state.theme)
    const monacoTheme = theme === 'light' ? 'devsync-light' : 'devsync-dark'
    const editorRef = useRef<MonacoStandaloneEditor | null>(null)
    const applyingRemoteRef = useRef(false)
    const pendingRemoteRef: MutableRefObject<string | null> = useRef(null)

    useImperativeHandle(ref, () => ({
      applyRemote(content: string) {
        const editor = editorRef.current
        if (!editor) {
          pendingRemoteRef.current = content
          return
        }
        applyingRemoteRef.current = true
        applyMinimalRemoteEdit(editor, content)
        queueMicrotask(() => {
          applyingRemoteRef.current = false
        })
      },
      getValue() {
        return editorRef.current?.getModel()?.getValue() ?? initialValue
      },
    }))

    const handleMount: OnMount = (editor) => {
      editorRef.current = editor
      editor.setPosition({ lineNumber: 1, column: 1 })
      editor.focus()
      onCursorChange(1, 1)

      editor.onDidChangeCursorPosition((event) => {
        onCursorChange(event.position.lineNumber, event.position.column)
      })

      if (pendingRemoteRef.current !== null) {
        const pending = pendingRemoteRef.current
        pendingRemoteRef.current = null
        applyingRemoteRef.current = true
        applyMinimalRemoteEdit(editor, pending)
        queueMicrotask(() => {
          applyingRemoteRef.current = false
        })
      }
    }

    return (
      <Editor
        height="100%"
        language="javascript"
        theme={monacoTheme}
        defaultValue={initialValue}
        beforeMount={handleBeforeMount}
        onMount={handleMount}
        onChange={(next) => {
          if (applyingRemoteRef.current) return
          onChange(next ?? '')
        }}
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
  },
)
