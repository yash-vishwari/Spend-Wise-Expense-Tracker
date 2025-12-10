from fastapi import FastAPI, HTTPException, Depends, Request

from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid

app = FastAPI(
    title="Spend Wise API",
    description="Smart Personal Finance Tracker",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data models
class ExpenseCreate(BaseModel):
    description: str
    category: str
    amount: float
    date: str = datetime.now().strftime("%Y-%m-%d")

class Expense(ExpenseCreate):
    id: str
    created_at: str

class UserLogin(BaseModel):
    username: str
    password: str

class DashboardSummary(BaseModel):
    total_spent: float
    category_breakdown: dict
    monthly_trend: list
    recent_expenses: list

# In-memory database (for demo)
expenses_db = []
users_db = {"demo": {"username": "demo", "password": "demo123", "email": "demo@spendwise.com"}}

# Authentication
@app.post("/api/login")
async def login(request: Request):
    form_data = await request.form()
    username = form_data.get("username")
    password = form_data.get("password")
    
    if username in users_db and users_db[username]["password"] == password:
        return {
            "access_token": f"token-{uuid.uuid4()}",
            "token_type": "bearer",
            "user": {
                "username": username,
                "email": users_db[username]["email"]
            }
        }
    raise HTTPException(status_code=401, detail="Invalid credentials")

# Expenses API
@app.get("/api/expenses", response_model=List[Expense])
def get_expenses(category: Optional[str] = None):
    if category:
        return [exp for exp in expenses_db if exp["category"].lower() == category.lower()]
    return expenses_db

@app.post("/api/expenses", response_model=Expense)
def create_expense(expense: ExpenseCreate):
    new_expense = expense.dict()
    new_expense["id"] = str(uuid.uuid4())
    new_expense["created_at"] = datetime.now().isoformat()
    expenses_db.append(new_expense)
    return new_expense

@app.delete("/api/expenses/{expense_id}")
def delete_expense(expense_id: str):
    global expenses_db
    expenses_db = [exp for exp in expenses_db if exp["id"] != expense_id]
    return {"message": "Expense deleted successfully"}

# Dashboard API
@app.get("/api/dashboard", response_model=DashboardSummary)
def get_dashboard():
    # Calculate total spent
    total_spent = sum(exp["amount"] for exp in expenses_db)
    
    # Category breakdown
    category_breakdown = {}
    for exp in expenses_db:
        category = exp["category"]
        category_breakdown[category] = category_breakdown.get(category, 0) + exp["amount"]
    
    # Monthly trend (dummy data for now)
    monthly_trend = [
        {"month": "Oct", "total": 12000},
        {"month": "Nov", "total": 15000},
        {"month": "Dec", "total": total_spent}
    ]
    
    # Recent expenses (last 5)
    recent_expenses = expenses_db[-5:] if len(expenses_db) > 5 else expenses_db
    
    return {
        "total_spent": total_spent,
        "category_breakdown": category_breakdown,
        "monthly_trend": monthly_trend,
        "recent_expenses": recent_expenses
    }

# Seed some sample data
@app.on_event("startup")
def seed_sample_data():
    if not expenses_db:
        sample_expenses = [
            ExpenseCreate(
                description="Groceries",
                category="Food",
                amount=850
            ),
            ExpenseCreate(
                description="Petrol",
                category="Transport",
                amount=2000
            ),
            ExpenseCreate(
                description="Movie Tickets",
                category="Entertainment",
                amount=500
            ),
            ExpenseCreate(
                description="Internet Bill",
                category="Utilities",
                amount=1200
            ),
            ExpenseCreate(
                description="Medicine",
                category="Healthcare",
                amount=750
            )
        ]
        for exp in sample_expenses:
            create_expense(exp)

# Root endpoint
@app.get("/")
def read_root():
    return {
        "message": "Spend Wise API",
        "version": "1.0.0",
        "endpoints": {
            "docs": "/docs",
            "health": "/health",
            "login": "/api/login",
            "expenses": "/api/expenses",
            "dashboard": "/api/dashboard"
        }
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)