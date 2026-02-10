# TODO: Integrate Clerk Authentication

- [x] Update src/main.tsx to wrap App with ClerkProvider using the publishable key from environment variables.
- [x] Update src/App.tsx to use Clerk hooks (useUser, SignedIn, SignedOut) instead of custom auth state. Remove custom auth logic, users state, and related functions (handleLogin, handleRegister, handleLogout). Remove localStorage for auth and user management.
- [x] Replace src/components/Login.tsx with Clerk's SignIn component for authentication UI.
- [ ] Run the app to test Clerk integration and ensure it loads correctly with Clerk auth.
