"use client";

import { startTransition, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../components/AuthProvider";
import {
  AUTH_PAGE_PATH,
  DEFAULT_AUTH_REDIRECT_PATH,
  getSafeRedirectPath,
} from "../../lib/auth-routes";
import styles from "./auth.module.css";

const defaultFormState = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

function getModeFromSearchParams(searchParams) {
  return searchParams.get("mode") === "signup" ? "signup" : "login";
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizeAuthError(message) {
  const normalizedMessage = typeof message === "string" ? message.trim() : "";

  if (!normalizedMessage) {
    return "Authentication failed. Please try again.";
  }

  if (/invalid login credentials/i.test(normalizedMessage)) {
    return "Email or password is incorrect.";
  }

  if (/user already registered|already registered/i.test(normalizedMessage)) {
    return "An account with this email already exists. Try logging in instead.";
  }

  if (/password should be at least/i.test(normalizedMessage)) {
    return "Password must be at least 8 characters long.";
  }

  return normalizedMessage;
}

function validateForm(mode, formData) {
  const fullName = formData.fullName.trim();
  const email = formData.email.trim();
  const password = formData.password;
  const confirmPassword = formData.confirmPassword;

  if (mode === "signup" && fullName.length < 2) {
    return "Enter your full name to create the account.";
  }

  if (!email) {
    return "Enter your email address.";
  }

  if (!isValidEmail(email)) {
    return "Enter a valid email address.";
  }

  if (password.length < 8) {
    return "Password must be at least 8 characters long.";
  }

  if (mode === "signup" && password !== confirmPassword) {
    return "Password confirmation does not match.";
  }

  return "";
}

function buildAuthPageHref(searchParams, mode) {
  const nextSearchParams = new URLSearchParams(searchParams.toString());
  nextSearchParams.set("mode", mode);

  const href = `${AUTH_PAGE_PATH}?${nextSearchParams.toString()}`;
  return href.endsWith("?") ? AUTH_PAGE_PATH : href;
}

export default function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, isLoading, error: authError, login, signup } = useAuth();
  const [mode, setMode] = useState(() => getModeFromSearchParams(searchParams));
  const [formData, setFormData] = useState(defaultFormState);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const searchParamsKey = searchParams.toString();
  const redirectTo = getSafeRedirectPath(
    searchParams.get("redirectTo"),
    DEFAULT_AUTH_REDIRECT_PATH,
  );

  useEffect(() => {
    setMode(getModeFromSearchParams(searchParams));
  }, [searchParamsKey, searchParams]);

  useEffect(() => {
    if (!isLoading && session) {
      startTransition(() => {
        router.replace(redirectTo);
      });
    }
  }, [isLoading, redirectTo, router, session]);

  function handleFieldChange(event) {
    const { name, value } = event.target;
    setFormData((currentValue) => ({
      ...currentValue,
      [name]: value,
    }));
  }

  function handleModeChange(nextMode) {
    setMode(nextMode);
    setErrorMessage("");
    setSuccessMessage("");
    setFormData((currentValue) => ({
      ...currentValue,
      password: "",
      confirmPassword: "",
    }));
    router.replace(buildAuthPageHref(searchParams, nextMode), { scroll: false });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationMessage = validateForm(mode, formData);

    if (validationMessage) {
      setErrorMessage(validationMessage);
      setSuccessMessage("");
      return;
    }

    const email = formData.email.trim();
    const password = formData.password;

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (mode === "login") {
        const result = await login({
          email,
          password,
        });

        if (!result.ok) {
          throw new Error(result.error || "Authentication failed.");
        }

        startTransition(() => {
          router.replace(redirectTo);
          router.refresh();
        });
        return;
      }

      const result = await signup({
        fullName: formData.fullName.trim(),
        email,
        password,
      });

      if (!result.ok) {
        throw new Error(result.error || "Authentication failed.");
      }

      if (result.data?.authenticated) {
        startTransition(() => {
          router.replace(redirectTo);
          router.refresh();
        });
        return;
      }

      setMode("login");
      setFormData((currentValue) => ({
        ...currentValue,
        password: "",
        confirmPassword: "",
      }));
      setSuccessMessage(
        "Account created. Confirm your email if Supabase requires verification, then log in.",
      );
      router.replace(buildAuthPageHref(searchParams, "login"), { scroll: false });
    } catch (error) {
      setErrorMessage(
        normalizeAuthError(error instanceof Error ? error.message : "Authentication failed."),
      );
      setSuccessMessage("");
    } finally {
      setIsSubmitting(false);
    }
  }

  const helperMessage = authError;

  return (
    <div className={styles.formCard}>
      <div className={styles.formHeader}>
        <p className="eyebrow">{mode === "signup" ? "Sign Up" : "Login"}</p>
        <h2 className={styles.formTitle}>
          {mode === "signup" ? "Create your account" : "Welcome back"}
        </h2>
      </div>

      <div className={styles.modeToggle} aria-label="Authentication mode">
        <button
          type="button"
          className={`${styles.modeButton} ${mode === "login" ? styles.modeButtonActive : ""}`}
          onClick={() => handleModeChange("login")}
        >
          Login
        </button>
        <button
          type="button"
          className={`${styles.modeButton} ${mode === "signup" ? styles.modeButtonActive : ""}`}
          onClick={() => handleModeChange("signup")}
        >
          Sign Up
        </button>
      </div>

      {helperMessage ? (
        <div className="message-banner message-banner-warning" role="status">
          {helperMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="message-banner message-banner-error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      {successMessage ? (
        <div className="message-banner message-banner-success" role="status">
          {successMessage}
        </div>
      ) : null}

      <form className={styles.form} onSubmit={handleSubmit}>
        {mode === "signup" ? (
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Full Name</span>
            <input
              type="text"
              name="fullName"
              className={styles.input}
              value={formData.fullName}
              onChange={handleFieldChange}
              autoComplete="name"
              disabled={isSubmitting}
              placeholder="Your name"
            />
          </label>
        ) : null}

        <label className={styles.field}>
          <span className={styles.fieldLabel}>Email</span>
          <input
            type="email"
            name="email"
            className={styles.input}
            value={formData.email}
            onChange={handleFieldChange}
            autoComplete="email"
            disabled={isSubmitting}
            placeholder="email@example.com"
          />
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>Password</span>
          <input
            type="password"
            name="password"
            className={styles.input}
            value={formData.password}
            onChange={handleFieldChange}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            disabled={isSubmitting}
            placeholder="Min 8 characters"
          />
        </label>

        {mode === "signup" ? (
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Confirm Password</span>
            <input
              type="password"
              name="confirmPassword"
              className={styles.input}
              value={formData.confirmPassword}
              onChange={handleFieldChange}
              autoComplete="new-password"
              disabled={isSubmitting}
              placeholder="Repeat password"
            />
          </label>
        ) : null}

        <button
          type="submit"
          className="button-primary"
          disabled={isSubmitting || isLoading}
        >
          {isSubmitting
            ? mode === "signup"
              ? "Creating account..."
              : "Logging in..."
            : mode === "signup"
              ? "Create account"
              : "Log in"}
        </button>
      </form>

      <p className={styles.footerCopy}>
        {mode === "signup" ? "Already have an account?" : "New here?"}{" "}
        <button
          type="button"
          className={styles.inlineButton}
          onClick={() => handleModeChange(mode === "signup" ? "login" : "signup")}
        >
          {mode === "signup" ? "Login" : "Sign up"}
        </button>
      </p>
    </div>
  );
}
