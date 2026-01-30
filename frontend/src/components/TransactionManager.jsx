import React, { useState, useEffect, useRef } from 'react';
import TransactionForm from './TransactionForm';
import TransactionList from './TransactionList';

const TransactionManager = ({ token, onLogout }) => {
  const [transactions, setTransactions] = useState([]);
  const [assetTypes, setAssetTypes] = useState([]);
  const [selectedAssetType, setSelectedAssetType] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [platforms, setPlatforms] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [newAssetType, setNewAssetType] = useState('');
  const [newPlatform, setNewPlatform] = useState('');
  const [newAccount, setNewAccount] = useState('');
  const formRef = useRef(null);

  const apiUrl = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    fetchAssetTypes();
    fetchTransactions();
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    if (showForm && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showForm]);

  const fetchAssetTypes = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/asset-types`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setAssetTypes(data);
      }
    } catch (err) {
      console.error('Failed to fetch asset types:', err);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      // Fetch platforms
      const platformsResponse = await fetch(`${apiUrl}/api/platforms`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (platformsResponse.ok) {
        const platformsData = await platformsResponse.json();
        setPlatforms(platformsData);
      }

      // Fetch accounts
      const accountsResponse = await fetch(`${apiUrl}/api/accounts`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (accountsResponse.ok) {
        const accountsData = await accountsResponse.json();
        setAccounts(accountsData);
      }
    } catch (err) {
      console.error('Failed to fetch filter options:', err);
    }
  };

  const fetchTransactions = async (assetType = '', platform = '', account = '') => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (assetType) params.append('assetType', assetType);
      if (platform) params.append('platform', platform);
      if (account) params.append('account', account);
      
      const url = params.toString() 
        ? `${apiUrl}/api/transactions?${params.toString()}`
        : `${apiUrl}/api/transactions`;
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      }
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (filterType, value) => {
    if (filterType === 'assetType') {
      setSelectedAssetType(value);
      fetchTransactions(value, selectedPlatform, selectedAccount);
    } else if (filterType === 'platform') {
      setSelectedPlatform(value);
      fetchTransactions(selectedAssetType, value, selectedAccount);
    } else if (filterType === 'account') {
      setSelectedAccount(value);
      fetchTransactions(selectedAssetType, selectedPlatform, value);
    }
  };

  const handleTransactionAdded = () => {
    setShowForm(false);
    setEditingTransaction(null);
    fetchTransactions(selectedAssetType, selectedPlatform, selectedAccount);
    fetchFilterOptions(); // Refresh filter options
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
    // Scroll to top on mobile to show form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    try {
      const response = await fetch(`${apiUrl}/api/transactions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        fetchTransactions(selectedAssetType, selectedPlatform, selectedAccount);
        fetchFilterOptions(); // Refresh filter options
      }
    } catch (err) {
      console.error('Failed to delete transaction:', err);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTransaction(null);
  };

  const handleAddAssetType = async () => {
    if (!newAssetType.trim()) return;
    
    try {
      const response = await fetch(`${apiUrl}/api/asset-types`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newAssetType.trim() }),
      });

      if (response.ok) {
        setNewAssetType('');
        fetchAssetTypes();
      }
    } catch (err) {
      console.error('Failed to add asset type:', err);
    }
  };

  const handleAddPlatform = async () => {
    if (!newPlatform.trim()) return;
    
    try {
      const response = await fetch(`${apiUrl}/api/platforms`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newPlatform.trim() }),
      });

      if (response.ok) {
        setNewPlatform('');
        fetchFilterOptions();
      }
    } catch (err) {
      console.error('Failed to add platform:', err);
    }
  };

  const handleAddAccount = async () => {
    if (!newAccount.trim()) return;
    
    try {
      const response = await fetch(`${apiUrl}/api/accounts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newAccount.trim() }),
      });

      if (response.ok) {
        setNewAccount('');
        fetchFilterOptions();
      }
    } catch (err) {
      console.error('Failed to add account:', err);
    }
  };

  const handleDeleteAssetType = async (id) => {
    if (!confirm('Are you sure you want to delete this asset type?')) return;
    
    try {
      const response = await fetch(`${apiUrl}/api/asset-types/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        fetchAssetTypes();
      }
    } catch (err) {
      console.error('Failed to delete asset type:', err);
    }
  };

  const handleDeletePlatform = async (id) => {
    if (!confirm('Are you sure you want to remove this platform?')) return;
    
    try {
      const response = await fetch(`${apiUrl}/api/platforms/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        fetchFilterOptions();
      }
    } catch (err) {
      console.error('Failed to delete platform:', err);
    }
  };

  const handleDeleteAccount = async (id) => {
    if (!confirm('Are you sure you want to remove this account?')) return;
    
    try {
      const response = await fetch(`${apiUrl}/api/accounts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        fetchFilterOptions();
      }
    } catch (err) {
      console.error('Failed to delete account:', err);
    }
  };

  // Calculate summary statistics
  const calculateSummary = () => {
    const summary = {
      total: 0,
      byAssetType: {}
    };

    transactions.forEach(transaction => {
      const amount = parseFloat(transaction.amount);
      const multiplier = transaction.transaction_type === 'Sell' ? -1 : 1;
      const value = amount * multiplier;

      summary.total += value;

      if (!summary.byAssetType[transaction.asset_type]) {
        summary.byAssetType[transaction.asset_type] = 0;
      }
      summary.byAssetType[transaction.asset_type] += value;
    });

    return summary;
  };

  const summary = calculateSummary();

  // Helper function to get asset type initials
  const getAssetTypeInitials = (assetType) => {
    const words = assetType.split(' ');
    if (words.length === 1) return assetType;
    return words.map(word => word[0]).join('').toUpperCase();
  };

  // Get filtered summary based on selected asset type
  const getDisplaySummary = () => {
    if (!selectedAssetType) {
      return summary;
    }
    // If asset type is selected, show only that asset type
    const amount = summary.byAssetType[selectedAssetType] || 0;
    const filteredTransactions = transactions.filter(t => t.asset_type === selectedAssetType);
    return {
      total: amount,
      byAssetType: { [selectedAssetType]: amount },
      transactionCount: filteredTransactions.length
    };
  };

  const displaySummary = getDisplaySummary();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 overflow-x-hidden">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-3 pb-20 lg:pb-8">
        {/* Summary Cards */}
        {transactions.length > 0 && (
          <>
            {/* Mobile View - Single Card with Breakdown */}
            <div className="lg:hidden mb-3">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-3 text-white">
                <div className="grid grid-cols-2 gap-3">
                  {/* Left Column - Total */}
                  <div className="flex flex-col justify-center border-r border-white border-opacity-20 pr-3">
                    <div className="text-xs font-medium opacity-90">Total Portfolio</div>
                    <div className="text-2xl font-bold mt-0.5">₹{summary.total.toFixed(2)}</div>
                    <div className="text-xs opacity-75 mt-0.5">{transactions.length} txns</div>
                  </div>
                  
                  {/* Right Column - Breakdown */}
                  <div className="space-y-0.5">
                    {Object.entries(summary.byAssetType).map(([assetType, amount]) => (
                      <div key={assetType} className="flex items-center justify-between text-xs">
                        <span className="font-semibold opacity-90">{getAssetTypeInitials(assetType)}</span>
                        <span className="opacity-85">₹{amount.toFixed(2)}</span>
                        <span className="opacity-75">{summary.total > 0 ? ((amount / summary.total) * 100).toFixed(1) : '0.0'}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop View - Multiple Cards */}
            <div className="hidden lg:grid grid-cols-4 gap-4 mb-8">
              {/* Total Portfolio Card */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-4 text-white">
                <div className="text-sm font-medium opacity-90">Total Portfolio</div>
                <div className="text-2xl font-bold mt-2">₹{summary.total.toFixed(2)}</div>
                <div className="text-xs opacity-75 mt-1">{transactions.length} transactions</div>
              </div>

              {/* Asset Type Cards */}
              {Object.entries(summary.byAssetType).map(([assetType, amount]) => {
                const colors = {
                  'Stocks': 'from-green-500 to-green-600',
                  'Mutual Funds': 'from-purple-500 to-purple-600',
                  'Fixed Deposits': 'from-orange-500 to-orange-600'
                };
                const bgColor = colors[assetType] || 'from-gray-500 to-gray-600';
                
                return (
                  <div key={assetType} className={`bg-gradient-to-br ${bgColor} rounded-lg shadow-md p-4 text-white`}>
                    <div className="text-sm font-medium opacity-90">{assetType}</div>
                    <div className="text-2xl font-bold mt-2">₹{amount.toFixed(2)}</div>
                    <div className="text-xs opacity-75 mt-1">
                      {summary.total > 0 ? ((amount / summary.total) * 100).toFixed(1) : '0.0'}% of total
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Control Bar - Desktop Only */}
        <div className="hidden lg:flex flex-row gap-4 mb-8">
          <select
            value={selectedAssetType}
            onChange={(e) => handleFilterChange('assetType', e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base bg-white dark:bg-gray-800 dark:text-gray-100"
          >
            <option value="">All Asset Types</option>
            {assetTypes.map((type) => (
              <option key={type.id} value={type.name}>{type.name}</option>
            ))}
          </select>

          <select
            value={selectedPlatform}
            onChange={(e) => handleFilterChange('platform', e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base bg-white dark:bg-gray-800 dark:text-gray-100"
          >
            <option value="">All Platforms</option>
            {platforms.map((platform) => (
              <option key={platform.id} value={platform.name}>{platform.name}</option>
            ))}
          </select>

          <select
            value={selectedAccount}
            onChange={(e) => handleFilterChange('account', e.target.value)}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base bg-white dark:bg-gray-800 dark:text-gray-100"
          >
            <option value="">All Accounts</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.name}>{account.name}</option>
            ))}
          </select>
          
          {/* Add Transaction Button - Desktop (next to dropdown) */}
          {!showForm && (
            <>
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition duration-200 text-base shadow-lg whitespace-nowrap"
              >
                + Add Transaction
              </button>
              <button
                onClick={() => setShowSettingsMenu(true)}
                className="bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200 text-base shadow-lg"
                aria-label="Settings"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Transaction Form - Desktop Only */}
        {showForm && (
          <div ref={formRef} className="hidden lg:block">
            <TransactionForm
              token={token}
              assetTypes={assetTypes}
              transaction={editingTransaction}
              onSuccess={handleTransactionAdded}
              onCancel={handleCloseForm}
            />
          </div>
        )}

        {/* Transaction List */}
        <TransactionList
          transactions={transactions}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </main>

      {/* Transaction Form Bottom Sheet - Mobile */}
      {showForm && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black bg-opacity-50 dark:bg-opacity-70" onClick={handleCloseForm}></div>
          
          {/* Bottom Sheet */}
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Handle Bar */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 rounded-t-2xl z-10 flex justify-center pt-3 pb-2">
              <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            </div>
            
            <div ref={formRef}>
              <TransactionForm
                token={token}
                assetTypes={assetTypes}
                transaction={editingTransaction}
                onSuccess={handleTransactionAdded}
                onCancel={handleCloseForm}
              />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Bar - Add Transaction + Filter */}
      {!showForm && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-300 dark:border-gray-700 p-2 shadow-lg">
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilterMenu(true)}
              className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-2.5 px-4 rounded-lg transition duration-200 text-sm shadow flex items-center justify-center"
              aria-label="Filter transactions"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
              </svg>
              {(selectedAssetType || selectedPlatform || selectedAccount) && (
                <span className="ml-1.5 text-xs">
                  ({[selectedAssetType && getAssetTypeInitials(selectedAssetType), selectedPlatform, selectedAccount].filter(Boolean).join(', ')})
                </span>
              )}
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-2.5 px-4 rounded-lg transition duration-200 text-sm shadow-lg"
            >
              + Add Transaction
            </button>
            <button
              onClick={() => setShowSettingsMenu(true)}
              className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-2.5 px-4 rounded-lg transition duration-200 text-sm shadow flex items-center justify-center"
              aria-label="Settings"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Filter Bottom Sheet - Mobile */}
      {showFilterMenu && (
        <div className="lg:hidden fixed inset-0 z-50" onClick={() => setShowFilterMenu(false)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black bg-opacity-50 dark:bg-opacity-70"></div>
          
          {/* Bottom Sheet */}
          <div 
            className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle Bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            </div>
            
            {/* Menu Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Filter Transactions</h3>
            </div>
            
            {/* Menu Options */}
            <div className="px-4 py-2 max-h-96 overflow-y-auto">
              {/* Asset Type Section */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 px-4 py-2">Asset Type</h4>
                <button
                  onClick={() => {
                    handleFilterChange('assetType', '');
                    setShowFilterMenu(false);
                  }}
                  className={`w-full text-left px-4 py-4 rounded-lg transition duration-150 ${
                    selectedAssetType === '' 
                      ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  All Asset Types
                </button>
                
                {assetTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => {
                      handleFilterChange('assetType', type.name);
                      setShowFilterMenu(false);
                    }}
                    className={`w-full text-left px-4 py-4 rounded-lg transition duration-150 ${
                      selectedAssetType === type.name 
                        ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {type.name}
                  </button>
                ))}
              </div>

              {/* Platform Section */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 px-4 py-2">Platform</h4>
                <button
                  onClick={() => {
                    handleFilterChange('platform', '');
                    setShowFilterMenu(false);
                  }}
                  className={`w-full text-left px-4 py-4 rounded-lg transition duration-150 ${
                    selectedPlatform === '' 
                      ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  All Platforms
                </button>
                
                {platforms.map((platform) => (
                  <button
                    key={platform.id}
                    onClick={() => {
                      handleFilterChange('platform', platform.name);
                      setShowFilterMenu(false);
                    }}
                    className={`w-full text-left px-4 py-4 rounded-lg transition duration-150 ${
                      selectedPlatform === platform.name 
                        ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {platform.name}
                  </button>
                ))}
              </div>

              {/* Account Section */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 px-4 py-2">Account</h4>
                <button
                  onClick={() => {
                    handleFilterChange('account', '');
                    setShowFilterMenu(false);
                  }}
                  className={`w-full text-left px-4 py-4 rounded-lg transition duration-150 ${
                    selectedAccount === '' 
                      ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  All Accounts
                </button>
                
                {accounts.map((account) => (
                  <button
                    key={account.id}
                    onClick={() => {
                      handleFilterChange('account', account.name);
                      setShowFilterMenu(false);
                    }}
                    className={`w-full text-left px-4 py-4 rounded-lg transition duration-150 ${
                      selectedAccount === account.name 
                        ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {account.name}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Close Button */}
            <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowFilterMenu(false)}
                className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-3 rounded-lg transition duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Bottom Sheet */}
      {showSettingsMenu && (
        <div className="fixed inset-0 z-50" onClick={() => setShowSettingsMenu(false)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black bg-opacity-50 dark:bg-opacity-70"></div>
          
          {/* Bottom Sheet */}
          <div 
            className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-2xl shadow-2xl max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle Bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            </div>
            
            {/* Menu Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Manage Settings</h3>
            </div>
            
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              
              {/* Asset Types Section */}
              <div className="mb-6">
                <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3">Asset Types</h4>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newAssetType}
                    onChange={(e) => setNewAssetType(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddAssetType()}
                    placeholder="Add new asset type"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-gray-100"
                  />
                  <button
                    onClick={handleAddAssetType}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                  >
                    Add
                  </button>
                </div>
                <div className="space-y-2">
                  {assetTypes.map((type) => (
                    <div key={type.id} className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{type.name}</span>
                      <button
                        onClick={() => handleDeleteAssetType(type.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Platforms Section */}
              <div className="mb-6">
                <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3">Platforms</h4>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newPlatform}
                    onChange={(e) => setNewPlatform(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddPlatform()}
                    placeholder="Add new platform"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-gray-100"
                  />
                  <button
                    onClick={handleAddPlatform}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                  >
                    Add
                  </button>
                </div>
                <div className="space-y-2">
                  {platforms.map((platform) => (
                    <div key={platform.id} className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{platform.name}</span>
                      <button
                        onClick={() => handleDeletePlatform(platform.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Accounts Section */}
              <div className="mb-4">
                <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3">Accounts</h4>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newAccount}
                    onChange={(e) => setNewAccount(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddAccount()}
                    placeholder="Add new account"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:text-gray-100"
                  />
                  <button
                    onClick={handleAddAccount}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                  >
                    Add
                  </button>
                </div>
                <div className="space-y-2">
                  {accounts.map((account) => (
                    <div key={account.id} className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{account.name}</span>
                      <button
                        onClick={() => handleDeleteAccount(account.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Close Button */}
            <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowSettingsMenu(false)}
                className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-3 rounded-lg transition duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionManager;
