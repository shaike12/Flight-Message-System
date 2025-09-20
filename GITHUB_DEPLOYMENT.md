# GitHub Deployment Guide

This guide will help you deploy your Flight Message System to GitHub Pages or any other hosting platform.

## Prerequisites

- GitHub account
- Git installed on your computer
- Your project ready for deployment

## Deployment Steps

### 1. Prepare Your Project

Make sure your project builds successfully:

```bash
npm run build
```

### 2. Push to GitHub

Run one of these commands:

#### Option A: Using Personal Access Token
```bash
git push https://YOUR_TOKEN@github.com/shaike12/Flight-Message-System.git main
```

#### Option B: Configure Git Credentials
```bash
git config --global credential.helper store
git push origin main
# Enter your GitHub username
# Enter your Personal Access Token as password
```

#### Option C: Using SSH
```bash
git remote set-url origin git@github.com:shaike12/Flight-Message-System.git
git push origin main
```

### 3. Deploy to GitHub Pages

1. Go to your repository on GitHub
2. Click on "Settings" tab
3. Scroll down to "Pages" section
4. Under "Source", select "Deploy from a branch"
5. Choose "main" branch and "/ (root)" folder
6. Click "Save"
7. Your site will be available at: `https://shaike12.github.io/Flight-Message-System/`

### 4. Environment Variables for Production

For production deployment, you'll need to set up environment variables:

1. Go to your repository Settings
2. Click on "Secrets and variables" → "Actions"
3. Add the following secrets:
   - `REACT_APP_FIREBASE_API_KEY`
   - `REACT_APP_FIREBASE_AUTH_DOMAIN`
   - `REACT_APP_FIREBASE_PROJECT_ID`
   - `REACT_APP_FIREBASE_STORAGE_BUCKET`
   - `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
   - `REACT_APP_FIREBASE_APP_ID`

### 5. GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm install
      
    - name: Build
      run: npm run build
      env:
        REACT_APP_FIREBASE_API_KEY: ${{ secrets.REACT_APP_FIREBASE_API_KEY }}
        REACT_APP_FIREBASE_AUTH_DOMAIN: ${{ secrets.REACT_APP_FIREBASE_AUTH_DOMAIN }}
        REACT_APP_FIREBASE_PROJECT_ID: ${{ secrets.REACT_APP_FIREBASE_PROJECT_ID }}
        REACT_APP_FIREBASE_STORAGE_BUCKET: ${{ secrets.REACT_APP_FIREBASE_STORAGE_BUCKET }}
        REACT_APP_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.REACT_APP_FIREBASE_MESSAGING_SENDER_ID }}
        REACT_APP_FIREBASE_APP_ID: ${{ secrets.REACT_APP_FIREBASE_APP_ID }}
        
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./build
```

## Troubleshooting

### Common Issues

1. **Build Fails**: Check your environment variables and dependencies
2. **404 Error**: Make sure your build folder is correct
3. **Authentication Issues**: Verify your Personal Access Token has correct permissions

### Firebase Configuration

Make sure your Firebase project allows your GitHub Pages domain:

1. Go to Firebase Console
2. Navigate to Authentication → Settings → Authorized domains
3. Add your GitHub Pages domain: `shaike12.github.io`

## Security Notes

- Never commit your `.env` files
- Use GitHub Secrets for sensitive data
- Regularly rotate your Personal Access Tokens
- Enable two-factor authentication on your GitHub account

## Next Steps

After successful deployment:

1. Test your application thoroughly
2. Set up monitoring and analytics
3. Configure custom domain (optional)
4. Set up automated backups

## Support

If you encounter issues:

1. Check the GitHub Actions logs
2. Verify your environment variables
3. Test locally with production build
4. Check Firebase console for errors

---

**Note**: This guide assumes you're using React with Create React App. Adjust the build commands if you're using a different setup.