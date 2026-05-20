from sqlalchemy import Column, Integer, String, Boolean, Float, ForeignKey, Text, Date, DateTime
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    
    level = Column(Integer, default=1)
    xp = Column(Integer, default=0)
    hp = Column(Integer, default=100)
    streak_days = Column(Integer, default=0)
    last_active_date = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    surveys = relationship("SurveyEntry", back_populates="owner")
    diary_entries = relationship("DiaryEntry", back_populates="owner")
    achievements = relationship("Achievement", back_populates="owner")

class SurveyEntry(Base):
    __tablename__ = "survey_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(Date, default=datetime.utcnow)

    mood = Column(Integer)
    energy = Column(Integer)
    anxiety = Column(Integer)
    sleep_quality = Column(Integer)
    productivity = Column(Integer)

    social_interaction = Column(Boolean, default=False)
    self_care = Column(Boolean, default=False)
    
    note = Column(Text, nullable=True)

    owner = relationship("User", back_populates="surveys")

class DiaryEntry(Base):
    __tablename__ = "diary_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(Date)
    text = Column(Text)
    
    sentiment_score = Column(Float, nullable=True)
    emotion_label = Column(String, nullable=True)

    owner = relationship("User", back_populates="diary_entries")

class Achievement(Base):

    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    achievement_type = Column(String)
    unlocked_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="achievements")


class QuestProgress(Base):
    __tablename__ = "quest_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(Date, default=datetime.utcnow)
    
    quest_type = Column(String) 
    title = Column(String)       
    xp_reward = Column(Integer)  
    is_completed = Column(Boolean, default=False)

    owner = relationship("User")