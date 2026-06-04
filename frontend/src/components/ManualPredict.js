import React, { useState } from 'react';
import axios from 'axios';
import { Send } from 'lucide-react';

function ManualPredict({ apiUrl, onPredictSuccess }) {
  const [formData, setFormData] = useState({
    tx_amount: '',
    dist_from_home: '',
    dist_from_last_tx: '',
    ratio_to_median: '',
    pin_used: false
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      // Parse payload exactly as Pydantic expects (floats and booleans)
      const payload = {
        tx_amount: parseFloat(formData.tx_amount) || 0.0,
        dist_from_home: parseFloat(formData.dist_from_home) || 0.0,
        dist_from_last_tx: parseFloat(formData.dist_from_last_tx) || 0.0,
        ratio_to_median: parseFloat(formData.ratio_to_median) || 0.0,
        pin_used: formData.pin_used
      };

      const response = await axios.post(`${apiUrl}/predict`, payload);
      setResult(response.data);

      // Tell parent to refresh the recent transactions table
      if (onPredictSuccess) onPredictSuccess();

    } catch (error) {
      console.error("Manual prediction failed", error);
      setResult({ error: "Failed to connect to model API." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem', backgroundColor: '#fafafa' }}>
      <h3 style={{ margin: '0 0 1rem 0' }}>Manual Model Inquiry (Single Prediction)</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontSize: '0.85rem', marginBottom: '0.25rem', color: '#555' }}>Amount ($)</label>
          <input type="number" step="0.01" name="tx_amount" value={formData.tx_amount} onChange={handleChange} required style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontSize: '0.85rem', marginBottom: '0.25rem', color: '#555' }}>Dist. Home</label>
          <input type="number" step="0.1" name="dist_from_home" value={formData.dist_from_home} onChange={handleChange} required style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontSize: '0.85rem', marginBottom: '0.25rem', color: '#555' }}>Dist. Last TX</label>
          <input type="number" step="0.1" name="dist_from_last_tx" value={formData.dist_from_last_tx} onChange={handleChange} required style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontSize: '0.85rem', marginBottom: '0.25rem', color: '#555' }}>Ratio to Median</label>
          <input type="number" step="0.1" name="ratio_to_median" value={formData.ratio_to_median} onChange={handleChange} required style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingBottom: '0.5rem' }}>
          <input type="checkbox" name="pin_used" checked={formData.pin_used} onChange={handleChange} id="pin_used" />
          <label htmlFor="pin_used" style={{ fontSize: '0.85rem', color: '#555' }}>PIN Used</label>
        </div>

        <button type="submit" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', cursor: 'pointer', backgroundColor: '#2563eb', color: 'white', fontWeight: 'bold' }}>
          <Send size={16} /> {loading ? 'Scoring...' : 'Predict'}
        </button>
      </form>

      {/* Display Model Result */}
      {result && !result.error && (
        <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '4px', backgroundColor: result.is_fraud ? '#fee2e2' : '#dcfce7', border: `1px solid ${result.is_fraud ? '#fca5a5' : '#86efac'}` }}>
          <strong>Decision: </strong> {result.is_fraud ? '🚨 FRAUD' : '✅ CLEAN'} |
          <strong> Confidence: </strong> {(result.confidence * 100).toFixed(2)}% |
          <strong> Latency: </strong> {result.latency_ms.toFixed(2)}ms
        </div>
      )}
      {result && result.error && (
        <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '4px', backgroundColor: '#fee2e2', color: '#991b1b' }}>{result.error}</div>
      )}
    </section>
  );
}

export default ManualPredict;