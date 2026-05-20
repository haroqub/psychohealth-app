import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = ({ setAuth }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  const [isHovered, setIsHovered] = useState(false); 
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:8000/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('user_id', data.user_id);
        setAuth(data.user_id);
        navigate('/');
      } else {
        const err = await response.json();
        alert(err.detail || "Невірний email або пароль!");
      }
    } catch (error) {
      console.error("Помилка входу:", error);
    }
  };

  return (
    <div style={loginStyles.container}>
      <div style={loginStyles.card}>
        <div style={loginStyles.logoContainer}>
            <Link to="/" style={loginStyles.logoLink}>
                <h1 style={loginStyles.textLogo}>Aware</h1>
            </Link>
        </div>

        <div style={loginStyles.headerContainer}>
          <h2 style={loginStyles.title}>Раді знову бачити!</h2>
          <p style={loginStyles.subTitle}>
            Увійдіть, щоб продовжити піклування про свій ментальний стан,
            управляти цілями та відстежувати прогрес.
          </p>
        </div>

        <form onSubmit={handleLogin} style={loginStyles.form}>
          <div style={loginStyles.inputBlock}>
            <label htmlFor="email" style={loginStyles.label}>Email</label>
            <input 
              id="email"
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              style={loginStyles.input}
              required
            />
          </div>

          <div style={loginStyles.inputBlock}>
            <label htmlFor="password" style={loginStyles.label}>Пароль</label>
            <input 
              id="password"
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              style={loginStyles.input}
              required
            />
          </div>

          <div style={loginStyles.controlsContainer}>
            <div style={loginStyles.checkboxGroup}>
              <input 
                id="rememberMe"
                type="checkbox" 
                checked={rememberMe} 
                onChange={(e) => setRememberMe(e.target.checked)}
                style={loginStyles.checkbox}
              />
              <label htmlFor="rememberMe" style={loginStyles.checkboxLabel}>Запам'ятати мене</label>
            </div>
          </div>

          <button 
            type="submit" 
            style={{
              ...loginStyles.primaryButton,
              backgroundColor: isHovered ? '#4338ca' : '#4f46e5', 
              boxShadow: isHovered ? '0 4px 14px rgba(79, 70, 229, 0.4)' : 'none', 
              transform: isHovered ? 'translateY(-2px)' : 'translateY(0)' 
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            Увійти
          </button>
        </form>

        <div style={loginStyles.footer}>
          <p style={loginStyles.footerText}>Немає акаунту?</p>
          <Link to="/register" style={loginStyles.footerLink}>Зареєструватися</Link>
        </div>
      </div>
    </div>
  );
};

const loginStyles = {
  container: { 
    height: '100vh', 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    background: '#f1f5f9',
    fontFamily: "'Inter', 'Segoe UI', 'Nunito', sans-serif" 
  },
  card: { 
    background: 'white', 
    padding: '40px', 
    borderRadius: '15px', 
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)', 
    width: '400px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  logoContainer: {
    marginBottom: '20px'
  },
  logoLink: {
    textDecoration: 'none' 
  },
  textLogo: {
    fontSize: '2.4rem',
    fontWeight: '800',
    color: '#4f46e5', 
    margin: 0,
    letterSpacing: '-1px' 
  },
  headerContainer: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 10px 0'
  },
  subTitle: {
    fontSize: '0.9rem',
    color: '#64748b',
    lineHeight: '1.5',
    margin: 0
  },
  form: {
    display: 'flex', 
    flexDirection: 'column', 
    gap: '20px', 
    width: '100%'
  },
  inputBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    width: '100%'
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#0f172a'
  },
  input: { 
    padding: '12px', 
    borderRadius: '8px', 
    border: '1px solid #cbd5e1', 
    background: '#f8fafc',
    fontSize: '1rem',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: 'inherit'
  },
  controlsContainer: {
    display: 'flex', 
    justifyContent: 'flex-start', 
    alignItems: 'center', 
    fontSize: '0.9rem',
    marginBottom: '10px' 
  },
  checkboxGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  checkboxLabel: {
    color: '#64748b'
  },
  checkbox: {
    cursor: 'pointer'
  },
  primaryButton: { 
    padding: '12px', 
    color: 'white', 
    border: 'none', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontSize: '1rem',
    fontWeight: '600',
    width: '100%',
    textAlign: 'center',
    transition: 'all 0.3s ease' 
  },
  footer: { 
    marginTop: '25px', 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center',
    gap: '10px',
    width: '100%'
  },
  footerText: {
    color: '#64748b',
    margin: 0
  },
  footerLink: {
    color: '#4f46e5',
    fontWeight: '600',
    textDecoration: 'none'
  }
};

export default Login;