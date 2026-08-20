import Editor from "@monaco-editor/react";

function CodeEditor({
  value,
  onChange,
  language = "python",
  height = "400px",
}) {
  return (
    <div className="form-group">
      <Editor
        height={height}
        language={language}
        theme="vs-dark"
        value={value}
        onChange={(value) => onChange(value ?? "")}
        options={{
          minimap: {
            enabled: false,
          },
          fontSize: 14,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 4,
          wordWrap: "on",
        }}
      />
    </div>
  );
}

export default CodeEditor;
