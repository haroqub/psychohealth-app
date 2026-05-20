import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, PenLine } from 'lucide-react';

const Diary = ({ userId }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEntryText, setNewEntryText] = useState("");
  const [selectedDay, setSelectedDay] = useState(null);
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    fetchEntries();
  }, [currentDate, userId]);

  const fetchEntries = async () => {
    try {
      if (!userId) return;
      const timestamp = new Date().getTime(); 
      const response = await fetch(`http://127.0.0.1:8000/diary/${userId}?_t=${timestamp}`, {
        method: 'GET',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
            const cleanData = data.map(item => ({
                ...item,
                date: item.date.toString().split('T')[0] 
            }));
            setEntries(cleanData);
        } else {
            setEntries([]);
        }
      }
    } catch (error) {
      console.error("Помилка мережі:", error);
    }
  };

  const handleOpenAdd = (dateStr) => {
    setSelectedDay(dateStr);
    const existingEntry = entries.find(e => e.date === dateStr);
    setNewEntryText(existingEntry ? existingEntry.text : "");
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedDay) return;

    const dataToSend = {
      date: selectedDay,
      text: newEntryText
    };

    try {
      const response = await fetch(`http://127.0.0.1:8000/diary/?user_id=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        const savedEntry = await response.json(); 

        setEntries(prevEntries => {
            const otherEntries = prevEntries.filter(e => e.date !== selectedDay);
            const newEntryClean = {
                ...savedEntry,
                date: savedEntry.date.toString().split('T')[0]
            };
            return [...otherEntries, newEntryClean];
        });

        setIsModalOpen(false);
        setNewEntryText(""); 
      } else {
        alert("Помилка збереження.");
      }
    } catch (error) {
      console.error("Помилка:", error);
    }
  };

  const getMonday = (d) => {
    d = new Date(d);
    const day = d.getDay(),
      diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const currentMonday = getMonday(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(currentMonday);
    day.setDate(currentMonday.getDate() + i);
    return day;
  });

  const changeWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  const formatDateRange = () => {
    const start = weekDays[0];
    const end = weekDays[6];
    const options = { day: 'numeric', month: 'long' };
    return `${start.toLocaleDateString('uk-UA', options)} — ${end.toLocaleDateString('uk-UA', options)}`;
  };

  const renderEmotionBadge = (label) => {
    if (!label) return null;
    
    let bgColor = '#f1f5f9'; 
    let textColor = '#475569';
    
    if (label === 'Позитивний') {
      bgColor = '#dcfce7'; 
      textColor = '#166534';
    } else if (label === 'Негативний') {
      bgColor = '#fee2e2'; 
      textColor = '#991b1b';
    }

    return (
      <span style={{
        fontSize: '0.75rem',
        padding: '4px 10px',
        borderRadius: '12px',
        fontWeight: '600',
        backgroundColor: bgColor,
        color: textColor,
        marginLeft: 'auto' 
      }}>
        {label}
      </span>
    );
  };

  const DayCard = ({ day }) => {
    const [isHovered, setIsHovered] = useState(false);
    const isoDate = day.toISOString().split('T')[0];
    const entry = entries.find(e => e.date === isoDate);
    
    const dateStr = day.toLocaleDateString('uk-UA', { weekday: 'long', day: 'numeric', month: 'long' });
    const capitalizedDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
    const isToday = isoDate === new Date().toISOString().split('T')[0];

    const cardStyle = {
      ...styles.dayCard,
      transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
      boxShadow: isHovered ? '0 10px 25px rgba(0,0,0,0.1)' : '0 4px 15px rgba(0,0,0,0.05)',
      border: isToday ? '2px solid #4f46e5' : '2px solid transparent',
      background: isToday ? '#fcfcff' : 'white',
    };

    return (
      <div 
        style={cardStyle}
        onClick={() => handleOpenAdd(isoDate)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div style={styles.dayHeader}>
          <span>{capitalizedDate}</span>
          
          <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
            {isToday && <span style={styles.todayBadge}>Сьогодні</span>}
            {entry && renderEmotionBadge(entry.emotion_label)}
          </div>
        </div>
        
        <div style={styles.dayContent}>
          {entry && entry.text.trim() !== "" ? (
             <p style={styles.entryText}>
               {entry.text.length > 120 ? entry.text.substring(0, 120) + "..." : entry.text}
             </p>
          ) : (
             <div style={styles.emptyState}>
               <PenLine size={20} color="#cbd5e1" style={{marginBottom: '8px'}}/>
               <span>Додати запис</span>
             </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerWrapper}>
        <button style={styles.navBtn} onClick={() => changeWeek(-1)}>
          <ChevronLeft size={24} color="#4f46e5" />
        </button>
        
        <div style={styles.headerTextContainer}>
          <h1 style={styles.title}>Мій Щоденник</h1>
          <div style={styles.subtitle}>{formatDateRange()}</div>
        </div>
        
        <button style={styles.navBtn} onClick={() => changeWeek(1)}>
          <ChevronRight size={24} color="#4f46e5" />
        </button>
      </div>

      <div style={styles.gridContainer}>
        {weekDays.map(day => <DayCard key={day.toISOString()} day={day} />)}
      </div>

      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>{newEntryText ? "Редагувати запис" : "Новий запис"}</h3>
              <p style={styles.modalDate}>{new Date(selectedDay).toLocaleDateString('uk-UA', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            </div>
            
            <textarea 
              autoFocus
              style={styles.textarea}
              placeholder="Як пройшов твій день? Що ти відчуваєш зараз?"
              value={newEntryText}
              onChange={(e) => setNewEntryText(e.target.value)}
            />

             <div style={styles.modalButtons}>
              <button style={styles.btnCancel} onClick={() => setIsModalOpen(false)}>
                Скасувати
              </button>
              <button style={styles.btnSave} onClick={handleSave}>
                Зберегти
              </button>
            </div>
          </div>
        </div>
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
    minHeight: '100vh',
  },
  headerWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px',
    background: 'white',
    padding: '20px 30px',
    borderRadius: '20px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
  },
  headerTextContainer: {
    textAlign: 'center',
  },
  title: {
    margin: '0 0 5px 0',
    fontSize: '1.8rem',
    color: '#0f172a',
    fontWeight: '700',
  },
  subtitle: {
    color: '#64748b',
    fontSize: '1rem',
    fontWeight: '500',
  },
  navBtn: {
    background: '#f1f5f9',
    border: 'none',
    borderRadius: '50%',
    width: '45px',
    height: '45px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '25px',
  },
  dayCard: {
    borderRadius: '20px',
    padding: '25px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '180px',
  },
  dayHeader: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '15px',
    paddingBottom: '15px',
    borderBottom: '1px solid #f1f5f9',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  todayBadge: {
    fontSize: '0.75rem',
    background: '#e0e7ff',
    color: '#4f46e5',
    padding: '4px 10px',
    borderRadius: '12px',
    fontWeight: '600',
  },
  dayContent: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  entryText: {
    color: '#475569',
    lineHeight: '1.6',
    margin: 0,
    fontSize: '0.95rem',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#94a3b8',
    fontSize: '0.9rem',
    fontWeight: '500',
    fontStyle: 'italic',
    marginTop: '20px'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    background: 'white',
    padding: '35px',
    borderRadius: '24px',
    width: '100%',
    maxWidth: '600px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
  },
  modalHeader: {
    marginBottom: '20px',
  },
  modalTitle: {
    margin: '0 0 5px 0',
    fontSize: '1.5rem',
    color: '#0f172a',
  },
  modalDate: {
    margin: 0,
    color: '#64748b',
    fontSize: '0.95rem',
    fontWeight: '500',
  },
  textarea: {
    width: '100%',
    height: '250px',
    padding: '20px',
    borderRadius: '16px',
    border: '2px solid #e2e8f0',
    background: '#f8fafc',
    fontSize: '1.05rem',
    lineHeight: '1.6',
    fontFamily: 'inherit',
    resize: 'none',
    boxSizing: 'border-box',
    outline: 'none',
    color: '#1e293b',
    marginBottom: '25px',
  },
  modalButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '15px',
  },
  btnCancel: {
    padding: '12px 24px',
    background: '#f1f5f9',
    color: '#64748b',
    border: 'none',
    borderRadius: '12px',
    fontWeight: '600',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  btnSave: {
    padding: '12px 30px',
    background: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontWeight: '600',
    fontSize: '1rem',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(79, 70, 229, 0.3)',
    transition: 'all 0.2s',
  }
};

export default Diary;