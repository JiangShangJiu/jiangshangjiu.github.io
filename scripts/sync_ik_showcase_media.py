#!/usr/bin/env python3
"""从 ik 仓库的 showcase 同步展示图表与短片到本站。

`ik/docs/showcase/` 下的画面由 showcase 渲染脚本生成：PNG 静帧 + MP4 短片。
本站不直接引用源仓库路径，而是把需要的图缩放、转成 WebP 放进
`public/assets/img/projects/inverse-kinematics/`，短片重新封装（+faststart）
放进 `public/assets/videos/inverse-kinematics/`，这样即使源仓库被改名、移走
或转为私有，站点资源也不会失效。

单机位画面（封面 + 四台直线跟踪）在源仓库里是 560x480（4:3），而本站的
`.video-embed__frame` 与其它成果的循环短片都是 16:9。这里把这几个画面按
左右各一段边缘像素横向复制补成 960x540——渲染背景左右基本一致，复制边缘
不会出现色带，比单纯加黑边干净，也能在 16:9 画框里铺满。

用法:
    python3 scripts/sync_ik_showcase_media.py [--repo /path/to/ik]

改图后重新同步:
    python3 scripts/sync_ik_showcase_media.py

新增一张图: 往下面的 FIGURES / WIDE_FIGURES / VIDEOS 里加一行即可。
"""

from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import sys

try:
    from PIL import Image
except ImportError:
    sys.exit("需要 Pillow: python3 -m pip install Pillow")

DEFAULT_REPO = "/home/xiaomeng/code/ik"
SLUG = "inverse-kinematics"

# 图上小字很多（徽章、残差、坐标刻度），质量给高一点、宽度给宽一点。
WEBP_QUALITY = 92

# 单机位画面补边后的尺寸，与站点 16:9 的视频画框一致。
WIDE_SIZE = (960, 540)

# 成果卡片封面：从 structure_quad 缩放后居中留白到 2.4:1，避免把四台
# 机械臂裁掉。背景色取自源图的白色底。
COVER_SOURCE = "exhibit2_structure_quad.png"
COVER_SIZE = (1200, 500)

# 多子图拼版：本身已经够宽，按原始比例缩放即可。
FIGURES: dict[str, tuple[str, int]] = {
    "structure-quad.webp": ("exhibit2_structure_quad.png", 1800),
    "legend.webp": ("exhibit2_legend.png", 1600),
    # iiwa：肩腕双球、解是一条圆
    "iiwa-geometry.webp": ("exhibit3_iiwa_geometry.png", 800),
    "iiwa-four-solutions.webp": ("exhibit3_iiwa_four_solutions.png", 1800),
    # UR5e：平行轴、有限分支
    "ur5e-geometry.webp": ("exhibit4_ur5e_geometry.png", 800),
    "ur5e-branches.webp": ("exhibit4_ur5e_branches.png", 1600),
    "ur5e-numerical.webp": ("exhibit4_ur5e_numerical.png", 1600),
    # 腕部对照与 Lite 6 解耦
    "wrist-comparison.webp": ("exhibit5_wrist_comparison.png", 1600),
    "lite6-decoupling.webp": ("exhibit5_lite6_decoupling.png", 800),
    "lite6-branches.webp": ("exhibit5_lite6_branches.png", 1600),
    # Panda：腕差一截，种子 + 抛光
    "panda-wrist.webp": ("exhibit6_panda_wrist.png", 1400),
    "panda-polish.webp": ("exhibit6_panda_polish.png", 1400),
    "panda-polish-curve.webp": ("exhibit6_panda_polish_curve.png", 900),
    "panda-branches.webp": ("exhibit6_panda_branches.png", 1600),
    # 直线跟踪对照与奇异
    "line-quad.webp": ("exhibit7_straight_line_quad.png", 1600),
    "line-bad-branch.webp": ("exhibit7_bad_branch.png", 1600),
    "singularity.webp": ("exhibit8_singularity.png", 1800),
}

# 单机位静帧：补边成 16:9 后作为对应短片的封面图。
WIDE_FIGURES: dict[str, str] = {
    "cover-first.webp": "exhibit1_cover_first.png",
    "line-ur5e.webp": "exhibit7_ur5e_first.png",
    "line-lite6.webp": "exhibit7_lite6_first.png",
    "line-iiwa14.webp": "exhibit7_iiwa14_first.png",
    "line-panda.webp": "exhibit7_panda_first.png",
}

# 站点内的短片名 -> showcase 目录下的源短片（统一补边成 16:9）。
VIDEOS: dict[str, str] = {
    "cover.mp4": "exhibit1_cover.mp4",
    "line-ur5e.mp4": "exhibit7_ur5e.mp4",
    "line-lite6.mp4": "exhibit7_lite6.mp4",
    "line-iiwa14.mp4": "exhibit7_iiwa14.mp4",
    "line-panda.mp4": "exhibit7_panda.mp4",
}


def _convert_figure(src: str, dest: str, max_width: int) -> None:
    img = Image.open(src)
    if img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGBA")
    if img.width > max_width:
        height = round(img.height * max_width / img.width)
        img = img.resize((max_width, height), Image.LANCZOS)
    img.save(dest, "WEBP", quality=WEBP_QUALITY, method=6)


def _edge_extend(img: Image.Image, size: tuple[int, int]) -> Image.Image:
    """按高度缩放后，用左右边缘像素横向复制补齐到目标宽度。"""
    target_w, target_h = size
    fg_w = max(1, round(img.width * target_h / img.height))
    fg = img.convert("RGB").resize((fg_w, target_h), Image.LANCZOS)
    pad = target_w - fg_w
    if pad <= 0:
        # 源图比目标还宽（本仓库不会出现）：退回按宽缩放后上下留白。
        fg_h = max(1, round(img.height * target_w / img.width))
        fg = img.convert("RGB").resize((target_w, fg_h), Image.LANCZOS)
        canvas = Image.new("RGB", size, (255, 255, 255))
        canvas.paste(fg, (0, (target_h - fg_h) // 2))
        return canvas

    left_w = (pad // 2) & ~1
    right_w = pad - left_w
    left = fg.crop((0, 0, 1, target_h)).resize((left_w, target_h), Image.NEAREST)
    right = fg.crop((fg_w - 1, 0, fg_w, target_h)).resize((right_w, target_h), Image.NEAREST)
    canvas = Image.new("RGB", size)
    canvas.paste(left, (0, 0))
    canvas.paste(fg, (left_w, 0))
    canvas.paste(right, (left_w + fg_w, 0))
    return canvas


def _make_cover(src: str, dest: str) -> None:
    """把一张 4:1 左右的四宫格缩放后居中贴在 2.4:1 的白底上。"""
    img = Image.open(src).convert("RGB")
    target_w, target_h = COVER_SIZE
    scale = min(target_w / img.width, target_h / img.height)
    fitted = img.resize((round(img.width * scale), round(img.height * scale)), Image.LANCZOS)

    canvas = Image.new("RGB", COVER_SIZE, (255, 255, 255))
    canvas.paste(fitted, ((target_w - fitted.width) // 2, (target_h - fitted.height) // 2))
    canvas.save(dest, "WEBP", quality=WEBP_QUALITY, method=6)


def _probe_size(src: str) -> tuple[int, int]:
    out = subprocess.check_output(
        [
            "ffprobe",
            "-v",
            "error",
            "-select_streams",
            "v:0",
            "-show_entries",
            "stream=width,height",
            "-of",
            "csv=p=0:s=x",
            src,
        ]
    ).decode().strip()
    width, height = out.split("x")
    return int(width), int(height)


def _make_wide_video(src: str, dest: str, size: tuple[int, int] = WIDE_SIZE) -> None:
    """重编码为 16:9：中间原画面，左右各贴一段边缘像素（hstack）。"""
    if shutil.which("ffmpeg") is None:
        shutil.copyfile(src, dest)
        return

    target_w, target_h = size
    width, height = _probe_size(src)
    fg_w = round(width * target_h / height)
    pad = target_w - fg_w
    if pad < 4:
        raise SystemExit(f"{os.path.basename(src)} 已经是 16:9 或更宽，无需补边")

    # yuv420p 要求宽高为偶数，边缘条与缩放宽度都取偶数。
    left_w = (pad // 2) & ~1
    right_w = pad - left_w
    filter_complex = (
        f"[0:v]scale={fg_w}:{target_h},setsar=1[fg];"
        f"[0:v]crop=2:ih:0:0,scale={left_w}:{target_h},setsar=1[lb];"
        f"[0:v]crop=2:ih:iw-2:0,scale={right_w}:{target_h},setsar=1[rb];"
        f"[lb][fg][rb]hstack=inputs=3,format=yuv420p[out]"
    )
    subprocess.run(
        [
            "ffmpeg",
            "-v",
            "error",
            "-y",
            "-i",
            src,
            "-filter_complex",
            filter_complex,
            "-map",
            "[out]",
            "-c:v",
            "libx264",
            "-preset",
            "medium",
            "-crf",
            "20",
            "-profile:v",
            "high",
            "-movflags",
            "+faststart",
            "-an",
            dest,
        ],
        check=True,
    )


def main() -> int:
    site_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=DEFAULT_REPO, help="ik 仓库路径")
    args = parser.parse_args()

    showcase_dir = os.path.join(args.repo, "docs", "showcase")
    if not os.path.isdir(showcase_dir):
        sys.exit(f"找不到 showcase 目录: {showcase_dir}")

    img_dir = os.path.join(site_root, "public", "assets", "img", "projects", SLUG)
    vid_dir = os.path.join(site_root, "public", "assets", "videos", SLUG)
    os.makedirs(img_dir, exist_ok=True)
    os.makedirs(vid_dir, exist_ok=True)

    total = 0.0
    for out_name, (rel_src, max_width) in sorted(FIGURES.items()):
        src = os.path.join(showcase_dir, rel_src)
        if not os.path.isfile(src):
            print(f"  跳过（源文件不存在）: {rel_src}")
            continue
        dest = os.path.join(img_dir, out_name)
        _convert_figure(src, dest, max_width)
        kb = os.path.getsize(dest) / 1024
        total += kb
        print(f"  {out_name:26} {max_width:>5}px {kb:8.1f} KB")

    for out_name, rel_src in sorted(WIDE_FIGURES.items()):
        src = os.path.join(showcase_dir, rel_src)
        if not os.path.isfile(src):
            print(f"  跳过（源文件不存在）: {rel_src}")
            continue
        dest = os.path.join(img_dir, out_name)
        _edge_extend(Image.open(src), WIDE_SIZE).save(
            dest, "WEBP", quality=WEBP_QUALITY, method=6
        )
        kb = os.path.getsize(dest) / 1024
        total += kb
        print(f"  {out_name:26} {'960x540':>7} {kb:8.1f} KB")

    cover_src = os.path.join(showcase_dir, COVER_SOURCE)
    if os.path.isfile(cover_src):
        dest = os.path.join(img_dir, "cover.webp")
        _make_cover(cover_src, dest)
        kb = os.path.getsize(dest) / 1024
        total += kb
        print(f"  {'cover.webp':26} {'1200x500':>7} {kb:8.1f} KB")
    else:
        print(f"  跳过（源文件不存在）: {COVER_SOURCE}")

    for out_name, rel_src in sorted(VIDEOS.items()):
        src = os.path.join(showcase_dir, rel_src)
        if not os.path.isfile(src):
            print(f"  跳过（源文件不存在）: {rel_src}")
            continue
        dest = os.path.join(vid_dir, out_name)
        _make_wide_video(src, dest)
        kb = os.path.getsize(dest) / 1024
        total += kb
        print(f"  {out_name:26} {'960x540':>7} {kb:8.1f} KB")

    print(f"  {'合计':26} {'':13} {total:8.1f} KB")

    generated_img = set(FIGURES) | set(WIDE_FIGURES) | {"cover.webp"}
    unused_img = set(os.listdir(img_dir)) - generated_img
    unused_vid = set(os.listdir(vid_dir)) - set(VIDEOS)
    if unused_img or unused_vid:
        print("\n以下文件已不在同步清单中，可以手动删除：")
        for name in sorted(unused_img):
            print(f"  图片: {name}")
        for name in sorted(unused_vid):
            print(f"  短片: {name}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
