import crypto from "crypto";

const QR_SECRET = process.env.QR_SECRET || "change_me_qr";

export function signPayload(payload: object, secret: string = QR_SECRET): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto
    .createHmac("sha256", secret)
    .update(data)
    .digest("base64url");
  return `${data}.${sig}`;
}

export function verifyToken(
  token: string,
  secret: string = QR_SECRET
): { ok: true; payload: any } | { ok: false } {
  try {
    const [data, sig] = token.split(".");
    if (!data || !sig) return { ok: false };

    const expected = crypto
      .createHmac("sha256", secret)
      .update(data)
      .digest("base64url");

    if (sig !== expected) return { ok: false };

    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));

    // Check expiry if present
    if (payload.exp && Date.now() > payload.exp) return { ok: false };

    return { ok: true, payload };
  } catch {
    return { ok: false };
  }
}

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}
