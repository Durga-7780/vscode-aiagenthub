# Python Code Template

## Purpose

This template defines coding conventions and reusable syntax patterns
for Python project generation.

The Python Project Builder Skill must select syntax compatible with the
project's configured Python version.

Never use syntax newer than the selected Python version.

## 1. Basic Python Structure

``` python
"""Module description."""


def main() -> None:
    """Application entry point."""
    print("Application started")


if __name__ == "__main__":
    main()
```

## 2. Type Hints

Python 3.10+:

``` python
def get_user(user_id: int) -> dict[str, str]:
    ...


def find_user(user_id: int) -> dict[str, str] | None:
    ...
```

For versions before 3.10:

``` python
from typing import Dict, Optional


def find_user(user_id: int) -> Optional[Dict[str, str]]:
    ...
```

Choose syntax according to the configured Python version.

## 3. Dataclass

``` python
from dataclasses import dataclass


@dataclass
class User:
    id: int
    name: str
    email: str
```

## 4. Enum

``` python
from enum import Enum


class Status(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
```

## 5. Exception Handling

``` python
try:
    result = perform_operation()
except ValueError as exc:
    raise ValueError("Invalid input") from exc
```

Do not use broad `except Exception` unless there is a specific reason
and the exception is logged/handled appropriately.

## 6. Async/Await

``` python
async def get_data() -> dict:
    result = await fetch_data()
    return result
```

## 7. FastAPI Application

``` python
from fastapi import FastAPI

app = FastAPI(title="Python API")


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
```

## 8. FastAPI Router

``` python
from fastapi import APIRouter

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/{user_id}")
async def get_user(user_id: int) -> dict:
    return {"id": user_id}
```

Register it:

``` python
from fastapi import FastAPI

from app.api.routes.users import router as users_router

app = FastAPI()

app.include_router(users_router)
```

## 9. Pydantic Request Model

``` python
from pydantic import BaseModel


class UserCreate(BaseModel):
    name: str
    email: str
```

## 10. FastAPI Response Model

``` python
from pydantic import BaseModel


class UserResponse(BaseModel):
    id: int
    name: str
    email: str


@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: int) -> UserResponse:
    ...
```

## 11. FastAPI Dependency

``` python
from fastapi import Depends


def get_service():
    service = create_service()
    try:
        yield service
    finally:
        service.close()


@router.get("/users")
async def list_users(service=Depends(get_service)):
    return service.list_users()
```

Adapt the dependency to the actual resource lifecycle.

## 12. Environment Configuration

``` python
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Python API"
    database_url: str
    external_api_url: str | None = None
    external_api_key: str | None = None


settings = Settings()
```

Never put real passwords/API keys in source code.

## 13. MySQL / Relational Database

When MySQL is selected, use the project's chosen SQLAlchemy-compatible
driver and keep the connection URL configurable.

Example:

``` python
from sqlalchemy import String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(255), unique=True)
```

Use migrations for schema changes in production projects.

## 14. MongoDB

When MongoDB is selected, use the project's chosen MongoDB driver/ODM.

Keep:

``` text
MONGODB_URI
MONGODB_DATABASE
```

in environment configuration.

Example:

``` python
from pymongo import AsyncMongoClient

client = AsyncMongoClient(settings.mongodb_uri)
database = client[settings.mongodb_database]
users_collection = database["users"]
```

Use the appropriate driver API for the dependency/version actually
selected.

## 15. External API Client

Keep external API calls in a dedicated integration/client module.

``` python
import httpx


class ExternalApiClient:
    def __init__(self, base_url: str, api_key: str) -> None:
        self.base_url = base_url
        self.api_key = api_key

    async def get_user(self, user_id: str) -> dict:
        headers = {"Authorization": f"Bearer {self.api_key}"}

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{self.base_url}/users/{user_id}",
                headers=headers,
            )
            response.raise_for_status()
            return response.json()
```

Add retries only when the requirement calls for them and retries are
safe.

## 16. Service Layer

``` python
class UserService:
    def __init__(self, repository) -> None:
        self.repository = repository

    async def create_user(self, name: str, email: str):
        existing = await self.repository.find_by_email(email)

        if existing:
            raise ValueError("User already exists")

        return await self.repository.create(
            name=name,
            email=email,
        )
```

## 17. Repository Layer

``` python
class UserRepository:
    def __init__(self, session) -> None:
        self.session = session

    async def find_by_email(self, email: str):
        ...

    async def create(self, name: str, email: str):
        ...
```

## 18. Logging

``` python
import logging

logger = logging.getLogger(__name__)

logger.info("User created", extra={"user_id": user_id})
```

Do not log passwords, tokens, API keys, or other secrets.

## 19. Validation

``` python
from pydantic import BaseModel, Field


class ProductCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    price: float = Field(gt=0)
```

## 20. HTTP Error Handling

``` python
from fastapi import HTTPException


if user is None:
    raise HTTPException(
        status_code=404,
        detail="User not found",
    )
```

## 21. Configuration Example

`.env.example`:

``` text
APP_NAME=Python API
APP_ENV=development
APP_HOST=127.0.0.1
APP_PORT=8000

DATABASE_URL=

MONGODB_URI=
MONGODB_DATABASE=

EXTERNAL_API_BASE_URL=
EXTERNAL_API_KEY=
```

Only include settings actually used by the project.

## 22. Tests

``` python
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"
```

Add tests for generated business requirements.

## 23. Python Version Compatibility

The generator must determine the project's Python version before
selecting syntax.

### Python 3.9

Prefer:

``` python
from typing import Dict, List, Optional

items: List[str]
user: Optional[Dict[str, str]]
```

### Python 3.10

Can use:

``` python
items: list[str]
user: dict[str, str] | None
```

and:

``` python
match value:
    case "create":
        ...
    case "delete":
        ...
```

### Python 3.11

Can use features such as:

``` python
from enum import StrEnum
```

when the project benefits from them.

Do not use a newer feature merely because it is available.

### Python 3.12+

Use newer syntax only when it improves the generated code and
dependencies support the selected version.

## 24. Generated Project Validation

After generating the project, run:

``` bash
python -m compileall .
```

Then: 1. Install dependencies. 2. Run tests. 3. Start the application.
4. Validate the health endpoint. 5. Validate representative API
endpoints.

For FastAPI:

``` bash
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Do not report success until the corresponding step has actually
completed.

## 25. Build Pipeline

``` text
Requirement prompt/document
        ↓
Check input documents
        ↓
Extract requirements
        ↓
Identify missing decisions
        ↓
Ask user when necessary
        ↓
Select Python version
        ↓
Select FastAPI / framework
        ↓
Select database
        ↓
Identify API integrations
        ↓
Generate project structure
        ↓
Generate code
        ↓
Generate tests
        ↓
Generate configuration
        ↓
Install dependencies
        ↓
Compile / syntax check
        ↓
Run tests
        ↓
Start application
        ↓
Run health/API validation
        ↓
Report result
```

## 26. Code Quality Rules

Generated code should: - Use clear names. - Use type hints. - Keep
functions focused. - Avoid unnecessary global state. - Avoid duplicated
business logic. - Separate routes, services, repositories, and
integrations when project size justifies it. - Use configuration instead
of hardcoded environment-specific values. - Handle errors explicitly. -
Include tests for important requirements. - Follow the selected Python
version. - Keep dependencies minimal.

The generated project should be executable, testable, and maintainable
rather than being only a code sample.
