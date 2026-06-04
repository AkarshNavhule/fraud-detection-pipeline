import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react'; // Added an icon for the loading spinner
import PipelineControls from './components/PipelineControls';
import ModelDocumentation from './components/ModelDocumentation';
import ManualPredict from './components/ManualPredict';
import RecentTransactions from './components/RecentTransactions';

// Pull the URL from the .env file, with a fallback just in case
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000';

function App() {
  // New state for health check
  const [isServerReady, setIsServerReady] = useState(false);

  const [pipelineActive, setPipelineActive] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [metrics, setMetrics] = useState({ totalChecked: 0, fraudCount: 0 });
  const [loading, setLoading] = useState(false);

  const pollingInterval = useRef(null);

  // --- HEALTH CHECK POLLING LOGIC ---
  useEffect(() => {
    let healthInterval;

    const checkBackendHealth = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/health`);
        if (response.status === 200) {
          setIsServerReady(true);
          clearInterval(healthInterval); // Stop pinging once connected
          fetchTransactions();           // Fetch initial data immediately
        }
      } catch (error) {
        console.warn("Waiting for backend server to wake up...");
      }
    };

    // Ping immediately on mount, then loop every 2 seconds
    checkBackendHealth();
    healthInterval = setInterval(checkBackendHealth, 2000);

    // Cleanup interval if component unmounts
    return () => clearInterval(healthInterval);
  }, []);

  // --- DATA FETCHING ---
  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/analytics/recent-transactions`);
      const data = response.data.data;
      setTransactions(data);

      if (data.length > 0) {
        const fraud = data.filter(tx => tx.fraud_flag.includes('FRAUD')).length;
        setMetrics({
          totalChecked: data.length,
          fraudCount: fraud
        });
      }
    } catch (error) {
      console.error("Error pulling pipeline analytics:", error);
    }
  };

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

  // --- PIPELINE DATA POLLING LOGIC ---
  useEffect(() => {
    // Only poll for live data if the server is actually ready AND the pipeline is active
    if (isServerReady && pipelineActive) {
      pollingInterval.current = setInterval(fetchTransactions, 2000);
    } else {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
    }

    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
    };
  }, [pipelineActive, isServerReady]);

  // --- CONDITIONAL RENDER: LOADING SCREEN ---
  if (!isServerReady) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f3f4f6', fontFamily: 'system-ui, sans-serif' }}>

        {/* Simple spinning animation built with inline CSS */}
        <div style={{ animation: 'spin 2s linear infinite', marginBottom: '1.5rem', color: '#2563eb' }}>
          <Loader2 size={48} />
        </div>

        <h2 style={{ margin: '0 0 0.5rem 0', color: '#1f2937' }}>Establishing Connection...</h2>
        <p style={{ color: '#6b7280', margin: 0 }}>Waiting for the FastAPI backend server to wake up.</p>

        {/* Injecting the keyframes for the spinner directly into the DOM */}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // --- MAIN DASHBOARD RENDER ---
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', maxWidth: '1200px', margin: '0 auto', backgroundColor: '#f3f4f6', minHeight: '100vh' }}>

      <ModelDocumentation />

      <PipelineControls
        pipelineActive={pipelineActive}
        loading={loading}
        metrics={metrics}
        togglePipeline={togglePipeline}
      />

      <ManualPredict
        apiUrl={API_BASE_URL}
        onPredictSuccess={fetchTransactions}
      />

      <RecentTransactions
        transactions={transactions}
        onRefresh={fetchTransactions}
      />

    </div>
  );
}

export default App;