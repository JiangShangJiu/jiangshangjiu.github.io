---
title: "机械臂运动规划"
subtitle: "从采样式规划到时间最优轨迹参数化的规划实践"
description: "第二份工作期间的主要方向：围绕机械臂/多机器人运动规划，覆盖采样式规划、轨迹优化与时间最优路径参数化，并在仿真与真机上完成执行验证。"
heroImage: "/assets/img/projects/motion-planning/cover.webp"
featureVideo:
  src: "/assets/videos/motion-planning/loop.mp4"
  poster: "/assets/img/projects/motion-planning/loop.webp"
  caption: "机械臂运动规划演示（循环播放）。"
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

## 背景

机械臂运动规划要在满足关节限位、速度与加速度约束、以及避障要求的前提下，为机械臂找出一条可行且高效的轨迹。它往下连着运动学/动力学，往上支撑抓取、装配等具体任务，是运控算法里承上启下的一环。

这一段是我第二份工作期间的主要方向。下面是我当时保留下来的演示录像（约 5 分钟）。

## 演示录像

<figure class="video-embed my-6">
  <div class="video-embed__frame">
    <video controls playsinline preload="metadata" poster="/assets/img/projects/motion-planning/planning-demo.webp" title="机械臂运动规划演示">
      <source src="/assets/videos/motion-planning/planning-demo.mp4" type="video/mp4" />
    </video>
  </div>
  <figcaption class="text-base-content/55 mt-2 text-center text-xs italic">运动规划演示录像。</figcaption>
</figure>

## 相关的技术脉络

这个问题我在博客里按子方向拆开写了几篇：

- [采样式路径规划](/posts/采样式路径规划/) —— RRT 系列的采样与扩展；
- [Ruckig 原理解析](/posts/Ruckig-原理解析/) —— 在线时间最优轨迹生成；
- [TOPP-RA 原理解析](/posts/TOPP-RA-原理解析/) —— 时间最优路径参数化；
- [MAPF 多智能体路径规划](/posts/MAPF多智能体路径规划/) —— 多机器人协同的路径规划。
