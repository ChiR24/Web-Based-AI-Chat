import React from 'react';
import remarkGfm from 'remark-gfm';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const DependencyTest: React.FC = () => {
  const testContent = `
# Dependency Test

This is a simple test to check if all dependencies are working correctly.

## Code Test

\`\`\`javascript
// This is a simple JavaScript function
function calculateSum(a, b) {
  return a + b;
}

// Calculate the sum of two numbers
const result = calculateSum(5, 10);
console.log('The sum is:', result);

// Using arrow functions
const multiply = (a, b) => a * b;
console.log('The product is:', multiply(5, 10));

// Using array methods
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(num => num * 2);
console.log('Doubled numbers:', doubled);
\`\`\`

## Table Test

| Name | Value | Description |
|------|-------|-------------|
| Test | 123   | Test value  |
| Foo  | Bar   | Example     |
| Baz  | 456   | Another test|
| Qux  | 789   | Final test  |
`;

  return (
    <div className="p-4 bg-gray-900 text-white">
      <h1 className="text-xl font-bold mb-4">Dependency Test</h1>
      <div className="prose prose-invert">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ node, inline, className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={match[1]}
                  PreTag="div"
                  showLineNumbers={true}
                  lineNumberStyle={{ color: '#6b7280', paddingRight: '1em', borderRight: '1px solid #374151' }}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code className="bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                  {children}
                </code>
              );
            }
          }}
        >
          {testContent}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default DependencyTest; 