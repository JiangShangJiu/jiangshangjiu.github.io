# Research（研究）模块设计说明

> 本文档随首个 Research 模块 PR 提交，描述目录结构、页面设计、内容
> schema 与自动化方案。实现严格复用站点既有模式（Astro 7 内容集合 +
> BaseLayout + custom.css），不改动任何现有页面的行为。

## 1. 目标与范围

把「读论文」从一次性总结变成**持续的研究 + 发布系统**，包含四个子模块：

| 子模块                       | 目录                             | 节奏                      | 状态            |
| ---------------------------- | -------------------------------- | ------------------------- | --------------- |
| 经典选读（Classics）         | `src/content/research/classics/` | 按主题分期                | 已上线第 1 期   |
| 每周论文雷达（Weekly Radar） | `src/content/research/radar/`    | 每周（Actions 自动开 PR） | 已上线 2026-W43 |
| 论文精读（Deep Dive）        | `src/content/research/deepdive/` | 不定期，PR + 人工审读     | 已上线首篇草稿  |
| 复现记录（Reproduction）     | `src/content/research/repro/`    | 跟随精读                  | 预留            |
| 趋势观察（Trends）           | `src/content/research/trends/`   | 跨周期                    | 预留            |

**内容范围（硬约束）**：只收上半身——机械臂/双臂、灵巧手、上半身操作
及相关的运动学/动力学/控制与 VLA/IL/RL。locomotion、四旋翼、以移动底
盘为核心的工作不收录，除非其核心方法可直接迁移到机械臂/操作。

**策略**：先补经典（canonical gaps：ACT、Diffusion Policy、里程碑
VLA、阻抗/能量罐、动力学辨识与摩擦、IK/冗余、双臂经典），再追每周新
论文——研究首页按此顺序排版（经典选读在每周雷达之前）。

## 2. 目录结构

```
src/
  content/research/            # 新增内容集合（Chinese-only，不分 locale）
    classics/…                 # 经典选读（按期）
    radar/<year>-w<week>.md    # 每周雷达（文件名即 ISO 周）
    deepdive/<slug>.md         # 论文精读
    repro/ trends/             # 预留
  pages/[...locale]/research/
    index.astro                # 研究首页（按子模块分组列表）
    [...slug].astro            # 详情页（四类共用）
  components/
    PaperCard.astro            # 论文卡片（结构化技术字段）
    RepoCard.astro             # GitHub 仓库卡片
  utils/research.ts            # 集合工具 + frontmatter 公式的构建期 KaTeX 渲染
scripts/weekly-radar.mjs       # arXiv 抓取 + 草稿生成（可本地运行）
.github/workflows/weekly-radar.yml  # 每周定时 → 开 PR（不自动合并）
```

路由：`/research/`、`/research/classics/<slug>/`、`/research/radar/2026-w43/`、
`/research/deepdive/<slug>/`。子模块类型由条目 id 的第一段路径推导，
与 posts 用路径推导 locale 的做法一致。导航新增「研究」入口
（`src/config.ts` 的 `NAV` + `src/i18n/ui.ts`）。

## 3. 内容 schema（`src/content.config.ts`）

`research` 集合复用 posts 的 `baseFrontmatter`（title/description/
pubDate/tags/categories/draft/math/mermaid/toc/pinned…），并扩展：

- `status: 'ai-draft' | 'in-review' | 'reviewed'`（默认 `ai-draft`）——
  驱动详情页顶部的审读横幅与列表徽章，**区分 AI 分析、作者声称与本人
  审读/复现**；
- `papers: Paper[]`（雷达/经典：本期论文列表）；
- `paper?: Paper`（精读/复现：目标论文）；
- `repos: Repo[]`（雷达的 GitHub 工程板块）。

`Paper` 强制技术深度——除元数据（title/authors/arxivId/published/
categories/topics）外，以下字段为**必填**，禁止只写一句空洞点评：

| 字段                                            | 含义                                                            |
| ----------------------------------------------- | --------------------------------------------------------------- |
| `links.abs`（必填）/ `pdf` / `project` / `code` | 原文链接，全部须验证可达，禁止编造                              |
| `problem`                                       | 解决什么问题                                                    |
| `motivation`                                    | 相对已有工作的动机与差异                                        |
| `method`                                        | 核心方法                                                        |
| `mechanism`（可选）                             | 关键数学/机制；**出现公式必须解释每个变量**，支持 `$…$`/`$$…$$` |
| `experiments`                                   | 实验与结果；数字只允许引用论文声称值并注明「作者声称」          |
| `limitations`                                   | 局限与开放问题                                                  |
| `recommendation`                                | 推荐理由                                                        |

`Repo`（GitHub 工程雷达：ROS2、规划/控制、运动学/动力学、仿真器、
VLA/IL/RL 工具链、硬件驱动、双臂/灵巧手）：`name`（owner/repo）、
`url`、`summary`（它是什么）、`recentChange`（最近 release/合入了什么，
须来自真实提交/发布记录）、`stars` + `checkedAt`（抓取时刻的快照值）、
`topics`、`language`、`recommendation`。

**零编造原则**：首批内容的所有链接均逐一 `curl` 验证（DOI 经 Crossref
解析元数据；arXiv 经官方 API；GitHub 经 `gh api`），实验数字只转述论
文摘要声称值。

## 4. 页面设计

- **研究首页**（`/research/`）：按「经典选读 → 每周雷达 → 精读 →
  复现 → 趋势」顺序分组列表，每组带一句话说明；条目行显示审读状态
  徽章、论文/仓库数量与日期。复用 `post-module-head` 等既有样式。
- **详情页**：审读状态横幅（AI 草稿=橙 / 审读中=蓝 / 已审读=绿）→
  正文（导读/精读内容）→ 论文卡片列表 → 仓库卡片列表。论文卡片按
  「问题/动机/核心方法/关键机制/实验（作者声称）/局限/推荐理由」
  分面渲染，原文链接一字排开（abs/PDF/项目主页/代码）。
- **数学/代码/Mermaid**：正文沿用站点既有管线（KaTeX remark 插件、
  Expressive Code、Mermaid island，按 frontmatter 开关加载）。frontmatter
  字段里的公式不经过 remark，因此在 `utils/research.ts` 里用 KaTeX
  在**构建期**渲染（`renderMathInline`），页面检测到含 `$` 的字段时
  自动加载 KaTeX 样式表——这是对既有栈最轻量的扩展。

## 5. 标签 / 分类 / 归档

- 研究条目统一挂 `categories: ["论文研究"]`，`tags` 为主题标签（VLA、
  阻抗控制、触觉…），与 posts 的标签体系同名同义——但 research 是独立
  集合，不混入博客的 tags/categories/archives 聚合页（它们只聚合
  posts），避免影响既有页面行为。
- 雷达以 ISO 周号归档（文件名 `2026-w43`），经典选读按期号归档；研究
  首页本身就是按子模块的归档视图。后续如需按主题跨子模块聚合，可在
  `utils/research.ts` 加 `topics` 聚合函数，不动 schema。

## 6. 每周自动化（GitHub Actions → PR，不自动合并）

`weekly-radar.yml`：每周一 00:30 UTC 定时（可手动触发，支持自定义
抓取天数）：

1. `node scripts/weekly-radar.mjs`：按上半身检索式抓 arXiv 近 7 天论
   文，正则排除 locomotion/无人机/自动驾驶等范围外工作，去重后生成
   `radar/<year>-w<week>.md` 草稿（`draft: true` + 技术字段占位文案 +
   只填 arXiv abs/pdf 链接，**不猜测** project/code URL）；
2. `npm ci && npm run build`：生成的条目必须通过 schema 校验与完整构
   建，坏内容不进 PR；
3. `peter-evans/create-pull-request` 开 PR，PR 描述带 review 清单
   （剔除范围外论文、补全技术字段、核实链接、补充工程雷达、确认后把
   `draft` 改为 `false`）。

**失败安全**：脚本或构建失败 → job 失败 → 不开 PR → 站点保留上一期
的正常内容；即使草稿 PR 被误合并，`draft: true` 也保证生产构建不展示
未 review 的内容。精读永远走「AI 草稿 PR + 人工审读」流程，`status`
字段记录审读进度。

已知 TODO（在脚本与 workflow 内注释标明）：LLM 预填技术字段、GitHub
工程雷达自动抓取（跟踪固定仓库清单的 release/合入）、历史条目去重。
