from pydantic import BaseModel


class UserIn(BaseModel):
    username: str
    password: str
    admin: bool
    coordinator: bool


class UserLogin(BaseModel):
    username: str
    password: str


class UserOut(BaseModel):
    username: str


class NewDescription(BaseModel):
    text: str
