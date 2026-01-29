import CryptoJS from 'crypto-js';

const SECRET_KEY = 'educare_chat_encryption_key_2024';

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
