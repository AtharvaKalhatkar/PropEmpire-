import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, ArrowRight, Shield, Award, Key, MessageSquare, Send, CheckCircle, ChevronRight, Phone, Mail, Building, Clock } from 'lucide-react';
import './index.css';
import logoImg from './assets/COMPANY_LOGO.png';

const MOCK_PROJECTS = [
  {
    id: 1,
    title: 'The Vision Residences',
    location: 'Alandi Road, Pune',
    price: '₹ 45L - 1.2Cr',
    type: 'Premium Flats & Row Houses',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    amenities: ['Infinity Pool', 'State-of-the-art Gym', 'Clubhouse', 'Smart Home Access', '24/7 Concierge'],
    configurations: [
      { type: '2 BHK Flat', size: '750 sq.ft', price: '₹ 45L' },
      { type: '3 BHK Flat', size: '1100 sq.ft', price: '₹ 65L' },
      { type: '3 BHK Row House', size: '1600 sq.ft', price: '₹ 1.2Cr' }
    ],
    description: 'Experience unparalleled luxury at The Vision Residences. Masterfully crafted to provide sweeping city views, bespoke interiors, and world-class amenities. A true statement of elegance and exclusivity.',
  },
  {
    id: 2,
    title: 'Skyline Elite',
    location: 'Wagholi, Pune',
    price: '₹ 35L - 55L',
    type: 'Luxury 1 & 2 BHK Flats',
    image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    amenities: ['Zen Garden', 'Jogging Track', 'CCTV Surveillance', 'Covered Parking', 'Yoga Deck'],
    configurations: [
      { type: '1 BHK Flat', size: '480 sq.ft', price: '₹ 35L' },
      { type: '2 BHK Flat', size: '720 sq.ft', price: '₹ 55L' }
    ],
    description: 'Skyline Elite redefines modern living in Wagholi. Boasting seamless connectivity, verdant landscapes, and meticulous architecture, it is an oasis of tranquility amidst urban energy.',
  },
  {
    id: 3,
    title: 'Emerald Signature',
    location: 'Kharadi, Pune',
    price: '₹ 75L - 2.5Cr',
    type: 'Bespoke Flats & Villas',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    amenities: ['Rooftop Pool', 'Home Automation', 'Private Theatre', 'Tennis Court', 'Wine Cellar'],
    configurations: [
      { type: '3 BHK Flat', size: '1400 sq.ft', price: '₹ 75L' },
      { type: '4 BHK Flat', size: '1900 sq.ft', price: '₹ 1.2Cr' },
      { type: '4 BHK Villa', size: '3200 sq.ft', price: '₹ 2.5Cr' }
    ],
    description: 'For those who demand the absolute best. Emerald Signature offers expansive layouts, private elevator access, and finishes sourced from across the globe.',
  },
  {
    id: 4,
    title: 'Greenville Enclave',
    location: 'Hinjewadi, Pune',
    price: '₹ 50L - 80L',
    type: 'Modern 2 & 3 BHK',
    image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    amenities: ['Co-working Space', 'Crossfit Arena', 'Badminton Court', 'Solar Integration', 'EV Charging'],
    configurations: [
      { type: '2 BHK Flat', size: '800 sq.ft', price: '₹ 50L' },
      { type: '3 BHK Flat', size: '1150 sq.ft', price: '₹ 80L' }
    ],
    description: 'Designed for the modern professional. Walk to work from Greenville Enclave, featuring dedicated workspaces, sustainable architecture, and premium lifestyle facilities.',
  },
  {
    id: 5,
    title: 'Royal Crown Estate',
    location: 'Kalyani Nagar, Pune',
    price: '₹ 2.5Cr - 4.5Cr',
    type: 'Ultra-Luxury 3 & 4 BHK',
    image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    amenities: ['Helipad', 'Private Plunge Pools', 'Golf Simulator', 'Cigar Lounge', 'Valet Parking'],
    configurations: [
      { type: '3 BHK Ultra', size: '2200 sq.ft', price: '₹ 2.5Cr' },
      { type: '4 BHK Penthouse', size: '4100 sq.ft', price: '₹ 4.5Cr' }
    ],
    description: 'The pinnacle of luxury in Kalyani Nagar. Royal Crown Estate provides an elite lifestyle with unparalleled privacy, imported marble flooring, and exclusive club privileges.',
  },
  {
    id: 6,
    title: 'The Platinum Towers',
    location: 'Baner, Pune',
    price: '₹ 1.1Cr - 2.8Cr',
    type: 'Premium 2, 3 & 4 BHK',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    amenities: ['Sky Garden', 'Business Center', 'Pet Park', 'Temperature Controlled Pool', 'Jacuzzi'],
    configurations: [
      { type: '2 BHK Premium', size: '950 sq.ft', price: '₹ 1.1Cr' },
      { type: '3 BHK Premium', size: '1350 sq.ft', price: '₹ 1.6Cr' },
      { type: '4 BHK Luxury', size: '2100 sq.ft', price: '₹ 2.8Cr' }
    ],
    description: 'Located in the heart of Baner, The Platinum Towers is designed for those who appreciate contemporary aesthetics and high-tech living spaces.',
  },
  {
    id: 7,
    title: 'Serenity Lakefront',
    location: 'Pashan, Pune',
    price: '₹ 85L - 1.4Cr',
    type: 'Nature 2 & 3 BHK',
    image: 'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    amenities: ['Lake View Decks', 'Nature Trails', 'Meditation Pavilion', 'Organic Garden', 'Spa'],
    configurations: [
      { type: '2 BHK Lakeview', size: '820 sq.ft', price: '₹ 85L' },
      { type: '3 BHK Lakeview', size: '1200 sq.ft', price: '₹ 1.4Cr' }
    ],
    description: 'Wake up to breathtaking views of Pashan Lake. Serenity Lakefront combines eco-friendly architecture with resort-style amenities for a peaceful retreat in the city.',
  },
  {
    id: 8,
    title: 'Majestic Court',
    location: 'Viman Nagar, Pune',
    price: '₹ 65L - 1.8Cr',
    type: '1, 2 & 3 BHK Residences',
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    amenities: ['Retail Plaza', 'Multiplex Access', 'Fitness Studio', 'Billiards Room', 'Cafeteria'],
    configurations: [
      { type: '1 BHK Studio', size: '550 sq.ft', price: '₹ 65L' },
      { type: '2 BHK Suite', size: '900 sq.ft', price: '₹ 1.1Cr' },
      { type: '3 BHK Family', size: '1450 sq.ft', price: '₹ 1.8Cr' }
    ],
    description: 'Experience vibrant urban living at Majestic Court. Situated near major IT hubs and the airport, it offers ultimate convenience and a highly cosmopolitan lifestyle.',
  },
  {
    id: 9,
    title: 'The Onyx Signature',
    location: 'Koregaon Park, Pune',
    price: 'Price on Request',
    type: 'Pre-Launch 3 & 4.5 BHK',
    badge: 'Upcoming New Launch',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    amenities: ['Private Elevator', 'Rooftop Lounge', 'Home Theatre', 'Smart Security', 'Exclusive Clubhouse'],
    configurations: [
      { type: '3 BHK Signature', size: '1850 sq.ft', price: 'Price on Request' },
      { type: '4.5 BHK Penthouse', size: '3200 sq.ft', price: 'Price on Request' }
    ],
    description: 'An exclusive upcoming new launch in the heart of Koregaon Park. Register your interest now for special pre-launch pricing and priority allocation.',
  }
];

// Number Counter Hook for animated stats
const NumberCounter = ({ end, duration = 2000, suffix = '+' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0;
        const increment = end / (duration / 16);
        const timer = setInterval(() => {
          start += increment;
          if (start >= end) {
            clearInterval(timer);
            setCount(end);
          } else {
            setCount(Math.ceil(start));
          }
        }, 16);
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.5 });
    
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
};

// Intersection Observer Hook for Scroll Animations
function useScrollReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return ref;
}

export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  
  // Enquiry Form State
  const [enquiry, setEnquiry] = useState({ name: '', phone: '', email: '', budget: '', propertyType: '', message: '' });
  const [generalEnquiry, setGeneralEnquiry] = useState({ name: '', phone: '', email: '', interest: '', message: '' });
  
  // Chatbot State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { text: "Hello! Welcome to PropEmpire. How can I help you find your dream home today?", sender: 'bot' }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Scroll Reveal Refs
  const statsRef = useScrollReveal();
  const projectsRef = useScrollReveal();
  const expertiseRef = useScrollReveal();
  const contactRef = useScrollReveal();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredProjects = MOCK_PROJECTS.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = locationFilter === '' || project.location.includes(locationFilter);
    const matchesType = typeFilter === '' || project.type.includes(typeFilter);
    return matchesSearch && matchesLocation && matchesType;
  });

  const handleEnquirySubmit = (e) => {
    e.preventDefault();
    alert(`Thank you, ${enquiry.name}. A luxury property consultant will contact you shortly regarding your enquiry.`);
    setEnquiry({ name: '', phone: '', email: '', budget: '', propertyType: '', message: '' });
    setSelectedProject(null);
  };

  const handleGeneralEnquirySubmit = (e) => {
    e.preventDefault();
    alert(`Thank you, ${generalEnquiry.name}. A PropEmpire property consultant will contact you shortly.`);
    setGeneralEnquiry({ name: '', phone: '', email: '', interest: '', message: '' });
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    // Add user message
    const newMessages = [...chatMessages, { text: chatInput, sender: 'user' }];
    setChatMessages(newMessages);
    setChatInput('');

    // Simulate bot reply
    setTimeout(() => {
      setChatMessages(prev => [...prev, { 
        text: "Thank you for reaching out! A PropEmpire agent will get back to you with details. Please leave your phone number if you'd like a call.", 
        sender: 'bot' 
      }]);
    }, 1000);
  };

  return (
    <div className="app-wrapper">
      {/* ── NAVBAR ── */}
      <nav className="navbar scrolled">
        <a href="#" className="nav-brand">
          <img src={logoImg} alt="PropEmpire Logo" className="nav-logo" />
        </a>
        <div className="nav-links">
          <a href="#" className="nav-link">Home</a>
          <a href="#projects" className="nav-link">Residences</a>
          <a href="#expertise" className="nav-link">Expertise</a>
          <a href="#contact" className="nav-link">Contact</a>
          <button className="nav-btn" onClick={() => window.location.href = 'https://AtharvaKalhatkar.github.io/PropEmpire-/'}>
            Agent Portal
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-bg">
          <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" alt="Luxury Home" />
        </div>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-main-brand">
            <span style={{ animationDelay: '0.2s' }}>PROP</span><span style={{ animationDelay: '0.4s', color: 'var(--accent)' }}>EMPIRE</span>
          </h1>
          <h2 className="hero-subtitle" style={{ animationDelay: '0.6s' }}>Authorized Real Estate Channel Partner</h2>
          <h3 className="hero-title">
            <span style={{ animationDelay: '0.8s' }}>Guiding</span>{' '}
            <span style={{ animationDelay: '1.0s' }}>You</span>{' '}
            <span style={{ animationDelay: '1.2s' }}>To</span>{' '}
            <span style={{ animationDelay: '1.4s' }}>Your</span>{' '}
            <span style={{ animationDelay: '1.6s' }}>Dream</span>{' '}
            <span style={{ animationDelay: '1.8s' }}>Home</span>
          </h3>
          
          {/* ── SEARCH BAR ── */}
          <div className="search-wrapper">
            <div className="search-field">
              <Search size={18} color="#999" style={{ marginRight: '10px' }} />
              <input 
                type="text" 
                placeholder="Search by name..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="search-field">
              <MapPin size={18} color="#999" style={{ marginRight: '10px' }} />
              <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
                <option value="">Any Location</option>
                <option value="Alandi Road">Alandi Road</option>
                <option value="Wagholi">Wagholi</option>
                <option value="Kharadi">Kharadi</option>
                <option value="Hinjewadi">Hinjewadi</option>
              </select>
            </div>
            <div className="search-field">
              <Building size={18} color="#999" style={{ marginRight: '10px' }} />
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="">Property Type</option>
                <option value="1 & 2 BHK">1 & 2 BHK</option>
                <option value="2 & 3 BHK">2 & 3 BHK</option>
                <option value="3 & 4 BHK">3 & 4 BHK</option>
              </select>
            </div>
            <button className="search-btn" onClick={() => document.getElementById('projects').scrollIntoView({ behavior: 'smooth' })}>
              Search
            </button>
          </div>
        </div>
      </section>

      {/* ── CONTINUOUS MARQUEE ── */}
      <div className="marquee-container">
        <div className="marquee-content">
          <span>✦ UPCOMING NEW LAUNCHES</span>
          <span>✦ AUTHORIZED CHANNEL PARTNER</span>
          <span>✦ PREMIUM PROPERTY CONSULTING</span>
          <span>✦ 100% TRANSPARENCY</span>
          <span>✦ EXPERT NEGOTIATION</span>
          <span>✦ HOME LOAN ASSISTANCE</span>
          <span>✦ FREE SITE VISITS</span>
          {/* Duplicate for seamless loop */}
          <span>✦ UPCOMING NEW LAUNCHES</span>
          <span>✦ AUTHORIZED CHANNEL PARTNER</span>
          <span>✦ PREMIUM PROPERTY CONSULTING</span>
          <span>✦ 100% TRANSPARENCY</span>
          <span>✦ EXPERT NEGOTIATION</span>
          <span>✦ HOME LOAN ASSISTANCE</span>
          <span>✦ FREE SITE VISITS</span>
        </div>
      </div>

      {/* ── THE PROPEMPIRE ADVANTAGE ── */}
      <section className="stats-section scroll-reveal" ref={statsRef}>
        <div className="stats-grid">
          <div className="stat-item">
            <h3><NumberCounter end={7} /></h3>
            <p>Years Experience</p>
          </div>
          <div className="stat-item">
            <h3><NumberCounter end={20} /></h3>
            <p>Projects Sold</p>
          </div>
          <div className="stat-item">
            <h3><NumberCounter end={40} /></h3>
            <p>Happy Families</p>
          </div>
          <div className="stat-item">
            <h3><NumberCounter end={100} suffix="%" /></h3>
            <p>Transparency</p>
          </div>
        </div>
      </section>

      {/* ── PROJECTS ── */}
      <section id="projects" className="projects-section scroll-reveal" ref={projectsRef}>
        <div className="section-header">
          <span className="section-subtitle">Exclusive Portfolio</span>
          <h2 className="section-title">Curated Residences</h2>
        </div>

        {filteredProjects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#666', fontSize: '1.2rem', fontFamily: 'var(--font-heading)' }}>
            No properties matching your refined criteria.
          </div>
        ) : (
          <div className="projects-grid">
            {filteredProjects.map((project, index) => (
              <div key={project.id} className="project-card" style={{ animationDelay: `${index * 0.1}s` }} onClick={() => setSelectedProject(project)}>
                <div className="project-image-wrapper">
                  {project.badge && <div className="project-badge">{project.badge}</div>}
                  <img src={project.image} alt={project.title} className="project-image" />
                  <div className="project-overlay">
                    <span className="project-type">{project.type}</span>
                    <span className="project-price">{project.price}</span>
                  </div>
                </div>
                <div className="project-info">
                  <h3 className="project-title">{project.title}</h3>
                  <div className="project-location">
                    <MapPin size={16} /> {project.location}
                  </div>
                  <div className="view-details">
                    View Details <ArrowRight size={16} className="view-details-arrow" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── EXPERTISE / SERVICES ── */}
      <section id="expertise" className="services-section scroll-reveal" ref={expertiseRef}>
        <div className="services-container">
          <div className="services-header">
            <span className="section-subtitle" style={{ color: '#fff' }}>Why Choose Us</span>
            <h2 className="section-title">Your Dedicated Property Consultants</h2>
          </div>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon"><Shield size={32} /></div>
              <h3 className="service-title">Trusted Advisory</h3>
              <p className="service-desc">We provide unbiased, expert advice to help you select the perfect property that aligns with your lifestyle and investment goals.</p>
            </div>
            <div className="service-card">
              <div className="service-icon"><Key size={32} /></div>
              <h3 className="service-title">End-to-End Assistance</h3>
              <p className="service-desc">From scheduling free site visits and expert price negotiation to finalizing the paperwork and possession.</p>
            </div>
            <div className="service-card">
              <div className="service-icon"><Award size={32} /></div>
              <h3 className="service-title">Home Loan & Legal</h3>
              <p className="service-desc">Seamless processing with our partner banks for home loans, plus complete legal and documentation support.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── MODAL ── */}
      {selectedProject && (
        <div className="modal-overlay" onClick={() => setSelectedProject(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedProject(null)}>
              <X size={24} />
            </button>
            <div className="modal-image-panel">
              <img src={selectedProject.image} alt={selectedProject.title} />
            </div>
            
            <div className="modal-details">
              <h2 className="modal-details-title">{selectedProject.title}</h2>
              <div className="project-location" style={{ fontSize: '1rem', marginBottom: '1.5rem', color: 'var(--accent)' }}>
                <MapPin size={18} /> {selectedProject.location}
              </div>
              
              <p>{selectedProject.description}</p>

              <h4 style={{ fontFamily: 'var(--font-accent)', textTransform: 'uppercase', letterSpacing: '1px', margin: '25px 0 15px' }}>Pricing & Configurations</h4>
              <div className="config-grid">
                {selectedProject.configurations.map((config, idx) => (
                  <div key={idx} className="config-card">
                    <div className="config-type">{config.type}</div>
                    <div className="config-size">{config.size}</div>
                    <div className="config-price">{config.price}</div>
                  </div>
                ))}
              </div>

              <h4 style={{ fontFamily: 'var(--font-accent)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>Signature Amenities</h4>
              <div className="amenities-list">
                {selectedProject.amenities.map((amenity, idx) => (
                  <span key={idx} className="amenity-tag"><CheckCircle size={14} style={{ display: 'inline', marginRight: '5px', color: 'var(--accent)' }}/>{amenity}</span>
                ))}
              </div>

              <div className="enquiry-form">
                <h4>Schedule a Private Viewing</h4>
                <form onSubmit={handleEnquirySubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <input type="text" className="form-input" required placeholder="Full Name" value={enquiry.name} onChange={e => setEnquiry({...enquiry, name: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <input type="tel" className="form-input" required placeholder="Phone Number" value={enquiry.phone} onChange={e => setEnquiry({...enquiry, phone: e.target.value})} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <input type="email" className="form-input" required placeholder="Email Address" value={enquiry.email} onChange={e => setEnquiry({...enquiry, email: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <select className="form-input" required value={enquiry.budget} onChange={e => setEnquiry({...enquiry, budget: e.target.value})}>
                        <option value="" disabled>Select Budget</option>
                        <option value="30L-50L">30L - 50L</option>
                        <option value="50L-80L">50L - 80L</option>
                        <option value="80L-1.5Cr">80L - 1.5Cr</option>
                        <option value="1.5Cr+">1.5Cr +</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <textarea className="form-input" rows="2" placeholder="Additional details or specific requirements..." value={enquiry.message} onChange={e => setEnquiry({...enquiry, message: e.target.value})} style={{ resize: 'none' }}></textarea>
                  </div>
                  <button type="submit" className="btn-submit">Request Details</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── GENERAL ENQUIRY SECTION ── */}
      <section id="contact" className="general-enquiry-section scroll-reveal" ref={contactRef}>
        <div className="enquiry-container">
          <div className="enquiry-text">
            <h2>Let's Find Your Dream Home</h2>
            <p>Connect with Pune's premier real estate channel partner. Whether you are looking for an ultra-luxury penthouse or a smart investment, our experts are here to guide you with unmatched expertise.</p>
            <div className="enquiry-contact-info">
              <div><Phone size={20} /> <a href="tel:+919730953309">+91 9730953309</a></div>
              <div><Mail size={20} /> <a href="mailto:saurabhgade32@gmail.com">saurabhgade32@gmail.com</a></div>
            </div>
          </div>
          <div className="enquiry-form-wrapper">
            <form className="general-form" onSubmit={handleGeneralEnquirySubmit}>
              <div className="form-row">
                <div className="form-group">
                  <input type="text" className="form-input" required placeholder="Full Name" value={generalEnquiry.name} onChange={e => setGeneralEnquiry({...generalEnquiry, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <input type="tel" className="form-input" required placeholder="Phone Number" value={generalEnquiry.phone} onChange={e => setGeneralEnquiry({...generalEnquiry, phone: e.target.value})} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <input type="email" className="form-input" required placeholder="Email Address" value={generalEnquiry.email} onChange={e => setGeneralEnquiry({...generalEnquiry, email: e.target.value})} />
                </div>
                <div className="form-group">
                  <select className="form-input" required value={generalEnquiry.interest} onChange={e => setGeneralEnquiry({...generalEnquiry, interest: e.target.value})}>
                    <option value="" disabled>Looking For</option>
                    <option value="Buying a Home">Buying a Home</option>
                    <option value="Real Estate Investment">Real Estate Investment</option>
                    <option value="Selling a Property">Selling a Property</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <textarea className="form-input" rows="3" placeholder="How can we help you?" value={generalEnquiry.message} onChange={e => setGeneralEnquiry({...generalEnquiry, message: e.target.value})} style={{ resize: 'none' }}></textarea>
              </div>
              <button type="submit" className="btn-submit">Submit Enquiry</button>
            </form>
          </div>
        </div>
      </section>

      {/* ── CHATBOT ── */}
      <div className={`chatbot-container ${chatOpen ? 'open' : ''}`}>
        {!chatOpen ? (
          <button className="chatbot-toggle" onClick={() => setChatOpen(true)}>
            <MessageSquare size={24} />
          </button>
        ) : (
          <div className="chatbot-window">
            <div className="chatbot-header">
              <div>
                <h4>PropEmpire Assistant</h4>
                <span className="online-status">Online</span>
              </div>
              <button className="chatbot-close" onClick={() => setChatOpen(false)}><X size={20} /></button>
            </div>
            <div className="chatbot-messages">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`chat-message ${msg.sender}`}>
                  {msg.text}
                </div>
              ))}
            </div>
            <form className="chatbot-input" onSubmit={handleChatSubmit}>
              <input 
                type="text" 
                placeholder="Type your message..." 
                value={chatInput} 
                onChange={(e) => setChatInput(e.target.value)} 
              />
              <button type="submit"><Send size={18} /></button>
            </form>
          </div>
        )}
      </div>

      {/* ── FOOTER ── */}
      <footer className="footer scroll-reveal">
        <div className="footer-top">
          <div>
            <div className="footer-brand" style={{ color: '#fff' }}>
              PropEmpire
            </div>
            <p className="footer-text">
              Pune's leading authorized real estate channel partner. We are dedicated to helping families find their perfect home with 100% transparency and unmatched expertise.
            </p>
          </div>
          <div>
            <h4 className="footer-title">Navigation</h4>
            <ul className="footer-links">
              <li><a href="#">Home</a></li>
              <li><a href="#projects">Exclusive Residences</a></li>
              <li><a href="#expertise">Our Expertise</a></li>
              <li><a href="#">Market Reports</a></li>
            </ul>
          </div>
          <div>
            <h4 className="footer-title">Contact Us</h4>
            <ul className="footer-links">
              <li><MapPin size={16} style={{ display:'inline', marginRight:'8px' }}/> Pune - Ahmednagar Hwy, Near Lifeline Hospital</li>
              <li style={{ paddingLeft: '24px' }}>Wagholi, Pune, Maharashtra 412207</li>
              <li style={{ marginTop: '15px' }}><Phone size={16} style={{ display:'inline', marginRight:'8px' }}/><a href="tel:+919730953309">+91 9730953309</a></li>
              <li><Mail size={16} style={{ display:'inline', marginRight:'8px' }}/><a href="mailto:saurabhgade32@gmail.com">saurabhgade32@gmail.com</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          &copy; {new Date().getFullYear()} PropEmpire International Real Estate. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
