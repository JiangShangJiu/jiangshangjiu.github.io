#!/usr/bin/env python3
"""把 Jekyll / Chirpy 的文章迁移成 Astro content collections 的内容。

迁移前本站是 Jekyll + jekyll-theme-chirpy：
  - 文章在 `_posts/<分类目录>/YYYY-MM-DD-<标题>.md`，permalink `/posts/:title/`
  - 成果在 `_projects/<名称>.md`，permalink `/projects/:name/`

Astro 侧：
  - 文章放 `src/content/posts/zh/<标题>.md`   ->  `/posts/<标题>/`
  - 成果放 `src/content/projects/<名称>.md`    ->  `/projects/<名称>/`

本脚本把文章**扁平化**输出（丢掉 `_posts` 的目录层级），因为分类信息本来
就在 front matter 的 `categories` 里，丢目录不影响任何页面。这样处理后 URL
与旧的 Jekyll 站点逐字一致 —— 既保住 SEO，也保住了 Giscus 按 pathname 绑定
的评论线程。

用法
----
    # Jekyll 源码在 main 分支上，先导出再转换：
    mkdir -p /tmp/jekyll_src
    git archive main _posts _projects | tar -x -C /tmp/jekyll_src

    python3 scripts/jekyll_to_astro.py posts    --source /tmp/jekyll_src/_posts
    python3 scripts/jekyll_to_astro.py projects --source /tmp/jekyll_src/_projects

    # 试运行，只打印不写文件
    python3 scripts/jekyll_to_astro.py posts --source /tmp/jekyll_src/_posts --dry-run
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

try:
    import yaml
except ImportError:  # pragma: no cover
    sys.exit("需要 PyYAML：python3 -m pip install PyYAML")

FRONT_MATTER_RE = re.compile(r"^---\r?\n(.*?)\r?\n---\r?\n?", re.S)
DATE_PREFIX_RE = re.compile(r"^\d{4}-\d{2}-\d{2}-")
DATE_RE = re.compile(
    r"^(?P<y>\d{4})-(?P<m>\d{2})-(?P<d>\d{2})[ T]"
    r"(?P<H>\d{2}):(?P<M>\d{2}):(?P<S>\d{2})\s*(?P<tz>[+-]\d{4})?$"
)

# kramdown 的块级 IAL，Jekyll 用它给段落加 Chirpy 的 prompt 样式。
# 迁移时只在 `_projects/robot-model.md` 里出现过，转完就手工改成了
# daisyUI 的 alert 盒子（见该文件），这里只负责兜底删除。
PROMPT_IAL_RE = re.compile(r"^\{:\s*\.prompt-(?:info|tip|warning|danger)\s*\}\s*$", re.M)


def yaml_str(value: str) -> str:
    """把字符串安全地输出成 YAML 双引号标量。"""
    escaped = value.replace("\\", "\\\\").replace('"', '\\"')
    return f'"{escaped.replace(chr(13), "").replace(chr(10), chr(92) + "n")}"'


def yaml_list(lines: list[str], key: str, values: list) -> None:
    if not values:
        return
    lines.append(f"{key}:")
    for item in values:
        lines.append(f"  - {yaml_str(str(item))}")


def format_date(value: object) -> str:
    """把 Jekyll 的 date 转成带时区偏移的 ISO 8601。"""
    if hasattr(value, "isoformat") and not isinstance(value, str):
        # PyYAML 对不带时区的 `2024-05-02 19:43:00` 会解析成 datetime
        return value.isoformat()

    match = DATE_RE.match(str(value).strip())
    if not match:
        raise ValueError(f"无法解析的 date 字段: {value!r}")

    g = match.groupdict()
    tz = g["tz"] or "+0000"
    return f"{g['y']}-{g['m']}-{g['d']}T{g['H']}:{g['M']}:{g['S']}{tz[:3]}:{tz[3:]}"


def load(path: Path) -> tuple[dict, str]:
    raw = path.read_text(encoding="utf-8")
    match = FRONT_MATTER_RE.match(raw)
    if not match:
        raise ValueError(f"{path} 没有合法的 front matter")
    meta = yaml.safe_load(match.group(1)) or {}
    body = raw[match.end() :].replace("\r\n", "\n")
    body = PROMPT_IAL_RE.sub("", body)
    return meta, body


def check_roundtrip(path: Path, front_matter: str) -> None:
    """写出前自检：生成的 front matter 必须能重新解析回来。"""
    parsed = yaml.safe_load(front_matter)
    if not isinstance(parsed, dict):
        raise ValueError(f"{path} 生成的 front matter 无法解析")


def tags_of(meta: dict) -> list:
    values = meta.get("tags") or []
    return [values] if isinstance(values, str) else values


# ---------------------------------------------------------------------------
# posts
# ---------------------------------------------------------------------------

POST_DROP = {"author", "layout", "icon", "order", "pin", "image", "featured"}


def post_slug(path: Path) -> str:
    """`2026-08-10-TOPP-RA-原理解析.md` -> `TOPP-RA-原理解析`。

    Jekyll 的 `:title` 会去掉日期前缀并保留大小写与中文，这里保持一致。
    """
    return DATE_PREFIX_RE.sub("", path.stem)


def build_post(path: Path) -> str:
    meta, body = load(path)
    for key in ("title", "date"):
        if not meta.get(key):
            raise ValueError(f"{path} 缺少 {key}")

    lines = ["---", f"title: {yaml_str(str(meta['title']))}"]
    if meta.get("description"):
        lines.append(f"description: {yaml_str(str(meta['description']))}")
    lines.append(f"pubDate: {format_date(meta['date'])}")

    yaml_list(lines, "tags", tags_of(meta))
    yaml_list(lines, "categories", meta.get("categories") or [])

    # Chirpy 的 featured 表示置顶，对应 Astro 的 pinned
    if meta.get("featured"):
        lines.append("pinned: true")
    # Astro schema 里 math / mermaid 默认 false，只有 true 才写
    for key in ("math", "mermaid"):
        if meta.get(key):
            lines.append(f"{key}: true")
    # toc / comments 默认 true，只在被关掉时写
    for key in ("toc", "comments"):
        if meta.get(key) is False:
            lines.append(f"{key}: false")
    if meta.get("cover"):
        lines.append(f"heroImage: {yaml_str(str(meta['cover']))}")

    lines.append("---")
    check_roundtrip(path, "\n".join(lines[1:-1]))
    return "\n".join(lines) + "\n\n" + body


# ---------------------------------------------------------------------------
# projects
# ---------------------------------------------------------------------------

PROJECT_LIST_KEYS = ("metrics", "stack")

# 旧站用 Font Awesome 的 class 名（`fas fa-book`），Astro 主题用 iconify 名。
# 只列出实际用到的那些；遇到没收录的就原样保留，构建时 astro-icon 会报错提醒。
FA_TO_ICONIFY = {
    "fab fa-github": "simple-icons:github",
    "fas fa-book": "lucide:book-open",
    "fas fa-cubes": "lucide:boxes",
    "fas fa-newspaper": "lucide:newspaper",
    "fas fa-envelope": "lucide:mail",
    "fas fa-id-card": "lucide:id-card",
    "fas fa-briefcase": "lucide:briefcase",
    "fas fa-graduation-cap": "lucide:graduation-cap",
    "fas fa-map-marker-alt": "lucide:map-pin",
    "fas fa-arrow-left": "lucide:arrow-left",
    "fas fa-angle-right": "lucide:chevron-right",
}


def icon_name(value: str) -> str:
    return FA_TO_ICONIFY.get(value.strip(), value.strip())


def build_project(path: Path) -> str:
    meta, body = load(path)
    if not meta.get("title"):
        raise ValueError(f"{path} 缺少 title")

    lines = ["---", f"title: {yaml_str(str(meta['title']))}"]
    if meta.get("subtitle"):
        lines.append(f"subtitle: {yaml_str(str(meta['subtitle']))}")
    if meta.get("description"):
        lines.append(f"description: {yaml_str(str(meta['description']))}")
    if meta.get("cover"):
        lines.append(f"heroImage: {yaml_str(str(meta['cover']))}")
    lines.append(f"order: {int(meta.get('order', 999))}")

    for key in ("role", "period", "status"):
        if meta.get(key):
            lines.append(f"{key}: {yaml_str(str(meta[key]))}")

    for key in PROJECT_LIST_KEYS:
        yaml_list(lines, key, meta.get(key) or [])

    if meta.get("highlights"):
        lines.append("highlights:")
        for item in meta["highlights"]:
            lines.append(f"  - value: {yaml_str(str(item['value']))}")
            lines.append(f"    label: {yaml_str(str(item['label']))}")

    if meta.get("buttons"):
        lines.append("buttons:")
        for btn in meta["buttons"]:
            lines.append(f"  - label: {yaml_str(str(btn['label']))}")
            lines.append(f"    url: {yaml_str(str(btn['url']))}")
            if btn.get("icon"):
                lines.append(f"    icon: {yaml_str(icon_name(str(btn['icon'])))}")
            if btn.get("primary"):
                lines.append("    primary: true")
            if btn.get("external"):
                lines.append("    external: true")

    yaml_list(lines, "tags", tags_of(meta))

    lines.append("---")
    check_roundtrip(path, "\n".join(lines[1:-1]))
    return "\n".join(lines) + "\n\n" + body


# ---------------------------------------------------------------------------

MODES = {
    "posts": (post_slug, build_post, "src/content/posts/zh"),
    "projects": (lambda p: p.stem, build_project, "src/content/projects"),
}


def main() -> int:
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument("mode", choices=sorted(MODES))
    parser.add_argument("--source", required=True, help="Jekyll 的 _posts / _projects 目录")
    parser.add_argument("--out", default=None, help="输出目录（默认按 mode 决定）")
    parser.add_argument("--dry-run", action="store_true", help="只打印，不写文件")
    args = parser.parse_args()

    slug_of, build, default_out = MODES[args.mode]
    src_dir = Path(args.source)
    if not src_dir.is_dir():
        print(f"源目录不存在: {src_dir}", file=sys.stderr)
        return 1

    out_dir = Path(args.out or default_out)
    sources = sorted(src_dir.rglob("*.md"))
    if not sources:
        print(f"在 {src_dir} 下没有找到 .md 文件", file=sys.stderr)
        return 1

    if not args.dry_run:
        out_dir.mkdir(parents=True, exist_ok=True)

    seen: dict[str, Path] = {}
    for path in sources:
        slug = slug_of(path)
        # slug 直接变成 URL，重复就意味着两个文件会互相覆盖
        if slug in seen:
            print(f"slug 冲突: {slug}\n  {seen[slug]}\n  {path}", file=sys.stderr)
            return 1
        seen[slug] = path

        content = build(path)
        if args.dry_run:
            print(f"--- {slug}  <-  {path.relative_to(src_dir)}")
            print(content)
            continue

        target = out_dir / f"{slug}.md"
        target.write_text(content, encoding="utf-8")
        print(f"  {path.relative_to(src_dir)}  ->  {target}")

    print(f"\n完成：{len(sources)} 个 -> {out_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
