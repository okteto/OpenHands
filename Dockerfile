FROM docker.all-hands.dev/all-hands-ai/runtime:0.25-nikolaik

ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install supervisor gettext-base -y

COPY supervisord.conf /etc/supervisor/supervisord.conf

CMD ["supervisord", "-c", "/etc/supervisor/supervisord.conf"]
