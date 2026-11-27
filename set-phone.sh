#!/usr/bin/env bash
# Usage: ./set-phone.sh 2348012345678
# Replaces the placeholder CBS phone / WhatsApp number everywhere on the site.
# Give the number in international format with no + or spaces, e.g. 2348012345678.
set -e
NEW="$1"
[ -z "$NEW" ] && { echo "Usage: ./set-phone.sh 2348012345678"; exit 1; }
case "$NEW" in 234[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]) ;; *) echo "Number must look like 2348012345678 (234 + 10 digits)"; exit 1;; esac
SP="+${NEW:0:3} ${NEW:3:3} ${NEW:6:3} ${NEW:9:4}"
DASH="+${NEW:0:3}-${NEW:3:3}-${NEW:6:3}-${NEW:9:4}"
FILES=$(grep -rl "2348060001122\|+234 806 000 1122\|+234-806-000-1122" --include=*.html --include=*.js --include=*.txt . || true)
for f in $FILES; do
  sed -i "s/2348060001122/$NEW/g; s/+234 806 000 1122/$SP/g; s/+234-806-000-1122/$DASH/g" "$f"
done
echo "Updated: $FILES"
