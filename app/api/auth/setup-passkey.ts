import { NextResponse } from "next/server";
import { db } from "@/utils/firebase";
import { doc, setDoc } from "firebase/firestore";
import { hash } from "bcrypt";

export async function POST(request: Request) {
  const { phoneNumber, passkey } = await request.json();

  if (!phoneNumber || !passkey || !/^\d{4}$/.test(passkey)) {
    return NextResponse.json(
      { message: "Invalid phone number or passkey" },
      { status: 400 }
    );
  }

  try {
    // Hash the passkey
    const hashedPasskey = await hash(passkey, 10);

    // Store hashed passkey in the database for the given phone number
    await setDoc(
      doc(db, "users", phoneNumber),
      {
        phoneNumber,
        passkey: hashedPasskey,
        createdAt: new Date().toISOString(),
      },
      { merge: true }
    );

    // Generate and store an auth token
    const authToken = generateAuthToken(phoneNumber);

    const response = NextResponse.json(
      { message: "Passkey set successfully" },
      { status: 200 }
    );
    response.cookies.set("authToken", authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error setting up passkey:", error);
    return NextResponse.json(
      { message: "Failed to set up passkey" },
      { status: 500 }
    );
  }
}

function generateAuthToken(phoneNumber: string): string {
  // TODO: Implement secure token generation
  // For now, we'll use a simple string concatenation
  return `${phoneNumber}_${Date.now()}_${Math.random()
    .toString(36)
    .substring(7)}`;
}
