# Authentication Setup with better-auth and Google Provider

This project uses `better-auth` for authentication with Google OAuth provider.

## Setup Instructions

1. Create a `.env` file based on `.env.example`:

   ```
   # Authentication
   AUTH_SECRET="your-auth-secret-here"
   AUTH_URL="http://localhost:3000"

   # Google OAuth
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"

   # Database
   DATABASE_URL="postgresql://postgres:password@localhost:5432/ecom"
   ```

2. Get Google OAuth credentials:

   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Select "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (for development)
     - `https://your-production-domain.com/api/auth/callback/google` (for production)
   - Copy the Client ID and Client Secret to your `.env` file

3. Generate a random string for AUTH_SECRET:
   ```bash
   openssl rand -base64 32
   ```

## Authentication Flow

1. The application uses the schemas defined in `src/db/schema/auth-schema.ts` for user data, sessions, accounts, and verification.
2. Authentication is configured in `src/auth.ts`.
3. The middleware in `src/middleware.ts` protects routes.
4. Components in `src/components/auth/` provide the UI for authentication.

## Usage

### Checking Authentication Status

```tsx
// Server Component
import { auth } from "@/auth";

export default async function SomePage() {
  const session = await auth.api.getSession();

  if (!session?.user) {
    // Not authenticated
  }

  // User is authenticated
  return <div>Hello, {session.user.name}</div>;
}
```

```tsx
// Client Component
"use client";

import { useAuth } from "@/contexts/auth-context";

export default function SomeClientComponent() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Not authenticated</div>;
  }

  return <div>Hello, {user.name}</div>;
}
```

### Available Authentication Components

- `<GoogleSignInButton />`: Button for signing in with Google
- `<UserMenu />`: Dropdown menu showing user info and sign out option
- `<SignInButton />` and `<SignOutButton />`: Simple buttons for signing in and out
