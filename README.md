# Next.js 16 + Better Auth + Supabase Integration

This project implements secure email & password authentication using [Better Auth](https://better-auth.com/) coupled directly to a [Supabase PostgreSQL](https://supabase.com/) database. The design replicates the premium, minimalist Next.js/Vercel black theme with customized input components and smooth micro-animations.

---

## Authentication Flow Visualization

### 1. User Registration Flow
When a user signs up, the request flows from the client form component, through the Next.js API catch-all route, and is written directly to the Supabase database.

```mermaid
sequenceDiagram
    autonumber
    actor User as User Browser
    participant Client as React Client (authClient)
    participant Server as Next.js API Handler (...all/route.ts)
    participant Auth as Better Auth Server Core
    participant DB as Supabase PostgreSQL

    User->>Client: Enters name, email, password & submits
    Client->>Client: Triggers authClient.signUp.email()
    Client->>Server: HTTP POST /api/auth/signup/email (Payload)
    Server->>Auth: Handles request using auth.handler
    Auth->>Auth: Hashes password securely (scrypt)
    Auth->>DB: Checks if user exists & inserts records in user & account tables
    DB-->>Auth: Inserts success
    Auth-->>Server: Generates registration response
    Server-->>Client: Returns JSON response + Redirect callback
    Client-->>User: Redirects to /login?registered=true
```

---

### 2. User Sign-In & Session Flow
During sign-in, Better Auth verifies credentials, generates session keys, and synchronizes cookies directly using Next.js 16 cookie helpers.

```mermaid
sequenceDiagram
    autonumber
    actor User as User Browser
    participant Client as React Client (authClient)
    participant Server as Next.js API Handler (...all/route.ts)
    participant Auth as Better Auth Server Core
    participant DB as Supabase PostgreSQL

    User->>Client: Enters email, password & submits
    Client->>Client: Triggers authClient.signIn.email()
    Client->>Server: HTTP POST /api/auth/sign-in/email (Payload)
    Server->>Auth: Handles request using auth.handler
    Auth->>DB: Queries user & password details from account table
    DB-->>Auth: Returns user credentials
    Auth->>Auth: Verifies hashed password & generates session token
    Auth->>DB: Inserts new session record in session table
    DB-->>Auth: Inserts success
    Auth->>Auth: Attaches Set-Cookie headers (session token)
    Auth-->>Server: Returns session response
    Server->>Server: nextCookies() intercepts headers & sets secure cookie via cookies() API
    Server-->>Client: Returns HTTP 200 + Cookie
    Client-->>User: Redirects to / (authenticated homepage)
```

---

## Project Structure & Architecture

```
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...all]/
│   │           └── route.ts         # Catch-all Route Handler for auth actions
│   ├── login/
│   │   └── page.tsx                 # Sleek dark login page with Suspense
│   ├── register/
│   │   └── page.tsx                 # Sleek dark registration page
│   ├── globals.css                  # Core design styles (Tailwind v4)
│   └── layout.tsx                   # Font configurations and global layout
├── lib/
│   ├── auth-client.ts               # Better Auth Client instance
│   ├── auth.ts                      # Server-side Better Auth initialization
│   └── db.ts                        # pg.Pool database connection pool
├── .env.local                       # Local database & auth secrets
└── README.md                        # Documentation & Architecture
```

### Component Details
*   **[lib/db.ts](file:///Users/navi/Documents/nav-next/lib/db.ts)**: Configures a `pg.Pool` database connection pool referencing the Supabase PostgreSQL string (`process.env.DATABASE_URL`).
*   **[lib/auth.ts](file:///Users/navi/Documents/nav-next/lib/auth.ts)**: Integrates the Postgres adapter using the pool instance. Adds the `nextCookies()` plugin for Next.js 16 cookie synchronization.
*   **[lib/auth-client.ts](file:///Users/navi/Documents/nav-next/lib/auth-client.ts)**: Configures `createAuthClient` utilizing the public-facing API URL.
*   **[app/api/auth/[...all]/route.ts](file:///Users/navi/Documents/nav-next/app/api/auth/[...all]/route.ts)**: Proxies all auth requests to the core library handler.
*   **[app/register/page.tsx](file:///Users/navi/Documents/nav-next/app/register/page.tsx)** & **[app/login/page.tsx](file:///Users/navi/Documents/nav-next/app/login/page.tsx)**: Modern React UI forms styled in Next.js's premium black/dark theme, featuring custom input controls, focus rings, loading transitions, and success/error displays.

---

## Setup & Running Guide

### 1. Database Configuration (`.env.local`)
Create a `.env.local` file at the root level containing the following:
```env
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
BETTER_AUTH_SECRET="your_32_character_random_string"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 2. Run Database Migrations
Run the Better Auth CLI to create required tables (`user`, `session`, `account`, `verification`) in Supabase:
```bash
npx @better-auth/cli migrate --config lib/auth.ts
```

### 3. Run Development Server
Start the local server:
```bash
pnpm dev
```
Open [http://localhost:3000/register](http://localhost:3000/register) to register your first user, then log in at [http://localhost:3000/login](http://localhost:3000/login).
