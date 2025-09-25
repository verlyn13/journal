# Journal App Admin Passphrase

## IMPORTANT: Store this information securely in Bitwarden

### Admin Account Details
- **Username**: verlyn13
- **Email**: jeffreyverlynjohnson@gmail.com
- **User ID**: 123e4567-e89b-12d3-a456-426614174000
- **Role**: Admin

### Authentication Passphrase
```
quill-aurora-ember-aurora-obsidian-cascade
```

### SHA-256 Hash (stored in code)
```
ff1e9fd9f4a7cea7a06af67be552c1e71eebb30c5f8711aae8de33e7e4c8d2e0
```

## How to Use

1. Navigate to http://localhost:5173
2. You'll see a minimalist black login page with an animated quill with flames
3. Enter the passphrase in the unlabeled text box
4. Press Enter to authenticate

## Testing the API Directly

```bash
curl -X POST http://localhost:8000/api/v1/auth/passphrase \
  -H "Content-Type: application/json" \
  -d '{"passphrase": "quill-aurora-ember-aurora-obsidian-cascade"}'
```

## Security Notes
- This passphrase system is for controlled testing only
- Store this passphrase in Bitwarden immediately
- Delete this file after saving to Bitwarden
- The passphrase is hashed using SHA-256 (will upgrade to bcrypt for production)

## Additional Test Passphrases
You can generate more passphrases by running:
```python
cd apps/api
python -c "from app.domain.auth.passphrase_auth import PassphraseAuthService; s = PassphraseAuthService(); p = s.generate_secure_passphrase(); print(f'Passphrase: {p}'); print(f'Hash: {s.hash_passphrase(p)}')"
```