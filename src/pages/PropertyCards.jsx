import { useState, useRef } from 'react';
import { Download, Share2, MapPin, CheckCircle2, Palette } from 'lucide-react';
import logoImg from '../assets/COMPANY_LOGO.png';

const THEMES = [
  {name:'Navy',bg:'linear-gradient(145deg,#0f172a,#1e293b)',accent:'#c5a059',text:'#fff',cardBg:'#1e293b'},
  {name:'Dark',bg:'linear-gradient(145deg,#121212,#2a2a2a)',accent:'#d4af37',text:'#fff',cardBg:'#2a2a2a'},
  {name:'White',bg:'linear-gradient(145deg,#fff,#f1f5f9)',accent:'#b38b42',text:'#1e293b',cardBg:'#f8fafc'},
  {name:'Green',bg:'linear-gradient(145deg,#022c22,#064e3b)',accent:'#d4af37',text:'#fff',cardBg:'#064e3b'},
];

const IMAGES = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
  'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
];

export default function PropertyCards() {
  const ref = useRef(null);
  const [tIdx, setTIdx] = useState(0);
  const [iIdx, setIIndx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({projectName:'',location:'',config:'',price:'',highlight1:'RERA Registered',highlight2:'Premium Amenities',tagline:'Experience Luxury Living'});

  const t = THEMES[tIdx];
  const chg = e => setForm(p=>({...p,[e.target.name]:e.target.value}));

  const gen = async () => {
    if (!ref.current) return null;
    const {default:h} = await import('html2canvas');
    return h(ref.current,{scale:3,useCORS:true,allowTaint:true,backgroundColor:null});
  };

  const doDl = async () => {
    setLoading(true);
    try { const c=await gen(); if(!c)return; const a=document.createElement('a'); a.download=`PropEmpire_${(form.projectName||'Property').replace(/\s+/g,'_')}.png`; a.href=c.toDataURL('image/png'); a.click(); }
    catch { alert('Failed'); } finally { setLoading(false); }
  };

  const doShare = async () => {
    setLoading(true);
    try {
      const c=await gen(); if(!c)return;
      c.toBlob(async b=>{
        if(!b)return;
        const f=new File([b],`PropEmpire_${(form.projectName||'Property').replace(/\s+/g,'_')}.png`,{type:'image/png'});
        if (navigator.canShare?.({files:[f]})) await navigator.share({files:[f],title:form.projectName||'PropEmpire'});
        else { const a=document.createElement('a'); a.download=f.name; a.href=c.toDataURL('image/png'); a.click(); }
        setLoading(false);
      });
    } catch { setLoading(false); }
  };

  return (
    <div>
      <div className="mb-24">
        <h1 style={{ fontSize: 26, marginBottom: 2 }}>Share Cards</h1>
        <p style={{ margin: 0 }}>Premium property visuals</p>
      </div>

      {/* Card Preview */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
        <div ref={ref} style={{
          width: 360, borderRadius: 20, overflow: 'hidden',
          background: t.bg, color: t.text, position: 'relative',
          boxShadow: '0 20px 40px -12px rgba(0,0,0,0.5)',
          fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif"
        }}>
          <div style={{ height: 4, background: t.accent }} />
          <div style={{ height: 220, position: 'relative', overflow: 'hidden' }}>
            <img src={IMAGES[iIdx]} alt="" crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 100, background: `linear-gradient(to top,${t.cardBg},transparent)` }} />
            {form.price && <div style={{
              position: 'absolute', bottom: 12, right: 16,
              background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
              color: t.accent, padding: '6px 14px', borderRadius: 10,
              fontSize: 16, fontWeight: 800, border: `1px solid ${t.accent}60`
            }}>₹ {form.price}</div>}
          </div>
          <div style={{ padding: '0 20px 16px', position: 'relative', zIndex: 2 }}>
            <h2 style={{ margin: '8px 0 2px', fontSize: 22, fontWeight: 800, color: t.text }}>{form.projectName || 'Property Name'}</h2>
            {form.location && <div className="flex items-center gap-8" style={{ fontSize: 12, fontWeight: 600, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 16 }}>
              <MapPin size={14} color={t.accent} /> {form.location}
            </div>}
            {form.config && <div className="flex gap-8 flex-wrap" style={{ marginBottom: 16 }}>
              {form.config.split(',').map((c, i) => <span key={i} style={{
                padding: '4px 12px', borderRadius: 20,
                border: `1px solid ${t.accent}40`, fontSize: 12,
                fontWeight: 700, background: `${t.accent}15`
              }}>{c.trim()}</span>)}
            </div>}
            <div style={{ fontSize: 13, fontWeight: 500, opacity: 0.9, marginBottom: 16 }}>
              {form.highlight1 && <div className="flex items-center gap-8 mb-8"><CheckCircle2 size={14} color={t.accent} /> {form.highlight1}</div>}
              {form.highlight2 && <div className="flex items-center gap-8"><CheckCircle2 size={14} color={t.accent} /> {form.highlight2}</div>}
            </div>
            {form.tagline && <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: t.accent, fontStyle: 'italic', textAlign: 'center' }}>"{form.tagline}"</p>}
          </div>
          <div style={{
            padding: '12px 20px', background: 'rgba(0,0,0,0.15)',
            borderTop: `1px solid ${t.accent}20`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
          }}>
            <img src={logoImg} alt="" style={{ width: 24, height: 24, objectFit: 'contain', filter: t.name === 'White' ? 'none' : 'brightness(0) invert(1)' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, lineHeight: 1.2 }}>PropEmpire</div>
              <div style={{ fontSize: 9, color: t.accent, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Real Estate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid-2 mb-20">
        <button className="btn btn-secondary" onClick={doDl} disabled={loading} style={{ padding: 12, justifyContent: 'center', fontSize: 13 }}>
          <Download size={16} /> Download
        </button>
        <button className="btn btn-primary" onClick={doShare} disabled={loading} style={{
          padding: 12, justifyContent: 'center', fontSize: 13,
          background: 'linear-gradient(135deg, #d4af37, #b38b42)', border: 'none',
          boxShadow: '0 4px 12px rgba(212, 175, 55, 0.25)'
        }}>
          <Share2 size={16} /> Share
        </button>
      </div>

      {/* Theme Selector */}
      <div className="card mb-16">
        <div className="section-title flex items-center gap-8">
          <Palette size={13} color="var(--text-tertiary)" /> Theme
        </div>
        <div className="flex gap-12" style={{ justifyContent: 'center' }}>
          {THEMES.map((x, i) => (
            <div key={i} onClick={() => setTIdx(i)} style={{ cursor: 'pointer', textAlign: 'center' }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%', background: x.bg,
                border: tIdx === i ? `3px solid ${x.accent}` : '2px solid var(--border)',
                transition: 'all 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                transform: tIdx === i ? 'scale(1.15)' : 'scale(1)',
                boxShadow: tIdx === i ? `0 4px 12px rgba(0,0,0,0.3)` : 'none'
              }} />
              <span style={{
                fontSize: 10, fontWeight: 600, display: 'block', marginTop: 6,
                color: tIdx === i ? 'var(--primary)' : 'var(--text-tertiary)'
              }}>{x.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Image Selector */}
      <div className="card mb-16">
        <div className="section-title">Image</div>
        <div className="flex gap-8" style={{ overflowX: 'auto', paddingBottom: 4 }}>
          {IMAGES.map((img, i) => (
            <img key={i} src={img} alt="" onClick={() => setIIndx(i)} style={{
              width: 80, height: 55, objectFit: 'cover',
              borderRadius: 'var(--radius-sm)', cursor: 'pointer', flexShrink: 0,
              border: iIdx === i ? '2px solid var(--primary)' : '2px solid var(--border)',
              transition: 'all 200ms',
              transform: iIdx === i ? 'scale(1.05)' : 'scale(1)',
              boxShadow: iIdx === i ? '0 4px 12px rgba(99,102,241,0.2)' : 'none'
            }} />
          ))}
        </div>
      </div>

      {/* Details Form */}
      <div className="card">
        <div className="section-title">Details</div>
        <div className="form-grid-2">
          <div className="form-group"><label className="form-label">Project</label><input type="text" className="form-input" name="projectName" value={form.projectName} onChange={chg} placeholder="Project name" /></div>
          <div className="form-group"><label className="form-label">Location</label><input type="text" className="form-input" name="location" value={form.location} onChange={chg} placeholder="Location" /></div>
          <div className="form-group"><label className="form-label">Config</label><input type="text" className="form-input" name="config" value={form.config} onChange={chg} placeholder="e.g. 2 BHK, 3 BHK" /></div>
          <div className="form-group"><label className="form-label">Price</label><input type="text" className="form-input" name="price" value={form.price} onChange={chg} placeholder="e.g. 1.5 Cr" /></div>
          <div className="form-group"><label className="form-label">Highlight 1</label><input type="text" className="form-input" name="highlight1" value={form.highlight1} onChange={chg} /></div>
          <div className="form-group"><label className="form-label">Highlight 2</label><input type="text" className="form-input" name="highlight2" value={form.highlight2} onChange={chg} /></div>
          <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}><label className="form-label">Tagline</label><input type="text" className="form-input" name="tagline" value={form.tagline} onChange={chg} /></div>
        </div>
      </div>
    </div>
  );
}
