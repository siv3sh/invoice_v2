import React, { useState, useEffect } from 'react';

const AdminInterface = ({ currentUser }) => {
    const [activeTab, setActiveTab] = useState('workflows');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [workflows, setWorkflows] = useState([]);
    const [systemConfigs, setSystemConfigs] = useState({});
    const [systemHealth, setSystemHealth] = useState(null);
    const [showCreateWorkflowModal, setShowCreateWorkflowModal] = useState(false);
    const [showCreateConfigModal, setShowCreateConfigModal] = useState(false);
    const [editingWorkflow, setEditingWorkflow] = useState(null);
    const [editingConfig, setEditingConfig] = useState(null);
    const [showClearDBModal, setShowClearDBModal] = useState(false);
    const [clearDBConfirmation, setClearDBConfirmation] = useState({
        confirm_clear: false,
        confirmation_text: ''
    });

    const backendUrl = process.env.REACT_APP_BACKEND_URL || import.meta.env.VITE_REACT_APP_BACKEND_URL;

    const [newWorkflow, setNewWorkflow] = useState({
        workflow_name: '',
        workflow_type: 'approval',
        steps: [],
        roles_permissions: {},
        notifications_config: {
            email_notifications: true,
            sms_notifications: false,
            in_app_notifications: true
        },
        active: true
    });

    const [newConfig, setNewConfig] = useState({
        config_category: 'business',
        config_key: '',
        config_value: '',
        config_type: 'string',
        description: '',
        is_sensitive: false,
        requires_restart: false
    });

    useEffect(() => {
        if (currentUser && currentUser.role === 'super_admin') {
            if (activeTab === 'workflows') {
                fetchWorkflows();
            } else if (activeTab === 'system-config') {
                fetchSystemConfigs();
            } else if (activeTab === 'health') {
                fetchSystemHealth();
            }
        }
    }, [activeTab, currentUser]);

    const fetchWorkflows = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${backendUrl}/api/admin/workflows`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setWorkflows(data);
            } else {
                setError('Failed to load workflows');
            }
        } catch (err) {
            setError('Network error loading workflows');
            console.error('Error fetching workflows:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSystemConfigs = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${backendUrl}/api/admin/system-config`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setSystemConfigs(data);
            } else {
                setError('Failed to load system configs');
            }
        } catch (err) {
            setError('Network error loading system configs');
            console.error('Error fetching system configs:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSystemHealth = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${backendUrl}/api/admin/system-health`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setSystemHealth(data);
            } else {
                setError('Failed to load system health');
            }
        } catch (err) {
            setError('Network error loading system health');
            console.error('Error fetching system health:', err);
        } finally {
            setLoading(false);
        }
    };

    const createWorkflow = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${backendUrl}/api/admin/workflows`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newWorkflow)
            });

            if (response.ok) {
                setShowCreateWorkflowModal(false);
                setNewWorkflow({
                    workflow_name: '',
                    workflow_type: 'approval',
                    steps: [],
                    roles_permissions: {},
                    notifications_config: {
                        email_notifications: true,
                        sms_notifications: false,
                        in_app_notifications: true
                    },
                    active: true
                });
                fetchWorkflows();
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Failed to create workflow');
            }
        } catch (err) {
            setError('Network error creating workflow');
            console.error('Error creating workflow:', err);
        }
    };

    const updateWorkflow = async (workflowId, updateData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${backendUrl}/api/admin/workflows/${workflowId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });

            if (response.ok) {
                setEditingWorkflow(null);
                fetchWorkflows();
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Failed to update workflow');
            }
        } catch (err) {
            setError('Network error updating workflow');
            console.error('Error updating workflow:', err);
        }
    };

    const createSystemConfig = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${backendUrl}/api/admin/system-config`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...newConfig,
                    config_value: newConfig.config_type === 'number' ? parseFloat(newConfig.config_value) : 
                                 newConfig.config_type === 'boolean' ? Boolean(newConfig.config_value) : 
                                 newConfig.config_value
                })
            });

            if (response.ok) {
                setShowCreateConfigModal(false);
                setNewConfig({
                    config_category: 'business',
                    config_key: '',
                    config_value: '',
                    config_type: 'string',
                    description: '',
                    is_sensitive: false,
                    requires_restart: false
                });
                fetchSystemConfigs();
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Failed to create config');
            }
        } catch (err) {
            setError('Network error creating config');
            console.error('Error creating config:', err);
        }
    };

    const updateSystemConfig = async (configId, updateData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${backendUrl}/api/admin/system-config/${configId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });

            if (response.ok) {
                const result = await response.json();
                setEditingConfig(null);
                fetchSystemConfigs();
                
                if (result.restart_required) {
                    alert('Configuration updated. Service restart may be required for changes to take effect.');
                }
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Failed to update config');
            }
        } catch (err) {
            setError('Network error updating config');
            console.error('Error updating config:', err);
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

    const handleClearDatabase = async () => {
        try {
            if (!clearDBConfirmation.confirm_clear || clearDBConfirmation.confirmation_text !== 'DELETE ALL DATA') {
                setError('Please check the confirmation box and type "DELETE ALL DATA" exactly');
                return;
            }

            setLoading(true);
            const token = localStorage.getItem('token');
            
            const response = await fetch(`${backendUrl}/api/admin/clear-database`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(clearDBConfirmation)
            });

            if (response.ok) {
                const result = await response.json();
                setShowClearDBModal(false);
                setClearDBConfirmation({ confirm_clear: false, confirmation_text: '' });
                
                // Show success message with statistics
                alert(`Database cleared successfully!\n\nTotal records deleted: ${result.statistics.total_records_deleted}\nCollections cleared: ${result.statistics.collections_cleared}\n\nUser accounts have been preserved.`);
                
                // Refresh system health to show updated stats
                if (activeTab === 'health') {
                    fetchSystemHealth();
                }
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Failed to clear database');
            }
        } catch (err) {
            setError('Network error clearing database');
            console.error('Error clearing database:', err);
        } finally {
            setLoading(false);
        }
    };

    const getHealthStatusColor = (status) => {
        return status === 'healthy' ? 'text-green-600' : 'text-red-600';
    };

    const getHealthStatusBadge = (status) => {
        return status === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    };

    if (!currentUser || currentUser.role !== 'super_admin') {
        return (
            <div className="p-8 text-center">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-red-800 mb-2">Access Denied</h2>
                    <p className="text-red-600">Only super administrators can access the admin interface.</p>
                </div>
            </div>
        );
    }

    const renderWorkflows = () => (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Workflow Configuration</h2>
                    <p className="text-gray-600">Configure approval workflows and business processes</p>
                </div>
                <button
                    onClick={() => setShowCreateWorkflowModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                    Create Workflow
                </button>
            </div>

            {/* Workflows List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {workflows.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="text-gray-400 mb-4">
                            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Workflows Configured</h3>
                        <p className="text-gray-600">Create your first workflow to get started.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Workflow Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Steps</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {workflows.map((workflow) => (
                                    <tr key={workflow.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{workflow.workflow_name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                {workflow.workflow_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {workflow.steps?.length || 0} steps
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                workflow.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                                {workflow.active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(workflow.created_at)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => setEditingWorkflow(workflow)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => updateWorkflow(workflow.id, { active: !workflow.active })}
                                                    className={workflow.active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}
                                                >
                                                    {workflow.active ? 'Deactivate' : 'Activate'}
                                                </button>
                                            </div>
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

    const renderSystemConfig = () => (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">System Configuration</h2>
                    <p className="text-gray-600">Manage application settings and preferences</p>
                </div>
                <button
                    onClick={() => setShowCreateConfigModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                    Add Configuration
                </button>
            </div>

            {/* Configurations by Category */}
            {Object.entries(systemConfigs).map(([category, configs]) => (
                <div key={category} className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900 capitalize">
                            {category.replace(/_/g, ' ')} Settings
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {configs.map((config) => (
                                    <tr key={config.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{config.config_key}</div>
                                            {config.requires_restart && (
                                                <div className="text-xs text-orange-600">Requires restart</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {config.is_sensitive ? '***HIDDEN***' : String(config.config_value)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {config.config_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 max-w-xs truncate">
                                                {config.description || 'No description'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => setEditingConfig(config)}
                                                className="text-blue-600 hover:text-blue-900"
                                            >
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}

            {Object.keys(systemConfigs).length === 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                    <div className="text-gray-400 mb-4">
                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Configurations Found</h3>
                    <p className="text-gray-600">Add system configurations to customize application behavior.</p>
                </div>
            )}
        </div>
    );

    const renderSystemHealth = () => (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">System Health</h2>
                    <p className="text-gray-600">Monitor system status and performance</p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={() => setShowClearDBModal(true)}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                        🗑️ Clear Database
                    </button>
                    <button
                        onClick={fetchSystemHealth}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Refresh
                    </button>
                </div>
            </div>

            {systemHealth && (
                <>
                    {/* Database Status */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Database Status</h3>
                        <div className="flex items-center space-x-4 mb-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getHealthStatusBadge(systemHealth.database.status)}`}>
                                {systemHealth.database.status.toUpperCase()}
                            </span>
                            <span className="text-sm text-gray-600">
                                Last checked: {formatDate(systemHealth.timestamp)}
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {Object.entries(systemHealth.database.collections).map(([name, info]) => (
                                <div key={name} className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-sm font-medium text-gray-900 capitalize">
                                            {name.replace(/_/g, ' ')}
                                        </h4>
                                        <span className={`text-xs ${getHealthStatusColor(info.status)}`}>
                                            {info.status}
                                        </span>
                                    </div>
                                    <p className="text-lg font-bold text-gray-900 mt-2">{info.count}</p>
                                    <p className="text-xs text-gray-500">records</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Application Status */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Status</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <h4 className="text-sm font-medium text-gray-500">Version</h4>
                                <p className="text-lg font-semibold text-gray-900 mt-1">
                                    {systemHealth.application.version}
                                </p>
                            </div>
                            <div className="text-center">
                                <h4 className="text-sm font-medium text-gray-500">Environment</h4>
                                <p className="text-lg font-semibold text-gray-900 mt-1 capitalize">
                                    {systemHealth.application.environment}
                                </p>
                            </div>
                            <div className="text-center">
                                <h4 className="text-sm font-medium text-gray-500">Uptime</h4>
                                <p className="text-lg font-semibold text-gray-900 mt-1">
                                    {systemHealth.application.uptime}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                        {systemHealth.recent_activity && systemHealth.recent_activity.length > 0 ? (
                            <div className="space-y-3">
                                {systemHealth.recent_activity.slice(0, 5).map((activity, index) => (
                                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                        <div className="text-sm text-gray-600">
                                            {formatDate(activity.timestamp)}
                                        </div>
                                        <div className="text-sm text-gray-900">
                                            {activity.user_email}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {activity.description}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No recent activity</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Interface</h1>
                <p className="text-gray-600">Configure workflows, manage system settings, and monitor health</p>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('workflows')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'workflows'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Workflows
                    </button>
                    <button
                        onClick={() => setActiveTab('system-config')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'system-config'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        System Config
                    </button>
                    <button
                        onClick={() => setActiveTab('health')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'health'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        System Health
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
                        <p className="text-gray-600">Loading...</p>
                    </div>
                ) : (
                    <>
                        {activeTab === 'workflows' && renderWorkflows()}
                        {activeTab === 'system-config' && renderSystemConfig()}
                        {activeTab === 'health' && renderSystemHealth()}
                    </>
                )}
            </div>

            {/* Create Workflow Modal */}
            {showCreateWorkflowModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-lg bg-white">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Create Workflow</h3>
                        <form onSubmit={createWorkflow}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Workflow Name *</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={newWorkflow.workflow_name}
                                    onChange={(e) => setNewWorkflow({...newWorkflow, workflow_name: e.target.value})}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Workflow Type *</label>
                                <select
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={newWorkflow.workflow_type}
                                    onChange={(e) => setNewWorkflow({...newWorkflow, workflow_type: e.target.value})}
                                >
                                    <option value="approval">Approval</option>
                                    <option value="billing">Billing</option>
                                    <option value="project">Project</option>
                                    <option value="invoice">Invoice</option>
                                </select>
                            </div>
                            <div className="mb-6">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                        checked={newWorkflow.active}
                                        onChange={(e) => setNewWorkflow({...newWorkflow, active: e.target.checked})}
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Active</span>
                                </label>
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateWorkflowModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
                                >
                                    Create Workflow
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Create Config Modal */}
            {showCreateConfigModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-lg bg-white">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Add Configuration</h3>
                        <form onSubmit={createSystemConfig}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                                <select
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={newConfig.config_category}
                                    onChange={(e) => setNewConfig({...newConfig, config_category: e.target.value})}
                                >
                                    <option value="business">Business</option>
                                    <option value="ui">UI</option>
                                    <option value="integration">Integration</option>
                                    <option value="notification">Notification</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Key *</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={newConfig.config_key}
                                    onChange={(e) => setNewConfig({...newConfig, config_key: e.target.value})}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Value *</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={newConfig.config_value}
                                    onChange={(e) => setNewConfig({...newConfig, config_value: e.target.value})}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                                <select
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={newConfig.config_type}
                                    onChange={(e) => setNewConfig({...newConfig, config_type: e.target.value})}
                                >
                                    <option value="string">String</option>
                                    <option value="number">Number</option>
                                    <option value="boolean">Boolean</option>
                                    <option value="object">Object</option>
                                    <option value="array">Array</option>
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={newConfig.description}
                                    onChange={(e) => setNewConfig({...newConfig, description: e.target.value})}
                                />
                            </div>
                            <div className="mb-4 space-y-2">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                        checked={newConfig.is_sensitive}
                                        onChange={(e) => setNewConfig({...newConfig, is_sensitive: e.target.checked})}
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Sensitive (hide value)</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                        checked={newConfig.requires_restart}
                                        onChange={(e) => setNewConfig({...newConfig, requires_restart: e.target.checked})}
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Requires restart</span>
                                </label>
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateConfigModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
                                >
                                    Add Configuration
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Clear Database Modal */}
            {showClearDBModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-lg bg-white">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">⚠️ DANGER: Clear Database</h3>
                            <div className="text-left mb-6">
                                <p className="text-sm text-red-600 mb-3">
                                    <strong>This will permanently delete ALL data including:</strong>
                                </p>
                                <ul className="text-sm text-red-600 space-y-1 mb-4">
                                    <li>• All Projects and BOQ data</li>
                                    <li>• All Invoices and PDFs</li>
                                    <li>• All Clients information</li>
                                    <li>• All Bank Guarantees</li>
                                    <li>• All PDF Extractions</li>
                                    <li>• All Item Master data</li>
                                    <li>• All Activity Logs</li>
                                    <li>• All System Configurations</li>
                                </ul>
                                <p className="text-sm text-green-600 mb-4">
                                    <strong>User accounts will be preserved.</strong>
                                </p>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="confirmClear"
                                        className="rounded border-gray-300 text-red-600 shadow-sm focus:border-red-300 focus:ring focus:ring-red-200 focus:ring-opacity-50"
                                        checked={clearDBConfirmation.confirm_clear}
                                        onChange={(e) => setClearDBConfirmation({...clearDBConfirmation, confirm_clear: e.target.checked})}
                                    />
                                    <label htmlFor="confirmClear" className="ml-2 text-sm text-gray-700">
                                        I understand that this action cannot be undone
                                    </label>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Type "DELETE ALL DATA" to confirm:
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                        value={clearDBConfirmation.confirmation_text}
                                        onChange={(e) => setClearDBConfirmation({...clearDBConfirmation, confirmation_text: e.target.value})}
                                        placeholder="DELETE ALL DATA"
                                    />
                                </div>
                            </div>
                            
                            <div className="flex justify-center space-x-3 mt-6">
                                <button
                                    onClick={() => {
                                        setShowClearDBModal(false);
                                        setClearDBConfirmation({ confirm_clear: false, confirmation_text: '' });
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleClearDatabase}
                                    disabled={!clearDBConfirmation.confirm_clear || clearDBConfirmation.confirmation_text !== 'DELETE ALL DATA' || loading}
                                    className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Clearing...' : '🗑️ Clear Database'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminInterface;