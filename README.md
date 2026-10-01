# jiangshangjiu.github.io

孔乙己的个人博客，基于 [Astro](https://astro.build/) 与 [Chirping Astro](https://github.com/kannansuresh/chirping-astro) 主题搭建，托管于 GitHub Pages。

在线地址：<https://jiangshangjiu.github.io>

> 本站原先由 Jekyll + [Chirpy](https://github.com/cotes2020/jekyll-theme-chirpy) 驱动，
> 现已整体迁移到 Astro。所有文章 URL 与迁移前完全一致。

## 内容

- 机器人：运动规划（RRT、Ruckig、TOPP-RA、MAPF 多智能体）、运动学与动力学（DH、雅可比、逆运动学、拉格朗日、参数辨识）、标定（运动学/TCP/手眼）、状态估计（卡尔曼滤波、EKF、ESKF/IMU）、电机控制（FOC）、伺服整定与共振抑制（双质量模型、陷波、输入整形）、力控（阻抗/导纳）、双臂协同（协同任务空间、抓取矩阵与内力、约束流形规划、QP 分层控制）、视觉伺服（IBVS/PBVS）、碰撞检测与协作安全、关节硬件选型、实时系统（PREEMPT_RT、EtherCAT）、软件架构（ROS 2）
- 具身智能：VLA 机器人基础模型（π 系列）、模仿学习（ACT、Diffusion Policy）、强化学习与 sim-to-real（足式机器人）、数据获取范式的演进（遥操作、手持夹爪、人类视频、跨本体聚合、数据飞轮）
- 编程语言：C++ 基础、并发编程、内存模型与无锁编程

## 本地预览

需要 Node.js 22 及以上。

```bash
npm ci
npm run dev
# 浏览器打开 http://localhost:4321
```

常用命令：

| 命令                | 说明                                     |
| ------------------- | ---------------------------------------- |
| `npm run dev`       | 启动开发服务器（热更新）                 |
| `npm run build`     | 构建到 `dist/`，并生成 Pagefind 搜索索引 |
| `npm run preview`   | 本地预览构建产物                         |
| `npm run typecheck` | 类型检查（`astro check`）                |
| `npm test`          | 运行单元测试                             |
| `npm run lint`      | ESLint 检查                              |
| `npm run format`    | 用 Prettier 格式化代码                   |

站点配置集中在 `src/config.ts`（站点标题、副标题、导航、社交链接、Giscus、首页 profile）。
环境变量均为可选，见 `.env.example`。

## 写作约定

- 文章放在 `src/content/posts/zh/<标题>.md`，front matter 需包含 `title`、`description`、`pubDate`、`categories`、`tags`；
- 数学公式与流程图分别通过 `math: true`、`mermaid: true` 开启；
- 文件名即 URL：`src/content/posts/zh/卡尔曼滤波原理解析.md` → `/posts/卡尔曼滤波原理解析/`。
  集合使用了 `generateId: preserveFilename`，**大小写与中文字符都会原样保留**，
  以保证 Giscus 讨论（按 pathname 绑定）和既有的外部链接不失效；
- 配图统一放在 `public/assets/img/<文章主题>/` 目录下。

> **注意**：`src/content/` 已被 `.prettierignore` 排除。Prettier 的 Markdown
> 格式化会把 `*`、`_` 当作强调标记，从而改坏正文里的 LaTeX（例如
> `$i_d^*, i_q^*$` 会被改成 `$i_d^_, i_q^_$`）。需要重新生成这两类内容时，
> 请使用 `scripts/` 下的脚本，不要对它们跑 `npm run format`。

## 内容迁移脚本

从 Jekyll 迁移时使用的辅助脚本，保留在 `scripts/` 下以便追溯：

```bash
# Jekyll 的 _posts / _projects 目录 -> Astro content collections
python3 scripts/jekyll_to_astro.py posts    --source <jekyll>/_posts
python3 scripts/jekyll_to_astro.py projects --source <jekyll>/_projects

# 校验并规范化文章标签（--check 只检查，--apply 写入）
python3 scripts/normalize_tags.py --check
```

## 部署

推送到 `main` 分支后，由 GitHub Actions（`.github/workflows/deploy.yml`）自动构建并发布。
