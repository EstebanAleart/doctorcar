import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { NextResponse } from "next/server";
import pool from "@/lib/database";

// GET /api/user - Get current user session with role from database
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const email = session.user.email;
    
    // Check if user exists in database
    const result = await pool.query(
      "SELECT id, name, email, role, created_at FROM users WHERE email = $1",
      [email]
    );

    let user;
    
    if (result.rows.length === 0) {
      // First login - create user with 'client' role
      const insertResult = await pool.query(
        "INSERT INTO users (name, email, role) VALUES ($1, $2, $3) RETURNING id, name, email, role, created_at",
        [session.user.name, email, "client"]
      );
      user = insertResult.rows[0];
    } else {
      user = result.rows[0];
    }

    // Return user data with role from database
    return NextResponse.json({ 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: session.user.image,
        created_at: user.created_at,
      },
      isAuthenticated: true 
    }, { status: 200 });
  } catch (error) {
    console.error("Error getting user session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
