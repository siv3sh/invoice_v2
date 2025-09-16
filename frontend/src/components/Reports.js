import React, { useState, useEffect } from 'react';

const Reports = ({ currentUser }) => {
    const [activeTab, setActiveTab] = useState('gst');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [gstSummary, setGstSummary] = useState(null);
    const [insights, setInsights] = useState(null);
    const [clientSummary, setClientSummary] = useState(null);
    const [selectedClient, setSelectedClient] = useState('');
    const [clients, setClients] = useState([]);
    const [dateFilters, setDateFilters] = useState({
        dateFrom: '',
        dateTo: ''
    });

    const backendUrl = process.env.REACT_APP_BACKEND_URL || import.meta.env.VITE_REACT_APP_BACKEND_URL;

    useEffect(() => {
        fetchClients();
        if (activeTab === 'gst') {
            fetchGSTSummary();
        } else if (activeTab === 'insights') {
            fetchInsights();
        }
    }, [activeTab]);

    const fetchClients = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${backendUrl}/api/clients`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setClients(data);
            }
        } catch (err) {
            console.error('Error fetching clients:', err);
        }
    };

    const fetchGSTSummary = async () => {
        try {
            setLoading(true);
            setError('');
            const token = localStorage.getItem('token');
            
            const queryParams = new URLSearchParams();
            if (dateFilters.dateFrom) queryParams.append('date_from', dateFilters.dateFrom);
            if (dateFilters.dateTo) queryParams.append('date_to', dateFilters.dateTo);

            const response = await fetch(`${backendUrl}/api/reports/gst-summary?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setGstSummary(data);
            } else {
                setError('Failed to load GST summary');
            }
        } catch (err) {
            setError('Network error loading GST summary');
            console.error('Error fetching GST summary:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchInsights = async () => {
        try {
            setLoading(true);
            setError('');
            const token = localStorage.getItem('token');
            
            const response = await fetch(`${backendUrl}/api/reports/insights`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setInsights(data);
            } else {
                setError('Failed to load insights');
            }
        } catch (err) {
            setError('Network error loading insights');
            console.error('Error fetching insights:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchClientSummary = async (clientId) => {
        try {
            setLoading(true);
            setError('');
            const token = localStorage.getItem('token');
            
            const response = await fetch(`${backendUrl}/api/reports/client-summary/${clientId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setClientSummary(data);
            } else {
                setError('Failed to load client summary');
            }
        } catch (err) {
            setError('Network error loading client summary');
            console.error('Error fetching client summary:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return `₹${amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}`;
    };

    const formatDate = (dateStr) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-IN');
        } catch {
            return dateStr;
        }
    };

    const renderGSTSummary = () => (
        <div className="space-y-6">
            {/* Date Filters */}
            <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex gap-4 items-center">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                        <input
                            type="date"
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={dateFilters.dateFrom}
                            onChange={(e) => setDateFilters(prev => ({...prev, dateFrom: e.target.value}))}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                        <input
                            type="date"
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={dateFilters.dateTo}
                            onChange={(e) => setDateFilters(prev => ({...prev, dateTo: e.target.value}))}
                        />
                    </div>
                    <div className="pt-6">
                        <button
                            onClick={fetchGSTSummary}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            </div>

            {gstSummary && (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h3 className="text-sm font-medium text-gray-500">Total Invoices</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-2">{gstSummary.total_invoices}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h3 className="text-sm font-medium text-gray-500">Taxable Amount</h3>
                            <p className="text-2xl font-bold text-green-600 mt-2">{formatCurrency(gstSummary.total_taxable_amount)}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h3 className="text-sm font-medium text-gray-500">Total GST</h3>
                            <p className="text-2xl font-bold text-red-600 mt-2">{formatCurrency(gstSummary.total_gst_amount)}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h3 className="text-sm font-medium text-gray-500">Total with GST</h3>
                            <p className="text-2xl font-bold text-blue-600 mt-2">{formatCurrency(gstSummary.total_amount_with_gst)}</p>
                        </div>
                    </div>

                    {/* GST Rate Breakdown */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">GST Rate Breakdown</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GST Rate</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taxable Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GST Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {gstSummary.gst_breakdown.map((breakdown, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {breakdown.rate}%
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatCurrency(breakdown.taxable_amount)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatCurrency(breakdown.gst_amount)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatCurrency(breakdown.total_amount)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Monthly Breakdown */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Breakdown</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoices</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taxable Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GST Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {gstSummary.monthly_breakdown.map((month, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {month.month}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {month.total_invoices}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatCurrency(month.taxable_amount)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatCurrency(month.gst_amount)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatCurrency(month.total_amount)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Invoice Type Breakdown */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Type Distribution</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <h4 className="text-sm font-medium text-blue-800">Proforma Invoices</h4>
                                <p className="text-2xl font-bold text-blue-600 mt-2">
                                    {formatCurrency(gstSummary.invoice_type_breakdown.proforma)}
                                </p>
                            </div>
                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                                <h4 className="text-sm font-medium text-purple-800">Tax Invoices</h4>
                                <p className="text-2xl font-bold text-purple-600 mt-2">
                                    {formatCurrency(gstSummary.invoice_type_breakdown.tax_invoice)}
                                </p>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );

    const renderInsights = () => (
        <div className="space-y-6">
            {insights && (
                <>
                    {/* Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h3 className="text-sm font-medium text-gray-500">Total Projects</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-2">{insights.overview.total_projects}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h3 className="text-sm font-medium text-gray-500">Total Clients</h3>
                            <p className="text-2xl font-bold text-blue-600 mt-2">{insights.overview.total_clients}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h3 className="text-sm font-medium text-gray-500">Total Invoices</h3>
                            <p className="text-2xl font-bold text-purple-600 mt-2">{insights.overview.total_invoices}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
                            <p className="text-2xl font-bold text-green-600 mt-2">{insights.overview.active_users}</p>
                        </div>
                    </div>

                    {/* Financial Overview */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Overview</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="text-center">
                                <h4 className="text-sm font-medium text-gray-500">Total Project Value</h4>
                                <p className="text-xl font-bold text-green-600 mt-2">
                                    {formatCurrency(insights.financial.total_project_value)}
                                </p>
                            </div>
                            <div className="text-center">
                                <h4 className="text-sm font-medium text-gray-500">Advance Received</h4>
                                <p className="text-xl font-bold text-blue-600 mt-2">
                                    {formatCurrency(insights.financial.total_advance_received)}
                                </p>
                            </div>
                            <div className="text-center">
                                <h4 className="text-sm font-medium text-gray-500">Pending Payment</h4>
                                <p className="text-xl font-bold text-red-600 mt-2">
                                    {formatCurrency(insights.financial.total_pending_payment)}
                                </p>
                            </div>
                            <div className="text-center">
                                <h4 className="text-sm font-medium text-gray-500">Collection %</h4>
                                <p className="text-xl font-bold text-purple-600 mt-2">
                                    {insights.financial.collection_percentage.toFixed(1)}%
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <h4 className="text-sm font-medium text-green-800">Avg Project Value</h4>
                                <p className="text-xl font-bold text-green-600 mt-2">
                                    {formatCurrency(insights.performance.avg_project_value)}
                                </p>
                            </div>
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <h4 className="text-sm font-medium text-blue-800">Avg Invoice Value</h4>
                                <p className="text-xl font-bold text-blue-600 mt-2">
                                    {formatCurrency(insights.performance.avg_invoice_value)}
                                </p>
                            </div>
                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                                <h4 className="text-sm font-medium text-purple-800">Projects per Client</h4>
                                <p className="text-xl font-bold text-purple-600 mt-2">
                                    {insights.performance.projects_per_client.toFixed(1)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Top Clients */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Clients by Value</h3>
                        <div className="space-y-3">
                            {insights.trends.top_clients.map((client, index) => (
                                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <span className="text-sm font-medium text-gray-900">#{index + 1}</span>
                                        <span className="text-gray-900">{client.name}</span>
                                    </div>
                                    <span className="text-green-600 font-semibold">
                                        {formatCurrency(client.total_value)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Monthly Trends */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Invoice Trends</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice Count</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice Value</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {insights.trends.monthly_data.map((month, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {month.month}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {month.invoices_count}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatCurrency(month.invoices_value)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );

    const renderClientSummary = () => (
        <div className="space-y-6">
            {/* Client Selection */}
            <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex gap-4 items-center">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Client</label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={selectedClient}
                            onChange={(e) => setSelectedClient(e.target.value)}
                        >
                            <option value="">Choose a client...</option>
                            {clients.map((client) => (
                                <option key={client.id} value={client.id}>
                                    {client.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="pt-6">
                        <button
                            onClick={() => selectedClient && fetchClientSummary(selectedClient)}
                            disabled={!selectedClient}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                        >
                            Generate Report
                        </button>
                    </div>
                </div>
            </div>

            {clientSummary && (
                <>
                    {/* Client Info */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-gray-500">Name</p>
                                <p className="text-lg font-medium text-gray-900">{clientSummary.client_info.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="text-lg font-medium text-gray-900">{clientSummary.client_info.email || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Phone</p>
                                <p className="text-lg font-medium text-gray-900">{clientSummary.client_info.phone || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Address</p>
                                <p className="text-lg font-medium text-gray-900">{clientSummary.client_info.address || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h3 className="text-sm font-medium text-gray-500">Total Projects</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-2">{clientSummary.projects_count}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h3 className="text-sm font-medium text-gray-500">Total Invoices</h3>
                            <p className="text-2xl font-bold text-blue-600 mt-2">{clientSummary.invoices_count}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h3 className="text-sm font-medium text-gray-500">Project Value</h3>
                            <p className="text-2xl font-bold text-green-600 mt-2">
                                {formatCurrency(clientSummary.total_project_value)}
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h3 className="text-sm font-medium text-gray-500">Pending Amount</h3>
                            <p className="text-2xl font-bold text-red-600 mt-2">
                                {formatCurrency(clientSummary.pending_amount)}
                            </p>
                        </div>
                    </div>

                    {/* Recent Invoices */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Invoices</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {clientSummary.recent_invoices.map((invoice, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {invoice.invoice_number}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {invoice.project_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                    {invoice.invoice_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatCurrency(invoice.total_amount)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(invoice.invoice_date)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Reports & Insights</h1>
                <p className="text-gray-600">Comprehensive analytics and reporting dashboard</p>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('gst')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'gst'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        GST Summary
                    </button>
                    <button
                        onClick={() => setActiveTab('insights')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'insights'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Business Insights
                    </button>
                    <button
                        onClick={() => setActiveTab('client')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'client'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Client Summary
                    </button>
                </nav>
            </div>

            {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">{error}</p>
                    <button
                        onClick={() => setError('')}
                        className="mt-2 text-sm text-red-600 hover:text-red-800"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* Tab Content */}
            <div>
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading report data...</p>
                    </div>
                ) : (
                    <>
                        {activeTab === 'gst' && renderGSTSummary()}
                        {activeTab === 'insights' && renderInsights()}
                        {activeTab === 'client' && renderClientSummary()}
                    </>
                )}
            </div>
        </div>
    );
};

export default Reports;