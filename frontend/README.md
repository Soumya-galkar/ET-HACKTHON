# IKIP — Industrial Knowledge Intelligence Platform

A React + Vite frontend for an industrial knowledge intelligence platform: document management, semantic search, an AI assistant, a knowledge graph explorer, and maintenance intelligence reporting. Built to talk to a separate FastAPI backend over a REST API.

## Tech Stack

- **React 19** + **Vite** — build tooling and dev server
- **React Router** — client-side routing
- **Axios** — API client
- **Tailwind CSS** — styling
- **React Flow** + **dagre** — knowledge graph visualization and auto-layout
- **Recharts** — dashboard charts
- **Phosphor Icons** — icon set
- **Sonner** — toast notifications

## Prerequisites

- Node.js 18+ and npm
- A running instance of the backend API (see `.env` below)

## Getting Started

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173` by default.

### Environment variables

Create a `.env` file in the project root (one is included with a default):

```
VITE_BACKEND_URL=http://localhost:8000
```

All API calls are made to `${VITE_BACKEND_URL}/api/...` via the shared Axios instance in `src/lib/api.js`.

## Available Scripts

| Command           | Description                              |
|--------------------|------------------------------------------|
| `npm run dev`      | Start the Vite dev server with HMR        |
| `npm run build`    | Build for production to `dist/`           |
| `npm run preview`  | Preview the production build locally      |
| `npm run lint`     | Run ESLint                                |

## Project Structure

```
src/
├── App.jsx                     # Route definitions and top-level providers
├── main.jsx                    # App entry point
├── index.css                   # Tailwind directives + design tokens
├── lib/
│   └── api.js                  # Axios instance, auth header + 401 handling
├── context/
│   └── AuthContext.jsx         # Auth state, login/signup/logout
├── components/
│   └── layout/
│       ├── AppShell.jsx        # Sidebar + main content wrapper
│       ├── Sidebar.jsx         # Primary navigation
│       └── ProtectedRoute.jsx  # Redirects to /login when unauthenticated
└── pages/
    ├── Login.jsx / Signup.jsx  # Auth screens
    ├── Profile.jsx             # Current user's profile
    ├── Dashboard.jsx           # KPIs + charts overview
    ├── Documents.jsx           # Upload, list, and manage documents
    ├── DocumentViewer.jsx      # Single document detail + in-doc search
    ├── Search.jsx              # Semantic search across documents
    ├── Assistant.jsx           # AI chat assistant
    ├── KnowledgeGraph.jsx      # Interactive graph explorer (React Flow)
    └── Maintenance.jsx         # AI-generated maintenance intelligence reports
```

Path imports use the `@` alias for `src/` (e.g. `@/lib/api`), configured in `vite.config.js`.

## Routing & Auth

- `/login`, `/signup` are public.
- All other routes are wrapped in `ProtectedRoute`, which checks `AuthContext` and redirects to `/login` if there's no authenticated user.
- The auth token is stored in `localStorage` under `ikip_token`; a 401 response from the API automatically clears the session and redirects to `/login`.

## Notes

- Tailwind is configured with a dark, SCADA-style industrial theme (see CSS variables in `src/index.css`); the UI is currently dark-mode only.
- The knowledge graph page expects node/edge data from the backend and uses `dagre` to auto-layout the graph before rendering with React Flow.
- This is a frontend-only project — it does not implement any backend logic and expects to be paired with a compatible API.
