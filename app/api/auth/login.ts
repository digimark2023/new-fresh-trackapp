import { NextResponse } from "next/server";
import { db } from "@/utils/firebase";
import { doc, getDoc } from "firebase/firestore";
import { compare } from "bcrypt";
import { generateToken } from "@/utils/jwt"; // Import the generateToken function

export async function POST(request: Request) {
  const { phoneNumber, password } = await request.json();

  try {
    // Fetch user from Firebase
    const userDoc = await getDoc(doc(db, "users", phoneNumber));

    if (!userDoc.exists()) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const user = userDoc.data();
    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateToken({ userId: userDoc.id, phoneNumber });

    // Set HTTP-only cookie
    const response = NextResponse.json(
      { message: "Login successful" },
      { status: 200 }
    );
    response.cookies.set("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    console.log("Generated Token:", token); // Log the generated token

    return response;
  } catch (error) {
    console.error("Error during login:", error);
    return NextResponse.json({ message: "Login failed" }, { status: 500 });
  }
}
