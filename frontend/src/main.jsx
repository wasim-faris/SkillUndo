import { StrictMode } from 'react'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'
import { googleClientId, hasGoogleClientId } from './utils/googleAuth';

if (!hasGoogleClientId) {
  console.warn('[SkillSwap] VITE_GOOGLE_CLIENT_ID not set. Google Auth will be disabled.');
}

// Error boundary to catch rendering errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    console.error('[ERROR] Rendering error:', error);
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ERROR] Details:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: '#f00', fontFamily: 'monospace' }}>
          <h1>Application Error</h1>
          <p>Check browser console for details.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

// eslint-disable-next-line react-refresh/only-export-components
function Root() {
  // Only use GoogleOAuthProvider if we have a valid client ID
  if (hasGoogleClientId) {
    return (
      <GoogleOAuthProvider clientId={googleClientId}>
        <App />
      </GoogleOAuthProvider>
    );
  }

  return <App />;
}

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Could not find root element with id="root"');
  }

  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <Root />
      </ErrorBoundary>
    </StrictMode>,
  );
} catch (e) {
  console.error('[FATAL] Error initializing app:', e);
}
