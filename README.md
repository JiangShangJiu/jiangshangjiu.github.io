# jiangshangjiu.github.io

孔乙己的个人博客，基于 [Jekyll](https://jekyllrb.com/) 与 [Chirpy](https://github.com/cotes2020/jekyll-theme-chirpy) 主题搭建，托管于 GitHub Pages。

在线地址：<https://jiangshangjiu.github.io>

## 内容

- 机器人：运动规划与轨迹生成（Ruckig、TOPP-RA）、电机控制
- 具身智能：VLA 机器人基础模型（π 系列）原理解析
- 编程语言：C++ 基础与并发编程

## 本地预览

```bash
bundle install
bundle exec jekyll serve --livereload
# 浏览器打开 http://127.0.0.1:4000
```

草稿（`_drafts/` 目录）默认不发布，预览草稿加 `--drafts` 参数。

## 写作约定

- 文章放在 `_posts/<分类>/YYYY-MM-DD-标题.md`，front matter 需包含 `title`、`description`、`author`、`date`、`categories`、`tags`；
- 数学公式与流程图分别通过 `math: true`、`mermaid: true` 开启；
- 配图统一放在 `assets/img/<文章主题>/` 目录下。

## 部署

推送到 `main` 分支后，由 GitHub Actions（`.github/workflows/pages-deploy.yml`）自动构建并发布。
