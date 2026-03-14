import { createUser } from "@/lib/users";

export async function POST(req: Request) {
    const { email, password, name } = await req.json();
    if (!email || !password || !name)
        return Response.json({ error: "Email, password, and name are required" }, { status: 400 });
    if (password.length < 8)
        return Response.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    try {
        await createUser(email, password, name);
        return Response.json({ ok: true }, { status: 201 });
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Registration failed";
        return Response.json({ error: message }, { status: 409 });
    }
}
