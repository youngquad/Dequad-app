#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_DIR="$SCRIPT_DIR/ipad-13"
OUTPUT_DIR="$SCRIPT_DIR/ipad-13-2048x2732"

mkdir -p "$OUTPUT_DIR"

for source_file in "$SOURCE_DIR"/*.png; do
  output_file="$OUTPUT_DIR/$(basename "$source_file")"
  convert "$source_file" -resize 2048x2732! -strip -colorspace sRGB \
    -depth 8 -alpha off -quality 96 "$output_file"
done

identify "$OUTPUT_DIR"/*.png
