import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import type { DeviceId } from "@/lib/devices";
import type { PlacedDevice } from "@/lib/siteLayoutUtils";

const BATTERY_IDS: DeviceId[] = ["megapackXL", "megapack2", "megapack", "powerpack"];

export function validateTransformerRatio(quantities: Record<DeviceId, number>) {
    const totalBatteries = BATTERY_IDS.reduce((sum, id) => sum + (quantities[id] ?? 0), 0);
    const required = Math.ceil(totalBatteries / 2);
    return totalBatteries === 0 || (quantities.transformer ?? 0) >= required;
}

export interface Plan {
    _id?: ObjectId;
    userId: string;
    name: string;
    quantities: Record<DeviceId, number>;
    placed: PlacedDevice[];
    createdAt: Date;
    updatedAt: Date;
}

async function getCollection() {
    const client = await clientPromise;
    return client.db().collection<Plan>("plans");
}

export async function getUserPlans(userId: string) {
    const col = await getCollection();
    return col.find({ userId }).sort({ updatedAt: -1 }).toArray();
}

export async function createPlan(
    userId: string,
    name: string,
    quantities: Record<DeviceId, number>,
    placed: PlacedDevice[]
) {
    const col = await getCollection();
    const now = new Date();
    const result = await col.insertOne({ userId, name, quantities, placed, createdAt: now, updatedAt: now });
    return result.insertedId.toString();
}

export async function updatePlan(
    id: string,
    userId: string,
    name: string,
    quantities: Record<DeviceId, number>,
    placed: PlacedDevice[]
) {
    const col = await getCollection();
    await col.updateOne(
        { _id: new ObjectId(id), userId },
        { $set: { name, quantities, placed, updatedAt: new Date() } }
    );
}

export async function getPlan(id: string, userId: string) {
    const col = await getCollection();
    return col.findOne({ _id: new ObjectId(id), userId });
}

export async function deletePlan(id: string, userId: string) {
    const col = await getCollection();
    await col.deleteOne({ _id: new ObjectId(id), userId });
}
