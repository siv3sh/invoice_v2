import React, { useState, useEffect } from 'react';

const SmartSearch = ({ currentUser }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState({
        projects: [],
        invoices: [],
        clients: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [advancedFilters, setAdvancedFilters] = useState({
        projects: {
            min_value: '',
            max_value: '',
            status: '',
            date_from: '',
            date_to: ''
        },
        invoices: {
            status: '',
            invoice_type: '',
            min_amount: '',
            max_amount: '',
            date_from: '',
            date_to: ''
        }
    });
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    const backendUrl = process.env.REACT_APP_BACKEND_URL || import.meta.env.VITE_REACT_APP_BACKEND_URL;

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        try {
            setLoading(true);
            setError('');
            const token = localStorage.getItem('token');
            
            const response = await fetch(`${backendUrl}/api/search/global?query=${encodeURIComponent(searchQuery)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setSearchResults(data);
            } else {
                setError('Search failed');
            }
        } catch (err) {
            setError('Network error during search');
            console.error('Search error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdvancedFilter = async (entityType) => {
        try {
            setLoading(true);
            setError('');
            const token = localStorage.getItem('token');
            
            const filters = advancedFilters[entityType];
            const queryParams = new URLSearchParams();
            
            Object.entries(filters).forEach(([key, value]) => {
                if (value) queryParams.append(key, value);
            });

            const response = await fetch(`${backendUrl}/api/filters/${entityType}?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setSearchResults(prev => ({
                    ...prev,
                    [entityType]: data
                }));
            } else {
                setError(`${entityType} filter failed`);
            }
        } catch (err) {
            setError(`Network error filtering ${entityType}`);
            console.error('Filter error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const getTotalResults = () => {
        return searchResults.projects.length + searchResults.invoices.length + searchResults.clients.length;
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

    const getStatusColor = (status) => {
        const colors = {
            'draft': 'bg-gray-100 text-gray-800',
            'pending_review': 'bg-yellow-100 text-yellow-800',
            'reviewed': 'bg-blue-100 text-blue-800',
            'approved': 'bg-green-100 text-green-800',
            'paid': 'bg-emerald-100 text-emerald-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const renderProjectResults = () => (
        <div className="space-y-4">
            {searchResults.projects.map((project) => (
                <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{project.project_name}</h3>
                            <p className="text-gray-600 mt-1">Client: {project.client_name}</p>
                            <p className="text-gray-600">Architect: {project.architect}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-bold text-green-600">{formatCurrency(project.total_project_value)}</p>
                            <p className="text-sm text-gray-500">Total Value</p>
                        </div>
                    </div>
                    <div className="mt-3 flex justify-between items-center">
                        <div className="flex space-x-4 text-sm text-gray-600">
                            <span>Advance: {formatCurrency(project.advance_received)}</span>
                            <span>Pending: {formatCurrency(project.pending_payment)}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                            Created: {formatDate(project.created_at)}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderInvoiceResults = () => (
        <div className="space-y-4">
            {searchResults.invoices.map((invoice) => (
                <div key={invoice.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {invoice.invoice_number}
                                {invoice.ra_number && (
                                    <span className="ml-2 text-sm text-blue-600">({invoice.ra_number})</span>
                                )}
                            </h3>
                            <p className="text-gray-600 mt-1">Project: {invoice.project_name}</p>
                            <p className="text-gray-600">Client: {invoice.client_name}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-bold text-blue-600">{formatCurrency(invoice.total_amount)}</p>
                            <p className="text-sm text-gray-500">Total Amount</p>
                        </div>
                    </div>
                    <div className="mt-3 flex justify-between items-center">
                        <div className="flex space-x-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                                {invoice.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                {invoice.invoice_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                        </div>
                        <span className="text-sm text-gray-500">
                            {formatDate(invoice.invoice_date)}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderClientResults = () => (
        <div className="space-y-4">
            {searchResults.clients.map((client) => (
                <div key={client.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
                            {client.email && <p className="text-gray-600 mt-1">Email: {client.email}</p>}
                            {client.phone && <p className="text-gray-600">Phone: {client.phone}</p>}
                            {client.address && <p className="text-gray-600">Address: {client.address}</p>}
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">
                                Client ID: {client.id.slice(-8)}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Smart Search & Filters</h1>
                <p className="text-gray-600">Search across projects, invoices, and clients with advanced filtering</p>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Search projects, invoices, clients..."
                            className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={handleKeyPress}
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        disabled={loading || !searchQuery.trim()}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                    >
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                    <button
                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Advanced Filters
                    </button>
                </div>
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Filters</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Project Filters */}
                        <div>
                            <h4 className="font-medium text-gray-900 mb-3">Project Filters</h4>
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="number"
                                        placeholder="Min Value"
                                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={advancedFilters.projects.min_value}
                                        onChange={(e) => setAdvancedFilters(prev => ({
                                            ...prev,
                                            projects: { ...prev.projects, min_value: e.target.value }
                                        }))}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max Value"
                                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={advancedFilters.projects.max_value}
                                        onChange={(e) => setAdvancedFilters(prev => ({
                                            ...prev,
                                            projects: { ...prev.projects, max_value: e.target.value }
                                        }))}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="date"
                                        placeholder="From Date"
                                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={advancedFilters.projects.date_from}
                                        onChange={(e) => setAdvancedFilters(prev => ({
                                            ...prev,
                                            projects: { ...prev.projects, date_from: e.target.value }
                                        }))}
                                    />
                                    <input
                                        type="date"
                                        placeholder="To Date"
                                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={advancedFilters.projects.date_to}
                                        onChange={(e) => setAdvancedFilters(prev => ({
                                            ...prev,
                                            projects: { ...prev.projects, date_to: e.target.value }
                                        }))}
                                    />
                                </div>
                                <button
                                    onClick={() => handleAdvancedFilter('projects')}
                                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                                >
                                    Filter Projects
                                </button>
                            </div>
                        </div>

                        {/* Invoice Filters */}
                        <div>
                            <h4 className="font-medium text-gray-900 mb-3">Invoice Filters</h4>
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <select
                                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={advancedFilters.invoices.status}
                                        onChange={(e) => setAdvancedFilters(prev => ({
                                            ...prev,
                                            invoices: { ...prev.invoices, status: e.target.value }
                                        }))}
                                    >
                                        <option value="">All Status</option>
                                        <option value="draft">Draft</option>
                                        <option value="pending_review">Pending Review</option>
                                        <option value="reviewed">Reviewed</option>
                                        <option value="approved">Approved</option>
                                        <option value="paid">Paid</option>
                                    </select>
                                    <select
                                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={advancedFilters.invoices.invoice_type}
                                        onChange={(e) => setAdvancedFilters(prev => ({
                                            ...prev,
                                            invoices: { ...prev.invoices, invoice_type: e.target.value }
                                        }))}
                                    >
                                        <option value="">All Types</option>
                                        <option value="proforma">Proforma</option>
                                        <option value="tax_invoice">Tax Invoice</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="number"
                                        placeholder="Min Amount"
                                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={advancedFilters.invoices.min_amount}
                                        onChange={(e) => setAdvancedFilters(prev => ({
                                            ...prev,
                                            invoices: { ...prev.invoices, min_amount: e.target.value }
                                        }))}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max Amount"
                                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={advancedFilters.invoices.max_amount}
                                        onChange={(e) => setAdvancedFilters(prev => ({
                                            ...prev,
                                            invoices: { ...prev.invoices, max_amount: e.target.value }
                                        }))}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="date"
                                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={advancedFilters.invoices.date_from}
                                        onChange={(e) => setAdvancedFilters(prev => ({
                                            ...prev,
                                            invoices: { ...prev.invoices, date_from: e.target.value }
                                        }))}
                                    />
                                    <input
                                        type="date"
                                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={advancedFilters.invoices.date_to}
                                        onChange={(e) => setAdvancedFilters(prev => ({
                                            ...prev,
                                            invoices: { ...prev.invoices, date_to: e.target.value }
                                        }))}
                                    />
                                </div>
                                <button
                                    onClick={() => handleAdvancedFilter('invoices')}
                                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Filter Invoices
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            {/* Results */}
            {(searchResults.projects.length > 0 || searchResults.invoices.length > 0 || searchResults.clients.length > 0) && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    {/* Results Header */}
                    <div className="border-b border-gray-200 p-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Search Results ({getTotalResults()} found)
                            </h2>
                            <div className="flex space-x-1">
                                <button
                                    onClick={() => setActiveTab('all')}
                                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                                        activeTab === 'all' 
                                            ? 'bg-blue-100 text-blue-800' 
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                >
                                    All ({getTotalResults()})
                                </button>
                                {searchResults.projects.length > 0 && (
                                    <button
                                        onClick={() => setActiveTab('projects')}
                                        className={`px-3 py-1 rounded-md text-sm font-medium ${
                                            activeTab === 'projects' 
                                                ? 'bg-blue-100 text-blue-800' 
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    >
                                        Projects ({searchResults.projects.length})
                                    </button>
                                )}
                                {searchResults.invoices.length > 0 && (
                                    <button
                                        onClick={() => setActiveTab('invoices')}
                                        className={`px-3 py-1 rounded-md text-sm font-medium ${
                                            activeTab === 'invoices' 
                                                ? 'bg-blue-100 text-blue-800' 
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    >
                                        Invoices ({searchResults.invoices.length})
                                    </button>
                                )}
                                {searchResults.clients.length > 0 && (
                                    <button
                                        onClick={() => setActiveTab('clients')}
                                        className={`px-3 py-1 rounded-md text-sm font-medium ${
                                            activeTab === 'clients' 
                                                ? 'bg-blue-100 text-blue-800' 
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    >
                                        Clients ({searchResults.clients.length})
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Results Content */}
                    <div className="p-4">
                        {activeTab === 'all' && (
                            <div className="space-y-6">
                                {searchResults.projects.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-3">Projects</h3>
                                        {renderProjectResults()}
                                    </div>
                                )}
                                {searchResults.invoices.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-3">Invoices</h3>
                                        {renderInvoiceResults()}
                                    </div>
                                )}
                                {searchResults.clients.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-3">Clients</h3>
                                        {renderClientResults()}
                                    </div>
                                )}
                            </div>
                        )}
                        {activeTab === 'projects' && renderProjectResults()}
                        {activeTab === 'invoices' && renderInvoiceResults()}
                        {activeTab === 'clients' && renderClientResults()}
                    </div>
                </div>
            )}

            {/* No Results */}
            {searchQuery && !loading && getTotalResults() === 0 && !error && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                    <div className="text-gray-400 mb-4">
                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Found</h3>
                    <p className="text-gray-600">Try adjusting your search query or using different filters.</p>
                </div>
            )}
        </div>
    );
};

export default SmartSearch;