import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import PipelineControls from './components/PipelineControls';
import ModelDocumentation from './components/ModelDocumentation'; // <-- NEW IMPORT
import ManualPredict from './components/ManualPredict';
import RecentTransactions from './components/RecentTransactions';

const API_BASE_URL = 'http://127.0.0.1:8000';

function App() {
  const [pipelineActive, setPipelineActive] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [metrics, setMetrics] = useState({ totalChecked: 0, fraudCount: 0 });
  const [loading, setLoading] = useState(false);
  const pollingInterval = useRef(null);

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

  useEffect(() => {
    fetchTransactions();

    if (pipelineActive) {
      pollingInterval.current = setInterval(fetchTransactions, 2000);
    } else {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
    }

    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
    };
  }, [pipelineActive]);

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