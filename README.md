# 🚀 Activus Invoice Management System

A complete invoicing tool built with FastAPI backend and React frontend, featuring PDF processing, BOQ parsing, and comprehensive invoice management.

## ✨ Features

- **PDF Processing**: Extract data from invoices and purchase orders
- **BOQ Parsing**: Parse Bill of Quantities from Excel files
- **Invoice Management**: Create, edit, and manage invoices
- **Project Management**: Track projects and clients
- **User Authentication**: Secure login and user management
- **Reports**: Generate comprehensive reports
- **Smart Search**: Advanced search capabilities
- **Admin Interface**: Complete administrative controls

## 🏗️ Architecture

- **Backend**: FastAPI (Python) with MongoDB
- **Frontend**: React with Tailwind CSS and shadcn/ui
- **Database**: MongoDB with Motor async driver
- **PDF Processing**: Multiple extraction methods (pdfplumber, PyPDF2, pdfminer)

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB (local or Atlas)

### Local Development

1. **Clone and setup**:
   ```bash
   git clone https://github.com/siv3sh/invoice_v2.git
   cd invoice_v2
   ```

2. **Install dependencies**:
   ```bash
   ./build.sh
   # or manually:
   # cd backend && pip install -r requirements.txt
   # cd frontend && yarn install
   ```

3. **Configure environment**:
   ```bash
   # Backend
   cp backend/env.example backend/.env
   # Edit backend/.env with your MongoDB URL
   
   # Frontend
   cp frontend/env.example frontend/.env
   # Edit frontend/.env with backend URL
   ```

4. **Start development servers**:
   ```bash
   ./start.sh
   # or manually:
   # Backend: cd backend && uvicorn server:app --reload
   # Frontend: cd frontend && yarn start
   ```

5. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## 🌐 Deployment

### Render Deployment (Recommended)

**One-Click Deployment**:
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Blueprint"
3. Connect your GitHub repository
4. Set your `MONGO_URL` environment variable
5. Deploy!

**Manual Deployment**:
See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

### Quick Deploy Script
```bash
./deploy.sh
```

## 📁 Project Structure

```
├── backend/                 # FastAPI backend
│   ├── server.py           # Main application
│   ├── requirements.txt    # Python dependencies
│   └── env.example         # Environment variables template
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   └── App.js         # Main app component
│   ├── package.json       # Node dependencies
│   └── env.example        # Environment variables template
├── render.yaml            # Render deployment config
├── DEPLOYMENT.md          # Detailed deployment guide
├── build.sh              # Build script
├── start.sh              # Development start script
└── deploy.sh             # Deployment script
```

## 🔧 Environment Variables

### Backend
- `MONGO_URL`: MongoDB connection string
- `DB_NAME`: Database name
- `ENVIRONMENT`: Environment (development/production)

### Frontend
- `REACT_APP_BACKEND_URL`: Backend API URL

## 📚 API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🧪 Testing

```bash
# Backend tests
cd backend
python -m pytest

# Frontend tests
cd frontend
yarn test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For deployment help, see [DEPLOYMENT.md](./DEPLOYMENT.md)
For issues, please create a GitHub issue.
