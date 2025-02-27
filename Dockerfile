FROM okteto/okteto:stable as okteto

FROM docker.all-hands.dev/all-hands-ai/runtime:0.25-nikolaik

RUN apt-get update && apt-get install supervisor -y

COPY --chmod=755 --from=okteto /usr/local/bin/okteto /usr/local/bin/okteto
COPY --chmod=755 --from=okteto /usr/local/bin/helm /usr/local/bin/helm
COPY --chmod=755 --from=okteto /usr/local/bin/kubectl /usr/local/bin/kubectl

COPY supervisord.conf /etc/supervisor/supervisord.conf

ENV PYTHONUNBUFFERED=1

CMD ["supervisord", "-c", "/etc/supervisor/supervisord.conf"]
