import React, { useState } from 'react';

const TransactionList = ({ transactions, isLoading, onEdit, onDelete }) => {
  const [longPressMenu, setLongPressMenu] = useState(null);
  const [touchStartTime, setTouchStartTime] = useState(null);
  const [touchStartPos, setTouchStartPos] = useState(null);

  // Helper function to get asset type initials
  const getAssetTypeInitials = (assetType) => {
    const words = assetType.split(' ');
    if (words.length === 1) return assetType;
    return words.map(word => word[0]).join('').toUpperCase();
  };

  const handleTouchStart = (e, transactionId) => {
    setTouchStartTime(Date.now());
    setTouchStartPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleTouchEnd = (e, transaction) => {
    if (!touchStartTime || !touchStartPos) return;

    const touchEndTime = Date.now();
    const touchEndPos = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    
    // Check if it's a long press (> 500ms) and minimal movement
    const isLongPress = touchEndTime - touchStartTime > 500;
    const movedDistance = Math.sqrt(
      Math.pow(touchEndPos.x - touchStartPos.x, 2) + 
      Math.pow(touchEndPos.y - touchStartPos.y, 2)
    );
    
    if (isLongPress && movedDistance < 20) {
      setLongPressMenu({
        id: transaction.id,
        x: touchEndPos.x,
        y: touchEndPos.y
      });
    }

    setTouchStartTime(null);
    setTouchStartPos(null);
  };

  const closeLongPressMenu = () => {
    setLongPressMenu(null);
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">Loading transactions...</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">No transactions found. Add one to get started!</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden w-full" onClick={closeLongPressMenu}>
      {/* Desktop View - Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full min-w-max">
          <thead className="bg-gray-100 dark:bg-gray-700 border-b dark:border-gray-600">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Scheme Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Asset Type</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Type</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Units</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">NAV</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Amount</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Date</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-gray-700">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                  <div>{transaction.scheme_name}</div>
                  {(transaction.platform || transaction.account) && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {transaction.platform && <span>{transaction.platform}</span>}
                      {transaction.platform && transaction.account && <span> • </span>}
                      {transaction.account && <span>{transaction.account}</span>}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {transaction.asset_type}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{transaction.transaction_type}</td>
                <td className="px-6 py-4 text-sm text-right text-gray-900 dark:text-gray-100">{parseFloat(transaction.units).toFixed(2)}</td>
                <td className="px-6 py-4 text-sm text-right text-gray-900 dark:text-gray-100">₹{parseFloat(transaction.nav).toFixed(2)}</td>
                <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900 dark:text-gray-100">₹{parseFloat(transaction.amount).toFixed(2)}</td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{transaction.date}</td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => onEdit(transaction)}
                      className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(transaction.id)}
                      className="text-red-600 hover:text-red-800 font-semibold text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View - Compact Table */}
      <div className="lg:hidden">
        {/* Header Row */}
        <div className="bg-gray-100 dark:bg-gray-700 border-b dark:border-gray-600 px-3 py-2 grid grid-cols-4 gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
          <div className="col-span-2">Scheme</div>
          <div className="text-center">Type</div>
          <div className="text-right">Amount</div>
        </div>
        
        {/* Data Rows */}
        <div className="divide-y dark:divide-gray-700">
          {transactions.map((transaction) => (
            <div 
              key={transaction.id} 
              className="px-3 py-3 select-none"
              onTouchStart={(e) => handleTouchStart(e, transaction.id)}
              onTouchEnd={(e) => handleTouchEnd(e, transaction)}
            >
              {/* Main Row */}
              <div className="grid grid-cols-4 gap-2 items-center mb-2">
                <div className="col-span-2 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{transaction.scheme_name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{transaction.date}</div>
                  {(transaction.platform || transaction.account) && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 opacity-75">
                      {transaction.platform && <span>{transaction.platform}</span>}
                      {transaction.platform && transaction.account && <span> • </span>}
                      {transaction.account && <span>{transaction.account}</span>}
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300">
                    {getAssetTypeInitials(transaction.asset_type)}
                  </span>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{transaction.transaction_type}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">₹{parseFloat(transaction.amount).toFixed(2)}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{parseFloat(transaction.units).toFixed(2)} @ ₹{parseFloat(transaction.nav).toFixed(2)}</div>
                </div>
              </div>
              
              {/* Actions Row - Hidden by default, shown on long press */}
              <div className={`flex gap-3 pt-2 border-t border-gray-100 dark:border-gray-700 ${longPressMenu?.id === transaction.id ? 'block' : 'hidden'}`}>
                <button
                  onClick={() => {
                    onEdit(transaction);
                    closeLongPressMenu();
                  }}
                  className="flex-1 text-blue-600 hover:text-blue-800 font-semibold text-sm py-1"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    onDelete(transaction.id);
                    closeLongPressMenu();
                  }}
                  className="flex-1 text-red-600 hover:text-red-800 font-semibold text-sm py-1"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TransactionList;
