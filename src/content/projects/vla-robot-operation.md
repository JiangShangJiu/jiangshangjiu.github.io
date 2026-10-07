---
title: "VLA 机器人操作"
subtitle: "我在第一份工作中做的 VLA 真机操作实践。"
description: "我在第一份工作中做 VLA 策略推理、真机验证和问题定位，这里保留了当时的机械臂操作录像。"
heroImage: "/assets/img/projects/vla/cover.webp"
featureVideo:
  src: "/assets/videos/vla/loop.mp4"
  poster: "/assets/img/projects/vla/loop.webp"
  caption: "我当时保存的 VLA 真机操作片段。"
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

VLA 真机操作是我第一份工作的主要方向之一。我围绕视觉、语言到机器人动作的策略推理做真机验证和问题定位，下面是当时保存的四段演示录像。

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

## 我整理的相关笔记

我把与这部分工作相关的学习内容整理成了几篇笔记：

- [Pi 系列 VLA 原理解析](/posts/Pi系列VLA原理解析/)：模型架构与训练范式；
- [ACT 与 Diffusion Policy 原理解析](/posts/ACT与DiffusionPolicy原理解析/)：两类模仿学习方法；
- [具身智能数据获取的演进](/posts/具身智能数据获取的演进/)：从遥操作到跨本体数据聚合。
