#!/usr/bin/env python3
"""同步 IK 项目正文与发布素材，不重新渲染或转码。

在站点根目录运行：
    python3 scripts/sync_ik_showcase_media.py --repo /path/to/ik

唯一来源是 ik/docs/homepage/inverse-kinematics.md 及其 public/ 资源。
先检查完整引用集，再复制正文和文件；仅清理三个 IK 专用资源目录中
不再被本站源码引用的文件。无需 Pillow、ffmpeg 或 MuJoCo。
"""
from __future__ import annotations

import argparse
from pathlib import Path
import re
import shutil

SLUG = "inverse-kinematics"
ASSET_URL = re.compile(r"/assets/(?:img|videos|data)/[^\s\)\"'<>]+")
ASSET_DIRS = {
    Path(f"assets/img/projects/{SLUG}"): ".webp",
    Path(f"assets/videos/{SLUG}"): ".mp4",
    Path(f"assets/data/{SLUG}"): ".json",
}
SOURCE_SUFFIXES = {".md", ".mdx", ".astro", ".ts", ".tsx", ".js", ".css", ".json"}


def referenced_assets(markdown: str) -> set[Path]:
    assets = {Path(url[1:]) for url in ASSET_URL.findall(markdown)}
    if not assets:
        raise ValueError("项目正文没有引用发布资源")
    for asset in assets:
        if asset.parent not in ASSET_DIRS or asset.suffix != ASSET_DIRS[asset.parent]:
            raise ValueError(f"引用不在 IK 发布目录中：{asset}")
    return assets


def sync(repo: Path, site: Path) -> tuple[int, int]:
    source = repo / "docs/homepage"
    markdown_path = source / f"{SLUG}.md"
    markdown = markdown_path.read_text(encoding="utf-8")
    assets = referenced_assets(markdown)
    missing = [str(p) for p in sorted(assets) if not (source / "public" / p).is_file()]
    if missing:
        raise FileNotFoundError("缺少发布资源，未修改站点：" + ", ".join(missing))

    # 先读取本站源码，保留其他页面仍在引用的旧 IK 资源。
    other_sources = []
    target_markdown = site / f"src/content/projects/{SLUG}.md"
    for path in (site / "src").rglob("*"):
        if path.is_file() and path != target_markdown and path.suffix in SOURCE_SUFFIXES:
            other_sources.append(path.read_text(encoding="utf-8"))
    references = "\n".join([markdown, *other_sources])

    target_markdown.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(markdown_path, target_markdown)
    for asset in sorted(assets):
        target = site / "public" / asset
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source / "public" / asset, target)

    removed = 0
    for directory in ASSET_DIRS:
        target_dir = site / "public" / directory
        for path in target_dir.iterdir():
            relative = directory / path.name
            if path.is_file() and relative not in assets and f"/{relative.as_posix()}" not in references:
                path.unlink()
                removed += 1
    return len(assets), removed


def main() -> int:
    site = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", type=Path, default=site.parent / "ik", help="IK 仓库路径")
    args = parser.parse_args()
    copied, removed = sync(args.repo.resolve(), site)
    print(f"已同步项目正文与 {copied} 项资源，清理 {removed} 项无引用旧资源。")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
