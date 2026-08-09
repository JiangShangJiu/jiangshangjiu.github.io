# jiangshangjiu.github.io

孔乙己的个人博客，基于 [Jekyll](https://jekyllrb.com/) 与 [Chirpy](https://github.com/cotes2020/jekyll-theme-chirpy) 主题搭建，托管于 GitHub Pages。

在线地址：<https://jiangshangjiu.github.io>

## 内容

- 机器人：运动规划（RRT、Ruckig、TOPP-RA）、运动学与动力学（DH、雅可比、拉格朗日、参数辨识）、标定（运动学/TCP/手眼）、状态估计（卡尔曼滤波、EKF、ESKF/IMU）、电机控制（FOC）、力控（阻抗/导纳）、视觉伺服（IBVS/PBVS）、碰撞检测与协作安全、关节硬件选型、实时系统（PREEMPT_RT、EtherCAT）、软件架构（ROS 2）
- 具身智能：VLA 机器人基础模型（π 系列）、模仿学习（ACT、Diffusion Policy）、强化学习与 sim-to-real（足式机器人）原理解析
- 编程语言：C++ 基础、并发编程、内存模型与无锁编程

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
