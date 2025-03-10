# Contributing to Gemini AI Chat

Thank you for considering contributing to Gemini AI Chat! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please be respectful and considerate of others when contributing to this project. We value a positive and inclusive community.

## How to Contribute

1. **Fork the repository**: Create your own copy of the project.
2. **Create a branch**: Make a branch for your changes (`git checkout -b feature/my-feature`).
3. **Make changes**: Implement your feature or bug fix.
4. **Test your changes**: Make sure your changes don't break existing functionality.
5. **Commit your changes**: Use clear and meaningful commit messages.
6. **Push to your fork**: Upload your changes to your fork on GitHub.
7. **Submit a pull request**: Create a PR to merge your changes into the main project.

## Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ChiR24/Web-Based-AI-Chat.git
   cd Web-Based-AI-Chat
   ```

2. **Install dependencies**:
   ```bash
   npm install
   cd server
   npm install
   cd ..
   ```

3. **Set up environment variables**:
   - Copy `.env.example` to `.env`
   - Add your Gemini API key

4. **Start the development server**:
   ```bash
   # Start the search server
   cd server
   npm start

   # In another terminal
   cd Web-Based-AI-Chat
   npm run dev
   ```

## Pull Request Guidelines

- Keep PRs focused on single issues or features
- Make sure your code follows the existing style
- Include tests if applicable
- Update documentation if necessary
- Ensure your code passes all tests

## Coding Style

- Follow the existing code style
- Use TypeScript features appropriately
- Comment your code where necessary
- Use meaningful variable and function names

## Testing

- Run existing tests before submitting your PR
- Add tests for new functionality where appropriate

## Documentation

- Update the README.md if your changes affect the usage of the project
- Document new features or changes in behavior

## Questions?

If you have any questions about contributing, please open an issue or contact the maintainers. 