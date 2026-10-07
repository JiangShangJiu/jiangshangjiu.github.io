---
title: "基于能量罐的机械臂柔顺控制"
subtitle: "我用能量罐处理变阻抗、零空间分层和力位混合控制中的稳定性问题。"
description: "我的硕士研究：设计带障碍函数的能量罐和三类柔顺控制器，并在 Franka Panda 上完成实机实验。"
heroImage: "/assets/img/projects/energy-tank/cover.webp"
featureVideo:
  src: "/assets/videos/energy-tank/loop.mp4"
  poster: "/assets/img/projects/energy-tank/loop.webp"
  caption: "自适应力位混合控制实机录像：曲面打磨中的两次人机交互。"
order: 2
role: "独立完成（理论推导 / 控制器设计 / 实机实验）"
period: "2021 – 2024"
status: "硕士学位论文 · 2024.05 答辩"
metrics:
  - "变阻抗 · 分层零空间 · 自适应力位混合"
  - "7-DOF Franka Emika Panda 实机验证"
  - "同一套能量罐框架贯穿三类控制器"
stack:
  - "C++"
  - "ROS"
  - "libfranka"
  - "柔顺控制"
  - "阻抗控制"
highlights:
  - value: "100 → 1105 N/m"
    label: "变阻抗实验中刚度突变：无能量罐时失稳，加入后保持稳定"
  - value: "能量不再无界增长"
    label: "障碍函数把系统能量严格约束在上界内"
  - value: "3 类控制器"
    label: "变阻抗、分层柔顺、自适应力位混合"
  - value: "全身柔顺"
    label: "在 Franka Panda 上同时实现笛卡尔空间与关节空间阻抗"
tags:
  - "柔顺控制"
  - "无源控制"
  - "能量罐"
  - "阻抗控制"
  - "力位混合控制"
  - "冗余机械臂"
buttons:
  - label: "相关笔记：阻抗控制与力控"
    url: "/posts/阻抗控制与力控/"
    icon: "lucide:book-open"
    primary: true
  - label: "相关笔记：阻抗 / 导纳 / 柔顺的区别"
    url: "/posts/阻抗-导纳-柔顺与MIT控制的区别/"
    icon: "lucide:book-open"
---

我在硕士期间研究机械臂的柔顺控制，主要处理三个问题：运行中改变刚度、多优先级任务同时执行，以及力控和位置控制之间的切换。我用带障碍函数的能量罐设计了三类控制器，并在 7-DOF Franka Emika Panda 上做了实机实验。

## 变阻抗：刚度突变后继续稳定跟踪

这段实验里，我在 t = 48 s 给机械臂下发刚度变化指令，y、z 方向刚度从 100 N/m 增大到 1105 N/m。对照结果是：不加能量罐时，机械臂失稳、位置误差发散；加入后仍保持稳定，刚度增大后的跟踪误差也明显减小。

<figure class="video-embed my-6">
  <div class="video-embed__frame">
    <video controls playsinline preload="metadata" poster="/assets/img/projects/energy-tank/variable-impedance.webp" title="基于能量罐的变阻抗控制实验">
      <source src="/assets/videos/energy-tank/variable-impedance.mp4" type="video/mp4" />
    </video>
  </div>
  <figcaption class="text-base-content/55 mt-2 text-center text-xs italic">变阻抗控制实验：刚度突变时系统仍保持稳定（实机录像）。</figcaption>
</figure>

改变阻抗参数，尤其是提高刚度，会向系统注入能量。我用能量罐管理这部分能量，在刚度变化时提供所需的能量。原有方法的储能可能持续增长，因此我在能量罐中引入了**障碍函数**：储能越接近上限，允许输入的功率越小，让系统能量保持在设定的上界内。

人机交互实验能直接看到这个约束。人推机械臂时，系统能量迅速上升，但没有越过设定上限；没有障碍函数的对照中，能量则持续增长。

<figure class="video-embed my-6">
  <div class="video-embed__frame">
    <video controls playsinline preload="metadata" poster="/assets/img/projects/energy-tank/energy-tank-bound.webp" title="障碍函数对系统能量的约束">
      <source src="/assets/videos/energy-tank/energy-tank-bound.mp4" type="video/mp4" />
    </video>
  </div>
  <figcaption class="text-base-content/55 mt-2 text-center text-xs italic">能量约束：无障碍函数时能量持续增长，加入障碍函数后被限制在上界内。</figcaption>
</figure>

我还做了推抽屉实验。机械臂以较低刚度起步，最初推不动抽屉，再按需要提高刚度完成推动。

<figure class="video-embed my-6">
  <div class="video-embed__frame">
    <video controls playsinline preload="metadata" poster="/assets/img/projects/energy-tank/push-drawer.webp" title="推抽屉实验">
      <source src="/assets/videos/energy-tank/push-drawer.mp4" type="video/mp4" />
    </video>
  </div>
  <figcaption class="text-base-content/55 mt-2 text-center text-xs italic">推抽屉实验：低刚度起步，按需提高刚度后完成推动。</figcaption>
</figure>

## 零空间分层：同时处理主任务和次任务

我利用冗余自由度，在主任务之外安排零空间次任务。分层可以让次任务不干扰主任务，但主任务对次任务的影响仍可能破坏稳定性。我用能量罐监测并补偿这部分能量，再把变阻抗控制引入每个优先级。

对照实验中，不用这套方法时，系统总能量在起始阶段明显上升；加入后，能量保持在一个恒定值附近。各层可以改变阻抗，任务误差按优先级相继收敛。

<figure class="video-embed my-6">
  <div class="video-embed__frame">
    <video controls playsinline preload="metadata" poster="/assets/img/projects/energy-tank/nullspace-hierarchical.webp" title="基于能量罐的分层柔顺控制实验">
      <source src="/assets/videos/energy-tank/nullspace-hierarchical.mp4" type="video/mp4" />
    </video>
  </div>
  <figcaption class="text-base-content/55 mt-2 text-center text-xs italic">分层（零空间）柔顺控制：多优先级任务同时执行，各层误差按优先级相继收敛。</figcaption>
</figure>

在 Panda 上，我进一步实现了**全身柔顺**，同时使用笛卡尔空间和关节空间阻抗。操作者分别从两个空间推动机械臂，两种控制没有发生冲突；交互结束后，系统都能回到稳定状态，位置误差和关节角误差保持有界。

<figure class="video-embed my-6">
  <div class="video-embed__frame">
    <video controls playsinline preload="metadata" poster="/assets/img/projects/energy-tank/whole-body-impedance.webp" title="Franka Panda 全身柔顺控制实机实验">
      <source src="/assets/videos/energy-tank/whole-body-impedance.mp4" type="video/mp4" />
    </video>
  </div>
  <figcaption class="text-base-content/55 mt-2 text-center text-xs italic">全身柔顺：操作者分别从笛卡尔空间与关节空间与机械臂交互，位置误差与关节角误差均保持有界。</figcaption>
</figure>

## 力位混合：交互结束后继续打磨

我把能量罐与分层任务模型结合，设计了自适应力位混合控制器。机械臂根据自身状态调整刚度，并决定是否接入力控制器，以兼顾力跟踪和柔顺性。

实验任务是沿曲面跟踪轨迹并进行力打磨。操作者两次与正在打磨的机械臂交互：接触时，机械臂降低刚度；交互结束后，重新接入力控制器、恢复刚度，继续打磨。分层任务模型也把关节角误差维持在合理范围内；不用该控制器的对照中，误差会逐渐增大，直到遇到奇异点。

<figure class="video-embed my-6">
  <div class="video-embed__frame">
    <video controls playsinline preload="metadata" poster="/assets/img/projects/energy-tank/adaptive-hybrid-force.webp" title="基于能量罐的自适应力位混合控制实验">
      <source src="/assets/videos/energy-tank/adaptive-hybrid-force.mp4" type="video/mp4" />
    </video>
  </div>
  <figcaption class="text-base-content/55 mt-2 text-center text-xs italic">自适应力位混合：曲面打磨过程中的两次人机交互，交互时降低刚度，结束后恢复力控与刚度。</figcaption>
</figure>

## 平台与实现

我在 ROS 环境中用 C++ 实现控制器，通过 `libfranka` / `frankaros` 与 7-DOF Franka Emika Panda 通信。每次实验前先回到初始位形，再以初始笛卡尔位置和关节位置作为期望平衡点。

## 还需要继续处理的问题

- 控制器依赖较精确的模型。后续可以考虑自适应控制或神经网络在线补偿模型误差。
- 变阻抗框架允许参数变化，但还没有确定阻抗参数应怎样变化；我希望进一步结合人机协作中的人体生理信号。
- 自适应力位混合需要较精确的曲面方程，后续可以通过视觉伺服提高自主性。
