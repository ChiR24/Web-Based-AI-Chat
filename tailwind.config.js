/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'bg-primary': 'var(--bg-primary)',
        'bg-primary-rgb': 'var(--bg-primary-rgb)',
        'bg-secondary': 'var(--bg-secondary)',
        'bg-secondary-rgb': 'var(--bg-secondary-rgb)',
        'bg-tertiary': 'var(--bg-tertiary)',
        'bg-tertiary-rgb': 'var(--bg-tertiary-rgb)',
        'text-primary': 'var(--text-primary)',
        'text-primary-rgb': 'var(--text-primary-rgb)',
        'text-secondary': 'var(--text-secondary)',
        'text-secondary-rgb': 'var(--text-secondary-rgb)',
        'text-tertiary': 'var(--text-tertiary)',
        'text-tertiary-rgb': 'var(--text-tertiary-rgb)',
        'accent-primary': 'var(--accent-primary)',
        'accent-primary-rgb': 'var(--accent-primary-rgb)',
        'accent-primary-hover': 'var(--accent-primary-hover)',
        'accent-secondary': 'var(--accent-secondary)',
        'accent-secondary-rgb': 'var(--accent-secondary-rgb)',
        'input-border': 'var(--input-border)',
        'input-border-focus': 'var(--input-border-focus)',
        'gemini-primary': 'var(--gemini-primary)',
        'gemini-primary-rgb': 'var(--gemini-primary-rgb)',
        'code-bg': 'var(--code-bg)',
        'code-text': 'var(--code-text)',
        'code-comment': 'var(--code-comment)',
        'code-function': 'var(--code-function)',
        'code-keyword': 'var(--code-keyword)',
        'code-string': 'var(--code-string)',
        'code-variable': 'var(--code-variable)',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: 'var(--text-secondary)',
            a: {
              color: 'var(--accent-primary)',
              '&:hover': {
                color: 'var(--accent-primary-hover)',
              },
            },
            h1: {
              color: 'var(--text-primary)',
            },
            h2: {
              color: 'var(--text-primary)',
            },
            h3: {
              color: 'var(--text-primary)',
            },
            h4: {
              color: 'var(--text-primary)',
            },
            strong: {
              color: 'var(--text-primary)',
            },
            code: {
              color: 'var(--code-text)',
              backgroundColor: 'var(--code-bg)',
              borderRadius: '0.25rem',
              padding: '0.2em 0.4em',
            },
            pre: {
              backgroundColor: 'var(--code-bg)',
              code: {
                backgroundColor: 'transparent',
                padding: 0,
              },
            },
            blockquote: {
              color: 'var(--text-secondary)',
              borderLeftColor: 'var(--accent-primary)',
              borderLeftWidth: '4px',
              fontStyle: 'italic',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 