import ReactMarkdown from "react-markdown";
import { CodeHighlight } from "./CodeHighlight";

interface MDXContentProps {
  content: string;
}

export function MDXContent({ content }: MDXContentProps) {
  return (
    <div className="prose prose-lg dark:prose-invert max-w-none">
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            const language = match ? match[1] : "";

            return !inline && language ? (
              <CodeHighlight language={language} {...props}>
                {String(children).replace(/\n$/, "")}
              </CodeHighlight>
            ) : (
              <code
                className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono"
                {...props}
              >
                {children}
              </code>
            );
          },
          pre({ children }: any) {
            return <>{children}</>;
          },
          h1({ children }: any) {
            return <h1 className="text-3xl font-bold mt-8 mb-4">{children}</h1>;
          },
          h2({ children }: any) {
            return (
              <h2 className="text-2xl font-bold mt-10 mb-4">{children}</h2>
            );
          },
          h3({ children }: any) {
            return (
              <h3 className="text-xl font-semibold mt-6 mb-3">{children}</h3>
            );
          },
          p({ children }: any) {
            return <p className="my-4 leading-relaxed">{children}</p>;
          },
          a({ href, children }: any) {
            return (
              <a
                href={href}
                className="text-blue-600 dark:text-blue-400 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            );
          },
          ul({ children }: any) {
            return (
              <ul className="list-disc list-inside my-4 space-y-2">
                {children}
              </ul>
            );
          },
          ol({ children }: any) {
            return (
              <ol className="list-decimal list-inside my-4 space-y-2">
                {children}
              </ol>
            );
          },
          blockquote({ children }: any) {
            return (
              <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-4 text-gray-700 dark:text-gray-300">
                {children}
              </blockquote>
            );
          },
          hr() {
            return <hr className="my-8 border-gray-300 dark:border-gray-600" />;
          },
          img({ src, alt }: any) {
            return (
              <img
                src={src}
                alt={alt}
                className="rounded-lg my-4 max-w-full h-auto"
              />
            );
          },
          strong({ children }: any) {
            return <strong className="font-bold">{children}</strong>;
          },
          em({ children }: any) {
            return <em className="italic">{children}</em>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
