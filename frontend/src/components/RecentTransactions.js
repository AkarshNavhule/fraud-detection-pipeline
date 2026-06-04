import React, { useState } from 'react';
import { Database, RefreshCw } from 'lucide-react';

function RecentTransactions({ transactions, onRefresh }) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshClick = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Ensure transactions is always an array before mapping over it
  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  return (
    <section style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1.5rem', backgroundColor: '#fff' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Database size={18} color="#666" />
          <h3 style={{ margin: 0 }}>Live Data Stream (Supabase Sink)</h3>
        </div>

        <button
          onClick={handleRefreshClick}
          disabled={isRefreshing}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem',
            borderRadius: '6px', border: '1px solid #d1d5db', cursor: isRefreshing ? 'wait' : 'pointer',
            backgroundColor: '#f9fafb', color: '#374151', fontWeight: '500'
          }}
        >
          <div style={{ transform: isRefreshing ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}>
            <RefreshCw size={16} />
          </div>
          Refresh Data
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '0.75rem', color: '#555' }}>Transaction ID</th>
              <th style={{ padding: '0.75rem', color: '#555' }}>Amount</th>
              <th style={{ padding: '0.75rem', color: '#555' }}>Dist. Home</th>
              <th style={{ padding: '0.75rem', color: '#555' }}>Dist. Last TX</th>
              <th style={{ padding: '0.75rem', color: '#555' }}>Ratio to Median</th>
              <th style={{ padding: '0.75rem', color: '#555' }}>PIN Used</th>
              <th style={{ padding: '0.75rem', color: '#555' }}>Model Decision</th>
              <th style={{ padding: '0.75rem', color: '#555' }}>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {safeTransactions.length === 0 ? (
              <tr>
                {/* Updated colSpan from 4 to 8 to span the whole wider table */}
                <td colSpan="8" style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
                  No data available. Start the pipeline or submit a manual prediction.
                </td>
              </tr>
            ) : (
              safeTransactions.map((tx, index) => (
                <tr key={tx?.id || index} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.85rem' }}>{tx?.id}</td>
                  <td style={{ padding: '0.75rem', fontWeight: '500' }}>{tx?.amount}</td>

                  {/* New Columns */}
                  <td style={{ padding: '0.75rem', color: '#444' }}>
                    {tx?.dist_from_home !== undefined ? Number(tx.dist_from_home).toFixed(1) : 'N/A'}
                  </td>
                  <td style={{ padding: '0.75rem', color: '#444' }}>
                    {tx?.dist_from_last_tx !== undefined ? Number(tx.dist_from_last_tx).toFixed(1) : 'N/A'}
                  </td>
                  <td style={{ padding: '0.75rem', color: '#444' }}>
                    {tx?.ratio_to_median !== undefined ? Number(tx.ratio_to_median).toFixed(1) : 'N/A'}
                  </td>
                  <td style={{ padding: '0.75rem', color: '#444' }}>
                    {tx?.pin_used ? 'Yes' : 'No'}
                  </td>

                  {/* Existing Columns */}
                  <td style={{ padding: '0.75rem', fontWeight: 'bold', color: tx?.fraud_flag?.includes('FRAUD') ? '#ef4444' : '#10b981' }}>{tx?.fraud_flag}</td>
                  <td style={{ padding: '0.75rem', color: '#666', fontSize: '0.9rem' }}>
                    {tx?.time ? new Date(tx.time).toLocaleTimeString() : 'N/A'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default RecentTransactions;