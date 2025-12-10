from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from enum import Enum

class ExpenseCategory(str, Enum):
    FOOD = "Food"
    TRANSPORTATION = "Transportation"
    HOUSING = "Housing"
    ENTERTAINMENT = "Entertainment"
    HEALTHCARE = "Healthcare"
    EDUCATION = "Education"
    SHOPPING = "Shopping"
    UTILITIES = "Utilities"
    OTHER = "Other"

class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class ExpenseBase(BaseModel):
    amount: float
    category: ExpenseCategory
    description: Optional[str] = None

class ExpenseCreate(ExpenseBase):
    pass

class Expense(ExpenseBase):
    id: int
    user_id: int
    date: datetime
    
    class Config:
        from_attributes = True

class BudgetBase(BaseModel):
    category: ExpenseCategory
    amount: float
    month: int
    year: int

class BudgetCreate(BudgetBase):
    pass

class Budget(BudgetBase):
    id: int
    user_id: int
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class DashboardSummary(BaseModel):
    total_spent: float
    category_breakdown: dict[str, float]
    monthly_trend: list[dict]
    remaining_budget: dict[str, float]
    top_expenses: list[Expense]