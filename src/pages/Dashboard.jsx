import { useState, useEffect } from 'react';
import { PlusCircle, TrendingUp, Users, MapPin, DollarSign, Image } from 'lucide-react';
import { getInvoices, getClients } from '../db';

export default function Dashboard({ onNavigate }) {
  const [stats, setStats] = useState({ earnings: 0, activeLeads: 0 });
  const [recentInvoices, setRecentInvoices] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const invoices = await getInvoices();
      const clients = await getClients();
      
      const totalEarnings = invoices.reduce((sum, inv) => {
        const broker = (Number(inv.agreementValue) * Number(inv.brokeragePercent)) / 100;
        return sum + broker + Number(inv.executiveBonus);
      }, 0);
      
      const activeLeads = clients.filter(c => c.status !== 'Closed').length;
      
      setStats({ earnings: totalEarnings, activeLeads });
      setRecentInvoices(invoices.slice(0, 3)); // top 3
    };
    
    loadData();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ marginBottom: '0.5rem' }}>Overview</h1>
        <p>Welcome back! Here's your business at a glance.</p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="card" style={{ background: 'var(--gradient-primary)', color: 'white', border: 'none', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: '-10%', top: '-20%', opacity: 0.1 }}>
            <DollarSign size={120} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', opacity: 0.9 }}>
            <DollarSign size={20} color="white" />
            <h3 style={{ fontSize: '1rem', color: 'white', margin: 0 }}>Total Earnings</h3>
          </div>
          <p style={{ fontSize: '2.5rem', fontWeight: '800', margin: 0, wordBreak: 'break-word', color: 'white' }}>₹ {stats.earnings.toLocaleString('en-IN')}</p>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>
            <Users size={20} />
            <h3 style={{ fontSize: '1rem', color: 'inherit', margin: 0 }}>Active Leads</h3>
          </div>
          <p style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>{stats.activeLeads}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          <button 
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1rem 0.5rem', background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={() => onNavigate('invoice')}
          >
            <div style={{ width: '56px', height: '56px', borderRadius: '1rem', backgroundColor: '#eff6ff', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
              <PlusCircle size={28} />
            </div>
            <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-main)' }}>New Invoice</span>
          </button>
          
          <button 
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1rem 0.5rem', background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={() => onNavigate('visited')}
          >
            <div style={{ width: '56px', height: '56px', borderRadius: '1rem', backgroundColor: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
              <MapPin size={28} />
            </div>
            <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-main)' }}>Visits</span>
          </button>
          
          <button 
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1rem 0.5rem', background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={() => onNavigate('clients')}
          >
            <div style={{ width: '56px', height: '56px', borderRadius: '1rem', backgroundColor: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
              <Users size={28} />
            </div>
            <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-main)' }}>Clients</span>
          </button>
          
          <button 
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1rem 0.5rem', background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={() => onNavigate('cards')}
          >
            <div style={{ width: '56px', height: '56px', borderRadius: '1rem', backgroundColor: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
              <Image size={28} />
            </div>
            <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-main)' }}>Cards</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card" style={{ padding: '0' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Recent Invoices</h2>
        </div>
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {recentInvoices.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No invoices generated yet.</p>
          ) : (
            recentInvoices.map(inv => {
              const broker = (Number(inv.agreementValue) * Number(inv.brokeragePercent)) / 100;
              const total = broker + Number(inv.executiveBonus);
              return (
                <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                  <div>
                    <h4 style={{ margin: 0, color: 'var(--text-main)' }}>{inv.customerName}</h4>
                    <p style={{ margin: 0, fontSize: '0.875rem' }}>{inv.projectName} • Inv #{inv.invoiceNo}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontWeight: '600', color: 'var(--primary-blue)' }}>₹ {total.toLocaleString('en-IN')}</p>
                    <p style={{ margin: 0, fontSize: '0.75rem' }}>{new Date(inv.date).toLocaleDateString()}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
