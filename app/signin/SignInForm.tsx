"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

export default function SignInForm() {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") ?? "/";

    const [mode, setMode] = useState<"signin" | "signup">("signin");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (mode === "signup") {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, name }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error ?? "Registration failed");
                setLoading(false);
                return;
            }
        }

        const result = await signIn("credentials", { email, password, callbackUrl, redirect: false });
        if (result?.error) {
            setError("Invalid email or password");
            setLoading(false);
            return;
        }
        window.location.href = callbackUrl;
    }

    return (
        <div className="flex min-h-[calc(100vh-3rem)] items-center justify-center bg-zinc-50 dark:bg-black">
            <div className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
                <h1 className="text-xl font-semibold tracking-tight text-black dark:text-zinc-50">
                    {mode === "signin" ? "Sign in" : "Create account"}
                </h1>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    {mode === "signin" ? "Choose how you'd like to sign in." : "Fill in the details below to get started."}
                </p>

                {mode === "signin" && (
                    <div className="mt-6 flex flex-col gap-3">
                        <button
                            onClick={() => signIn("google", { callbackUrl })}
                            className="flex h-10 w-full items-center justify-center gap-3 rounded border border-zinc-200 text-sm text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
                        >
                            <Image src="/icons/google.svg" alt="Google" width={16} height={16} />
                            Continue with Google
                        </button>
                        <button
                            onClick={() => signIn("github", { callbackUrl })}
                            className="flex h-10 w-full items-center justify-center gap-3 rounded border border-zinc-200 text-sm text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
                        >
                            <Image src="/icons/github.svg" alt="GitHub" width={16} height={16} />
                            Continue with GitHub
                        </button>

                        <div className="flex items-center gap-3">
                            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
                            <span className="text-xs text-zinc-400">or</span>
                            <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-3">
                    {mode === "signup" && (
                        <input
                            type="text"
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="h-10 w-full rounded border border-zinc-200 px-3 text-sm text-zinc-800 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:focus:border-zinc-500"
                        />
                    )}
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-10 w-full rounded border border-zinc-200 px-3 text-sm text-zinc-800 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:focus:border-zinc-500"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                        className="h-10 w-full rounded border border-zinc-200 px-3 text-sm text-zinc-800 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:focus:border-zinc-500"
                    />
                    {error && <p className="text-xs text-red-500">{error}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex h-10 w-full items-center justify-center rounded bg-black text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-300"
                    >
                        {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
                    </button>
                </form>

                <p className="mt-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
                    {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
                    <button
                        onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }}
                        className="font-medium text-black dark:text-zinc-50 hover:underline"
                    >
                        {mode === "signin" ? "Sign up" : "Sign in"}
                    </button>
                </p>
            </div>
        </div>
    );
}
