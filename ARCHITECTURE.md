# ARCHITECTURE.md

## Project Overview

This project is a production-ready social media starter template built with:

* Next.js (App Router)
* TypeScript
* Tailwind CSS
* shadcn/ui
* Drizzle ORM
* Neon PostgreSQL
* NextAuth.js (Auth.js)
* Drizzle Adapter
* TanStack Query
* TanStack Virtual
* React Hook Form
* Zod
* Zustand
* Server Actions (preferred)
* Vercel Deployment

### Goals

* Lightweight and maintainable.
* Server-first architecture.
* Minimal client-side JavaScript.
* AI-agent friendly folder structure.
* Avoid unnecessary dependencies and duplicated logic.
* Follow modern Next.js App Router best practices.

---

# Core Principles

## 1. Server First

Prefer React Server Components (RSC).

Only use `"use client"` when one of these is required:

* useState
* useEffect
* browser APIs
* event handlers
* Zustand
* TanStack Query hooks
* React Hook Form

Never add `"use client"` to a page or layout unless absolutely necessary.

---

## 2. Data Ownership

### Server State → TanStack Query

Use TanStack Query for:

* Feed
* Posts
* Comments
* User profiles
* Notifications
* Followers
* Search results
* Bookmarks

Never duplicate server state into Zustand.

### Client/UI State → Zustand

Use Zustand only for:

* Theme
* Sidebar open/close
* Mobile menu
* Modal/dialog visibility
* Draft post content
* Upload preview
* Command palette
* Local UI filters
* Global loading overlay
* Global search dialog
* UI preferences

Never store API data collections in Zustand.

---

## 3. Database Layer

### Database

* Neon PostgreSQL

### ORM

* Drizzle ORM

### Rules

* Never write raw SQL unless absolutely necessary.
* All database access must go through Drizzle ORM.
* Keep schema inside `/src/db/schema`.
* Keep reusable queries inside `/src/db/queries`.
* Keep migrations inside `/src/db/migrations`.

Example:

```text
src/
└── db/
    ├── schema/
    ├── queries/
    ├── migrations/
    └── index.ts
```

---

## 4. Server Actions

Prefer Server Actions over API Routes whenever possible.

Use API Routes only for:

* NextAuth route handler
* Webhooks
* External integrations
* Public APIs
* Streaming endpoints
* File uploads (when necessary)

Business logic should live inside:

```text
src/actions/
├── auth-actions.ts
├── post-actions.ts
├── comment-actions.ts
├── profile-actions.ts
└── user-actions.ts
```

Do not place database logic directly inside components.

---

## 5. Authentication

### Authentication Stack

* NextAuth.js (Auth.js)
* Drizzle Adapter
* Neon PostgreSQL

### Rules

* Use NextAuth.js for all authentication and session management.
* Always use the Drizzle Adapter.
* Prefer server-side session retrieval using `auth()`.
* Use `signIn()` and `signOut()` for client authentication actions.
* Never manually implement custom JWT authentication.
* Never store access tokens or session tokens in localStorage.
* Protect pages and Server Actions using `auth()` or middleware.
* Authentication logic must not be duplicated across components.

Suggested structure:

```text
src/
├── auth.ts
├── auth.config.ts
├── auth.config.base.ts
└── app/
    └── api/
        └── auth/
            └── [...nextauth]/
                └── route.ts
```

---

## 6. Form Handling

Always use:

* React Hook Form
* Zod
* @hookform/resolvers

Validation rules:

* Shared validation schemas belong in `/src/lib/validations`.
* Never duplicate validation logic between frontend and backend.

---

## 7. UI Components

Use shadcn/ui as the design system.

Rules:

* Prefer composition over modification.
* Keep reusable wrappers inside `/src/components`.
* Do not install large UI frameworks (Material UI, Ant Design, etc.).
* Use Lucide React for icons.

Structure:

```text
src/components/
├── ui/
├── layout/
├── shared/
├── feed/
├── profile/
├── comment/
└── common/
```

---

## 8. Folder Structure

```text
src/
├── app/
│   ├── (auth)/
│   ├── (dashboard)/
│   ├── (feed)/
│   ├── profile/
│   ├── settings/
│   └── api/
│
├── actions/
├── components/
├── db/
├── hooks/
├── lib/
├── providers/
├── services/
├── stores/
├── types/
├── utils/
└── auth.ts
```

---

## 9. Zustand Store Rules

Store location:

```text
src/stores/
├── theme-store.ts
├── sidebar-store.ts
├── compose-store.ts
├── draft-store.ts
└── upload-store.ts
```

Allowed use cases:

* Theme
* Sidebar
* Mobile navigation
* Modal state
* Draft post
* Upload preview
* UI preferences

Never create:

* feed-store
* posts-store
* comments-store
* users-store
* notifications-store

These belong to TanStack Query.

---

## 10. TanStack Query Rules

Query Keys:

```ts
["feed"]
["feed", cursor]
["post", postId]
["comments", postId]
["profile", username]
["notifications"]
["bookmarks"]
```

Always use:

* useQuery
* useInfiniteQuery
* useMutation
* queryClient.invalidateQueries()

Prefer optimistic updates for:

* Like
* Bookmark
* Follow
* Delete own post

---

## 11. Feed Rendering

Large lists must use:

* TanStack Virtual
* useInfiniteQuery
* IntersectionObserver

Never render thousands of DOM nodes directly.

Feed flow:

```text
Neon PostgreSQL
        ↓
   Drizzle ORM
        ↓
  Server Actions
        ↓
TanStack Query
(useInfiniteQuery)
        ↓
TanStack Virtual
        ↓
 React Component
```

---

## 12. File Uploads

Preferred:

* UploadThing
* Vercel Blob

Never store uploaded files directly inside the repository.

Database stores only metadata and file URLs.

---

## 13. Styling

Use:

* Tailwind CSS
* shadcn/ui
* clsx
* tailwind-merge

Avoid:

* CSS-in-JS libraries.
* Large UI frameworks.
* Inline style objects except for dynamic values.

---

## 14. Performance Rules

* Prefer Server Components.
* Lazy load heavy client components.
* Use `next/image`.
* Use dynamic imports for editors and charts.
* Memoize expensive computations.
* Avoid unnecessary `useEffect`.
* Avoid unnecessary global state.
* Use TanStack Virtual for large lists.
* Prefer cursor pagination over offset pagination.

---

## 15. AI Agent Coding Rules

When generating code, always follow these rules:

1. Prefer Server Components.
2. Do not add `"use client"` unless required.
3. Use Server Actions before API Routes.
4. Use Drizzle ORM for all database operations.
5. Use TanStack Query for server state.
6. Use Zustand only for UI state.
7. Use React Hook Form + Zod for forms.
8. Use shadcn/ui components whenever available.
9. Follow the existing folder structure.
10. Never create duplicate utility functions.
11. Never introduce Redux.
12. Never introduce Prisma unless explicitly requested.
13. Never replace NextAuth.js with another auth library.
14. Never add dependencies without a clear reason.
15. Keep bundle size small.
16. Prefer reusable components over page-specific implementations.
17. Never duplicate server state inside Zustand.
18. Prefer cursor-based pagination for feeds.
19. Read this ARCHITECTURE.md before generating code.

---

## 16. Dependency Policy

### Approved Runtime Dependencies

* next
* react
* react-dom
* next-auth
* @auth/drizzle-adapter
* drizzle-orm
* @neondatabase/serverless
* @tanstack/react-query
* @tanstack/react-virtual
* react-hook-form
* zod
* @hookform/resolvers
* zustand
* date-fns
* lucide-react
* clsx
* tailwind-merge

### Approved Development Dependencies

* drizzle-kit
* typescript
* eslint
* prettier

Avoid adding new libraries if native browser APIs or existing dependencies already solve the problem.

---

## 17. Architecture Diagram

```text
                 ┌─────────────────────┐
                 │     Next.js App     │
                 │   (App Router/RSC)  │
                 └──────────┬──────────┘
                            │
          ┌─────────────────┼─────────────────┐
          │                                   │
          ▼                                   ▼
 Server Components                   Client Components
          │                                   │
          │                           Zustand (UI State)
          │                                   │
          ▼                                   ▼
    Server Actions                 TanStack Query Hooks
          │                                   │
          └─────────────────┬─────────────────┘
                            ▼
                    NextAuth.js (Auth)
                            │
                            ▼
                      Drizzle ORM
                            │
                            ▼
                   Neon PostgreSQL
```

---

## 18. Golden Rules

* **Server data belongs to TanStack Query.**
* **UI state belongs to Zustand.**
* **Authentication belongs to NextAuth.js.**
* **Database access belongs to Drizzle ORM.**
* **Business logic belongs to Server Actions.**
* **Presentation belongs to React Components.**
* **Never duplicate responsibilities between layers.**
* **Keep the project lightweight and AI-agent friendly.**
