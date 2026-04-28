import { NextResponse } from "next/server";
import { mockUsers, otpCache } from "@/lib/mock-data";
import { signToken } from "@/lib/auth-utils";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { email, role, otp } = await req.json();

    if (!email || !role || !otp) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const cachedData = otpCache[email];

    if (!cachedData) {
      return NextResponse.json({ error: "No pending OTP request found for this email." }, { status: 400 });
    }

    if (Date.now() > cachedData.expiresAt) {
      delete otpCache[email];
      return NextResponse.json({ error: "OTP has expired. Please request a new one." }, { status: 400 });
    }

    if (cachedData.otp !== otp) {
      return NextResponse.json({ error: "Invalid OTP code." }, { status: 401 });
    }

    // OTP belongs to user and is valid!
    // Double check DB
    const user = mockUsers.find(u => u.email === email && u.role === role);
    if (!user) {
      return NextResponse.json({ error: "User mismatch." }, { status: 400 });
    }

    // Clear the OTP from cache
    delete otpCache[email];

    // Generate Session JWT
    const token = await signToken({ email: user.email, role: user.role });

    // Set cookie
    // IMPORTANT!!! Use awaiting to set cookies next 15 requirement
    const cookieStore = await cookies();
    cookieStore.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return NextResponse.json({ success: true, message: "Authentication successful." });

  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
