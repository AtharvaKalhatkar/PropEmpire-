import { useState, useEffect } from 'react';
import { Home, FileText, Users, Settings as SettingsIcon, Bell, TrendingUp, Moon, Sun } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Deals from './pages/Deals';
import CreateInvoice from './pages/CreateInvoice';
import Clients from './pages/Clients';
import Settings from './pages/Settings';
import logoImg from './assets/logo-new.png';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!window.location.hash) {
      window.history.replaceState(null, '', '#dashboard');
    } else {
      const hashTab = window.location.hash.replace('#', '');
      if (['dashboard', 'deals', 'invoice', 'clients', 'settings'].includes(hashTab)) {
        setActiveTab(hashTab);
      }
    }

    const handlePopState = () => {
      const hashTab = window.location.hash.replace('#', '');
      if (['dashboard', 'deals', 'invoice', 'clients', 'settings'].includes(hashTab)) {
        setActiveTab(hashTab);
      } else {
        setActiveTab('dashboard');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    window.history.pushState(null, '', `#${tab}`);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="app-layout">
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
        {/* Mobile Header */}
        <header className="app-header">
          <div className="app-logo">
            <img src={logoImg} alt="PropEmpire" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
            PropEmpire
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button onClick={toggleTheme} style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
            </button>
            <SettingsIcon size={24} color="var(--text-muted)" onClick={() => handleTabChange('settings')} style={{ cursor: 'pointer' }} />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="main-content animate-fade-in">
          {activeTab === 'dashboard' && <Dashboard onNavigate={handleTabChange} />}
          {activeTab === 'deals' && <Deals />}
          {activeTab === 'invoice' && <CreateInvoice onNavigate={handleTabChange} />}
          {activeTab === 'clients' && <Clients />}
          {activeTab === 'settings' && <Settings />}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="bottom-nav">
        <a href="#dashboard" className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); handleTabChange('dashboard'); }}>
          <Home />
          <span>Home</span>
        </a>
        <a href="#deals" className={`nav-item ${activeTab === 'deals' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); handleTabChange('deals'); }}>
          <TrendingUp />
          <span>Deals</span>
        </a>
        <a href="#invoice" className={`nav-item ${activeTab === 'invoice' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); handleTabChange('invoice'); }}>
          <FileText />
          <span>Invoice</span>
        </a>
        <a href="#clients" className={`nav-item ${activeTab === 'clients' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); handleTabChange('clients'); }}>
          <Users />
          <span>Clients</span>
        </a>
      </nav>
    </div>
  );
}

export default App;
