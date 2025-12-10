@echo off
echo Setting up Spend Wise Backend...
echo.

echo Step 1: Creating virtual environment...
python -m venv venv

echo Step 2: Activating virtual environment...
call venv\Scripts\activate

echo Step 3: Installing dependencies...
pip install fastapi uvicorn sqlalchemy pydantic python-dotenv

echo Step 4: Creating directory structure...
mkdir app 2>nul

echo Step 5: Creating Python files...
echo. > app\__init__.py

echo from fastapi import FastAPI > app\main.py
echo from fastapi.middleware.cors import CORSMiddleware >> app\main.py
echo. >> app\main.py
echo app = FastAPI(title="Spend Wise API") >> app\main.py
echo. >> app\main.py
echo # Allow frontend to connect >> app\main.py
echo app.add_middleware( >> app\main.py
echo     CORSMiddleware, >> app\main.py
echo     allow_origins=["http://localhost:3000"], >> app\main.py
echo     allow_credentials=True, >> app\main.py
echo     allow_methods=["*"], >> app\main.py
echo     allow_headers=["*"], >> app\main.py
echo ) >> app\main.py
echo. >> app\main.py
echo @app.get("/") >> app\main.py
echo def read_root(): >> app\main.py
echo     return {"message": "Spend Wise API is running!", "status": "active"} >> app\main.py
echo. >> app\main.py
echo @app.get("/health") >> app\main.py
echo def health_check(): >> app\main.py
echo     return {"status": "healthy"} >> app\main.py
echo. >> app\main.py
echo # Sample expenses data >> app\main.py
echo sample_expenses = [ >> app\main.py
echo     {"id": 1, "description": "Groceries", "category": "Food", "amount": 850, "date": "2023-12-10"}, >> app\main.py
echo     {"id": 2, "description": "Petrol", "category": "Transport", "amount": 2000, "date": "2023-12-09"}, >> app\main.py
echo     {"id": 3, "description": "Movie", "category": "Entertainment", "amount": 500, "date": "2023-12-08"}, >> app\main.py
echo ] >> app\main.py
echo. >> app\main.py
echo @app.get("/api/expenses") >> app\main.py
echo def get_expenses(): >> app\main.py
echo     return {"expenses": sample_expenses} >> app\main.py
echo. >> app\main.py
echo @app.get("/api/dashboard") >> app\main.py
echo def get_dashboard(): >> app\main.py
echo     total = sum(expense["amount"] for expense in sample_expenses) >> app\main.py
echo     return { >> app\main.py
echo         "total_spent": total, >> app\main.py
echo         "category_breakdown": { >> app\main.py
echo             "Food": 850, >> app\main.py
echo             "Transport": 2000, >> app\main.py
echo             "Entertainment": 500 >> app\main.py
echo         }, >> app\main.py
echo         "monthly_trend": [ >> app\main.py
echo             {"month": "Nov", "total": 12000}, >> app\main.py
echo             {"month": "Dec", "total": 3350} >> app\main.py
echo         ] >> app\main.py
echo     } >> app\main.py
echo. >> app\main.py
echo # Auth endpoints (demo) >> app\main.py
echo users_db = { >> app\main.py
echo     "demo": {"username": "demo", "password": "demo123", "email": "demo@example.com"} >> app\main.py
echo } >> app\main.py
echo. >> app\main.py
echo @app.post("/api/login") >> app\main.py
echo def login(username: str, password: str): >> app\main.py
echo     if username in users_db and users_db[username]["password"] == password: >> app\main.py
echo         return { >> app\main.py
echo             "access_token": "demo-token-123", >> app\main.py
echo             "token_type": "bearer", >> app\main.py
echo             "user": users_db[username] >> app\main.py
echo         } >> app\main.py
echo     return {"error": "Invalid credentials"} >> app\main.py

echo Step 6: Creating .env file...
echo SECRET_KEY=your-secret-key-change-in-production > .env
echo DATABASE_URL=sqlite:///./spendwise.db >> .env

echo.
echo.
echo To start backend:
echo   venv\Scripts\activate
echo   python -m uvicorn app.main:app --reload
echo.
echo API will run at: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo.
pause
