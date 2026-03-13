import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex max-w-lg flex-col gap-8 px-8">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
            Battery Plan
          </h1>
          <p className="text-base leading-7 text-zinc-600 dark:text-zinc-400">
            Plan and visualize utility-scale battery storage deployments. Select
            devices like Megapacks and Powerpacks, set quantities, and arrange
            them on a scaled site layout to estimate footprint, energy capacity,
            and budget.
          </p>
        </div>
        <Link
          href="/build"
          className="flex h-11 w-fit items-center justify-center rounded-full bg-black px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-300"
        >
          Start building →
        </Link>
      </main>
    </div>
  );
}
