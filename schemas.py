from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime

class SurveyCreate(BaseModel):
    mood: int
    energy: int
    anxiety: int
    sleep_quality: int
    productivity: int
    social_interaction: bool
    self_care: bool
    note: Optional[str] = None

class SurveyResponse(SurveyCreate):
    id: int
    user_id: int
    date: date
    class Config:
        from_attributes = True


class DiaryCreate(BaseModel):
    date: date
    text: str

class DiaryResponse(DiaryCreate):
    id: int
    user_id: int
    sentiment_score: Optional[float] = None
    emotion_label: Optional[str] = None
    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    email: str     
    password: str

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    level: int
    xp: int
    hp: int
    streak_days: int
    class Config:
        from_attributes = True


class QuestBase(BaseModel):
    quest_type: str
    title: str
    xp_reward: int
    is_completed: bool

class QuestResponse(QuestBase):
    id: int
    date: date
    class Config:
        from_attributes = True

class RewardUpdate(BaseModel):
    hp: int
    xp: int