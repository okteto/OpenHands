#!/bin/bash

export OPENVSCODE="/openhands/.openvscode-server/bin/openvscode-server"

# # URLs of external .vsix extensions to download
# urls=(
#     "https://open-vsx.org/api/golang/Go/0.46.1/file/golang.Go-0.46.1.vsix"
# )

# # Temporary directory for downloading extensions
# tdir="/tmp/exts"
# mkdir -p "${tdir}" && cd "${tdir}"

# # Download extensions from the URLs
# wget "${urls[@]}"

# Extensions to install (from open-vsx.org and downloaded vsix)
exts=(
    "golang.Go"  # from open-vsx.org
    "/tmp/exts/cindy-vscode-extension-0.0.6.vsix"
    # "${tdir}"/*.vsix       # downloaded .vsix files
)

# Install each extension
for ext in "${exts[@]}"; do
    "${OPENVSCODE}" --install-extension "${ext}"
done

"${OPENVSCODE}" --list-extensions
