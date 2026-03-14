"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { DEVICES } from "@/lib/devices";
import type { Plan } from "@/lib/plans";

type SerializedPlan = Omit<Plan, "_id" | "createdAt" | "updatedAt"> & {
    _id: string;
    createdAt: string;
    updatedAt: string;
};

interface PlansTableProps {
    plans: SerializedPlan[];
}

export default function PlansTable({ plans }: PlansTableProps) {
    const router = useRouter();

    async function handleDelete(id: string) {
        await fetch(`/api/plans/${id}`, { method: "DELETE" });
        router.refresh();
    }

    if (plans.length === 0) {
        return (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No plans saved yet.{" "}
                <Link href="/build" className="font-medium text-black dark:text-zinc-50">
                    Start building
                </Link>
            </p>
        );
    }

    return (
        <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                        <th className="px-4 py-3 text-left font-medium text-zinc-500 dark:text-zinc-400">Name</th>
                        <th className="px-4 py-3 text-right font-medium text-zinc-500 dark:text-zinc-400">Energy</th>
                        <th className="px-4 py-3 text-right font-medium text-zinc-500 dark:text-zinc-400">Budget</th>
                        <th className="px-4 py-3 text-right font-medium text-zinc-500 dark:text-zinc-400">Last updated</th>
                        <th className="px-4 py-3" />
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 bg-white dark:divide-zinc-800 dark:bg-zinc-950">
                    {plans.map((plan) => {
                        const totalMWh = DEVICES.reduce(
                            (sum, d) => sum + d.energyMWh * (plan.quantities[d.id] ?? 0),
                            0
                        );
                        const totalBudget = DEVICES.reduce(
                            (sum, d) => sum + d.price * (plan.quantities[d.id] ?? 0),
                            0
                        );
                        const updatedAt = new Date(plan.updatedAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                        });

                        return (
                            <tr key={plan._id}>
                                <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                                    {plan.name}
                                </td>
                                <td className="px-4 py-3 text-right tabular-nums text-zinc-600 dark:text-zinc-400">
                                    {totalMWh % 1 !== 0 ? totalMWh.toFixed(1) : totalMWh} MWh
                                </td>
                                <td className="px-4 py-3 text-right tabular-nums text-zinc-600 dark:text-zinc-400">
                                    ${totalBudget.toLocaleString()}
                                </td>
                                <td className="px-4 py-3 text-right text-zinc-400 dark:text-zinc-500">
                                    {updatedAt}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link
                                            href={`/build?plan=${plan._id}`}
                                            className="rounded px-2.5 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                                        >
                                            Open
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(plan._id)}
                                            className="rounded px-2.5 py-1 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
