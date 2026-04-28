import { NextResponse } from "next/server";
import { mockUsers, otpCache } from "@/lib/mock-data";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "fallback_key");

export async function POST(req: Request) {
  try {
    const { email, role } = await req.json();

    if (!email || !role) {
      return NextResponse.json({ error: "Email and role are required." }, { status: 400 });
    }

    // Verify user exists and matches role
    const user = mockUsers.find(u => u.email === email && u.role === role);
    if (!user) {
      return NextResponse.json({ error: "User not found or role mismatch." }, { status: 404 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Cache the OTP with a 5-minute expiration
    otpCache[email] = {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    };

    // RESEND EMAIL API INTEGRATION
    if (process.env.RESEND_API_KEY) {
      try {
        const { data, error } = await resend.emails.send({
          from: "EduLibrary Security <onboarding@resend.dev>", // Sandbox compatible
          to: [email],
          subject: "Your Authentication OTP - EduLibrary",
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; text-align: center;">
              <h2 style="color: #4F46E5;">EduLibrary Secure Login</h2>
              <p>Your one-time password (OTP) to securely access the library is:</p>
              <h1 style="font-size: 32px; letter-spacing: 4px; padding: 10px; background-color: #f3f4f6; display: inline-block; border-radius: 8px; color: #3b82f6;">${otp}</h1>
              <p>This code will expire in exactly 5 minutes.</p>
              <p style="color: #888; font-size: 12px; margin-top: 20px;">If you didn't request this, you can safely ignore this email.</p>
            </div>
          `,
        });

        if (error) {
          console.error("Resend API Error:", error);
          return NextResponse.json({ error: "Failed to send email via API" }, { status: 500 });
        }
        
        console.log(`✉️ LIVE RESEND API FIRED EVENT FOR: ${email}. ID: ${data?.id}`);
      } catch (err) {
        console.error("Resend Execution Error:", err);
        return NextResponse.json({ error: "Email provider error." }, { status: 500 });
      }
    } else {
      // Fallback for local testing if no RESEND_API_KEY configured
      console.log(`\n\n======================================================`);
      console.log(`[WARNING] RESEND_API_KEY not found in .env`);
      console.log(`✉️ MOCK EMAIL SENT TO: ${email}`);
      console.log(`🔒 YOUR 6-DIGIT OTP IS: ${otp}`);
      console.log(`⏳ Expires in 5 minutes.`);
      console.log(`======================================================\n\n`);
      return NextResponse.json({ success: true, message: "OTP sent successfully.", mockOtp: otp });
    }

    return NextResponse.json({ success: true, message: "OTP sent successfully." });

  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
