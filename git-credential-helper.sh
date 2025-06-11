#!/bin/bash
set -eu

# Only handle the 'get' operation. The rest of operations are not implemented.
if [ "$1" != "get" ]; then
    exit 0
fi

# Initialize variables with default values
protocol=""
host=""
path=""

# Read the input from stdin
while IFS= read -r line; do
    if [ -z "$line" ]; then
        break
    fi
    # Store the input in variables
    case "$line" in
        protocol=*) protocol="${line#*=}" ;;
        host=*) host="${line#*=}" ;;
        path=*) path="${line#*=}" ;;
    esac
done

# Make the curl request to get the token. We need to pass the repo path (owner/repo) to the endpoint,
# so we can generate the github action token for the right installation.
password=$(curl -s -H "Authorization: Bearer ${OKTETO_TOKEN}" "${OKTETO_GIT_AUTH_ENDPOINT}?repo=${path}")
# Set username based on host
if [ "$host" = "gitlab.com" ]; then
    username="oauth2"
else
    username="x-access-token"
fi

# Output the credentials in git credential format
echo "protocol=${protocol}"
echo "host=${host}"
echo "path=${path}"
echo "username=${username}"
echo "password=${password}" 