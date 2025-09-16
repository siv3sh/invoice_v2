import React, { useState, useEffect } from 'react';

const PDFProcessor = ({ currentUser }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [extractionResult, setExtractionResult] = useState(null);
    const [extractions, setExtractions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showConvertModal, setShowConvertModal] = useState(false);
    const [selectedExtraction, setSelectedExtraction] = useState(null);
    const [projectMetadata, setProjectMetadata] = useState({
        project_name: '',
        architect: '',
        client_name: '',
        additional_metadata: {}
    });

    const backendUrl = process.env.REACT_APP_BACKEND_URL || import.meta.env.VITE_REACT_APP_BACKEND_URL;

    useEffect(() => {
        fetchExtractions();
    }, []);

    const fetchExtractions = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${backendUrl}/api/pdf-processor/extractions`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setExtractions(data.extractions || []);
            } else {
                setError('Failed to load PDF extractions');
            }
        } catch (err) {
            setError('Network error loading extractions');
            console.error('Error fetching extractions:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (event) => {
        const selectedFile = event.target.files[0];
        if (!selectedFile) return;

        // Validate file type
        const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(selectedFile.type)) {
            setError('Please select a PDF or DOCX file');
            return;
        }

        // Validate file size (max 10MB)
        if (selectedFile.size > 10 * 1024 * 1024) {
            setError('File size must be less than 10MB');
            return;
        }

        setFile(selectedFile);
        setError('');
        setExtractionResult(null);

        // Auto-upload
        await processFile(selectedFile);
    };

    const processFile = async (fileToProcess) => {
        try {
            setUploading(true);
            setError('');

            const formData = new FormData();
            formData.append('file', fileToProcess);

            const token = localStorage.getItem('token');
            const response = await fetch(`${backendUrl}/api/pdf-processor/extract`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                setExtractionResult(result);
                fetchExtractions(); // Refresh the list
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Failed to process file');
            }
        } catch (err) {
            setError('Network error processing file');
            console.error('Error processing file:', err);
        } finally {
            setUploading(false);
        }
    };

    const handleConvertToProject = async () => {
        if (!selectedExtraction || !projectMetadata.project_name) {
            setError('Please provide project name');
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            const response = await fetch(`${backendUrl}/api/pdf-processor/convert-to-project?extraction_id=${selectedExtraction.id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(projectMetadata)
            });

            if (response.ok) {
                const result = await response.json();
                setShowConvertModal(false);
                setSelectedExtraction(null);
                setProjectMetadata({
                    project_name: '',
                    architect: '',
                    client_name: '',
                    additional_metadata: {}
                });
                alert(`Project created successfully: ${result.project_name}`);
                fetchExtractions(); // Refresh to show conversion status
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Failed to convert to project');
            }
        } catch (err) {
            setError('Network error converting to project');
            console.error('Error converting to project:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleString('en-IN');
        } catch {
            return dateStr;
        }
    };

    const getConfidenceColor = (score) => {
        if (score >= 0.8) return 'text-green-600';
        if (score >= 0.6) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getConfidenceBadge = (score) => {
        if (score >= 0.8) return 'bg-green-100 text-green-800';
        if (score >= 0.6) return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">PDF Text Extraction Engine</h1>
                <p className="text-gray-600">Upload Purchase Orders and extract structured data automatically</p>
            </div>

            {/* File Upload Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Purchase Order</h2>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                    <div className="mx-auto w-12 h-12 text-gray-400 mb-4">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="file-upload" className="cursor-pointer">
                            <span className="text-blue-600 font-medium hover:text-blue-700">
                                Click to upload
                            </span>
                            <span className="text-gray-500"> or drag and drop</span>
                        </label>
                        <input
                            id="file-upload"
                            type="file"
                            className="hidden"
                            accept=".pdf,.docx"
                            onChange={handleFileUpload}
                            disabled={uploading}
                        />
                    </div>
                    <p className="text-sm text-gray-500">PDF or DOCX files up to 10MB</p>
                    
                    {file && (
                        <div className="mt-4 text-sm text-gray-600">
                            Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </div>
                    )}
                </div>

                {uploading && (
                    <div className="mt-4 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-sm text-gray-600">Processing file...</p>
                    </div>
                )}
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

            {/* Extraction Result */}
            {extractionResult && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Extraction Result</h2>
                        <div className="flex items-center space-x-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getConfidenceBadge(extractionResult.extracted_data.confidence_score)}`}>
                                Confidence: {(extractionResult.extracted_data.confidence_score * 100).toFixed(1)}%
                            </span>
                            <span className="text-sm text-gray-600">
                                Method: {extractionResult.extracted_data.extraction_method}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Basic Information */}
                        <div>
                            <h3 className="font-medium text-gray-900 mb-3">Basic Information</h3>
                            <div className="space-y-2">
                                <div>
                                    <span className="text-sm text-gray-500">PO Number:</span>
                                    <span className="ml-2 text-sm text-gray-900">
                                        {extractionResult.extracted_data.po_number || 'Not found'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">PO Date:</span>
                                    <span className="ml-2 text-sm text-gray-900">
                                        {extractionResult.extracted_data.po_date || 'Not found'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">Vendor:</span>
                                    <span className="ml-2 text-sm text-gray-900">
                                        {extractionResult.extracted_data.vendor_name || 'Not found'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">Client:</span>
                                    <span className="ml-2 text-sm text-gray-900">
                                        {extractionResult.extracted_data.client_name || 'Not found'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">Total Amount:</span>
                                    <span className="ml-2 text-sm text-gray-900">
                                        {extractionResult.extracted_data.total_amount 
                                            ? `₹${extractionResult.extracted_data.total_amount.toLocaleString('en-IN')}` 
                                            : 'Not found'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div>
                            <h3 className="font-medium text-gray-900 mb-3">Contact & Delivery</h3>
                            <div className="space-y-2">
                                <div>
                                    <span className="text-sm text-gray-500">Email:</span>
                                    <span className="ml-2 text-sm text-gray-900">
                                        {extractionResult.extracted_data.contact_info?.email || 'Not found'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">Phone:</span>
                                    <span className="ml-2 text-sm text-gray-900">
                                        {extractionResult.extracted_data.contact_info?.phone || 'Not found'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">Delivery Date:</span>
                                    <span className="ml-2 text-sm text-gray-900">
                                        {extractionResult.extracted_data.delivery_date || 'Not found'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Line Items */}
                    {extractionResult.extracted_data.line_items && extractionResult.extracted_data.line_items.length > 0 && (
                        <div className="mt-6">
                            <h3 className="font-medium text-gray-900 mb-3">
                                Line Items ({extractionResult.extracted_data.line_items.length})
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {extractionResult.extracted_data.line_items.slice(0, 5).map((item, index) => (
                                            <tr key={index}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {item.description || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {item.unit || 'nos'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {item.quantity || 0}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    ₹{item.rate?.toLocaleString('en-IN') || '0'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    ₹{item.amount?.toLocaleString('en-IN') || '0'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {extractionResult.extracted_data.line_items.length > 5 && (
                                <p className="text-sm text-gray-500 mt-2">
                                    ... and {extractionResult.extracted_data.line_items.length - 5} more items
                                </p>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={() => {
                                setSelectedExtraction({
                                    id: extractionResult.extraction_id,
                                    ...extractionResult.extracted_data
                                });
                                setProjectMetadata({
                                    project_name: extractionResult.extracted_data.po_number ? 
                                        `Project from PO ${extractionResult.extracted_data.po_number}` : '',
                                    architect: extractionResult.extracted_data.vendor_name || '',
                                    client_name: extractionResult.extracted_data.client_name || '',
                                    additional_metadata: {}
                                });
                                setShowConvertModal(true);
                            }}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        >
                            Convert to Project
                        </button>
                    </div>
                </div>
            )}

            {/* Previous Extractions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-900">Previous Extractions</h2>
                        <button
                            onClick={fetchExtractions}
                            className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Refresh
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-sm text-gray-600">Loading extractions...</p>
                    </div>
                ) : extractions.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="text-gray-400 mb-4">
                            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Extractions Yet</h3>
                        <p className="text-gray-600">Upload a PDF or DOCX file to get started.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO Details</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {extractions.map((extraction) => (
                                    <tr key={extraction.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {extraction.original_filename}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {(extraction.file_size / 1024).toFixed(1)} KB
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {extraction.extracted_data?.po_number || 'No PO #'}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {extraction.extracted_data?.vendor_name || 'No vendor'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getConfidenceBadge(extraction.extracted_data?.confidence_score || 0)}`}>
                                                {((extraction.extracted_data?.confidence_score || 0) * 100).toFixed(1)}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {extraction.converted_to_project ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    Converted
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                    Available
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(extraction.processed_at)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {!extraction.converted_to_project && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedExtraction(extraction);
                                                        setProjectMetadata({
                                                            project_name: extraction.extracted_data?.po_number ? 
                                                                `Project from PO ${extraction.extracted_data.po_number}` : '',
                                                            architect: extraction.extracted_data?.vendor_name || '',
                                                            client_name: extraction.extracted_data?.client_name || '',
                                                            additional_metadata: {}
                                                        });
                                                        setShowConvertModal(true);
                                                    }}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    Convert to Project
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Convert to Project Modal */}
            {showConvertModal && selectedExtraction && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-lg bg-white">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Convert to Project</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Project Name *</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={projectMetadata.project_name}
                                    onChange={(e) => setProjectMetadata({...projectMetadata, project_name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Architect</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={projectMetadata.architect}
                                    onChange={(e) => setProjectMetadata({...projectMetadata, architect: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Client Name</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={projectMetadata.client_name}
                                    onChange={(e) => setProjectMetadata({...projectMetadata, client_name: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowConvertModal(false);
                                    setSelectedExtraction(null);
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConvertToProject}
                                disabled={!projectMetadata.project_name}
                                className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-400"
                            >
                                Convert to Project
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PDFProcessor;