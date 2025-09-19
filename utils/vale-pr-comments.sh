#!/usr/bin/env bash
# vale-pr-comments.sh
# Run Vale once over all changed .adoc/.md files under specific paths and post a single GitHub PR comment.
# Only checks for updated AsciiDoc and Markdown files under:
# - content/learn/*
# - content/patterns/*
# - content/contribute/*
# - modules/*
# Always compares HEAD~1..HEAD (last commit).
# Requires: git, jq, curl, vale. Environment: GITHUB_AUTH_TOKEN, PULL_NUMBER.

MAX_COMMENT_BYTES=65536
GITHUB_API="https://api.github.com"
REPO="validatedpatterns/docs"
PR_NUMBER="${PULL_NUMBER:-}"
BASE_SHA="HEAD~1"
HEAD_SHA="HEAD"

log() { printf '[%s] %s\n' "$(date -u +'%Y-%m-%dT%H:%M:%SZ')" "$*"; }
warn() { log "WARN: $*"; }
err() { log "ERROR: $*"; }
die() { err "$*"; exit 1; }

# Prereqs
for cmd in git jq curl vale; do
  command -v "$cmd" >/dev/null 2>&1 || die "Required command not found: $cmd"
done
[ -n "${GITHUB_AUTH_TOKEN:-}" ] || die "GITHUB_AUTH_TOKEN must be set"

log "Collecting changed files between $BASE_SHA and $HEAD_SHA..."
mapfile -t all_changed < <(git diff --name-only --diff-filter=AM "$BASE_SHA" "$HEAD_SHA" || true)

# Filter to target directories and extensions
declare -a target_files
for f in "${all_changed[@]:-}"; do
  case "$f" in
    content/learn/*|content/patterns/*|content/contribute/*|modules/*)
      case "$f" in
        *.adoc|*.md) target_files+=("$f") ;;
      esac
      ;;
  esac
done

if [ "${#target_files[@]}" -eq 0 ]; then
  log "No relevant .adoc/.md files modified in target paths. Exiting."
  exit 0
fi
log "Files to check: ${#target_files[@]}"

# Build changed lines map for filtering later
declare -A changed_lines_map
for file in "${target_files[@]}"; do
  if [ ! -f "$file" ]; then
    warn "File $file missing; skipping"
    continue
  fi
  mapfile -t raw_hunks < <(git diff -U0 "$BASE_SHA" "$HEAD_SHA" -- "$file" | awk '/^@@/ {print $0}' || true)
  if [ "${#raw_hunks[@]}" -eq 0 ]; then continue; fi
  declare -a lines_for_file=()
  for h in "${raw_hunks[@]}"; do
    plus=$(printf '%s' "$h" | sed -E 's/.*\+([0-9]+)(,([0-9]+))?.*/\1|\3/')
    start=$(printf '%s' "$plus" | cut -d'|' -f1)
    count=$(printf '%s' "$plus" | cut -d'|' -f2)
    if [ -z "$count" ] || [ "$count" = " " ]; then count=1; fi
    if ! [[ "$start" =~ ^[0-9]+$ ]] || ! [[ "$count" =~ ^[0-9]+$ ]]; then warn "Unexpected hunk header ($h) for $file"; continue; fi
    end=$((start + count - 1))
    for ln in $(seq "$start" "$end"); do lines_for_file+=("$ln"); done
  done
  if [ "${#lines_for_file[@]}" -gt 0 ]; then
    IFS=$'\n' sorted_unique=($(printf "%s\n" "${lines_for_file[@]}" | sort -n -u)); unset IFS
    changed_lines_map["$file"]="${sorted_unique[*]}"
  fi
done

if [ "${#changed_lines_map[@]}" -eq 0 ]; then
  log "No changed lines found; nothing to lint. Exiting."
  exit 0
fi

# Run Vale once for all target files
log "Running Vale for all target files..."
vale_args=()
for f in "${target_files[@]}"; do vale_args+=("$f"); done
VALE_OUT="/tmp/vale_combined_$.json"
if ! vale --output=JSON --no-exit --minAlertLevel=error "${vale_args[@]}" >"$VALE_OUT" 2>/dev/null; then
  warn "vale exited nonzero; attempting to parse output if present"
fi
if [ ! -s "$VALE_OUT" ]; then
  log "Vale produced no output; no issues found."
  rm -f "$VALE_OUT" || true
  found_any=0
else
  found_any=1
fi

TMP_ND="/tmp/vale_issues_$.ndjson"
: > "$TMP_ND"

if [ "$found_any" -eq 1 ]; then
  jq -c 'to_entries[] | .key as $file | .value[] | {file: $file, line: .Line, message: (.Message // .Match // ""), check: (.Check // ""), severity: (.Severity // ""), link: (.Link // "")}' "$VALE_OUT" >> "$TMP_ND" 2>/dev/null || true
fi

if [ ! -s "$TMP_ND" ]; then
  log "No Vale issues found in output."
  ISSUE_COUNT=0
else
  jq -s '.' "$TMP_ND" > "/tmp/vale_issues_$.json"
  changed_json='{}'
  for f in "${!changed_lines_map[@]}"; do
    IFS=' ' read -r -a arr <<< "${changed_lines_map[$f]}"
    lines_json=$(printf '%s\n' "${arr[@]}" | jq -R . | jq -s .)
    changed_json=$(jq --arg path "$f" --argjson arr "$lines_json" '. + {($path): $arr}' <<<"$changed_json")
  done
  # Filter to issues on changed lines only
  if ! jq --argjson changed "$changed_json" '
    [ .[]
      | select(type == "object")
      | select(has("line") and (.line != null) and (.line | type) == "number")
      | select(($changed[.file] // []) | index(.line | tostring) != null)
    ]' "/tmp/vale_issues_$.json" > "/tmp/vale_issues_$.filtered.json" 2>/dev/null; then
    warn "jq filtering failed; dumping offending JSON for inspection (first 200 lines):"
    head -n 200 "/tmp/vale_issues_$.json" || true
    # Fall back to no filtering to avoid hard failure
    cp "/tmp/vale_issues_$.json" "/tmp/vale_issues_$.filtered.json" || true
  fi
  mv /tmp/vale_issues_$.filtered.json /tmp/vale_issues_$.json || true
  ISSUE_COUNT=$(jq 'length' "/tmp/vale_issues_$.json" || echo 0)
fi

log "Issues on changed lines: ${ISSUE_COUNT:-0}"

build_comment() {
  local heading="$1" input="${2:-/tmp/vale_issues_$.json"}"
  {
    echo "$heading"; echo
    if [ ! -f "$input" ] || [ "$(jq 'length' "$input" 2>/dev/null || echo 0)" -eq 0 ]; then
      echo "All Vale issues in the modified lines have been resolved."
      echo; echo "<details><summary>Previous comment (kept collapsed)</summary>"; echo; echo "_Previous Vale content preserved._"; echo; echo "</details>"; echo; echo "---"; echo; echo "*This comment was automatically generated by Vale.*"; return 0
    fi
    total=$(jq 'length' "$input")
    echo "Vale found **$total** issue(s) in the modified lines of this PR."; echo
    jq -r '
      group_by(.file)
      | map(
          "#### " + (.[0].file) + "\n" +
          (map(
            "- " +
            (if has("line") and (.line!=null) then ("**Line " + (.line|tostring) + "**: ") else "" end) +
            (.message | gsub("\\n"; " ")) +
            (if (.check != "") then
              (if (.link != "") then (" [`[" + .check + "]`](" + .link + ")") else (" `[" + .check + "]`") end)
             else "" end) +
            (if (.severity != "") then (" (*" + .severity + "*)") else "" end)
          ) | join("\n"))
        )
      | join("\n\n")' "$input"
    echo; echo "---"; echo; echo "*This comment was automatically generated by Vale on the modified lines.*"
  }
}

HEADING="### 📝 Vale Linting Results"
if [ "${ISSUE_COUNT:-0}" -gt 0 ]; then
  comment_body="$(build_comment "$HEADING" "/tmp/vale_issues_$.json")"
else
  comment_body="$(build_comment "$HEADING" "/dev/null")"
fi

byte_len=$(printf '%s' "$comment_body" | wc -c)
if [ "$byte_len" -ge "$MAX_COMMENT_BYTES" ]; then
  warn "Comment size $byte_len exceeds $MAX_COMMENT_BYTES; truncating."
  prefix=$(printf '%s' "$comment_body" | head -c 3000)
  suffix=$'\n\n---\n\n[Comment truncated due to size]\n\n*Run Vale locally for full report.*'
  comment_body="${prefix}${suffix}"
  byte_len=$(printf '%s' "$comment_body" | wc -c)
  if [ "$byte_len" -ge "$MAX_COMMENT_BYTES" ]; then
    comment_body=$(printf '%s' "$comment_body" | head -c $((MAX_COMMENT_BYTES-100)) ; printf '\n\n[truncated]\n')
  fi
fi

EXISTING_COMMENT_ID=""
if [ -n "$PR_NUMBER" ] && [ -n "$REPO" ]; then
  page=1; per_page=100
  while : ; do
    resp=$(curl -sS -H "Authorization: Bearer $GITHUB_AUTH_TOKEN" -H "Accept: application/vnd.github+json" "$GITHUB_API/repos/$REPO/issues/$PR_NUMBER/comments?per_page=$per_page&page=$page")
    if [ -z "$resp" ] || [ "$resp" = "null" ]; then break; fi
    EXISTING_COMMENT_ID=$(jq -r --arg marker "### 📝 Vale Linting Results" '.[] | select(.body | contains($marker)) | .id' <<<"$resp" | head -n1 || true)
    count=$(jq 'length' <<<"$resp" || echo 0)
    if [ -n "$EXISTING_COMMENT_ID" ] || [ "$count" -lt "$per_page" ]; then break; fi
    page=$((page+1))
  done
fi

if [ -n "$PR_NUMBER" ] && [ -n "$REPO" ]; then
  if [ -n "$EXISTING_COMMENT_ID" ]; then
    log "Updating comment id=$EXISTING_COMMENT_ID"
    status=$(curl -sS -o /dev/null -w "%{http_code}" -X PATCH -H "Authorization: Bearer $GITHUB_AUTH_TOKEN" -H "Accept: application/vnd.github+json" "$GITHUB_API/repos/$REPO/issues/comments/$EXISTING_COMMENT_ID" -d "$(jq -nc --arg b "$comment_body" '{body:$b}')")
    if [ "$status" -ge 200 ] && [ "$status" -lt 300 ]; then log "Updated (HTTP $status)"; else warn "Failed to update (HTTP $status)"; fi
  else
    if [ "${ISSUE_COUNT:-0}" -gt 0 ]; then
      log "Creating new comment"
      status=$(curl -sS -o /dev/null -w "%{http_code}" -X POST -H "Authorization: Bearer $GITHUB_AUTH_TOKEN" -H "Accept: application/vnd.github+json" "$GITHUB_API/repos/$REPO/issues/$PR_NUMBER/comments" -d "$(jq -nc --arg b "$comment_body" '{body:$b}')")
      if [ "$status" -ge 200 ] && [ "$status" -lt 300 ]; then log "Created (HTTP $status)"; else warn "Failed to create (HTTP $status)"; fi
    else
      log "No issues and no existing comment — nothing to post."
    fi
  fi
else
  log "PR or repo missing; printing generated comment:"
  printf '%s\n' "$comment_body"
fi

rm -f "$VALE_OUT" "$TMP_ND" "/tmp/vale_issues_$.json" || true
log "Done."
exit 0
