"use client";

import { useActionState } from "react";
import { login } from "@/app/admin/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="card stack">
      <h1>Espace admin</h1>
      <label>
        Mot de passe
        <input name="password" type="password" required autoFocus autoComplete="current-password" />
      </label>
      {state?.error ? <p className="error">{state.error}</p> : null}
      <button className="button primary" disabled={pending}>
        {pending ? "Connexion…" : "Se connecter"}
      </button>
    </form>
  );
}
