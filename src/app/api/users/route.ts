import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const authHeader = req.headers.get("Authorization")
  const token = authHeader?.split(" ")[1]

  if (token !== process.env.MONGO_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return NextResponse.json({ success: true })
}
