import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getUserPlans } from "@/lib/plans";
import PlansTable from "./PlansTable";

export default async function PlansPage() {
    const session = await auth();
    if (!session?.user?.id) redirect("/signin");

    const plans = await getUserPlans(session.user.id);
    const serialized = plans.map((p) => ({
        ...p,
        _id: p._id!.toString(),
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
    }));

    return (
        <div className="mx-auto max-w-5xl px-8 py-10 font-sans">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-xl font-semibold tracking-tight text-black dark:text-zinc-50">
                    My Plans
                </h1>
            </div>
            <PlansTable plans={serialized} />
        </div>
    );
}
