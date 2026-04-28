import { NextResponse } from "next/server";
import { mockUsers, otpCache } from "@/lib/mock-data";
import nodemailer from "nodemailer";

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

    // NODEMAILER INTEGRATION
    try {
      let transporter;

      // Use provided SMTP credentials, otherwise fallback to Ethereal Test Account
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || "smtp.gmail.com",
          port: parseInt(process.env.SMTP_PORT || "587"),
          secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
      } else {
        console.log("No SMTP credentials found. Creating Ethereal test account...");
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false, // true for 465, false for other ports
          auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass, // generated ethereal password
          },
        });
      }

      const info = await transporter.sendMail({
        from: '"EduLibrary Security" <no-reply@edulibrary.test>',
        to: email,
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

      console.log(`✉️ LIVE EMAIL FIRED EVENT FOR: ${email}. ID: ${info.messageId}`);
      
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
          console.log(`👀 Preview URL: ${previewUrl}`);
          return NextResponse.json({ success: true, message: "OTP sent successfully.", previewUrl });
      }

      return NextResponse.json({ success: true, message: "OTP sent successfully." });

    } catch (err) {
      console.error("Nodemailer Execution Error:", err);
      // Fallback for local testing if nodemailer fails completely
      return NextResponse.json({ success: true, message: "OTP sent successfully (fallback).", mockOtp: otp });
    }

  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
