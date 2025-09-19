# Environment Setup Guide

## Required Environment Variables

This application requires several environment variables to be set for proper functionality.

### 1. Create Environment File

Copy the example environment file and fill in your values:

```bash
cp .env.example .env.local
```

### 2. Firebase Configuration

You need to set up Firebase configuration variables. Get these values from your Firebase project settings:

- Go to [Firebase Console](https://console.firebase.google.com/)
- Select your project
- Go to Project Settings (gear icon)
- Scroll down to "Your apps" section
- Click on the web app icon `</>`
- Copy the configuration values

### 3. Required Variables

Fill in the following variables in your `.env.local` file:

```env
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

# Application Configuration
REACT_APP_APP_NAME=Flight Message System
REACT_APP_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=development

# Security Settings
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_ENABLE_CRASH_REPORTING=false
```

### 4. Security Notes

- **Never commit `.env.local` to version control**
- The `.env.local` file is already in `.gitignore`
- Use `.env.example` as a template for other developers
- Keep your Firebase API keys secure
- Consider using different Firebase projects for development and production

### 5. Firebase Project Setup

Make sure your Firebase project has the following services enabled:

1. **Authentication**
   - Email/Password authentication
   - Google authentication (optional)
   - Phone authentication (optional)

2. **Firestore Database**
   - Create the following collections:
     - `templates`
     - `flightRoutes`
     - `cities`
     - `users`
     - `customVariables`
     - `sentMessages`

3. **Firestore Security Rules**
   - Set up appropriate security rules for your collections
   - Ensure users can only access their own data

### 6. Troubleshooting

If you get errors about missing environment variables:

1. Check that `.env.local` exists in the project root
2. Verify all required variables are set
3. Restart the development server after making changes
4. Check the browser console for specific error messages

### 7. Production Deployment

For production deployment:

1. Set up environment variables in your hosting platform
2. Use production Firebase project
3. Update security rules for production
4. Enable analytics and crash reporting if needed

## Support

If you encounter issues with environment setup, check:

1. Firebase project configuration
2. Environment variable names (must start with `REACT_APP_`)
3. File permissions and location
4. Development server restart
