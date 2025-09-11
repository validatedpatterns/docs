#!/bin/bash

# Vale Linting Script for GitHub Actions
# This script runs Vale on changed files in a PR and posts results as comments

set -e  # Exit on error for better debugging

# Function to log messages with timestamps
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Function to handle errors gracefully
handle_error() {
    local exit_code=$?
    log "ERROR: $1 (exit code: $exit_code)"
    # Don't exit - we want the workflow to always pass
    return 0
}

# Trap errors to handle them gracefully
trap 'handle_error "Script encountered an error"' ERR

log "Syncing vale rules..."
vale sync || log "WARNING: Vale sync failed, continuing with existing rules"

log "Starting Vale linting process..."

if [ -z "$GITHUB_REPOSITORY" ]; then
    log "WARNING: GITHUB_REPOSITORY not set (continuing; affects only logging)"
fi
if [ -z "$PR_NUMBER" ]; then
    log "WARNING: PR_NUMBER not set (continuing; affects only logging)"
fi

# Get PR information
BASE_SHA="$1"
HEAD_SHA="$2"

if [ -z "$BASE_SHA" ] || [ -z "$HEAD_SHA" ]; then
    log "ERROR: BASE_SHA and HEAD_SHA must be provided as arguments"
    log "Usage: $0 <base_sha> <head_sha>"
    exit 0
fi

log "Processing PR #$PR_NUMBER in $GITHUB_REPOSITORY"
log "Comparing $BASE_SHA...$HEAD_SHA"

# Step 1: Get changed files
log "Getting changed files..."
CHANGED_FILES=$(git diff --name-only --diff-filter=AM $BASE_SHA...$HEAD_SHA | grep -E '\.(adoc|md)$|^(content/learn/|content/patterns/|content/contribute/|modules/)' || true)

if [ -z "$CHANGED_FILES" ]; then
    log "No relevant files changed in this PR"
    exit 0
fi

log "Changed files:"
echo "$CHANGED_FILES"

# Convert to JSON array for easier processing
FILES_JSON=$(echo "$CHANGED_FILES" | jq -R -s -c 'split("\n") | map(select(length > 0))')
log "Files JSON: $FILES_JSON"

# Step 2: Get changed lines for each file
log "Getting changed lines for each file..."
echo '{}' > changed_lines.json

echo "$FILES_JSON" | jq -r '.[]' | while read -r file; do
    if [ -f "$file" ]; then
        log "Processing changed lines for: $file"

        # Get changed line ranges for this file (handles both single lines and ranges)
        git diff -U0 $BASE_SHA...$HEAD_SHA -- "$file" | grep '^@@' | while read -r hunk; do
            # Extract line info from hunk header like @@ -1,4 +1,6 @@
            NEW_LINES=$(echo "$hunk" | sed -n 's/.*+\([0-9]*\),*\([0-9]*\).*/\1 \2/p')
            START_LINE=$(echo "$NEW_LINES" | cut -d' ' -f1)
            LINE_COUNT=$(echo "$NEW_LINES" | cut -d' ' -f2)

            # If no line count specified, it's a single line
            if [ -z "$LINE_COUNT" ] || [ "$LINE_COUNT" = "$START_LINE" ]; then
                LINE_COUNT=1
            fi

            # Generate all line numbers in the range
            for i in $(seq $START_LINE $((START_LINE + LINE_COUNT - 1))); do
                echo "$i"
            done
        done > "lines_${file//\//_}.txt"

        # Convert line numbers to comma-separated string
        if [ -s "lines_${file//\//_}.txt" ]; then
            CHANGED_LINES=$(cat "lines_${file//\//_}.txt" | sort -n | uniq | tr '\n' ',' | sed 's/,$//')
            if [ -n "$CHANGED_LINES" ]; then
                # Update the JSON with this file's changed lines
                jq --arg file "$file" --arg lines "$CHANGED_LINES" '. + {($file): $lines}' changed_lines.json > tmp.json && mv tmp.json changed_lines.json
                log "Changed lines for $file: $CHANGED_LINES"
            fi
        fi
    else
        log "WARNING: File $file not found (may have been deleted)"
    fi
done

log "Final changed lines mapping:"
cat changed_lines.json

# Step 3: Run Vale on changed files
log "Running Vale on changed files..."

# Initialize error collection
echo "[]" > vale_errors.json
touch all_vale_errors.jsonl

# Check if Vale config exists
if [ ! -f ".vale.ini" ] && [ ! -f "_vale.ini" ] && [ ! -f "vale.ini" ]; then
    log "WARNING: No Vale configuration file found. Vale may not work properly."
fi

# Run Vale on each changed file
FILES_PROCESSED=0
echo "$FILES_JSON" | jq -r '.[]' | while read -r file; do
    if [ -f "$file" ]; then
        log "Running Vale on: $file"
        FILES_PROCESSED=$((FILES_PROCESSED + 1))

        # Create safe filename for output
        SAFE_FILENAME=$(echo "$file" | sed 's/[^a-zA-Z0-9._-]/_/g')

        # Run Vale and capture JSON output with better error handling
        if vale --output=JSON --no-exit --minAlertLevel=error "$file" > "vale_output_${SAFE_FILENAME}.json" 2>vale_stderr.log; then
            log "Vale completed successfully for $file"
        else
            log "Vale encountered issues with $file, but continuing..."
            cat vale_stderr.log || true
        fi

        # Check if Vale found any errors and the output is valid JSON
        if [ -s "vale_output_${SAFE_FILENAME}.json" ]; then
            # Validate JSON before processing
            if jq empty "vale_output_${SAFE_FILENAME}.json" 2>/dev/null; then
                # Add file path to each error and append to collection
                jq --arg filepath "$file" '
                    if type == "object" then
                        to_entries | map(.value[] | . + {"File": $filepath})
                    else
                        []
                    end
                ' "vale_output_${SAFE_FILENAME}.json" >> all_vale_errors.jsonl 2>/dev/null || true
            else
                log "WARNING: Invalid JSON output from Vale for $file"
                log "Content: $(head -n 5 "vale_output_${SAFE_FILENAME}.json")"
            fi
        else
            log "No errors found in $file"
        fi
    else
        log "WARNING: File $file not found (may have been deleted)"
    fi
done

log "Processed $FILES_PROCESSED files"

# Combine all errors into a single JSON array with error handling
if [ -s "all_vale_errors.jsonl" ]; then
    if jq -s 'add // []' all_vale_errors.jsonl > vale_errors.json 2>/dev/null; then
        log "Successfully combined Vale errors"
    else
        log "Error combining Vale errors, using empty array"
        echo "[]" > vale_errors.json
    fi
else
    log "No Vale errors found"
    echo "[]" > vale_errors.json
fi

# Filter errors to only include those on changed lines
if [ -f "changed_lines.json" ] && [ -s "vale_errors.json" ]; then
    log "Filtering errors to changed lines only..."
    if jq -s '
        .[1] as $changed_lines |
        .[0] | map(
            select(
                .File as $file |
                .Line as $line |
                ($changed_lines[$file] // "") | split(",") | map(tonumber) | any(. == $line)
            )
        )
    ' vale_errors.json changed_lines.json > filtered_vale_errors.json 2>/dev/null; then
        mv filtered_vale_errors.json vale_errors.json
        log "Successfully filtered errors"
    else
        log "Error filtering errors, keeping all errors"
    fi
fi

# Count errors safely
ERROR_COUNT=$(jq 'length // 0' vale_errors.json 2>/dev/null || echo "0")
log "Found $ERROR_COUNT Vale errors in changed lines"

# Debug: Show sample errors
if [ "$ERROR_COUNT" -gt 0 ]; then
    log "Sample errors:"
    jq -r '.[0:3] | .[] | "- Line \(.Line): \(.Message)"' vale_errors.json 2>/dev/null || true
fi

# Step 4: Prepare comment artifacts (no direct API calls here)
log "Preparing comment body files (GitHub API handled in workflow)..."

BASE_HEADING="### 📝 Vale Linting Results"
UPDATED_HEADING="### 📝 Vale Linting Results (Updated)"

if [ "$ERROR_COUNT" -gt 0 ]; then
    # New errors comment (initial)
    {
        echo "$BASE_HEADING"; echo
        echo "Vale found **$ERROR_COUNT** issue(s) in the modified content of this PR."; echo
        jq -r '
            group_by(.File) |
            map(
                "### 📄 \`" + .[0].File + "\`\n" +
                (map(
                    "- **Line " + (.Line | tostring) + "**: " + .Message +
                    (if .Check then " `[" + .Check + "]`" else "" end) +
                    (if .Severity then " (*" + .Severity + "*)" else "" end)
                ) | join("\n"))
            ) | join("\n\n")
        ' vale_errors.json 2>/dev/null || {
            echo "Error formatting Vale results. Raw errors:"
            jq -r '.[] | "- Line \(.Line): \(.Message)"' vale_errors.json 2>/dev/null || echo "Unable to format errors properly"
        }
        cat <<'EOT'

---

💡 **Tips:**
- Fix these issues to improve the documentation quality.
- Some matches may be false positives — review each suggestion before applying changes.

*This comment was automatically generated by Vale linting on the modified content.*
EOT
    } > vale_comment_errors_new.md

    # Updated errors comment (heading includes Updated)
    sed "1s|$BASE_HEADING|$UPDATED_HEADING|" vale_comment_errors_new.md > vale_comment_errors_updated.md || cp vale_comment_errors_new.md vale_comment_errors_updated.md
else
    # Clean updated comment only (created only if an existing comment is present)
    NO_ERROR_SECTION=""
    echo "$FILES_JSON" | jq -r '.[]' | while read -r changed_file; do
        [ -z "$changed_file" ] && continue
        if jq -e --arg f "$changed_file" '.[] | select(.File==$f)' vale_errors.json >/dev/null 2>&1; then
            continue
        fi
        BASENAME=$(basename "$changed_file")
        NO_ERROR_SECTION+=$'\n''📄 '$BASENAME$'\n''No issues found in the modified lines. ✅'$'\n'
    done
    {
        echo "$UPDATED_HEADING"; echo
        if [ -n "$NO_ERROR_SECTION" ]; then
            echo "All currently modified lines are clean."; echo
            echo "$NO_ERROR_SECTION" | sed '/^$/d'
        else
            echo "No issues found (no changed lines or all filtered out)."; echo
        fi
        cat <<'EOT'

---
*This comment was automatically generated by Vale linting on the modified content.*
EOT
    } > vale_comment_clean_updated.md
fi

# Summary JSON for workflow consumption
log "Writing summary JSON (vale_summary.json)"
ALL_CHANGED_FILES=$(echo "$FILES_JSON" | jq -c '.')
FILES_WITH_ERRORS_JSON=$(jq -c 'group_by(.File) | map({file: .[0].File, errors: map({line: .Line, message: .Message, check: .Check, severity: .Severity})})' vale_errors.json 2>/dev/null || echo '[]')
FILES_CLEAN_JSON=$(jq -n --argjson changed "$FILES_JSON" --argjson errs "$(jq -c 'map(.File)' vale_errors.json 2>/dev/null || echo '[]')" '
  ($changed // []) - ([$errs[]] | unique)')
cat > vale_summary.json <<SUMMARY
{
  "error_count": $ERROR_COUNT,
  "has_errors": $( [ "$ERROR_COUNT" -gt 0 ] && echo true || echo false ),
  "files_changed": $ALL_CHANGED_FILES,
  "files_with_errors": $FILES_WITH_ERRORS_JSON,
  "files_clean": $FILES_CLEAN_JSON,
  "base_heading": "$BASE_HEADING",
  "updated_heading": "$UPDATED_HEADING",
  "generated_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
SUMMARY
log "Summary JSON contents:"; cat vale_summary.json

# Step 5: Summary
log "=== SUMMARY ==="
if [ "$ERROR_COUNT" -gt 0 ]; then
    log "⚠️ Vale found $ERROR_COUNT issue(s) in the modified content"
    if [ "$SKIP_COMMENTS" = "false" ]; then
        log "A comment has been posted to the PR with details"
    fi
else
    log "✅ Vale found no issues in the modified content"
fi

log "Vale linting process completed successfully"

# Always exit successfully (commenting handled externally)
exit 0
