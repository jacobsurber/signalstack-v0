# Contributing to SignalStack

Thank you for your interest in contributing to SignalStack! This document provides guidelines and information for contributors.

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   \`\`\`bash
   git clone https://github.com/yourusername/signalstack.git
   cd signalstack
   \`\`\`
3. **Install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`
4. **Set up environment variables**:
   \`\`\`bash
   cp .env.example .env.local
   # Add your API keys to .env.local
   \`\`\`

## 🔧 Development Workflow

1. **Create a feature branch**:
   \`\`\`bash
   git checkout -b feature/your-feature-name
   \`\`\`

2. **Make your changes** following our coding standards

3. **Test your changes**:
   \`\`\`bash
   npm run dev
   npm run type-check
   npm run lint
   \`\`\`

4. **Commit your changes**:
   \`\`\`bash
   git add .
   git commit -m "feat: add your feature description"
   \`\`\`

5. **Push to your fork**:
   \`\`\`bash
   git push origin feature/your-feature-name
   \`\`\`

6. **Create a Pull Request** on GitHub

## 📝 Coding Standards

### TypeScript
- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid `any` types when possible
- Use strict type checking

### React/Next.js
- Use functional components with hooks
- Follow React best practices
- Use Server Components when possible
- Implement proper error boundaries

### Code Style
- Use Prettier for code formatting
- Follow ESLint rules
- Use meaningful variable and function names
- Add comments for complex logic

### API Design
- Use proper HTTP status codes
- Implement comprehensive error handling
- Add input validation with Zod schemas
- Include rate limiting for external APIs

## 🧪 Testing

- Test all new features thoroughly
- Verify API integrations work correctly
- Check responsive design on different screen sizes
- Test with different AI models if applicable

## 📚 Documentation

- Update README.md for new features
- Add JSDoc comments for complex functions
- Update API documentation if needed
- Include examples in your documentation

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Description**: Clear description of the issue
2. **Steps to Reproduce**: Detailed steps to reproduce the bug
3. **Expected Behavior**: What you expected to happen
4. **Actual Behavior**: What actually happened
5. **Environment**: Browser, OS, Node.js version
6. **Screenshots**: If applicable

## 💡 Feature Requests

For feature requests, please include:

1. **Problem**: What problem does this solve?
2. **Solution**: Proposed solution or feature
3. **Alternatives**: Alternative solutions considered
4. **Use Cases**: How would this be used?

## 🔒 Security

- Never commit API keys or sensitive data
- Use environment variables for configuration
- Follow security best practices
- Report security issues privately

## 📋 Pull Request Guidelines

### Before Submitting
- [ ] Code follows project standards
- [ ] Tests pass locally
- [ ] Documentation is updated
- [ ] No console.log statements in production code
- [ ] Environment variables are properly configured

### PR Description
- Clearly describe what the PR does
- Reference any related issues
- Include screenshots for UI changes
- List any breaking changes

### Review Process
1. Automated checks must pass
2. Code review by maintainers
3. Testing in development environment
4. Approval and merge

## 🏷️ Commit Message Format

Use conventional commits format:

\`\`\`
type(scope): description

[optional body]

[optional footer]
\`\`\`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

Examples:
\`\`\`
feat(api): add support for international stocks
fix(ui): resolve mobile responsive issues
docs(readme): update installation instructions
\`\`\`

## 🤝 Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect different opinions and approaches

## 📞 Getting Help

- Check existing issues and documentation
- Ask questions in GitHub Discussions
- Join our community channels
- Contact maintainers for complex issues

## 🎯 Areas for Contribution

We welcome contributions in these areas:

### High Priority
- Bug fixes and stability improvements
- Performance optimizations
- Mobile responsiveness
- Accessibility improvements

### Medium Priority
- New AI model integrations
- Additional market data sources
- Enhanced charting capabilities
- User authentication features

### Low Priority
- UI/UX improvements
- Documentation enhancements
- Code refactoring
- Testing improvements

## 🏆 Recognition

Contributors will be:
- Listed in our contributors section
- Mentioned in release notes
- Invited to join our contributor community
- Eligible for special recognition

Thank you for contributing to SignalStack! 🚀
