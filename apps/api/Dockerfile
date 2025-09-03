FROM python:3.12-slim

WORKDIR /app

# Install uv and project dependencies (copy full project for editable install)
COPY . /app
RUN pip install --no-cache-dir uv && uv pip install --system .

EXPOSE 8000
CMD ["fastapi", "run", "app/main.py", "--host", "0.0.0.0", "--port", "8000"]
