import React, { useState, useEffect } from 'react';

const ItemMaster = ({ currentUser }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [filters, setFilters] = useState({
        search: '',
        category: ''
    });

    const [newItem, setNewItem] = useState({
        description: '',
        unit: 'nos',
        standard_rate: '',
        category: ''
    });

    const backendUrl = process.env.REACT_APP_BACKEND_URL || import.meta.env.VITE_REACT_APP_BACKEND_URL;

    const commonUnits = ['nos', 'cum', 'sqm', 'kg', 'ton', 'ltr', 'meter', 'rmt', 'sqft', 'cft'];
    const commonCategories = ['Construction', 'Electrical', 'Plumbing', 'Finishing', 'Civil', 'Mechanical', 'Safety', 'Tools', 'Other'];

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${backendUrl}/api/item-master`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setItems(data);
                setError('');
            } else {
                setError('Failed to load items');
            }
        } catch (err) {
            setError('Network error loading items');
            console.error('Error fetching items:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateItem = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${backendUrl}/api/item-master`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...newItem,
                    standard_rate: parseFloat(newItem.standard_rate) || 0
                })
            });

            if (response.ok) {
                setShowCreateModal(false);
                setNewItem({ description: '', unit: 'nos', standard_rate: '', category: '' });
                fetchItems();
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Failed to create item');
            }
        } catch (err) {
            setError('Network error creating item');
            console.error('Error creating item:', err);
        }
    };

    const handleUpdateItem = async (itemId, updateData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${backendUrl}/api/item-master/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...updateData,
                    standard_rate: parseFloat(updateData.standard_rate) || 0
                })
            });

            if (response.ok) {
                setEditingItem(null);
                fetchItems();
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Failed to update item');
            }
        } catch (err) {
            setError('Network error updating item');
            console.error('Error updating item:', err);
        }
    };

    const handleDeleteItem = async (itemId) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${backendUrl}/api/item-master/${itemId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                fetchItems();
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Failed to delete item');
            }
        } catch (err) {
            setError('Network error deleting item');
            console.error('Error deleting item:', err);
        }
    };

    const handleAutoPopulateFromBOQ = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${backendUrl}/api/item-master/auto-populate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                alert(`Auto-populated ${result.items_added} items from existing BOQ data`);
                fetchItems();
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Failed to auto-populate items');
            }
        } catch (err) {
            setError('Network error auto-populating items');
            console.error('Error auto-populating items:', err);
        }
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = !filters.search || 
            item.description.toLowerCase().includes(filters.search.toLowerCase()) ||
            item.unit.toLowerCase().includes(filters.search.toLowerCase());
        
        const matchesCategory = !filters.category || item.category === filters.category;
        
        return matchesSearch && matchesCategory;
    });

    const uniqueCategories = [...new Set(items.map(item => item.category).filter(Boolean))].sort();

    const formatDate = (dateStr) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-IN');
        } catch {
            return 'N/A';
        }
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Item Master</h1>
                <p className="text-gray-600">Manage your standard items and rates</p>
            </div>

            {/* Actions and Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex flex-col sm:flex-row gap-4 flex-1">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Search items..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={filters.search}
                                onChange={(e) => setFilters({...filters, search: e.target.value})}
                            />
                        </div>
                        <div>
                            <select
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={filters.category}
                                onChange={(e) => setFilters({...filters, category: e.target.value})}
                            >
                                <option value="">All Categories</option>
                                {uniqueCategories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleAutoPopulateFromBOQ}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        >
                            Auto-Populate from BOQ
                        </button>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Add New Item
                        </button>
                    </div>
                </div>
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

            {/* Items Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading items...</p>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="text-gray-400 mb-4">
                            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Items Found</h3>
                        <p className="text-gray-600">Start by adding items or auto-populating from existing BOQ data.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Standard Rate</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage Count</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Used</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        {editingItem?.id === item.id ? (
                                            <EditItemRow 
                                                item={editingItem} 
                                                setEditingItem={setEditingItem}
                                                onSave={(data) => handleUpdateItem(item.id, data)}
                                                onCancel={() => setEditingItem(null)}
                                                commonUnits={commonUnits}
                                                commonCategories={commonCategories}
                                            />
                                        ) : (
                                            <>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                                                        {item.description}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {item.unit}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    ₹{item.standard_rate?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {item.category ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            {item.category}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 text-sm">Uncategorized</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {item.usage_count || 0}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDate(item.last_used_date)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => setEditingItem(item)}
                                                            className="text-blue-600 hover:text-blue-900"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteItem(item.id)}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create Item Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-lg bg-white">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Item</h3>
                        <form onSubmit={handleCreateItem}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={newItem.description}
                                    onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Unit *</label>
                                <select
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={newItem.unit}
                                    onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                                >
                                    {commonUnits.map(unit => (
                                        <option key={unit} value={unit}>{unit}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Standard Rate *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={newItem.standard_rate}
                                    onChange={(e) => setNewItem({...newItem, standard_rate: e.target.value})}
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={newItem.category}
                                    onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                                >
                                    <option value="">Select Category</option>
                                    {commonCategories.map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setNewItem({ description: '', unit: 'nos', standard_rate: '', category: '' });
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
                                >
                                    Create Item
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// Edit Item Row Component
const EditItemRow = ({ item, setEditingItem, onSave, onCancel, commonUnits, commonCategories }) => {
    const [editData, setEditData] = useState({
        description: item.description,
        unit: item.unit,
        standard_rate: item.standard_rate?.toString() || '',
        category: item.category || ''
    });

    const handleSave = () => {
        onSave(editData);
    };

    return (
        <>
            <td className="px-6 py-4 whitespace-nowrap">
                <input
                    type="text"
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    value={editData.description}
                    onChange={(e) => setEditData({...editData, description: e.target.value})}
                />
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <select
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    value={editData.unit}
                    onChange={(e) => setEditData({...editData, unit: e.target.value})}
                >
                    {commonUnits.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                    ))}
                </select>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    value={editData.standard_rate}
                    onChange={(e) => setEditData({...editData, standard_rate: e.target.value})}
                />
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <select
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    value={editData.category}
                    onChange={(e) => setEditData({...editData, category: e.target.value})}
                >
                    <option value="">Select Category</option>
                    {commonCategories.map(category => (
                        <option key={category} value={category}>{category}</option>
                    ))}
                </select>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {item.usage_count || 0}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {item.last_used_date ? new Date(item.last_used_date).toLocaleDateString('en-IN') : 'N/A'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                    <button
                        onClick={handleSave}
                        className="text-green-600 hover:text-green-900"
                    >
                        Save
                    </button>
                    <button
                        onClick={onCancel}
                        className="text-gray-600 hover:text-gray-900"
                    >
                        Cancel
                    </button>
                </div>
            </td>
        </>
    );
};

export default ItemMaster;