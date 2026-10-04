#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../public/brand"
# ImageMagick is an asset-generation tool only; no runtime dependency.
for character in neo vex raze miko; do
  source="${character}-tee-transparent.png"
  for width in 160 240 480 768 1145; do
    magick "$source" -resize "${width}x" -define webp:lossless=true \
      -define webp:method=6 "${source%.png}-${width}.webp"
  done
  # Reject full-resolution derivatives unless visible RGBA pixels match.
  magick compare -metric AE "$source" "${source%.png}-1145.webp" null: 2>&1
done