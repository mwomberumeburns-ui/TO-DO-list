from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy.exc import OperationalError
from database import SessionLocal, engine, Base
import models
from schemas import TaskCreate, TaskResponse, TaskUpdate, UserCreate
import logging
import bcrypt

# Create tables
try:
    Base.metadata.create_all(bind=engine)
except OperationalError as exc:
    raise RuntimeError(
        "Could not connect to MySQL. Check DB_USER, DB_PASSWORD, DB_HOST, "
        "DB_PORT, DB_NAME, or DATABASE_URL before starting the API."
    ) from exc

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging
logging.basicConfig(
    filename="app.log",
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

# ---------------------------
# PASSWORD SECURITY
# ---------------------------
def hash_password(password: str):
    return bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str):
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8")
        )
    except ValueError:
        return False

# ---------------------------
# DATABASE DEPENDENCY
# ---------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_username(Authorization: str = Header(None)):
    if Authorization is None:
        raise HTTPException(status_code=401, detail="Missing token")

    if not Authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid token format")

    token = Authorization.removeprefix("Bearer ").strip()

    if not token.startswith("token-"):
        raise HTTPException(status_code=401, detail="Invalid token")

    username = token.removeprefix("token-")

    if not username:
        raise HTTPException(status_code=401, detail="Invalid token")

    return username

# ---------------------------
# REGISTER
# ---------------------------
@app.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(
        models.User.username == user.username
    ).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    new_user = models.User(
        username=user.username,
        password=hash_password(user.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    logging.info(f"User registered: {user.username}")

    return {
        "message": "User created successfully",
        "user_id": new_user.id
    }

# ---------------------------
# LOGIN
# ---------------------------
@app.post("/login")
def login(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(
        models.User.username == user.username
    ).first()

    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = f"token-{db_user.username}"

    logging.info(f"User logged in: {user.username}")

    return {"access_token": token, "token_type": "bearer"}

# ---------------------------
# PROTECTED ROUTE
# ---------------------------
@app.get("/protected")
def protected(username: str = Depends(get_current_username)):
    return {"message": f"Hello {username}, you are authenticated!"}


# ---------------------------
# TASKS
# ---------------------------
@app.get("/tasks", response_model=list[TaskResponse])
def get_tasks(
    db: Session = Depends(get_db),
    username: str = Depends(get_current_username),
):
    tasks = db.query(models.Task).filter(
        models.Task.owner_username == username
    ).order_by(models.Task.id.desc()).all()

    return [
        TaskResponse(id=task.id, title=task.title, completed=bool(task.completed))
        for task in tasks
    ]


@app.post("/tasks", response_model=TaskResponse)
def create_task(
    task: TaskCreate,
    db: Session = Depends(get_db),
    username: str = Depends(get_current_username),
):
    title = task.title.strip()

    if not title:
        raise HTTPException(status_code=400, detail="Task title is required")

    new_task = models.Task(
        title=title,
        completed=0,
        owner_username=username,
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return TaskResponse(
        id=new_task.id,
        title=new_task.title,
        completed=bool(new_task.completed),
    )


@app.put("/tasks/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_update: TaskUpdate,
    db: Session = Depends(get_db),
    username: str = Depends(get_current_username),
):
    task = db.query(models.Task).filter(
        models.Task.id == task_id,
        models.Task.owner_username == username,
    ).first()

    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    if task_update.title is not None:
        title = task_update.title.strip()

        if not title:
            raise HTTPException(status_code=400, detail="Task title is required")

        task.title = title

    if task_update.completed is not None:
        task.completed = 1 if task_update.completed else 0

    db.commit()
    db.refresh(task)

    return TaskResponse(id=task.id, title=task.title, completed=bool(task.completed))


@app.delete("/tasks/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    username: str = Depends(get_current_username),
):
    task = db.query(models.Task).filter(
        models.Task.id == task_id,
        models.Task.owner_username == username,
    ).first()

    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()

    return {"message": "Task deleted"}
