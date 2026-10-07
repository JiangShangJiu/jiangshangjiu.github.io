---
title: "机械臂运动规划"
subtitle: "我在第二份工作中做的机械臂和多机器人运动规划实践。"
description: "我在工作中做的机械臂运动规划实践，包含采样式规划、轨迹优化、时间最优路径参数化和执行验证。"
heroImage: "/assets/img/projects/motion-planning/cover.webp"
featureVideo:
  src: "/assets/videos/motion-planning/loop.mp4"
  poster: "/assets/img/projects/motion-planning/loop.webp"
  caption: "我当时保存的机械臂运动规划演示片段。"
order: 4
role: "第二份工作"
status: "演示录像"
metrics:
  - "采样式规划 · 轨迹优化"
  - "时间最优路径参数化"
stack:
  - "C++"
  - "ROS 2"
  - "运动规划"
  - "轨迹优化"
tags:
  - "运动规划"
  - "轨迹优化"
  - "路径参数化"
buttons:
  - label: "相关笔记：采样式路径规划"
    url: "/posts/采样式路径规划/"
    icon: "lucide:book-open"
    primary: true
  - label: "相关笔记：Ruckig / TOPP-RA"
    url: "/posts/Ruckig-原理解析/"
    icon: "lucide:book-open"
---

我第二份工作的主要方向是机械臂和多机器人运动规划，涉及采样式规划、轨迹优化和时间最优路径参数化，并在仿真与真机上做执行验证。下面是当时保留的一段演示录像，约 5 分钟。

## 演示录像

<figure class="video-embed my-6">
  <div class="video-embed__frame">
    <video controls playsinline preload="metadata" poster="/assets/img/projects/motion-planning/planning-demo.webp" title="机械臂运动规划演示">
      <source src="/assets/videos/motion-planning/planning-demo.mp4" type="video/mp4" />
    </video>
  </div>
  <figcaption class="text-base-content/55 mt-2 text-center text-xs italic">运动规划演示录像。</figcaption>
</figure>

规划时，我关注的不只是几何路径，还包括避障、关节限位，以及速度和加速度约束。相关的原理与方法，我按几个方向整理在博客里：

- [采样式路径规划](/posts/采样式路径规划/)：RRT 系列的采样与扩展；
- [Ruckig 原理解析](/posts/Ruckig-原理解析/)：在线时间最优轨迹生成；
- [TOPP-RA 原理解析](/posts/TOPP-RA-原理解析/)：时间最优路径参数化；
- [MAPF 多智能体路径规划](/posts/MAPF多智能体路径规划/)：多机器人协同的路径规划。
