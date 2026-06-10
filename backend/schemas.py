from pydantic import BaseModel, field_validator

class UserCreate(BaseModel):
    username: str
    password: str

    @field_validator("password")
    @classmethod
    def password_must_fit_bcrypt(cls, password):
        if len(password.encode("utf-8")) > 72:
            raise ValueError("Password must be 72 bytes or fewer")
        return password


class TaskCreate(BaseModel):
    title: str


class TaskUpdate(BaseModel):
    title: str | None = None
    completed: bool | None = None


class TaskResponse(BaseModel):
    id: int
    title: str
    completed: bool

    model_config = {"from_attributes": True}
