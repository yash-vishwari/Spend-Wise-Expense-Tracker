from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime, timedelta
from typing import List, Optional
import models, schemas

# User CRUD
def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, user: schemas.UserCreate):
    from auth import get_password_hash
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# Expense CRUD
def create_expense(db: Session, expense: schemas.ExpenseCreate, user_id: int):
    db_expense = models.Expense(**expense.dict(), user_id=user_id)
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense

def get_expenses(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
):
    query = db.query(models.Expense).filter(models.Expense.user_id == user_id)
    
    if category:
        query = query.filter(models.Expense.category == category)
    if start_date:
        query = query.filter(models.Expense.date >= start_date)
    if end_date:
        query = query.filter(models.Expense.date <= end_date)
    
    return query.order_by(models.Expense.date.desc()).offset(skip).limit(limit).all()

def delete_expense(db: Session, expense_id: int, user_id: int):
    expense = db.query(models.Expense).filter(
        models.Expense.id == expense_id,
        models.Expense.user_id == user_id
    ).first()
    if expense:
        db.delete(expense)
        db.commit()
        return True
    return False

# Budget CRUD
def create_budget(db: Session, budget: schemas.BudgetCreate, user_id: int):
    db_budget = models.Budget(**budget.dict(), user_id=user_id)
    db.add(db_budget)
    db.commit()
    db.refresh(db_budget)
    return db_budget

def get_budgets(db: Session, user_id: int, month: Optional[int] = None, year: Optional[int] = None):
    query = db.query(models.Budget).filter(models.Budget.user_id == user_id)
    if month:
        query = query.filter(models.Budget.month == month)
    if year:
        query = query.filter(models.Budget.year == year)
    return query.all()

# Analytics
def get_dashboard_summary(db: Session, user_id: int):
    # Current month expenses
    now = datetime.now()
    start_of_month = datetime(now.year, now.month, 1)
    
    # Total spent this month
    total_spent = db.query(func.sum(models.Expense.amount)).filter(
        models.Expense.user_id == user_id,
        models.Expense.date >= start_of_month
    ).scalar() or 0
    
    # Category breakdown
    category_breakdown = db.query(
        models.Expense.category,
        func.sum(models.Expense.amount).label('total')
    ).filter(
        models.Expense.user_id == user_id,
        models.Expense.date >= start_of_month
    ).group_by(models.Expense.category).all()
    
    # Monthly trend (last 6 months)
    monthly_trend = []
    for i in range(6, 0, -1):
        month_start = datetime(now.year, now.month - i, 1) if now.month > i else datetime(now.year - 1, 12 + now.month - i, 1)
        month_end = month_start.replace(day=28) + timedelta(days=4)
        month_end = month_end.replace(day=1) - timedelta(days=1)
        
        monthly_total = db.query(func.sum(models.Expense.amount)).filter(
            models.Expense.user_id == user_id,
            models.Expense.date >= month_start,
            models.Expense.date <= month_end
        ).scalar() or 0
        
        monthly_trend.append({
            "month": month_start.strftime("%b %Y"),
            "total": float(monthly_total)
        })
    
    # Top 5 recent expenses
    top_expenses = db.query(models.Expense).filter(
        models.Expense.user_id == user_id
    ).order_by(models.Expense.date.desc()).limit(5).all()
    
    # Calculate remaining budget
    budgets = get_budgets(db, user_id, now.month, now.year)
    remaining_budget = {}
    for budget in budgets:
        spent_in_category = db.query(func.sum(models.Expense.amount)).filter(
            models.Expense.user_id == user_id,
            models.Expense.category == budget.category,
            models.Expense.date >= start_of_month
        ).scalar() or 0
        remaining_budget[budget.category.value] = float(budget.amount - spent_in_category)
    
    return {
        "total_spent": float(total_spent),
        "category_breakdown": {c.category.value: float(c.total) for c in category_breakdown},
        "monthly_trend": monthly_trend,
        "remaining_budget": remaining_budget,
        "top_expenses": top_expenses
    }