import React, { useState, useEffect } from 'react';

const TransactionForm = ({ token, assetTypes, transaction, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    scheme_name: '',
    asset_type: '',
    transaction_type: 'Buy',
    units: '',
    nav: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    platform: '',
    account: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [schemeNames, setSchemeNames] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [accounts, setAccounts] = useState([]);

  const apiUrl = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    fetchSchemeNames();
  }, []);

  useEffect(() => {
    if (transaction) {
      setFormData({
        scheme_name: transaction.scheme_name,
        asset_type: transaction.asset_type,
        transaction_type: transaction.transaction_type,
        units: transaction.units,
        nav: transaction.nav,
        amount: transaction.amount,
        date: transaction.date,
        platform: transaction.platform || '',
        account: transaction.account || '',
      });
    }
  }, [transaction]);

  const fetchSchemeNames = async () => {
    try {
      // Fetch unique scheme names from transactions
      const transactionsResponse = await fetch(`${apiUrl}/api/transactions`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (transactionsResponse.ok) {
        const transactions = await transactionsResponse.json();
        const uniqueSchemes = [...new Set(transactions.map(t => t.scheme_name))];
        setSchemeNames(uniqueSchemes);
      }

      // Fetch platforms from API
      const platformsResponse = await fetch(`${apiUrl}/api/platforms`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (platformsResponse.ok) {
        const platformsData = await platformsResponse.json();
        setPlatforms(platformsData.map(p => p.name));
      }

      // Fetch accounts from API
      const accountsResponse = await fetch(`${apiUrl}/api/accounts`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (accountsResponse.ok) {
        const accountsData = await accountsResponse.json();
        setAccounts(accountsData.map(a => a.name));
      }
    } catch (err) {
      console.error('Failed to fetch autocomplete data:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'units' || name === 'nav' || name === 'amount' ? parseFloat(value) || '' : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const method = transaction ? 'PUT' : 'POST';
      const url = transaction
        ? `${apiUrl}/api/transactions/${transaction.id}`
        : `${apiUrl}/api/transactions`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save transaction');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 mb-8">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6">
        {transaction ? 'Edit Transaction' : 'Add New Transaction'}
      </h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Scheme Name */}
        <div className="sm:col-span-2">
          <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2 text-sm">Scheme Name *</label>
          <input
            type="text"
            name="scheme_name"
            value={formData.scheme_name}
            onChange={handleChange}
            list="scheme-names"
            required
            autoComplete="off"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base bg-white dark:bg-gray-700 dark:text-gray-100"
            placeholder="e.g., Axis Blue Chip Fund"
          />
          <datalist id="scheme-names">
            {schemeNames.map((name, index) => (
              <option key={index} value={name} />
            ))}
          </datalist>
        </div>

        {/* Asset Type */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2 text-sm">Asset Type *</label>
          <select
            name="asset_type"
            value={formData.asset_type}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base bg-white dark:bg-gray-700 dark:text-gray-100"
          >
            <option value="">Select Asset Type</option>
            {assetTypes.map((type) => (
              <option key={type.id} value={type.name}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        {/* Transaction Type */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2 text-sm">Transaction Type *</label>
          <select
            name="transaction_type"
            value={formData.transaction_type}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base bg-white dark:bg-gray-700 dark:text-gray-100"
          >
            <option value="Buy">Buy</option>
            <option value="Sell">Sell</option>
            <option value="Dividend">Dividend</option>
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2 text-sm">Date *</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base bg-white dark:bg-gray-700 dark:text-gray-100"
          />
        </div>

        {/* Platform */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2 text-sm">Platform</label>
          <select
            name="platform"
            value={formData.platform}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base bg-white dark:bg-gray-700 dark:text-gray-100"
          >
            <option value="">Select platform (optional)</option>
            {platforms.map((name, index) => (
              <option key={index} value={name}>{name}</option>
            ))}
          </select>
        </div>

        {/* Account */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2 text-sm">Account</label>
          <select
            name="account"
            value={formData.account}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base bg-white dark:bg-gray-700 dark:text-gray-100"
          >
            <option value="">Select account (optional)</option>
            {accounts.map((name, index) => (
              <option key={index} value={name}>{name}</option>
            ))}
          </select>
        </div>

        {/* Units */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2 text-sm">Units *</label>
          <input
            type="number"
            name="units"
            value={formData.units}
            onChange={handleChange}
            required
            step="0.01"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base bg-white dark:bg-gray-700 dark:text-gray-100"
            placeholder="0.00"
          />
        </div>

        {/* NAV */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2 text-sm">NAV (Per Unit) *</label>
          <input
            type="number"
            name="nav"
            value={formData.nav}
            onChange={handleChange}
            required
            step="0.01"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base bg-white dark:bg-gray-700 dark:text-gray-100"
            placeholder="0.00"
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2 text-sm">Amount *</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
            step="0.01"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base bg-white dark:bg-gray-700 dark:text-gray-100"
            placeholder="0.00"
          />
        </div>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Submit Buttons */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200 text-base"
        >
          {isLoading ? 'Saving...' : (transaction ? 'Update Transaction' : 'Add Transaction')}
        </button>
        <button
          onClick={onCancel}
          type="button"
          className="flex-1 bg-gray-400 hover:bg-gray-500 dark:bg-gray-600 dark:hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 text-base"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default TransactionForm;
