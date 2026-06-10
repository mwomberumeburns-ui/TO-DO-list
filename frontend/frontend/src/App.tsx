import { useState } from "react";
import { getToken } from "./api/client";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import type { AuthMode } from "./types";

function App() {
  const [token, setTokenState] = useState<string | null>(() => getToken());
  const [authMode, setAuthMode] = useState<AuthMode>("login");

  function handleAuthenticated() {
    setTokenState(getToken());
  }

  function handleLogout() {
    setTokenState(null);
    setAuthMode("login");
  }

  if (token) {
    return <Dashboard onLogout={handleLogout} />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
      {authMode === "login" ? (
        <Login
          onAuthenticated={handleAuthenticated}
          onShowRegister={() => setAuthMode("register")}
        />
      ) : (
        <Register
          onRegistered={() => setAuthMode("login")}
          onShowLogin={() => setAuthMode("login")}
        />
      )}
    </main>
  );
}

export default App;
