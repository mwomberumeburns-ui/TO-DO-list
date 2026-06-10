import { FormEvent, useState } from "react";
import { getApiError, registerUser } from "../api/client";

interface RegisterProps {
  onRegistered: () => void;
  onShowLogin: () => void;
}

function Register({ onRegistered, onShowLogin }: RegisterProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      await registerUser(username.trim(), password);
      setMessage("Account created. You can sign in now.");
      setUsername("");
      setPassword("");
      onRegistered();
    } catch (requestError) {
      setError(getApiError(requestError));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg sm:p-8">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-teal-600">New account</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">Register</h1>
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
            autoComplete="new-password"
            required
          />
        </div>

        {message ? <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p> : null}
        {error ? <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}

        <button
          type="submit"
          disabled={isLoading}
          className="min-h-12 w-full rounded-xl bg-teal-600 font-semibold text-white shadow-md transition hover:scale-105 hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:hover:scale-100"
        >
          {isLoading ? "Creating..." : "Register"}
        </button>
      </form>

      <button
        type="button"
        onClick={onShowLogin}
        className="mt-5 w-full rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
      >
        Back to login
      </button>
    </div>
  );
}

export default Register;
