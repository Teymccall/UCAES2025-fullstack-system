# Environment Setup for Paystack Integration

## Step 1: Create Environment File

Create a `.env.local` file in the root directory of your FEES PORTAL project:

```bash
# Paystack Configuration
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_c79226fde749dfd7bf30cf15dfcea04cfb617888
PAYSTACK_SECRET_KEY=sk_test_ff88b6c8cbc25c8447397fe2600511f2aa704c59

# Payment Callback URL
NEXT_PUBLIC_PAYSTACK_CALLBACK_URL=http://localhost:3000/payment/callback

# Currency (GHS for Ghana Cedis, NGN for Nigerian Naira)
NEXT_PUBLIC_PAYSTACK_CURRENCY=GHS

# Environment (test or live)
NEXT_PUBLIC_PAYSTACK_ENV=test

# Webhook URL (for production, set this to your domain)
NEXT_PUBLIC_PAYSTACK_WEBHOOK_URL=http://localhost:3000/api/paystack/webhook
```

## Step 2: Production Configuration

When you're ready to go live, update the `.env.local` file with your live keys:

```bash
# Paystack Live Keys (for production)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_your_live_public_key_here
PAYSTACK_SECRET_KEY=sk_live_your_live_secret_key_here

# Environment
NEXT_PUBLIC_PAYSTACK_ENV=live

# Production URLs
NEXT_PUBLIC_PAYSTACK_CALLBACK_URL=https://your-domain.com/payment/callback
NEXT_PUBLIC_PAYSTACK_WEBHOOK_URL=https://your-domain.com/api/paystack/webhook
```

## Step 3: Paystack Dashboard Configuration

1. **Callback URL**: Set to `https://your-domain.com/payment/callback`
2. **Webhook URL**: Set to `https://your-domain.com/api/paystack/webhook`
3. **Webhook Events**: Enable `charge.success`, `charge.failed`, `transfer.success`, `transfer.failed`

## Step 4: Restart Development Server

After creating the `.env.local` file, restart your development server:

```bash
npm run dev
```

## Security Notes

- Never commit `.env.local` to version control
- Keep your secret keys secure
- Use different keys for test and production environments
- Regularly rotate your production keys

