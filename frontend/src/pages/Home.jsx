import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TrainAnimation from '../components/TrainAnimation';

const features = [
  { icon: "🎟️", title: "Instant Booking", desc: "No waits. Secure seats immediately." },
  { icon: "🧠", title: "Waitlist Predictor", desc: "Get smart waitlist odds via AI." },
  { icon: "💰", title: "Dynamic Pricing", desc: "Fair fares based on real-time demand." },
  { icon: "📩", title: "Email Notifications", desc: "Tickets sent straight to your inbox." },
  { icon: "📊", title: "Smart Dashboard", desc: "Manage all past journeys in one place." }
];

const coaches = [
  { code: 'General', label: 'Sitting', emoji: '🪑', active: false },
  { code: '3E', label: 'Economy Sleeper', emoji: '🛏️', active: false },
  { code: '3A', label: 'AC Sleeper', emoji: '❄️', active: true },
  { code: '2A', label: 'AC 2-Tier', emoji: '✨', active: false },
  { code: '1A', label: 'First Class', emoji: '👑', active: false },
];

const cities = ["Agra", "Ahmedabad", "Bangalore", "Bhopal", "Chennai", "Hyderabad", "Jaipur", "Kolkata", "Lucknow", "Mumbai", "New Delhi", "Patna", "Pune", "Varanasi"];

function Home() {
  const navigate = useNavigate();
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [selectedCoach, setSelectedCoach] = useState('3A');

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/dashboard?source=${encodeURIComponent(source)}&destination=${encodeURIComponent(destination)}&date=${encodeURIComponent(date)}`);
  };

  return (
    <div style={{ paddingBottom: '120px' }}>
      {/* Station 1: Search Hub */}
      <section className="station-section hero-wrapper" id="station-1" style={{ paddingTop: '100px', alignItems: 'center' }}>
        <div className="hero-content" style={{ maxWidth: '900px', width: '100%', paddingTop: 0 }}>
          <div className="station-badge">🚉 Station 1 — Start your Journey</div>
          <h1>Book Smarter.<br />Travel Better.</h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.92, marginTop: '1rem' }}>
            Experience the future of Indian Railways. A premium, fast, and gorgeous ticket booking ecosystem down to the coach layout.
          </p>
          <form className="glass-search-container" onSubmit={handleSearch}>
            <select value={source} onChange={e => setSource(e.target.value)} required>
              <option value="" disabled>From: Station or City</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.4rem' }}>→</span>
            <select value={destination} onChange={e => setDestination(e.target.value)} required>
              <option value="" disabled>To: Station or City</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} />
            <button type="submit" className="btn">Search Trains</button>
          </form>
        </div>
      </section>

      {/* Station 2: Features */}
      <section className="station-section" id="station-2">
        <div className="station-badge">🚉 Station 2 — Premium Features</div>
        <h2 className="section-title">Everything you need to travel smarter</h2>
        <p className="section-subtitle">Railyatri is packed with powerful tools that make booking effortless and intelligent.</p>
        <div className="features-grid" style={{ marginTop: '2.5rem' }}>
          {features.map((f, idx) => (
            <div className="feature-card" key={idx}>
              <div className="feature-icon">{f.icon}</div>
              <div className="feature-title">{f.title}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Station 3: Booking Engine */}
      <section className="station-section" id="station-3">
        <div className="station-badge">🚉 Station 3 — The Booking Engine</div>
        <h2 className="section-title">Visual seat selection, just like the real thing</h2>
        <p className="section-subtitle">Choose your coach class, pick your exact berth — upper, middle, lower, or side. See what's booked in real time.</p>
        <div className="coach-demo-row">
          <div style={{ background: '#4a4059', color: 'white', borderRadius: '14px', padding: '1rem 1.5rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>🚂 Loco</div>
          {coaches.map(c => (
            <div key={c.code} className={`coach-demo-item ${selectedCoach === c.code ? 'active' : ''}`} onClick={() => setSelectedCoach(c.code)}>
              <div style={{ fontSize: '1.5rem' }}>{c.emoji}</div>
              <div className="coach-type">{c.code}</div>
              <div className="coach-sub">{c.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Station 4: Dashboard */}
      <section className="station-section" id="station-4">
        <div className="station-badge">🚉 Station 4 — Your Travel Dashboard</div>
        <h2 className="section-title">All your journeys, one beautiful place</h2>
        <p className="section-subtitle">Analytics, upcoming trips, and historical receipts — stored elegantly in your Smart Dashboard.</p>
        <div className="stats-grid" style={{ margin: '0 auto' }}>
          {[
            { num: '30+', label: 'Train Routes' },
            { num: '5', label: 'Coach Classes' },
            { num: '99%', label: 'Booking Success Rate' },
            { num: '⚡', label: 'Instant Confirmation' },
          ].map((s, i) => (
            <div className="stat-card" key={i}>
              <div className="stat-num">{s.num}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <button onClick={() => navigate('/auth')} className="btn" style={{ display: 'inline-block', width: 'auto', padding: '1rem 3rem', fontSize: '1.2rem' }}>
            Start Your Journey →
          </button>
        </div>
      </section>

      <TrainAnimation showStations={true} />
    </div>
  );
}

export default Home;
