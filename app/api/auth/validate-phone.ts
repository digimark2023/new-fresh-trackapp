import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { phoneNumber } = req.body;

  if (!phoneNumber || !/^\d{10}$/.test(phoneNumber)) {
    return res.status(400).json({ message: "Invalid phone number" });
  }

  // TODO: Check if phone number already exists in the database

  // If valid and not existing, send OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  // TODO: Store OTP in database with expiration time

  // TODO: Implement actual OTP sending logic (e.g., using a third-party SMS service)
  console.log(`OTP sent to ${phoneNumber}: ${otp}`);

  res.status(200).json({ message: "OTP sent successfully" });
}
