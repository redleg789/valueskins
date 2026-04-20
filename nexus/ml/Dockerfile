FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy ML code
COPY ml_pipeline.py .
COPY inference.py .
COPY recommendation_engine.py .
COPY monitoring.py .
COPY api.py .

# Pre-download model
RUN python -c "from transformers import DistilBertTokenizer, DistilBertForSequenceClassification; DistilBertTokenizer.from_pretrained('distilbert-base-uncased'); DistilBertForSequenceClassification.from_pretrained('distilbert-base-uncased')"

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run API
CMD ["python", "api.py"]
