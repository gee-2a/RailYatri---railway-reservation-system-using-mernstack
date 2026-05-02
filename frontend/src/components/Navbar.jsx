import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName');
  const role = localStorage.getItem('userRole');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    navigate('/auth');
  };

  return (
    <nav style={{ position: 'fixed', width: '100%', top: 0, zIndex: 1000, background: 'var(--bg-card)', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem' }}>
      <Link to="/" className="brand" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        🚂 Railyatri
      </Link>
      <div className="nav-links" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        {userName ? (
          <>
            {role === 'admin' ? (
              <Link to="/admin" style={{ textDecoration: 'none', color: 'var(--text-main)', fontWeight: 500 }}>Admin Panel</Link>
            ) : null}
            <Link to="/dashboard" style={{ textDecoration: 'none', color: 'var(--text-main)', fontWeight: 500 }}>Dashboard</Link>
            <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '1rem' }}>
              <span className="user-name" style={{ fontWeight: 600 }}>{userName}</span>
              {role === 'admin' && <span className="admin-tag bg-green-500 text-white px-2 py-1 rounded text-xs font-bold ml-2">ADMIN</span>}
              <button onClick={handleLogout} className="btn btn-danger" style={{ padding: '0.5rem 1rem', width: 'auto' }}>Logout</button>
            </div>
          </>
        ) : (
          <Link to="/auth" className="btn" style={{ padding: '0.5rem 1.5rem', color: 'white', textDecoration: 'none' }}>Sign In</Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
