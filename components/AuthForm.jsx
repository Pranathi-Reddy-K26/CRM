"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

async function hashPassword(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export default function AuthForm({ mode }) {
  const isSignup = mode === "signup";
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    const data = new FormData(event.currentTarget);
    const email = data.get("email").trim().toLowerCase();
    const password = data.get("password");

    if (isSignup && (!data.get("name").trim() || !data.get("company").trim())) return setError("Enter your full name and company name.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Enter a valid work email address.");
    if (password.length < 8) return setError("Password must contain at least 8 characters.");

    setLoading(true);
    const passwordHash = await hashPassword(password);
    const savedUsers = JSON.parse(localStorage.getItem("clario-users") || "[]");

    if (isSignup) {
      if (savedUsers.some((user) => user.email === email)) {
        setLoading(false);
        return setError("An account with this email already exists.");
      }
      const user = { name: data.get("name").trim(), company: data.get("company").trim(), email, passwordHash };
      localStorage.setItem("clario-users", JSON.stringify([...savedUsers, user]));
      localStorage.setItem("clario-session", JSON.stringify({ name: user.name, company: user.company, email }));
    } else {
      const user = savedUsers.find((item) => item.email === email && item.passwordHash === passwordHash);
      if (!user) {
        setLoading(false);
        return setError("Email or password is incorrect. Create an account first if you are new.");
      }
      localStorage.setItem("clario-session", JSON.stringify({ name: user.name, company: user.company, email }));
    }
    router.push("/dashboard");
  }

  function handleForgotPassword() {
    setError("");
    setMessage("Password recovery will be connected when the CRM backend is added.");
  }

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <Link className="back-link" href="/"><span>←</span> Back to home page</Link>
        <section className="auth-card">
          <div className="auth-brand"><Image src="/logo.png" alt="Clario" width={104} height={79} priority /></div>
          <p className="auth-kicker">Clario CRM</p>
          <h1>{isSignup ? "Create your workspace" : "Welcome back"}</h1>
          <p className="auth-switch">{isSignup ? "Already have an account?" : "Don't have an account yet?"} <Link href={isSignup ? "/signin" : "/signup"}>{isSignup ? "Sign in" : "Sign up"}</Link></p>

          <form onSubmit={handleSubmit} noValidate>
            {isSignup && <div className="auth-row"><label>Full name<input name="name" type="text" placeholder="e.g. Alex Morgan" autoComplete="name" required /></label><label>Company name<input name="company" type="text" placeholder="e.g. Clario" autoComplete="organization" required /></label></div>}
            <label>Work email<input name="email" type="email" placeholder="you@company.com" autoComplete="email" required /></label>
            <label>
              <span className="label-line"><span>Password</span>{!isSignup && <button type="button" onClick={handleForgotPassword}>Forgot password?</button>}</span>
              <span className="password-field"><input name="password" type={showPassword ? "text" : "password"} placeholder="Minimum 8 characters" autoComplete={isSignup ? "new-password" : "current-password"} required minLength={8} /><button type="button" className="eye" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? "Hide" : "Show"}</button></span>
            </label>
            {error && <p className="form-note error" role="alert">{error}</p>}
            {message && <p className="form-note" role="status">{message}</p>}
            <button className="auth-submit" type="submit" disabled={loading}>{loading ? "Please wait…" : isSignup ? "Create account" : "Sign in"}<span>→</span></button>
          </form>
          <p className="auth-terms">By continuing, you agree to Clario's Terms of Service and Privacy Policy.</p>
        </section>
      </div>
    </main>
  );
}
