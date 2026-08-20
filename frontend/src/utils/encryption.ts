import CryptoJS from 'crypto-js';

// Chat-message encryption key. Sourced from environment so the key can be
// rotated without a code change. A baked-in fallback only exists so that
// existing messages encrypted under the legacy key remain readable in dev.
// Nothing currently enforces the env var being set in production — if it's
// missing, chat silently falls back to this key, which is public (it's in
// the client bundle/source), so messages are effectively unencrypted. The
// warning below is the only signal; it's a console warning rather than a
// thrown error so a missing env var degrades to "weak encryption" instead
// of "chat doesn't work at all" on an already-live app.
const envKey = process.env.EXPO_PUBLIC_CHAT_ENCRYPTION_KEY || process.env.REACT_APP_CHAT_ENCRYPTION_KEY;
if (!envKey) {
  console.error(
    'Chat encryption: EXPO_PUBLIC_CHAT_ENCRYPTION_KEY is not set — falling back to the public dev key. Messages are not meaningfully encrypted until this is configured.',
  );
}
const SECRET_KEY = envKey || 'educare_chat_encryption_key_2024';

export function encrypt(text: string): string {
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
}

export function decrypt(cipherText: string): string {
  if (!cipherText) return cipherText;
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
    const plain = bytes.toString(CryptoJS.enc.Utf8);
    // SEC-005 (2026-07) stopped encrypting new messages client-side (see
    // chat/[matchId].tsx) so the backend safeguarding filter can scan
    // plaintext. AES-decrypting plaintext throws or yields nothing, so
    // treat that as "already plaintext" instead of surfacing an error —
    // legacy messages encrypted under SECRET_KEY still decrypt normally.
    return plain || cipherText;
  } catch (error) {
    return cipherText;
  }
}
