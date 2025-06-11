#!/bin/bash
set -eu

# We need to use the http path for the git repo, so the repo path is included in the git credential helper
# and can be sent to the Okteto backend to generate the github action token for the right installation.
git config --global credential.useHttpPath true
git config --global credential.helper "!/okteto/git-credential-helper.sh"

git config --global user.name ${OKTETO_GIT_USERNAME}
git config --global user.email ${OKTETO_GIT_EMAIL}

# Check if OKTETO_GIT_REPO_URL is defined
if [[ -n "$OKTETO_GIT_REPO_URL" ]]; then
  # Check if /workspace is empty
  if [ -z "$(ls -A /workspace)" ]; then
    echo "/workspace is empty. Cloning repository..."

    git clone --depth 1 ${OKTETO_GIT_REPO_URL}  /workspace
    cd /workspace
    export NUMBER=`head /dev/urandom | tr -dc A-Za-z0-9 | head -c8`
    git checkout -b okteto/workspace-${NUMBER}
    git submodule update --init --recursive
  else
    echo "/workspace is not empty. Skipping git clone."
  fi
else
  echo "Initializing empty git repository"
  git init
fi


