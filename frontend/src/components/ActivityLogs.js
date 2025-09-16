import React, { useState, useEffect } from 'react';

const ActivityLogs = ({ currentUser }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        search: '',
        action: '',
        dateFrom: '',
        dateTo: ''
    });

    const backendUrl = process.env.REACT_APP_BACKEND_URL || import.meta.env.VITE_REACT_APP_BACKEND_URL;

    useEffect(() => {
        if (currentUser && currentUser.role === 'super_admin') {
            fetchActivityLogs();
        }
    }, [currentUser]);

    const fetchActivityLogs = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${backendUrl}/api/activity-logs`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setLogs(data);
                setError('');
            } else {
                setError('Failed to load activity logs');
            }
        } catch (err) {
            setError('Network error loading logs');
            console.error('Error fetching activity logs:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } catch {
            return dateStr;
        }
    };

    const getActionIcon = (action) => {
        const icons = {
            'user_login': '🔑',
            'project_created': '📁',
            'invoice_created': '📄',
            'invoice_downloaded': '⬇️',
            'pdf_data_extracted': '📄',
            'pdf_converted_to_project': '🔄',
            'workflow_created': '⚙️',
            'system_config_updated': '🔧',
            'bank_guarantee_created': '🏦',
            'gst_report_generated': '📊',
            'insights_report_generated': '📈'
        };
        return icons[action] || '📝';
    };

    const getActionColor = (action) => {
        const colors = {
            'user_login': 'text-blue-600',
            'project_created': 'text-green-600',
            'invoice_created': 'text-purple-600',
            'invoice_downloaded': 'text-orange-600',
            'pdf_data_extracted': 'text-cyan-600',
            'pdf_converted_to_project': 'text-teal-600',
            'workflow_created': 'text-red-600',
            'system_config_updated': 'text-yellow-600',
            'bank_guarantee_created': 'text-indigo-600',
            'gst_report_generated': 'text-pink-600',
            'insights_report_generated': 'text-emerald-600'
        };
        return colors[action] || 'text-gray-600';
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch = !filters.search || 
            log.description.toLowerCase().includes(filters.search.toLowerCase()) ||
            log.user_email.toLowerCase().includes(filters.search.toLowerCase()) ||
            log.action.toLowerCase().includes(filters.search.toLowerCase());
        
        const matchesAction = !filters.action || log.action === filters.action;
        
        const logDate = new Date(log.timestamp);
        const matchesDateFrom = !filters.dateFrom || logDate >= new Date(filters.dateFrom);
        const matchesDateTo = !filters.dateTo || logDate <= new Date(filters.dateTo);
        
        return matchesSearch && matchesAction && matchesDateFrom && matchesDateTo;
    });

    const uniqueActions = [...new Set(logs.map(log => log.action))].sort();

    if (!currentUser || currentUser.role !== 'super_admin') {
        return (
            <div className="p-8 text-center">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-red-800 mb-2">Access Denied</h2>
                    <p className="text-red-600">Only super administrators can view activity logs.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Activity Logs</h1>
                <p className="text-gray-600">Monitor system activities and user actions</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                        <input
                            type="text"
                            placeholder="Search logs..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={filters.search}
                            onChange={(e) => setFilters({...filters, search: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={filters.action}
                            onChange={(e) => setFilters({...filters, action: e.target.value})}
                        >
                            <option value="">All Actions</option>
                            {uniqueActions.map(action => (
                                <option key={action} value={action}>
                                    {action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                        <input
                            type="date"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={filters.dateFrom}
                            onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                        <input
                            type="date"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={filters.dateTo}
                            onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                        />
                    </div>
                </div>
                <div className="mt-4 flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                        Showing {filteredLogs.length} of {logs.length} activities
                    </span>
                    <button
                        onClick={fetchActivityLogs}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Refresh
                    </button>
                </div>
            </div>

            {/* Activity Logs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading activity logs...</p>
                    </div>
                ) : error ? (
                    <div className="p-8 text-center">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
                            <p className="text-red-600">{error}</p>
                            <button
                                onClick={fetchActivityLogs}
                                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                ) : filteredLogs.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="text-gray-400 mb-4">
                            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Activity Found</h3>
                        <p className="text-gray-600">No activities match your current filters.</p>
                    </div>
                ) : (
                    <div className="overflow-hidden">
                        <div className="max-h-96 overflow-y-auto">
                            {filteredLogs.map((log, index) => (
                                <div key={log.id || index} className="border-b border-gray-100 last:border-b-0 p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start space-x-3">
                                        <div className={`text-lg ${getActionColor(log.action)}`}>
                                            {getActionIcon(log.action)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {log.user_email}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {formatDate(log.timestamp)}
                                                </p>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {log.description}
                                            </p>
                                            <div className="flex items-center mt-2 space-x-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)} bg-gray-100`}>
                                                    {log.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    Role: {log.user_role?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityLogs;