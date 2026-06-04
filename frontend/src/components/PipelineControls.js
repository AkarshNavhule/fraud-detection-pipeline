import React from 'react';
import { Play, Square, ShieldAlert, Activity } from 'lucide-react';

function PipelineControls({ pipelineActive, loading, metrics, togglePipeline }) {
  return (
    <div style={{ marginBottom: '2rem' }}>
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
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', backgroundColor: pipelineActive ? '#e0e0e0' : '#dcfce7', color: pipelineActive ? '#999' : '#166534' }}
          >
            <Play size={16} /> Start Pipeline
          </button>
          <button
            onClick={() => togglePipeline('stop')}
            disabled={!pipelineActive || loading}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', backgroundColor: !pipelineActive ? '#e0e0e0' : '#fee2e2', color: !pipelineActive ? '#999' : '#991b1b' }}
          >
            <Square size={16} /> Stop Pipeline
          </button>
        </div>
      </header>

      {/* Analytics KPI Grid - Updated to 2 columns */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        <div style={{ padding: '1.5rem', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: '#666' }}>Pipeline Throughput</span>
            <Activity size={20} color="#3b82f6" />
          </div>
          <h2 style={{ margin: 0 }}>{metrics.totalChecked} <span style={{ fontSize: '1rem', fontWeight: 'normal', color: '#666' }}>tx evaluated</span></h2>
        </div>

        <div style={{ padding: '1.5rem', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: '#666' }}>Model Flags Detected</span>
            <ShieldAlert size={20} color="#ef4444" />
          </div>
          <h2 style={{ margin: 0 }}>{metrics.fraudCount} <span style={{ fontSize: '1rem', fontWeight: 'normal', color: '#666' }}>anomalies</span></h2>
        </div>
      </section>
    </div>
  );
}

export default PipelineControls;