# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Project Commands & Guidelines

## Idea

This is a math contest problem database. The database contains many math problems which each have a rating. Each user also has a rating. The purpose of the rating is to feed a continuous stream of problems (in LaTeX) that are the correct difficulty for the user, much like chess puzzles. When a user faces a problem, whether or not they solve it will adjust the rating of both the user and the problem according to an ELO system.

## Commands
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npx next test <path>` - Run a specific test
- `npx drizzle-kit push` - Push schema to database

## Database
- **ORM**: Uses Drizzle ORM with PostgreSQL
- **Schema**: Located in `src/db/schema.ts`
- **Tables**: Users, accounts, sessions, verification tokens, problems, problem attempts, rating history
- **Connection**: Uses `postgres.js` client configured via `DATABASE_URL` environment variable
- **Adapter**: Uses `@auth/drizzle-adapter` for NextAuth integration

## Authentication
- **Framework**: NextAuth.js v5 (Beta) with JWT session strategy
- **Providers**: Google OAuth
- **Protection**: Uses Next.js middleware for route protection
- **Components**: Sign-in component uses server actions to initiate auth flow

## Code Style
- **Imports**: Use absolute imports with `@/*` path alias for src directory
- **Typing**: Use TypeScript with strict type checking
- **Components**: Prefer functional components with explicit return types
- **Naming**: Use PascalCase for components, camelCase for variables/functions
- **Formatting**: Use JSX with consistent indentation (2 spaces)
- **CSS**: Use Tailwind for styling with className attribute
- **Error Handling**: Use try/catch for async operations
- **Font**: Use Geist font family (sans and mono variants)
- **Structure**: Follow Next.js App Router conventions
- **Images**: Use Next.js Image component for optimization