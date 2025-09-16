import React, { useState, useEffect } from 'react';

const EnhancedProjectCreation = ({ currentUser, onClose, onSuccess }) => {
    const [projectData, setProjectData] = useState({
        project_name: '',
        architect: '',
        client_id: '',
        client_name: '',
        company_profile_id: '',
        selected_location_id: '',
        selected_bank_id: ''
    });

    const [companyProfiles, setCompanyProfiles] = useState([]);
    const [clients, setClients] = useState([]);
    const [selectedProfile, setSelectedProfile] = useState(null);
    
    // Excel-like metadata state
    const [metadataRows, setMetadataRows] = useState([{
        id: 1,
        purchase_order_number: '',
        type: '',
        reference_no: '',
        dated: '',
        basic: 0,
        overall_multiplier: 1,
        po_inv_value: 0,
        abg_percentage: 0,
        ra_bill_with_taxes_percentage: 0,
        erection_percentage: 0,
        pbg_percentage: 0,
        // Calculated fields
        abg_amount: 0,
        ra_bill_amount: 0,
        erection_amount: 0,
        pbg_amount: 0
    }]);

    const [boqFile, setBOQFile] = useState(null);
    const [boqItems, setBOQItems] = useState([]);
    const [validationResult, setValidationResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState(1); // 1: Basic Info, 2: Company Selection, 3: Metadata, 4: BOQ Upload, 5: Validation

    const backendUrl = process.env.REACT_APP_BACKEND_URL || import.meta.env.VITE_REACT_APP_BACKEND_URL;

    useEffect(() => {
        fetchCompanyProfiles();
        fetchClients();
    }, []);

    const fetchCompanyProfiles = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${backendUrl}/api/company-profiles`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setCompanyProfiles(data);
            }
        } catch (err) {
            console.error('Error fetching company profiles:', err);
        }
    };

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

    // Excel-like metadata calculations
    const calculateRowAmounts = (row) => {
        const poValue = parseFloat(row.po_inv_value) || 0;
        
        return {
            ...row,
            abg_amount: (poValue * (parseFloat(row.abg_percentage) || 0)) / 100,
            ra_bill_amount: (poValue * (parseFloat(row.ra_bill_with_taxes_percentage) || 0)) / 100,
            erection_amount: (poValue * (parseFloat(row.erection_percentage) || 0)) / 100,
            pbg_amount: (poValue * (parseFloat(row.pbg_percentage) || 0)) / 100
        };
    };

    const updateMetadataRow = (rowIndex, field, value) => {
        const updatedRows = [...metadataRows];
        updatedRows[rowIndex] = {
            ...updatedRows[rowIndex],
            [field]: value
        };

        // Recalculate amounts for this row
        updatedRows[rowIndex] = calculateRowAmounts(updatedRows[rowIndex]);
        
        setMetadataRows(updatedRows);
    };

    const addMetadataRow = () => {
        const newRow = {
            id: Date.now(),
            purchase_order_number: '',
            type: '',
            reference_no: '',
            dated: '',
            basic: 0,
            overall_multiplier: 1,
            po_inv_value: 0,
            abg_percentage: 0,
            ra_bill_with_taxes_percentage: 0,
            erection_percentage: 0,
            pbg_percentage: 0,
            abg_amount: 0,
            ra_bill_amount: 0,
            erection_amount: 0,
            pbg_amount: 0
        };
        
        setMetadataRows([...metadataRows, newRow]);
    };

    const removeMetadataRow = (rowIndex) => {
        if (metadataRows.length > 1) {
            setMetadataRows(metadataRows.filter((_, index) => index !== rowIndex));
        }
    };

    const handleCompanyProfileChange = (profileId) => {
        const profile = companyProfiles.find(p => p.id === profileId);
        setSelectedProfile(profile);
        setProjectData({
            ...projectData,
            company_profile_id: profileId,
            selected_location_id: profile?.default_location_id || '',
            selected_bank_id: profile?.default_bank_id || ''
        });
    };

    const handleBOQUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setBOQFile(file);
        
        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('file', file);

            const token = localStorage.getItem('token');
            const response = await fetch(`${backendUrl}/api/projects/parse-boq`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                setBOQItems(data.items || []);
                setError('');
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Failed to parse BOQ file');
            }
        } catch (err) {
            setError('Network error uploading BOQ');
            console.error('Error uploading BOQ:', err);
        } finally {
            setLoading(false);
        }
    };

    const validateMetadata = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            const response = await fetch(`${backendUrl}/api/projects/validate-metadata`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    metadata: metadataRows,
                    boq_items: boqItems
                })
            });

            if (response.ok) {
                const result = await response.json();
                setValidationResult(result);
                
                if (!result.valid) {
                    setError('Metadata validation failed. Please check the errors and correct them.');
                } else {
                    setError('');
                    setStep(5); // Move to final review
                }
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Validation failed');
            }
        } catch (err) {
            setError('Network error during validation');
            console.error('Error validating metadata:', err);
        } finally {
            setLoading(false);
        }
    };

    const createProject = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            const projectPayload = {
                ...projectData,
                metadata: metadataRows,
                boq_items: boqItems,
                total_project_value: boqItems.reduce((sum, item) => sum + (item.total_with_gst || 0), 0)
            };

            const response = await fetch(`${backendUrl}/api/projects`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(projectPayload)
            });

            if (response.ok) {
                onSuccess?.();
                onClose?.();
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Failed to create project');
            }
        } catch (err) {
            setError('Network error creating project');
            console.error('Error creating project:', err);
        } finally {
            setLoading(false);
        }
    };

    const getTotalValues = () => {
        return metadataRows.reduce((totals, row) => ({
            po_total: totals.po_total + (parseFloat(row.po_inv_value) || 0),
            abg_total: totals.abg_total + (parseFloat(row.abg_amount) || 0),
            ra_total: totals.ra_total + (parseFloat(row.ra_bill_amount) || 0),
            erection_total: totals.erection_total + (parseFloat(row.erection_amount) || 0),
            pbg_total: totals.pbg_total + (parseFloat(row.pbg_amount) || 0)
        }), { po_total: 0, abg_total: 0, ra_total: 0, erection_total: 0, pbg_total: 0 });
    };

    const totals = getTotalValues();

    const renderStepIndicator = () => (
        <div className="mb-8">
            <div className="flex items-center justify-between">
                {['Basic Info', 'Company Selection', 'Project Metadata', 'BOQ Upload', 'Review & Create'].map((stepName, index) => (
                    <div key={index} className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            step > index + 1 ? 'bg-green-500 text-white' : 
                            step === index + 1 ? 'bg-blue-500 text-white' : 
                            'bg-gray-200 text-gray-600'
                        }`}>
                            {step > index + 1 ? '✓' : index + 1}
                        </div>
                        <span className={`ml-2 text-sm ${step === index + 1 ? 'font-medium text-blue-600' : 'text-gray-500'}`}>
                            {stepName}
                        </span>
                        {index < 4 && <div className="flex-1 mx-4 h-0.5 bg-gray-200"></div>}
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-6 border max-w-6xl shadow-lg rounded-lg bg-white min-h-[600px]">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Enhanced Project Creation</h2>
                    <p className="text-gray-600">Create project with company profile, metadata validation, and BOQ upload</p>
                </div>

                {renderStepIndicator()}

                {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {/* Step 1: Basic Info */}
                {step === 1 && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900">Basic Project Information</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Project Name *</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={projectData.project_name}
                                    onChange={(e) => setProjectData({...projectData, project_name: e.target.value})}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Architect *</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={projectData.architect}
                                    onChange={(e) => setProjectData({...projectData, architect: e.target.value})}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Client *</label>
                                <select
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={projectData.client_id}
                                    onChange={(e) => {
                                        const selectedClient = clients.find(c => c.id === e.target.value);
                                        setProjectData({
                                            ...projectData, 
                                            client_id: e.target.value,
                                            client_name: selectedClient?.name || ''
                                        });
                                    }}
                                >
                                    <option value="">Select Client</option>
                                    {clients.map(client => (
                                        <option key={client.id} value={client.id}>{client.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                onClick={() => setStep(2)}
                                disabled={!projectData.project_name || !projectData.architect || !projectData.client_id}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                            >
                                Next: Company Selection
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Company Selection */}
                {step === 2 && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900">Company Profile Selection</h3>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Company Profile *</label>
                            <select
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={projectData.company_profile_id}
                                onChange={(e) => handleCompanyProfileChange(e.target.value)}
                            >
                                <option value="">Select Company Profile</option>
                                {companyProfiles.map(profile => (
                                    <option key={profile.id} value={profile.id}>{profile.company_name}</option>
                                ))}
                            </select>
                        </div>

                        {selectedProfile && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={projectData.selected_location_id}
                                        onChange={(e) => setProjectData({...projectData, selected_location_id: e.target.value})}
                                    >
                                        <option value="">Select Location</option>
                                        {selectedProfile.locations?.map(location => (
                                            <option key={location.id} value={location.id}>
                                                {location.location_name} - {location.city}
                                                {location.is_default ? ' (Default)' : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Bank Account</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={projectData.selected_bank_id}
                                        onChange={(e) => setProjectData({...projectData, selected_bank_id: e.target.value})}
                                    >
                                        <option value="">Select Bank Account</option>
                                        {selectedProfile.bank_details?.map(bank => (
                                            <option key={bank.id} value={bank.id}>
                                                {bank.bank_name} - ****{bank.account_number?.slice(-4)}
                                                {bank.is_default ? ' (Default)' : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        )}

                        <div className="flex justify-between">
                            <button
                                onClick={() => setStep(1)}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setStep(3)}
                                disabled={!projectData.company_profile_id}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                            >
                                Next: Project Metadata
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Excel-like Metadata Table */}
                {step === 3 && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900">Project Metadata</h3>
                        <p className="text-sm text-gray-600">Fill in the Purchase Order details with real-time calculations</p>

                        {/* Excel-like Table */}
                        <div className="overflow-x-auto border border-gray-200 rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO Number *</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ref No</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dated</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Basic</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Multiplier</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO/Inv Value</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ABG %</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ABG Amount</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RA Bill %</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RA Amount</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Erection %</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Erection Amount</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PBG %</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PBG Amount</th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {metadataRows.map((row, index) => (
                                        <tr key={row.id} className="hover:bg-gray-50">
                                            <td className="px-3 py-2">
                                                <input
                                                    type="text"
                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    value={row.purchase_order_number}
                                                    onChange={(e) => updateMetadataRow(index, 'purchase_order_number', e.target.value)}
                                                    placeholder="PO Number"
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="text"
                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    value={row.type}
                                                    onChange={(e) => updateMetadataRow(index, 'type', e.target.value)}
                                                    placeholder="Type"
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="text"
                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    value={row.reference_no}
                                                    onChange={(e) => updateMetadataRow(index, 'reference_no', e.target.value)}
                                                    placeholder="Ref No"
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="date"
                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    value={row.dated}
                                                    onChange={(e) => updateMetadataRow(index, 'dated', e.target.value)}
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    value={row.basic}
                                                    onChange={(e) => updateMetadataRow(index, 'basic', parseFloat(e.target.value) || 0)}
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    value={row.overall_multiplier}
                                                    onChange={(e) => updateMetadataRow(index, 'overall_multiplier', parseFloat(e.target.value) || 1)}
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    value={row.po_inv_value}
                                                    onChange={(e) => updateMetadataRow(index, 'po_inv_value', parseFloat(e.target.value) || 0)}
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    max="100"
                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    value={row.abg_percentage}
                                                    onChange={(e) => updateMetadataRow(index, 'abg_percentage', parseFloat(e.target.value) || 0)}
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <div className="px-2 py-1 text-sm font-medium text-green-600">
                                                    ₹{row.abg_amount.toLocaleString('en-IN', {minimumFractionDigits: 2})}
                                                </div>
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    max="100"
                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    value={row.ra_bill_with_taxes_percentage}
                                                    onChange={(e) => updateMetadataRow(index, 'ra_bill_with_taxes_percentage', parseFloat(e.target.value) || 0)}
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <div className="px-2 py-1 text-sm font-medium text-blue-600">
                                                    ₹{row.ra_bill_amount.toLocaleString('en-IN', {minimumFractionDigits: 2})}
                                                </div>
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    max="100"
                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    value={row.erection_percentage}
                                                    onChange={(e) => updateMetadataRow(index, 'erection_percentage', parseFloat(e.target.value) || 0)}
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <div className="px-2 py-1 text-sm font-medium text-purple-600">
                                                    ₹{row.erection_amount.toLocaleString('en-IN', {minimumFractionDigits: 2})}
                                                </div>
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    max="100"
                                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    value={row.pbg_percentage}
                                                    onChange={(e) => updateMetadataRow(index, 'pbg_percentage', parseFloat(e.target.value) || 0)}
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <div className="px-2 py-1 text-sm font-medium text-orange-600">
                                                    ₹{row.pbg_amount.toLocaleString('en-IN', {minimumFractionDigits: 2})}
                                                </div>
                                            </td>
                                            <td className="px-3 py-2">
                                                <button
                                                    onClick={() => removeMetadataRow(index)}
                                                    disabled={metadataRows.length === 1}
                                                    className="text-red-600 hover:text-red-900 disabled:text-gray-400 text-sm"
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                {/* Totals Row */}
                                <tfoot className="bg-gray-100">
                                    <tr className="font-medium">
                                        <td className="px-3 py-2 text-sm font-semibold text-gray-900" colSpan="6">TOTALS</td>
                                        <td className="px-3 py-2 text-sm font-semibold text-gray-900">
                                            ₹{totals.po_total.toLocaleString('en-IN', {minimumFractionDigits: 2})}
                                        </td>
                                        <td className="px-3 py-2"></td>
                                        <td className="px-3 py-2 text-sm font-semibold text-green-600">
                                            ₹{totals.abg_total.toLocaleString('en-IN', {minimumFractionDigits: 2})}
                                        </td>
                                        <td className="px-3 py-2"></td>
                                        <td className="px-3 py-2 text-sm font-semibold text-blue-600">
                                            ₹{totals.ra_total.toLocaleString('en-IN', {minimumFractionDigits: 2})}
                                        </td>
                                        <td className="px-3 py-2"></td>
                                        <td className="px-3 py-2 text-sm font-semibold text-purple-600">
                                            ₹{totals.erection_total.toLocaleString('en-IN', {minimumFractionDigits: 2})}
                                        </td>
                                        <td className="px-3 py-2"></td>
                                        <td className="px-3 py-2 text-sm font-semibold text-orange-600">
                                            ₹{totals.pbg_total.toLocaleString('en-IN', {minimumFractionDigits: 2})}
                                        </td>
                                        <td className="px-3 py-2"></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        <div className="flex justify-between">
                            <button
                                onClick={addMetadataRow}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                            >
                                Add Row
                            </button>
                        </div>

                        <div className="flex justify-between">
                            <button
                                onClick={() => setStep(2)}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setStep(4)}
                                disabled={metadataRows.some(row => !row.purchase_order_number)}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                            >
                                Next: BOQ Upload
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 4: BOQ Upload */}
                {step === 4 && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900">BOQ Upload & Validation</h3>
                        
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                            <div className="mx-auto w-12 h-12 text-gray-400 mb-4">
                                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="boq-upload" className="cursor-pointer">
                                    <span className="text-blue-600 font-medium hover:text-blue-700">
                                        Click to upload BOQ file
                                    </span>
                                    <span className="text-gray-500"> or drag and drop</span>
                                </label>
                                <input
                                    id="boq-upload"
                                    type="file"
                                    className="hidden"
                                    accept=".xlsx,.xls"
                                    onChange={handleBOQUpload}
                                />
                            </div>
                            <p className="text-sm text-gray-500">Excel files (.xlsx, .xls) up to 10MB</p>
                            
                            {boqFile && (
                                <div className="mt-4 text-sm text-gray-600">
                                    Selected: {boqFile.name}
                                </div>
                            )}
                        </div>

                        {loading && (
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                <p className="text-sm text-gray-600">Processing BOQ...</p>
                            </div>
                        )}

                        {boqItems.length > 0 && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <h4 className="font-medium text-green-800">BOQ Processed Successfully</h4>
                                <p className="text-green-700 mt-1">
                                    {boqItems.length} items loaded. Total value: ₹{boqItems.reduce((sum, item) => sum + (item.total_with_gst || 0), 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}
                                </p>
                            </div>
                        )}

                        <div className="flex justify-between">
                            <button
                                onClick={() => setStep(3)}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                Previous
                            </button>
                            <button
                                onClick={validateMetadata}
                                disabled={boqItems.length === 0 || loading}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                            >
                                Validate & Continue
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 5: Validation Results & Final Review */}
                {step === 5 && (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900">Validation Results & Review</h3>

                        {validationResult && (
                            <div className={`border rounded-lg p-4 ${validationResult.valid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                                <div className="flex items-center">
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 ${
                                        validationResult.valid ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                                    }`}>
                                        {validationResult.valid ? '✓' : '✗'}
                                    </div>
                                    <h4 className={`font-medium ${validationResult.valid ? 'text-green-800' : 'text-red-800'}`}>
                                        {validationResult.valid ? 'Validation Passed' : 'Validation Failed'}
                                    </h4>
                                </div>
                                
                                {validationResult.errors && validationResult.errors.length > 0 && (
                                    <div className="mt-3">
                                        <p className="text-red-800 font-medium mb-2">Errors found:</p>
                                        <ul className="list-disc list-inside space-y-1">
                                            {validationResult.errors.map((error, index) => (
                                                <li key={index} className="text-red-700 text-sm">{error}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium text-gray-700">BOQ Total:</span>
                                        <p className="text-gray-900">₹{validationResult.boq_total?.toLocaleString('en-IN', {minimumFractionDigits: 2})}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Metadata Total:</span>
                                        <p className="text-gray-900">₹{validationResult.metadata_total?.toLocaleString('en-IN', {minimumFractionDigits: 2})}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Variance:</span>
                                        <p className="text-gray-900">₹{validationResult.variance?.toLocaleString('en-IN', {minimumFractionDigits: 2})}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between">
                            <button
                                onClick={() => setStep(4)}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                Previous
                            </button>
                            {validationResult?.valid ? (
                                <button
                                    onClick={createProject}
                                    disabled={loading}
                                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                                >
                                    {loading ? 'Creating...' : 'Create Project'}
                                </button>
                            ) : (
                                <button
                                    onClick={() => setStep(3)}
                                    className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                                >
                                    Fix Metadata Issues
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Modal Actions */}
                <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EnhancedProjectCreation;