import { useState, useEffect } from 'react';
import { PlusCircle, MapPin, Users, Image, ArrowUpRight, TrendingUp } from 'lucide-react';
import { getInvoices, getClients } from '../db';
import { formatINR } from '../utils/invoiceTemplate';

export default function Dashboard({ onNavigate }) {
  const [stats, setStats] = useState({ earnings: 0, activeLeads: 0, totalDeals: 0 });
  const [recentInvoices, setRecentInvoices] = useState([]);

  useEffect(() => {
    Promise.all([getInvoices(), getClients()]).then(([invoices, clients]) => {
      const totalEarnings = invoices.reduce((sum, inv) => {
        const broker = (Number(inv.agreementValue) * Number(inv.brokeragePercent)) / 100;
        return sum + broker + Number(inv.executiveBonus);
      }, 0);
      setStats({
        earnings: totalEarnings,
        activeLeads: clients.filter(c => c.status !== 'Closed').length,
        totalDeals: invoices.length,
      });
      setRecentInvoices(invoices.slice(0, 5));
    });
  }, []);

  const actions = [
    { icon: PlusCircle, label: 'New Invoice', bg: 'var(--primary-subtle)', color: 'var(--primary)', tab: 'invoice' },
    { icon: MapPin, label: 'Log Visit', bg: 'var(--success-subtle)', color: 'var(--success)', tab: 'visited' },
    { icon: Users, label: 'Clients', bg: 'var(--danger-subtle)', color: 'var(--danger)', tab: 'clients' },
    { icon: Image, label: 'Share Cards', bg: 'var(--warning-subtle)', color: 'var(--warning)', tab: 'cards' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-24">
        <h1 style={{ fontSize: 26, marginBottom: 2 }}>Overview</h1>
        <p style={{ margin: 0 }}>Your business at a glance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid-2 mb-24">
        <div style={{
          background: 'linear-gradient(135deg, var(--primary), #4f46e5)',
          borderRadius: 'var(--radius)',
          padding: '20px 18px',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(99, 102, 241, 0.2)'
        }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
          <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
            Total Earnings
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1 }}>
            ₹{formatINR(stats.earnings)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 10, fontSize: 11, fontWeight: 600, opacity: 0.8 }}>
            <TrendingUp size={12} /> {stats.totalDeals} deals closed
          </div>
        </div>

        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '20px 18px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, background: 'var(--primary-subtle)', borderRadius: '50%' }} />
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
            Active Leads
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1 }}>
            {stats.activeLeads}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 10, fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)' }}>
            <Users size={12} /> CRM pipeline
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-24">
        <div className="section-title">Quick Actions</div>
        <div className="grid-2">
          {actions.map(a => {
            const Icon = a.icon;
            return (
              <button key={a.label} className="quick-action" onClick={() => onNavigate(a.tab)}>
                <div className="icon-wrap" style={{ background: a.bg, color: a.color }}>
                  <Icon size={22} strokeWidth={1.8} />
                </div>
                <span>{a.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Invoices */}
      <div>
        <div className="flex items-center justify-between mb-12">
          <div className="section-title" style={{ margin: 0 }}>Recent Invoices</div>
          {recentInvoices.length > 0 && (
            <button
              onClick={() => onNavigate('deals')}
              style={{
                background: 'none', border: 'none', color: 'var(--primary)',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 2
              }}
            >
              View all <ArrowUpRight size={13} />
            </button>
          )}
        </div>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {recentInvoices.length === 0 ? (
            <div className="empty-state"><p>No invoices yet</p></div>
          ) : (
            recentInvoices.map((inv, idx) => {
              const total = ((Number(inv.agreementValue) * Number(inv.brokeragePercent)) / 100) + Number(inv.executiveBonus);
              return (
                <div key={inv.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '14px 18px',
                  borderBottom: idx < recentInvoices.length - 1 ? '1px solid var(--border)' : 'none',
                  transition: 'background 150ms',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                onClick={() => onNavigate('deals')}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 2 }}>{inv.customerName}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{inv.projectName} • #{inv.invoiceNo}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                    <div className="amount" style={{ fontSize: 14 }}>₹{formatINR(total)}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{new Date(inv.date).toLocaleDateString('en-GB')}</div>
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
