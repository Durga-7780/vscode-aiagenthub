Python Project Builder Skill

Purpose

Build production-ready Python projects from a user requirement,
specification, or input document.

This skill is responsible for: - Understanding project requirements
before generating code. - Checking for and reading an input requirement
document when one is available. - Selecting the Python version and
compatible technology stack. - Building FastAPI applications when an
API/backend is required. - Integrating external APIs when required. -
Integrating databases through a user-selected database option. -
Generating project structure and code using the Python Code Template. -
Installing dependencies. - Compiling/checking the generated Python
source. - Running tests and performing a runtime startup check. -
Reporting build, compilation, dependency, and runtime errors clearly.

1. Input Requirement Check

Before generating the project, inspect the workspace for
requirement/specification documents.

Look for: - .md - .txt - .pdf - .docx - .doc - .json -
.yaml - .yml - .xlsx - .csv

Prioritize files whose names or content indicate requirements,
specifications, BRD, FRD, API specifications, technical specifications,
user stories, or project documentation.

If a requirement document exists

Read and analyze it before generating code.

Extract, where applicable: - Project purpose - Functional requirements -
Non-functional requirements - API requirements - Input/output formats -
Authentication/authorization - External API integrations - Database
requirements - Business rules - Validation rules - Error handling -
Logging requirements - Configuration/environment variables - Deployment
requirements - Testing requirements

Do not start implementation based only on the filename.

If multiple requirement documents exist

Identify the relevant documents and use them together when they describe
the same project.

If documents conflict, report the conflict and ask the user to clarify
when it materially affects implementation.

If no requirement document exists

Ask the user for the project requirements before creating a substantial
project.

For a small explicit request where the requirements are completely
stated in the prompt, the prompt can be treated as the requirement
source.

2. Requirement Clarification

Before implementation, identify decisions that cannot safely be
inferred.

Ask concise questions when required.

Important choices include: 1. Python version 2. Framework 3. Database 4.
Authentication 5. External API integrations 6. Package/dependency
constraints 7. Deployment target 8. Testing expectations

Do not ask questions that can be reliably answered from the requirement
document.

3. Python Version / Technology Stack

Use the requested Python version when explicitly specified.

If the requirement does not specify a version, inspect: -
pyproject.toml - requirements.txt - Pipfile - .python-version -
runtime.txt - Dockerfile - CI configuration

If no version is specified anywhere, ask the user to select a supported
Python version before generating a new project.

Example:

Select Python version:

1. Python 3.10
2. Python 3.11
3. Python 3.12
4. Python 3.13
5. Python 3.14

Do not claim a package is compatible with a Python version without
checking its declared constraints where available.

Record the selected Python version in the generated project
configuration.

4. Framework Selection

For an API/backend project, use FastAPI when the requirement calls for
FastAPI or an API service and no conflicting framework is specified.

Typical stack: - Python - FastAPI - Uvicorn - Pydantic - Pydantic
Settings - SQLAlchemy when relational persistence is needed - Alembic
for relational database migrations when appropriate

Do not add libraries that are not required.

5. Database Selection

If database integration is required but the database is not explicitly
specified, ask the user to select one.

Example:

Which database should the Python project use?

1. MySQL
2. MongoDB
3. PostgreSQL
4. SQLite
5. Other

If the requirement explicitly specifies the database, do not ask again.

Relational databases

For MySQL/PostgreSQL/SQLite: - Prefer SQLAlchemy where appropriate. -
Use Alembic for schema migrations for production relational projects. -
Keep database configuration in environment variables. - Do not hardcode
credentials. - Use connection pooling where appropriate. - Use async
database access only when it provides a clear benefit and the selected
stack supports it cleanly.

MongoDB

For MongoDB: - Use an appropriate MongoDB Python driver/ODM based on
project requirements. - Keep MongoDB URI/database configuration in
environment variables. - Do not hardcode credentials. - Define clear
document models and validation.

Other databases

If the user chooses another database: - Ask for the exact
database/driver if required. - Verify the supported Python integration
before implementation. - Do not silently substitute a different
database.

6. API Integration

When the requirement contains external API integrations, identify: -
Base URL - Endpoints - HTTP methods - Request headers - Authentication -
Request schema - Response schema - Timeout - Retry requirements - Error
handling - Rate limits - Pagination - Webhooks if applicable

Use a dedicated integration/client layer instead of scattering HTTP
calls throughout route handlers.

For asynchronous FastAPI applications, prefer an async HTTP client where
appropriate.

External API credentials must come from environment variables or secure
configuration.

Never hardcode: - API keys - access tokens - passwords - client secrets

Create .env.example with placeholder values when appropriate.

7. FastAPI Project Structure

Use a maintainable structure similar to:

project/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── api/
│   │   ├── __init__.py
│   │   └── routes/
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   └── logging.py
│   ├── models/
│   ├── schemas/
│   ├── services/
│   ├── repositories/
│   ├── integrations/
│   └── db/
├── tests/
├── .env.example
├── .gitignore
├── pyproject.toml
├── README.md
└── requirements.txt

Adapt the structure to project size. Do not create unnecessary folders
for a small project.

8. API Design

For FastAPI: - Use APIRouter. - Use Pydantic request/response
models. - Validate inputs. - Use appropriate HTTP status codes. - Keep
substantial business logic out of route functions. - Use dependency
injection for shared resources. - Add exception handling where
appropriate. - Return documented response schemas. - Avoid exposing
internal database models directly when a separate API schema is
appropriate.

9. Configuration

Use environment-based configuration.

Typical variables:

APP_NAME=
APP_ENV=
APP_HOST=
APP_PORT=

DATABASE_URL=

MONGODB_URI=
MONGODB_DATABASE=

EXTERNAL_API_BASE_URL=
EXTERNAL_API_KEY=

Only include variables actually required by the generated project.

Provide .env.example.

Never commit actual credentials.

10. Code Generation

Use the Python Code Template defined in code-template.md.

Follow the selected Python version.

Use syntax and standard-library features appropriate for that version.

Do not use syntax newer than the selected Python version.

11. Testing

Generate tests appropriate to the project: - API endpoint tests -
validation tests - service tests - integration tests where appropriate

Use isolated test configuration.

12. Compilation / Static Validation

After generating code, perform compilation/syntax validation.

For example:

python -m compileall .

The exact command must use the selected Python interpreter/environment.

Compilation success is required before declaring the build successful.

If compilation fails: 1. Read the error. 2. Identify the source file and
line. 3. Fix the generated code. 4. Run compilation again. 5. Repeat
until the project compiles or a genuine external environment problem
prevents completion.

Do not hide compilation errors.

13. Dependency Validation

After generating dependency files: - Create/use an isolated virtual
environment when appropriate. - Install required dependencies. - Detect
dependency conflicts. - Do not blindly install unrelated packages. -
Verify imports for the generated application.

If dependency installation fails, report the exact package/error and
attempt a compatible correction when possible.

14. Runtime Validation

After compilation and dependency installation, start the application
using the project's configured command.

For FastAPI, typically:

uvicorn app.main:app --host 127.0.0.1 --port 8000

Use the actual module/path from the generated project.

Verify: - The application starts. - Imports succeed. - Configuration
loads. - Routes register. - Startup hooks succeed. - Required local
services are reachable when applicable.

If the application cannot start because an external service such as a
database is unavailable, distinguish code/build failure from
environment/service unavailable.

Do not claim successful runtime validation if the application never
started.

15. API Validation

When possible, validate:

GET /health

or the project's equivalent health endpoint.

Also test representative generated endpoints.

Verify: - HTTP status - request validation - response schema - error
responses

16. Build Completion Report

After implementation, provide:

Python version:
Framework:
Database:
External APIs:
Dependencies:

Requirement document:
Found / Not found

Compilation:
PASS / FAIL

Dependency installation:
PASS / FAIL

Application startup:
PASS / FAIL

API/health check:
PASS / FAIL

Tests:
PASS / FAIL

Project location:
<path>

If something could not be validated, explicitly state why.

17. Quality Rules

Never: - Hardcode credentials. - Hardcode production URLs when
configuration is expected. - Claim compilation succeeded without running
it. - Claim the application ran without starting it. - Assume a database
when the requirement leaves it ambiguous. - Ignore an available
requirement document. - Generate code using syntax newer than the
selected Python version. - Replace user requirements with personal
assumptions.

Always prefer: - Clear project structure - Type hints - Validation -
Configuration through environment variables - Testable business logic -
Small focused modules - Reusable API clients - Explicit error handling -
Repeatable build/validation steps