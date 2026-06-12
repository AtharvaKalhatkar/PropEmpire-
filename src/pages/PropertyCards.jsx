import { useState, useRef } from 'react';
import { Image, Download, Share2, MapPin, CheckCircle2 } from 'lucide-react';
import logoImg from '../assets/COMPANY_LOGO.png';

const CARD_THEMES = [
  { name: 'Premium Navy', bg: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)', accent: '#c5a059', text: '#ffffff', cardBg: '#1e293b' },
  { name: 'Luxury Dark', bg: 'linear-gradient(145deg, #121212 0%, #2a2a2a 100%)', accent: '#d4af37', text: '#ffffff', cardBg: '#2a2a2a' },
  { name: 'Elegant White', bg: 'linear-gradient(145deg, #ffffff 0%, #f1f5f9 100%)', accent: '#b38b42', text: '#1e293b', cardBg: '#f8fafc' },
  { name: 'Royal Emerald', bg: 'linear-gradient(145deg, #022c22 0%, #064e3b 100%)', accent: '#d4af37', text: '#ffffff', cardBg: '#064e3b' },
];

const PROPERTY_IMAGES = [
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
  'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
];

export default function PropertyCards() {
  const cardRef = useRef(null);
  const [selectedTheme, setSelectedTheme] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isSharing, setIsSharing] = useState(false);
  const [formData, setFormData] = useState({
    projectName: '',
    location: '',
    config: '',
    price: '',
    highlight1: 'RERA Registered',
    highlight2: 'Premium Amenities',
    tagline: 'Experience Luxury Living',
  });

  const theme = CARD_THEMES[selectedTheme];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDownloadCard = async () => {
    if (!cardRef.current) return;
    setIsSharing(true);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
      });
      const link = document.createElement('a');
      link.download = `PropEmpire_${formData.projectName.replace(/\s+/g, '_') || 'Property'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Error generating image:', err);
      alert('Failed to generate image.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleShareCard = async () => {
    if (!cardRef.current) return;
    setIsSharing(true);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
      });
      canvas.toBlob(async (blob) => {
        const file = new File([blob], `PropEmpire_${formData.projectName.replace(/\s+/g, '_') || 'Property'}.png`, { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: formData.projectName || 'PropEmpire Property',
            text: `🏠 ${formData.projectName}\n📍 ${formData.location}\n💰 ${formData.price}\n\nContact PropEmpire for details!`
          });
        } else {
          const link = document.createElement('a');
          link.download = `PropEmpire_${formData.projectName.replace(/\s+/g, '_') || 'Property'}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
          alert('Image downloaded! Share it directly via WhatsApp or Instagram.');
        }
        setIsSharing(false);
      }, 'image/png');
    } catch (err) {
      console.error('Error sharing:', err);
      setIsSharing(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ margin: 0 }}>Share Cards</h1>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Generate premium property visuals</p>
        </div>
      </div>

      {/* Card Preview Container */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
        <div 
          ref={cardRef} 
          style={{ 
            width: '380px', 
            minHeight: '500px', 
            borderRadius: '24px', 
            overflow: 'hidden', 
            background: theme.bg, 
            color: theme.text, 
            position: 'relative', 
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)',
            fontFamily: "'Plus Jakarta Sans', sans-serif"
          }}
        >
          {/* Top Gold Bar */}
          <div style={{ height: '6px', width: '100%', backgroundColor: theme.accent }} />

          {/* Property Image with Gradient Overlay */}
          <div style={{ height: '240px', position: 'relative', overflow: 'hidden' }}>
            <img src={PROPERTY_IMAGES[selectedImage]} alt="Property" crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '120px', background: `linear-gradient(to top, ${theme.cardBg}, transparent)` }} />
            
            {/* Price Tag (Luxury Style) */}
            {formData.price && (
              <div style={{ position: 'absolute', bottom: '16px', right: '20px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', color: theme.accent, padding: '8px 16px', borderRadius: '12px', fontSize: '1.1rem', fontWeight: '800', border: `1px solid ${theme.accent}60`, boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                ₹ {formData.price}
              </div>
            )}
          </div>

          {/* Card Content Area */}
          <div style={{ padding: '0 24px 20px', position: 'relative', zIndex: 2 }}>
            
            <h2 style={{ margin: '0 0 4px', fontSize: '1.8rem', fontWeight: '800', letterSpacing: '-0.03em', color: theme.text, lineHeight: '1.1' }}>
              {formData.projectName || 'Luxury Estate Name'}
            </h2>
            
            {formData.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '20px', opacity: 0.8, fontSize: '0.9rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <MapPin size={14} color={theme.accent} /> {formData.location}
              </div>
            )}

            {/* Config Pills */}
            {formData.config && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {formData.config.split(',').map((c, i) => (
                  <span key={i} style={{ padding: '6px 14px', borderRadius: '20px', border: `1px solid ${theme.accent}40`, fontSize: '0.85rem', fontWeight: '700', backgroundColor: `${theme.accent}15`, color: theme.text, letterSpacing: '0.02em' }}>
                    {c.trim()}
                  </span>
                ))}
              </div>
            )}

            {/* Highlights */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px', fontSize: '0.9rem', fontWeight: '500', opacity: 0.9 }}>
              {formData.highlight1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color={theme.accent} /> {formData.highlight1}
                </div>
              )}
              {formData.highlight2 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color={theme.accent} /> {formData.highlight2}
                </div>
              )}
            </div>

            {/* Divider */}
            <div style={{ height: '1px', width: '100%', background: `linear-gradient(to right, transparent, ${theme.accent}40, transparent)`, marginBottom: '20px' }} />

            {/* Tagline */}
            {formData.tagline && (
              <p style={{ margin: '0 0 16px', fontSize: '1.05rem', fontWeight: '700', color: theme.accent, fontStyle: 'italic', textAlign: 'center', letterSpacing: '0.01em' }}>
                "{formData.tagline}"
              </p>
            )}
          </div>

          {/* Footer Branding */}
          <div style={{ padding: '16px 24px', background: 'rgba(0,0,0,0.2)', borderTop: `1px solid ${theme.accent}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <img src={logoImg} alt="Logo" crossOrigin="anonymous" style={{ width: '32px', height: '32px', objectFit: 'contain', filter: theme.name === 'Elegant White' ? 'none' : 'brightness(0) invert(1)' }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: '800', fontSize: '1.1rem', letterSpacing: '-0.02em', lineHeight: '1', color: theme.text }}>PropEmpire</span>
              <span style={{ fontSize: '0.65rem', color: theme.accent, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '2px' }}>A Trusted Home Base</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        <button className="btn btn-secondary" onClick={handleDownloadCard} disabled={isSharing} style={{ padding: '1rem', fontSize: '1rem' }}>
          <Download size={20} /> {isSharing ? '...' : 'Download Image'}
        </button>
        <button className="btn btn-primary" onClick={handleShareCard} disabled={isSharing} style={{ padding: '1rem', fontSize: '1rem', background: 'linear-gradient(135deg, #d4af37, #b38b42)', color: 'white', border: 'none' }}>
          <Share2 size={20} /> Share Card
        </button>
      </div>

      {/* Settings Panel */}
      <div className="card" style={{ marginBottom: '1.5rem', background: 'var(--surface-color)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
          
          {/* Themes */}
          <div>
            <label className="form-label">Select Luxury Theme</label>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {CARD_THEMES.map((t, i) => (
                <div key={i} onClick={() => setSelectedTheme(i)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: t.bg, border: selectedTheme === i ? `3px solid ${t.accent}` : '2px solid transparent', transition: 'all 0.2s', transform: selectedTheme === i ? 'scale(1.1)' : 'scale(1)', boxShadow: 'var(--shadow-sm)' }} />
                  <span style={{ fontSize: '0.65rem', fontWeight: '600', color: selectedTheme === i ? 'var(--primary-color)' : 'var(--text-muted)' }}>{t.name.split(' ')[1]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="form-label">Property Background</label>
            <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {PROPERTY_IMAGES.map((img, i) => (
                <img key={i} src={img} alt={`Option ${i+1}`} onClick={() => setSelectedImage(i)} style={{ width: '90px', height: '60px', objectFit: 'cover', borderRadius: '12px', cursor: 'pointer', border: selectedImage === i ? '3px solid var(--accent-color)' : '2px solid transparent', transition: 'all 0.2s', flexShrink: 0, boxShadow: 'var(--shadow-sm)' }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Form Input */}
      <div className="card">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Property Details</h2>
        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Project Name</label>
            <input type="text" className="form-input" name="projectName" value={formData.projectName} onChange={handleChange} placeholder="e.g. The Royal Crown" />
          </div>
          <div className="form-group">
            <label className="form-label">Location</label>
            <input type="text" className="form-input" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Koregaon Park, Pune" />
          </div>
          <div className="form-group">
            <label className="form-label">Configuration</label>
            <input type="text" className="form-input" name="config" value={formData.config} onChange={handleChange} placeholder="e.g. 2 BHK, 3 BHK, 4 BHK" />
          </div>
          <div className="form-group">
            <label className="form-label">Starting Price</label>
            <input type="text" className="form-input" name="price" value={formData.price} onChange={handleChange} placeholder="e.g. 1.5 Cr Onwards" />
          </div>
          <div className="form-group">
            <label className="form-label">Key Highlight 1</label>
            <input type="text" className="form-input" name="highlight1" value={formData.highlight1} onChange={handleChange} placeholder="e.g. Zero Stamp Duty" />
          </div>
          <div className="form-group">
            <label className="form-label">Key Highlight 2</label>
            <input type="text" className="form-input" name="highlight2" value={formData.highlight2} onChange={handleChange} placeholder="e.g. Ready to Move" />
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Marketing Tagline</label>
            <input type="text" className="form-input" name="tagline" value={formData.tagline} onChange={handleChange} placeholder="e.g. Experience Luxury Like Never Before" />
          </div>
        </div>
      </div>
    </div>
  );
}
