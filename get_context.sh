#!/usr/bin/env bash

# Description:
#   Recursively scans the current directory for .ts, .tsx, .js, and .json files,
#   skipping any directories you list on the command line,
#   and writes each file’s relative path and contents into context.txt.
#   Existing context.txt (if any) will be overwritten.

set -euo pipefail

OUTPUT_FILE="context.txt"
IGNORE_DIRS=("$@")

# Truncate or create the output file
: > "${OUTPUT_FILE}"

# Build the find expression for ignored dirs
# e.g. -path "./dir1" -prune -o -path "./dir2" -prune -o
PRUNE_EXPR=()
for dir in "${IGNORE_DIRS[@]}"; do
  PRUNE_EXPR+=( -path "./${dir}" -prune -o )
done

# Now find all matching files, skipping pruned dirs
# Order of args: . [prune expressions] -type f \( ... \) -print
find . \
  "${PRUNE_EXPR[@]}" \
  -type f \( -iname "*.ts" -o -iname "*.tsx" -o -iname "*.js" -o -iname "*.json" \) \
  -print | sort | while IFS= read -r file; do

  # Strip leading "./" and write header
  relpath="${file#./}"
  echo "===== ${relpath} =====" >> "${OUTPUT_FILE}"

  # Append file contents
  cat "${file}" >> "${OUTPUT_FILE}"

  # Blank line for readability
  echo >> "${OUTPUT_FILE}"
done

echo "✅ All files have been concatenated into ${OUTPUT_FILE}"

