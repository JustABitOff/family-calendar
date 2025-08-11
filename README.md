# Family Calendar

A full-stack calendar application that displays events from multiple iCal feeds in a unified view.

## Features

- Display events from multiple iCal feeds in a single calendar
- Color-coded events based on calendar source
- Auto-refresh of calendar feeds every 5 minutes
- Support for recurring events
- Month, week, and day views
- Responsive design with Ant Design components

## Tech Stack

### Backend
- Python with FastAPI
- SQLAlchemy ORM
- Alembic for database migrations
- PostgreSQL database
- uv for Python package management
- Docker containerization

### Frontend
- React
- react-big-calendar for calendar display
- Ant Design component library
- Axios for API requests
- Moment.js for date handling

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js and npm (for local development)
- Python 3.11+ (for local development)

### Running with Docker

1. Clone the repository:
```bash
git clone https://github.com/yourusername/family-calendar.git
cd family-calendar
```

2. Start the application with Docker Compose:
```bash
docker-compose up
```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Local Development

#### Backend

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment and activate it:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install uv and dependencies:
```bash
# Install uv
curl -LsSf https://astral.sh/uv/install.sh | sh

# Make sure uv is in your PATH (if not already)
export PATH="$HOME/.local/bin:$PATH"

# Install dependencies
uv pip install .
```

4. Set up the database:
```bash
alembic upgrade head
```

5. Run the development server:
```bash
uvicorn app.main:app --reload
```

#### Frontend

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

## Adding iCal Feeds

You can add any valid iCal feed URL to the application. Some examples include:

- Google Calendar: In your Google Calendar, go to Settings > [Calendar Name] > Integrate calendar > Secret address in iCal format
- Apple Calendar: In Calendar app, right-click on a calendar > Share Calendar > Public Calendar > Copy the URL
- Microsoft Outlook: Settings > View all Outlook settings > Calendar > Shared calendars > Publish a calendar > Copy the ICS link

## License

This project is licensed under the MIT License - see the LICENSE file for details.
