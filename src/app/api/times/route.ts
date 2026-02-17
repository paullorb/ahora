import { MongoClient } from 'mongodb';
import clientPromise from "@/app/lib/mongo";

export async function POST(request: Request) {
  try {
    const { startTime, duration, activityName } = await request.json();
    
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('times');
    
    const result = await collection.insertOne({
      activityName,
      startTime: new Date(startTime),
      duration, // in milliseconds
      createdAt: new Date()
    });
    
    return Response.json({ success: true, id: result.insertedId });
  } catch (error) {
    return Response.json({ error: 'Failed to save time' }, { status: 500 });
  }
}