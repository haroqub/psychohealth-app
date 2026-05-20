import React, { useState } from 'react';
import { Smile, Zap, CloudLightning, Moon, Briefcase, MessageCircle, Heart, PenTool } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const Survey = ({ userId }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    mood: 5,
    energy: 5,
    anxiety: 1,
    sleep: 5, 
    productivity: 5,
    social: null,
    selfCare: null,
    note: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const dataToSend = {
        mood: formData.mood,
        energy: formData.energy,
        anxiety: formData.anxiety,
        sleep_quality: formData.sleep, 
        productivity: formData.productivity,
        social_interaction: formData.social === true, 
        self_care: formData.selfCare === true,
        note: formData.note || ""
    };

    try {
        const response = await fetch(`http://127.0.0.1:8000/surveys/?user_id=${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSend),
        });

        if (response.ok) {
            alert(`Дані успішно збережено!\nВи отримали +50 XP.`);
            navigate('/');
        } else {
            alert("Помилка при збереженні! Перевір консоль.");
        }
    } catch (error) {
        console.error("Помилка мережі:", error);
        alert("Не вдалося з'єднатися з сервером.");
    } finally {
        setIsSubmitting(false);
    }
  };

  const RangeQuestion = ({ icon: Icon, label, value, field, minLabel, maxLabel, color }) => (
    <div style={styles.card}>
      <label style={styles.questionLabel}>
        <div style={{...styles.iconWrapper, backgroundColor: `${color}15`, color: color}}>
            <Icon size={22} />
        </div>
        {label}
      </label>
      <div style={styles.sliderContainer}>
        <input 
          type="range" min="1" max="10" 
          value={value}
          onChange={(e) => handleChange(field, parseInt(e.target.value))}
          style={{...styles.slider, accentColor: color}} 
        />
        <div style={styles.sliderLabels}>
          <span style={styles.minMaxLabel}>1 — {minLabel}</span>
          <span style={{...styles.currentVal, color: color}}>{value}</span>
          <span style={styles.minMaxLabel}>10 — {maxLabel}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
          <h2 style={styles.title}>Щоденний чек-ін</h2>
          <p style={styles.subtitle}>Приділи хвилину собі. Чесність із собою — ключ до прогресу.</p>
      </div>

      <form style={styles.form} onSubmit={handleSubmit}>
        
        <RangeQuestion 
          icon={Smile} color="#f59e0b"
          label="Як ви оцінюєте свій настрій?" 
          field="mood" value={formData.mood}
          minLabel="Жахливо" maxLabel="Чудово"
        />

        <RangeQuestion 
          icon={Zap} color="#eab308"
          label="Рівень енергії / сил" 
          field="energy" value={formData.energy}
          minLabel="Виснажений(а)" maxLabel="Повний(а) сил"
        />

        <RangeQuestion 
          icon={CloudLightning} color="#6366f1"
          label="Рівень тривожності" 
          field="anxiety" value={formData.anxiety}
          minLabel="Спокійний(а)" maxLabel="Паніка"
        />

        <RangeQuestion 
          icon={Moon} color="#3b82f6"
          label="Якість сну минулої ночі" 
          field="sleep" value={formData.sleep}
          minLabel="Дуже погано" maxLabel="Ідеально"
        />

        <RangeQuestion 
          icon={Briefcase} color="#10b981"
          label="Задоволення продуктивністю" 
          field="productivity" value={formData.productivity}
          minLabel="Зовсім ні" maxLabel="Дуже задоволений(а)"
        />

        <div style={styles.card}>
          <label style={styles.questionLabel}>
            <div style={{...styles.iconWrapper, backgroundColor: '#ec489915', color: '#ec4899'}}>
                <MessageCircle size={22} /> 
            </div>
            Чи підняв хтось вам настрій спілкуванням?
          </label>
          <div style={styles.toggleGroup}>
            <button type="button" 
              style={{
                  ...styles.toggleBtn, 
                  backgroundColor: formData.social === true ? '#ec4899' : '#f8fafc',
                  color: formData.social === true ? 'white' : '#64748b',
                  borderColor: formData.social === true ? '#ec4899' : '#e2e8f0'
              }}
              onClick={() => handleChange('social', true)}>
              Так, була приємна розмова
            </button>
            <button type="button" 
              style={{
                  ...styles.toggleBtn, 
                  backgroundColor: formData.social === false ? '#ec4899' : '#f8fafc',
                  color: formData.social === false ? 'white' : '#64748b',
                  borderColor: formData.social === false ? '#ec4899' : '#e2e8f0'
              }}
              onClick={() => handleChange('social', false)}>
              Ні
            </button>
          </div>
        </div>

        <div style={styles.card}>
          <label style={styles.questionLabel}>
            <div style={{...styles.iconWrapper, backgroundColor: '#ef444415', color: '#ef4444'}}>
                <Heart size={22} /> 
            </div>
            Чи зробили щось приємне для себе?
          </label>
          <div style={styles.toggleGroup}>
            <button type="button" 
              style={{
                  ...styles.toggleBtn, 
                  backgroundColor: formData.selfCare === true ? '#ef4444' : '#f8fafc',
                  color: formData.selfCare === true ? 'white' : '#64748b',
                  borderColor: formData.selfCare === true ? '#ef4444' : '#e2e8f0'
              }}
              onClick={() => handleChange('selfCare', true)}>
              Так, звісно 
            </button>
            <button type="button" 
              style={{
                  ...styles.toggleBtn, 
                  backgroundColor: formData.selfCare === false ? '#ef4444' : '#f8fafc',
                  color: formData.selfCare === false ? 'white' : '#64748b',
                  borderColor: formData.selfCare === false ? '#ef4444' : '#e2e8f0'
              }}
              onClick={() => handleChange('selfCare', false)}>
              Ні, не встиг(ла)
            </button>
          </div>
        </div>

        <div style={styles.card}>
          <label style={styles.questionLabel}>
             <div style={{...styles.iconWrapper, backgroundColor: '#64748b15', color: '#64748b'}}>
                <PenTool size={22} /> 
            </div>
            Нотатка дня (необов'язково)
          </label>
          <textarea 
            style={styles.textArea}
            placeholder="Що сьогодні було важливого? Інсайти, думки..."
            value={formData.note}
            onChange={(e) => handleChange('note', e.target.value)}
            rows="4"
          />
        </div>

        <button 
          type="submit" 
          style={{
            ...styles.submitBtn,
            transform: isActive ? 'scale(0.98)' : (isHovered ? 'scale(1.02)' : 'scale(1)'),
            opacity: isSubmitting ? 0.8 : 1
          }} 
          disabled={isSubmitting}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => { setIsHovered(false); setIsActive(false); }}
          onMouseDown={() => setIsActive(true)}
          onMouseUp={() => setIsActive(false)}
        >
          {isSubmitting ? "Збереження..." : "Зберегти результати (+50 XP) "}
        </button>

      </form>
    </div>
  );
};

const styles = {
  container: {
    padding: '40px 20px',
    maxWidth: '800px', 
    margin: '0 auto',
    fontFamily: "'Inter', 'Segoe UI', 'Nunito', sans-serif",
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  title: {
    margin: '0 0 5px 0',
    fontSize: '2rem',
    color: '#2c3e50',
    fontWeight: '700',
  },
  subtitle: {
    fontSize: '1.05rem',
    color: '#64748b',
    margin: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '25px',
  },
  card: {
    background: 'white',
    padding: '30px',
    borderRadius: '24px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
    border: '1px solid #f8fafc',
    textAlign: 'left',
  },
  questionLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#334155',
    marginBottom: '25px',
  },
  iconWrapper: {
    width: '45px',
    height: '45px',
    borderRadius: '14px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderContainer: {
    padding: '0 10px',
    position: 'relative',
  },
  slider: {
    width: '100%',
    height: '10px',
    background: '#e2e8f0',
    borderRadius: '5px',
    outline: 'none',
    cursor: 'pointer',
    marginBottom: '15px',
  },
  sliderLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '10px',
  },
  minMaxLabel: {
    fontSize: '0.85rem',
    color: '#64748b',
    fontWeight: '500',
  },
  currentVal: {
    fontSize: '1.5rem',
    fontWeight: '800',
  },
  toggleGroup: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap', 
  },
  toggleBtn: {
    flex: 1,
    minWidth: '150px',
    padding: '14px 20px',
    borderRadius: '16px',
    border: '2px solid',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    background: 'transparent',
  },
  textArea: {
    width: '100%',
    padding: '15px',
    borderRadius: '12px',
    border: '2px solid #e2e8f0',
    background: 'white',
    fontSize: '1rem',
    fontFamily: 'inherit',
    resize: 'vertical',
    outline: 'none',
    boxSizing: 'border-box',
    color: '#1e293b',
    transition: 'border-color 0.2s',
  },
  submitBtn: {
    marginTop: '15px',
    padding: '18px',
    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '15px',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
    transition: 'transform 0.1s ease',
  }
};

export default Survey;