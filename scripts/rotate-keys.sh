#!/usr/bin/env bash
# Rotates Firebase service account keys and Sentry auth tokens for one or both
# environments. Updates Vercel with the new values, waits for a healthy
# deployment, then decommissions the old credentials.
#
# Usage:
#   scripts/rotate-keys.sh --env=staging
#   scripts/rotate-keys.sh --env=production
#   scripts/rotate-keys.sh                    # rotates both environments
#   scripts/rotate-keys.sh --force-single     # allow single-environment repos
#
# All rotation credentials come from local user auth — nothing stored in Vercel:
#   Firebase:  gcloud auth login
#   Sentry:    sentry-cli login  (or SENTRY_AUTH_TOKEN in shell)
#   Vercel:    pnpm exec vercel login
#
# Requires: gcloud, jq, curl
# vercel is a project devDependency — use via pnpm exec vercel
# sentry-cli is required only when SENTRY_ORG is configured in a target environment

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
DEPLOYMENT_DIR="$PROJECT_ROOT/deployment"

# ── Argument parsing ──────────────────────────────────────────────────────────

ENV_TARGET=""
FORCE_SINGLE=false

for arg in "$@"; do
  case "$arg" in
    --env=*) ENV_TARGET="${arg#--env=}" ;;
    --force-single) FORCE_SINGLE=true ;;
    *) echo "ERROR: Unknown argument: $arg"; exit 1 ;;
  esac
done

# ── Environment guard ─────────────────────────────────────────────────────────

ENVIRONMENTS_FILE="$DEPLOYMENT_DIR/environments.yml"
if [[ ! -f "$ENVIRONMENTS_FILE" ]]; then
  echo "ERROR: deployment/environments.yml not found."
  exit 1
fi

SINGLE_ENV=$(grep "^single_environment:" "$ENVIRONMENTS_FILE" | awk '{print $2}' || echo "false")
CONFIGURED_ENVS=()
while IFS= read -r line; do CONFIGURED_ENVS+=("$line"); done < <(grep "^  - " "$ENVIRONMENTS_FILE" | awk '{print $2}')

if [[ "${#CONFIGURED_ENVS[@]}" -lt 2 && "$SINGLE_ENV" != "true" && "$FORCE_SINGLE" != "true" ]]; then
  echo "ERROR: Only one environment is configured but single_environment is not true."
  echo "Set single_environment: true in deployment/environments.yml, or pass --force-single."
  exit 1
fi

if [[ -n "$ENV_TARGET" ]]; then
  ENVS_TO_ROTATE=("$ENV_TARGET")
else
  ENVS_TO_ROTATE=("${CONFIGURED_ENVS[@]}")
fi

for env in "${ENVS_TO_ROTATE[@]}"; do
  if [[ ! -f "$DEPLOYMENT_DIR/$env.yml" ]]; then
    echo "ERROR: deployment/$env.yml not found."
    exit 1
  fi
done

# ── Prerequisites ─────────────────────────────────────────────────────────────

echo "Checking prerequisites..."

VERCEL="pnpm exec vercel"

# Determine whether any target environment has Sentry configured
SENTRY_NEEDED=false
for env in "${ENVS_TO_ROTATE[@]}"; do
  sentry_org=$(grep "^  SENTRY_ORG:" "$DEPLOYMENT_DIR/$env.yml" | sed 's/.*: *//' | tr -d "\"' ")
  if [[ -n "$sentry_org" ]]; then
    SENTRY_NEEDED=true
    break
  fi
done

for tool in curl gcloud jq; do
  if ! command -v "$tool" &>/dev/null; then
    echo "ERROR: $tool not found."
    case "$tool" in
      curl)   echo "  Install: brew install curl" ;;
      gcloud) echo "  Install: https://cloud.google.com/sdk/docs/install" ;;
      jq)     echo "  Install: brew install jq" ;;
    esac
    exit 1
  fi
done

if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>/dev/null | grep -q "@"; then
  echo "ERROR: No active gcloud account. Run: gcloud auth login"
  exit 1
fi

if ! command -v pnpm &>/dev/null; then
  echo "ERROR: pnpm not found. Install it from https://pnpm.io/installation"
  exit 1
fi
if ! pnpm exec vercel --version &>/dev/null 2>&1; then
  echo "ERROR: vercel not found in node_modules. Run: pnpm install"
  exit 1
fi
if ! $VERCEL whoami &>/dev/null 2>&1; then
  echo "ERROR: Not authenticated with Vercel. Run: pnpm exec vercel login"
  exit 1
fi

# Sentry credentials — only required when SENTRY_ORG is set in a target environment
SENTRY_TOKEN=""
if [[ "$SENTRY_NEEDED" == "true" ]]; then
  if ! command -v sentry-cli &>/dev/null; then
    echo "ERROR: sentry-cli not found (required — SENTRY_ORG is configured)."
    echo "  Install: curl -sL https://sentry.io/get-cli/ | bash"
    exit 1
  fi
  SENTRY_TOKEN="${SENTRY_AUTH_TOKEN:-}"
  if [[ -z "$SENTRY_TOKEN" ]]; then
    SENTRY_TOKEN=$(grep "^token" ~/.sentryclirc 2>/dev/null | awk -F= '{print $2}' | tr -d ' ' || true)
  fi
  if [[ -z "$SENTRY_TOKEN" ]]; then
    echo "ERROR: No Sentry credentials found."
    echo "  Run: sentry-cli login"
    echo "  Or:  export SENTRY_AUTH_TOKEN=<your-personal-token>"
    exit 1
  fi
fi

echo "All prerequisites met."
echo ""

# ── Shared-project guard ─────────────────────────────────────────────────────
# If two environments share a FIREBASE_PROJECT_ID, rotating both in one run
# will delete the first environment's new key during the second rotation
# (it appears "old" relative to that run's OLD_KEY_IDS snapshot).
# Require separate --env= invocations when a project ID is shared.

declare -A SEEN_PROJECT_IDS=()
for env in "${ENVS_TO_ROTATE[@]}"; do
  config_file="$DEPLOYMENT_DIR/$env.yml"
  project_id=$(grep "^  FIREBASE_PROJECT_ID:" "$config_file" | sed 's/.*: *//' | tr -d "\"' ")
  if [[ -z "$project_id" ]]; then
    continue  # Missing project ID is caught with a clearer error inside rotate_environment()
  fi
  if [[ -n "${SEEN_PROJECT_IDS[$project_id]+x}" ]]; then
    echo "ERROR: FIREBASE_PROJECT_ID \"$project_id\" is shared between environments: ${SEEN_PROJECT_IDS[$project_id]} and $env."
    echo "Rotating both in one run would delete the first environment's new key during"
    echo "the second rotation. Rotate each environment separately instead:"
    echo "  scripts/rotate-keys.sh --env=${SEEN_PROJECT_IDS[$project_id]}"
    echo "  scripts/rotate-keys.sh --env=$env"
    exit 1
  fi
  SEEN_PROJECT_IDS[$project_id]="$env"
done

# ── Per-environment rotation ──────────────────────────────────────────────────

rotate_environment() {
  local env="$1"
  local config_file="$DEPLOYMENT_DIR/$env.yml"

  # Map env name to Vercel environment
  local vercel_env
  case "$env" in
    staging)    vercel_env="preview" ;;
    production) vercel_env="production" ;;
    *) echo "ERROR: Unknown environment: $env"; exit 1 ;;
  esac

  echo "══════════════════════════════════════════"
  echo " Rotating $env"
  echo "══════════════════════════════════════════"

  # Read project config.
  # sed handles both quoted ("value") and unquoted (value) YAML values.
  local project_id
  project_id=$(grep "^  FIREBASE_PROJECT_ID:" "$config_file" | sed 's/.*: *//' | tr -d "\"' ")
  if [[ -z "$project_id" ]]; then
    echo "ERROR: FIREBASE_PROJECT_ID is empty or not set in $config_file"
    echo "  Run: scripts/update-config.sh --env=$env --firebase-config=/path/to/config.json"
    exit 1
  fi

  local sentry_org sentry_project
  sentry_org=$(grep "^  SENTRY_ORG:" "$config_file" | sed 's/.*: *//' | tr -d "\"' ")
  sentry_project=$(grep "^  SENTRY_PROJECT:" "$config_file" | sed 's/.*: *//' | tr -d "\"' ")

  # Resolve service account email
  local sa_email
  sa_email=$(gcloud iam service-accounts list \
    --project="$project_id" \
    --filter="email:firebase-adminsdk" \
    --format="value(email)" 2>/dev/null | head -1)
  if [[ -z "$sa_email" ]]; then
    echo "ERROR: Could not resolve Firebase service account email for project $project_id"
    exit 1
  fi

  # Capture the current key IDs before creating new ones.
  # while IFS= read -r is used instead of mapfile -t for Bash 3.x compatibility (macOS default).
  echo "1. Capturing existing Firebase key IDs..."
  OLD_KEY_IDS=()
  while IFS= read -r line; do OLD_KEY_IDS+=("$line"); done < <(gcloud iam service-accounts keys list \
    --iam-account="$sa_email" \
    --project="$project_id" \
    --managed-by=user \
    --format="value(name.basename())" 2>/dev/null)

  # Create new Firebase key
  echo "2. Creating new Firebase service account key..."
  local key_file
  key_file=$(mktemp)
  trap 'rm -f "$key_file"' EXIT
  gcloud iam service-accounts keys create "$key_file" \
    --iam-account="$sa_email" \
    --project="$project_id"

  local new_client_email new_private_key
  new_client_email=$(jq -r '.client_email' "$key_file")
  # Vercel requires literal \n in the private key value
  new_private_key=$(jq -r '.private_key' "$key_file" | awk '{printf "%s\\n", $0}' | sed 's/\\n$//')

  # Create new Sentry token
  echo "3. Creating new Sentry auth token..."
  local new_sentry_token
  if [[ -n "$sentry_org" && -n "$sentry_project" ]]; then
    new_sentry_token=$(curl -sf \
      -H "Authorization: Bearer $SENTRY_TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"scopes\":[\"project:releases\",\"project:read\",\"org:read\"]}" \
      "https://sentry.io/api/0/api-tokens/" | jq -r '.token' || true)
    if [[ -z "$new_sentry_token" || "$new_sentry_token" == "null" ]]; then
      echo "WARNING: Could not create Sentry token (HTTP/network/API/parsing failure, or insufficient token scopes). Skipping Sentry rotation."
      new_sentry_token=""
    fi
  else
    echo "   (Sentry not configured for $env — skipping)"
    new_sentry_token=""
  fi

  # Update Vercel
  echo "4. Updating Vercel ($vercel_env)..."
  for key in FIREBASE_CLIENT_EMAIL FIREBASE_PRIVATE_KEY; do
    $VERCEL env rm "$key" "$vercel_env" --yes 2>/dev/null || true
  done
  printf '%s\n' "$new_client_email" | $VERCEL env add FIREBASE_CLIENT_EMAIL "$vercel_env"
  printf '%s\n' "$new_private_key"  | $VERCEL env add FIREBASE_PRIVATE_KEY "$vercel_env"

  if [[ -n "$new_sentry_token" ]]; then
    $VERCEL env rm SENTRY_AUTH_TOKEN "$vercel_env" --yes 2>/dev/null || true
    printf '%s\n' "$new_sentry_token" | $VERCEL env add SENTRY_AUTH_TOKEN "$vercel_env"
  fi

  # Trigger redeploy and wait
  echo "5. Triggering Vercel redeploy..."
  local deploy_url
  deploy_url=$($VERCEL deploy --target="$vercel_env" --yes 2>/dev/null | tail -1)
  echo "   Deployed: $deploy_url"

  echo "   Waiting for deployment to become healthy..."
  local attempts=0
  local max_attempts=30
  while [[ $attempts -lt $max_attempts ]]; do
    local state
    state=$($VERCEL inspect "$deploy_url" --json 2>/dev/null | jq -r '.readyState // "BUILDING"')
    if [[ "$state" == "READY" ]]; then
      echo "   Deployment healthy."
      break
    elif [[ "$state" == "ERROR" || "$state" == "CANCELED" ]]; then
      echo "ERROR: Deployment failed with state: $state"
      echo "Old credentials are still active. Investigate before decommissioning."
      exit 1
    fi
    attempts=$((attempts + 1))
    echo "   State: $state — waiting 10s ($attempts/$max_attempts)..."
    sleep 10
  done

  if [[ $attempts -ge $max_attempts ]]; then
    echo "ERROR: Deployment did not become healthy within $(( max_attempts * 10 ))s."
    echo "Old credentials are still active. Check Vercel dashboard before proceeding."
    exit 1
  fi

  # Decommission old credentials (only after healthy deployment confirmed)
  echo "6. Decommissioning old credentials..."
  if [[ ${#OLD_KEY_IDS[@]} -eq 0 ]]; then
    echo "   No pre-existing user-managed keys to decommission."
  else
    for old_key_id in "${OLD_KEY_IDS[@]}"; do
      gcloud iam service-accounts keys delete "$old_key_id" \
        --iam-account="$sa_email" \
        --project="$project_id" \
        --quiet 2>/dev/null && echo "   Deleted Firebase key: $old_key_id" || true
    done
  fi

  # Sentry: automatic revocation is skipped because listing all account tokens and
  # excluding the new one would delete tokens belonging to other projects on the
  # same Sentry user. Revoke the old token manually in the Sentry UI once the
  # new deployment is confirmed healthy.
  if [[ -n "$new_sentry_token" ]]; then
    echo "   Sentry token updated. Manually revoke the previous token for this"
    echo "   project/environment in the Sentry UI: https://sentry.io/settings/account/api/auth-tokens/"
  fi

  # Clean up key file
  rm -f "$key_file"
  trap - EXIT

  echo ""
  echo "$env rotation complete."
  echo ""
}

# ── Run ───────────────────────────────────────────────────────────────────────

for env in "${ENVS_TO_ROTATE[@]}"; do
  rotate_environment "$env"
done

echo "All rotations complete."
echo "Run 'pnpm env:pull' to refresh your local .env.local with the new staging credentials."
