import { FormEvent, useState } from "react";
import { getApiError, loginUser, setToken } from "../api/client";

interface LoginProps {
  onAuthenticated: () => void;
  onShowRegister: () => void;
}

function Login({ onAuthenticated, onShowRegister }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const data = await loginUser(username.trim(), password);
      setToken(data.access_token);
      onAuthenticated();
    } catch (requestError) {
      setError(getApiError(requestError));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg sm:p-8">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-teal-600">Welcome back</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">Sign in</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Username</label>
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="min-h-12 w-full rounded-xl border border-slate-200 px-4 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
            autoComplete="username"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="min-h-12 w-full rounded-xl border border-slate-200 px-4 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
            autoComplete="current-password"
            required
          />
        </div>

        {error ? <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}

        <button
          type="submit"
          disabled={isLoading}
          className="min-h-12 w-full rounded-xl bg-teal-600 font-semibold text-white shadow-md transition hover:scale-105 hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:hover:scale-100"
        >
          {isLoading ? "Signing in..." : "Login"}
        </button>
      </form>

      <button
        type="button"
        onClick={onShowRegister}
        className="mt-5 w-full rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
      >
        Create an account
      </button>
    </div>
  );
}

export default Login;
