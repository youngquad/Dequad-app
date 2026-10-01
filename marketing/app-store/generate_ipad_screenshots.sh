#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
SOURCE_DIR="$REPO_DIR/tests_ui"
OUTPUT_DIR="$SCRIPT_DIR/ipad-13"
WORK_DIR="$(mktemp -d)"
trap 'rm -rf "$WORK_DIR"' EXIT

mkdir -p "$OUTPUT_DIR"

make_screen() {
  local number="$1"
  local source_file="$2"
  local title="$3"
  local subtitle="$4"
  local feature="$5"
  local gradient_start="$6"
  local gradient_end="$7"
  local output_name="$8"

  convert -size 2064x2752 "gradient:${gradient_start}-${gradient_end}" \
    -fill '#FFFFFF' -draw 'circle 1890,180 1890,-40' \
    -fill '#FFFFFF66' -draw 'circle 170,2520 170,2260' \
    "$WORK_DIR/background.png"

  convert "$REPO_DIR/frontend/assets/images/dequad-logo-transparent.png" \
    -trim +repage -resize 150x136 "$WORK_DIR/logo.png"

  convert -size 942x2028 xc:none \
    -fill '#071827' -draw 'roundrectangle 0,0 941,2027 88,88' \
    "$WORK_DIR/device.png"

  convert "$SOURCE_DIR/$source_file" -resize 866x1875! \
    \( +clone -alpha transparent -fill white \
       -draw 'roundrectangle 0,0 865,1874 54,54' \) \
    -compose DstIn -composite "$WORK_DIR/app.png"

  convert -background none -fill '#0F2942' -font Nimbus-Sans-Bold \
    -pointsize 116 -size 850x520 -gravity northwest \
    "caption:$title" "$WORK_DIR/title.png"

  convert -background none -fill '#45627D' -font Nimbus-Sans-Regular \
    -pointsize 44 -size 790x300 -gravity northwest \
    "caption:$subtitle" "$WORK_DIR/subtitle.png"

  convert -background none -fill '#0F2942' -font Nimbus-Sans-Bold \
    -pointsize 30 -size 690x70 -gravity center \
    "caption:$feature" "$WORK_DIR/feature.png"

  convert "$WORK_DIR/background.png" \
    "$WORK_DIR/logo.png" -geometry +120+92 -composite \
    -fill '#0F2942' -font Nimbus-Sans-Bold -pointsize 40 \
    -draw "text 330,162 'DEQUAD'" \
    -fill '#45627D' -font Nimbus-Sans-Regular -pointsize 25 \
    -draw "text 330,207 'SEEN  •  HEARD  •  CONNECTED'" \
    -fill '#0F2942' -font Nimbus-Sans-Bold -pointsize 34 \
    -draw "text 1840,145 '$number'" \
    "$WORK_DIR/title.png" -geometry +120+420 -composite \
    "$WORK_DIR/subtitle.png" -geometry +126+1010 -composite \
    -fill '#FFFFFFCC' -stroke '#C7DDEF' -strokewidth 2 \
    -draw 'roundrectangle 120,1430 850,1530 50,50' \
    "$WORK_DIR/feature.png" -geometry +140+1444 -composite \
    \( "$WORK_DIR/device.png" -background '#33506A55' -shadow 38x20+0+20 \) \
      -geometry +1028+330 -composite \
    "$WORK_DIR/device.png" -geometry +1028+330 -composite \
    "$WORK_DIR/app.png" -geometry +1066+406 -composite \
    -strip -colorspace sRGB -depth 8 -alpha off -quality 96 \
    "$OUTPUT_DIR/$output_name"
}

make_screen '01' 'm_connect.png' \
  $'Find friends\nwho get\nuniversity life' \
  'Discover verified students through shared courses, study styles and real interests.' \
  'VERIFIED STUDENT CONNECTIONS' \
  '#F7FBFF' '#D9ECFF' '01-find-your-people.png'

make_screen '02' 'm_mood.png' \
  $'Track how\nyou feel,\nday by day' \
  'Build a clearer picture of your wellbeing with quick, private daily check-ins.' \
  'PRIVATE WELLBEING INSIGHTS' \
  '#F7FFFC' '#DFF7EE' '02-track-your-mood.png'

make_screen '03' 'c_sent.png' \
  $'Chat safely\nwith your\nmatches' \
  'Turn a new connection into a real conversation, with safeguarding built in.' \
  'SAFER STUDENT CONVERSATIONS' \
  '#FFF9FC' '#F9E2EF' '03-chat-safely.png'

make_screen '04' 'c_list.png' \
  $'Keep your\nstudent circle\nclose' \
  'Your matches and conversations stay together in one calm, simple place.' \
  'ONE PLACE FOR YOUR CONNECTIONS' \
  '#FAFBFF' '#E7E9FA' '04-your-conversations.png'

make_screen '05' 'm_after_skip.png' \
  $'Connect\nthrough what\nyou share' \
  'Learn about courses, study styles and interests before you say hello.' \
  'MATCHED AROUND REAL INTERESTS' \
  '#FFFBF7' '#F6E8D8' '05-shared-interests.png'

identify "$OUTPUT_DIR"/*.png

