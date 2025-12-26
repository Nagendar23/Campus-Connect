import crypto from "crypto";

const QR_SECRET = process.env.QR_SECRET || "change_me_qr";

export function signPayload(payload: object, secret: string = QR_SECRET): string {
  try {
    // Validate inputs
    if (!payload || typeof payload !== 'object') {
      throw new Error("Valid payload object is required");
    }

    if (!secret || typeof secret !== 'string') {
      throw new Error("Valid secret is required");
    }

    const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const sig = crypto
      .createHmac("sha256", secret)
      .update(data)
      .digest("base64url");
    
    return `${data}.${sig}`;
  } catch (error) {
    console.error("Error signing payload:", error);
    throw new Error("Failed to sign payload");
  }
}

export function verifyToken(
  token: string,
  secret: string = QR_SECRET
): { ok: true; payload: any } | { ok: false } {
  try {
    // Validate inputs
    if (!token || typeof token !== 'string') {
      return { ok: false };
    }

    if (!secret || typeof secret !== 'string') {
      console.error("Invalid secret provided to verifyToken");
      return { ok: false };
    }

    const parts = token.split(".");
    if (parts.length !== 2) {
      return { ok: false };
    }

    const [data, sig] = parts;
    if (!data || !sig) {
      return { ok: false };
    }

    // Verify signature
    const expected = crypto
      .createHmac("sha256", secret)
      .update(data)
      .digest("base64url");

    if (sig !== expected) {
      return { ok: false };
    }

    // Decode and parse payload
    const decodedData = Buffer.from(data, "base64url").toString("utf8");
    const payload = JSON.parse(decodedData);

    // Check expiry if present
    if (payload.exp && typeof payload.exp === 'number' && Date.now() > payload.exp) {
      return { ok: false };
    }

    return { ok: true, payload };
  } catch (error) {
    console.error("Error verifying token:", error);
    return { ok: false };
  }
}

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}
