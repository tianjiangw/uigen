# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run setup        # First-time setup: install deps, generate Prisma client, run migrations
npm run dev          # Start dev server (Turbopack) at http://localhost:3000
npm run build        # Production build
npm run lint         # ESLint via Next.js
npm run test         # Run Vitest test suite
npm run db:reset     # Force reset database (destructive)
```

Environment: copy `.env.example` to `.env` and add `ANTHROPIC_API_KEY` (optional — falls back to a mock provider that generates static components).

## Architecture

UIGen is an AI-powered React component generator with live preview. Users describe a component in chat; Claude generates it using tool calls that write to a **virtual (in-memory) file system**; the result renders in a live preview iframe.

### Key Layers

**AI pipeline** (`src/app/api/chat/route.ts`)
- Streaming chat endpoint using Vercel AI SDK (`streamText`)
- Claude operates agentically (up to 40 steps) with two tools: `str_replace_editor` and `file_manager`
- Mock provider fallback (in `src/lib/provider.ts`) when no API key is set

**Virtual File System** (`src/lib/file-system.ts`)
- All generated code lives in an in-memory `VirtualFileSystem` instance — nothing is written to disk
- Supports standard file/directory operations plus text-editor-style operations (view, replace, insert)
- State is serialized to JSON and persisted in the `Project.data` DB column for authenticated users

**State management** — two React contexts:
- `FileSystemContext` (`src/lib/contexts/file-system-context.tsx`): owns the VFS instance, applies tool-call results from the AI
- `ChatContext` (`src/lib/contexts/chat-context.tsx`): owns chat history via `useChat`, orchestrates tool call handling

**Authentication** (`src/lib/auth.ts`)
- JWT sessions (7-day expiry) stored in HTTP-only cookies via `jose`
- Anonymous users can use the app; projects are persisted only for registered users
- Middleware (`src/middleware.ts`) gates the `[projectId]` route

**Database** — Prisma + SQLite (`prisma/schema.prisma`)
- Two models: `User` and `Project`
- `Project.messages` = JSON-serialized chat history; `Project.data` = JSON-serialized VFS state

**Live preview** (`src/components/preview/`)
- Renders the virtual file system content inside an iframe
- Uses `@babel/standalone` in-browser to transpile JSX before rendering

## Code Style

Only comment complex or non-obvious code. Avoid comments that restate what the code does.

### Path Alias

`@/*` maps to `src/*` (configured in `tsconfig.json` and `vitest.config.mts`).

### Tech Stack

- **Framework**: Next.js 15 (App Router, Turbopack)
- **AI**: Anthropic Claude via `@ai-sdk/anthropic` + Vercel AI SDK (`ai`)
- **Styling**: Tailwind CSS v4 + shadcn/ui (New York style) + Radix UI primitives
- **Editor**: Monaco Editor (`@monaco-editor/react`)
- **ORM**: Prisma 6 with SQLite
- **Testing**: Vitest + jsdom + Testing Library
