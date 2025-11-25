# Clerk Authentication Setup Guide

This project now uses **Clerk** for authentication. Follow these steps to set it up:

## 1. Create a Clerk Account

1. Go to [https://clerk.com/](https://clerk.com/)
2. Sign up for a free account
3. Create a new application

## 2. Get Your Clerk Keys

1. In your Clerk Dashboard, go to **API Keys**
2. You'll see two important keys:
   - **Publishable Key** (starts with `pk_`)
   - **Secret Key** (starts with `sk_`)

## 3. Add Keys to .env.local

Open your `.env.local` file and replace the placeholder values:

```env
# Replace these with your actual Clerk keys:
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**IMPORTANT:** Keep your Secret Key secure and never commit it to version control!

## 4. Configure Clerk Settings (Optional)

In your Clerk Dashboard:

### Email/Password Authentication:
1. Go to **User & Authentication** → **Email, Phone, Username**
2. Enable **Email address**
3. Toggle on **Password**

### Customize Sign-in Experience:
1. Go to **Customization** → **Appearance**
2. Customize colors, logo, and branding to match your business

### Multi-factor Authentication (Optional):
1. Go to **User & Authentication** → **Multi-factor**
2. Enable SMS or Authenticator app for added security

## 5. Restart Your Development Server

After adding the keys:

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

## 6. Test Authentication

1. Visit `http://localhost:3000`
2. You should be redirected to the sign-in page
3. Click "Sign up" to create an account
4. After signing up, you'll be redirected to the main application

## Features Included

✅ **Sign In/Sign Up Pages** - Beautiful branded authentication pages
✅ **Protected Routes** - Main app is only accessible when logged in
✅ **User Button** - Click to see user profile and sign out option
✅ **Automatic Redirects** - Seamless navigation between authenticated/unauthenticated states

## Troubleshooting

### "Invalid Publishable Key" Error
- Make sure you copied the full key from Clerk Dashboard
- Check that the key starts with `pk_test_` or `pk_live_`
- Ensure there are no extra spaces or quotes

### Not Redirecting to Sign-in
- Restart your development server
- Clear your browser cache
- Check that middleware.ts file exists in the root directory

## Need Help?

- Clerk Documentation: [https://clerk.com/docs](https://clerk.com/docs)
- Clerk Support: Available in your Clerk Dashboard

---

**Software developed by JALogics**
