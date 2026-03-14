import { auth } from "@/auth";
import { getUserPlans, createPlan, validateTransformerRatio } from "@/lib/plans";

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const plans = await getUserPlans(session.user.id);
    return Response.json(plans.map((p) => ({ ...p, _id: p._id!.toString() })));
}

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { name, placed } = await req.json();
    if (!validateTransformerRatio(placed))
        return Response.json({ error: "Insufficient transformers for battery count" }, { status: 422 });
    const id = await createPlan(session.user.id, name, placed);
    return Response.json({ id }, { status: 201 });
}
