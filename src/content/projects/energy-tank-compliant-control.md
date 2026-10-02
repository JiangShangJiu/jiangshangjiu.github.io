---
title: "基于能量罐的机械臂柔顺控制"
subtitle: "让机械臂在变阻抗、多任务与力控场景下都能安全地保持柔顺"
description: "针对变阻抗、零空间分层与力位混合控制在调节阻抗时会破坏系统稳定性的问题，用带障碍函数的能量罐约束系统能量，设计三类保稳定的柔顺控制器，并在 7-DOF Franka Emika Panda 上完成实机验证。"
heroImage: "/assets/img/projects/energy-tank/cover.webp"
featureVideo:
  src: "/assets/videos/energy-tank/loop.mp4"
  poster: "/assets/img/projects/energy-tank/loop.webp"
  caption: "自适应力位混合控制：曲面打磨任务中的两次人机交互（循环演示）。"
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

## 这份工作要解决什么

协作机器人要安全地完成接触式任务（打磨、装配、人机共融），**柔顺性**是关键指标之一。工程上通常用阻抗控制来实现柔顺，但有几个反复出现的坑：

- 机器人运行时**改变阻抗参数（尤其是调大刚度）**，会向系统注入能量，可能导致控制失稳；
- 想让机械臂**同时做多个任务**（比如一边跟踪轨迹、一边调整姿态），用零空间分层会把系统"被动性"破坏掉；
- **力控和位置控制**混在一起时，经典方法很难在保证力跟踪精度的同时保持柔顺。

这三件事本质上是同一个问题：**系统能量失去约束、不再稳定。** 我的硕士工作就是围绕这一点，用一套改造过的**能量罐**把三类控制器统一起来。

## 核心思路：给能量罐加一个"上限"

能量罐（Energy Tank）是一个虚拟储能部件——把系统多出来的能量先"存起来"或限量释放，让系统重新稳定。原来的能量罐有个缺陷：**储能可以无限增长**，涨到一定程度系统照样会失稳。

我的改法是**引入障碍函数**：储能越接近上限，输入功率就被压得越低，从而让系统能量始终被限制在设定的上限以内。这个改动不大，但它是后面三类控制器能同时保持稳定的共同基础。

## 我做了哪三块工作

围绕这一个能量罐，我设计并验证了三类柔顺控制器，每一类都对应上面提到的一个问题：

### 1. 基于能量罐的变阻抗控制

解决"变阻抗导致失稳"的问题：让能量罐在刚度变化时提供所需的能量，把系统重新拉回稳定。

实验里机械臂在 t = 48 s 收到刚度变化指令，y、z 方向刚度从 100 N/m 急剧增大到 1105 N/m：**不加能量罐时机械臂失稳、位置误差发散；加入后系统依然稳定，而且刚度增大后跟踪误差反而明显减小。**

<figure class="video-embed my-6">
  <div class="video-embed__frame">
    <video controls playsinline preload="metadata" poster="/assets/img/projects/energy-tank/variable-impedance.webp" title="基于能量罐的变阻抗控制实验">
      <source src="/assets/videos/energy-tank/variable-impedance.mp4" type="video/mp4" />
    </video>
  </div>
  <figcaption class="text-base-content/55 mt-2 text-center text-xs italic">变阻抗控制实验：刚度突变时系统仍保持稳定（实机录像）。</figcaption>
</figure>

障碍函数的约束效果在人机交互时最直观：人推机械臂时系统能量迅速上升，但**始终没有越过设定的上限**。

<figure class="video-embed my-6">
  <div class="video-embed__frame">
    <video controls playsinline preload="metadata" poster="/assets/img/projects/energy-tank/energy-tank-bound.webp" title="障碍函数对系统能量的约束">
      <source src="/assets/videos/energy-tank/energy-tank-bound.mp4" type="video/mp4" />
    </video>
  </div>
  <figcaption class="text-base-content/55 mt-2 text-center text-xs italic">能量约束：无障碍函数时能量持续增长，加入障碍函数后被限制在上界内。</figcaption>
</figure>

**推抽屉实验**是这套方法的一个实际应用：机械臂初始刚度低、推不动抽屉，需要时提高刚度完成推动。

<figure class="video-embed my-6">
  <div class="video-embed__frame">
    <video controls playsinline preload="metadata" poster="/assets/img/projects/energy-tank/push-drawer.webp" title="推抽屉实验">
      <source src="/assets/videos/energy-tank/push-drawer.mp4" type="video/mp4" />
    </video>
  </div>
  <figcaption class="text-base-content/55 mt-2 text-center text-xs italic">推抽屉实验：低刚度起步，按需提高刚度后完成推动。</figcaption>
</figure>

### 2. 基于能量罐的分层（零空间）柔顺控制

利用机械臂的**冗余自由度**，让它在完成主任务的同时，用零空间执行次任务。零空间分层能保证次任务不干扰主任务，但反过来主任务会影响次任务、破坏系统稳定。

我用能量罐监测并补偿这部分能量，再把变阻抗控制引入每一层，得到一种**每个优先级都能变阻抗、同时保持稳定**的分层柔顺控制器。对照实验显示：不用这套方法时系统总能量在起始阶段明显飞升，用本文方法后能量稳定在一个恒定值附近。

<figure class="video-embed my-6">
  <div class="video-embed__frame">
    <video controls playsinline preload="metadata" poster="/assets/img/projects/energy-tank/nullspace-hierarchical.webp" title="基于能量罐的分层柔顺控制实验">
      <source src="/assets/videos/energy-tank/nullspace-hierarchical.mp4" type="video/mp4" />
    </video>
  </div>
  <figcaption class="text-base-content/55 mt-2 text-center text-xs italic">分层（零空间）柔顺控制：多优先级任务同时执行，各层误差按优先级相继收敛。</figcaption>
</figure>

在 7-DOF Franka Emika Panda 上，我进一步做了**全身柔顺**——同时实现笛卡尔空间和关节空间的阻抗控制，并保证两者不冲突。操作者分别从笛卡尔空间、关节空间推机械臂，交互结束后系统都能回到稳定状态。

<figure class="video-embed my-6">
  <div class="video-embed__frame">
    <video controls playsinline preload="metadata" poster="/assets/img/projects/energy-tank/whole-body-impedance.webp" title="Franka Panda 全身柔顺控制实机实验">
      <source src="/assets/videos/energy-tank/whole-body-impedance.mp4" type="video/mp4" />
    </video>
  </div>
  <figcaption class="text-base-content/55 mt-2 text-center text-xs italic">全身柔顺：操作者分别从笛卡尔空间与关节空间与机械臂交互，位置误差与关节角误差均保持有界。</figcaption>
</figure>

### 3. 基于能量罐的自适应力位混合控制

解决"力控和位置控制难以兼顾柔顺"的问题。我把能量罐与分层任务模型结合，设计**自适应力位混合控制器**：机械臂根据自身状态自动调整刚度、并自动决定是否接入力控制器。

实验任务是**沿曲面执行轨迹跟踪 + 力打磨**。操作者两次与正在打磨的机械臂交互：交互时机械臂降低刚度、表现得更柔顺；交互结束后立即重新接入力控制器、恢复刚度，继续平稳打磨。同时，分层任务模型让机械臂的关节角误差保持在合理范围内（**不用该控制器时会逐渐增大直到奇异点**）。

<figure class="video-embed my-6">
  <div class="video-embed__frame">
    <video controls playsinline preload="metadata" poster="/assets/img/projects/energy-tank/adaptive-hybrid-force.webp" title="基于能量罐的自适应力位混合控制实验">
      <source src="/assets/videos/energy-tank/adaptive-hybrid-force.mp4" type="video/mp4" />
    </video>
  </div>
  <figcaption class="text-base-content/55 mt-2 text-center text-xs italic">自适应力位混合：曲面打磨过程中的两次人机交互，交互时降低刚度，结束后恢复力控与刚度。</figcaption>
</figure>

## 平台与实现

- **机器人**：7-DOF Franka Emika Panda；
- **软件**：ROS 环境下用 C++ 实现，通过 `libfranka` / `frankaros` 与机械臂通信；
- 实验前将机械臂回到初始位形，以初始笛卡尔 / 关节位置作为期望平衡点。

## 结论

1. 用障碍函数设计的能量罐，**严格约束了系统能量的上界**；
2. **变阻抗控制器**解决了变阻抗时系统失稳的问题；
3. **分层柔顺控制器**在保证任务优先级的同时实现变阻抗，恢复了全身柔顺的稳定性；
4. **自适应力位混合控制器**提高了力位混合任务中的柔顺性与安全性。

## 局限与后续方向

- 控制器依赖较精确的模型，而精确模型难以获取——后续可用自适应控制或神经网络在线补偿；
- 变阻抗控制只给出"可以变阻抗"的框架，阻抗参数如何变化未定——可结合人机协作时的人体生理信号；
- 自适应力位混合需要较精确的曲面方程——可引入视觉伺服提高自主性。
