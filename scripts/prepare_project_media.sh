#!/usr/bin/env bash
#
# Prepare self-hosted demo media for the "成果" (projects) pages.
#
# The source demos live outside the repo (originally in ~/研究) and are far too
# large to serve as-is — some clips are 100MB+ and GitHub rejects files over
# 100MB. This script transcodes them to web-friendly 720p H.264, extracts a
# poster frame for each clip, and cuts a wide 2.4:1 cover for the project card.
#
# Outputs (relative to the repo root):
#   public/assets/videos/<slug>/<name>.mp4        transcoded clip
#   public/assets/img/projects/<slug>/<name>.webp poster frame
#   public/assets/img/projects/<slug>/cover.webp  wide 2.4:1 cover
#
# Usage:
#   scripts/prepare_project_media.sh [--force]
#
# Source directory defaults to ~/研究/5月28日; override with MEDIA_SRC.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MEDIA_SRC="${MEDIA_SRC:-$HOME/研究/5月28日}"

FORCE=0
[[ "${1:-}" == "--force" ]] && FORCE=1

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "error: ffmpeg not found on PATH" >&2
  exit 1
fi

if [[ ! -d "$MEDIA_SRC" ]]; then
  echo "error: source directory not found: $MEDIA_SRC" >&2
  echo "       set MEDIA_SRC=/path/to/media" >&2
  exit 1
fi

# Transcode settings: 540p, H.264 high profile, CRF 30, 24fps. Robot demos are
# mostly static scenes, so these settings keep the clips clean while shrinking
# 100MB+ sources to a few MB. (GIF would be ~10x larger — see README.)
#
# Want higher quality? Bump to `scale=1280:720`, CRF 27 and fps 30.
VIDEO_ARGS=(
  -vf "scale=960:540:force_original_aspect_ratio=decrease,pad=ceil(iw/2)*2:ceil(ih/2)*2"
  -r 24
  -c:v libx264 -preset medium -crf 30 -profile:v high -pix_fmt yuv420p
  -c:a aac -b:a 64k
  -movflags +faststart
)
POSTER_W=960

transcode() {
  local src_rel="$1" slug="$2" out_name="$3" poster_at="$4"
  local src="$MEDIA_SRC/$src_rel"
  local vdir="$REPO_ROOT/public/assets/videos/$slug"
  local idir="$REPO_ROOT/public/assets/img/projects/$slug"
  local vout="$vdir/$out_name.mp4"
  local pout="$idir/$out_name.webp"

  if [[ ! -f "$src" ]]; then
    echo "skip (missing source): $src" >&2
    return
  fi

  mkdir -p "$vdir" "$idir"

  if [[ -f "$vout" && $FORCE -eq 0 ]]; then
    echo "skip (exists): ${vout#$REPO_ROOT/}"
  else
    echo "transcode: $src_rel -> ${vout#$REPO_ROOT/}"
    ffmpeg -v error -y -i "$src" "${VIDEO_ARGS[@]}" "$vout"
  fi

  if [[ -f "$pout" && $FORCE -eq 0 ]]; then
    echo "skip (exists): ${pout#$REPO_ROOT/}"
  else
    echo "poster:    ${pout#$REPO_ROOT/}"
    ffmpeg -v error -y -ss "$poster_at" -i "$src" -frames:v 1 \
      -vf "scale=${POSTER_W}:-2" -c:v libwebp -quality 80 "$pout"
  fi
}

# Cut a wide 2.4:1 cover (matches the project card crop) from a source clip.
make_cover() {
  local src_rel="$1" slug="$2" at="$3"
  local src="$MEDIA_SRC/$src_rel"
  local idir="$REPO_ROOT/public/assets/img/projects/$slug"
  local out="$idir/cover.webp"

  if [[ ! -f "$src" ]]; then
    echo "skip (missing source): $src" >&2
    return
  fi
  mkdir -p "$idir"
  if [[ -f "$out" && $FORCE -eq 0 ]]; then
    echo "skip (exists): ${out#$REPO_ROOT/}"
    return
  fi
  echo "cover:     ${out#$REPO_ROOT/}"
  ffmpeg -v error -y -ss "$at" -i "$src" -frames:v 1 \
    -vf "scale=1200:-2,crop=1200:500" -c:v libwebp -quality 82 "$out"
}

# Cut a short, silent, 540p clip that the homepage autoplays on loop (the
# "视频版 GIF"). Kept deliberately short so several can autoplay at once.
#
# Segments are given as `<start>:<dur>[:<speed>]` (speed defaults to 1) and are
# concatenated in order. Speeding a segment up lets a longer, more legible
# window fit into a compact loop — e.g. `30:30:1.5` plays 30s of footage in
# 20s. That is how the human-robot interaction demo is built.
make_loop() {
  local src_rel="$1" slug="$2" out_name="$3"; shift 3
  local segs=("$@")
  local src="$MEDIA_SRC/$src_rel"
  local vdir="$REPO_ROOT/public/assets/videos/$slug"
  local idir="$REPO_ROOT/public/assets/img/projects/$slug"
  local vout="$vdir/$out_name.mp4"
  local pout="$idir/$out_name.webp"

  if [[ ! -f "$src" ]]; then
    echo "skip (missing source): $src" >&2
    return
  fi
  mkdir -p "$vdir" "$idir"

  local first="${segs[0]}"
  local first_start="${first%%:*}"

  if [[ -f "$vout" && $FORCE -eq 0 ]]; then
    echo "skip (exists): ${vout#$REPO_ROOT/}"
  else
    echo "loop:      ${vout#$REPO_ROOT/} (${segs[*]})"
    local inputs=() filters=() concat="" idx=0
    for seg in "${segs[@]}"; do
      local st="${seg%%:*}"
      local rest="${seg#*:}"
      local du="${rest%%:*}"
      local sp="${rest#*:}"
      [[ "$sp" == "$rest" || -z "$sp" ]] && sp=1
      inputs+=(-ss "$st" -t "$du" -i "$src")
      # setpts speeds the clip up (PTS / speed); fps=20 is applied after, so the
      # output frame rate stays constant regardless of the speed factor.
      filters+=("[${idx}:v]scale=960:540:force_original_aspect_ratio=decrease,pad=ceil(iw/2)*2:ceil(ih/2)*2,setsar=1,setpts=PTS/${sp},fps=20[v${idx}]")
      concat+="[v${idx}]"
      idx=$((idx + 1))
    done
    concat+="concat=n=${idx}:v=1:a=0[out]"
    ffmpeg -v error -y "${inputs[@]}" \
      -filter_complex "$(IFS=';'; echo "${filters[*]};${concat}")" \
      -map "[out]" -c:v libx264 -preset medium -crf 32 -profile:v high \
      -pix_fmt yuv420p -an -movflags +faststart "$vout"
  fi

  if [[ -f "$pout" && $FORCE -eq 0 ]]; then
    echo "skip (exists): ${pout#$REPO_ROOT/}"
  else
    echo "loop poster: ${pout#$REPO_ROOT/}"
    ffmpeg -v error -y -ss "$first_start" -i "$src" -frames:v 1 \
      -vf "scale=${POSTER_W}:-2" -c:v libwebp -quality 80 "$pout"
  fi
}

# ---------------------------------------------------------------------------
# 硕士课题：基于能量罐的机械臂柔顺控制 (energy-tank)
# ---------------------------------------------------------------------------
transcode "硕士/柔顺控制.mp4"       energy-tank variable-impedance     2
transcode "硕士/零空间阻抗.mp4"     energy-tank nullspace-hierarchical 2
transcode "硕士/body_impedacne.mp4" energy-tank whole-body-impedance  3
transcode "硕士/推箱子实验.mp4"     energy-tank push-drawer            3
transcode "硕士/hybrid_force.mp4"   energy-tank adaptive-hybrid-force  6
transcode "硕士/DSandtank.mp4"      energy-tank energy-tank-bound      5
make_cover  "硕士/推箱子实验.mp4"   energy-tank 6
# 首页自动循环播放的短片（自适应力位混合控制）。
# 两段人机交互分别位于 ~34–37.5s 与 ~53–57s。截取 30–60s 的连续过程
# （含交互前后的正常打磨），1.5 倍速播放，循环约 20s。
make_loop   "硕士/hybrid_force.mp4" energy-tank loop 30:30:1.5

# ---------------------------------------------------------------------------
# 第一份工作：VLA (vla)  —— 文件名随后可按真实项目改名
# ---------------------------------------------------------------------------
transcode "VLA/5月28日.mp4"      vla vla-demo-1 4
transcode "VLA/1206419614.mp4"   vla vla-demo-2 4
transcode "VLA/703891709.mp4"    vla vla-demo-3 4
transcode "VLA/媒体5.mp4"        vla vla-demo-4 4
make_cover  "VLA/5月28日.mp4"    vla 6
make_loop   "VLA/5月28日.mp4"    vla loop 46:24:1.5

# ---------------------------------------------------------------------------
# 第二份工作：运动规划 (motion-planning)
# ---------------------------------------------------------------------------
transcode "运动规划/video_20251225_154316.mp4" motion-planning planning-demo 12
make_cover  "运动规划/video_20251225_154316.mp4" motion-planning 30
make_loop   "运动规划/video_20251225_154316.mp4" motion-planning loop 12:24:1.5

echo "done."
