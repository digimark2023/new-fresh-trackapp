import { NextResponse } from "next/server";
import twilio from "twilio";
import { db } from "@/utils/firebase";
import { doc, setDoc } from "firebase/firestore";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken || !twilioPhoneNumber) {
  throw new Error("Missing Twilio credentials or phone number");
}

const client = twilio(accountSid, authToken);

export async function POST(request: Request) {
  const { phoneNumber } = await request.json();

  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in Firestore
    await setDoc(doc(db, "otps", phoneNumber), {
      otp,
      createdAt: new Date().toISOString(),
    });

    console.log(`OTP stored for ${phoneNumber}: ${otp}`);

    // Send OTP via Twilio
    await client.messages.create({
      body: `Your OTP is: ${otp}`,
      from: twilioPhoneNumber,
      to: `+91${phoneNumber}`, // Use +91 for Indian numbers
    });

    return NextResponse.json(
      { message: "OTP sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending OTP:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { message: "Failed to send OTP", error: error.message },
        { status: 500 }
      );
    } else {
      return NextResponse.json(
        { message: "Failed to send OTP", error: "Unknown error" },
        { status: 500 }
      );
    }
  }
}
