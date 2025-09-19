# 🔧 Fix Firebase "auth/unauthorized-domain" Error

## Problem
You get: "Firebase: Error (auth/unauthorized-domain)" when trying to login on Render.

## Why This Happens
- Firebase only allows authentication from authorized domains
- Your Render domain is not in the Firebase authorized domains list
- This is a security feature to prevent unauthorized access

## Solution: Add Render Domain to Firebase

### Step 1: Get Your Render Domain
1. Go to your Render dashboard
2. Click on your Static Site
3. Copy the URL (e.g., `https://flight-message-system.onrender.com`)

### Step 2: Add Domain to Firebase
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `flight-system-1d0b2`
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Click **"Add domain"**
5. Add your Render domain: `flight-message-system.onrender.com` (without https://)
6. Click **"Add"**

### Step 3: Also Add Localhost (for development)
Make sure these domains are in the list:
- `localhost` (for local development)
- `127.0.0.1` (for local development)
- `your-app-name.onrender.com` (your Render domain)

### Step 4: Test
1. Go back to your Render app
2. Try to login again
3. It should work now!

## Alternative: Use Custom Domain

### If you have a custom domain:
1. Add your custom domain to Firebase authorized domains
2. Configure your custom domain in Render
3. Update DNS settings

## Common Domains to Add

### For Development:
- `localhost`
- `127.0.0.1`
- `localhost:3000`

### For Production:
- `your-app-name.onrender.com`
- `your-custom-domain.com` (if you have one)

## Firebase Console Steps (Detailed)

1. **Go to Firebase Console**
   - Visit [console.firebase.google.com](https://console.firebase.google.com)
   - Select your project

2. **Navigate to Authentication**
   - Click "Authentication" in the left sidebar
   - Click "Settings" tab
   - Click "Authorized domains"

3. **Add Your Domain**
   - Click "Add domain"
   - Enter: `your-app-name.onrender.com`
   - Click "Add"

4. **Verify the List**
   Your authorized domains should include:
   - `localhost`
   - `127.0.0.1`
   - `your-app-name.onrender.com`

## Troubleshooting

### Still Getting Error?
1. **Check the exact domain** - make sure it matches exactly
2. **Wait a few minutes** - changes can take time to propagate
3. **Clear browser cache** - try incognito mode
4. **Check Firebase project** - make sure you're in the right project

### Domain Format
- ✅ Correct: `flight-message-system.onrender.com`
- ❌ Wrong: `https://flight-message-system.onrender.com`
- ❌ Wrong: `flight-message-system.onrender.com/`

### Multiple Environments
If you have multiple environments, add all domains:
- Development: `localhost`
- Staging: `your-app-staging.onrender.com`
- Production: `your-app.onrender.com`

## Security Note
- Only add domains you trust
- Don't add wildcard domains (`*.onrender.com`)
- Remove unused domains regularly

## Quick Fix Checklist

- [ ] Get your Render domain URL
- [ ] Go to Firebase Console
- [ ] Navigate to Authentication → Settings → Authorized domains
- [ ] Add your Render domain
- [ ] Test login on your Render app
- [ ] Verify it works

## Example Render Domains
Common Render domain patterns:
- `https://your-app-name.onrender.com`
- `https://your-app-name-123.onrender.com`
- `https://your-app-name-abc123.onrender.com`

## After Adding Domain
1. **Wait 1-2 minutes** for changes to take effect
2. **Refresh your Render app**
3. **Try logging in again**
4. **Check browser console** for any other errors

---

**Your app should work after adding the domain to Firebase!** 🎉
