"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

export default function SignInForm() {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") ?? "/";

    return (
        <div className="flex min-h-[calc(100vh-3rem)] items-center justify-center bg-zinc-50 dark:bg-black">
            <div className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
                <h1 className="text-xl font-semibold tracking-tight text-black dark:text-zinc-50">
                    Sign in
                </h1>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    Choose how you'd like to sign in.
                </p>

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
                </div>
            </div>
        </div>
    );
}
