import { NextResponse } from "next/server";
import { userDb } from "@/lib/database";

// GET /api/users - Get all users from database
export async function GET(request) {
  try {
    const users = await userDb.getAll();
    console.log("[API /api/users] Returning users:", users.length);
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Error fetching users" },
      { status: 500 }
    );
  }
}
