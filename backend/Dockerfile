FROM python:3.11-slim

WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies and uv
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libpq-dev wget \
    && wget -qO- https://astral.sh/uv/install.sh | sh \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Ensure the installed binary is on the PATH
ENV PATH="/root/.local/bin:$PATH"

# Install tomli for parsing pyproject.toml
RUN pip install --no-cache-dir tomli

# Copy project files
COPY . .

# Install Python dependencies directly from pyproject.toml
RUN uv pip install --no-cache --system $(python -c "import tomli; print(' '.join(tomli.load(open('pyproject.toml', 'rb'))['project']['dependencies']))")

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
