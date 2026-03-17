import CryptoJS from "crypto-js";

// Make sure this matches your backend SECRET_KEY exactly
// In Vite, use import.meta.env.VITE_QR_SECRET
const SECRET_KEY = "sureshaswath05!";

export const decryptOTP = (encryptedHex: string): string => {
  try {
    // 1. Prepare Key (SHA256 of the secret)
    const key = CryptoJS.SHA256(SECRET_KEY);

    const iv = CryptoJS.enc.Hex.parse("00000000000000000000000000000000");

    // 2. Create CipherParams object from hex string using lib.CipherParams.create
    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Hex.parse(encryptedHex),
    });

    // 3. Decrypt
    const decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error("Decryption failed:", error);
    return "Error";
  }
};
