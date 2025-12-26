import { signPayload, verifyToken } from "./crypto";

export interface QRPayload {
  t: string; // ticketId
  e: string; // eventId
  exp: number; // expiry timestamp
}

export function generateQRToken(ticketId: string, eventId: string): string {
  try {
    // Validate inputs
    if (!ticketId || typeof ticketId !== 'string' || ticketId.trim() === '') {
      throw new Error("Valid ticket ID is required");
    }

    if (!eventId || typeof eventId !== 'string' || eventId.trim() === '') {
      throw new Error("Valid event ID is required");
    }

    // Token valid for 60 hours (configurable)
    const expiry = Date.now() + 60 * 60 * 1000;
    
    const payload: QRPayload = {
      t: ticketId.trim(),
      e: eventId.trim(),
      exp: expiry,
    };
    
    return signPayload(payload);
  } catch (error) {
    console.error("Error generating QR token:", error);
    throw new Error("Failed to generate QR code");
  }
}

export function validateQRToken(
  token: string
): { valid: true; ticketId: string; eventId: string } | { valid: false; error: string } {
  try {
    // Validate input
    if (!token || typeof token !== 'string') {
      return { valid: false, error: "Token is required and must be a string" };
    }

    if (token.trim() === '') {
      return { valid: false, error: "Token cannot be empty" };
    }

    // Verify token signature
    const result = verifyToken(token);

    if (!result.ok) {
      return { valid: false, error: "Invalid token signature or format" };
    }

    const payload = result.payload as QRPayload;

    // Validate payload structure
    if (!payload || typeof payload !== 'object') {
      return { valid: false, error: "Invalid token payload" };
    }

    const { t, e, exp } = payload;

    if (!t || typeof t !== 'string') {
      return { valid: false, error: "Missing or invalid ticket ID in token" };
    }

    if (!e || typeof e !== 'string') {
      return { valid: false, error: "Missing or invalid event ID in token" };
    }

    // Check expiry
    if (exp) {
      if (typeof exp !== 'number') {
        return { valid: false, error: "Invalid expiry format" };
      }
      if (Date.now() > exp) {
        return { valid: false, error: "QR code has expired" };
      }
    }

    return { valid: true, ticketId: t, eventId: e };
  } catch (error) {
    console.error("Error validating QR token:", error);
    return { valid: false, error: "Failed to validate QR code" };
  }
}
