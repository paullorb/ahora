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

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("scheduleEntries");

    const docs = await collection
      .find({}, { sort: { startTime: 1 }, limit: 500 })
      .toArray();

    const entries = docs.map((doc) => ({
      id: String(doc._id),
      title: String(doc.title),
      category: typeof doc.category === "string" && doc.category ? doc.category : "general",
      startTime: Number(doc.startTime),
      endTime: Number(doc.endTime),
      decomposition: Array.isArray(doc.decomposition)
        ? doc.decomposition.map((item) => String(item)).filter(Boolean)
        : [],
      createdAt: Number(doc.createdAt),
    }));

    return Response.json({ entries });
  } catch {
    return Response.json({ error: "Failed to fetch schedule entries." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = scheduleEntrySchema.safeParse(body);

    if (!parsed.success) {
      return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid entry." }, { status: 400 });
    }

    const entry = {
      title: parsed.data.title,
      category: parsed.data.category,
      startTime: parsed.data.startTime,
      endTime: parsed.data.endTime,
      decomposition: parsed.data.decomposition,
      createdAt: Date.now(),
    };

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("scheduleEntries");

    await Promise.all([
      collection.createIndex({ startTime: 1 }),
      collection.createIndex({ createdAt: -1 }),
    ]);

    const inserted = await collection.insertOne(entry);

    return Response.json({
      entry: {
        id: String(inserted.insertedId),
        ...entry,
      },
    });
  } catch {
    return Response.json({ error: "Failed to create schedule entry." }, { status: 500 });
  }
}
