FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Layer 1 - System deps (changes never → always cached)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libavcodec-extra \
 && rm -rf /var/lib/apt/lists/*

# Layer 2 - Dependencies (only reinstalls if requirements.txt changes)
COPY requirements.txt ./
RUN pip install --no-cache-dir --upgrade pip \
 && pip install --no-cache-dir -r requirements.txt

# Layer 2.5 - Pre-download AI models
RUN python -c "from transformers import pipeline; pipeline('automatic-speech-recognition', model='openai/whisper-tiny')"

# Layer 3 - Your code (changes often → always last)
COPY . .

EXPOSE 8004
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8004"]