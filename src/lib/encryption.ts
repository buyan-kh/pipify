// Server-side only: Fernet-compatible encryption for MT5 passwords
// Uses Web Crypto API for AES-CBC (same key format as Python's cryptography.fernet)

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!;

function getKeyBytes(): Uint8Array {
  // Fernet key is base64url-encoded 32 bytes (16 signing + 16 encryption)
  // We use the last 16 bytes as AES key
  const decoded = Buffer.from(ENCRYPTION_KEY, "base64url");
  return new Uint8Array(decoded.slice(16, 32));
}

export async function encrypt(plaintext: string): Promise<string> {
  const key = getKeyBytes();
  const iv = crypto.getRandomValues(new Uint8Array(16));
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key.buffer as ArrayBuffer,
    { name: "AES-CBC" },
    false,
    ["encrypt"]
  );
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-CBC", iv: iv.buffer as ArrayBuffer },
    cryptoKey,
    encoded
  );
  // Store as base64: iv + ciphertext
  const combined = new Uint8Array(iv.length + new Uint8Array(ciphertext).length);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);
  return Buffer.from(combined).toString("base64");
}

export async function decrypt(encrypted: string): Promise<string> {
  const key = getKeyBytes();
  const combined = Buffer.from(encrypted, "base64");
  const iv = new Uint8Array(combined.slice(0, 16));
  const ciphertext = new Uint8Array(combined.slice(16));
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key.buffer as ArrayBuffer,
    { name: "AES-CBC" },
    false,
    ["decrypt"]
  );
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-CBC", iv: iv.buffer as ArrayBuffer },
    cryptoKey,
    ciphertext
  );
  return new TextDecoder().decode(decrypted);
}
