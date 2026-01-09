# QI Card Payment Integration Setup

> **Official API Documentation**: https://developers-gate.qi.iq/

## Quick Setup

### 1. Get Credentials from QI Card
You'll receive:
- Username & Password (for Basic Auth)
- Terminal ID (required header)
- Public Key (RSA, for webhook verification)

### 2. Add Credentials to `.env.local`
```env
QICARD_USERNAME=your_username
QICARD_PASSWORD=your_password
QICARD_TERMINAL_ID=your_terminal_id
QICARD_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----
YOUR_PUBLIC_KEY_HERE
-----END PUBLIC KEY-----"

# Sandbox for testing
QICARD_API_URL=https://uat-sandbox-3ds-api.qi.iq/api/v1

# Production (when ready)
# QICARD_API_URL=https://api.qi.iq/api/v1

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run Database Migration
Go to Supabase Dashboard → SQL Editor:
```sql
-- Run: database/migrations/add_payment_fields_to_orders.sql
```

### 4. Configure Webhook URL
In QI Card Dashboard, set webhook to:
```
https://yourdomain.com/api/payments/qicard/webhook
```

For local testing with ngrok:
```bash
ngrok http 3000
# Use: https://your-id.ngrok.io/api/payments/qicard/webhook
```

## How It Works

1. Customer selects QI Card at checkout
2. System calls `POST /api/payments/qicard/initiate`
3. Gets payment URL from QI Card
4. Customer redirects to QI Card payment page
5. Customer pays with card
6. QI Card sends webhook to your server (with RSA signature)
7. System verifies signature and updates order status
8. Customer redirects to success page

## API Details

### Authentication
- **Method**: Basic Auth (username:password)
- **Header**: `X-Terminal-Id` (required)

### Create Payment
- **Endpoint**: `POST /payment`
- **Request**:
  ```json
  {
    "requestId": "order_id",
    "amount": 256.50,
    "currency": "IQD",
    "finishPaymentUrl": "success_url",
    "notificationUrl": "webhook_url",
    "customerInfo": { "firstName": "...", ... }
  }
  ```
- **Response**:
  ```json
  {
    "paymentId": "qicard_id",
    "status": "CREATED",
    "formUrl": "redirect_customer_here"
  }
  ```

### Webhook
- **Header**: `X-Signature` (base64 RSA signature)
- **Verification**: Uses QI Card public key
- **Payload**:
  ```json
  {
    "requestId": "order_id",
    "paymentId": "qicard_id",
    "status": "SUCCESS|FAILED|CANCELLED",
    "amount": 10000,
    "currency": "IQD"
  }
  ```

## Testing

```bash
npm run dev
# 1. Add products to cart
# 2. Go to checkout
# 3. Select QI Card
# 4. Complete payment flow
```

## Troubleshooting

- **"Configuration missing"** → Check all credentials in `.env.local`
- **"Invalid signature"** → Verify public key format with line breaks
- **"401 Unauthorized"** → Check username/password
- **"Terminal ID required"** → Verify Terminal ID is set

## Going Live

1. ✅ Test thoroughly with sandbox credentials
2. ✅ Get production credentials from QI Card
3. ✅ Update `.env.local` with production values
4. ✅ Change API URL to production
5. ✅ Update webhook URL in QI Card dashboard
6. ✅ Test with small transaction
7. ✅ Monitor logs

---

**For support**: Contact QI Card merchant support or visit https://qi.iq/
