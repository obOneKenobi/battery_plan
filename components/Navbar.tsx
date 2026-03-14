"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Logo from "@/components/Logo";

const PUBLIC_LINKS = [
    { href: "/", label: "Home" },
    { href: "/build", label: "Build" },
];

const AUTH_LINKS = [
    { href: "/plans", label: "My Plans" },
];

export default function Navbar() {
    const pathname = usePathname();
    const { data: session } = useSession();

    return (
        <nav className="flex h-12 items-center gap-1 border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-950">
            <Link
                href="/"
                className="mr-3 flex items-center gap-2 text-sm font-semibold tracking-tight text-black dark:text-zinc-50"
            >
                <Logo size={18} />
                Battery Plan
            </Link>
            {[...PUBLIC_LINKS, ...(session ? AUTH_LINKS : [])].map(({ href, label }) => (
                <Link
                    key={href}
                    href={href}
                    className={`rounded px-3 py-1.5 text-sm transition-colors ${
                        pathname === href
                            ? "bg-zinc-100 font-medium text-black dark:bg-zinc-800 dark:text-zinc-50"
                            : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                    }`}
                >
                    {label}
                </Link>
            ))}
            <div className="ml-auto flex items-center gap-3">
                {session ? (
                    <>
                        <span className="text-sm text-zinc-500 dark:text-zinc-400">
                            {session.user?.name}
                        </span>
                        <button
                            onClick={() => signOut({ redirectTo: "/" })}
                            className="rounded px-3 py-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                        >
                            Sign out
                        </button>
                    </>
                ) : (
                    <Link
                        href="/signin"
                        className="rounded px-3 py-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                    >
                        Sign in
                    </Link>
                )}
            </div>
        </nav>
    );
}
