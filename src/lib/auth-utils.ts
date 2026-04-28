import { SignJWT, jwtVerify } from "jose";

const secretKey = "super-secret-educational-platform-key-do-not-use-in-prod";
const encodedKey = new TextEncoder().encode(secretKey);

export interface SessionPayload {
  email: string;
  role: string;
}

export async function signToken(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(encodedKey);
}

export async function verifyToken(token: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch (error) {
    return null;
  }
}
