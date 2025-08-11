# Family Calendar Backend

This is the backend API for the Family Calendar application, built with FastAPI, SQLAlchemy, and PostgreSQL.

## Development Setup

### Prerequisites
- Python 3.11+
- PostgreSQL
- uv (Python package installer)

### Local Development

1. Create a virtual environment and activate it:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install uv and dependencies:
```bash
# Install uv
curl -LsSf https://astral.sh/uv/install.sh | sh

# Make sure uv is in your PATH (if not already)
export PATH="$HOME/.local/bin:$PATH"

# Install dependencies
uv pip install .
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Set up the database:
```bash
# Make sure PostgreSQL is running
alembic upgrade head
```

5. Run the development server:
```bash
uvicorn app.main:app --reload
```

6. Access the API at http://localhost:8000 and the API documentation at http://localhost:8000/docs

### Running Tests

```bash
uv pip install ".[dev]"  # Install dev dependencies
pytest
```

## Project Structure

- `app/`: Main application package
  - `api/`: API endpoints
  - `core/`: Core configuration
  - `models/`: SQLAlchemy models
  - `schemas/`: Pydantic schemas
  - `services/`: Business logic services
  - `main.py`: Application entry point
- `alembic/`: Database migrations
- `pyproject.toml`: Project dependencies and configuration
- `Dockerfile`: Docker configuration for production

## API Endpoints

- `GET /api/calendars`: List all calendars
- `POST /api/calendars`: Add a new calendar
- `DELETE /api/calendars/{id}`: Remove a calendar
- `POST /api/calendars/{id}/refresh`: Refresh a specific calendar
- `POST /api/calendars/refresh-all`: Refresh all calendars
- `GET /api/events`: Get events with optional filtering
- `GET /api/events/{id}`: Get a specific event
