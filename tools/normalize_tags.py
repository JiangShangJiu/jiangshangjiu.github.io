#!/usr/bin/env python3
"""统一博客标签词表。

背景
----
早期写文章时，每篇的 4 个标签里通常只有 1~2 个是"主题"，其余是文章内部的小节名
（例如某篇运动学文章的 雅可比 / 奇异性 / DH参数）。结果是 31 篇文章产生了 117 个
标签，其中 113 个只对应一篇文章。这会带来两个问题：

1. 侧栏「热门标签」按出现次数取前 10，次数相同时按字母序取，
   于是 `ACT` / `AX=XB` / `CBiRRT` / `CBS` / `CiA402` 这类缩写被顶上来，
   第一眼看着像噪音。
2. `/tags/` 页面里绝大多数标签点进去只有一篇文章，导航价值接近零；
   而"相关文章"靠标签重合度计算，标签越碎，推荐越不准。

因此这里定义一份受控词表：标签表达**可复用的研究方向或技术**，
不表达某一篇文章里的小节。文章内的具体术语（雅可比、SISQP、CiA402……）
继续写在正文里，全文检索仍然能找到。

用法
----
    # 检查现有文章是否有词表之外的标签（新文章写完跑一下）
    python3 tools/normalize_tags.py --check

    # 重新套用词表（幂等，可重复执行）
    python3 tools/normalize_tags.py --apply

新增标签前先想一下：它会不会出现在第二篇文章上？不会的话，就别加。
"""

import argparse
import io
import re
import sys
from pathlib import Path

# ---------------------------------------------------------------------------
# 受控词表：按站点的一级分类组织，便于对照
# ---------------------------------------------------------------------------
VOCABULARY = {
    # 机器人 / 建模与标定
    "机器人建模": "运动学、动力学与模型表示（DH / MDH / PoE 等）的整体建模",
    "运动学": "正运动学、雅可比与奇异位形",
    "逆运动学": "数值与解析逆解",
    "动力学": "运动方程、牛顿-欧拉与拉格朗日方法",
    "参数辨识": "基参数、回归矩阵与激励轨迹",
    "标定": "运动学标定与手眼标定",
    # 机器人 / 控制
    "力控": "力/力矩控制与力位混合",
    "阻抗控制": "阻抗控制与接触稳定性",
    "导纳控制": "导纳控制与 MIT 控制器的执行器基础",
    "无源性": "基于无源性的稳定性分析",
    "视觉伺服": "IBVS / PBVS 与视觉闭环",
    # 机器人 / 运动规划
    "运动规划": "路径与轨迹规划总览",
    "轨迹生成": "在线轨迹生成与平滑",
    "时间最优": "时间最优路径参数化",
    "采样规划": "RRT 类采样式规划",
    "路径优化": "路径参数化、平滑与可行性优化",
    "多智能体": "多机协同与 MAPF",
    # 机器人 / 状态估计
    "状态估计": "滤波器与估计器设计",
    "卡尔曼滤波": "KF / EKF / ESKF",
    "传感器融合": "多传感器信息融合",
    "IMU": "惯性测量单元与姿态估计",
    # 机器人 / 关节与驱动
    "关节与驱动": "关节模组、减速器与传动",
    "电机控制": "FOC 与电流环",
    "伺服控制": "伺服环路、整定与共振抑制",
    # 机器人 / 双臂协同
    "双臂": "双臂与多臂协同",
    "全身控制": "全身控制与分层优化",
    # 机器人 / 系统与安全
    "实时系统": "实时内核与确定性",
    "EtherCAT": "工业总线与从站协议",
    "ROS2": "ROS2 通信与中间件",
    "协作安全": "人机协作安全与标准",
    "碰撞检测": "碰撞检测与外力观测",
    # 具身智能
    "强化学习": "强化学习与策略学习",
    "模仿学习": "模仿学习、示教与策略克隆",
    "生成式策略": "扩散与流匹配等生成式动作建模",
    "VLA": "视觉-语言-动作模型",
    "sim-to-real": "仿真到现实的迁移",
    "足式机器人": "腿足机器人与运动控制",
    "数据采集": "机器人数据的采集与治理",
    "遥操作": "遥操作与示教采集",
    # 编程
    "C++": "C++ 语言",
    "语言特性": "语言语义、对象模型与内存安全",
    "并发编程": "线程、同步与并发模型",
    "内存模型": "内存序与原子操作",
    "无锁编程": "无锁数据结构与实现",
}

# ---------------------------------------------------------------------------
# 一次性迁移映射：旧标签 -> 词表标签。
# 值为 None 表示该标签只是某篇文章的小节名，直接丢弃。
# ---------------------------------------------------------------------------
MIGRATION = {
    # 建模与标定
    "DH参数": "运动学",
    "雅可比": "运动学",
    "奇异性": "运动学",
    "球腕": "逆运动学",
    "阻尼最小二乘": "逆运动学",
    "分支选择": "逆运动学",
    "拉格朗日方程": "动力学",
    "计算力矩": "动力学",
    "手眼标定": "标定",
    "AX=XB": "标定",
    "绝对精度": "标定",
    # 控制
    "力传感器": "力控",
    "阻尼设计": "力控",
    "显式力控": "力控",
    "力位混合控制": "力控",
    "MIT控制器": "导纳控制",
    "IBVS": "视觉伺服",
    "PBVS": "视觉伺服",
    "交互矩阵": "视觉伺服",
    # 运动规划
    "jerk": "轨迹生成",
    "在线规划": "运动规划",
    "可达性分析": "时间最优",
    "路径参数化": "路径优化",
    "RRT": "采样规划",
    "构型空间": "采样规划",
    "路径平滑": "路径优化",
    "MAPF": "多智能体",
    "CBS": "多智能体",
    "对称性破除": "多智能体",
    # 状态估计
    "EKF": "卡尔曼滤波",
    "ESKF": "卡尔曼滤波",
    "贝叶斯滤波": "卡尔曼滤波",
    "姿态估计": "IMU",
    "四元数": "IMU",
    # 关节与驱动
    "FOC": "电机控制",
    "SVPWM": "电机控制",
    "PMSM": "电机控制",
    "电流环": "电机控制",
    "关节模组": "关节与驱动",
    "谐波减速器": "关节与驱动",
    "准直驱": "关节与驱动",
    "编码器": "关节与驱动",
    "伺服整定": "伺服控制",
    "机械共振": "伺服控制",
    "双质量模型": "伺服控制",
    "输入整形": "伺服控制",
    # 双臂
    "双臂机器人": "双臂",
    "抓取矩阵": "力控",
    "内力": "力控",
    "物体级阻抗": "阻抗控制",
    "CBiRRT": "采样规划",
    "约束流形": "采样规划",
    "投影算子": "运动规划",
    "QP控制": "全身控制",
    "分层优化": "全身控制",
    # 系统与安全
    "PREEMPT_RT": "实时系统",
    "实时Linux": "实时系统",
    "CiA402": "EtherCAT",
    "DDS": "ROS2",
    "QoS": "ROS2",
    "ros2_control": "ROS2",
    "ISO/TS 15066": "协作安全",
    "协作机器人": "协作安全",
    "动量观测器": "碰撞检测",
    # 具身智能
    "机器人基础模型": "VLA",
    "流匹配": "生成式策略",
    "动作分块": "模仿学习",
    "ACT": "模仿学习",
    "Diffusion Policy": "生成式策略",
    "域随机化": "sim-to-real",
    "跨本体": "数据采集",
    "数据飞轮": "数据采集",
    # 编程
    "类型转换": "语言特性",
    "内存安全": "语言特性",
    "多态": "语言特性",
    "虚函数": "语言特性",
    "vtable": "语言特性",
    "构造函数": "语言特性",
    "拷贝语义": "语言特性",
    "移动语义": "语言特性",
    "线程": "并发编程",
    "std::thread": "并发编程",
    "RAII": "并发编程",
    "内存序": "内存模型",
    "原子操作": "内存模型",
    "无锁队列": "无锁编程",
    "SPSC": "无锁编程",
    "伪共享": "无锁编程",
}

# 标签在文章里的上限，超过说明又写回了小节名
MAX_TAGS_PER_POST = 5

# ---------------------------------------------------------------------------
# 纯映射之后需要补回的标签。
#
# 有几篇文章旧标签里全是小节名（例如运动学文章的 DH参数 / 雅可比 / 奇异性），
# 映射完只剩一个新标签。这里按文件名补上缺的主题级标签。
# 键是 _posts 下的文件名（不含 .md），值是追加到映射结果之后的标签。
# ---------------------------------------------------------------------------
EXTRA_TAGS = {
    # 旧标签里没有"机器人建模"这一层，补上让三篇建模文章归到一起
    "2026-08-13-机械臂运动学": ["机器人建模"],
    "2026-08-14-逆运动学原理": ["机器人建模", "运动学"],
    "2026-08-15-机械臂动力学": ["机器人建模"],

    # 旧标签里没有"运动规划"这一层
    "2026-08-10-TOPP-RA-原理解析": ["运动规划"],
    "2026-08-11-采样式路径规划": ["运动规划"],
    "2026-08-12-MAPF多智能体路径规划": ["运动规划", "路径优化"],

    # 旧标签里没有"状态估计"这一层
    "2026-08-17-卡尔曼滤波原理解析": ["状态估计"],
    "2026-08-18-ESKF与IMU姿态估计": ["状态估计", "传感器融合"],

    # 旧标签里没有"并发编程"这一层
    "2026-08-31-内存模型与原子操作": ["并发编程"],
    "2026-09-01-无锁SPSC队列": ["并发编程", "内存模型"],

    # 其余单主题文章
    "2026-08-19-阻抗控制与力控": ["阻抗控制"],
    "2026-08-25-实时Linux与EtherCAT": ["伺服控制"],
    "2026-08-26-ROS2通信机制与实时性": ["实时系统"],
    "2026-08-27-碰撞检测与协作安全": ["力控"],
    "2026-08-22-FOC-原理解析": ["伺服控制"],
    "2026-08-23-机械臂关节硬件": ["电机控制"],
    "2026-08-24-关节伺服环路与共振抑制": ["关节与驱动"],
    "2026-08-30-双臂QP协同控制": ["力控"],
    "2026-09-02-Pi系列VLA原理解析": ["模仿学习"],
    "2026-09-05-具身智能数据获取的演进": ["模仿学习"],
}


def read_tags(path: Path):
    """返回 (front matter 行列表, 标签列表)。"""
    text = io.open(path, encoding="utf-8").read()
    lines = text.split("\n")
    for i, line in enumerate(lines):
        m = re.match(r"^tags:\s*\[(.*)\]\s*$", line)
        if m:
            tags = [t.strip() for t in m.group(1).split(",") if t.strip()]
            return lines, tags, i
    raise ValueError(f"{path}: 未找到 `tags: [...]` 形式的标签行")


def write_tags(path: Path, lines, index: int, tags) -> None:
    lines[index] = "tags: [" + ", ".join(tags) + "]"
    io.open(path, "w", encoding="utf-8").write("\n".join(lines))


def iter_posts():
    return sorted(Path("_posts").rglob("*.md"))


def normalize(tags, stem=""):
    """按 MIGRATION 映射、补齐 EXTRA_TAGS，并去重。"""
    out = []
    for tag in tags:
        if tag in VOCABULARY:
            new = tag
        elif tag in MIGRATION:
            new = MIGRATION[tag]
        else:
            new = None  # 词表和映射都没有：留给 --check 报告

        if new and new not in out:
            out.append(new)

    for tag in EXTRA_TAGS.get(stem, []):
        if tag not in out:
            out.append(tag)

    # 按词表顺序输出：相关标签会挨在一起（力控 / 阻抗控制 / 导纳控制），
    # 同时保证无论原标签怎么排，结果都一致。
    order = {name: i for i, name in enumerate(VOCABULARY)}
    return sorted(out, key=lambda t: order.get(t, len(order)))


def cmd_check() -> int:
    unknown = {}
    oversized = {}

    stems = {p.stem for p in iter_posts()}

    for path in iter_posts():
        _, tags, _ = read_tags(path)
        bad = sorted({t for t in tags if t not in VOCABULARY})
        if bad:
            unknown[str(path)] = bad
        if len(tags) > MAX_TAGS_PER_POST:
            oversized[str(path)] = len(tags)

    for path, bad in unknown.items():
        print(f"  {path}")
        for tag in bad:
            hint = MIGRATION.get(tag)
            print(f"      {tag}" + (f"  → 建议归入「{hint}」" if hint else "  ← 不在词表中"))

    # EXTRA_TAGS 按文件名索引，文章改名后会失效
    stale = sorted(set(EXTRA_TAGS) - stems)

    problems = bool(unknown or oversized or stale)

    if not problems:
        print(f"  全部标签都在词表内（{len(VOCABULARY)} 个可用标签，上限 {MAX_TAGS_PER_POST} 个/篇）")
        return 0

    if oversized:
        print("\n  标签过多：")
        for path, n in oversized.items():
            print(f"      {path}  ({n} 个)")

    if stale:
        print("\n  EXTRA_TAGS 中有已失效的条目（文章可能被改名）：")
        for stem in stale:
            print(f"      {stem}")

    return 1


def cmd_apply() -> int:
    changed = 0
    for path in iter_posts():
        lines, tags, index = read_tags(path)
        new = normalize(tags, path.stem)
        if new != tags:
            write_tags(path, lines, index, new)
            print(f"  {path.name}")
            print(f"      {', '.join(tags)}")
            print(f"   →  {', '.join(new)}")
            changed += 1

    print(f"\n  共修改 {changed} 篇文章")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--check", action="store_true", help="检查是否有词表外的标签")
    group.add_argument("--apply", action="store_true", help="按映射重写文章标签")
    args = parser.parse_args()

    if not Path("_posts").is_dir():
        sys.exit("请在站点根目录运行（未找到 _posts/）")

    return cmd_check() if args.check else cmd_apply()


if __name__ == "__main__":
    raise SystemExit(main())
