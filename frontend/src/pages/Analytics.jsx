import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { Activity, BrainCircuit } from 'lucide-react';


const METRICS_CONFIG = [
  { key: 'mood', label: 'Настрій', color: '#8b5cf6'},
  { key: 'energy', label: 'Енергія', color: '#f59e0b'},
  { key: 'sleep', label: 'Сон', color: '#3b82f6' },
  { key: 'productivity', label: 'Продуктивність', color: '#10b981'}
];

const Analytics = ({ userId }) => {
  const [data, setData] = useState([]); 
  const [emotionData, setEmotionData] = useState([]); 
  const [loading, setLoading] = useState(true);

  const [activeLines, setActiveLines] = useState({
    mood: true,
    energy: true,
    anxiety: false,
    sleep: false,
    productivity: false
  });

  const toggleLine = (metricKey) => {
    setActiveLines(prev => ({
      ...prev,
      [metricKey]: !prev[metricKey]
    }));
  };

  useEffect(() => {
    fetchAnalytics();
  }, [userId]);

  const fetchAnalytics = async () => {
    try {
      if (!userId) return;

      const [surveysRes, diaryRes] = await Promise.all([
        fetch(`http://127.0.0.1:8000/surveys/${userId}`),
        fetch(`http://127.0.0.1:8000/diary/${userId}?_t=${new Date().getTime()}`)
      ]);

      if (surveysRes.ok && diaryRes.ok) {
        const rawSurveys = await surveysRes.json();
        const rawDiary = await diaryRes.json();
        
        const formattedData = rawSurveys.map(item => {
            const dateObj = new Date(item.date);
            const dayName = dateObj.toLocaleDateString('uk-UA', { weekday: 'short' });
            
            return {
                name: dayName,
                fullDate: item.date,
                mood: item.mood,
                energy: item.energy,
                anxiety: item.anxiety,
                sleep: item.sleep_quality,
                productivity: item.productivity
            };
        });
        setData(formattedData.slice(-7)); 

        let pos = 0, neu = 0, neg = 0;
        rawDiary.forEach(entry => {
            if (entry.emotion_label === 'Позитивний') pos++;
            else if (entry.emotion_label === 'Негативний') neg++;
            else if (entry.emotion_label === 'Нейтральний') neu++;
        });

        const pieData = [
            { name: 'Позитивний', value: pos, color: '#10b981' }, 
            { name: 'Нейтральний', value: neu, color: '#94a3b8' }, 
            { name: 'Негативний', value: neg, color: '#ef4444' }   
        ].filter(item => item.value > 0);

        setEmotionData(pieData);
      }
    } catch (error) {
      console.error("Помилка:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAverage = (key) => {
    if (data.length === 0) return 0;
    const sum = data.reduce((acc, curr) => acc + curr[key], 0);
    return (sum / data.length).toFixed(1);
  };

  if (loading) return <div style={styles.loadingState}>Завантаження аналітики...</div>;

  return (
    <div style={styles.container}>
      
      <div style={styles.headerWrapper}>
        <div style={styles.headerTextContainer}>
          <h1 style={styles.title}>
            <Activity color="#4f46e5" size={28} style={{marginRight: '10px'}}/> 
            Аналітика стану
          </h1>
          <p style={styles.subtitle}>Комплексна статистика на основі твоїх опитувань та ШІ-аналізу щоденника</p>
        </div>
      </div>

      {data.length === 0 && emotionData.length === 0 ? (
        <div style={styles.emptyState}>
            <h3 style={{color: '#0f172a', marginBottom: '10px'}}>Даних ще недостатньо 📊</h3>
            <p style={{color: '#64748b'}}>Пройди хоча б одне опитування або напиши в щоденник, щоб побачити статистику.</p>
        </div>
      ) : (
        <>
            {data.length > 0 && (
              <div style={styles.kpiGrid}>
                  <div style={styles.kpiCard}>
                    <div style={{...styles.kpiIcon, background: '#e0e7ff', color: '#4338ca'}}>😊</div>
                    <div><div style={styles.kpiValue}>{calculateAverage('mood')}</div><div style={styles.kpiLabel}>Середній настрій</div></div>
                  </div>
                  <div style={styles.kpiCard}>
                    <div style={{...styles.kpiIcon, background: '#dbeafe', color: '#1e40af'}}>💤</div>
                    <div><div style={styles.kpiValue}>{calculateAverage('sleep')} год</div><div style={styles.kpiLabel}>Середній сон</div></div>
                  </div>
                  <div style={styles.kpiCard}>
                    <div style={{...styles.kpiIcon, background: '#fce7f3', color: '#be185d'}}>⚡</div>
                    <div><div style={styles.kpiValue}>{calculateAverage('energy')}/10</div><div style={styles.kpiLabel}>Рівень енергії</div></div>
                  </div>
                  <div style={styles.kpiCard}>
                    <div style={{...styles.kpiIcon, background: '#dcfce7', color: '#15803d'}}>💼</div>
                    <div><div style={styles.kpiValue}>{calculateAverage('productivity')}</div><div style={styles.kpiLabel}>Продуктивність</div></div>
                  </div>
              </div>
            )}

            <div style={styles.chartsGrid}>

                {data.length > 0 && (
                  <div style={{...styles.chartCard, gridColumn: '1 / -1'}}>
                    <div style={styles.chartTitle}>Кореляція показників стану</div>
                    <p style={styles.chartDescription}>
                      Обери показники нижче, щоб накласти їх один на одного та знайти закономірності (наприклад, як сон впливає на тривожність).
                    </p>

                    <div style={styles.togglesContainer}>
                      {METRICS_CONFIG.map(metric => (
                        <button
                          key={metric.key}
                          onClick={() => toggleLine(metric.key)}
                          style={{
                            ...styles.toggleBtn,
                            backgroundColor: activeLines[metric.key] ? metric.color : '#f8fafc',
                            color: activeLines[metric.key] ? 'white' : '#64748b',
                            borderColor: activeLines[metric.key] ? metric.color : '#e2e8f0',
                          }}
                        >
                          {metric.icon} {metric.label}
                        </button>
                      ))}
                    </div>

                    <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="name" stroke="#64748b" />
                            <YAxis domain={[0, 10]} stroke="#64748b" />
                            <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)'}} />
                            <Legend wrapperStyle={{paddingTop: '20px'}}/>
                            
                            {METRICS_CONFIG.map(metric => (
                              activeLines[metric.key] && (
                                <Line 
                                  key={metric.key}
                                  type="monotone" 
                                  dataKey={metric.key} 
                                  name={metric.label} 
                                  stroke={metric.color} 
                                  strokeWidth={3} 
                                  activeDot={{ r: 8 }} 
                                />
                              )
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {data.length > 0 && (
                  <div style={styles.chartCard}>
                    <div style={styles.chartTitle}>Рівень тривожності</div>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorAnxiety" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" stroke="#64748b"/>
                        <YAxis domain={[0, 10]} stroke="#64748b"/>
                        <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)'}}/>
                        <Area type="monotone" dataKey="anxiety" name="Тривожність" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorAnxiety)" />
                        </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div style={styles.chartCard}>
                  <div style={styles.chartTitle}>
                    ШІ-Аналіз емоцій щоденника
                  </div>
                  {emotionData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                              data={emotionData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                              label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                              {emotionData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                          </Pie>
                          <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)'}} />
                        </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={styles.emptyStateSmall}>Немає записів у щоденнику для аналізу</div>
                  )}
                </div>

            </div>
        </>
      )}
    </div>
  );
};

const styles = {
  container: { 
    padding: '40px 20px', 
    maxWidth: '1200px', 
    margin: '0 auto', 
    fontFamily: "'Inter', 'Segoe UI', 'Nunito', sans-serif", 
    minHeight: '100vh' },

  loadingState: { 
    padding: '100px', 
    textAlign: 'center', 
    fontSize: '1.2rem', 
    color: '#64748b' },

  headerWrapper: { 
    display: 'flex', 
    alignItems: 'center', 
    marginBottom: '40px', 
    background: 'white', 
    padding: '25px 30px', 
    borderRadius: '20px', 
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)' },

  headerTextContainer: { 
    textAlign: 'left' },

  title: { 
    margin: '0 0 8px 0', 
    fontSize: '2rem', 
    color: '#0f172a', 
    fontWeight: '800', 
    display: 'flex', 
    alignItems: 'center' },

  subtitle: { 
    color: '#64748b', 
    fontSize: '1.05rem', 
    fontWeight: '500', 
    margin: 0 },

  emptyState: { 
    textAlign: 'center', 
    padding: '60px', 
    background: 'white', 
    borderRadius: '24px', 
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)' },

  emptyStateSmall: { 
    height: '250px', 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    color: '#94a3b8', 
    fontStyle: 'italic', 
    textAlign: 'center' },
  
  kpiGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
    gap: '20px', 
    marginBottom: '30px' },

  kpiCard: { 
    background: 'white', 
    padding: '20px', 
    borderRadius: '20px', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '15px', 
    boxShadow: '0 4px 15px rgba(0,0,0,0.03)', 
    transition: 'transform 0.2s ease' },

  kpiIcon: { 
    width: '50px', 
    height: '50px', 
    borderRadius: '16px', 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    fontSize: '1.5rem' },

  kpiValue: { 
    fontSize: '1.5rem', 
    fontWeight: '800', 
    color: '#0f172a' },

  kpiLabel: { 
    fontSize: '0.9rem', 
    color: '#64748b', 
    fontWeight: '500' },
  
  chartsGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
    gap: '30px' },

  chartCard: { 
    background: 'white', 
    padding: '30px', 
    borderRadius: '24px', 
    boxShadow: '0 10px 30px rgba(0,0,0,0.04)' },

  chartTitle: { 
    fontSize: '1.2rem', 
    fontWeight: '700', 
    color: '#1e293b', 
    marginBottom: '5px' },

  chartDescription: { 
    fontSize: '0.9rem', 
    color: '#64748b', 
    marginBottom: '20px' },

  togglesContainer: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    marginBottom: '30px',
  },
  toggleBtn: {
    padding: '8px 16px',
    borderRadius: '20px',
    border: '2px solid',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  }
};

export default Analytics;