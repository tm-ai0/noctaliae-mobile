# 🤝 Contributing to Noctaliæ

First off, thank you for considering contributing to Noctaliæ! 🌙

It's people like you that make Noctaliæ a better tool for dream analysis.

---

## 📖 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Style Guidelines](#style-guidelines)
- [Commit Messages](#commit-messages)

---

## 📜 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code:

- **Be respectful** and considerate
- **Be collaborative** and open to feedback
- **Focus on what is best** for the community
- **Show empathy** towards other community members

---

## 🎯 How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates.

When creating a bug report, include:

- **Clear title** and description
- **Steps to reproduce** the behavior
- **Expected behavior**
- **Actual behavior**
- **Screenshots** if applicable
- **Device/OS information**
- **App version**

### 💡 Suggesting Features

Feature suggestions are welcome! Please include:

- **Clear title** and description
- **Use case** - why is this feature needed?
- **Proposed solution** - how would it work?
- **Alternatives** - other ways to achieve the same goal

### 🔬 Scientific Contributions

If you have expertise in neuroscience or dream research:

- Suggest improvements to analysis prompts
- Share relevant research papers
- Propose new analysis frameworks
- Help validate scientific accuracy

### 🎨 Design Contributions

If you're a designer:

- Suggest UI/UX improvements
- Create new theme concepts
- Improve iconography
- Enhance accessibility

### 💻 Code Contributions

See [Development Setup](#development-setup) below.

---

## 🛠️ Development Setup

### Prerequisites

- **Node.js** 20+
- **npm** or **yarn**
- **Expo CLI**: `npm install -g expo-cli`
- **Android Studio** (for Android emulator)
- **Git**

### Setup Steps

```bash
# 1. Fork the repo on GitHub
# 2. Clone your fork
git clone https://github.com/YOUR-USERNAME/noctaliae-mobile.git
cd noctaliae-mobile

# 3. Add upstream remote
git remote add upstream https://github.com/tm-ai0/noctaliae-mobile.git

# 4. Install dependencies
npm install

# 5. Copy environment variables
cp .env.example .env

# 6. Start the dev server
npm start
```

### Project Structure

```
noctaliae-mobile/
├── src/
│   ├── components/     # Reusable UI components
│   ├── screens/        # Screen components
│   ├── services/       # API services
│   ├── utils/          # Utility functions
│   ├── constants/      # Constants and config
│   └── types/          # TypeScript types
├── assets/             # Images, fonts, etc.
├── docs/               # Documentation
└── scripts/            # Utility scripts
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test:watch

# Check code coverage
npm test:coverage

# Type checking
npm run typecheck
```

---

## 🔄 Pull Request Process

### Before Submitting

1. **Create a new branch** from `main`
   ```bash
   git checkout -b feature/my-amazing-feature
   ```

2. **Make your changes** following our [Style Guidelines](#style-guidelines)

3. **Test your changes**
   ```bash
   npm test
   npm run typecheck
   ```

4. **Commit your changes** with a [good commit message](#commit-messages)

5. **Push to your fork**
   ```bash
   git push origin feature/my-amazing-feature
   ```

### Submitting the PR

1. Go to the [original repository](https://github.com/tm-ai0/noctaliae-mobile)
2. Click "New Pull Request"
3. Select your branch
4. Fill in the PR template:
   - **Title**: Clear and descriptive
   - **Description**: What does this PR do?
   - **Related Issues**: Link any related issues
   - **Screenshots**: If applicable
   - **Testing**: How did you test this?

### PR Review Process

- A maintainer will review your PR
- Address any requested changes
- Once approved, your PR will be merged!

---

## 🎨 Style Guidelines

### Code Style

We follow **React Native** and **TypeScript** best practices.

#### JavaScript/TypeScript

```typescript
// ✅ Good
const analyzeDream = async (dreamText: string): Promise<Analysis> => {
  // Implementation
};

// ❌ Bad
function analyzeDream(dreamText) {
  // Implementation
}
```

#### React Components

```typescript
// ✅ Good - Functional component with TypeScript
interface DreamCardProps {
  dream: Dream;
  onPress: () => void;
}

export const DreamCard: React.FC<DreamCardProps> = ({ dream, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text>{dream.title}</Text>
    </TouchableOpacity>
  );
};

// ❌ Bad - Class component without types
export class DreamCard extends React.Component {
  render() {
    return (
      <TouchableOpacity onPress={this.props.onPress}>
        <Text>{this.props.dream.title}</Text>
      </TouchableOpacity>
    );
  }
}
```

#### File Naming

- **Components**: `PascalCase.tsx` (e.g., `DreamCard.tsx`)
- **Screens**: `PascalCase.tsx` (e.g., `HomeScreen.tsx`)
- **Services**: `camelCase.ts` (e.g., `apiService.ts`)
- **Utils**: `camelCase.ts` (e.g., `dateUtils.ts`)
- **Constants**: `UPPER_SNAKE_CASE.ts` (e.g., `THEME_COLORS.ts`)

#### Formatting

We use **Prettier** for code formatting:

```bash
# Format all files
npm run format

# Check formatting
npm run format:check
```

---

## 📝 Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks

### Examples

```bash
# Feature
feat(analysis): add Llama 3.3 70B support

# Bug fix
fix(recording): resolve audio permission crash on Android 12

# Documentation
docs(readme): update installation instructions

# Refactor
refactor(themes): extract theme constants to separate file

# Performance
perf(chat): optimize message rendering with FlatList

# Breaking change
feat(api)!: change API endpoint structure

BREAKING CHANGE: API endpoints now use /v2/ prefix
```

### Scope Examples

- `analysis` - Dream analysis features
- `recording` - Audio recording features
- `chat` - Chat/conversation features
- `themes` - Theme system
- `api` - API/backend integration
- `ui` - UI components
- `deps` - Dependencies

---

## 🧪 Testing Guidelines

### Writing Tests

Every new feature should include tests:

```typescript
// DreamCard.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import { DreamCard } from './DreamCard';

describe('DreamCard', () => {
  it('renders dream title correctly', () => {
    const dream = { id: '1', title: 'Flying Dream' };
    const { getByText } = render(<DreamCard dream={dream} />);
    
    expect(getByText('Flying Dream')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const dream = { id: '1', title: 'Flying Dream' };
    const { getByText } = render(
      <DreamCard dream={dream} onPress={onPress} />
    );
    
    fireEvent.press(getByText('Flying Dream'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
```

### Test Coverage

We aim for **>50% test coverage**. Run:

```bash
npm test:coverage
```

---

## 🌍 Translation Guidelines

If you want to help translate Noctaliæ:

1. Check `src/i18n/` for existing translations
2. Copy `en.json` to `your-language.json`
3. Translate all strings
4. Test the app with your language
5. Submit a PR!

Currently supported languages:
- 🇬🇧 English
- 🇫🇷 French
- 🇪🇸 Spanish (coming soon)
- 🇩🇪 German (coming soon)

---

## 📞 Questions?

- **General questions**: Open a [Discussion](https://github.com/tm-ai0/noctaliae-mobile/discussions)
- **Bug reports**: Open an [Issue](https://github.com/tm-ai0/noctaliae-mobile/issues)
- **Email**: contact@thomasmaury.fr

---

## 🙏 Thank You!

Your contributions make Noctaliæ better for everyone. We appreciate your time and effort! 🌙✨

---

**Made with ❤️ and 🧠 in Montpellier, France**
