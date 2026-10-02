---
title: "VLA 机器人操作"
subtitle: "视觉-语言-动作（VLA）模型在真机机械臂上的实践"
description: "第一份工作期间的主要方向之一：围绕视觉-语言-动作（VLA）模型在真机机械臂上开展工作，覆盖策略推理、真机验证与问题定位，并沉淀为博客中的 VLA 与模仿学习系列笔记。"
heroImage: "/assets/img/projects/vla/cover.webp"
featureVideo:
  src: "/assets/videos/vla/loop.mp4"
  poster: "/assets/img/projects/vla/loop.webp"
  caption: "VLA 模型在真机机械臂上的操作演示（循环播放）。"
order: 3
role: "第一份工作"
status: "真机演示录像"
metrics:
  - "VLA 真机演示"
  - "具身智能 · 模仿学习"
stack:
  - "Python"
  - "PyTorch"
  - "ROS"
  - "VLA"
  - "模仿学习"
tags:
  - "VLA"
  - "模仿学习"
  - "具身智能"
buttons:
  - label: "相关笔记：Pi 系列 VLA 原理"
    url: "/posts/Pi系列VLA原理解析/"
    icon: "lucide:book-open"
    primary: true
  - label: "相关笔记：ACT 与 Diffusion Policy"
    url: "/posts/ACT与DiffusionPolicy原理解析/"
    icon: "lucide:book-open"
---

## 背景

视觉-语言-动作（VLA）模型把自然语言指令与视觉观测直接映射为机器人动作，是具身智能当前最重要的技术路线之一。它把"感知—语言—控制"放进同一个模型中，让机器人能跟随语言指令完成操作，而不必为每个任务单独写控制程序。

这一段是我第一份工作期间的主要方向。下面是我当时保留下来的真机演示录像。

## 真机演示

<figure class="video-embed my-6">
  <div class="video-embed__frame">
    <video controls playsinline preload="metadata" poster="/assets/img/projects/vla/vla-demo-1.webp" title="VLA 真机演示 1">
      <source src="/assets/videos/vla/vla-demo-1.mp4" type="video/mp4" />
    </video>
  </div>
  <figcaption class="text-base-content/55 mt-2 text-center text-xs italic">真机演示录像 1。</figcaption>
</figure>

<figure class="video-embed my-6">
  <div class="video-embed__frame">
    <video controls playsinline preload="metadata" poster="/assets/img/projects/vla/vla-demo-2.webp" title="VLA 真机演示 2">
      <source src="/assets/videos/vla/vla-demo-2.mp4" type="video/mp4" />
    </video>
  </div>
  <figcaption class="text-base-content/55 mt-2 text-center text-xs italic">真机演示录像 2。</figcaption>
</figure>

<figure class="video-embed my-6">
  <div class="video-embed__frame">
    <video controls playsinline preload="metadata" poster="/assets/img/projects/vla/vla-demo-3.webp" title="VLA 真机演示 3">
      <source src="/assets/videos/vla/vla-demo-3.mp4" type="video/mp4" />
    </video>
  </div>
  <figcaption class="text-base-content/55 mt-2 text-center text-xs italic">真机演示录像 3。</figcaption>
</figure>

<figure class="video-embed my-6">
  <div class="video-embed__frame">
    <video controls playsinline preload="metadata" poster="/assets/img/projects/vla/vla-demo-4.webp" title="VLA 真机演示 4">
      <source src="/assets/videos/vla/vla-demo-4.mp4" type="video/mp4" />
    </video>
  </div>
  <figcaption class="text-base-content/55 mt-2 text-center text-xs italic">真机演示录像 4。</figcaption>
</figure>

## 相关的技术脉络

围绕这条路线的学习笔记，我整理成了博客里的一个系列：

- [Pi 系列 VLA 原理解析](/posts/Pi系列VLA原理解析/) —— VLA 机器人基础模型的架构与训练范式；
- [ACT 与 Diffusion Policy 原理解析](/posts/ACT与DiffusionPolicy原理解析/) —— 模仿学习的两个代表性工作；
- [具身智能数据获取的演进](/posts/具身智能数据获取的演进/) —— 从遥操作到跨本体数据聚合的数据飞轮。
