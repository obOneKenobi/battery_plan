import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
    const global = globalThis as typeof globalThis & {
        _mongoClientPromise?: Promise<MongoClient>;
    };
    if (!global._mongoClientPromise) {
        global._mongoClientPromise = new MongoClient(uri).connect();
    }
    clientPromise = global._mongoClientPromise;
} else {
    clientPromise = new MongoClient(uri).connect();
}

export default clientPromise;
