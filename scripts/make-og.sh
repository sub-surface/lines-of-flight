#!/usr/bin/env bash
# Regenerate the OG art: og.gif (animated) + og.png (still fallback).
#   1. node renders frames → .og-frames/ and public/og-still.png
#   2. ffmpeg composites the serif title and assembles GIF + PNG
# Run from the repo root. Adjust NODE / FFMPEG paths for your machine.
set -euo pipefail

NODE="/c/Program Files/nodejs/node.exe"
FFMPEG="../ffmpeg.exe"          # Psychograph/ffmpeg.exe relative to this repo
GEO="C\:/Windows/Fonts/georgia.ttf"

"$NODE" scripts/make-og.mjs

TXT="drawtext=fontfile='$GEO':text='Lines of Flight':fontsize=64:fontcolor=0x111111:x=80:y=232,\
drawtext=fontfile='$GEO':text='A dot that stays. A line that leaves.':fontsize=26:fontcolor=0x3A3A38:x=82:y=318,\
drawtext=fontfile='$GEO':text='lines.subsurfaces.net':fontsize=20:fontcolor=0x8c8c88:x=82:y=368"

# still fallback
"$FFMPEG" -y -i public/og-still.png -vf "$TXT" -frames:v 1 public/og.png

# animated, downscaled to 600px with a per-clip palette for clean dithering
"$FFMPEG" -y -framerate 20 -i .og-frames/f%03d.png \
  -vf "$TXT,scale=600:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=64[p];[b][p]paletteuse=dither=bayer:bayer_scale=3" \
  -loop 0 public/og.gif

echo "wrote public/og.gif + public/og.png"
