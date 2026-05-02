import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';

function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const queryParams = new URLSearchParams(location.search);
  const redirect = queryParams.get('redirect');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = isLogin ? await authAPI.login(formData) : await authAPI.register(formData);
      
      const { token, _id, name, role } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('userId', _id);
      localStorage.setItem('userName', name);
      localStorage.setItem('userRole', role);

      toast.success(isLogin ? 'Logged in successfully!' : 'Account created successfully!');
      
      if (redirect) {
        navigate(`/${redirect}?${queryParams.toString()}`);
      } else {
        navigate(role === 'admin' ? '/admin' : '/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Authentication failed');
    }
  };

  return (
    <div className="container auth-container" style={{ minHeight: 'calc(100vh - 76px)', paddingTop: '90px' }}>
      <div className="auth-card">
        <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} required />
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" className="form-control" value={formData.password} onChange={handleChange} required />
          </div>
          <button type="submit" className="btn">{isLogin ? 'Login' : 'Register'}</button>
        </form>
        <div className="switch-form">
          {isLogin ? (
            <>Don't have an account? <span style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 500 }} onClick={() => setIsLogin(false)}>Sign up</span></>
          ) : (
            <>Already have an account? <span style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 500 }} onClick={() => setIsLogin(true)}>Login</span></>
          )}
        </div>
      </div>
    </div>
  );
}

export default Auth;
