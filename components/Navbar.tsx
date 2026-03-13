"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
    { href: "/", label: "Home" },
    { href: "/build", label: "Build" },
];

export default function Navbar() {
    const pathname = usePathname();
    return (
        <nav className="flex h-12 items-center gap-1 border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-950">
            <Link
                href="/"
                className="mr-3 text-sm font-semibold tracking-tight text-black dark:text-zinc-50"
            >
                Battery Plan
            </Link>
            {LINKS.map(({ href, label }) => (
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
        </nav>
    );
}
