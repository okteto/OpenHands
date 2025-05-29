#!/bin/bash
set -eu

# Check if /workspace is empty
if [ -z "$(ls -A /workspace)" ]; then
  echo "/workspace is empty. Cloning repository..."

  git clone --depth 1 ${OKTETO_GIT_REPO_URL}  /workspace
  cd /workspace
  export NUMBER=`head /dev/urandom | tr -dc A-Za-z0-9 | head -c8`
  git checkout -b okteto/workspace-${NUMBER}
  git submodule update --init --recursive
else
  echo "/workspace is not empty. Skipping git cloone."
fi

git config user.name ${OKTETO_GIT_USER_NAME}
git config user.email ${OKTETO_GIT_USER_EMAIL}
