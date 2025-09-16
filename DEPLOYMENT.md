# 🚀 Render Deployment Guide - Activus Invoice Management System

This guide will help you deploy your invoicing tool to Render in just a few steps!

## 📋 Prerequisites

1. **GitHub Repository**: Your code should be pushed to GitHub
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **MongoDB Database**: You'll need a MongoDB database (MongoDB Atlas recommended)

## 🗄️ Database Setup (MongoDB Atlas - Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster (free tier available)
4. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
5. Note your database name (e.g., `invoicing_db`)

## 🚀 Quick Deployment (Using render.yaml)

### Option 1: One-Click Deployment

1. **Connect Repository**:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Select your repository

2. **Configure Environment Variables**:
   - Add `MONGO_URL` with your MongoDB connection string
   - Add `DB_NAME` with your database name
   - Other variables will be set automatically

3. **Deploy**:
   - Click "Apply" and Render will deploy both services automatically!

## 🔧 Manual Deployment (Step by Step)

### Backend Deployment

1. **Create Web Service**:
   - Go to Render Dashboard
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Backend**:
   - **Name**: `invoicing-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `cd backend && uvicorn server:app --host 0.0.0.0 --port $PORT`

3. **Environment Variables**:
   ```
   MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/
   DB_NAME=invoicing_db
   ENVIRONMENT=production
   ```

4. **Deploy**: Click "Create Web Service"

### Frontend Deployment

1. **Create Static Site**:
   - Go to Render Dashboard
   - Click "New +" → "Static Site"
   - Connect your GitHub repository

2. **Configure Frontend**:
   - **Name**: `invoicing-frontend`
   - **Build Command**: `cd frontend && yarn install && yarn build`
   - **Publish Directory**: `frontend/build`

3. **Environment Variables**:
   ```
   REACT_APP_BACKEND_URL=https://your-backend-service.onrender.com
   ```

4. **Deploy**: Click "Create Static Site"

## ✅ Testing Your Deployment

### Backend Testing
- **Health Check**: `https://your-backend-url.onrender.com/`
- **API Docs**: `https://your-backend-url.onrender.com/docs`
- **API Endpoints**: `https://your-backend-url.onrender.com/api/`

### Frontend Testing
- **Main App**: `https://your-frontend-url.onrender.com`
- **Login**: Try logging in with test credentials

## 🔧 Environment Variables Reference

### Backend Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URL` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/` |
| `DB_NAME` | Database name | `invoicing_db` |
| `ENVIRONMENT` | Environment type | `production` |

### Frontend Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_BACKEND_URL` | Backend API URL | `https://your-backend.onrender.com` |

## 🐛 Troubleshooting

### Common Issues

1. **"Not Found" Error**:
   - Make sure you're accessing `/docs` not `/doc`
   - Check that your backend URL is correct

2. **Database Connection Issues**:
   - Verify your `MONGO_URL` is correct
   - Check MongoDB Atlas network access settings
   - Ensure your database user has proper permissions

3. **Frontend Can't Connect to Backend**:
   - Verify `REACT_APP_BACKEND_URL` is set correctly
   - Check that backend is running and accessible

4. **Build Failures**:
   - Check Render build logs for specific errors
   - Ensure all dependencies are in `requirements.txt` and `package.json`

### Health Check Endpoints

Your backend now includes health check endpoints:
- `GET /` - Main health check with system info
- `GET /health` - Simple status check

## 📊 Monitoring

- **Backend Logs**: Available in Render dashboard
- **Frontend Logs**: Available in Render dashboard
- **Database**: Monitor in MongoDB Atlas dashboard

## 🔄 Updates

To update your deployment:
1. Push changes to your GitHub repository
2. Render will automatically redeploy (if auto-deploy is enabled)
3. Or manually trigger redeploy from Render dashboard

## 💡 Tips

1. **Free Tier Limitations**:
   - Backend may sleep after 15 minutes of inactivity
   - Frontend static sites don't sleep
   - MongoDB Atlas free tier has usage limits

2. **Performance**:
   - First request after sleep may be slow (cold start)
   - Consider upgrading to paid plans for production use

3. **Security**:
   - Use strong passwords for MongoDB
   - Consider implementing JWT secret rotation
   - Enable HTTPS (automatic on Render)

## 🆘 Support

If you encounter issues:
1. Check Render build logs
2. Verify environment variables
3. Test endpoints individually
4. Check MongoDB Atlas connection

---

**🎉 Congratulations!** Your invoicing system should now be live on Render!
