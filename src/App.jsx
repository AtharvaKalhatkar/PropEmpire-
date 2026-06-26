import { useState, useEffect } from 'react';
import { Home, TrendingUp, FileText, Users, Moon, Sun, Settings as SettingsIcon } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Deals from './pages/Deals';
import CreateInvoice from './pages/CreateInvoice';
import Clients from './pages/Clients';
import VisitedClients from './pages/VisitedClients';
import Settings from './pages/Settings';
import PropertyCards from './pages/PropertyCards';
import logoImg from './assets/COMPANY_LOGO.png';

const ALL_TABS = ['dashboard', 'deals', 'invoice', 'clients', 'visited', 'cards', 'settings'];
const TABS = ['dashboard', 'deals', 'invoice', 'clients'];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [editingInvoice, setEditingInvoice] = useState(null);

  useEffect(() => {
    document.body.classList.toggle('light-theme', theme === 'light');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (ALL_TABS.includes(hash)) setActiveTab(hash);
    const handler = () => {
      const h = window.location.hash.replace('#', '');
      if (ALL_TABS.includes(h)) setActiveTab(h);
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    window.history.pushState(null, '', `#${tab}`);
    if (tab !== 'invoice') setEditingInvoice(null);
  };

  const handleEditInvoice = (invoice) => {
    setEditingInvoice(invoice);
    handleTabChange('invoice');
  };

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard onNavigate={handleTabChange} />;
      case 'deals': return <Deals onEditInvoice={handleEditInvoice} />;
      case 'invoice': return <CreateInvoice onNavigate={handleTabChange} editingInvoice={editingInvoice} setEditingInvoice={setEditingInvoice} />;
      case 'clients': return <Clients />;
      case 'visited': return <VisitedClients />;
      case 'cards': return <PropertyCards />;
      case 'settings': return <Settings />;
      default: return <Dashboard onNavigate={handleTabChange} />;
    }
  };

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="app-logo">
          <img src={logoImg} alt="PropEmpire" />
          <span>PropEmpire</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button className="theme-toggle" onClick={() => handleTabChange('settings')} aria-label="Settings">
            <SettingsIcon size={18} strokeWidth={1.8} />
          </button>
          <button className="theme-toggle" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={18} strokeWidth={1.8} /> : <Moon size={18} strokeWidth={1.8} />}
          </button>
        </div>
      </header>

      <main className="main-content animate-fade-in" key={activeTab}>
        {renderPage()}
      </main>

      <nav className="bottom-nav">
        {TABS.map(tab => {
          const icons = { dashboard: Home, deals: TrendingUp, invoice: FileText, clients: Users };
          const labels = { dashboard: 'Home', deals: 'Deals', invoice: 'Invoice', clients: 'Clients' };
          const Icon = icons[tab];
          return (
            <button
              key={tab}
              className={`nav-item ${activeTab === tab ? 'active' : ''}`}
              onClick={() => handleTabChange(tab)}
              aria-label={labels[tab]}
            >
              <Icon strokeWidth={activeTab === tab ? 2.2 : 1.6} />
              <span>{labels[tab]}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
