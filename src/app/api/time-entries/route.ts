import clientPromise from "@/app/lib/mongo";
import { createTimeEntry } from "./domain";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = createTimeEntry(body);

    if ("error" in result) {
      return Response.json({ error: result.error }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("timeEntries");
    collection.createIndex({ createdAt: -1 })

    const inserted = await collection.insertOne(result);

    return Response.json({ success: true, id: inserted.insertedId });
  } catch (error) {
    return Response.json(
      { error: "Failed to save time entry." },
      { status: 500 }
    );
  }
}