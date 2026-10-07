---
name: cryptographic-token-vault
description: ECDSA token validation, AES-256-GCM symmetric secret rotation, and Zero-Trust credential storage.
---

# 🔐 Cryptographic Token Vault & Secret Rotation

The **Cryptographic Token Vault Skill** manages key lifecycle, signature verification, and secure credential storage.

## 🧭 1. AES-256-GCM Secret Encryption
```typescript
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

export function encryptSecret(plainText: string, masterKey: Buffer): { encrypted: string; iv: string; tag: string } {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, masterKey, iv);
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');
  return { encrypted, iv: iv.toString('hex'), tag };
}
```
