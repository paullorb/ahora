import { ObjectId } from "mongodb";
import { z } from "zod";
import clientPromise from "@/app/lib/mongo";

const scheduleEntrySchema = z
  .object({
    title: z.string().trim().min(1, "Title is required."),
    category: z.string().trim().min(1).default("general"),
    startTime: z.number().int().nonnegative(),
    endTime: z.number().int().nonnegative(),
    decomposition: z.array(z.string().trim().min(1)).default([]),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "End time must be after start time.",
    path: ["endTime"],
  });

function toId(id: string) {
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const objectId = toId(id);

  if (!objectId) {
    return Response.json({ error: "Invalid entry id." }, { status: 400 });
  }

  try {
    const body = await request.json();
    const parsed = scheduleEntrySchema.safeParse(body);

    if (!parsed.success) {
      return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid entry." }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("scheduleEntries");

    const update = {
      title: parsed.data.title,
      category: parsed.data.category,
      startTime: parsed.data.startTime,
      endTime: parsed.data.endTime,
      decomposition: parsed.data.decomposition,
    };

    const result = await collection.findOneAndUpdate(
      { _id: objectId },
      { $set: update },
      { returnDocument: "after" }
    );

    if (!result) {
      return Response.json({ error: "Entry not found." }, { status: 404 });
    }

    return Response.json({
      entry: {
        id: String(result._id),
        title: String(result.title),
        category: typeof result.category === "string" ? result.category : "general",
        startTime: Number(result.startTime),
        endTime: Number(result.endTime),
        decomposition: Array.isArray(result.decomposition)
          ? result.decomposition.map((item) => String(item)).filter(Boolean)
          : [],
        createdAt: Number(result.createdAt),
      },
    });
  } catch {
    return Response.json({ error: "Failed to update entry." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const objectId = toId(id);

  if (!objectId) {
    return Response.json({ error: "Invalid entry id." }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("scheduleEntries");

    const result = await collection.deleteOne({ _id: objectId });

    if (result.deletedCount === 0) {
      return Response.json({ error: "Entry not found." }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Failed to delete entry." }, { status: 500 });
  }
}
