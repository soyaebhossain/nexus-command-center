import React, { Component, ReactNode, ErrorInfo } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppProvider } from './context/AppContext';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('NEXUS App Crash Caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#0b0d12',
          color: '#eef0f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            maxWidth: '600px',
            width: '100%',
            backgroundColor: '#12151d',
            border: '1px solid #f43f5e',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <span style={{ fontSize: '28px' }}>⚠️</span>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#f43f5e' }}>
                Application Workspace Encountered an Issue
              </h2>
            </div>
            <p style={{ fontSize: '13px', color: '#858b9b', lineHeight: 1.6, margin: '0 0 16px 0' }}>
              A component error occurred during rendering. You can easily reset the cache to restore the latest clean state.
            </p>
            <pre style={{
              fontSize: '12px',
              backgroundColor: '#0b0d12',
              padding: '16px',
              borderRadius: '12px',
              color: '#fda4af',
              fontFamily: 'monospace',
              overflowX: 'auto',
              border: '1px solid #252a36',
              whiteSpace: 'pre-wrap',
              maxHeight: '200px'
            }}>
              {this.state.error?.stack || this.state.error?.message || String(this.state.error)}
            </pre>
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                style={{
                  backgroundColor: '#a3e635',
                  color: '#0e1305',
                  fontWeight: 'bold',
                  padding: '10px 20px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                Clear Cache & Fresh Start
              </button>
              <button
                onClick={() => window.location.reload()}
                style={{
                  backgroundColor: '#1e2433',
                  color: '#eef0f6',
                  fontWeight: 'bold',
                  padding: '10px 20px',
                  borderRadius: '12px',
                  border: '1px solid #252a36',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppProvider>
        <App />
      </AppProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
