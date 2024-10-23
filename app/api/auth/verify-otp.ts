import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { phoneNumber, otp } = req.body;

  if (!phoneNumber || !otp) {
    return res
      .status(400)
      .json({ message: "Phone number and OTP are required" });
  }

  // TODO: Verify OTP from database
  const isValidOTP = true; // Placeholder for actual verification logic

  if (!isValidOTP) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  // TODO: Mark phone number as verified in the database

  res.status(200).json({ message: "OTP verified successfully" });
}
