import React, { useEffect } from 'react';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Dashboard from './pages/Dashboard.jsx';

function App() {
  useEffect(() => {
    fetch('http://localhost:5000/health')
      .then(res => res.json())
      .then(data => console.log('Backend /health:', data))
      .catch(err => console.error('API error:', err));
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      width: '100vw',
      margin: 0,
      padding: 0,
      boxSizing: 'border-box'
    }}>
      <Header />
      <main style={{
        flex: 1,
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#fff'
      }}>
        <Dashboard />
      </main>
      <Footer />
    </div>
  );
}

export default App;
