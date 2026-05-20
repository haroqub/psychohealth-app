import React, { useState, useEffect } from 'react';
import { Flame, Trophy } from 'lucide-react';

const Dashboard = ({ userId }) => {
  const [user, setUser] = useState({
    name: "Гість",
    level: 1,
    currentXP: 0,
    maxXP: 1000,
    hp: 100,
    streak: 0,
    avatarSeed: "Felix"
  });

  const [loading, setLoading] = useState(true);
  const [quests, setQuests] = useState([]);

  useEffect(() => {
    fetchUserData();
  }, [userId]); 

  const fetchUserData = async () => {
    try {
      if (!userId) return; 
      const userRes = await fetch(`http://127.0.0.1:8000/users/${userId}`);
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser({
            name: userData.username,
            level: userData.level,
            currentXP: userData.xp,
            maxXP: userData.level * 1000,
            hp: userData.hp,
            streak: userData.streak_days,
            avatarSeed: userData.avatar_seed || userData.username
        });
      }
      const questRes = await fetch(`http://127.0.0.1:8000/quests/${userId}`);
      if (questRes.ok) setQuests(await questRes.json());
    } catch (error) { 
        console.error(error); 
    } finally { 
        setLoading(false); 
    }
  };

  const handleQuestClick = async (quest) => {
    if (['login', 'survey', 'diary'].includes(quest.quest_type)) return;
    if (quest.is_completed) return;

    try {
        const res = await fetch(`http://127.0.0.1:8000/quests/${quest.id}/toggle`, { method: 'POST' });
        if (res.ok) {
            setQuests(quests.map(q => q.id === quest.id ? { ...q, is_completed: true } : q));
        }
    } catch (error) { 
        console.error("Error:", error); 
    }
  };

  if (loading) return <div style={styles.loadingContainer}>Завантаження героя...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.profileCard}>
        <div style={styles.avatarSection}>
          <img 
            src={`https://api.dicebear.com/9.x/adventurer/svg?eyebrows=variant10&eyes=variant05,variant03,variant17,variant24,variant01&features[]&glasses[]&glassesProbability=0&hair=short01&mouth=variant01,variant02,variant21,variant29,variant30&seed=Sarah`} 
            alt="Avatar" 
            style={styles.avatarImg}
          />
          <div style={styles.levelBadge}>Lvl {user.level}</div>
        </div>
        
        <h2 style={styles.userName}>{user.name}</h2>

        <div style={styles.streakContainer}>
          <div style={{ textAlign: 'center' }}>
            <Flame color="#f59e0b" size={24} />
            <div style={styles.streakValue}>{user.streak}</div>
            <div style={styles.streakLabel}>Днів підряд</div>
          </div>
        </div>

        <div style={styles.statsContainer}>
          <div style={styles.barLabel}>
            <span>❤️ Ментальне здоров'я</span>
            <span>{user.hp}%</span>
          </div>
          <div style={styles.progressTrack}>
            <div style={{ ...styles.progressFill, ...styles.hpFill, width: `${user.hp}%` }}></div>
          </div>
          
          <div style={styles.barLabel}>
            <span>⭐ Досвід (XP)</span>
            <span>{user.currentXP} / {user.maxXP}</span>
          </div>
          <div style={styles.progressTrack}>
            <div style={{ ...styles.progressFill, ...styles.xpFill, width: `${(user.currentXP / user.maxXP) * 100}%` }}></div>
          </div>
        </div>
      </div>

      <div style={styles.questsSection}>
        <h2 style={styles.questsTitle}>
          <Trophy color="#f59e0b" /> Щоденні квести
        </h2>
        
        {quests.map(quest => {
          const isAutoQuest = ['login', 'survey', 'diary'].includes(quest.quest_type);
          
          return (
            <div 
              key={quest.id} 
              style={{ 
                ...styles.questCard, 
                opacity: quest.is_completed ? 0.6 : 1, 
                cursor: isAutoQuest ? 'default' : 'pointer' 
              }}
              onClick={() => handleQuestClick(quest)}
            >
              <input 
                type="checkbox" 
                style={styles.questCheckbox} 
                checked={quest.is_completed} 
                readOnly 
              />
              <span style={{ textDecoration: quest.is_completed ? 'line-through' : 'none' }}>
                {quest.title}
                {isAutoQuest && !quest.is_completed && (
                  <span style={styles.autoQuestLabel}>(Автоматично)</span>
                )}
              </span>
              <span style={styles.questReward}>+{quest.xp_reward} XP</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const styles = {
  loadingContainer: {
    padding: '40px',
    textAlign: 'center'
  },
  container: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: '30px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  profileCard: {
    background: 'white',
    padding: '25px',
    borderRadius: '20px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
    textAlign: 'center'
  },
  avatarSection: {
    position: 'relative',
    display: 'inline-block',
    marginBottom: '15px'
  },
  avatarImg: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    border: '4px solid #f59e0b',
    objectFit: 'cover'
  },
  levelBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    background: '#f59e0b',
    color: 'white',
    padding: '5px 10px',
    borderRadius: '12px',
    fontWeight: 'bold',
    fontSize: '0.9rem',
    border: '2px solid white'
  },
  userName: {
    margin: '10px 0 0 0'
  },
  streakContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    margin: '20px 0'
  },
  streakValue: {
    fontWeight: 'bold',
    fontSize: '1.1rem'
  },
  streakLabel: {
    fontSize: '0.8rem',
    color: '#94a3b8'
  },
  statsContainer: {
    marginTop: '20px',
    textAlign: 'left'
  },
  barLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.9rem',
    color: '#64748b',
    marginBottom: '5px',
    marginTop: '15px'
  },
  progressTrack: {
    width: '100%',
    height: '10px',
    background: '#e2e8f0',
    borderRadius: '5px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: '5px',
    transition: 'width 0.5s ease-in-out'
  },
  hpFill: {
    background: '#ef4444'
  },
  xpFill: {
    background: '#3b82f6'
  },
  questsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  questsTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    margin: '0 0 10px 0'
  },
  questCard: {
    background: 'white',
    padding: '20px',
    borderRadius: '15px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  questCheckbox: {
    width: '24px',
    height: '24px',
    cursor: 'pointer'
  },
  questReward: {
    marginLeft: 'auto',
    background: '#dbeafe',
    color: '#1e40af',
    padding: '4px 10px',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: 'bold'
  },
  autoQuestLabel: {
    fontSize: '0.7em',
    color: '#3b82f6',
    marginLeft: '10px'
  }
};

export default Dashboard;