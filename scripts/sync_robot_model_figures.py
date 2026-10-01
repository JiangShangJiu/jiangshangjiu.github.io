#!/usr/bin/env python3
"""从 robot_model 仓库同步展示图表到本站。

robot_model 的实验图表由它自己的绘图脚本生成并提交在
`<repo>/docs/figures/` 下。本站不直接引用外部 URL，而是把需要的图
缩放、转成 WebP 后放进 `public/assets/img/projects/robot_model/`，
这样即使仓库改名或转为私有，站点图片也不会失效。

用法:
    python3 scripts/sync_robot_model_figures.py [--repo /path/to/robot_model]

改图后重新同步:
    python3 scripts/sync_robot_model_figures.py

新增一张图: 往下面的 FIGURES 里加一行即可。
"""

import argparse
import os
import sys

try:
    from PIL import Image
except ImportError:
    sys.exit("需要 Pillow: python3 -m pip install Pillow")

DEFAULT_REPO = "/home/xiaomeng/code/robot_model"

# 站点内的文件名 -> (robot_model 仓库中的相对路径, 缩放后的最大宽度)
FIGURES = {
    # 成果卡片封面
    "cover.webp": ("franka/inertia_mass.png", 1000),
    # 激励轨迹筛选
    "franka-screening.webp": ("franka/screening.png", 1000),
    "franka-trajectory.webp": ("franka/trajectory.png", 1000),
    # 独立验证结果
    "franka-validation.webp": ("franka/validation_torque.png", 1000),
    "rrr-validation.webp": ("rrr/validation_torque.png", 1000),
    # 辨识与恢复
    "franka-base-params.webp": ("franka/base_params.png", 1000),
    "franka-inertia-com.webp": ("franka/inertia_com.png", 1000),
}

WEBP_QUALITY = 92  # 图上小字较多，质量给高一点


def main() -> int:
    site_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", default=DEFAULT_REPO, help="robot_model 仓库路径")
    args = parser.parse_args()

    figure_dir = os.path.join(args.repo, "docs", "figures")
    if not os.path.isdir(figure_dir):
        sys.exit(f"找不到图表目录: {figure_dir}")

    # 图片放在 `public/` 下，URL 就是 /assets/img/...，与 Markdown 正文里的
    # 引用保持一致（迁移前这些文件在 Jekyll 的 assets/img/ 下，路径未变）。
    dest_dir = os.path.join(site_root, "public", "assets", "img", "projects", "robot_model")
    os.makedirs(dest_dir, exist_ok=True)

    total = 0
    for out_name, (rel_src, max_width) in sorted(FIGURES.items()):
        src = os.path.join(figure_dir, rel_src)
        if not os.path.isfile(src):
            print(f"  跳过（源文件不存在）: {rel_src}")
            continue

        img = Image.open(src)
        if img.mode not in ("RGB", "RGBA"):
            img = img.convert("RGBA")
        if img.width > max_width:
            height = round(img.height * max_width / img.width)
            img = img.resize((max_width, height), Image.LANCZOS)

        dest = os.path.join(dest_dir, out_name)
        img.save(dest, "WEBP", quality=WEBP_QUALITY, method=6)

        kb = os.path.getsize(dest) / 1024
        total += kb
        print(f"  {out_name:26} {img.size[0]:>5}x{img.size[1]:<5} {kb:7.1f} KB")

    print(f"  {'合计':26} {'':13} {total:7.1f} KB")

    unused = set(os.listdir(dest_dir)) - set(FIGURES)
    if unused:
        print("\n以下文件已不在 FIGURES 中，可以手动删除：")
        for name in sorted(unused):
            print(f"  {name}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
