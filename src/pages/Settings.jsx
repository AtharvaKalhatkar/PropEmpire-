import { useState, useEffect } from 'react';
import { Save, User, Building, Image as ImageIcon, Check, Upload, X } from 'lucide-react';
import { getProfile, saveProfile } from '../db';

const D = { agentName:'', email:'', mobile:'', reraNo:'', panNo:'', bankFavouringName:'', bankName:'', accountType:'Saving', accountNo:'', ifscCode:'', logoImage:'' };

export default function Settings() {
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getProfile().then(d => setProfile({...D,...(d||{})})).catch(()=>setProfile(D));
  }, []);

  const chg = e => setProfile(p=>({...p,[e.target.name]:e.target.value}));

  const handleImg = e => {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onloadend = () => setProfile(p=>({...p,logoImage:r.result}));
    r.readAsDataURL(f);
  };

  const handleSave = async () => {
    setSaving(true);
    await saveProfile(profile);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!profile) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '40vh' }}>
      <div style={{
        width: 36, height: 36, border: '3px solid var(--border)',
        borderTopColor: 'var(--primary)', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-24">
        <div>
          <h1 style={{ fontSize: 26, margin: 0 }}>Settings</h1>
          <p style={{ margin: '2px 0 0' }}>Manage your profile</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{
          fontSize: 13, padding: '8px 18px',
          background: saved ? 'var(--success)' : undefined,
          boxShadow: saved ? '0 2px 8px rgba(34,197,94,0.25)' : undefined
        }}>
          {saved ? <><Check size={15} /> Saved</> : <><Save size={15} /> {saving ? 'Saving...' : 'Save'}</>}
        </button>
      </div>

      {/* Agent Details */}
      <div className="card mb-16">
        <div className="section-title flex items-center gap-8">
          <div style={{
            width: 24, height: 24, borderRadius: 'var(--radius-xs)',
            background: 'var(--primary-subtle)', display: 'flex',
            alignItems: 'center', justifyContent: 'center'
          }}>
            <User size={13} color="var(--primary)" />
          </div>
          Agent Details
        </div>
        <div className="form-group">
          <label className="form-label">Name</label>
          <input type="text" className="form-input" name="agentName" value={profile.agentName} onChange={chg} placeholder="Your full name" />
        </div>
        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className="form-input" name="email" value={profile.email} onChange={chg} placeholder="Email address" />
          </div>
          <div className="form-group">
            <label className="form-label">Mobile</label>
            <input type="text" className="form-input" name="mobile" value={profile.mobile} onChange={chg} placeholder="Phone number" />
          </div>
        </div>
        <div className="form-grid-2">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">RERA No.</label>
            <input type="text" className="form-input" name="reraNo" value={profile.reraNo} onChange={chg} placeholder="RERA registration" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">PAN No.</label>
            <input type="text" className="form-input" name="panNo" value={profile.panNo} onChange={chg} placeholder="PAN number" />
          </div>
        </div>
      </div>

      {/* Bank Details */}
      <div className="card mb-16">
        <div className="section-title flex items-center gap-8">
          <div style={{
            width: 24, height: 24, borderRadius: 'var(--radius-xs)',
            background: 'var(--success-subtle)', display: 'flex',
            alignItems: 'center', justifyContent: 'center'
          }}>
            <Building size={13} color="var(--success)" />
          </div>
          Bank Details
        </div>
        <div className="form-group">
          <label className="form-label">Favouring</label>
          <input type="text" className="form-input" name="bankFavouringName" value={profile.bankFavouringName} onChange={chg} placeholder="Account holder name" />
        </div>
        <div className="form-group">
          <label className="form-label">Bank & Branch</label>
          <textarea className="form-input" name="bankName" rows="2" value={profile.bankName} onChange={chg} placeholder="Bank name and branch" />
        </div>
        <div className="form-grid-3">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Type</label>
            <select className="form-input" name="accountType" value={profile.accountType} onChange={chg}>
              <option value="Saving">Saving</option><option value="Current">Current</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Account No.</label>
            <input type="text" className="form-input" name="accountNo" value={profile.accountNo} onChange={chg} placeholder="Account no." />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">IFSC</label>
            <input type="text" className="form-input" name="ifscCode" value={profile.ifscCode} onChange={chg} placeholder="IFSC code" />
          </div>
        </div>
      </div>

      {/* Logo */}
      <div className="card">
        <div className="section-title flex items-center gap-8">
          <div style={{
            width: 24, height: 24, borderRadius: 'var(--radius-xs)',
            background: 'var(--warning-subtle)', display: 'flex',
            alignItems: 'center', justifyContent: 'center'
          }}>
            <ImageIcon size={13} color="var(--warning)" />
          </div>
          Company Logo
        </div>
        {profile.logoImage ? (
          <div className="flex items-center gap-16 mb-12">
            <div style={{
              width: 80, height: 80, border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', padding: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'white'
            }}>
              <img src={profile.logoImage} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            </div>
            <button onClick={() => setProfile(p => ({...p, logoImage: ''}))} className="btn btn-secondary" style={{
              fontSize: 12, padding: '6px 14px', color: 'var(--danger)'
            }}>
              <X size={14} /> Remove
            </button>
          </div>
        ) : null}
        <label style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          padding: '16px', border: '2px dashed var(--border)', borderRadius: 'var(--radius-sm)',
          cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600,
          transition: 'all 200ms', background: 'var(--bg-elevated)'
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          <Upload size={16} /> {profile.logoImage ? 'Replace Logo' : 'Upload Logo'}
          <input type="file" accept="image/*" onChange={handleImg} style={{ display: 'none' }} />
        </label>
      </div>
    </div>
  );
}
