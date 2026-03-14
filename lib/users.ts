import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";

interface CredentialsUser {
    _id?: string;
    email: string;
    passwordHash: string;
    name: string;
}

async function getCollection() {
    const client = await clientPromise;
    return client.db().collection<CredentialsUser>("credentials_users");
}

export async function createUser(email: string, password: string, name: string) {
    const col = await getCollection();
    const existing = await col.findOne({ email });
    if (existing) throw new Error("Email already in use");
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await col.insertOne({ email, passwordHash, name });
    return { id: result.insertedId.toString(), email, name };
}

export async function verifyUser(email: string, password: string) {
    const col = await getCollection();
    const user = await col.findOne({ email });
    if (!user) return null;
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return null;
    return { id: user._id!.toString(), email: user.email, name: user.name };
}
