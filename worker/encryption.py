import base64
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding
from config import ENCRYPTION_KEY


def _get_key_bytes() -> bytes:
    """Extract AES key from Fernet-format base64url key (last 16 bytes)."""
    decoded = base64.urlsafe_b64decode(ENCRYPTION_KEY + '==')
    return decoded[16:32]


def decrypt(encrypted: str) -> str:
    """Decrypt a password encrypted by the Next.js server."""
    key = _get_key_bytes()
    combined = base64.b64decode(encrypted)
    iv = combined[:16]
    ciphertext = combined[16:]

    cipher = Cipher(algorithms.AES(key), modes.CBC(iv))
    decryptor = cipher.decryptor()
    padded = decryptor.update(ciphertext) + decryptor.finalize()

    # Remove PKCS7 padding
    unpadder = padding.PKCS7(128).unpadder()
    plaintext = unpadder.update(padded) + unpadder.finalize()
    return plaintext.decode('utf-8')
