# Google App Engine Deployment - Complete Setup Guide

## 🚀 **Invoice Management System - Google App Engine Deployment**

Your project is ready for deployment! Here's what you need to do:

---

## ⚠️ **IMPORTANT: Billing Setup Required**

Before deploying, you need to enable billing for your Google Cloud project:

### **Step 1: Enable Billing**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project: `g1sivesh`
3. Navigate to **Billing** in the left menu
4. Click **Link a billing account**
5. Create a new billing account or link an existing one
6. Add a payment method (credit card)

### **Step 2: Enable Required APIs**
After billing is enabled, run:
```bash
gcloud services enable appengine.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

---

## 🏗️ **Project Configuration**

### **Current Setup:**
- **Project ID**: `g1sivesh`
- **Backend URL**: `https://g1sivesh.appspot.com`
- **Frontend URL**: `https://g1sivesh.appspot.com`

### **Files Created:**
- `app.yaml` - Backend configuration
- `frontend/app.yaml` - Frontend configuration  
- `deploy-gcp.sh` - Automated deployment script
- `setup-gcp.sh` - Initial setup script
- `GCP_DEPLOYMENT_GUIDE.md` - Detailed deployment guide

---

## 🚀 **Deployment Process**

### **Option 1: Automated Deployment (Recommended)**
```bash
# Run the automated deployment script
./deploy-gcp.sh
```

### **Option 2: Manual Deployment**

#### **Deploy Backend:**
```bash
# Deploy FastAPI backend
gcloud app deploy app.yaml
```

#### **Deploy Frontend:**
```bash
# Build React frontend
cd frontend
npm install --legacy-peer-deps --force
npm run build

# Deploy frontend
gcloud app deploy app.yaml
```

---

## 🔧 **Environment Variables Setup**

### **Backend Environment Variables (`app.yaml`)**
You need to update these values:

```yaml
env_variables:
  MONGODB_URL: "mongodb+srv://your-username:your-password@your-cluster.mongodb.net/invoice_management?retryWrites=true&w=majority"
  SECRET_KEY: "your-secret-key-here"
  ENVIRONMENT: "production"
  CORS_ORIGINS: "https://g1sivesh.appspot.com"
```

### **Generate Secret Key:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## 🗄️ **Database Setup**

### **MongoDB Atlas Setup:**
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Create a database user
4. Get your connection string
5. Update `MONGODB_URL` in `app.yaml`

### **Connection String Format:**
```
mongodb+srv://username:password@cluster.mongodb.net/invoice_management?retryWrites=true&w=majority
```

---

## 📋 **Pre-Deployment Checklist**

- [ ] Billing enabled on Google Cloud project
- [ ] Required APIs enabled
- [ ] MongoDB Atlas cluster created
- [ ] Environment variables updated in `app.yaml`
- [ ] Secret key generated and set
- [ ] Frontend dependencies installed
- [ ] Backend dependencies installed

---

## 🚀 **Deployment Commands**

### **Complete Deployment:**
```bash
# 1. Enable billing and APIs (one-time setup)
gcloud services enable appengine.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# 2. Initialize App Engine (one-time setup)
gcloud app create --region=us-central

# 3. Deploy your application
./deploy-gcp.sh
```

### **Individual Deployments:**
```bash
# Deploy backend only
gcloud app deploy app.yaml

# Deploy frontend only
cd frontend
npm run build
gcloud app deploy app.yaml
```

---

## 🔍 **Post-Deployment**

### **Access Your Application:**
- **Frontend**: https://g1sivesh.appspot.com
- **Backend API**: https://g1sivesh.appspot.com/api
- **API Documentation**: https://g1sivesh.appspot.com/docs

### **Monitor Your Application:**
```bash
# View logs
gcloud app logs tail

# Open in browser
gcloud app browse

# Check status
gcloud app services list
```

---

## 🛠️ **Troubleshooting**

### **Common Issues:**

1. **Billing Not Enabled**
   ```
   ERROR: The project must have a billing account attached.
   ```
   **Solution**: Enable billing in Google Cloud Console

2. **APIs Not Enabled**
   ```
   ERROR: Service not enabled
   ```
   **Solution**: Run `gcloud services enable [SERVICE_NAME]`

3. **Frontend Build Fails**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install --legacy-peer-deps --force
   ```

4. **Database Connection Issues**
   - Verify MongoDB connection string
   - Check network access in MongoDB Atlas
   - Ensure environment variables are set correctly

---

## 💰 **Cost Estimation**

### **App Engine Pricing (Approximate):**
- **Backend**: $0.05-0.50/day (depending on traffic)
- **Frontend**: $0.01-0.10/day (static hosting)
- **Total**: ~$2-20/month for moderate usage

### **Free Tier:**
- App Engine provides free tier for low-traffic applications
- First 28 frontend instance hours free per day
- First 28 backend instance hours free per day

---

## 🎯 **Next Steps After Deployment**

1. **Test Your Application**
   - Verify all endpoints work
   - Test authentication
   - Check database connectivity

2. **Set Up Monitoring**
   - Enable Cloud Monitoring
   - Set up alerts
   - Monitor performance

3. **Configure Custom Domain (Optional)**
   - Add custom domain in App Engine
   - Set up SSL certificates
   - Update CORS origins

4. **Set Up CI/CD (Optional)**
   - Configure Cloud Build
   - Set up automated deployments
   - Implement testing pipeline

---

## 📞 **Support Resources**

- [Google App Engine Documentation](https://cloud.google.com/appengine/docs)
- [Google Cloud Console](https://console.cloud.google.com)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)

---

## ✅ **Ready to Deploy!**

Your Invoice Management System is configured and ready for Google App Engine deployment. 

**Next Step**: Enable billing and run `./deploy-gcp.sh` to deploy your application! 🚀
