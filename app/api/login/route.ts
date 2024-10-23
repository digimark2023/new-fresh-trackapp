import { NextResponse } from "next/server";
import { adminAuth } from "../../../utils/firebase-admin";

export async function POST(request: Request) {
  const { phoneNumber, password } = await request.json();

  try {
    // Here, implement your own logic to verify the phone number and password
    // This is just a placeholder example
    if (phoneNumber === "1234567890" && password === "password123") {
      const customToken = await adminAuth.createCustomToken(phoneNumber);
      return NextResponse.json({ customToken });
    } else {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Error creating custom token:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
