import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, ScrollText, Trophy, BarChart2, LogOut } from 'lucide-react';

import Dashboard from './pages/Dashboard';
import Survey from './pages/Survey';
import Diary from './pages/Diary';
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import Register from './pages/Register';

const NavLink = ({ to, icon: Icon, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <li>
      <Link 
        to={to} 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          borderRadius: '10px',
          textDecoration: 'none',
          color: isActive ? '#4f46e5' : '#64748b',
          backgroundColor: isActive ? '#eef2ff' : 'transparent',
          fontWeight: isActive ? '600' : '500',
          transition: 'all 0.2s ease',
          fontSize: '0.95rem'
        }}
      >
        <Icon size={18} color={isActive ? '#4f46e5' : '#94a3b8'} />
        {children}
      </Link>
    </li>
  );
};

function App() {
  const [userId, setUserId] = useState(localStorage.getItem('user_id'));

  const [user, setUser] = useState({
    name: "Гість",
    level: 1,
    avatarSeed: "Felix"
  });

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]); 

  const fetchUserData = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/users/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUser({
          name: data.username,
          level: data.level,
          avatarSeed: data.avatar_seed || data.username 
        });
      }
    } catch (error) {
      console.error("Помилка:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user_id');
    setUserId(null);
  };

  if (!userId) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login setAuth={setUserId} />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', 'Segoe UI', sans-serif", background: '#f1f5f9' }}>
        
        <nav style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          padding: '15px 40px', background: 'white', 
          boxShadow: '0 2px 15px rgba(0,0,0,0.04)',
          position: 'sticky', top: 0, zIndex: 100
        }}>
          
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#4f46e5', letterSpacing: '-1px' }}>
            Aware
          </div>
          
          <ul style={{ display: 'flex', listStyle: 'none', gap: '15px', margin: 0, padding: 0 }}>
            <NavLink to="/" icon={LayoutDashboard}>Профіль</NavLink>
            <NavLink to="/survey" icon={ScrollText}>Опитування</NavLink>
            <NavLink to="/diary" icon={BookOpen}>Щоденник</NavLink>
            <NavLink to="/analytics" icon={BarChart2}>Аналітика</NavLink>
          </ul>

          <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '600' }}>
                  Lvl {user.level} 
              </span>
              <div style={{ 
                  width: '38px', 
                  height: '38px', 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontWeight: 'bold',
                  color: '#fff',
                  textTransform: 'uppercase',
                  boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
              }}>
                {user.name.charAt(0)}
              </div>
            </div>

            <button 
              onClick={handleLogout} 
              style={{
                background: '#fef2f2', 
                border: 'none', 
                color: '#ef4444', 
                padding: '8px 16px', 
                borderRadius: '10px', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center',
                gap: '8px',
                fontWeight: '600',
                transition: 'background 0.2s'
              }}
            >
                <LogOut size={16} /> Вихід
            </button>
          </div>
        </nav>

        <main style={{ flex: 1, padding: '30px', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
          <Routes>
            <Route path="/" element={<Dashboard userId={userId} />} /> 
            <Route path="/diary" element={<Diary userId={userId} />} />
            <Route path="/survey" element={<Survey userId={userId} />} />
            <Route path="/analytics" element={<Analytics userId={userId} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

      </div>
    </Router>
  );
}

export default App;