// Minimal example showing CodeMirror (Markdown) + ReactMarkdown with rehype-sanitize
import { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";

export default function ExampleEditor() {
  const [md, setMd] = useState("# Hello\n\nInline math: $E=mc^2$\n\n```ts\nconst x: number = 1;\n```");
  const schema = {}; // supply your allowlist schema here
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <div>
        <CodeMirror value={md} height="60vh" onChange={setMd} />
      </div>
      <div style={{ padding: 12, border: "1px solid #e5e7eb", borderRadius: 8 }}>
        <ReactMarkdown rehypePlugins={[[rehypeSanitize, schema], rehypeKatex, rehypeHighlight]}>
          {md}
        </ReactMarkdown>
      </div>
    </div>
  );
}
