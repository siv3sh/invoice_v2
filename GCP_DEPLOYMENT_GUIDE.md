# Google App Engine Deployment Guide

## 🚀 **Invoice & Project Management System - GCP Deployment**

This guide will help you deploy your Invoice Management System to Google App Engine.

---

## 📋 **Prerequisites**

### **1. Google Cloud Account**
- Create a Google Cloud account at [cloud.google.com](https://cloud.google.com)
- Enable billing for your project

### **2. Google Cloud SDK**
```bash
# Install Google Cloud SDK
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Verify installation
gcloud --version
```

### **3. Authentication**
```bash
# Login to Google Cloud
gcloud auth login

# Set your project ID
gcloud config set project YOUR_PROJECT_ID
```

---

## 🏗️ **Project Structure for Deployment**

```
Invoicing-tool-V6-main/
├── app.yaml                 # Backend App Engine config
├── deploy-gcp.sh           # Deployment script
├── backend/
│   ├── server.py           # FastAPI application
│   ├── requirements.txt    # Python dependencies
│   └── .env.example        # Environment variables template
└── frontend/
    ├── app.yaml           # Frontend App Engine config
    ├── package.json       # Node.js dependencies
    └── build/             # Built React app (created during deployment)
```

---

## ⚙️ **Configuration Files**

### **Backend Configuration (`app.yaml`)**
```yaml
runtime: python39
env_variables:
  MONGODB_URL: "mongodb+srv://username:password@cluster.mongodb.net/invoice_management"
  SECRET_KEY: "your-secret-key"
  ENVIRONMENT: "production"
automatic_scaling:
  min_instances: 1
  max_instances: 10
```

### **Frontend Configuration (`frontend/app.yaml`)**
```yaml
runtime: nodejs18
env_variables:
  REACT_APP_API_URL: "https://your-project-id.appspot.com"
  NODE_ENV: "production"
handlers:
  - url: /.*
    static_files: build/index.html
    upload: build/index.html
```

---

## 🚀 **Deployment Steps**

### **Step 1: Prepare Your Project**

1. **Update Project ID**
   ```bash
   # Edit deploy-gcp.sh and replace 'your-project-id' with your actual project ID
   PROJECT_ID="your-actual-project-id"
   ```

2. **Set Up MongoDB**
   - Create a MongoDB Atlas cluster
   - Get your connection string
   - Update the `MONGODB_URL` in `app.yaml`

3. **Generate Secret Key**
   ```bash
   # Generate a secure secret key
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

### **Step 2: Deploy Backend**

```bash
# Navigate to project root
cd Invoicing-tool-V6-main

# Deploy backend
gcloud app deploy app.yaml
```

### **Step 3: Deploy Frontend**

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies and build
npm install --legacy-peer-deps --force
npm run build

# Deploy frontend
gcloud app deploy app.yaml
```

### **Step 4: Automated Deployment**

```bash
# Run the automated deployment script
./deploy-gcp.sh
```

---

## 🔧 **Environment Variables Setup**

### **Backend Environment Variables**
Set these in your `app.yaml`:

```yaml
env_variables:
  MONGODB_URL: "mongodb+srv://username:password@cluster.mongodb.net/invoice_management?retryWrites=true&w=majority"
  SECRET_KEY: "your-generated-secret-key"
  ENVIRONMENT: "production"
  CORS_ORIGINS: "https://your-project-id.appspot.com"
```

### **Frontend Environment Variables**
Set these in your `frontend/app.yaml`:

```yaml
env_variables:
  REACT_APP_API_URL: "https://your-project-id.appspot.com"
  NODE_ENV: "production"
```

---

## 📊 **Scaling Configuration**

### **Backend Scaling**
```yaml
automatic_scaling:
  min_instances: 1
  max_instances: 10
  target_cpu_utilization: 0.6
  target_throughput_utilization: 0.6
```

### **Frontend Scaling**
```yaml
automatic_scaling:
  min_instances: 1
  max_instances: 5
  target_cpu_utilization: 0.6
```

---

## 🔍 **Monitoring and Management**

### **View Application**
```bash
# Open your app in browser
gcloud app browse
```

### **View Logs**
```bash
# View real-time logs
gcloud app logs tail

# View specific service logs
gcloud app logs tail --service=default
```

### **Manage Versions**
```bash
# List all versions
gcloud app versions list

# Delete old versions
gcloud app versions delete VERSION_ID
```

### **Monitor Performance**
- Go to [Google Cloud Console](https://console.cloud.google.com)
- Navigate to App Engine > Services
- View metrics, logs, and performance data

---

## 🛠️ **Troubleshooting**

### **Common Issues**

1. **Deployment Fails**
   ```bash
   # Check logs
   gcloud app logs tail
   
   # Verify project ID
   gcloud config get-value project
   ```

2. **Frontend Build Fails**
   ```bash
   # Clear npm cache
   npm cache clean --force
   
   # Reinstall dependencies
   rm -rf node_modules package-lock.json
   npm install --legacy-peer-deps --force
   ```

3. **Backend Connection Issues**
   - Verify MongoDB connection string
   - Check environment variables
   - Ensure MongoDB Atlas allows connections from App Engine

4. **CORS Issues**
   - Update `CORS_ORIGINS` in backend environment variables
   - Ensure frontend URL is included in allowed origins

### **Debug Commands**
```bash
# Check deployment status
gcloud app services list

# View specific version details
gcloud app versions describe VERSION_ID

# Test API endpoints
curl https://your-project-id.appspot.com/api/health
```

---

## 🔐 **Security Considerations**

### **Environment Variables**
- Never commit sensitive data to version control
- Use Google Secret Manager for production secrets
- Rotate secret keys regularly

### **CORS Configuration**
```python
# In your FastAPI app
origins = [
    "https://your-project-id.appspot.com",
    "https://your-custom-domain.com"
]
```

### **HTTPS Enforcement**
- App Engine automatically provides HTTPS
- Configure custom domains with SSL certificates

---

## 📈 **Performance Optimization**

### **Backend Optimization**
- Enable caching for frequently accessed data
- Use connection pooling for MongoDB
- Implement proper error handling

### **Frontend Optimization**
- Enable gzip compression
- Use CDN for static assets
- Implement lazy loading

---

## 🎯 **Post-Deployment Checklist**

- [ ] Backend API responding correctly
- [ ] Frontend loading without errors
- [ ] Database connections working
- [ ] Authentication system functional
- [ ] All API endpoints accessible
- [ ] CORS configuration correct
- [ ] SSL certificates active
- [ ] Monitoring and logging enabled
- [ ] Backup strategy implemented

---

## 🔗 **Useful Links**

- [Google App Engine Documentation](https://cloud.google.com/appengine/docs)
- [FastAPI Deployment Guide](https://fastapi.tiangolo.com/deployment/)
- [React Build Optimization](https://create-react-app.dev/docs/production-build/)
- [MongoDB Atlas Setup](https://docs.atlas.mongodb.com/)

---

## 📞 **Support**

If you encounter issues during deployment:

1. Check the troubleshooting section above
2. Review Google Cloud Console logs
3. Verify all environment variables are set correctly
4. Ensure all dependencies are properly installed

**Your Invoice Management System is now ready for production deployment on Google App Engine!** 🚀
