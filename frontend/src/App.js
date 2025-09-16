import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Import new components
import ActivityLogs from './components/ActivityLogs';
import ItemMaster from './components/ItemMaster';
import SmartSearch from './components/SmartSearch';
import Reports from './components/Reports';
import PDFProcessor from './components/PDFProcessor';
import AdminInterface from './components/AdminInterface';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Auth Context
const AuthContext = React.createContext();

// Components
const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API}/auth/login`, { email, password });
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      onLogin(response.data.user);
    } catch (error) {
      setError(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Activus Invoice System</h2>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your password"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full text-white py-3 px-4 rounded-lg hover:opacity-90 focus:ring-4 focus:ring-opacity-50 font-medium transition-colors disabled:opacity-50"
            style={{backgroundColor: '#127285', focusRingColor: '#127285'}}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div className="mt-6 text-center text-gray-600">
          <p> </p>
        </div>
      </div>
    </div>
  );
};

const Sidebar = ({ user }) => {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;
  
  const menuItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/projects', icon: '🏗️', label: 'Projects' },
    { path: '/invoices', icon: '🧾', label: 'Invoices' },
    { path: '/clients', icon: '👥', label: 'Clients' },
    { path: '/bank-guarantees', icon: '🏦', label: 'Bank Guarantees' },
    { path: '/item-master', icon: '📋', label: 'Item Master' },
    { path: '/smart-search', icon: '🔍', label: 'Smart Search' },
    { path: '/pdf-processor', icon: '📄', label: 'PDF Processor' },
    { path: '/reports', icon: '📈', label: 'Reports' },
  ];
  
  const adminItems = [
    { path: '/logs', icon: '📝', label: 'Activity Logs' },
    { path: '/users', icon: '👤', label: 'User Management' }, 
    { path: '/admin', icon: '⚙️', label: 'Admin Interface' },
  ];
  
  return (
    <div className="bg-gray-50 w-64 min-h-screen border-r border-gray-200">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">Navigation</h2>
        
        {/* Main Menu Items */}
        <div className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'text-white'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
              style={isActive(item.path) ? { backgroundColor: '#127285' } : {}}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
        
        {/* Admin Menu Items */}
        {user.role === 'super_admin' && (
          <>
            <hr className="my-6 border-gray-300" />
            <h3 className="text-sm font-semibold text-gray-600 mb-4 px-2">ADMIN</h3>
            <div className="space-y-2">
              {adminItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'text-white'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                  style={isActive(item.path) ? { backgroundColor: '#127285' } : {}}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const Navbar = ({ user, onLogout }) => {
  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold" style={{color: '#127285'}}>Activus Invoice System</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Welcome, {user.email}</span>
            <button
              onClick={onLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    projects: [],
    invoices: [],
    clients: [],
    bankGuarantees: [],
    activityLogs: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch all data concurrently
      const [projectsRes, invoicesRes, clientsRes, bgRes, logsRes] = await Promise.all([
        axios.get(`${API}/projects`, { headers }),
        axios.get(`${API}/invoices`, { headers }),
        axios.get(`${API}/clients`, { headers }),
        axios.get(`${API}/bank-guarantees`, { headers }).catch(() => ({ data: [] })),
        axios.get(`${API}/activity-logs`, { headers }).catch(() => ({ data: [] }))
      ]);

      setDashboardData({
        projects: projectsRes.data || [],
        invoices: invoicesRes.data || [],
        clients: clientsRes.data || [],
        bankGuarantees: bgRes.data || [],
        activityLogs: logsRes.data.slice(0, 10) || []
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate analytics
  const analytics = {
    totalProjects: dashboardData.projects.length,
    activeProjects: dashboardData.projects.filter(p => (p.pending_payment || 0) > 0).length,
    completedProjects: dashboardData.projects.filter(p => (p.pending_payment || 0) === 0).length,
    totalProjectValue: dashboardData.projects.reduce((sum, p) => sum + (p.total_project_value || 0), 0),
    totalAdvanceReceived: dashboardData.projects.reduce((sum, p) => sum + (p.advance_received || 0), 0),
    totalPendingPayment: dashboardData.projects.reduce((sum, p) => sum + (p.pending_payment || 0), 0),
    
    totalInvoices: dashboardData.invoices.length,
    proformaInvoices: dashboardData.invoices.filter(i => i.invoice_type === 'proforma').length,
    taxInvoices: dashboardData.invoices.filter(i => i.invoice_type === 'tax_invoice').length,
    totalInvoiceValue: dashboardData.invoices.reduce((sum, i) => sum + (i.total_amount || 0), 0),
    totalGSTAmount: dashboardData.invoices.reduce((sum, i) => sum + (i.total_gst_amount || 0), 0),
    
    totalClients: dashboardData.clients.length,
    activeBankGuarantees: dashboardData.bankGuarantees.filter(bg => {
      const validityDate = new Date(bg.validity_date);
      return validityDate > new Date();
    }).length,
    expiringBankGuarantees: dashboardData.bankGuarantees.filter(bg => {
      const validityDate = new Date(bg.validity_date);
      const thirtyDaysFromNow = new Date(Date.now() + (30 * 24 * 60 * 60 * 1000));
      return validityDate < thirtyDaysFromNow && validityDate > new Date();
    }).length
  };

  // Monthly invoice trends (last 6 months)
  const monthlyTrends = (() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      const monthlyInvoices = dashboardData.invoices.filter(inv => {
        const invDate = new Date(inv.invoice_date);
        return invDate.getMonth() === date.getMonth() && invDate.getFullYear() === date.getFullYear();
      });
      months.push({
        month: monthName,
        count: monthlyInvoices.length,
        value: monthlyInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0)
      });
    }
    return months;
  })();

  if (loading) {
    return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{borderColor: '#127285'}}></div></div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your invoice management system</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right text-sm text-gray-500">
            <div>Last updated</div>
            <div className="font-medium">{new Date().toLocaleString()}</div>
          </div>
          <button 
            onClick={fetchDashboardData}
            className="text-white px-4 py-2 rounded-lg hover:opacity-90 transition-colors"
            style={{backgroundColor: '#127285'}}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"></path>
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">Total Projects</h3>
              <div className="text-3xl font-bold text-gray-900">{analytics.totalProjects}</div>
              <div className="text-sm text-blue-600">{analytics.activeProjects} active, {analytics.completedProjects} completed</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-400 rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">Total Project Value</h3>
              <div className="text-3xl font-bold text-gray-900">₹{(analytics.totalProjectValue / 10000000).toFixed(1)}Cr</div>
              <div className="text-sm text-green-600">Across {analytics.totalClients} clients</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-violet-50 border-l-4 border-purple-400 rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4z" clipRule="evenodd"></path>
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">Total Invoices</h3>
              <div className="text-3xl font-bold text-gray-900">{analytics.totalInvoices}</div>
              <div className="text-sm text-purple-600">{analytics.proformaInvoices} proforma, {analytics.taxInvoices} tax invoices</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-orange-400 rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100">
              <svg className="w-8 h-8 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path>
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">Pending Collections</h3>
              <div className="text-3xl font-bold text-gray-900">₹{(analytics.totalPendingPayment / 100000).toFixed(1)}L</div>
              <div className="text-sm text-orange-600">Collection efficiency: {((analytics.totalAdvanceReceived / analytics.totalProjectValue) * 100).toFixed(1)}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Invoice Trends */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Monthly Invoice Trends</h3>
          <div className="space-y-4">
            {monthlyTrends.map((month, index) => (
              <div key={month.month} className="flex items-center">
                <div className="w-12 text-sm font-medium text-gray-600">{month.month}</div>
                <div className="flex-1 mx-4">
                  <div className="flex items-center">
                    <div 
                      className="h-6 rounded-l"
                      style={{
                        backgroundColor: '#127285',
                        width: `${Math.max((month.value / Math.max(...monthlyTrends.map(m => m.value))) * 100, 5)}%`
                      }}
                    ></div>
                    <div className="ml-2 text-sm font-medium text-gray-700">
                      ₹{(month.value / 100000).toFixed(1)}L ({month.count})
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Overview Pie Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Financial Breakdown</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium">Total Invoice Value</span>
              </div>
              <span className="text-sm font-bold text-blue-700">₹{(analytics.totalInvoiceValue / 100000).toFixed(1)}L</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium">Advance Received</span>
              </div>
              <span className="text-sm font-bold text-green-700">₹{(analytics.totalAdvanceReceived / 100000).toFixed(1)}L</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-purple-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium">GST Amount</span>
              </div>
              <span className="text-sm font-bold text-purple-700">₹{(analytics.totalGSTAmount / 100000).toFixed(1)}L</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-orange-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium">Pending Collections</span>
              </div>
              <span className="text-sm font-bold text-orange-700">₹{(analytics.totalPendingPayment / 100000).toFixed(1)}L</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">⚡ Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button 
              className="p-4 border-2 border-dashed rounded-lg hover:bg-gray-50 transition-colors text-center"
              style={{borderColor: '#127285'}}
              onClick={() => window.location.href = '/projects'}
            >
              <div className="text-2xl mb-2">📁</div>
              <div className="text-sm font-medium" style={{color: '#127285'}}>New Project</div>
            </button>
            <button 
              className="p-4 border-2 border-dashed rounded-lg hover:bg-gray-50 transition-colors text-center"
              style={{borderColor: '#127285'}}
              onClick={() => window.location.href = '/invoices'}
            >
              <div className="text-2xl mb-2">🧾</div>
              <div className="text-sm font-medium" style={{color: '#127285'}}>Create Invoice</div>
            </button>
            <button 
              className="p-4 border-2 border-dashed rounded-lg hover:bg-gray-50 transition-colors text-center"
              style={{borderColor: '#127285'}}
              onClick={() => window.location.href = '/clients'}
            >
              <div className="text-2xl mb-2">👥</div>
              <div className="text-sm font-medium" style={{color: '#127285'}}>Add Client</div>
            </button>
            <button 
              className="p-4 border-2 border-dashed rounded-lg hover:bg-gray-50 transition-colors text-center"
              style={{borderColor: '#127285'}}
              onClick={() => window.location.href = '/bank-guarantees'}
            >
              <div className="text-2xl mb-2">🏦</div>
              <div className="text-sm font-medium" style={{color: '#127285'}}>Bank Guarantee</div>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Recent Activity</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {dashboardData.activityLogs.length > 0 ? (
              dashboardData.activityLogs.map((log, index) => (
                <div key={index} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded">
                  <div className="w-2 h-2 rounded-full mt-2" style={{backgroundColor: '#127285'}}></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {log.action?.replace('_', ' ').toUpperCase()}
                    </div>
                    <div className="text-xs text-gray-500 truncate">{log.description}</div>
                    <div className="text-xs text-gray-400">
                      {new Date(log.timestamp).toLocaleDateString()} by {log.user_email}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                <div className="text-4xl mb-2">📝</div>
                <div>No recent activity</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alerts and Notifications */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🔔 Alerts & Notifications</h3>
        <div className="space-y-3">
          {analytics.expiringBankGuarantees > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                </svg>
                <div>
                  <div className="text-sm font-medium text-yellow-800">Bank Guarantees Expiring Soon</div>
                  <div className="text-xs text-yellow-700">{analytics.expiringBankGuarantees} bank guarantee(s) expiring in the next 30 days</div>
                </div>
              </div>
            </div>
          )}
          
          {analytics.totalPendingPayment > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-orange-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path>
                </svg>
                <div>
                  <div className="text-sm font-medium text-orange-800">Outstanding Payments</div>
                  <div className="text-xs text-orange-700">₹{(analytics.totalPendingPayment / 100000).toFixed(1)}L pending collections across projects</div>
                </div>
              </div>
            </div>
          )}
          
          {analytics.totalProjects === 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                </svg>
                <div>
                  <div className="text-sm font-medium text-blue-800">Welcome to Activus Invoice System</div>
                  <div className="text-xs text-blue-700">Start by creating your first project and uploading BOQ data</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [showBOQModal, setShowBOQModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [boqStatus, setBOQStatus] = useState(null);
  const [partialQuantities, setPartialQuantities] = useState({});
  const [itemGSTRates, setItemGSTRates] = useState({});
  const [invoiceType, setInvoiceType] = useState('proforma');
  const [includeTax, setIncludeTax] = useState(true);
  const [paymentTerms, setPaymentTerms] = useState('Payment due within 30 days from invoice date');
  const [advanceReceived, setAdvanceReceived] = useState(0);
  const [projectInvoices, setProjectInvoices] = useState([]);
  const [expandedProjects, setExpandedProjects] = useState(new Set());
  const [projectDetails, setProjectDetails] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [architectFilter, setArchitectFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editableMetadata, setEditableMetadata] = useState({
    project_name: '',
    client: '',
    architect: '',
    location: ''
  });

  useEffect(() => {
    fetchProjects();
    fetchClients();
  }, []);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Ensure we have valid data
      const validProjects = Array.isArray(response.data) ? response.data : [];
      setProjects(validProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/clients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClients(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setClients([]);
    }
  };

  const fetchBOQStatus = async (projectId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/projects/${projectId}/boq-status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBOQStatus(response.data);
      
      // Initialize partial quantities and GST rates
      const quantities = {};
      const gstRates = {};
      if (response.data && response.data.boq_items) {
        response.data.boq_items.forEach(item => {
          const itemId = item.id || item.serial_number;
          quantities[itemId] = 0; // Start with 0, user will input
          gstRates[itemId] = item.gst_rate || 18.0;
        });
      }
      setPartialQuantities(quantities);
      setItemGSTRates(gstRates);
      
    } catch (error) {
      console.error('Error fetching BOQ status:', error);
      alert('Error loading BOQ billing status');
    }
  };

  const fetchProjectInvoices = async (projectId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/invoices`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const filtered = (response.data || []).filter(inv => inv.project_id === projectId);
      setProjectInvoices(filtered);
    } catch (error) {
      console.error('Error fetching project invoices:', error);
      setProjectInvoices([]);
    }
  };

  const openInvoiceModal = async (project) => {
    setSelectedProject(project);
    await fetchBOQStatus(project.id);
    await fetchProjectInvoices(project.id);
    setShowInvoiceModal(true);
  };

  const toggleProjectExpansion = async (projectId) => {
    const newExpanded = new Set(expandedProjects);
    
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
      // Fetch detailed project data if not already loaded
      if (!projectDetails[projectId]) {
        await fetchProjectDetails(projectId);
      }
    }
    setExpandedProjects(newExpanded);
  };

  const fetchProjectDetails = async (projectId) => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch project invoices
      const invoicesResponse = await axios.get(`${API}/invoices`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const allProjectInvoices = invoicesResponse.data.filter(invoice => invoice.project_id === projectId);
      
      console.log('All project invoices:', allProjectInvoices);
      console.log('Invoice types found:', allProjectInvoices.map(inv => ({ id: inv.id, type: inv.invoice_type, ra: inv.ra_number })));
      
      // Separate Tax invoices (RA invoices) from Proforma invoices
      // Check for multiple possible values
      const taxInvoices = allProjectInvoices.filter(invoice => 
        invoice.invoice_type === 'tax_invoice' || 
        invoice.invoice_type === 'tax' ||
        invoice.ra_number?.startsWith('RA') ||
        (!invoice.invoice_type && invoice.ra_number) // fallback for invoices with RA numbers
      );
      
      const proformaInvoices = allProjectInvoices.filter(invoice => 
        invoice.invoice_type === 'proforma' ||
        (invoice.invoice_type !== 'tax_invoice' && invoice.invoice_type !== 'tax' && !invoice.ra_number?.startsWith('RA'))
      );
      
      console.log('Tax invoices found:', taxInvoices);
      console.log('Proforma invoices found:', proformaInvoices);
      
      // Sort tax invoices by RA number for proper RA1, RA2, RA3 display
      const sortedTaxInvoices = taxInvoices.sort((a, b) => {
        const aNum = parseInt(a.ra_number?.replace('RA', '') || '0');
        const bNum = parseInt(b.ra_number?.replace('RA', '') || '0');
        return aNum - bNum;
      });
      
      // Fetch BOQ status for financial calculations
      const boqResponse = await axios.get(`${API}/projects/${projectId}/boq-status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Calculate summary data only for tax invoices (RA invoices)
      const totalRAInvoiced = taxInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
      const totalRAGST = taxInvoices.reduce((sum, inv) => sum + (inv.total_gst_amount || 0), 0);
      const totalRABasic = totalRAInvoiced - totalRAGST;
      
      // Proforma totals (separate workflow)
      const totalProforma = proformaInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
      
      setProjectDetails(prev => ({
        ...prev,
        [projectId]: {
          taxInvoices: sortedTaxInvoices,
          proformaInvoices: proformaInvoices,
          boqStatus: boqResponse.data,
          summary: {
            totalRAInvoiced,  // Only RA (tax) invoices
            totalRAGST,
            totalRABasic,
            totalProforma,    // Separate proforma total
            raCount: taxInvoices.length,
            proformaCount: proformaInvoices.length
          }
        }
      }));
    } catch (error) {
      console.error('Error fetching project details:', error);
    }
  };

  const handleCreateInvoice = async () => {
    if (!selectedProject || !boqStatus) {
      alert('Please select a project first');
      return;
    }

    // Prepare invoice items from selected BOQ items with partial quantities
    const invoiceItems = (boqStatus.boq_items || [])
      .filter(item => {
        const itemId = item.id || item.serial_number;
        const quantity = partialQuantities[itemId] || 0;
        return quantity > 0 && quantity <= (item.remaining_quantity || 0);
      })
      .map(item => {
        const itemId = item.id || item.serial_number;
        const quantity = partialQuantities[itemId];
        const gstRate = itemGSTRates[itemId] || 18.0;
        const amount = quantity * item.rate;
        const gstAmount = (amount * gstRate) / 100;
        
        return {
          boq_item_id: itemId,
          serial_number: item.serial_number,
          description: item.description,
          unit: item.unit,
          quantity: quantity,
          rate: item.rate,
          amount: amount,
          gst_rate: gstRate,
          gst_amount: gstAmount,
          total_with_gst: amount + gstAmount
        };
      });

    if (invoiceItems.length === 0) {
      alert('Please select items and quantities to bill');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const invoiceData = {
        project_id: selectedProject.id,
        project_name: selectedProject.project_name,
        client_id: selectedProject.client_id,
        client_name: selectedProject.client_name,
        invoice_type: invoiceType,
        include_tax: includeTax,
        payment_terms: paymentTerms,
        advance_received: parseFloat(advanceReceived) || 0,
        items: invoiceItems,
        is_partial: true
      };

      const response = await axios.post(`${API}/invoices`, invoiceData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert(`Invoice ${response.data.ra_number || response.data.invoice_number} created successfully! Billing ${response.data.billing_percentage?.toFixed(1)}% of project.`);
      
      // Refresh project details immediately
      await fetchProjectDetails(selectedProject.id);
      
      setShowInvoiceModal(false);
      setSelectedProject(null);
      setBOQStatus(null);
      setPartialQuantities({});
      setItemGSTRates({});
      setInvoiceType('proforma');
      setIncludeTax(true);
      setPaymentTerms('Payment due within 30 days from invoice date');
      setAdvanceReceived(0);
      fetchProjects(); // Refresh projects list
    } catch (error) {
      console.error('Invoice creation error:', error);
      let errorMessage = 'Unknown error occurred';
      
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert('Error creating invoice: ' + errorMessage);
    }
  };

  const updatePartialQuantity = (itemId, quantity) => {
    setPartialQuantities(prev => ({
      ...prev,
      [itemId]: parseFloat(quantity) || 0
    }));
  };

  const updateGSTRate = (itemId, rate) => {
    setItemGSTRates(prev => ({
      ...prev,
      [itemId]: parseFloat(rate) || 18.0
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API}/upload-boq`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setParsedData(response.data);
      
      // Initialize editable metadata with parsed data
      const metadata = response.data?.metadata || {};
      setEditableMetadata({
        project_name: metadata.project_name || '',
        client: metadata.client || '',
        architect: metadata.architect || '',
        location: metadata.location || ''
      });
      
      setShowBOQModal(true);
    } catch (error) {
      alert('Error uploading file: ' + (error.response?.data?.detail || error.message));
    }
  };

  const createProjectFromBOQ = async () => {
    if (!parsedData) return;

    // Validate required fields
    if (!editableMetadata.project_name || !editableMetadata.client || !editableMetadata.architect) {
      alert('Please fill in all required fields: Project Name, Client, and Architect');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Create client if new
      let clientId = null;
      const clientName = editableMetadata.client;
      
      // Check if client exists
      let existingClient = clients.find(c => c.name && c.name.toLowerCase() === clientName.toLowerCase());
      
      if (!existingClient) {
        const clientData = {
          name: clientName,
          bill_to_address: editableMetadata.location || 'Address to be updated',
          gst_no: ''
        };
        
        const clientResponse = await axios.post(`${API}/clients`, clientData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        clientId = clientResponse.data.client_id;
      } else {
        clientId = existingClient.id;
      }

      // Create project with validated data
      const projectData = {
        project_name: editableMetadata.project_name,
        architect: editableMetadata.architect,
        client_id: clientId,
        client_name: clientName,
        metadata: {
          ...editableMetadata,
          date: new Date().toISOString()
        },
        boq_items: parsedData?.items || [],
        total_project_value: parsedData?.total_value || 0,
        advance_received: 0
      };

      await axios.post(`${API}/projects`, projectData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Project created successfully!');
      setShowBOQModal(false);
      setParsedData(null);
      setEditableMetadata({ project_name: '', client: '', architect: '', location: '' });
      fetchProjects();
    } catch (error) {
      console.error('Project creation error:', error);
      let errorMessage = 'Unknown error occurred';
      
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert('Error creating project: ' + errorMessage);
    }
  };

  // Filter and search logic
  const filteredProjects = projects.filter(project => {
    if (!project || !project.id) return false;
    
    const matchesSearch = !searchTerm || 
      project.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.architect?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesArchitect = !architectFilter || 
      project.architect?.toLowerCase().includes(architectFilter.toLowerCase());
    
    const matchesDate = !dateFilter || (() => {
      const projectDate = new Date(project.created_at);
      const filterDate = new Date(dateFilter);
      return projectDate >= filterDate;
    })();
    
    const matchesStatus = !statusFilter || statusFilter === 'all' || (() => {
      if (statusFilter === 'active') return (project.pending_payment || 0) > 0;
      if (statusFilter === 'completed') return (project.pending_payment || 0) === 0;
      return true;
    })();
    
    return matchesSearch && matchesArchitect && matchesDate && matchesStatus;
  });

  // Get unique architects for filter dropdown
  const uniqueArchitects = [...new Set(projects.map(p => p.architect).filter(Boolean))];

  if (loading) return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
        <div className="flex space-x-4">
          <label className="text-white px-4 py-2 rounded-lg hover:opacity-90 cursor-pointer transition-colors" style={{backgroundColor: '#127285'}}>
            Upload BOQ Excel
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Projects</label>
            <input
              type="text"
              placeholder="Search by project, client, or architect..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Architect</label>
            <select
              value={architectFilter}
              onChange={(e) => setArchitectFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">All Architects</option>
              {uniqueArchitects.map(architect => (
                <option key={architect} value={architect}>{architect}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">All Projects</option>
              <option value="active">Active (Pending Payment)</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
        
        {(searchTerm || architectFilter || dateFilter || statusFilter) && (
          <div className="mt-3 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {filteredProjects.length} of {projects.length} projects
            </div>
            <button
              onClick={() => {
                setSearchTerm('');
                setArchitectFilter('');
                setDateFilter('');
                setStatusFilter('');
              }}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Project Summary Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"></path>
              </svg>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-blue-600">Total Projects</div>
              <div className="text-2xl font-bold text-blue-900">{filteredProjects.length}</div>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
              </svg>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-green-600">Total Project Value</div>
              <div className="text-2xl font-bold text-green-900">
                ₹{filteredProjects.reduce((sum, p) => sum + (p.total_project_value || 0), 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
              </svg>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-purple-600">Total Received</div>
              <div className="text-2xl font-bold text-purple-900">
                ₹{filteredProjects.reduce((sum, p) => sum + (p.advance_received || 0), 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path>
              </svg>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-orange-600">Pending Amount</div>
              <div className="text-2xl font-bold text-orange-900">
                ₹{filteredProjects.reduce((sum, p) => sum + (p.pending_payment || 0), 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8"></th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project Details</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Financial Summary</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProjects.map((project) => (
              <React.Fragment key={project.id}>
                {/* Main Project Row */}
                <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleProjectExpansion(project.id)}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-gray-400 hover:text-gray-600">
                      {expandedProjects.has(project.id) ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <div className="text-sm font-semibold text-gray-900 break-words">{project.project_name || 'Untitled Project'}</div>
                      <div className="text-xs text-gray-500 break-words">{project.client_name || 'Unknown Client'}</div>
                      <div className="text-xs text-gray-500 break-words">Architect: {project.architect || 'Unknown'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-1">
                      <div className="text-sm font-semibold text-gray-900">₹{(project.total_project_value || 0).toLocaleString()}</div>
                      <div className="text-xs text-green-600">Advance: ₹{(project.advance_received || 0).toLocaleString()}</div>
                      <div className="text-xs text-orange-600">Pending: ₹{(project.pending_payment || 0).toLocaleString()}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                      <div className="text-xs text-gray-500 mt-1">{project.created_at ? new Date(project.created_at).toLocaleDateString() : 'N/A'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openInvoiceModal(project)}
                        className="text-white hover:opacity-90 px-3 py-1 rounded-md text-xs transition-colors"
                        style={{backgroundColor: '#127285'}}
                      >
                        Create Invoice
                      </button>
                      <button
                        onClick={() => {
                          setInvoiceType('proforma');
                          openInvoiceModal(project);
                        }}
                        className="text-white hover:opacity-90 px-3 py-1 rounded-md text-xs transition-colors"
                        style={{backgroundColor: '#9333ea'}}
                      >
                        Create Proforma
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Expanded Project Details Row */}
                {expandedProjects.has(project.id) && (
                  <tr className="bg-gray-50">
                    <td colSpan="5" className="px-6 py-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Financial Summary */}
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <h4 className="font-semibold text-gray-900 mb-3">📊 Financial Summary</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Total Project Value:</span>
                              <div className="font-bold text-lg text-green-600">₹{(project.total_project_value || 0).toLocaleString()}</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Advance Received:</span>
                              <div className="font-bold text-lg text-blue-600">₹{(project.advance_received || 0).toLocaleString()}</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Balance Invoiceable:</span>
                              <div className="font-bold text-lg text-orange-600">
                                ₹{((project.total_project_value || 0) - (projectDetails[project.id]?.summary?.totalRAInvoiced || 0)).toLocaleString()}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-600">Total RA GST:</span>
                              <div className="font-bold text-lg text-purple-600">
                                ₹{(projectDetails[project.id]?.summary?.totalRAGST || 0).toLocaleString()}
                              </div>
                            </div>
                            <div className="col-span-2 border-t pt-2 mt-2">
                              <span className="text-gray-600">RA Total (Tax Invoices):</span>
                              <div className="font-bold text-xl text-gray-900">
                                ₹{(projectDetails[project.id]?.summary?.totalRAInvoiced || 0).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Two Column Layout for Invoice Types */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {/* Tax Invoices (RA Bills) */}
                          <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-500">
                            <h4 className="font-semibold text-blue-900 mb-3">🧾 RA Bills (Tax Invoices)</h4>
                            <div className="max-h-48 overflow-y-auto">
                              {projectDetails[project.id]?.taxInvoices?.length > 0 ? (
                                <div className="space-y-2">
                                  {projectDetails[project.id].taxInvoices.map((invoice, index) => (
                                    <div key={invoice.id} className="border rounded-lg p-3 text-sm bg-blue-50">
                                      <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                          <div className="font-semibold text-blue-700">
                                            {invoice.ra_number || `RA${index + 1}`}
                                          </div>
                                          <div className="text-gray-700">₹{(invoice.total_amount || 0).toLocaleString()}</div>
                                          <div className="text-xs text-gray-600">
                                            Tax Invoice • {invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString() : 'N/A'}
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                            invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                                            invoice.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                                            'bg-yellow-100 text-yellow-800'
                                          }`}>
                                            {invoice.status || 'Pending'}
                                          </span>
                                          <div className="mt-1">
                                            <span className="text-xs text-green-600">✓ GST Applied</span>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="mt-2 flex space-x-1">
                                        <button
                                          onClick={() => window.open(`${API}/invoices/${invoice.id}/pdf`, '_blank')}
                                          className="text-xs text-blue-600 hover:text-blue-800 bg-blue-100 px-2 py-1 rounded"
                                        >
                                          📄 View
                                        </button>
                                        <button
                                          onClick={() => {
                                            const link = document.createElement('a');
                                            link.href = `${API}/invoices/${invoice.id}/pdf`;
                                            link.download = `${invoice.ra_number || invoice.invoice_number}.pdf`;
                                            link.click();
                                          }}
                                          className="text-xs text-green-600 hover:text-green-800 bg-green-100 px-2 py-1 rounded"
                                        >
                                          ⬇️ Download
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center text-gray-500 py-6">
                                  <div className="text-2xl mb-2">📋</div>
                                  <div className="font-medium">No RA Bills yet</div>
                                  <div className="text-xs mt-1">Click "Create Invoice" to start RA1</div>
                                </div>
                              )}
                            </div>
                            <div className="mt-3 pt-3 border-t">
                              <div className="text-xs text-gray-600">
                                Total RA Bills: <span className="font-medium">{projectDetails[project.id]?.summary?.raCount || 0}</span> • 
                                Value: <span className="font-medium">₹{(projectDetails[project.id]?.summary?.totalRAInvoiced || 0).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>

                          {/* Proforma Invoices */}
                          <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-purple-500">
                            <h4 className="font-semibold text-purple-900 mb-3">📄 Proforma Invoices</h4>
                            <div className="max-h-48 overflow-y-auto">
                              {projectDetails[project.id]?.proformaInvoices?.length > 0 ? (
                                <div className="space-y-2">
                                  {projectDetails[project.id].proformaInvoices.map((invoice, index) => (
                                    <div key={invoice.id} className="border rounded-lg p-3 text-sm bg-purple-50">
                                      <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                          <div className="font-semibold text-purple-700">
                                            {invoice.invoice_number || `PF${index + 1}`}
                                          </div>
                                          <div className="text-gray-700">₹{(invoice.total_amount || 0).toLocaleString()}</div>
                                          <div className="text-xs text-gray-600">
                                            Proforma • {invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString() : 'N/A'}
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                            {invoice.status || 'Draft'}
                                          </span>
                                          <div className="mt-1">
                                            <span className="text-xs text-gray-500">Estimate</span>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="mt-2 flex space-x-1">
                                        <button
                                          onClick={() => window.open(`${API}/invoices/${invoice.id}/pdf`, '_blank')}
                                          className="text-xs text-purple-600 hover:text-purple-800 bg-purple-100 px-2 py-1 rounded"
                                        >
                                          📄 View
                                        </button>
                                        <button
                                          onClick={() => {
                                            const link = document.createElement('a');
                                            link.href = `${API}/invoices/${invoice.id}/pdf`;
                                            link.download = `${invoice.invoice_number}.pdf`;
                                            link.click();
                                          }}
                                          className="text-xs text-green-600 hover:text-green-800 bg-green-100 px-2 py-1 rounded"
                                        >
                                          ⬇️ Download
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center text-gray-500 py-6">
                                  <div className="text-2xl mb-2">📄</div>
                                  <div className="font-medium">No Proforma Invoices</div>
                                  <div className="text-xs mt-1">Click "Create Proforma" for estimates</div>
                                </div>
                              )}
                            </div>
                            <div className="mt-3 pt-3 border-t">
                              <div className="text-xs text-gray-600">
                                Total Proforma: <span className="font-medium">{projectDetails[project.id]?.summary?.proformaCount || 0}</span> • 
                                Value: <span className="font-medium">₹{(projectDetails[project.id]?.summary?.totalProforma || 0).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Enhanced Invoice Creation Modal */}
      {showInvoiceModal && selectedProject && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowInvoiceModal(false);
          }
        }}>
          <div className="relative top-5 mx-auto p-5 border w-11/12 max-w-7xl shadow-lg rounded-md bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Create Invoice for: {selectedProject.project_name}
                </h3>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              
              {/* Project Summary */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Client:</span>
                    <div className="font-semibold">{selectedProject.client_name}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Architect:</span>
                    <div className="font-semibold">{selectedProject.architect}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Project Value:</span>
                    <div className="font-semibold">₹{selectedProject.total_project_value?.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Invoice Type:</span>
                    <select
                      value={invoiceType}
                      onChange={(e) => setInvoiceType(e.target.value)}
                      className="mt-1 px-2 py-1 border border-gray-300 rounded text-sm font-semibold"
                    >
                      <option value="proforma">Proforma Invoice</option>
                      <option value="tax_invoice">Tax Invoice</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Invoice Configuration */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-blue-900 mb-3">Invoice Configuration</h4>
                <div className="grid grid-cols-3 gap-4">
                  {/* Tax Option for Proforma */}
                  {invoiceType === 'proforma' && (
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-2">
                        Tax Option
                      </label>
                      <select
                        value={includeTax}
                        onChange={(e) => setIncludeTax(e.target.value === 'true')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="true">With Tax</option>
                        <option value="false">Without Tax</option>
                      </select>
                    </div>
                  )}
                  
                  {/* Payment Terms */}
                  <div className={invoiceType === 'proforma' ? '' : 'col-span-2'}>
                    <label className="block text-sm font-medium text-blue-700 mb-2">
                      Payment Terms
                    </label>
                    <input
                      type="text"
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Payment due within 30 days from invoice date"
                    />
                  </div>
                  
                  {/* Advance Received */}
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-2">
                      Advance Received (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={advanceReceived}
                      onChange={(e) => setAdvanceReceived(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                    />
                  </div>
                </div>
                
                {/* Tax Option Note */}
                {invoiceType === 'proforma' && !includeTax && (
                  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                    <strong>Note:</strong> Proforma invoice will be generated without tax calculations.
                  </div>
                )}
              </div>

              {boqStatus && (
                <>
                  {/* Billing Status Summary */}
                  <div className="bg-blue-50 p-4 rounded-lg mb-6">
                    <h4 className="font-semibold text-blue-900 mb-3">Project Billing Status</h4>
                    <div className="grid grid-cols-5 gap-4 text-sm">
                      <div>
                        <span className="text-blue-600">Next RA:</span>
                        <div className="font-bold text-lg text-blue-800">{boqStatus.next_ra_number}</div>
                      </div>
                      <div>
                        <span className="text-blue-600">Total Billed:</span>
                        <div className="font-bold">₹{boqStatus.total_billed_value?.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-blue-600">Remaining:</span>
                        <div className="font-bold text-green-600">₹{boqStatus.remaining_value?.toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-blue-600">Project Completed:</span>
                        <div className="font-bold">{boqStatus.project_billing_percentage?.toFixed(1)}%</div>
                      </div>
                      <div>
                        <span className="text-blue-600">Previous Invoices:</span>
                        <div className="font-bold">{boqStatus.total_invoices}</div>
                      </div>
                    </div>
                  </div>

                  {/* Previous Invoices */}
                  {projectInvoices.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold mb-2 text-gray-800">Previous Invoices:</h4>
                      <div className="bg-yellow-50 p-3 rounded border text-sm">
                        {projectInvoices.map((inv, idx) => (
                          <span key={inv.id} className="inline-block mr-4 mb-1">
                            <strong>{inv.ra_number}:</strong> ₹{inv.total_amount?.toLocaleString()} 
                            ({inv.invoice_type}) - {inv.status}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* BOQ Items Table */}
                  <div className="mb-6">
                    <h4 className="font-semibold mb-3 text-gray-800">
                      BOQ Items - Select Quantities to Bill in {boqStatus.next_ra_number}:
                    </h4>
                    <div className="max-h-96 overflow-y-auto border rounded-lg bg-white">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-100 sticky top-0">
                          <tr>
                            <th className="px-3 py-3 text-left font-medium">Item</th>
                            <th className="px-3 py-3 text-left font-medium">Unit</th>
                            <th className="px-3 py-3 text-center font-medium">Original Qty</th>
                            <th className="px-3 py-3 text-center font-medium">Billed</th>
                            <th className="px-3 py-3 text-center font-medium">Remaining</th>
                            <th className="px-3 py-3 text-right font-medium">Rate (₹)</th>
                            <th className="px-3 py-3 text-center font-medium">Bill Qty</th>
                            <th className="px-3 py-3 text-center font-medium">GST %</th>
                            <th className="px-3 py-3 text-right font-medium">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {boqStatus.boq_items.map((item, index) => {
                            const itemId = item.id || item.serial_number;
                            const billQty = partialQuantities[itemId] || 0;
                            const gstRate = itemGSTRates[itemId] || 18.0;
                            const amount = billQty * item.rate;
                            const gstAmount = (amount * gstRate) / 100;
                            const totalAmount = amount + gstAmount;
                            const canBill = item.remaining_quantity > 0;
                            
                            return (
                              <tr key={itemId} className={`border-t ${
                                index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                              } ${!canBill ? 'opacity-50' : ''}`}>
                                <td className="px-3 py-3">
                                  <div className="font-medium text-gray-900">{item.description}</div>
                                  <div className="text-xs text-gray-500">#{item.serial_number}</div>
                                  {!canBill && <div className="text-xs text-red-500 font-medium">Fully Billed</div>}
                                </td>
                                <td className="px-3 py-3 text-center">{item.unit}</td>
                                <td className="px-3 py-3 text-center font-medium">{item.quantity}</td>
                                <td className="px-3 py-3 text-center text-red-600 font-medium">
                                  {item.billed_quantity}
                                </td>
                                <td className="px-3 py-3 text-center text-green-600 font-bold">
                                  {item.remaining_quantity}
                                </td>
                                <td className="px-3 py-3 text-right">₹{item.rate.toLocaleString()}</td>
                                <td className="px-3 py-3 text-center">
                                  <input
                                    type="number"
                                    min="0"
                                    max={item.remaining_quantity}
                                    step="0.01"
                                    value={billQty}
                                    onChange={(e) => updatePartialQuantity(itemId, e.target.value)}
                                    className="w-20 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="0"
                                    disabled={!canBill}
                                  />
                                </td>
                                <td className="px-3 py-3 text-center">
                                  <select
                                    value={gstRate}
                                    onChange={(e) => updateGSTRate(itemId, e.target.value)}
                                    className={`w-20 px-2 py-1 border rounded text-center text-sm ${
                                      boqStatus.total_invoices > 0 ? 'bg-gray-100 text-gray-600 cursor-not-allowed' : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                    }`}
                                    disabled={boqStatus.total_invoices > 0 || !canBill}
                                    title={boqStatus.total_invoices > 0 ? 'GST locked for RA2+ invoices' : 'Select GST rate for RA1'}
                                  >
                                    <option value="0">0%</option>
                                    <option value="5">5%</option>
                                    <option value="12">12%</option>
                                    <option value="18">18%</option>
                                    <option value="28">28%</option>
                                  </select>
                                </td>
                                <td className="px-3 py-3 text-right">
                                  {billQty > 0 && (
                                    <div>
                                      <div className="font-bold text-gray-900">₹{totalAmount.toLocaleString()}</div>
                                      <div className="text-xs text-gray-500">
                                        Base: ₹{amount.toLocaleString()}<br/>
                                        GST: ₹{gstAmount.toLocaleString()}
                                      </div>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    
                    {boqStatus.total_invoices > 0 && (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                        <strong>RA{boqStatus.total_invoices + 1} Note:</strong> GST rates are locked to match previous invoices for consistency. Only new/unbilled items allow GST editing.
                      </div>
                    )}
                  </div>

                  {/* Enhanced Invoice Breakdown */}
                  {Object.values(partialQuantities).some(qty => qty > 0) && (
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg mb-4 border-2 border-green-200">
                      <h4 className="font-bold text-green-900 mb-4 text-lg">📊 Invoice Breakdown ({boqStatus.next_ra_number})</h4>
                      
                      {/* Main Financial Summary */}
                      <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                        <div className="grid grid-cols-3 gap-6 text-center">
                          <div className="border-r border-gray-200">
                            <div className="text-sm text-gray-600 mb-1">Basic Amount</div>
                            <div className="text-2xl font-bold text-blue-600">
                              ₹{boqStatus.boq_items.reduce((sum, item) => {
                                const itemId = item.id || item.serial_number;
                                const qty = partialQuantities[itemId] || 0;
                                return sum + (qty * item.rate);
                              }, 0).toLocaleString()}
                            </div>
                          </div>
                          
                          <div className="border-r border-gray-200">
                            <div className="text-sm text-gray-600 mb-1">Total GST Amount</div>
                            <div className="text-2xl font-bold text-purple-600">
                              {(invoiceType === 'proforma' && !includeTax) ? (
                                <span className="text-gray-400">₹0 (No Tax)</span>
                              ) : (
                                <>₹{boqStatus.boq_items.reduce((sum, item) => {
                                  const itemId = item.id || item.serial_number;
                                  const qty = partialQuantities[itemId] || 0;
                                  const gstRate = itemGSTRates[itemId] || 18.0;
                                  const amount = qty * item.rate;
                                  const gstAmount = (amount * gstRate) / 100;
                                  return sum + gstAmount;
                                }, 0).toLocaleString()}</>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-sm text-gray-600 mb-1">Grand Total</div>
                            <div className="text-3xl font-bold text-green-600">
                              ₹{boqStatus.boq_items.reduce((sum, item) => {
                                const itemId = item.id || item.serial_number;
                                const qty = partialQuantities[itemId] || 0;
                                const gstRate = itemGSTRates[itemId] || 18.0;
                                const amount = qty * item.rate;
                                const gstAmount = (invoiceType === 'proforma' && !includeTax) ? 0 : (amount * gstRate) / 100;
                                return sum + amount + gstAmount;
                              }, 0).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        
                        {/* Formula Display */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="text-center text-sm text-gray-600">
                            <span className="inline-flex items-center space-x-2">
                              <span className="font-semibold text-blue-600">Basic Amount</span>
                              <span>+</span>
                              <span className="font-semibold text-purple-600">GST Amount</span>
                              <span>=</span>
                              <span className="font-bold text-green-600">Grand Total</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Additional Details */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-white rounded p-3">
                          <span className="text-gray-600">Items Selected:</span>
                          <div className="font-bold text-lg text-gray-900">
                            {Object.values(partialQuantities).filter(qty => qty > 0).length} items
                          </div>
                        </div>
                        <div className="bg-white rounded p-3">
                          <span className="text-gray-600">RA Number:</span>
                          <div className="font-bold text-lg text-blue-600">{boqStatus.next_ra_number}</div>
                        </div>
                      </div>
                      
                      {/* Additional Invoice Details */}
                      {(parseFloat(advanceReceived) > 0 || paymentTerms !== 'Payment due within 30 days from invoice date') && (
                        <div className="mt-4 pt-4 border-t border-gray-300">
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            {parseFloat(advanceReceived) > 0 && (
                              <>
                                <div className="bg-white rounded p-3">
                                  <span className="text-orange-600">Advance Received:</span>
                                  <div className="font-bold text-lg text-orange-700">₹{parseFloat(advanceReceived).toLocaleString()}</div>
                                </div>
                                <div className="bg-white rounded p-3">
                                  <span className="text-red-600">Net Amount Due:</span>
                                  <div className="font-bold text-lg text-red-700">
                                    ₹{Math.max(0, boqStatus.boq_items.reduce((sum, item) => {
                                      const itemId = item.id || item.serial_number;
                                      const qty = partialQuantities[itemId] || 0;
                                      const gstRate = itemGSTRates[itemId] || 18.0;
                                      const amount = qty * item.rate;
                                      const gstAmount = (invoiceType === 'proforma' && !includeTax) ? 0 : (amount * gstRate) / 100;
                                      return sum + amount + gstAmount;
                                    }, 0) - parseFloat(advanceReceived)).toLocaleString()}
                                  </div>
                                </div>
                              </>
                            )}
                            {paymentTerms !== 'Payment due within 30 days from invoice date' && (
                              <div className={`bg-white rounded p-3 ${parseFloat(advanceReceived) > 0 ? '' : 'col-span-2'}`}>
                                <span className="text-blue-600">Payment Terms:</span>
                                <div className="font-medium text-xs text-gray-700 break-words">{paymentTerms}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-4 border-t">
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateInvoice}
                  disabled={!boqStatus || Object.values(partialQuantities).every(qty => qty === 0)}
                  className={`px-6 py-2 rounded-lg font-medium text-white ${
                    boqStatus && Object.values(partialQuantities).some(qty => qty > 0)
                      ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  Create {boqStatus?.next_ra_number} Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BOQ Review Modal */}
      {showBOQModal && parsedData && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Review BOQ Data</h3>
              
              <div className="mb-6">
                <h4 className="font-semibold mb-4">Project Information (Edit if needed):</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Name *
                    </label>
                    <input
                      type="text"
                      value={editableMetadata.project_name}
                      onChange={(e) => setEditableMetadata({...editableMetadata, project_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter project name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client Name *
                    </label>
                    <input
                      type="text"
                      value={editableMetadata.client}
                      onChange={(e) => setEditableMetadata({...editableMetadata, client: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter client name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Architect *
                    </label>
                    <input
                      type="text"
                      value={editableMetadata.architect}
                      onChange={(e) => setEditableMetadata({...editableMetadata, architect: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter architect name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={editableMetadata.location}
                      onChange={(e) => setEditableMetadata({...editableMetadata, location: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter project location"
                    />
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Total Project Value:</strong> ₹{parsedData.total_value?.toLocaleString()}
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    Fields marked with * are required. Auto-filled data from Excel can be edited above.
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold mb-2">BOQ Items ({parsedData?.items?.length || 0}):</h4>
                <div className="max-h-64 overflow-y-auto border rounded">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Description</th>
                        <th className="px-4 py-2 text-left">Unit</th>
                        <th className="px-4 py-2 text-left">Qty</th>
                        <th className="px-4 py-2 text-left">Rate</th>
                        <th className="px-4 py-2 text-left">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(parsedData?.items || []).slice(0, 10).map((item, index) => (
                        <tr key={index} className="border-t">
                          <td className="px-4 py-2 text-wrap">{item.description}</td>
                          <td className="px-4 py-2 font-medium text-blue-600">{item.unit}</td>
                          <td className="px-4 py-2">{item.quantity}</td>
                          <td className="px-4 py-2">₹{item.rate}</td>
                          <td className="px-4 py-2">₹{item.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {(parsedData?.items?.length || 0) > 10 && (
                    <div className="p-2 text-center text-gray-500">
                      ... and {(parsedData?.items?.length || 0) - 10} more items
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowBOQModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={createProjectFromBOQ}
                  disabled={!editableMetadata.project_name || !editableMetadata.client || !editableMetadata.architect}
                  className={`px-6 py-2 rounded font-medium ${
                    editableMetadata.project_name && editableMetadata.client && editableMetadata.architect
                      ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Create Project
                  {(!editableMetadata.project_name || !editableMetadata.client || !editableMetadata.architect) && 
                    <span className="ml-2 text-xs">(Fill required fields)</span>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');
  const [invoiceType, setInvoiceType] = useState('proforma');
  const [selectedItems, setSelectedItems] = useState([]);
  const [boqStatus, setBOQStatus] = useState(null);
  const [partialQuantities, setPartialQuantities] = useState({});
  const [itemGSTRates, setItemGSTRates] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    fetchInvoices();
    fetchProjects();
    fetchClients();
  }, []);

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/invoices`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInvoices(response.data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/clients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClients(response.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchBOQStatus = async (projectId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/projects/${projectId}/boq-status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBOQStatus(response.data);
      
      // Initialize partial quantities and GST rates
      const quantities = {};
      const gstRates = {};
      response.data.boq_items.forEach(item => {
        const itemId = item.id || item.serial_number;
        quantities[itemId] = item.remaining_quantity || 0;
        gstRates[itemId] = item.gst_rate || 18.0;
      });
      setPartialQuantities(quantities);
      setItemGSTRates(gstRates);
      
    } catch (error) {
      console.error('Error fetching BOQ status:', error);
      alert('Error loading BOQ billing status');
    }
  };

  const handleCreateInvoice = async () => {
    if (!selectedProject || !boqStatus) {
      alert('Please select a project first');
      return;
    }

    // Prepare invoice items from selected BOQ items with partial quantities
    const invoiceItems = boqStatus.boq_items
      .filter(item => {
        const itemId = item.id || item.serial_number;
        const quantity = partialQuantities[itemId] || 0;
        return quantity > 0 && quantity <= item.remaining_quantity;
      })
      .map(item => {
        const itemId = item.id || item.serial_number;
        const quantity = partialQuantities[itemId];
        const gstRate = itemGSTRates[itemId] || 18.0;
        const amount = quantity * item.rate;
        const gstAmount = (amount * gstRate) / 100;
        
        return {
          boq_item_id: itemId,
          serial_number: item.serial_number,
          description: item.description,
          unit: item.unit,
          quantity: quantity,
          rate: item.rate,
          amount: amount,
          gst_rate: gstRate,
          gst_amount: gstAmount,
          total_with_gst: amount + gstAmount
        };
      });

    if (invoiceItems.length === 0) {
      alert('Please select items and quantities to bill');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const project = projects.find(p => p.id === selectedProject);
      
      const invoiceData = {
        project_id: selectedProject,
        project_name: project.project_name,
        client_id: project.client_id,
        client_name: project.client_name,
        invoice_type: invoiceType,
        items: invoiceItems,
        is_partial: true
      };

      const response = await axios.post(`${API}/invoices`, invoiceData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert(`Invoice ${response.data.ra_number} created successfully! Billing ${response.data.billing_percentage?.toFixed(1)}% of project.`);
      setShowModal(false);
      setSelectedProject('');
      setBOQStatus(null);
      setPartialQuantities({});
      setItemGSTRates({});
      setInvoiceType('proforma');
      fetchInvoices();
    } catch (error) {
      console.error('Invoice creation error:', error);
      let errorMessage = 'Unknown error occurred';
      
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert('Error creating invoice: ' + errorMessage);
    }
  };

  const handleProjectChange = async (projectId) => {
    setSelectedProject(projectId);
    if (projectId) {
      await fetchBOQStatus(projectId);
    } else {
      setBOQStatus(null);
      setPartialQuantities({});
      setItemGSTRates({});
    }
  };

  const updatePartialQuantity = (itemId, quantity) => {
    setPartialQuantities(prev => ({
      ...prev,
      [itemId]: parseFloat(quantity) || 0
    }));
  };

  const updateGSTRate = (itemId, rate) => {
    setItemGSTRates(prev => ({
      ...prev,
      [itemId]: parseFloat(rate) || 18.0
    }));
  };

  const downloadPDF = async (invoiceId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/invoices/${invoiceId}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Error downloading PDF: ' + error.message);
    }
  };

  const handleDownloadInvoice = async (invoiceId, invoiceNumber) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API}/invoices/${invoiceId}/pdf`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/pdf'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to download PDF: ${response.status}`);
      }

      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error('Empty PDF received');
      }

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice_${invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      alert(`Invoice ${invoiceNumber} downloaded successfully!`);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error downloading PDF: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintInvoice = async (invoiceId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API}/invoices/${invoiceId}/pdf`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/pdf'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load PDF for printing: ${response.status}`);
      }

      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error('Empty PDF received');
      }

      // Create object URL and open for printing
      const url = URL.createObjectURL(blob);
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          setTimeout(() => printWindow.print(), 500);
        };
      } else {
        alert('Please allow popups to print PDFs');
      }
      
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) {
      console.error('Error printing invoice:', error);
      alert('Error printing invoice: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewInvoice = async (invoiceId, invoiceNumber) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API}/invoices/${invoiceId}/pdf`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/pdf'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load PDF: ${response.status}`);
      }

      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error('Empty PDF received');
      }

      // Create object URL and open in new tab
      const url = URL.createObjectURL(blob);
      const newWindow = window.open();
      if (newWindow) {
        newWindow.location.href = url;
      } else {
        alert('Please allow popups to view PDFs');
      }
      
      // Clean up after 1 minute
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) {
      console.error('Error viewing PDF:', error);
      alert('Error viewing PDF: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter and search logic for invoices
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = !searchTerm || 
      invoice.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.ra_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.client_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !typeFilter || (() => {
      if (typeFilter === 'tax') return invoice.invoice_type === 'tax_invoice' || invoice.ra_number?.startsWith('RA');
      if (typeFilter === 'proforma') return invoice.invoice_type === 'proforma';
      return true;
    })();
    
    const matchesProject = !projectFilter || invoice.project_id === projectFilter;
    
    const matchesStatus = !statusFilter || invoice.status === statusFilter;
    
    const matchesDate = !dateFilter || (() => {
      const invoiceDate = new Date(invoice.invoice_date);
      const filterDate = new Date(dateFilter);
      return invoiceDate >= filterDate;
    })();
    
    return matchesSearch && matchesType && matchesProject && matchesStatus && matchesDate;
  });

  if (loading) return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-900">Invoices Management v2.0</h2>
          {loading && (
            <div className="flex items-center text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <span className="text-sm">Processing PDF...</span>
            </div>
          )}
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Partial Invoice
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Invoices</label>
            <input
              type="text"
              placeholder="Search by invoice #, project, client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">All Types</option>
              <option value="tax">Tax Invoices (RA Bills)</option>
              <option value="proforma">Proforma Invoices</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">All Projects</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.project_name} - {project.client_name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="approved">Approved</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>
        
        {(searchTerm || typeFilter || projectFilter || statusFilter || dateFilter) && (
          <div className="mt-3 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {filteredInvoices.length} of {invoices.length} invoices
            </div>
            <button
              onClick={() => {
                setSearchTerm('');
                setTypeFilter('');
                setProjectFilter('');
                setStatusFilter('');
                setDateFilter('');
              }}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice # / RA#</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">🎯 TYPE</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">💰 AMOUNT & ACTIONS</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredInvoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{invoice.invoice_number}</div>
                  <div className="text-sm text-blue-600 font-semibold">{invoice.ra_number}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{invoice.project_name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{invoice.client_name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    invoice.invoice_type === 'tax_invoice' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {invoice.invoice_type === 'tax_invoice' ? 'Tax Invoice' : 'Proforma'}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center justify-between min-w-0">
                    <div className="text-sm font-medium text-gray-900 mr-2">
                      ₹{invoice.total_amount.toLocaleString()}
                    </div>
                    <div className="flex space-x-1 flex-shrink-0">
                      <button
                        onClick={() => handleViewInvoice(invoice.id, invoice.invoice_number)}
                        disabled={loading}
                        className="w-8 h-8 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors flex items-center justify-center"
                        title="View PDF"
                      >
                        👀
                      </button>
                      <button
                        onClick={() => handleDownloadInvoice(invoice.id, invoice.invoice_number)}
                        disabled={loading}
                        className="w-8 h-8 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors flex items-center justify-center"
                        title="Download PDF"
                      >
                        📥
                      </button>
                      <button
                        onClick={() => handlePrintInvoice(invoice.id)}
                        disabled={loading}
                        className="w-8 h-8 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors flex items-center justify-center"
                        title="Print"
                      >
                        🖨️
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Partial Invoice Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowModal(false);
          }
        }}>
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Create Partial Invoice (RA System)</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                >
                  ×
                </button>
              </div>
              
              <div class="grid grid-cols-2 gap-6 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
                  <select
                    value={selectedProject}
                    onChange={(e) => handleProjectChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Project</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.project_name} - {project.client_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Type</label>
                  <select
                    value={invoiceType}
                    onChange={(e) => setInvoiceType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="proforma">Proforma Invoice</option>
                    <option value="tax_invoice">Tax Invoice</option>
                  </select>
                </div>
              </div>

              {boqStatus && (
                <div className="mb-4">
                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <h4 className="font-semibold text-blue-900">Project Billing Status</h4>
                    <div className="grid grid-cols-4 gap-4 mt-2 text-sm">
                      <div>
                        <span className="text-blue-600">Next RA:</span>
                        <span className="font-bold ml-2">{boqStatus.next_ra_number}</span>
                      </div>
                      <div>
                        <span className="text-blue-600">Total Project:</span>
                        <span className="font-bold ml-2">₹{boqStatus.total_project_value?.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-blue-600">Billed So Far:</span>
                        <span className="font-bold ml-2">₹{boqStatus.total_billed_value?.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-blue-600">Remaining:</span>
                        <span className="font-bold ml-2">₹{boqStatus.remaining_value?.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="text-blue-600">Project Billed:</span>
                      <span className="font-bold ml-2">{boqStatus.project_billing_percentage}%</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold mb-2 text-gray-800">Select Items & Quantities to Bill:</h4>
                    <div className="max-h-80 overflow-y-auto border rounded-lg">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-100 sticky top-0">
                          <tr>
                            <th className="px-3 py-2 text-left">Description</th>
                            <th className="px-3 py-2 text-left">Unit</th>
                            <th className="px-3 py-2 text-left">Original Qty</th>
                            <th className="px-3 py-2 text-left">Billed</th>
                            <th className="px-3 py-2 text-left">Remaining</th>
                            <th className="px-3 py-2 text-left">Rate</th>
                            <th className="px-3 py-2 text-left">Bill Qty</th>
                            <th className="px-3 py-2 text-left">GST %</th>
                            <th className="px-3 py-2 text-left">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {boqStatus.boq_items.filter(item => item.can_bill).map((item, index) => {
                            const itemId = item.id || item.serial_number;
                            const billQty = partialQuantities[itemId] || 0;
                            const gstRate = itemGSTRates[itemId] || 18.0;
                            const amount = billQty * item.rate;
                            const gstAmount = (amount * gstRate) / 100;
                            const totalAmount = amount + gstAmount;
                            
                            return (
                              <tr key={itemId} className={`border-t ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                <td className="px-3 py-2">
                                  <div className="font-medium">{item.description}</div>
                                  <div className="text-xs text-gray-500">#{item.serial_number}</div>
                                </td>
                                <td className="px-3 py-2">{item.unit}</td>
                                <td className="px-3 py-2">{item.quantity}</td>
                                <td className="px-3 py-2 text-red-600">{item.billed_quantity}</td>
                                <td className="px-3 py-2 text-green-600 font-medium">{item.remaining_quantity}</td>
                                <td className="px-3 py-2">₹{item.rate}</td>
                                <td className="px-3 py-2">
                                  <input
                                    type="number"
                                    min="0"
                                    max={item.remaining_quantity}
                                    step="0.01"
                                    value={billQty}
                                    onChange={(e) => updatePartialQuantity(itemId, e.target.value)}
                                    className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                                    placeholder="0"
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  <input
                                    type="number"
                                    min="0"
                                    max="30"
                                    step="0.1"
                                    value={gstRate}
                                    onChange={(e) => updateGSTRate(itemId, e.target.value)}
                                    className={`w-16 px-2 py-1 border rounded text-center ${
                                      boqStatus.total_invoices > 0 ? 'bg-gray-100 text-gray-600' : 'border-gray-300'
                                    }`}
                                    disabled={boqStatus.total_invoices > 0}
                                    title={boqStatus.total_invoices > 0 ? 'GST locked for RA2+ invoices' : 'Edit GST rate for RA1'}
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  {billQty > 0 && (
                                    <div>
                                      <div className="font-medium">₹{totalAmount.toLocaleString()}</div>
                                      <div className="text-xs text-gray-500">
                                        Base: ₹{amount.toLocaleString()} + GST: ₹{gstAmount.toLocaleString()}
                                      </div>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    
                    {boqStatus.total_invoices > 0 && (
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                        <strong>RA{boqStatus.total_invoices + 1} Note:</strong> GST rates are locked to match previous invoices for consistency. Only new/unbilled items allow GST editing.
                      </div>
                    )}
                  </div>

                  {/* Invoice Summary */}
                  {Object.values(partialQuantities).some(qty => qty > 0) && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2">Invoice Summary ({boqStatus.next_ra_number})</h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-green-600">Items Selected:</span>
                          <span className="font-bold ml-2">
                            {Object.values(partialQuantities).filter(qty => qty > 0).length}
                          </span>
                        </div>
                        <div>
                          <span className="text-green-600">Subtotal:</span>
                          <span className="font-bold ml-2">
                            ₹{boqStatus.boq_items.reduce((sum, item) => {
                              const itemId = item.id || item.serial_number;
                              const qty = partialQuantities[itemId] || 0;
                              return sum + (qty * item.rate);
                            }, 0).toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-green-600">Total with GST:</span>
                          <span className="font-bold ml-2">
                            ₹{boqStatus.boq_items.reduce((sum, item) => {
                              const itemId = item.id || item.serial_number;
                              const qty = partialQuantities[itemId] || 0;
                              const gstRate = itemGSTRates[itemId] || 18.0;
                              const amount = qty * item.rate;
                              const gstAmount = (amount * gstRate) / 100;
                              return sum + amount + gstAmount;
                            }, 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateInvoice}
                  disabled={!selectedProject || !boqStatus || Object.values(partialQuantities).every(qty => qty === 0)}
                  className={`px-6 py-2 rounded font-medium ${
                    selectedProject && boqStatus && Object.values(partialQuantities).some(qty => qty > 0)
                      ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Create {boqStatus?.next_ra_number} Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    gst_no: '',
    bill_to_address: '',
    ship_to_address: '',
    contact_person: '',
    phone: '',
    email: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/clients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClients(response.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/clients`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Client created successfully!');
      setShowModal(false);
      setFormData({
        name: '',
        gst_no: '',
        bill_to_address: '',
        ship_to_address: '',
        contact_person: '',
        phone: '',
        email: ''
      });
      fetchClients();
    } catch (error) {
      alert('Error creating client: ' + (error.response?.data?.detail || error.message));
    }
  };

  if (loading) return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Clients</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Add Client
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GST No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clients.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{client.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{client.gst_no || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{client.contact_person}</div>
                  <div className="text-sm text-gray-500">{client.phone}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{client.bill_to_address}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{new Date(client.created_at).toLocaleDateString()}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Client Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add New Client</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                <input
                  type="text"
                  value={formData.gst_no}
                  onChange={(e) => setFormData({...formData, gst_no: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bill To Address *</label>
                <textarea
                  value={formData.bill_to_address}
                  onChange={(e) => setFormData({...formData, bill_to_address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ship To Address</label>
                <textarea
                  value={formData.ship_to_address}
                  onChange={(e) => setFormData({...formData, ship_to_address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


const BankGuarantees = () => {
  const [guarantees, setGuarantees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    project_id: '',
    project_name: '',
    guarantee_type: 'Performance',
    guarantee_amount: '',
    guarantee_percentage: '',
    issuing_bank: '',
    guarantee_number: '',
    issue_date: '',
    validity_date: '',
    beneficiary: '',
    applicant: '',
    guarantee_details: '',
    document_path: ''
  });

  useEffect(() => {
    fetchGuarantees();
    fetchProjects();
  }, []);

  const fetchGuarantees = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/bank-guarantees`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGuarantees(response.data);
    } catch (error) {
      console.error('Error fetching bank guarantees:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const selectedProject = projects.find(p => p.id === formData.project_id);
      
      const submitData = {
        ...formData,
        project_name: selectedProject ? selectedProject.project_name : '',
        guarantee_amount: parseFloat(formData.guarantee_amount),
        guarantee_percentage: parseFloat(formData.guarantee_percentage),
        issue_date: new Date(formData.issue_date).toISOString(),
        validity_date: new Date(formData.validity_date).toISOString()
      };

      await axios.post(`${API}/bank-guarantees`, submitData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Bank Guarantee created successfully!');
      setShowModal(false);
      setFormData({
        project_id: '',
        project_name: '',
        guarantee_type: 'Performance',
        guarantee_amount: '',
        guarantee_percentage: '',
        issuing_bank: '',
        guarantee_number: '',
        issue_date: '',
        validity_date: '',
        beneficiary: '',
        applicant: '',
        guarantee_details: '',
        document_path: ''
      });
      fetchGuarantees();
    } catch (error) {
      alert('Error creating bank guarantee: ' + (error.response?.data?.detail || error.message));
    }
  };

  const getStatusColor = (guarantee) => {
    const validityDate = new Date(guarantee.validity_date);
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
    
    if (validityDate < now) return 'bg-red-100 text-red-800';
    if (validityDate < thirtyDaysFromNow) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (guarantee) => {
    const validityDate = new Date(guarantee.validity_date);
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
    
    if (validityDate < now) return 'Expired';
    if (validityDate < thirtyDaysFromNow) return 'Expiring Soon';
    return 'Active';
  };

  if (loading) return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">🏦 Bank Guarantees</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Add Bank Guarantee
        </button>
      </div>

      {/* Alerts for expiring guarantees */}
      {guarantees.filter(g => {
        const validityDate = new Date(g.validity_date);
        const thirtyDaysFromNow = new Date(Date.now() + (30 * 24 * 60 * 60 * 1000));
        return validityDate < thirtyDaysFromNow && validityDate > new Date();
      }).length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Warning:</strong> {guarantees.filter(g => {
                  const validityDate = new Date(g.validity_date);
                  const thirtyDaysFromNow = new Date(Date.now() + (30 * 24 * 60 * 60 * 1000));
                  return validityDate < thirtyDaysFromNow && validityDate > new Date();
                }).length} bank guarantee(s) expiring in the next 30 days.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BG Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issuing Bank</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {guarantees.map((guarantee) => (
              <tr key={guarantee.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900 break-words">{guarantee.project_name}</div>
                  <div className="text-sm text-gray-500">{guarantee.guarantee_type}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{guarantee.guarantee_number}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">₹{guarantee.guarantee_amount.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">{guarantee.guarantee_percentage}%</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 break-words">{guarantee.issuing_bank}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{new Date(guarantee.issue_date).toLocaleDateString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{new Date(guarantee.validity_date).toLocaleDateString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(guarantee)}`}>
                    {getStatusText(guarantee)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-900 bg-blue-50 px-2 py-1 rounded text-xs">
                      📄 View
                    </button>
                    <button className="text-green-600 hover:text-green-900 bg-green-50 px-2 py-1 rounded text-xs">
                      📥 Download
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Bank Guarantee Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add Bank Guarantee</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project *</label>
                  <select
                    value={formData.project_id}
                    onChange={(e) => setFormData({...formData, project_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Project</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.project_name} - {project.client_name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Guarantee Type *</label>
                  <select
                    value={formData.guarantee_type}
                    onChange={(e) => setFormData({...formData, guarantee_type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="Performance">Performance Guarantee</option>
                    <option value="Advance Payment">Advance Payment Guarantee</option>
                    <option value="Retention">Retention Guarantee</option>
                    <option value="Warranty">Warranty Guarantee</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Guarantee Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.guarantee_amount}
                    onChange={(e) => setFormData({...formData, guarantee_amount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Guarantee Percentage *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.guarantee_percentage}
                    onChange={(e) => setFormData({...formData, guarantee_percentage: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issuing Bank *</label>
                  <input
                    type="text"
                    value={formData.issuing_bank}
                    onChange={(e) => setFormData({...formData, issuing_bank: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Guarantee Number *</label>
                  <input
                    type="text"
                    value={formData.guarantee_number}
                    onChange={(e) => setFormData({...formData, guarantee_number: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date *</label>
                  <input
                    type="date"
                    value={formData.issue_date}
                    onChange={(e) => setFormData({...formData, issue_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Validity Date *</label>
                  <input
                    type="date"
                    value={formData.validity_date}
                    onChange={(e) => setFormData({...formData, validity_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Beneficiary *</label>
                <input
                  type="text"
                  value={formData.beneficiary}
                  onChange={(e) => setFormData({...formData, beneficiary: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Applicant *</label>
                <input
                  type="text"
                  value={formData.applicant}
                  onChange={(e) => setFormData({...formData, applicant: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Guarantee Details</label>
                <textarea
                  value={formData.guarantee_details}
                  onChange={(e) => setFormData({...formData, guarantee_details: e.target.value})}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add Bank Guarantee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>;
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {user ? (
          <>
            <Navbar user={user} onLogout={handleLogout} />
            <div className="flex">
              <Sidebar user={user} />
              <main className="flex-1 p-6">
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/projects/:id" element={<ProjectDetails />} />
                  <Route path="/invoices" element={<Invoices />} />
                  <Route path="/clients" element={<Clients />} />
                  <Route path="/bank-guarantees" element={<BankGuarantees />} />
                  <Route path="/item-master" element={<ItemMaster currentUser={user} />} />
                  <Route path="/smart-search" element={<SmartSearch currentUser={user} />} />
                  <Route path="/pdf-processor" element={<PDFProcessor currentUser={user} />} />
                  <Route path="/reports" element={<Reports currentUser={user} />} />
                  <Route path="/search" element={<SearchResults />} />
                  {user.role === 'super_admin' && (
                    <>
                      <Route path="/logs" element={<ActivityLogs currentUser={user} />} />
                      <Route path="/users" element={<UserManagement />} />
                      <Route path="/admin" element={<AdminInterface currentUser={user} />} />
                    </>
                  )}
                </Routes>
              </main>
            </div>
          </>
        ) : (
          <Login onLogin={handleLogin} />
        )}
      </div>
    </Router>
  );
};

const ProjectDetails = () => {
  const { pathname } = useLocation();
  const projectId = pathname.split('/')[2]; // Extract project ID from URL
  const [projectDetails, setProjectDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  const fetchProjectDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/projects/${projectId}/details`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjectDetails(response.data);
    } catch (error) {
      console.error('Error fetching project details:', error);
      alert('Error loading project details');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (invoiceId, invoiceNumber) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API}/invoices/${invoiceId}/pdf`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/pdf'
        }
      });

      if (!response.ok) throw new Error(`Failed to download: ${response.status}`);

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice_${invoiceNumber}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Error downloading invoice: ' + error.message);
    }
  };

  if (loading) return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

  if (!projectDetails) return <div className="p-6"><div className="text-center text-gray-500">Project not found</div></div>;

  return (
    <div className="p-6 space-y-6">
      {/* Project Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{projectDetails.project_info.project_name}</h1>
            <p className="text-gray-600 mt-1">Architect: {projectDetails.project_info.architect}</p>
            <p className="text-gray-600">Location: {projectDetails.project_info.location}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Project ID: {projectDetails.project_info.id}</p>
            <p className="text-sm text-gray-500">Created: {new Date(projectDetails.project_info.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Client Information */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Client Name</p>
            <p className="text-gray-900">{projectDetails.client_info.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">GST Number</p>
            <p className="text-gray-900">{projectDetails.client_info.gst_no || 'Not Available'}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm font-medium text-gray-500">Address</p>
            <p className="text-gray-900">{projectDetails.client_info.bill_to_address}</p>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">₹{projectDetails.financial_summary.total_project_value.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Total Project Value</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">₹{projectDetails.financial_summary.total_invoiced.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Total Billed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">₹{projectDetails.financial_summary.balance_value.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Balance Amount</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{projectDetails.financial_summary.percentage_billed.toFixed(1)}%</p>
            <p className="text-sm text-gray-500">Percentage Billed</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{projectDetails.financial_summary.percentage_billed.toFixed(1)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(projectDetails.financial_summary.percentage_billed, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* BOQ Summary */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">BOQ Summary</h2>
        <p className="text-gray-600 mb-4">Total Items: {projectDetails.boq_summary.total_items}</p>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SL No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">UOM</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {projectDetails.boq_summary.items.slice(0, 10).map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 text-sm">{item.serial_number}</td>
                  <td className="px-6 py-4 text-sm max-w-xs">
                    <div className="break-words">{item.description}</div>
                  </td>
                  <td className="px-6 py-4 text-sm">{item.unit}</td>
                  <td className="px-6 py-4 text-sm">{item.quantity}</td>
                  <td className="px-6 py-4 text-sm">₹{item.rate.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm">₹{item.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {projectDetails.boq_summary.items.length > 10 && (
            <p className="text-center text-gray-500 py-4">
              Showing 10 of {projectDetails.boq_summary.items.length} items
            </p>
          )}
        </div>
      </div>

      {/* Related Invoices */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Related Invoices ({projectDetails.invoices.length})
        </h2>
        
        {projectDetails.invoices.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No invoices created yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">RA No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Basic Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">GST Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {projectDetails.invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium">{invoice.invoice_number}</td>
                    <td className="px-6 py-4 text-sm text-blue-600 font-medium">{invoice.ra_number}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        invoice.invoice_type === 'tax_invoice' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {invoice.invoice_type === 'tax_invoice' ? 'Tax Invoice' : 'Proforma'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">₹{invoice.subtotal.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm">₹{invoice.total_gst_amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm font-medium">₹{invoice.total_amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm">{new Date(invoice.invoice_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => handleDownloadInvoice(invoice.id, invoice.invoice_number)}
                        className="text-blue-600 hover:text-blue-900 font-medium"
                      >
                        Download PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'invoice_creator',
    company_name: ''
  });
  const [passwordData, setPasswordData] = useState({
    new_password: '',
    confirm_password: ''
  });

  const roles = [
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'invoice_creator', label: 'Invoice Creator' },
    { value: 'reviewer', label: 'Reviewer' },
    { value: 'approver', label: 'Approver' },
    { value: 'client', label: 'Client' },
    { value: 'vendor', label: 'Vendor' }
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Error fetching users: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');

      if (editingUser) {
        // Update user
        const updateData = {
          role: formData.role,
          company_name: formData.company_name,
          is_active: formData.is_active
        };

        await axios.put(`${API}/users/${editingUser.id}`, updateData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('User updated successfully!');
      } else {
        // Create new user
        await axios.post(`${API}/auth/register`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('User created successfully!');
      }

      setShowModal(false);
      setEditingUser(null);
      setFormData({ email: '', password: '', role: 'invoice_creator', company_name: '' });
      fetchUsers();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: '', // Don't show existing password
      role: user.role,
      company_name: user.company_name || '',
      is_active: user.is_active
    });
    setShowModal(true);
  };

  const handleDeactivate = async (userId) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('User deactivated successfully!');
      fetchUsers();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      alert('Passwords do not match!');
      return;
    }

    if (passwordData.new_password.length < 6) {
      alert('Password must be at least 6 characters long!');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API}/users/${editingUser.id}/reset-password`, {
        new_password: passwordData.new_password
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Password reset successfully!');
      setShowPasswordModal(false);
      setEditingUser(null);
      setPasswordData({ new_password: '', confirm_password: '' });
    } catch (error) {
      alert('Error: ' + (error.response?.data?.detail || error.message));
    }
  };

  const openPasswordModal = (user) => {
    setEditingUser(user);
    setShowPasswordModal(true);
  };

  if (loading) return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Add New User
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{user.email}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.role === 'super_admin' ? 'bg-red-100 text-red-800' :
                    user.role === 'invoice_creator' ? 'bg-blue-100 text-blue-800' :
                    user.role === 'reviewer' ? 'bg-yellow-100 text-yellow-800' :
                    user.role === 'approver' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{user.company_name || '-'}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => openPasswordModal(user)}
                      className="text-green-600 hover:text-green-900"
                    >
                      Reset Password
                    </button>
                    {user.is_active && (
                      <button
                        onClick={() => handleDeactivate(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Deactivate
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h3 className="text-lg font-bold mb-4">
              {editingUser ? 'Edit User' : 'Add New User'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={editingUser} // Can't change email for existing users
                />
              </div>
              
              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    required={!editingUser}
                    minLength="6"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {editingUser && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                    Active User
                  </label>
                </div>
              )}
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingUser(null);
                    setFormData({ email: '', password: '', role: 'invoice_creator', company_name: '' });
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingUser ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h3 className="text-lg font-bold mb-4">
              Reset Password for {editingUser?.email}
            </h3>
            
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password *
                </label>
                <input
                  type="password"
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                  minLength="6"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  value={passwordData.confirm_password}
                  onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                  minLength="6"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setEditingUser(null);
                    setPasswordData({ new_password: '', confirm_password: '' });
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const SearchResults = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState({ projects: [], clients: [], invoices: [], total_count: 0 });
  const [entityType, setEntityType] = useState('all');
  const [loading, setLoading] = useState(false);

  const performSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        query: searchQuery,
        entity_type: entityType,
        limit: '50'
      });
      
      const response = await axios.get(`${API}/search?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResults(response.data);
    } catch (error) {
      console.error('Search error:', error);
      alert('Search failed: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    performSearch();
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Global Search</h2>
      
      {/* Search Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <form onSubmit={handleSearch} className="flex space-x-4">
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across projects, clients, invoices..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={entityType}
              onChange={(e) => setEntityType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="projects">Projects</option>
              <option value="clients">Clients</option>
              <option value="invoices">Invoices</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading || !searchQuery.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {/* Results Summary */}
      {results.total_count > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <p className="text-blue-800">
            Found <strong>{results.total_count}</strong> results for "<strong>{searchQuery}</strong>"
          </p>
        </div>
      )}

      {/* Projects Results */}
      {results.projects.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Projects ({results.projects.length})</h3>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Architect</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {results.projects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{project.project_name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{project.client_name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{project.architect}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">₹{project.total_value.toLocaleString()}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Clients Results */}
      {results.clients.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Clients ({results.clients.length})</h3>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">GST No</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {results.clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{client.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{client.bill_to_address}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{client.gst_no || '-'}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoices Results */}
      {results.invoices.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoices ({results.invoices.length})</h3>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">RA Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {results.invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{invoice.invoice_number}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{invoice.ra_number}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{invoice.project_name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">₹{invoice.total_amount.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {invoice.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Results */}
      {searchQuery && results.total_count === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">No results found for "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
};



export default App;