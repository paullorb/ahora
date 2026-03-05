import clientPromise from "@/app/lib/mongo";
import { createTimeEntry } from "./domain";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("timeEntries");

    const docs = await collection
      .find({}, { sort: { createdAt: -1 }, limit: 2000 })
      .toArray();

    const grouped = docs.reduce<Record<string, { activityName: string; checkInCount: number }>>(
      (acc, doc) => {
        const rawName =
          typeof doc.activityName === "string" ? doc.activityName.trim() : "";

        if (!rawName) {
          return acc;
        }

        const key = rawName.toLowerCase();
        if (!acc[key]) {
          acc[key] = { activityName: rawName, checkInCount: 0 };
        }

        acc[key].checkInCount += 1;
        return acc;
      },
      {}
    );

    const summaries = Object.values(grouped).sort(
      (a, b) => b.checkInCount - a.checkInCount
    );

    return Response.json({ summaries });
  } catch {
    return Response.json(
      { error: "Failed to fetch time entries." },
      { status: 500 }
    );
  }
}

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
    await collection.createIndex({ createdAt: -1 });

    const inserted = await collection.insertOne(result);

    return Response.json({ success: true, id: inserted.insertedId });
  } catch (error: unknown) {
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Failed to save time entry.";
    return Response.json(
      { error: message },
      { status: 500 }
    );
  }
}
