import { NextResponse } from "next/server";
import { db } from "@/utils/firebase";
import { doc, setDoc, getDoc, deleteDoc } from "firebase/firestore";
import { hash } from "bcrypt";

// Declare the type for our global storage
declare global {
  let otpStorage: Record<string, string> | undefined;
}

export async function POST(request: Request) {
  const { phoneNumber, otp, password } = await request.json();

  console.log("Verifying OTP for phone number:", phoneNumber);

  try {
    // Fetch the stored OTP from Firestore
    const otpDoc = await getDoc(doc(db, "otps", phoneNumber));
    console.log("OTP document exists:", otpDoc.exists());

    if (!otpDoc.exists()) {
      console.error("No OTP found for phone number:", phoneNumber);
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
    }

    const storedOTP = otpDoc.data().otp;
    console.log("Stored OTP:", storedOTP, "Provided OTP:", otp);

    if (storedOTP === otp) {
      console.log("OTP matched. Proceeding with user registration.");
      // OTP is valid, proceed with user registration
      const hashedPassword = await hash(password, 10);

      // Save user to Firebase
      await setDoc(doc(db, "users", phoneNumber), {
        phoneNumber,
        password: hashedPassword,
        createdAt: new Date().toISOString(),
      });

      // Delete the OTP document
      await deleteDoc(doc(db, "otps", phoneNumber));

      console.log("User registered successfully");
      return NextResponse.json(
        { message: "Registration successful" },
        { status: 200 }
      );
    } else {
      console.error("OTP mismatch for phone number:", phoneNumber);
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { message: "Failed to verify OTP", error: (error as Error).message },
      { status: 500 }
    );
  }
}
