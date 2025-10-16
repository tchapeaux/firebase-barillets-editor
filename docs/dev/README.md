# Developer Documentation

## Quick Start for AI Coding Agents

This directory contains comprehensive project context for AI coding assistants (Claude Code, GitHub Copilot, etc.).

### Where to Start?

- **New to the project?** → Read [architecture.md](architecture.md)
- **Fixing a bug?** → Read [architecture.md](architecture.md) + [conventions.md](conventions.md)
- **Adding a feature?** → Read [architecture.md](architecture.md) + [roadmap.md](roadmap.md) + [conventions.md](conventions.md)
- **Code review?** → Read [conventions.md](conventions.md)
- **Debugging an issue?** → Check [known-issues.md](known-issues.md)

## Project Overview

**Firebase Barillets Editor** is a web application for creating and managing "barillets" (theme collections) for improvisation theater shows. Each barillet contains 18 themes with specific rules for duration, participation, categories, and type (Mixte/Comparée).

### Key Concepts

- **Barillet**: A collection of 18 themes for an improv show
- **Theme**: Individual improv game with type, title, participation, category, and duration
- **Type**: "Mixte" (mixed) or "Comparée" (compared) - affects how teams perform
- **Participation**: Number/type of participants (fixed, per-team, unlimited, etc.)
- **Category**: Game constraints (or "Libre" for no constraints)
- **Duration**: Time limit in MM:SS format, with special values and "maximum" flag

### Technology Stack

- **Frontend**: Vue 3 + TypeScript + Vite
- **Routing**: Vue Router 4.x
- **Backend**: Firebase (Firestore + Authentication)
- **Styling**: Tailwind CSS 3.4+ with PostCSS & Autoprefixer
- **UI Components**: shadcn-vue (Radix Vue primitives + Tailwind)

### Primary Language

- **UI/User-facing**: French
- **Code/Documentation**: English

## Documentation Index

| File                               | Purpose                                                     | Read When                                                     |
| ---------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------- |
| [architecture.md](architecture.md) | Current implementation, tech stack, file structure, routing | Understanding codebase structure, working on any feature      |
| [conventions.md](conventions.md)   | Code style, patterns, development commands                  | Writing code, code review, following project standards        |
| [roadmap.md](roadmap.md)           | Feature backlog, priorities, technical debt                 | Planning new features, understanding future direction         |
| [known-issues.md](known-issues.md) | Current limitations, workarounds, open questions            | Debugging, avoiding known pitfalls, understanding constraints |

## Quick Reference Links

- **Main Requirements**: [../../PROJECT.md](../../PROJECT.md)
- **User Guide**: [../../README.md](../../README.md)

---

**Last Updated**: 2025-10-17
