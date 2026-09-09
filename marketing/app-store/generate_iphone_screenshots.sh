#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
SOURCE_DIR="$REPO_DIR/tests_ui"
OUTPUT_DIR="$SCRIPT_DIR/iphone-6.5"
WORK_DIR="$(mktemp -d)"
trap 'rm -rf "$WORK_DIR"' EXIT

mkdir -p "$OUTPUT_DIR"

make_screen() {
  local number="$1"
  local source_file="$2"
  local title="$3"
  local subtitle="$4"
  local gradient_start="$5"
  local gradient_end="$6"
  local output_name="$7"

  convert -size 1284x2778 "gradient:${gradient_start}-${gradient_end}" \
    -fill '#FFFFFF' -draw 'circle 1190,155 1190,15' \
    -fill '#FFFFFF80' -draw 'circle 80,2380 80,2200' \
    "$WORK_DIR/background.png"

  convert "$REPO_DIR/frontend/assets/images/dequad-logo-transparent.png" \
    -trim +repage -resize 118x108 "$WORK_DIR/logo.png"

  convert -size 1016x2115 xc:none \
    -fill '#071827' -draw 'roundrectangle 0,0 1015,2114 92,92' \
    "$WORK_DIR/phone.png"

  convert "$SOURCE_DIR/$source_file" -resize 936x2026! \
    \( +clone -alpha transparent -fill white \
       -draw 'roundrectangle 0,0 935,2025 58,58' \) \
    -compose DstIn -composite "$WORK_DIR/app.png"

  convert -background none -fill '#0F2942' -font Nimbus-Sans-Bold \
    -pointsize 92 -size 1140x250 -gravity northwest \
    "caption:$title" "$WORK_DIR/title.png"

  convert -background none -fill '#45627D' -font Nimbus-Sans-Regular \
    -pointsize 36 -size 1080x94 -gravity northwest \
    "caption:$subtitle" "$WORK_DIR/subtitle.png"

  convert "$WORK_DIR/background.png" \
    "$WORK_DIR/logo.png" -geometry +72+52 -composite \
    -fill '#0F2942' -font Nimbus-Sans-Bold -pointsize 31 \
    -draw "text 222,105 'DEQUAD'" \
    -fill '#45627D' -font Nimbus-Sans-Regular -pointsize 21 \
    -draw "text 222,142 'SEEN  •  HEARD  •  CONNECTED'" \
    -fill '#0F2942' -font Nimbus-Sans-Bold -pointsize 30 \
    -draw "text 1135,106 '$number'" \
    "$WORK_DIR/title.png" -geometry +72+194 -composite \
    "$WORK_DIR/subtitle.png" -geometry +76+506 -composite \
    \( "$WORK_DIR/phone.png" -background '#33506A55' -shadow 34x18+0+18 \) \
      -geometry +134+640 -composite \
    "$WORK_DIR/phone.png" -geometry +134+640 -composite \
    "$WORK_DIR/app.png" -geometry +174+680 -composite \
    -strip -colorspace sRGB -depth 8 -quality 96 "$OUTPUT_DIR/$output_name"
}

make_screen '01' 'm_connect.png' \
  $'Find friends who\nget university life' \
  'Discover verified students through shared courses and interests.' \
  '#F7FBFF' '#D9ECFF' '01-find-your-people.png'

make_screen '02' 'm_mood.png' \
  $'Track how you feel,\nday by day' \
  'Build a clearer picture of your wellbeing with quick check-ins.' \
  '#F7FFFC' '#DFF7EE' '02-track-your-mood.png'

make_screen '03' 'c_sent.png' \
  $'Chat safely with\nyour matches' \
  'Turn a new connection into a real conversation, with safety built in.' \
  '#FFF9FC' '#F9E2EF' '03-chat-safely.png'

make_screen '04' 'c_list.png' \
  $'Keep your student\ncircle close' \
  'Your matches and conversations stay together in one simple place.' \
  '#FAFBFF' '#E7E9FA' '04-your-conversations.png'

make_screen '05' 'm_after_skip.png' \
  $'Connect through what\nyou share' \
  'Learn about courses, study styles and interests before you say hello.' \
  '#FFFBF7' '#F6E8D8' '05-shared-interests.png'

identify "$OUTPUT_DIR"/*.png
