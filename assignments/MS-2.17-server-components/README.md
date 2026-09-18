# Milestone 2.17: Default Server Component Behaviour

This folder contains the complete, self-contained solution for Milestone 2.17.

## Key Concepts Demonstrated:
1. **Server Components by Default**: In Next.js App Router, components default to Server Components unless explicitly marked with `'use client'`.
2. **Async Functions**: Server Components can be async and use `await` directly in the component body.
3. **No React Hooks Needed**: No `useState` or `useEffect` required for data fetching, eliminating client waterfalls.
4. **Zero Client Bundle Impact**: The code of Server Components executes on the server and only HTML is sent to the client.
5. **Security**: Database credentials, connection strings, and backend secrets never leak to browser DevTools.
