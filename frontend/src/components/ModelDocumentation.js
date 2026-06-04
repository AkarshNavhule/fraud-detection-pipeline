import React from 'react';
import { Cpu, GitBranch, Info } from 'lucide-react';

function ModelDocumentation() {
  return (
    <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>

      {/* Model Information Card */}
      <div style={{ padding: '1.5rem', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: '#fff', lineHeight: '1.6' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '2px solid #f3f4f6', paddingBottom: '0.5rem' }}>
          <Cpu size={20} color="#2563eb" />
          <h3 style={{ margin: 0, color: '#1f2937' }}>Model Architecture & Training</h3>
        </div>

        <p style={{ fontSize: '0.9rem', color: '#4b5563', marginTop: 0 }}>
          <strong>Algorithm:</strong> XGBoost (Extreme Gradient Boosting) Classifier. Chosen for its industry-standard performance on tabular financial data and fast inference times.
        </p>

        <div style={{ fontSize: '0.9rem', color: '#4b5563', marginBottom: '1rem' }}>
          <strong>Training Parameters:</strong>
          <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
            <li>Dataset: 10,000 synthetic records</li>
            <li>Class Weights: <code>[0.95, 0.05]</code> (Simulating real-world 5% fraud class imbalance)</li>
            <li>Hyperparameters: <code>n_estimators=100</code>, <code>max_depth=3</code>, <code>learning_rate=0.1</code></li>
          </ul>
        </div>

        <div style={{ fontSize: '0.85rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
          <strong>Sample Behaviors:</strong>
          <div style={{ marginTop: '0.5rem' }}>
            <span style={{ color: '#10b981', fontWeight: 'bold' }}>✅ CLEAN:</span> Low amount ($25), close to home (3 miles), normal spending ratio, PIN used.
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            <span style={{ color: '#ef4444', fontWeight: 'bold' }}>🚨 FRAUD:</span> High amount ($8000+), huge distance (2000 miles), 10x median spending, PIN bypassed.
          </div>
        </div>
      </div>

      {/* Pipeline Information Card */}
      <div style={{ padding: '1.5rem', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: '#fff', lineHeight: '1.6' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', borderBottom: '2px solid #f3f4f6', paddingBottom: '0.5rem' }}>
          <GitBranch size={20} color="#8b5cf6" />
          <h3 style={{ margin: 0, color: '#1f2937' }}>Data Pipeline & Orchestration</h3>
        </div>

        <p style={{ fontSize: '0.9rem', color: '#4b5563', marginTop: 0 }}>
          <strong>How it works:</strong> The backend utilizes Python's <code>threading</code> module inside FastAPI to run a continuous data generator. This ensures the main API thread remains unblocked and highly responsive to incoming HTTP requests while batch processing happens in the background.
        </p>

        <p style={{ fontSize: '0.9rem', color: '#4b5563' }}>
          <strong>Synthetic Stream Generation:</strong>
          When the pipeline is activated, a daemon thread generates a new transaction every 2 seconds using Python's <code>random.uniform()</code> module.
        </p>

        <div style={{ fontSize: '0.85rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Info size={16} color="#64748b" /> <strong>Anomaly Injection logic:</strong>
          </div>
          To prove the model's recall capabilities, the generator is hard-coded with a 5% probability trigger. When triggered, it artificially spikes the transaction amount to $8,000, sets the distance to 2,000 miles, and drops the PIN requirement—forcing the model to catch the anomaly in real-time.
        </div>
      </div>

    </section>
  );
}

export default ModelDocumentation;