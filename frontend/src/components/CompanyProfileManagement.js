import React, { useState, useEffect } from 'react';

const CompanyProfileManagement = ({ currentUser }) => {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingProfile, setEditingProfile] = useState(null);
    const [activeTab, setActiveTab] = useState('locations');

    const [profileForm, setProfileForm] = useState({
        company_name: '',
        company_logo: '',
        locations: [],
        bank_details: []
    });

    const [locationForm, setLocationForm] = useState({
        location_name: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        phone: '',
        email: '',
        gst_number: '',
        is_default: false
    });

    const [bankForm, setBankForm] = useState({
        bank_name: '',
        account_number: '',
        account_holder_name: '',
        ifsc_code: '',
        branch_name: '',
        account_type: 'Current',
        is_default: false
    });

    const backendUrl = process.env.REACT_APP_BACKEND_URL || import.meta.env.VITE_REACT_APP_BACKEND_URL;

    useEffect(() => {
        if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'super_admin')) {
            fetchProfiles();
        }
    }, [currentUser]);

    const fetchProfiles = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${backendUrl}/api/company-profiles`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setProfiles(data);
            } else {
                setError('Failed to load company profiles');
            }
        } catch (err) {
            setError('Network error loading profiles');
            console.error('Error fetching profiles:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProfile = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${backendUrl}/api/company-profiles`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(profileForm)
            });

            if (response.ok) {
                setShowCreateModal(false);
                resetForms();
                fetchProfiles();
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Failed to create profile');
            }
        } catch (err) {
            setError('Network error creating profile');
            console.error('Error creating profile:', err);
        }
    };

    const handleUpdateProfile = async (profileId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${backendUrl}/api/company-profiles/${profileId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(profileForm)
            });

            if (response.ok) {
                setEditingProfile(null);
                resetForms();
                fetchProfiles();
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Failed to update profile');
            }
        } catch (err) {
            setError('Network error updating profile');
            console.error('Error updating profile:', err);
        }
    };

    const handleDeleteProfile = async (profileId) => {
        if (!window.confirm('Are you sure you want to delete this company profile? This action cannot be undone.')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${backendUrl}/api/company-profiles/${profileId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                fetchProfiles();
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Failed to delete profile');
            }
        } catch (err) {
            setError('Network error deleting profile');
            console.error('Error deleting profile:', err);
        }
    };

    const addLocation = () => {
        if (!locationForm.location_name || !locationForm.address_line_1 || !locationForm.city) {
            setError('Please fill in all required location fields');
            return;
        }

        const newLocation = {
            ...locationForm,
            id: Date.now().toString() // Temporary ID for frontend
        };

        setProfileForm(prev => ({
            ...prev,
            locations: [...prev.locations, newLocation]
        }));

        setLocationForm({
            location_name: '',
            address_line_1: '',
            address_line_2: '',
            city: '',
            state: '',
            pincode: '',
            country: 'India',
            phone: '',
            email: '',
            gst_number: '',
            is_default: false
        });
    };

    const addBankDetails = () => {
        if (!bankForm.bank_name || !bankForm.account_number || !bankForm.ifsc_code) {
            setError('Please fill in all required bank fields');
            return;
        }

        const newBank = {
            ...bankForm,
            id: Date.now().toString() // Temporary ID for frontend
        };

        setProfileForm(prev => ({
            ...prev,
            bank_details: [...prev.bank_details, newBank]
        }));

        setBankForm({
            bank_name: '',
            account_number: '',
            account_holder_name: '',
            ifsc_code: '',
            branch_name: '',
            account_type: 'Current',
            is_default: false
        });
    };

    const removeLocation = (index) => {
        setProfileForm(prev => ({
            ...prev,
            locations: prev.locations.filter((_, i) => i !== index)
        }));
    };

    const removeBankDetails = (index) => {
        setProfileForm(prev => ({
            ...prev,
            bank_details: prev.bank_details.filter((_, i) => i !== index)
        }));
    };

    const setDefaultLocation = (index) => {
        setProfileForm(prev => ({
            ...prev,
            locations: prev.locations.map((loc, i) => ({
                ...loc,
                is_default: i === index
            }))
        }));
    };

    const setDefaultBank = (index) => {
        setProfileForm(prev => ({
            ...prev,
            bank_details: prev.bank_details.map((bank, i) => ({
                ...bank,
                is_default: i === index
            }))
        }));
    };

    const resetForms = () => {
        setProfileForm({
            company_name: '',
            company_logo: '',
            locations: [],
            bank_details: []
        });
        setLocationForm({
            location_name: '',
            address_line_1: '',
            address_line_2: '',
            city: '',
            state: '',
            pincode: '',
            country: 'India',
            phone: '',
            email: '',
            gst_number: '',
            is_default: false
        });
        setBankForm({
            bank_name: '',
            account_number: '',
            account_holder_name: '',
            ifsc_code: '',
            branch_name: '',
            account_type: 'Current',
            is_default: false
        });
    };

    const startEdit = (profile) => {
        setEditingProfile(profile);
        setProfileForm({
            company_name: profile.company_name,
            company_logo: profile.company_logo || '',
            locations: profile.locations || [],
            bank_details: profile.bank_details || []
        });
        setShowCreateModal(true);
    };

    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'super_admin')) {
        return (
            <div className="p-8 text-center">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-red-800 mb-2">Access Denied</h2>
                    <p className="text-red-600">Only administrators can manage company profiles.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Company Profile Management</h1>
                <p className="text-gray-600">Manage company locations and bank details for invoices</p>
            </div>

            {/* Header Actions */}
            <div className="mb-6 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                    Total Profiles: {profiles.length}
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                    Create New Profile
                </button>
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

            {/* Company Profiles List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading company profiles...</p>
                    </div>
                ) : profiles.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="text-gray-400 mb-4">
                            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Company Profiles</h3>
                        <p className="text-gray-600">Create your first company profile to get started.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Locations</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bank Accounts</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Default Location</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Default Bank</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {profiles.map((profile) => {
                                    const defaultLocation = profile.locations?.find(loc => loc.is_default);
                                    const defaultBank = profile.bank_details?.find(bank => bank.is_default);
                                    
                                    return (
                                        <tr key={profile.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{profile.company_name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {profile.locations?.length || 0} locations
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    {profile.bank_details?.length || 0} accounts
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {defaultLocation ? defaultLocation.location_name : 'None'}
                                                </div>
                                                {defaultLocation && (
                                                    <div className="text-xs text-gray-500">{defaultLocation.city}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {defaultBank ? defaultBank.bank_name : 'None'}
                                                </div>
                                                {defaultBank && (
                                                    <div className="text-xs text-gray-500">****{defaultBank.account_number?.slice(-4)}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => startEdit(profile)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        Edit
                                                    </button>
                                                    {currentUser.role === 'super_admin' && (
                                                        <button
                                                            onClick={() => handleDeleteProfile(profile.id)}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-10 mx-auto p-5 border max-w-4xl shadow-lg rounded-lg bg-white">
                        <div className="mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                {editingProfile ? 'Edit Company Profile' : 'Create Company Profile'}
                            </h3>
                        </div>

                        <form onSubmit={editingProfile ? () => handleUpdateProfile(editingProfile.id) : handleCreateProfile}>
                            {/* Company Basic Info */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={profileForm.company_name}
                                    onChange={(e) => setProfileForm({...profileForm, company_name: e.target.value})}
                                />
                            </div>

                            {/* Tabs */}
                            <div className="border-b border-gray-200 mb-6">
                                <nav className="-mb-px flex space-x-8">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('locations')}
                                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                            activeTab === 'locations'
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        Locations ({profileForm.locations.length})
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('banking')}
                                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                            activeTab === 'banking'
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        Banking ({profileForm.bank_details.length})
                                    </button>
                                </nav>
                            </div>

                            {/* Locations Tab */}
                            {activeTab === 'locations' && (
                                <div className="space-y-6">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="font-medium text-gray-900 mb-4">Add New Location</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <input
                                                type="text"
                                                placeholder="Location Name *"
                                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                value={locationForm.location_name}
                                                onChange={(e) => setLocationForm({...locationForm, location_name: e.target.value})}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Address Line 1 *"
                                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                value={locationForm.address_line_1}
                                                onChange={(e) => setLocationForm({...locationForm, address_line_1: e.target.value})}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Address Line 2"
                                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                value={locationForm.address_line_2}
                                                onChange={(e) => setLocationForm({...locationForm, address_line_2: e.target.value})}
                                            />
                                            <input
                                                type="text"
                                                placeholder="City *"
                                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                value={locationForm.city}
                                                onChange={(e) => setLocationForm({...locationForm, city: e.target.value})}
                                            />
                                            <input
                                                type="text"
                                                placeholder="State"
                                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                value={locationForm.state}
                                                onChange={(e) => setLocationForm({...locationForm, state: e.target.value})}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Pincode"
                                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                value={locationForm.pincode}
                                                onChange={(e) => setLocationForm({...locationForm, pincode: e.target.value})}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Phone"
                                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                value={locationForm.phone}
                                                onChange={(e) => setLocationForm({...locationForm, phone: e.target.value})}
                                            />
                                            <input
                                                type="email"
                                                placeholder="Email"
                                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                value={locationForm.email}
                                                onChange={(e) => setLocationForm({...locationForm, email: e.target.value})}
                                            />
                                            <input
                                                type="text"
                                                placeholder="GST Number"
                                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                value={locationForm.gst_number}
                                                onChange={(e) => setLocationForm({...locationForm, gst_number: e.target.value})}
                                            />
                                        </div>
                                        <div className="mt-4 flex justify-between items-center">
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                    checked={locationForm.is_default}
                                                    onChange={(e) => setLocationForm({...locationForm, is_default: e.target.checked})}
                                                />
                                                <span className="ml-2 text-sm text-gray-700">Set as default location</span>
                                            </label>
                                            <button
                                                type="button"
                                                onClick={addLocation}
                                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                                            >
                                                Add Location
                                            </button>
                                        </div>
                                    </div>

                                    {/* Locations List */}
                                    <div className="space-y-3">
                                        {profileForm.locations.map((location, index) => (
                                            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2">
                                                            <h4 className="font-medium text-gray-900">{location.location_name}</h4>
                                                            {location.is_default && (
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                    Default
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {location.address_line_1}
                                                            {location.address_line_2 && `, ${location.address_line_2}`}
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            {location.city}, {location.state} {location.pincode}
                                                        </p>
                                                        {location.gst_number && (
                                                            <p className="text-sm text-gray-600">GST: {location.gst_number}</p>
                                                        )}
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        {!location.is_default && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setDefaultLocation(index)}
                                                                className="text-blue-600 hover:text-blue-900 text-sm"
                                                            >
                                                                Make Default
                                                            </button>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeLocation(index)}
                                                            className="text-red-600 hover:text-red-900 text-sm"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Banking Tab */}
                            {activeTab === 'banking' && (
                                <div className="space-y-6">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="font-medium text-gray-900 mb-4">Add Bank Account</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <input
                                                type="text"
                                                placeholder="Bank Name *"
                                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                value={bankForm.bank_name}
                                                onChange={(e) => setBankForm({...bankForm, bank_name: e.target.value})}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Account Number *"
                                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                value={bankForm.account_number}
                                                onChange={(e) => setBankForm({...bankForm, account_number: e.target.value})}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Account Holder Name"
                                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                value={bankForm.account_holder_name}
                                                onChange={(e) => setBankForm({...bankForm, account_holder_name: e.target.value})}
                                            />
                                            <input
                                                type="text"
                                                placeholder="IFSC Code *"
                                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                value={bankForm.ifsc_code}
                                                onChange={(e) => setBankForm({...bankForm, ifsc_code: e.target.value})}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Branch Name"
                                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                value={bankForm.branch_name}
                                                onChange={(e) => setBankForm({...bankForm, branch_name: e.target.value})}
                                            />
                                            <select
                                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                value={bankForm.account_type}
                                                onChange={(e) => setBankForm({...bankForm, account_type: e.target.value})}
                                            >
                                                <option value="Current">Current</option>
                                                <option value="Savings">Savings</option>
                                            </select>
                                        </div>
                                        <div className="mt-4 flex justify-between items-center">
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                                    checked={bankForm.is_default}
                                                    onChange={(e) => setBankForm({...bankForm, is_default: e.target.checked})}
                                                />
                                                <span className="ml-2 text-sm text-gray-700">Set as default bank account</span>
                                            </label>
                                            <button
                                                type="button"
                                                onClick={addBankDetails}
                                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                                            >
                                                Add Bank Account
                                            </button>
                                        </div>
                                    </div>

                                    {/* Bank Details List */}
                                    <div className="space-y-3">
                                        {profileForm.bank_details.map((bank, index) => (
                                            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2">
                                                            <h4 className="font-medium text-gray-900">{bank.bank_name}</h4>
                                                            {bank.is_default && (
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                    Default
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            Account: ****{bank.account_number.slice(-4)} ({bank.account_type})
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            IFSC: {bank.ifsc_code}
                                                        </p>
                                                        {bank.branch_name && (
                                                            <p className="text-sm text-gray-600">Branch: {bank.branch_name}</p>
                                                        )}
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        {!bank.is_default && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setDefaultBank(index)}
                                                                className="text-blue-600 hover:text-blue-900 text-sm"
                                                            >
                                                                Make Default
                                                            </button>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeBankDetails(index)}
                                                            className="text-red-600 hover:text-red-900 text-sm"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Modal Actions */}
                            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setEditingProfile(null);
                                        resetForms();
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
                                >
                                    {editingProfile ? 'Update Profile' : 'Create Profile'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompanyProfileManagement;