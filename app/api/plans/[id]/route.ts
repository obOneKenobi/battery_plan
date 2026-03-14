import { auth } from "@/auth";
import { getPlan, updatePlan, deletePlan, validateTransformerRatio } from "@/lib/plans";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const plan = await getPlan(id, session.user.id);
    if (!plan) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json({ ...plan, _id: plan._id!.toString() });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { name, placed, height } = await req.json();
    if (!validateTransformerRatio(placed))
        return Response.json({ error: "Insufficient transformers for battery count" }, { status: 422 });
    await updatePlan(id, session.user.id, name, placed, height ?? 40);
    return Response.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await deletePlan(id, session.user.id);
    return Response.json({ ok: true });
}
