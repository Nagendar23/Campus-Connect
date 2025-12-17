import { signPayload, verifyToken } from "./crypto";

export interface QRPayload {
  t: string; // ticketId
  e: string; // eventId
  exp: number; // expiry timestamp
}

export function generateQRToken(ticketId: string, eventId: string): string {
  // Token valid for 48h before event + 12h after event start (configurable)
  const expiry = Date.now() + 60 * 60 * 1000; // 60 hours for demo
  const payload: QRPayload = {
    t: ticketId,
    e: eventId,
    exp: expiry,
  };
  return signPayload(payload);
}

export function validateQRToken(
  token: string
): { valid: true; ticketId: string; eventId: string } | { valid: false; error: string } {
  const result = verifyToken(token);

  if (!result.ok) {
    return { valid: false, error: "Invalid token signature" };
  }

  const { t, e, exp } = result.payload as QRPayload;

  if (!t || !e) {
    return { valid: false, error: "Missing ticket or event ID" };
  }

  if (exp && Date.now() > exp) {
    return { valid: false, error: "Token expired" };
  }

  return { valid: true, ticketId: t, eventId: e };
}
