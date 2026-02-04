#!/usr/bin/env bash
set -euo pipefail

# Dual-format release signing: minisign (.minisig) + PGP (.asc)
#
# Usage: sign-release-assets.sh <tag> [dir]
#
# Environment variables:
#   KITFLY_MINISIGN_KEY - Path to minisign secret key file. Primary format.
#   KITFLY_PGP_KEY_ID   - GPG key ID for PGP signing. Optional secondary format.
#   KITFLY_GPG_HOMEDIR  - Custom GPG homedir (optional, defaults to ~/.gnupg)
#
# Minisign was chosen over raw ed25519 because:
# - Created by Frank Denis (libsodium author), well-audited
# - Trusted comments provide signed metadata (version, timestamp)
# - Password-protected keys by default
# - Compatible with OpenBSD signify
#
# Only SHA256SUMS is signed (not individual files). This is the standard pattern:
# verify signature on checksum file, then verify file checksums against that.
# This means one password prompt instead of N.

TAG=${1:?"usage: sign-release-assets.sh <tag> [dir]"}
DIR=${2:-dist/release}

KITFLY_MINISIGN_KEY=${KITFLY_MINISIGN_KEY:-}
KITFLY_PGP_KEY_ID=${KITFLY_PGP_KEY_ID:-}
KITFLY_GPG_HOMEDIR=${KITFLY_GPG_HOMEDIR:-}

# Validation
if [ ! -d "$DIR" ]; then
    echo "error: directory $DIR not found" >&2
    exit 1
fi

checksum_files=()
for file in SHA256SUMS SHA512SUMS; do
    if [ -f "$DIR/$file" ]; then
        checksum_files+=("$file")
    fi
done

if [ ${#checksum_files[@]} -eq 0 ]; then
    echo "error: no checksum files found (run make release-checksums first)" >&2
    exit 1
fi

has_minisign=false
has_pgp=false

if [ -n "$KITFLY_MINISIGN_KEY" ]; then
    if [ ! -f "$KITFLY_MINISIGN_KEY" ]; then
        echo "error: KITFLY_MINISIGN_KEY=$KITFLY_MINISIGN_KEY not found" >&2
        exit 1
    fi
    if ! command -v minisign >/dev/null 2>&1; then
        echo "error: minisign not found in PATH" >&2
        echo "  Install: brew install minisign (macOS) or see https://jedisct1.github.io/minisign/" >&2
        exit 1
    fi
    has_minisign=true
    echo "minisign signing enabled (key: $KITFLY_MINISIGN_KEY)"
fi

# Only enable PGP if explicitly requested via KITFLY_PGP_KEY_ID
if [ -n "$KITFLY_PGP_KEY_ID" ]; then
    if ! command -v gpg >/dev/null 2>&1; then
        echo "error: KITFLY_PGP_KEY_ID set but gpg not found in PATH" >&2
        exit 1
    fi
    has_pgp=true
    echo "PGP signing enabled (key: $KITFLY_PGP_KEY_ID)"
    if [ -n "$KITFLY_GPG_HOMEDIR" ]; then
        echo "GPG homedir: $KITFLY_GPG_HOMEDIR"
    fi
fi

if [ "$has_minisign" = false ] && [ "$has_pgp" = false ]; then
    echo "error: no signing method available" >&2
    echo "  Set KITFLY_MINISIGN_KEY for minisign signing" >&2
    echo "  Set KITFLY_PGP_KEY_ID for PGP signing" >&2
    exit 1
fi

# Sign checksum manifests (preferred workflow)
# Users verify: 1) signature on checksum file, 2) file checksums against it
#
# Signing is grouped by tool (all minisign first, then all PGP) to minimize
# password prompt switching during manual signing workflows.

if [ "$has_minisign" = true ]; then
    echo ""
    echo "=== Minisign signatures ==="
    for file in "${checksum_files[@]}"; do
        echo "[minisign] Signing $file"
        rm -f "$DIR/$file.minisig"
        minisign -S -s "$KITFLY_MINISIGN_KEY" -t "kitfly $TAG $(date -u +%Y-%m-%dT%H:%M:%SZ)" -m "$DIR/$file"
    done
fi

if [ "$has_pgp" = true ]; then
    echo ""
    echo "=== PGP signatures ==="
    for file in "${checksum_files[@]}"; do
        echo "[PGP] Signing $file"
        if [ -n "$KITFLY_GPG_HOMEDIR" ]; then
            env GNUPGHOME="$KITFLY_GPG_HOMEDIR" gpg --batch --yes --armor --local-user "$KITFLY_PGP_KEY_ID" --detach-sign -o "$DIR/$file.asc" "$DIR/$file"
        else
            gpg --batch --yes --armor --local-user "$KITFLY_PGP_KEY_ID" --detach-sign -o "$DIR/$file.asc" "$DIR/$file"
        fi
    done
fi

echo ""
echo "[ok] Signing complete for $TAG"
for file in "${checksum_files[@]}"; do
    if [ "$has_minisign" = true ]; then
        echo "   $file.minisig"
    fi
    if [ "$has_pgp" = true ]; then
        echo "   $file.asc"
    fi
done
