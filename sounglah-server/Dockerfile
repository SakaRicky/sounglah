FROM python:3.10-slim

WORKDIR /app

COPY models /app/models
COPY . .

RUN pip install --no-cache-dir -r requirements.txt

ENV TRANSFORMERS_OFFLINE=1
ENV HF_HUB_OFFLINE=1

# Expose the port that Gunicorn will listen on
EXPOSE 8080

# Command to run your application using Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "--workers", "1", "--threads", "4", "--timeout", "120", "main:app"]