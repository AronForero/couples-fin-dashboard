# Version Auth — Backend Changes

This document contains the backend implementation plan for user registration, authentication, and expense editing notifications.

---

## New Tables

### `couples`

```sql
CREATE TABLE IF NOT EXISTS couples (
    id          SERIAL PRIMARY KEY,
    invite_code VARCHAR(8) UNIQUE NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### `users`

```sql
CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name  VARCHAR(50) NOT NULL,
    couple_id     INTEGER REFERENCES couples(id),
    chat_id       BIGINT,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

`chat_id` is optional — stores the Telegram chat ID if the user links their Telegram account. Used for sending Telegram notifications when shared expenses are edited via the dashboard.

---

## New Dependencies

Add to `requirements.txt`:

```
bcrypt
python-telegram-bot
```

---

## New Endpoints

### `POST /api/auth/register`

**Request body:**
```json
{
  "email": "aru@email.com",
  "password": "password123",
  "display_name": "Aru"
}
```

**Logic:**
1. Validate email is unique
2. Hash password with bcrypt
3. Create user in `users` table
4. Create a new `couple` with a random 8-char alphanumeric `invite_code`
5. Set user's `couple_id` to the new couple
6. Generate JWT with `sub=email` (or user id), return `{ "access_token": "...", "token_type": "bearer" }`

**Error cases:**
- Email already registered → 400
- Password too short → 400

### `POST /api/auth/login`

**Request body:** (OAuth2 password flow — `application/x-www-form-urlencoded`)
```
username=aru@email.com&password=password123
```

**Logic:**
1. Look up user by email
2. Verify password with bcrypt
3. Generate JWT, return `{ "access_token": "...", "token_type": "bearer" }`

**Error cases:**
- Invalid credentials → 401

### `GET /api/auth/me`

**Auth:** Required (JWT)

**Response:**
```json
{
  "id": 1,
  "email": "aru@email.com",
  "display_name": "Aru",
  "couple_id": 1,
  "chat_id": 247795192,
  "created_at": "2026-01-01T00:00:00"
}
```

**Logic:**
- Look up user from JWT `sub` claim
- Return user object (without password_hash)

### `POST /api/auth/join`

**Auth:** Required (JWT)

**Request body:**
```json
{
  "invite_code": "ABCD1234"
}
```

**Logic:**
1. Look up couple by `invite_code`
2. Update current user's `couple_id` to this couple
3. Return `{ "message": "Pareja vinculada exitosamente" }`

**Error cases:**
- Invalid code → 404
- User already has a couple → 400
- Couple already has 2 members → 400

---

## Auth Changes

### `get_current_user()` migration

Current implementation hardcodes `{"Aru", "Mon"}`. New implementation:

1. Try to decode JWT as before
2. Check `sub` claim:
   - If it's an email (contains `@`): look up user in `users` table, return user object
   - If it's `"Aru"` or `"Mon"` (legacy): return a synthetic user object for backward compatibility
3. Return a `User` object (or equivalent) instead of just a string

### JWT payload

New tokens:
```json
{
  "sub": "aru@email.com",
  "iat": 1715000000,
  "exp": 1717592000
}
```

Legacy tokens (keep working):
```json
{
  "sub": "Aru",
  "iat": 1715000000,
  "exp": 1717592000
}
```

### `create_token()` update

Should accept user email (or id) instead of display name:
```python
def create_token(user_email: str) -> str:
    payload = {
        "sub": user_email,
        "iat": int(time.time()),
        "exp": int(time.time()) + TOKEN_EXPIRY_DAYS * 86400,
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=ALGORITHM)
```

---

## Expense Edit Notifications

When a shared expense is edited via the API (`PUT /api/expenses/{id}`), send a Telegram notification to the partner.

### Logic (in the PUT endpoint handler):

1. Before updating, fetch the current expense to check if it was shared
2. Apply the update
3. After updating, check if the expense is now shared
4. If `compartida` was `"Si"` before OR is `"Si"` after:
   - Find the partner's `chat_id` from the `users` table (look up the other user in the same couple)
   - Send Telegram message via `python-telegram-bot`

### Telegram notification code:

```python
from telegram import Bot

TELEGRAM_TOKEN = os.environ["TELEGRAM_TOKEN"]
bot = Bot(token=TELEGRAM_TOKEN)

async def notify_partner(chat_id: int, message: str):
    await bot.send_message(chat_id=chat_id, text=message)
```

### Notification message format:

```
⚠️ {sender_name} ha editado un gasto compartido #{expense_id}:
- Concepto: {old} → {new}
- Valor: {old} → {new}
- Quién pagó: {old} → {new}
```

Only include fields that changed.

### Finding the partner:

```python
def get_partner_chat_id(current_user_email: str, couple_id: int) -> int | None:
    # Query users table for the OTHER user in the same couple
    # Return their chat_id
```

---

## Config Changes

### New env vars

| Variable | Required | Notes |
|----------|----------|-------|
| `JWT_SECRET` | Already exists | Used for new auth too |
| `TELEGRAM_TOKEN` | Already exists | Used by API for notifications |

### `config.py` updates

- `ALLOWED_USER_IDS`, `CHAT_ID_TO_USER`, `_NAME_TO_CHAT_ID`, `get_partner_chat_id()` — keep for backward compatibility with the bot
- New function `get_partner_chat_id_by_couple(couple_id, exclude_email)` for the API to use

---

## API Models

### New Pydantic models (`api_models.py`)

```python
class UserRegister(BaseModel):
    email: str
    password: str
    display_name: str

class UserResponse(BaseModel):
    id: int
    email: str
    display_name: str
    couple_id: int | None
    chat_id: int | None
    created_at: str

class JoinRequest(BaseModel):
    invite_code: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
```

---

## Migration Notes

1. **Existing expenses** — no schema change needed on the `expenses` table. The `quien_pago` field stores display names ("Aru"/"Mon") which should match the `display_name` in the `users` table.

2. **Legacy tokens** — tokens generated by the Telegram `/token` command have `sub: "Aru"` or `sub: "Mon"`. The API should continue to accept these. The `get_current_user()` function should handle both email-based and name-based `sub` claims.

3. **Telegram `/token` command** — should continue to work. It can either:
   - Generate legacy-style tokens (with `sub: "Aru"`)
   - Or look up the user's email and generate new-style tokens

4. **`/api/expenses` POST** — the `quien_pago` field should accept display names from the `users` table, not just hardcoded "Aru"/"Mon".

5. **`/api/balance`** — the `viewer` parameter currently comes from `get_current_user()` which returns "Aru"/"Mon". With the new system, it should return the user's `display_name`.
