from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models, schemas
from database import engine, get_db
from typing import List
from datetime import datetime, date
import bcrypt
from textblob import TextBlob
from deep_translator import GoogleTranslator

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="PsychoHealth API")

def verify_password(plain_password, hashed_password):
    return bcrypt.checkpw(
        plain_password.encode('utf-8'), 
        hashed_password.encode('utf-8')
    )

def get_password_hash(password):
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def ensure_daily_quests(user_id: int, db: Session):
    today = date.today()
    user = db.query(models.User).filter(models.User.id == user_id).first()
    
    if not user:
        return

    if user.last_active_date != today:
        if user.last_active_date:
            delta = today - user.last_active_date
            if delta.days == 1:
                user.streak_days += 1 
            else:
                user.streak_days = 1   
        else:
            user.streak_days = 1      
            
        user.last_active_date = today
        db.commit()

    existing = db.query(models.QuestProgress).filter(
        models.QuestProgress.user_id == user_id, 
        models.QuestProgress.date == today
    ).first()

    if not existing:
        quests_data = [
            {"type": "login", "title": "Зайти на платформу", "xp": 10, "done": True}, 
            {"type": "survey", "title": "Пройти опитування", "xp": 50, "done": False},
            {"type": "diary", "title": "Зробити запис у щоденник", "xp": 30, "done": False},
            {"type": "water", "title": "Випити склянку води", "xp": 10, "done": False},
            {"type": "breathing", "title": "Пройти 10000 кроків", "xp": 15, "done": False},    
        ]
        
        for q in quests_data:
            db_quest = models.QuestProgress(
                user_id=user_id,
                date=today,
                quest_type=q["type"],
                title=q["title"],
                xp_reward=q["xp"],
                is_completed=q["done"]
            )
            db.add(db_quest)

            if q["done"]:
                 user.xp += q["xp"]
        
        db.commit()

def complete_quest(user_id: int, quest_type: str, db: Session):
    today = date.today()
    quest = db.query(models.QuestProgress).filter(
        models.QuestProgress.user_id == user_id,
        models.QuestProgress.date == today,
        models.QuestProgress.quest_type == quest_type,
        models.QuestProgress.is_completed == False 
    ).first()

    if quest:
        quest.is_completed = True

        user = db.query(models.User).filter(models.User.id == user_id).first()
        user.xp += quest.xp_reward

        if user.xp >= user.level * 1000:
            user.level += 1
            user.xp = user.xp - (user.level * 1000) 

        db.commit()
        return True
    return False

# --- КОРИСТУВАЧІ ---
#@app.post("/users/", response_model=schemas.UserResponse)
#def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email вже зареєстрований")
    
    new_user = models.User(
        username=user.username, 
        email=user.email, 
        hashed_password=user.password 
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@app.post("/register/", response_model=schemas.UserResponse)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pwd = get_password_hash(user.password)
    
    new_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_pwd,
        level=1, xp=0, hp=100
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    ensure_daily_quests(new_user.id, db)
    
    return new_user

@app.post("/login/")
def login_user(user_data: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == user_data.email).first()
    
    if not user:
        raise HTTPException(status_code=400, detail="Користувача з таким email не знайдено")
    
    if not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Невірний пароль")
    
    return {"status": "success", "user_id": user.id, "username": user.username}

@app.get("/users/{user_id}", response_model=schemas.UserResponse)
def read_user(user_id: int, db: Session = Depends(get_db)):

    ensure_daily_quests(user_id, db)
    
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.get("/quests/{user_id}", response_model=List[schemas.QuestResponse])
def get_daily_quests(user_id: int, db: Session = Depends(get_db)):
    ensure_daily_quests(user_id, db) 
    today = date.today()
    quests = db.query(models.QuestProgress).filter(
        models.QuestProgress.user_id == user_id,
        models.QuestProgress.date == today
    ).all()
    return quests


@app.post("/quests/{quest_id}/toggle")
def toggle_quest(quest_id: int, db: Session = Depends(get_db)):
    quest = db.query(models.QuestProgress).filter(models.QuestProgress.id == quest_id).first()
    if not quest:
        raise HTTPException(status_code=404, detail="Quest not found")
    
    if not quest.is_completed:
        quest.is_completed = True
        user = db.query(models.User).filter(models.User.id == quest.user_id).first()
        user.xp += quest.xp_reward
        if user.xp >= user.level * 1000:
            user.level += 1
            user.xp = 0
        db.commit()
    return {"status": "ok", "completed": True}



@app.post("/surveys/", response_model=schemas.SurveyResponse)
def create_survey(survey: schemas.SurveyCreate, user_id: int, db: Session = Depends(get_db)):
    db_survey = models.SurveyEntry(**survey.model_dump(), user_id=user_id)
    db.add(db_survey)

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user:
        user.xp += 50
        if user.xp >= user.level * 1000:
            user.level += 1
            user.xp = 0
        
        if survey.mood < 4:
            user.hp = max(0, user.hp - 10)
        elif survey.mood > 7:
            user.hp = min(100, user.hp + 5)

    complete_quest(user_id, "survey", db)
    db.commit()
    db.refresh(db_survey)
    return db_survey

@app.post("/diary/")
def create_diary_entry(entry: schemas.DiaryCreate, user_id: int, db: Session = Depends(get_db)):

    ensure_daily_quests(user_id, db)

    try:
        translated_text = GoogleTranslator(source='auto', target='en').translate(entry.text)
    except Exception as e:
        translated_text = entry.text

    blob = TextBlob(translated_text)
    sentiment_score = blob.sentiment.polarity

    if sentiment_score <= -0.2:
        emotion_label = "Негативний"
    elif sentiment_score >= 0.2:
        emotion_label = "Позитивний"
    else:
        emotion_label = "Нейтральний"

    is_critical_stress = False
    user = db.query(models.User).filter(models.User.id == user_id).first()
    
    if sentiment_score <= -0.4:
        user.hp = max(0, user.hp - 15)
        is_critical_stress = True

    existing_entry = db.query(models.DiaryEntry).filter(
        models.DiaryEntry.user_id == user_id,
        models.DiaryEntry.date == entry.date
    ).first()

    if existing_entry:
        existing_entry.text = entry.text  
        existing_entry.sentiment_score = sentiment_score
        existing_entry.emotion_label = emotion_label
        result_entry = existing_entry
    else:
        new_entry = models.DiaryEntry(
            **entry.model_dump(), 
            user_id=user_id,
            sentiment_score=sentiment_score,
            emotion_label=emotion_label
        )
        db.add(new_entry)
        result_entry = new_entry
    

    complete_quest(user_id, "diary", db)

    db.commit()
    db.refresh(result_entry)
    
    return {
        "id": result_entry.id,
        "user_id": result_entry.user_id,
        "date": result_entry.date,
        "text": result_entry.text,
        "sentiment_score": round(result_entry.sentiment_score, 2),
        "emotion_label": result_entry.emotion_label,
        "is_critical": is_critical_stress
    }

@app.get("/diary/{user_id}", response_model=List[schemas.DiaryResponse])
def read_diary_entries(user_id: int, db: Session = Depends(get_db)):
    try:
        entries = db.query(models.DiaryEntry).filter(models.DiaryEntry.user_id == user_id).all()
        return entries
    except Exception as e:
        print(f"Помилка завантаження щоденника: {e}")
        return []


@app.get("/surveys/{user_id}", response_model=List[schemas.SurveyResponse])
def read_surveys(user_id: int, db: Session = Depends(get_db)):
    surveys = db.query(models.SurveyEntry)\
        .filter(models.SurveyEntry.user_id == user_id)\
        .order_by(models.SurveyEntry.date.asc())\
        .all()
    return surveys

@app.post("/users/{user_id}/reward")
def give_reward(user_id: int, reward: schemas.RewardUpdate, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.hp = min(100, user.hp + reward.hp)
    user.xp += reward.xp
    xp_needed = user.level * 1000
    
    if user.xp >= xp_needed:
        user.level += 1
        user.xp = user.xp - xp_needed 
        user.hp = 100 
    
    db.commit()
    db.refresh(user)
    
    return {
        "status": "success", 
        "new_hp": user.hp, 
        "new_xp": user.xp, 
        "new_level": user.level
    }