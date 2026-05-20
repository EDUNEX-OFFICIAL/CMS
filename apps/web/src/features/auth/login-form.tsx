"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@repo/ui";
import { createSession } from "@/lib/api";
import { signInWithEmail, signInWithGoogle } from "@/lib/firebase";
import { getDevQuickLogins } from "./dev-credentials";

export function LoginForm() {
  const router = useRouter();
  const devQuickLogins = useMemo(() => getDevQuickLogins(), []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSession(idToken: string) {
    const result = await createSession(idToken);
    if (!result.success) {
      setError(result.error.message);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  async function loginWithEmailPassword(
    loginEmail: string,
    loginPassword: string,
  ) {
    setEmail(loginEmail);
    setPassword(loginPassword);
    setLoading(true);
    setError(null);
    try {
      const idToken = await signInWithEmail(loginEmail, loginPassword);
      await handleSession(idToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function onEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    await loginWithEmailPassword(email, password);
  }

  async function onGoogleLogin() {
    setLoading(true);
    setError(null);
    try {
      const idToken = await signInWithGoogle();
      await handleSession(idToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md space-y-6 rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Sign in</h1>
        <p className="mt-1 text-sm text-slate-600">
          Use Firebase email/password or Google
        </p>
      </div>

      {devQuickLogins.length > 0 ? (
        <div className="space-y-2 rounded-md border border-dashed border-slate-300 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-800">
            Quick sign-in (dev)
          </p>
          <ul className="space-y-2">
            {devQuickLogins.map((account) => (
              <li key={account.email}>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() =>
                    void loginWithEmailPassword(account.email, account.password)
                  }
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-left text-sm transition hover:border-slate-400 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="block font-medium text-slate-900">
                    {account.label}
                  </span>
                  <span className="block text-xs text-slate-500">
                    {account.email}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <form onSubmit={onEmailLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <label
            htmlFor="login-password"
            className="block text-sm font-medium text-slate-700"
          >
            Password
          </label>
          <div className="relative mt-1">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full rounded-md border border-slate-300 py-2 pl-3 pr-10 text-sm"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-slate-500 hover:text-slate-800"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-5 w-5"
                  aria-hidden
                >
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-5 w-5"
                  aria-hidden
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>
        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Signing in..." : "Sign in with email"}
        </Button>
      </form>

      <Button
        type="button"
        variant="secondary"
        disabled={loading}
        className="w-full"
        onClick={onGoogleLogin}
      >
        Continue with Google
      </Button>
    </div>
  );
}
