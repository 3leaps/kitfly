# Kitfly Release Checklist

This checklist covers the full release process for kitfly, from preparation through npm publication.

## Prerequisites

- [ ] `minisign` installed (`brew install minisign`)
- [ ] `gpg` installed (`brew install gnupg`)
- [ ] Signing keys configured (see 3leaps-kitfly-cicd.sh)
- [ ] `gh` CLI authenticated with appropriate permissions
- [ ] npm OIDC trusted publishing configured (one-time setup)

## 1. Prepare Release

- [ ] All features/fixes for release are merged to main
- [ ] Update `VERSION` file to new version (e.g., `0.2.0`)
- [ ] Sync version: `make version-sync`
- [ ] Update `CHANGELOG.md` with release notes
- [ ] Run quality checks:
  ```bash
  make check-all
  ```
- [ ] Commit preparation:
  ```bash
  git add VERSION package.json CHANGELOG.md
  git commit -m "chore: prepare v0.2.0"
  ```

## 2. Tag and Push

- [ ] Push main branch:
  ```bash
  git push origin main
  ```
- [ ] Create tag:
  ```bash
  git tag -a v0.2.0 -m "v0.2.0 — description"
  ```
- [ ] Verify tag matches VERSION (pre-flight):
  ```bash
  make release-guard-tag-version
  ```
- [ ] Push tag:
  ```bash
  git push origin v0.2.0
  ```
- [ ] Wait for `release.yml` workflow to complete
- [ ] Verify draft release created on GitHub with binaries + tarball attached
- [ ] Trigger Windows ARM64 build (manual workflow):
  ```bash
  gh workflow run release-windows-arm64.yml -f tag=v0.2.0
  gh run watch    # wait for completion
  ```
  > **Note:** Bun cannot cross-compile to windows-arm64. This runs natively on
  > a Windows ARM64 runner and uploads `kitfly-windows-arm64.exe` to the draft
  > release. Must complete before `make release-download` so checksums cover
  > all binaries.

## 3. Sign Release (Local Machine)

Source environment variables:

```bash
source ~/devsecops/vars/3leaps-kitfly-cicd.sh
export KITFLY_RELEASE_TAG=v0.2.0
```

**Full workflow (recommended):**

```bash
make release-all
```

**Or step by step:**

1. **Clean previous release artifacts**

   ```bash
   make release-clean
   ```

2. **Download artifacts from draft release**

   ```bash
   make release-download
   ```

3. **Generate checksum manifests**

   ```bash
   make release-checksums
   ```

4. **Verify checksums** (before signing)

   ```bash
   make release-verify-checksums
   ```

5. **Sign checksums with minisign + GPG** (dual-format)

   ```bash
   make release-sign
   ```

   Produces: `SHA256SUMS.minisig`, `SHA256SUMS.asc`, `SHA512SUMS.minisig`, `SHA512SUMS.asc`

6. **Verify signatures**

   ```bash
   make release-verify-signatures
   ```

7. **Export public keys**

   ```bash
   make release-export-keys
   ```

   Produces: `kitfly-minisign.pub`, `kitfly-release-signing-key.asc`

8. **Verify exported keys** (safety check — public-only)

   ```bash
   make release-verify-keys
   ```

9. **Copy release notes** (requires `docs/releases/v<version>.md`)

   ```bash
   make release-notes
   ```

10. **Upload provenance** (manifests, signatures, keys, notes — not tarballs)

    ```bash
    make release-upload
    ```

    > **Note:** CI uploads tarballs. This only uploads signing provenance.
    > For manual rebuilds where you need to replace everything: `make release-upload-all`

11. **Mark release as published**
    ```bash
    make release-undraft
    ```

## 4. Publish to npm

- [ ] Go to GitHub Actions → Workflows → "Publish to npm"
- [ ] Click "Run workflow"
- [ ] Select the tag (e.g., `v0.2.0`)
- [ ] Optionally check "Dry run" first to validate
- [ ] Run workflow
- [ ] Wait for completion

## 5. Post-Release Verification

- [ ] Verify npm publication:
  ```bash
  npm view kitfly
  ```
- [ ] Test installation:
  ```bash
  bun install -g kitfly
  kitfly --version
  ```
- [ ] Verify checksum (optional):
  ```bash
  # Download from npm and verify against release checksums
  npm pack kitfly
  shasum -a 256 kitfly-0.2.0.tgz
  ```

## 6. Announce

- [ ] Update any external documentation
- [ ] Announce in relevant channels

---

## One-Time Setup: npm OIDC Trusted Publishing

1. **First publish** (must be manual with token):

   ```bash
   npm login
   npm publish --access public
   ```

2. **Configure trusted publisher** on npmjs.com:
   - Go to package settings → Publishing access → Trusted Publishers
   - Add GitHub Actions:
     - Repository: `3leaps/kitfly`
     - Workflow: `typescript-npm-publish.yml`
     - Environment: `publish-npm`

3. **Create GitHub environment**:
   - Settings → Environments → New environment: `publish-npm`
   - Add protection rules (optional): require reviewers

## Verification Commands

**Verify minisign signature:**

```bash
minisign -Vm SHA256SUMS -p kitfly-minisign.pub
```

**Verify GPG signature:**

```bash
gpg --verify SHA256SUMS.asc SHA256SUMS
```

**Verify package checksum:**

```bash
shasum -a 256 -c SHA256SUMS
```

## Troubleshooting

### Release workflow failed

- Check VERSION file matches tag (without `v` prefix)
- Check package.json version matches: `bun run version:check`
- Ensure quality gates pass in CI

### Signing failed

- Verify minisign is installed: `minisign -v`
- Verify gpg is installed: `gpg --version`
- Check key paths in cicd.sh
- Ensure you have the passphrase

### GPG key verification failed

- The verify-public-key.sh script checks for secret key material
- Never upload files containing "PRIVATE KEY"
- Re-export the public key if needed

### Publish workflow failed

- Verify release is not still draft
- Check all required assets uploaded (SHA256SUMS, signatures, public keys)
- Verify OIDC trusted publishing is configured on npm
- Check `publish-npm` environment exists

### Package not visible after publish

- npm can take a few minutes to propagate
- Try `npm view kitfly@<version>` with explicit version
