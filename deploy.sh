#!/bin/bash
#
# Production deploy: git pull -> npm install -> build -> swap dist -> pm2 restart
# -> health check. Rolls back to the previous build if the health check fails.
#
# Overrides (env vars): BRANCH, APP_NAME, PORT, HEALTH_TIMEOUT, FORCE_INSTALL=true

set -euo pipefail

BRANCH="${BRANCH:-main}"
APP_NAME="${APP_NAME:-Campaign Manager}"
PORT="${PORT:-3001}"
HEALTH_TIMEOUT="${HEALTH_TIMEOUT:-30}"
HEALTH_URL="http://localhost:${PORT}/"

cd "$(dirname "$0")"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

fail() {
  log "ERROR: $*"
  exit 1
}

# ---------- Preflight ----------
log "Preflight checks"
for cmd in git node npm pm2 curl; do
  command -v "$cmd" >/dev/null 2>&1 || fail "'$cmd' is not installed or not on PATH"
done

if [[ -n "$(git status --porcelain --untracked-files=no)" ]]; then
  git status --short --untracked-files=no
  fail "Working tree has uncommitted changes. Commit, stash or discard them before deploying."
fi

# ---------- Pull ----------
OLD_COMMIT="$(git rev-parse --short HEAD)"
log "Pulling latest '$BRANCH' from origin (current: $OLD_COMMIT)"
git fetch origin
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"
NEW_COMMIT="$(git rev-parse --short HEAD)"
log "Code updated: $OLD_COMMIT -> $NEW_COMMIT"

# ---------- Install ----------
# Hash is written only after a successful install, so a failed install is retried next run.
DEPS_HASH_FILE="node_modules/.package-json.sha256"
if command -v sha256sum >/dev/null 2>&1; then
  PKG_HASH="$(sha256sum package.json | cut -d' ' -f1)"
else
  PKG_HASH="$(shasum -a 256 package.json | cut -d' ' -f1)"
fi

if [[ "${FORCE_INSTALL:-false}" == true ]] \
  || [[ ! -f "$DEPS_HASH_FILE" ]] \
  || [[ "$(cat "$DEPS_HASH_FILE")" != "$PKG_HASH" ]]; then
  log "package.json changed (or node_modules missing), installing dependencies"
  npm install
  echo "$PKG_HASH" > "$DEPS_HASH_FILE"
else
  log "package.json unchanged, skipping npm install"
fi

# ---------- Build ----------
log "Building production bundle"
rm -rf dist-temp
npm run build:prod
[[ -d dist-temp ]] || fail "Build finished but dist-temp/ was not created"

# ---------- Swap ----------
HAS_BACKUP=false
rm -rf dist-backup dist-failed
if [[ -d dist ]]; then
  mv dist dist-backup
  HAS_BACKUP=true
fi
mv dist-temp dist
log "New build moved into dist/"

# ---------- Restart / health check / rollback ----------
restart_app() {
  if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
    log "Reloading pm2 app '$APP_NAME'"
    pm2 reload "$APP_NAME" --update-env || return 1
  else
    log "pm2 app '$APP_NAME' not registered, starting it"
    pm2 start ecosystem.config.js --env prod || return 1
  fi
}

health_check() {
  local elapsed=0
  log "Health check: $HEALTH_URL (timeout ${HEALTH_TIMEOUT}s)"
  while (( elapsed < HEALTH_TIMEOUT )); do
    if curl -fsS --max-time 5 "$HEALTH_URL" 2>/dev/null | grep -q "<app-root"; then
      log "Health check passed"
      return 0
    fi
    sleep 2
    elapsed=$((elapsed + 2))
  done
  log "Health check failed after ${HEALTH_TIMEOUT}s"
  return 1
}

rollback() {
  log "Deploy of $NEW_COMMIT failed"
  pm2 logs "$APP_NAME" --lines 30 --nostream || true

  if [[ "$HAS_BACKUP" == true ]]; then
    log "Rolling back to previous build"
    mv dist dist-failed
    mv dist-backup dist
    pm2 reload "$APP_NAME" --update-env || true
    if health_check; then
      log "Rollback succeeded; previous build is live. Failed build kept in dist-failed/"
    else
      log "Rollback build is also not responding; check 'pm2 logs \"$APP_NAME\"'"
    fi
  else
    log "No previous build to roll back to (first deploy)"
  fi
  log "Code is at $NEW_COMMIT; to revert code run: git reset --hard $OLD_COMMIT"
  exit 1
}

if restart_app && health_check; then
  rm -rf dist-backup
  pm2 save
  pm2 status
  log "Deploy succeeded: $NEW_COMMIT is live on port $PORT"
else
  rollback
fi
