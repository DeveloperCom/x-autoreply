// auth.ts — Fixes "Invalid key length" using PBKDF2 key derivation

const encoder = new TextEncoder();
const decoder = new TextDecoder();

type Algo = 'AES-GCM' | 'AES-CBC';
const ivLengthMap: Record<Algo, number> = {
  'AES-GCM': 12,
  'AES-CBC': 16,
};

class Auth {
  static async sign(
    key: string,
    payload: object,
    algo: Algo = 'AES-GCM'
  ): Promise<string> {
    const iv = crypto.getRandomValues(new Uint8Array(ivLengthMap[algo]));
    const cryptoKey = await Auth._deriveKey(key, algo);

    const encrypted = await crypto.subtle.encrypt(
      { name: algo, iv },
      cryptoKey,
      encoder.encode(JSON.stringify(payload))
    );

    const result = new Uint8Array(iv.length + encrypted.byteLength);
    result.set(iv, 0);
    result.set(new Uint8Array(encrypted), iv.length);

    return btoa(String.fromCharCode(...result));
  }

  static async verify(
    key: string,
    token: string,
    algo: Algo = 'AES-GCM'
  ): Promise<any> {
    const raw = Uint8Array.from(atob(token), c => c.charCodeAt(0));
    const ivLen = ivLengthMap[algo];
    const iv = raw.slice(0, ivLen);
    const data = raw.slice(ivLen);

    const cryptoKey = await Auth._deriveKey(key, algo);

    const decrypted = await crypto.subtle.decrypt(
      { name: algo, iv },
      cryptoKey,
      data
    );

    const decoded = decoder.decode(decrypted);
    return JSON.parse(decoded);
  }

  private static async _deriveKey(secret: string, algo: Algo): Promise<CryptoKey> {
    const salt = encoder.encode('auth-static-salt'); // You can randomize per app/user

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      {
        name: algo,
        length: 256, // AES-256
      },
      false,
      ['encrypt', 'decrypt']
    );
  }
}

// Named exports
const sign = Auth.sign;
const verify = Auth.verify;

export default Auth;
export { sign, verify };
