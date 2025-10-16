# Firebase Barillets Editor

A web application for creating and managing "barillets" (theme collections) for improvisation theater shows.

## Quick Start

### Prerequisites

- Node.js 18+
- Firebase account
- Firebase CLI: `npm i -g firebase-tools`

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd firebase-barillets-editor
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Build for production**

   ```bash
   npm run build
   ```

5. **Deploy to Firebase Hosting**
   ```bash
   npm run deploy
   ```

## Firebase Configuration

The Firebase configuration is stored in `src/firebase-app.ts`. These values are safe to commit publicly - Firebase security relies on Firestore security rules and authentication, not on hiding config values.

If you want to use your own Firebase project:

1. Create a new project at [Firebase Console](https://console.firebase.google.com/)
2. Update the config in `src/firebase-app.ts`
3. Deploy security rules: `firebase deploy --only firestore:rules`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run type-check` - Run TypeScript type checking
- `npm run deploy` - Deploy to Firebase Hosting

## Tech Stack

- **Frontend**: Vue 3 + TypeScript
- **Routing**: Vue Router 4
- **Backend**: Firebase (Firestore + Authentication)
- **Build Tool**: Vite 7
- **Styling**: Vanilla CSS with CSS variables

## Documentation

### For Users

- [PROJECT.md](PROJECT.md) - Original project requirements

### For Developers & AI Agents

- **[docs/dev/](docs/dev/)** - Comprehensive developer documentation
  - [Architecture & Current State](docs/dev/architecture.md)
  - [Code Conventions & Patterns](docs/dev/conventions.md)
  - [Feature Roadmap](docs/dev/roadmap.md)
  - [Known Issues & Limitations](docs/dev/known-issues.md)

### For AI Coding Agents

- [.claude/README.md](.claude/README.md) - Claude Code context
- [.github/copilot-instructions.md](.github/copilot-instructions.md) - GitHub Copilot instructions

## Features

- ✅ User authentication (email/password)
- ✅ Create, read, update, delete barillets
- ✅ Barillet editor with full theme editing
- ✅ Real-time synchronization
- ✅ Responsive design
- ✅ Data validation and error handling
