import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [isHovered, setIsHovered] = useState(false);
  
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:8000/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });

      if (response.ok) {
        alert("Успішно! Тепер увійдіть.");
        navigate('/login');
      } else {
        const errorData = await response.json();
        alert("Помилка: " + errorData.detail);
      }
    } catch (error) {
      console.error("Помилка реєстрації:", error);
    }
  };

  return (
    <div style={registerStyles.container}>
      <div style={registerStyles.card}>
        <div style={registerStyles.logoContainer}>
            <Link to="/" style={registerStyles.logoLink}>
                <h1 style={registerStyles.textLogo}>Aware</h1>
            </Link>
        </div>

        <div style={registerStyles.headerContainer}>
          <h2 style={registerStyles.title}>Створити акаунт</h2>
          <p style={registerStyles.subTitle}>
            Приєднуйтесь до нас, щоб почати свій шлях до кращого ментального здоров'я та нових звичок.
          </p>
        </div>

        <form onSubmit={handleRegister} style={registerStyles.form}>
          <div style={registerStyles.inputBlock}>
            <label htmlFor="username" style={registerStyles.label}>Ваше ім'я</label>
            <input 
              id="username"
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)}
              style={registerStyles.input}
              required
            />
          </div>

          <div style={registerStyles.inputBlock}>
            <label htmlFor="email" style={registerStyles.label}>Email</label>
            <input 
              id="email"
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              style={registerStyles.input}
              required
            />
          </div>

          <div style={registerStyles.inputBlock}>
            <label htmlFor="password" style={registerStyles.label}>Пароль</label>
            <input 
              id="password"
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              style={registerStyles.input}
              required
            />
          </div>

          <button 
            type="submit" 
            style={{
              ...registerStyles.primaryButton,
              backgroundColor: isHovered ? '#4338ca' : '#4f46e5',
              boxShadow: isHovered ? '0 4px 14px rgba(79, 70, 229, 0.4)' : 'none', 
              transform: isHovered ? 'translateY(-2px)' : 'translateY(0)' 
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            Зареєструватися
          </button>
        </form>

        <div style={registerStyles.footer}>
          <p style={registerStyles.footerText}>Вже є акаунт?</p>
          <Link to="/login" style={registerStyles.footerLink}>Увійти</Link>
        </div>
      </div>
    </div>
  );
};


const registerStyles = {
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
    transition: 'all 0.3s ease',
    marginTop: '10px' 
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

export default Register;