# Render Deployment Guide

## 🚀 Deploy to Render

### Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with your GitHub account
3. Connect your GitHub repository

### Step 2: Create New Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository: `shaike12/flight-message-system`
3. Configure the service:

#### Basic Settings:
- **Name**: `flight-message-system`
- **Environment**: `Node`
- **Branch**: `main`
- **Root Directory**: Leave empty
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

#### Advanced Settings:
- **Node Version**: `18` (or latest)
- **Auto-Deploy**: `Yes` (deploys automatically on push)

### Step 3: Environment Variables
Add these environment variables in Render dashboard:

#### Firebase Configuration:
```
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

#### Application Configuration:
```
REACT_APP_APP_NAME=Flight Message System
REACT_APP_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=production
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_CRASH_REPORTING=true
```

### Step 4: Deploy
1. Click "Create Web Service"
2. Render will automatically:
   - Clone your repository
   - Install dependencies
   - Build the application
   - Deploy to a live URL

### Step 5: Custom Domain (Optional)
1. Go to your service settings
2. Add custom domain
3. Configure DNS settings

## 🔧 Build Configuration

### package.json Scripts
Make sure your `package.json` has these scripts:
```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test"
  }
}
```

### Build Optimization
Render will automatically:
- Install dependencies with `npm install`
- Build the app with `npm run build`
- Serve the built files

## 🌐 Environment Variables

### Required Variables:
- All Firebase configuration variables
- Application settings
- Security settings

### How to Add:
1. Go to your Render service dashboard
2. Click "Environment" tab
3. Add each variable with its value
4. Click "Save Changes"

## 📱 Post-Deployment

### 1. Test Your Application
- Visit your Render URL
- Test all features
- Verify Firebase connection
- Check authentication

### 2. Update Firebase Settings
- Add your Render domain to Firebase authorized domains
- Update Firebase security rules if needed

### 3. Monitor Performance
- Check Render dashboard for logs
- Monitor build times
- Set up alerts if needed

## 🔍 Troubleshooting

### Common Issues:

#### Build Failures:
- Check Node.js version compatibility
- Verify all dependencies are in package.json
- Check build logs in Render dashboard

#### Environment Variables:
- Ensure all required variables are set
- Check variable names (case-sensitive)
- Verify Firebase configuration

#### Firebase Connection:
- Check Firebase project settings
- Verify API keys are correct
- Test Firebase connection locally first

### Debug Steps:
1. Check Render build logs
2. Verify environment variables
3. Test Firebase configuration
4. Check browser console for errors

## 🎯 Production Checklist

- [ ] All environment variables set
- [ ] Firebase project configured
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Performance monitoring set up
- [ ] Error tracking configured
- [ ] Backup strategy in place

## 📊 Monitoring

### Render Dashboard:
- View build logs
- Monitor performance
- Check error rates
- View deployment history

### Firebase Console:
- Monitor user authentication
- Check database usage
- View error logs
- Monitor performance

## 🔄 Auto-Deployment

Render automatically deploys when you:
- Push to main branch
- Merge pull requests
- Update environment variables

## 💰 Pricing

### Free Tier:
- 750 hours/month
- Automatic SSL
- Custom domains
- GitHub integration

### Paid Plans:
- More build minutes
- Priority support
- Advanced features

## 🆘 Support

If you need help:
1. Check Render documentation
2. Review build logs
3. Test locally first
4. Contact Render support

---

**Your app will be live at**: `https://your-app-name.onrender.com`

**Next Steps**: Set up custom domain and monitoring!
