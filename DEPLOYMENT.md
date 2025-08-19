# Deployment Guide for Render

This guide will help you deploy the C++ Primer Progress Tracker to Render's free tier.

## Prerequisites

- A GitHub account
- A Render account (free at https://render.com)

## Step 1: Prepare Your Repository

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

## Step 2: Deploy to Render

### Option A: Using render.yaml (Recommended)

1. **Sign up/Login to Render**
   - Go to https://render.com
   - Sign up with your GitHub account

2. **Create New Blueprint Instance**
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` file

3. **Deploy**
   - Click "Apply" to deploy both services
   - Wait for deployment to complete

### Option B: Manual Deployment

#### Deploy Backend API

1. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**
   - **Name**: `cpp-primer-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

3. **Add Persistent Disk**
   - Go to "Environment" tab
   - Add a new disk:
     - **Name**: `progress-data`
     - **Mount Path**: `/opt/render/project/src`
     - **Size**: `1 GB`

4. **Deploy**
   - Click "Create Web Service"

#### Deploy Frontend

1. **Create Static Site**
   - Click "New +" → "Static Site"
   - Connect your GitHub repository

2. **Configure Site**
   - **Name**: `cpp-primer-frontend`
   - **Build Command**: `echo "Static site"`
   - **Publish Directory**: `public`
   - **Plan**: `Free`

3. **Deploy**
   - Click "Create Static Site"

## Step 3: Configure Environment

### Backend Environment Variables
Add these to your backend service:

- `NODE_ENV`: `production`
- `PORT`: `10000` (Render will set this automatically)

### Update Frontend API URL

If you deployed frontend and backend separately, update the API URL in `public/script.js`:

```javascript
// Change this line to your backend URL
const API_BASE_URL = 'https://your-backend-service.onrender.com';
```

## Step 4: Test Your Deployment

1. **Test Backend API**
   - Visit: `https://your-backend-service.onrender.com/progress`
   - Should return JSON data

2. **Test Frontend**
   - Visit your frontend URL
   - Should display the progress tracker interface

3. **Test Functionality**
   - Try checking/unchecking some subtopics
   - Verify progress bars update
   - Check that data persists after refresh

## Step 5: Custom Domain (Optional)

1. **Add Custom Domain**
   - Go to your service settings
   - Click "Custom Domains"
   - Add your domain and configure DNS

## Troubleshooting

### Common Issues

1. **Build Fails**
   - Check build logs in Render dashboard
   - Ensure all dependencies are in `package.json`
   - Verify Node.js version compatibility

2. **API Not Working**
   - Check if backend service is running
   - Verify CORS settings in `server.js`
   - Test API endpoints directly

3. **Data Not Persisting**
   - Ensure persistent disk is properly mounted
   - Check file permissions
   - Verify `progress.json` path in `server.js`

4. **Frontend Can't Connect to Backend**
   - Update API_BASE_URL in `script.js`
   - Check CORS configuration
   - Verify backend service URL

### Logs and Debugging

- **View Logs**: Go to your service → "Logs" tab
- **Environment Variables**: Check "Environment" tab
- **Build Logs**: Available during deployment

## Cost Optimization

### Free Tier Limits
- **Web Services**: 750 hours/month
- **Static Sites**: Unlimited
- **Persistent Disks**: 1GB free

### Tips
- Use static site for frontend (unlimited)
- Keep backend minimal (750 hours/month)
- Monitor usage in Render dashboard

## Security Considerations

1. **Environment Variables**
   - Don't commit sensitive data
   - Use Render's environment variable feature

2. **CORS**
   - Configure CORS properly for production
   - Limit allowed origins if needed

3. **File Permissions**
   - Ensure `progress.json` is writable
   - Use proper file paths

## Monitoring

1. **Health Checks**
   - Monitor service uptime
   - Set up alerts if needed

2. **Performance**
   - Monitor response times
   - Check resource usage

3. **Logs**
   - Regularly check application logs
   - Monitor for errors

## Updates and Maintenance

1. **Code Updates**
   - Push changes to GitHub
   - Render will auto-deploy

2. **Dependencies**
   - Update `package.json` as needed
   - Monitor for security updates

3. **Data Backup**
   - `progress.json` is stored on persistent disk
   - Consider regular backups for important data
