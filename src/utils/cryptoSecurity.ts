/**
 * Cryptographic & Privacy Utilities using standard Web Crypto API (SubtleCrypto)
 * Provides AES-GCM 256-bit encryption, PBKDF2 key derivation, and secure hashing.
 * Guarantees zero external transmission and local cryptographic security.
 */

const SALT_BYTES = 16;
const IV_BYTES = 12;
const PBKDF2_ITERATIONS = 100000;

/**
 * Derives an AES-GCM key from a user passphrase/PIN and salt using PBKDF2
 */
async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts arbitrary serializable data using AES-256-GCM with a user password
 * Returns a base64-encoded payload containing [Salt + IV + Ciphertext]
 */
export async function encryptData(data: unknown, passphrase: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const key = await deriveKey(passphrase, salt);

  const enc = new TextEncoder();
  const plaintext = enc.encode(JSON.stringify(data));

  const ciphertext = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    plaintext
  );

  // Combine [Salt (16) + IV (12) + Ciphertext]
  const combined = new Uint8Array(salt.length + iv.length + ciphertext.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(ciphertext), salt.length + iv.length);

  // Convert to Base64
  let binary = '';
  for (let i = 0; i < combined.length; i++) {
    binary += String.fromCharCode(combined[i]);
  }
  return btoa(binary);
}

/**
 * Decrypts a base64 payload created by encryptData using AES-256-GCM
 */
export async function decryptData(encryptedBase64: string, passphrase: string): Promise<any> {
  const binary = atob(encryptedBase64);
  const combined = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    combined[i] = binary.charCodeAt(i);
  }

  if (combined.length < SALT_BYTES + IV_BYTES) {
    throw new Error('Corrupted or invalid encrypted payload');
  }

  const salt = combined.slice(0, SALT_BYTES);
  const iv = combined.slice(SALT_BYTES, SALT_BYTES + IV_BYTES);
  const ciphertext = combined.slice(SALT_BYTES + IV_BYTES);

  const key = await deriveKey(passphrase, salt);

  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    ciphertext
  );

  const dec = new TextDecoder();
  const jsonStr = dec.decode(decrypted);
  return JSON.parse(jsonStr);
}

/**
 * Computes a secure SHA-256 hash of a PIN or passcode for local verification
 */
export async function hashPasscode(passcode: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(passcode + '_boodjam_secure_salt_v1');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
