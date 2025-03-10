import React from 'react';
import { MessageRenderer } from '../../../shared/components';

/**
 * Component that demonstrates the enhanced formatting capabilities
 */
const FormatExampleMessage: React.FC = () => {
  const exampleContent = `
# Enhanced Formatting Examples

This message demonstrates the various formatting capabilities of our enhanced message renderer.

## Text Formatting

You can use **bold**, *italic*, or ~~strikethrough~~ text. You can also use \`inline code\` for code snippets.

## Code Blocks

Here's a JavaScript code example:

\`\`\`javascript
function calculateFactorial(n) {
  if (n === 0 || n === 1) {
    return 1;
  }
  return n * calculateFactorial(n - 1);
}

// Calculate factorial of 5
const result = calculateFactorial(5);
console.log(\`Factorial of 5 is \${result}\`);
\`\`\`

And here's a Python example:

\`\`\`python
def fibonacci(n):
    if n <= 0:
        return 0
    elif n == 1:
        return 1
    else:
        return fibonacci(n-1) + fibonacci(n-2)

# Print the first 10 Fibonacci numbers
for i in range(10):
    print(f"Fibonacci({i}) = {fibonacci(i)}")
\`\`\`

## Tables

| Language | Paradigm | Typing | Year |
|----------|----------|--------|------|
| JavaScript | Multi-paradigm | Dynamic | 1995 |
| Python | Multi-paradigm | Dynamic | 1991 |
| Rust | Multi-paradigm | Static | 2010 |
| Haskell | Functional | Static | 1990 |

## Blockquotes

> The best way to predict the future is to invent it.
> 
> — Alan Kay

## Lists

Ordered list:

1. First item
2. Second item
3. Third item
   1. Nested item 1
   2. Nested item 2

Unordered list:

- Item A
- Item B
  - Nested item X
  - Nested item Y
- Item C

## Links

Visit [GitHub](https://github.com) for more information.

## Images

Here's an example image:

![Example image](https://via.placeholder.com/600x400?text=Example+Image)
`;

  return (
    <div className="max-w-3xl mx-auto bg-[#1d1e20] rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-white">Format Examples</h2>
      <MessageRenderer content={exampleContent} />
    </div>
  );
};

export default FormatExampleMessage; 