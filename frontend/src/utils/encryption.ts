import CryptoJS from 'crypto-js';

// Chat-message encryption key. Sourced from environment so the key can be
// rotated without a code change. A baked-in fallback only exists so that
// existing messages encrypted under the legacy key remain readable in dev.
// In production the env var MUST be set (deployment check enforces this).
const SECRET_KEY =
  process.env.EXPO_PUBLIC_CHAT_ENCRYPTION_KEY ||
  process.env.REACT_APP_CHAT_ENCRYPTION_KEY ||
  'educare_chat_encryption_key_2024';

export function encrypt(text: string): string {
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
}

export function decrypt(cipherText: string): string {
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption error:', error);
    return '[Unable to decrypt message]';
  }
}
