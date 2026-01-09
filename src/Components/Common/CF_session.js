import { CF_encrypt, CF_decrypt } from "./encryptiondecryption";

export function CF_text(encryptedAES) {
  return encryptedAES === undefined || encryptedAES === null
    ? encryptedAES
    : CF_decrypt(encryptedAES);
}

export function CF_sessionSet(key, val, encrypt = 0) {
  try {
    const value = encrypt === 1 ? CF_encrypt(val) : val;
    sessionStorage.setItem(key, value);
  } catch (err) {
    console.error("CF_sessionSet error:", err);
  }
}

export function CF_sessionGet(key, encrypt = 0) {
  try {
    const value = sessionStorage.getItem(key);
    return encrypt === 1 ? CF_text(value) : value;
  } catch (err) {
    console.error("CF_sessionGet error:", err);
    return null;
  }
}

export function CF_sessionRemove(key) {
  try {
    sessionStorage.removeItem(key);
  } catch (err) {
    console.error("CF_sessionRemove error:", err);
  }
}

export function CF_sessionClear() {
  try {
    sessionStorage.clear();
  } catch (err) {
    console.error("CF_sessionClear error:", err);
  }
}

