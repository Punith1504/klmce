# ==========================================
# Build Stage
# ==========================================
FROM python:3.12-slim AS builder

WORKDIR /build

# Install build dependencies required for compiling certain Python packages
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc libpq-dev && \
    rm -rf /var/lib/apt/lists/*

# Copy requirements and build binary wheels
COPY requirements.txt .
RUN pip wheel --no-cache-dir --wheel-dir /build/wheels -r requirements.txt


# ==========================================
# Production Stage
# ==========================================
FROM python:3.12-slim

# Create a non-root system user for security
RUN groupadd -r appgroup && useradd -r -s /bin/false -g appgroup appuser

# Install runtime dependencies (e.g., asyncpg requires libpq5)
RUN apt-get update && \
    apt-get install -y --no-install-recommends libpq5 && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the pre-built wheels from the builder stage
COPY --from=builder /build/wheels /wheels
COPY --from=builder /build/requirements.txt .

# Install the wheels
RUN pip install --no-cache-dir /wheels/*

# Copy application source code
COPY ./app /app/app

# Set ownership to the non-root user
RUN chown -R appuser:appgroup /app

# Drop root privileges
USER appuser

# Expose standard FastAPI port
EXPOSE 8000

# Command to execute Uvicorn directly for production
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--no-proxy-headers"]
