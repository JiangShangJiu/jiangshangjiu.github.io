---
title: "机械臂逆运动学：结构决定解的形状"
subtitle: "同一个末端位姿，四台机械臂给的是有限个解、一条解圆，还是必须先给种子再抛光"
description: "在 MuJoCo 中对 UR5e、UFACTORY Lite 6、KUKA iiwa 14、Franka Panda 做逆运动学对照：从结构分类出发，说明解集为什么是有限个点、一条圆，或需要种子加阻尼迭代，并用可复现的离屏渲染把每条结论画出来。"
heroImage: "/assets/img/projects/inverse-kinematics/cover.webp"
featureVideo:
  src: "/assets/videos/inverse-kinematics/cover.mp4"
  poster: "/assets/img/projects/inverse-kinematics/cover-first.webp"
  caption: "末端标记不动，手臂沿肘部圆走完一整圈，迭代次数始终为 0（循环播放）。"
order: 5
role: "独立完成（求解 / 渲染 / 文档）"
period: "2026.10"
status: "展示项目 · 可复现"
metrics:
  - "四台机械臂结构对照"
  - "闭式解 · 臂型角 · 阻尼迭代"
  - "MuJoCo 离屏渲染"
stack:
  - "Python"
  - "MuJoCo"
  - "NumPy"
  - "逆运动学"
  - "闭式解"
highlights:
  - value: "4 台"
    label: "UR5e / Lite 6 / iiwa 14 / Panda，同一套求解接口"
  - value: "0 次迭代"
    label: "满足结构的闭式解：UR5e、Lite 6、iiwa 直接写出整族"
  - value: "10⁻¹⁵ m"
    label: "闭式解残差量级，与数值解同批对照"
  - value: "8 支"
    label: "UR5e / Lite 6 在该目标下真实存在的全部分支"
  - value: "1 条圆"
    label: "iiwa 的冗余自运动：解集是连续的一维圆"
buttons:
  - label: "相关笔记：逆运动学原理"
    url: "/posts/逆运动学原理/"
    icon: "lucide:book-open"
    primary: true
  - label: "相关笔记：机械臂运动学"
    url: "/posts/机械臂运动学/"
    icon: "lucide:book-open"
tags:
  - "逆运动学"
  - "运动学"
  - "MuJoCo"
  - "闭式解"
math: true
---

同一个末端位姿，在不同机械臂上意味着不同的事：UR5e 有 8 支孤立解，Lite 6 也有 8 支，iiwa 14 的解集是一条连续的圆，而 Franka Panda 只能先给种子再迭代抛光。

这份展示用四台机械臂（UR5e、UFACTORY Lite 6、KUKA LBR iiwa 14、Franka Emika Panda）把这件事画出来。画面全部从 MuJoCo 里的真实模型离屏渲染，同一目标的定格、动画、徽章和数字来自同一次求解。看的时候只需要记住一件事：**每张图里的琥珀色球加三根坐标轴，是同一个「目标位姿」标记**——球说明位置到了，坐标轴说明姿态也到了。

<figure class="video-embed my-6">
  <div class="video-embed__frame">
    <video controls autoplay muted loop playsinline preload="metadata" poster="/assets/img/projects/inverse-kinematics/cover-first.webp" title="末端停着，手臂沿肘部圆走完一圈">
      <source src="/assets/videos/inverse-kinematics/cover.mp4" type="video/mp4" />
    </video>
  </div>
  <figcaption class="text-base-content/55 mt-2 text-center text-xs italic">封面循环：末端标记不动，手臂沿肘部圆走完一整圈，左上角的迭代次数始终为 0。</figcaption>
</figure>

## 1. 末端停着，手臂沿肘部圆走完一圈，迭代次数一直是 0

先看琥珀色的末端标记：它一动不动。再看手臂：它沿着那条蓝色的肘部圆走完一整圈，蓝色小段是随臂型角 $\psi$ 走动的刻度。左上角两个数在整个循环里都不变。

**末端停着，手臂沿肘部圆走完一圈，迭代次数一直是 0。**

## 2. 方法跟着结构走——能拆开就一次写完，拆不开就先写种子再补

![结构四联](/assets/img/projects/inverse-kinematics/structure-quad.webp)

先看这张图例，后面每张结构图都沿用同一套颜色和徽章：

![图例](/assets/img/projects/inverse-kinematics/legend.webp)

再看每台腕部标出的那一段偏移，以及下面三行：几何条件、因此采用的解法、解集长什么样。UR5e 靠 J2–J4 三轴平行、Lite 6 靠腕三轴汇交，两条都是 Pieper 条件，各自把问题拆开；iiwa 肩腕两个球，解是一条圆；Panda 只满足肩那一个球，腕差着 0.088 m，所以只能先给种子再补。

**UR 靠平行轴拆开，Lite 6 靠球腕拆开；iiwa 的腕也是球，但多了一维冗余，所以解是一条圆，不是有限个点。**

## 3. 肩和腕都是球，末端位姿定了，剩下的自由就只是肘在这个圆上的位置

![iiwa 肘部几何](/assets/img/projects/inverse-kinematics/iiwa-geometry.webp)

先找 $S$（肩心）和 $W$（腕心）两个红蓝小球，再看穿过它们的那条直线：肘只能落在垂直于这条直线、半径由两段臂长决定的那个圆上。$E(\psi)$ 就是肘点。

![iiwa 四个解](/assets/img/projects/inverse-kinematics/iiwa-four-solutions.webp)

四格是同一个目标、四个不同的 $\psi$，每一格徽章都是 `精确`、迭代印成 0，残差印到 $10^{-15}\,\mathrm{m}$ 量级。它们是同一个连续圆上的四个采样，不是四段不同的运动。

关于采样和闭式：任意一个 $\psi$ 代进去都是精确解；把 $[0,2\pi)$ 切成网格只影响能不能正好找回某一个事先给定的位形，不影响精度。

上面封面那条循环就是这台、这个目标的同一次求解。

## 4. 六轴、有一组平行轴，所以解是数得清的几支

![UR5e 平面几何](/assets/img/projects/inverse-kinematics/ur5e-geometry.webp)

把 J2–J4 那三根平行轴收成平面三连杆：橙色三角形是现在这一支，紫色是它关于 $S$–$W$ 连线的镜像。余弦定理一步就把肘上、肘下两个三角形同时给出来。

![UR5e 全部分支](/assets/img/projects/inverse-kinematics/ur5e-branches.webp)

这是这个目标真实存在的全部分支——八支，按真实解出的个数摆，没有凑数。每支的徽章都是 `精确`、迭代 0；名字里左中右分别是肘、肩、腕选了哪一侧。

![UR5e 数值对照](/assets/img/projects/inverse-kinematics/ur5e-numerical.webp)

下面这条是小字号的对照：同一个目标，阻尼最小二乘从六个随机初值出发，全都贴回上面已经列过的某一支，徽章是 `收敛`。主角仍是一次列全的那些分支。

**六轴、有一组平行轴，所以解是数得清的几支，不存在末端不动还能继续摆的那一维。**

## 5. 腕的三根轴交在一点上，位置由手臂决定，姿态由腕决定

![腕部对照](/assets/img/projects/inverse-kinematics/wrist-comparison.webp)

三格是同一套画法下的腕部特写。Lite 6 的三根轴交在一个点（偏移 0），UR5e 的腕心到最后一轴约 0.10 m，Panda 约 0.088 m。橙色小段就是那段偏移的长度。

![Lite 6 解耦](/assets/img/projects/inverse-kinematics/lite6-decoupling.webp)

末端位姿定了以后，腕心 $p_w = p - d_6 R\hat z$ 落在前三个关节够得着的地方，姿态留给腕的三根轴。

![Lite 6 全部分支](/assets/img/projects/inverse-kinematics/lite6-branches.webp)

同一个末端标记下，这个目标真实存在的八支都摆在这里，每支 `精确`、迭代 0。它是六轴，分支之间用并排，不做连续摆动。

**腕的三根轴交在一点上，位置由手臂决定，姿态由腕决定，所以这些构型可以一次列全。**

## 6. 腕差着一截，闭式几何负责落到正确分支旁边，剩下的交给阻尼迭代

![Panda 与 iiwa 腕部](/assets/img/projects/inverse-kinematics/panda-wrist.webp)

左边是 iiwa 的腕：三轴交于一点，对应长度是 0。右边是 Panda 的腕：肩三轴仍交于一点，但腕心到最后一轴有一段台阶式的偏移，长度 0.088 m。这是两台唯一的差别。

![Panda 种子与抛光](/assets/img/projects/inverse-kinematics/panda-polish.webp)

半透明的手臂停在几何种子上，末端标记和种子的末端之间有一条肉眼可见的缝；实心手臂是抛光之后，末端与标记重合。

![Panda 抛光残差](/assets/img/projects/inverse-kinematics/panda-polish-curve.webp)

旁边这条很短的残差曲线只有抛光那几步，从「有缝」落进容差内。

![Panda 全部分支](/assets/img/projects/inverse-kinematics/panda-branches.webp)

这个目标找到的分支都硬切并排在这里。顶到关节限位的那两支留在画面里并标成 `失败`，让人看见「列出来」和「选哪一支」是两件事。

**腕差着一截，位置和姿态拆不干净，闭式几何负责落到正确分支旁边，剩下的交给阻尼迭代。**

## 7. 末端要走直线，就沿着这条直线逐点解；关节自己匀速插过去，末端是弯的

前面几节的末端标记是钉死的。这里反过来：标记要动，而且必须贴着一条直线。四台用同一套走法，运动过程中每一段都用上一点的关节解做热启动。

**UR5e**

<figure class="video-embed my-6">
  <div class="video-embed__frame">
    <video controls muted loop playsinline preload="metadata" poster="/assets/img/projects/inverse-kinematics/line-ur5e.webp" title="UR5e 直线跟踪">
      <source src="/assets/videos/inverse-kinematics/line-ur5e.mp4" type="video/mp4" />
    </video>
  </div>
  <figcaption class="text-base-content/55 mt-2 text-center text-xs italic">UR5e：末端沿要求的直线逐点解。</figcaption>
</figure>

**Lite 6**

<figure class="video-embed my-6">
  <div class="video-embed__frame">
    <video controls muted loop playsinline preload="metadata" poster="/assets/img/projects/inverse-kinematics/line-lite6.webp" title="Lite 6 直线跟踪">
      <source src="/assets/videos/inverse-kinematics/line-lite6.mp4" type="video/mp4" />
    </video>
  </div>
  <figcaption class="text-base-content/55 mt-2 text-center text-xs italic">UFACTORY Lite 6：末端沿要求的直线逐点解。</figcaption>
</figure>

**iiwa 14**

<figure class="video-embed my-6">
  <div class="video-embed__frame">
    <video controls muted loop playsinline preload="metadata" poster="/assets/img/projects/inverse-kinematics/line-iiwa14.webp" title="iiwa 14 直线跟踪">
      <source src="/assets/videos/inverse-kinematics/line-iiwa14.mp4" type="video/mp4" />
    </video>
  </div>
  <figcaption class="text-base-content/55 mt-2 text-center text-xs italic">KUKA iiwa 14：末端沿要求的直线逐点解。</figcaption>
</figure>

**Panda**

<figure class="video-embed my-6">
  <div class="video-embed__frame">
    <video controls muted loop playsinline preload="metadata" poster="/assets/img/projects/inverse-kinematics/line-panda.webp" title="Panda 直线跟踪">
      <source src="/assets/videos/inverse-kinematics/line-panda.mp4" type="video/mp4" />
    </video>
  </div>
  <figcaption class="text-base-content/55 mt-2 text-center text-xs italic">Franka Panda：末端沿要求的直线逐点解。</figcaption>
</figure>

![四台直线对照](/assets/img/projects/inverse-kinematics/line-quad.webp)

每格里橙色直线是要求的路径，浅蓝色是「同一起点终点、只在关节角之间匀速插值」走出来的一条弯线。画面上印的是末端到直线的距离和整段最大值，最大值停在这一步逆解的容差量级（四台分别是 $6\times10^{-16}$、$1\times10^{-6}$、$3\times10^{-13}$、$3\times10^{-9}\,\mathrm{m}$）。

![换支的坏例子](/assets/img/projects/inverse-kinematics/line-bad-branch.webp)

这是 Lite 6 的错误示范：末端仍贴在直线上，但中途换了一支，手臂猛地翻过去。**末端对了，这段运动不能用。**

**末端要走直线，就沿着这条直线逐点解；关节自己匀速插过去，末端是弯的。**

## 8. 冗余补得了肩和腕的奇异，补不了肘被拉直

![伸直时的肘部圆与三种迭代](/assets/img/projects/inverse-kinematics/singularity.webp)

左边是同一个目标，但腕心几乎顶到最远：肘部圆半径 $\rho$ 收成一个点。右边是三条曲线，同一起点、同一目标。伪逆的步子被放大，转置停滞（末残差 $9\times10^{-3}$，标 `失败`），阻尼最小二乘的步子始终有界、落进容差（$8\times10^{-12}$）。左下角的小直方图说明：伸直是随机位形里 $\sigma_{\min}$ 变小的一个主要来源。

**冗余补得了肩和腕的奇异，补不了肘被拉直；这时候靠的是阻尼，不是再换一个闭式公式。**

## 9. 一张取舍表

| 机器人 | 解集形状 | 为什么是这种形状 | 迭代 | 残差量级 | 一次返回 |
|---|---|---|---|---|---|
| UR5e | 有限个点（本例 8 支） | J2–J4 三轴平行，满足 Pieper；平面三连杆一次写出 | 0 | $10^{-16}\,\mathrm{m}$ | 整族 |
| Lite 6 | 有限个点（本例 8 支） | J4–J6 交于腕心、偏移 0，满足 Pieper；球腕解耦 | 0 | $10^{-6}\,\mathrm{m}$ | 整族 |
| iiwa 14 | 一条圆 | 肩三轴、腕三轴各汇交，7 轴多一维冗余 | 0 | $10^{-14}\,\mathrm{m}$ | 整族（按 $\psi$ 采样） |
| Panda | 有限个分支，每支补一小步 | 只有肩三轴汇交，腕偏移 0.088 m，位置姿态不严格解耦 | 几步 | $10^{-5}\,\mathrm{m}$ | 一支（种子 + 抛光） |

- 结构允许拆开、又需要全部分支时，用闭式：UR5e、Lite 6、iiwa 走的就是这条路。
- 只要当前附近的一支时，用阻尼最小二乘：Panda 的抛光、以及任何一台的直线跟踪都是这么用的。
- 纯数值的成功率写在「初值个数」上（同一次实验，30 个随机目标，DLS）：

| 初值个数 | UR5e | Lite 6 | iiwa 14 | Panda |
|---|---|---|---|---|
| 1 个 | 40% | 67% | 77% | 67% |
| 5 个 | 93% | 100% | 100% | 100% |
| 20 个 | 100% | 100% | 100% | 100% |

**要整族解用几何，要附近一支用阻尼迭代，两者经常一起用。**

## 10. 复现

模型来自 [`mujoco_menagerie`](https://github.com/google-deepmind/mujoco_menagerie) 的四台机械臂 XML（`universal_robots_ur5e`、`ufactory_lite6`、`kuka_iiwa_14`、`franka_emika_panda`），几何常量全部从模型在 $q=0$ 处实测，没有手写连杆参数。原理推导与子问题分类整理在配套文档 `docs/ik_survey.md` 与 `docs/solver_bench.md`，文中用到的球腕解耦代数在[逆运动学原理](/posts/逆运动学原理/)这篇笔记里完整展开。

在仓库根目录重新渲染上面所有画面：

```bash
python -m scripts.showcase.build        # 全部
python -m scripts.showcase.build 1 3 7  # 只做封面、iiwa、直线运动
```

渲染脚本在 `scripts/showcase/`：`scene.py` 负责离屏渲染与共用相机，`style.py` 负责字体 / 徽章 / 拼图，`solvers.py` 是统一求解入口，`common.py` 做结构分类与目标挑选，各 `ex_*.py` 对应一个展项。本站展示用的图表与短片由 `scripts/sync_ik_showcase_media.py` 从该目录同步而来。
