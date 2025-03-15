FROM okteto/cindy-sandbox:base

ENV PYTHONUNBUFFERED=1

# Set environment variables for Go
ENV GOLANG_VERSION 1.22.0
ENV PATH $PATH:/usr/local/go/bin

RUN apt-get update && apt-get install -y supervisor gettext-base wget curl && rm -rf /var/lib/apt/lists/*

# Download and install Go
RUN wget -q https://go.dev/dl/go${GOLANG_VERSION}.linux-amd64.tar.gz \
    && tar -C /usr/local -xzf go${GOLANG_VERSION}.linux-amd64.tar.gz \
    && rm go${GOLANG_VERSION}.linux-amd64.tar.gz

# Verify installation
RUN go version

COPY install-vscode-extensions.sh ./install-vscode-extensions.sh
RUN bash ./install-vscode-extensions.sh

RUN mkdir -p /root/.openvscode-server/data/Machine
COPY settings.json /root/.openvscode-server/data/Machine/settings.json

COPY supervisord.conf /etc/supervisor/supervisord.conf

RUN alias git="git --no-pager"

CMD ["supervisord", "-c", "/etc/supervisor/supervisord.conf"]
