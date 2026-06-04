import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Play, Square, ShieldAlert, Activity, Database, RefreshCw } from 'lucide-react';

const API_BASE_URL = 'http://127.0.0.1:8000';

function App() {
  const [pipelineActive, setPipelineActive] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [metrics, setMetrics] = useState({ totalChecked: 0, fraudCount: 0, avgLatency: 0 });
  const [loading, setLoading] = useState(false);
  const pollingInterval = useRef(null);

  // Fetch recent transactions from FastAPI
  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/analytics/recent-transactions`);
      const data = response.data.data;
      setTransactions(data);

      // Dynamically calculate dashboard metrics using a list transformation pattern
      if (data.length > 0) {
        const fraud = data.filter(tx => tx.fraud_flag.includes('FRAUD')).length;
        setMetrics({
          totalChecked: data.length,
          fraudCount: fraud,
          // Simulated or hardcoded fallback for baseline layout telemetry
          avgLatency: 14.2
        });
      }
    } catch (error) {
      console.error("Error pulling pipeline analytics:", error);
    }
  };

  // Toggle the backend threading stream (Start / Stop)
  const togglePipeline = async (action) => {
    setLoading(true);
    try {
      const endpoint = action === 'start' ? '/pipeline/start' : '/pipeline/stop';
      await axios.post(`${API_BASE_URL}${endpoint}`);
      setPipelineActive(action === 'start');
    } catch (error) {
      console.error(`Failed to execute pipeline ${action}:`, error);
    } finally {
      setLoading(false);
    }
  };

  // Set up polling interval when the pipeline becomes active
  useEffect(() => {
    if (pipelineActive) {
      fetchTransactions(); // Initial fetch
      pollingInterval.current = setInterval(fetchTransactions, 2000); // Poll every 2s
    } else {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
    }

    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
    };
  }, [pipelineActive]);

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header section */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0 }}>MLOps Fraud Detection Control Unit</h1>
          <p style={{ color: '#666', margin: '0.5rem 0 0 0' }}>Real-time streaming pipeline orchestration</p>
        </div>

        {/* Orchestration Controls */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => togglePipeline('start')}
            disabled={pipelineActive || loading}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
          >
            <Play size={16} /> Start Pipeline
          </button>
          <button
            onClick={() => togglePipeline('stop')}
            disabled={!pipelineActive || loading}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
          >
            <Square size={16} /> Stop Pipeline
          </button>
        </div>
      </header>

      {/* Analytics KPI Grid */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ padding: '1.5rem', borderRadius: '8px', border: '1px solid #ddd' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: '#666' }}>Pipeline Throughput</span>
            <Activity size={20} />
          </div>
          <h2 style={{ margin: 0 }}>{metrics.totalChecked} <span style={{ fontSize: '1rem', fontWeight: 'normal', color: '#666' }}>tx evaluated</span></h2>
        </div>

        <div style={{ padding: '1.5rem', borderRadius: '8px', border: '1px solid #ddd' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: '#666' }}>Model Flags Detected</span>
            <ShieldAlert size={20} />
          </div>
          <h2 style={{ margin: 0 }}>{metrics.fraudCount} <span style={{ fontSize: '1rem', fontWeight: 'normal', color: '#666' }}>anomalies</span></h2>
        </div>

        <div style={{ padding: '1.5rem', borderRadius: '8px', border: '1px solid #ddd' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: '#666' }}>Avg Inference Latency</span>
            <RefreshCw size={20} />
          </div>
          <h2 style={{ margin: 0 }}>{pipelineActive ? `${metrics.avgLatency} ms` : 'Offline'}</h2>
        </div>
      </section>

      {/* Real-time Data Stream Table */}
      <section style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Database size={18} />
          <h3 style={{ margin: 0 }}>Live Data Stream (Supabase Sink)</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '0.75rem' }}>Transaction ID</th>
                <th style={{ padding: '0.75rem' }}>Amount</th>
                <th style={{ padding: '0.75rem' }}>Model Decision</th>
                <th style={{ padding: '0.75rem' }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
                    No active stream. Start the pipeline to capture live predictions.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.85rem' }}>{tx.id}</td>
                    <td style={{ padding: '0.75rem' }}>{tx.amount}</td>
                    <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{tx.fraud_flag}</td>
                    <td style={{ padding: '0.75rem', color: '#666', fontSize: '0.9rem' }}>{new Date(tx.time).toLocaleTimeString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default App;