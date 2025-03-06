import React, { useRef, useEffect } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import { editor } from 'monaco-editor';

interface CodePanelProps {
  code: string;
  onCodeChange: (newCode: string) => void;
  focusedNodeId: string | null;
  setFocusedLineNumber: (lineNumber: number | null) => void;
  lineToElementMap: Map<number, { type: string; id: string }>;
}

const CodePanel: React.FC<CodePanelProps> = ({
  code,
  onCodeChange,
  focusedNodeId,
  setFocusedLineNumber,
  lineToElementMap,
}) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const decorationsRef = useRef<string[]>([]);

  // Handle editor initialization
  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editor;
    
    // Add syntax highlighting for our custom language
    monaco.languages.register({ id: 'diagramAsCode' });
    monaco.languages.setMonarchTokensProvider('diagramAsCode', {
      tokenizer: {
        root: [
          [/\/\/.*$/, 'comment'],
          [/direction\s+(right|left|up|down)/, 'keyword'],
          [/colorMode\s+(pastel|bold|outline)/, 'keyword'],
          [/styleMode\s+(shadow|plain|watercolor)/, 'keyword'],
          [/typeface\s+(rough|clean|mono)/, 'keyword'],
          [/\[[^\]]*\]/, 'property'],
          [/\{/, 'group.open'],
          [/\}/, 'group.close'],
          [/\s*>\s*/, 'connection'],
          [/\s*<>\s*/, 'connection'],
          [/\s*<\s*/, 'connection'],
          [/\s*-\s*/, 'connection'],
          [/\s*-->\s*/, 'connection'],
          [/\s*--\s*/, 'connection'],
          [/\w+\s*(?=\[)/, 'node.name'],
          [/\w+\s*(?=\{)/, 'group.name'],
          [/\w+\s*(?=>|<|-)/, 'node.name'],
        ],
      },
    });
    
    // Add a theme
    monaco.editor.defineTheme('diagramTheme', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '008800' },
        { token: 'keyword', foreground: '0000FF', fontStyle: 'bold' },
        { token: 'property', foreground: 'AA6600' },
        { token: 'node.name', foreground: '0066BB' },
        { token: 'group.name', foreground: 'BB6600', fontStyle: 'bold' },
        { token: 'connection', foreground: 'FF0000' },
      ],
      colors: {},
    });
    
    // Apply the custom theme
    monaco.editor.setTheme('diagramTheme');
    
    // Handle cursor position changes
    editor.onDidChangeCursorPosition((e) => {
      const lineNumber = e.position.lineNumber - 1; // 0-based index
      
      // Check if this line corresponds to a node or edge
      const element = lineToElementMap.get(lineNumber);
      if (element) {
        setFocusedLineNumber(lineNumber);
      }
    });
  };

  // Highlight line when a node is selected in the diagram
  useEffect(() => {
    if (!editorRef.current || !focusedNodeId) return;
    
    // Find which line corresponds to the focused node
    const lineEntry = Array.from(lineToElementMap.entries()).find(
      ([_, value]) => value.id === focusedNodeId
    );
    
    if (lineEntry) {
      const [lineNumber] = lineEntry;
      
      // Clear previous decorations
      if (decorationsRef.current.length > 0) {
        decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, []);
      }
      
      // Add new decoration
      decorationsRef.current = editorRef.current.deltaDecorations([], [
        {
          range: {
            startLineNumber: lineNumber + 1, // Monaco is 1-based
            endLineNumber: lineNumber + 1,
            startColumn: 1,
            endColumn: 1000,
          },
          options: {
            isWholeLine: true,
            className: 'highlighted-line',
            inlineClassName: 'highlighted-text',
          },
        },
      ]);
      
      // Reveal the line
      editorRef.current.revealLineInCenter(lineNumber + 1);
    }
  }, [focusedNodeId, lineToElementMap]);

  return (
    <div className="h-full w-full overflow-hidden">
      <Editor
        height="100%"
        defaultLanguage="diagramAsCode"
        value={code}
        onChange={(value) => onCodeChange(value || '')}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: true },
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          wordWrap: 'on',
        }}
      />
      <style>{`
        .highlighted-line {
          background-color: rgba(255, 0, 114, 0.1);
          border-left: 3px solid #ff0072;
        }
        .highlighted-text {
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default CodePanel;
