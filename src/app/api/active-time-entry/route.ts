import { z } from "zod";
import clientPromise from "@/app/lib/mongo";

const activeTimeEntrySchema = z.object({
  activityName: z.string().trim().min(1, "Activity name is required."),
  startTime: z.number().int().nonnegative(),
});

const ACTIVE_ID = "singleton";

type ActiveTimeEntryDoc = {
  _id: string;
  activityName: string;
  startTime: number;
  updatedAt: number;
};

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection<ActiveTimeEntryDoc>("activeTimeEntries");

    const doc = await collection.findOne({ _id: ACTIVE_ID });

    if (!doc) {
      return Response.json({ active: null });
    }

    return Response.json({
      active: {
        activityName:
          typeof doc.activityName === "string" ? doc.activityName : "",
        startTime: Number(doc.startTime),
      },
    });
  } catch {
    return Response.json(
      { error: "Failed to fetch active time entry." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = activeTimeEntrySchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid active entry." },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection<ActiveTimeEntryDoc>("activeTimeEntries");

    await collection.updateOne(
      { _id: ACTIVE_ID },
      {
        $set: {
          activityName: parsed.data.activityName,
          startTime: parsed.data.startTime,
          updatedAt: Date.now(),
        },
      },
      { upsert: true }
    );

    return Response.json({ success: true });
  } catch {
    return Response.json(
      { error: "Failed to save active time entry." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection<ActiveTimeEntryDoc>("activeTimeEntries");

    await collection.deleteOne({ _id: ACTIVE_ID });

    return Response.json({ success: true });
  } catch {
    return Response.json(
      { error: "Failed to clear active time entry." },
      { status: 500 }
    );
  }
}
