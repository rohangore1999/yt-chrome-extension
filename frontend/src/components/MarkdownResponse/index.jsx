import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Styles
import "github-markdown-css/github-markdown.css";
import "./MarkdownResponse.css";

// Helpers
import { customRenderers } from "./helpers";

const MarkdownResponse = ({ text }) => (
  <div className="markdown-body">
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={customRenderers}>
      {text}
    </ReactMarkdown>
  </div>
);

export default MarkdownResponse;
