---
title: "经典选读 第 1 期：上半身操作的八篇必读"
description: "先补课再追新：阻抗控制、能量罐、动力学辨识、摩擦建模、ACT、Diffusion Policy、π0 与受约束规划（CBiRRT）——上半身机械臂/双臂方向的第一批经典论文，附已验证的原文链接。"
pubDate: 2026-10-24T20:00:00+08:00
updatedDate: 2026-10-24T20:00:00+08:00
tags:
  - "阻抗控制"
  - "动力学辨识"
  - "模仿学习"
  - "生成式策略"
  - "VLA"
  - "运动规划"
categories:
  - "论文研究"
status: "ai-draft"
math: true
toc: true
papers:
  - title: "Impedance Control: An Approach to Manipulation: Part I—Theory"
    authors:
      - "Neville Hogan"
    published: 1985-03-01
    topics:
      - "阻抗控制"
      - "力控"
    links:
      abs: "https://doi.org/10.1115/1.3140702"
      pdf: "https://bpb-us-e1.wpmucdn.com/sites.mit.edu/dist/5/1384/files/2025/02/1985-impedance-control-an-approach-to-manipulation-part-I-theory.pdf"
    problem: "机械臂一旦与环境发生接触，单纯的位置控制或单纯的力控制都无法稳定地处理动态交互：位置环遇到刚性约束会产生巨大接触力，力环在自由空间里失去定义。"
    motivation: "此前的做法把「控位置」和「控力」当成两个割裂的问题（如混合位置/力控制按方向切分）。Hogan 在这篇 1985 年三部曲的第一部中提出：应当控制的不是运动或力本身，而是机械臂呈现给环境的「阻抗」——从运动偏差到作用力的动态映射；环境是导纳，机械臂就该表现为阻抗，两者构成物理一致的端口互联。"
    method: "把操作建模为机械臂与环境在交互端口上的能量交换：通过反馈整形，让末端在交互端口上表现为一个期望的目标阻抗（惯量-阻尼-刚度网络），使接触行为由这组可设计的参数决定，而不依赖环境的精确模型。"
    mechanism: "教科书式的目标阻抗标准形式（非论文原始记号）：$\\mathbf{F}_{\\mathrm{ext}} = \\mathbf{M}_d\\,\\ddot{\\tilde{\\mathbf{x}}} + \\mathbf{D}_d\\,\\dot{\\tilde{\\mathbf{x}}} + \\mathbf{K}_d\\,\\tilde{\\mathbf{x}}$。其中 $\\tilde{\\mathbf{x}} = \\mathbf{x} - \\mathbf{x}_d$ 是末端实际位姿与参考位姿的偏差，$\\mathbf{M}_d, \\mathbf{D}_d, \\mathbf{K}_d$ 分别是期望的惯量、阻尼、刚度矩阵，$\\mathbf{F}_{\\mathrm{ext}}$ 是环境作用在末端的外力。控制目标是让闭环系统在交互端口上等效于这组二阶动力学。"
    experiments: "Part I 是纯理论工作，没有实验基准；实现方法与应用实验在同期的 Part II（Implementation）与 Part III（Applications）中展开。"
    limitations: "目标阻抗参数的选取依赖任务先验，没有给出系统化的整定方法；恒定阻抗假设下的无源性结论不能直接推广到时变刚度——这正是后来能量罐（energy tank）一系列工作的出发点。"
    recommendation: "力控与柔顺控制的理论源头，几乎所有现代交互控制（导纳控制、变阻抗、能量罐）都建立在这套端口/阻抗观点上。与本站《阻抗控制与力控》《阻抗-导纳-柔顺与 MIT 控制的区别》两篇笔记互为参照。"
  - title: "A tank-based approach to impedance control with variable stiffness"
    authors:
      - "Federica Ferraguti"
      - "Cristian Secchi"
      - "Cesare Fantuzzi"
    published: 2013-05-06
    topics:
      - "能量罐"
      - "变刚度"
      - "阻抗控制"
    links:
      abs: "https://doi.org/10.1109/ICRA.2013.6631284"
    problem: "很多任务（装配、手术、人机协作）需要在线改变阻抗控制器的刚度，但时变刚度会向闭环系统注入能量、破坏无源性（passivity），接触时可能失稳。"
    motivation: "经典阻抗控制（Hogan）的无源性结论建立在恒定刚度上。这篇 ICRA 2013 论文要在「任意时变刚度曲线」下仍然保证无源性，而不是对刚度变化率做保守限制。"
    method: "能量罐（energy tank）：用一个虚拟储能元件收集控制器耗散掉的能量；刚度变化所需注入的能量必须从罐中支取，罐内能量不足时钳制刚度变化。作者声称由此可对任意刚度矩阵选择（尤其是时变刚度）保证系统无源性，机器人在自由运动和与环境交互时都保持稳定（摘要原文）。"
    mechanism: "标准能量罐表述（细节以论文为准）：给罐一个标量状态 $x_t$，储能 $T(x_t) = \\tfrac{1}{2}x_t^2$；把控制器的耗散功率导入罐中为其充能，而时变刚度项等效的能量注入通过与罐的无源互联（端口变换）来支付。只要 $T(x_t) > 0$，整个受控系统对环境端口保持无源；罐空则停止/限制刚度变化。变量含义：$x_t$ 为罐状态，$T$ 为罐内储能。"
    experiments: "作者在摘要中声称该策略对任意时变刚度保证无源性并给出稳定的自由运动/接触行为；实验细节本条目尚未精读（AI 草稿，待核对论文正文）。"
    limitations: "罐内能量耗尽时刚度变化被钳制，跟踪性能依赖初始储能与任务中的耗散；罐能量上限等参数仍需人工设计。同组后续 TRO 2015 工作把能量罐架构扩展到自主与遥操作机器人手术（DOI 10.1109/TRO.2015.2455791，PDF 见 iris.unife.it 开放获取版本）。"
    recommendation: "能量罐是变阻抗控制保证无源性的标准工具，与本站「能量罐柔顺控制」项目直接对应；读完 Hogan 再读这篇，能看清「恒定阻抗 → 变阻抗」需要补上的理论缺口。"
  - title: "Optimal robot excitation and identification"
    authors:
      - "Jan Swevers"
      - "Chris Ganseman"
      - "D. Bilgin Tukel"
      - "Joris De Schutter"
      - "Hendrik Van Brussel"
    published: 1997-10-01
    topics:
      - "动力学辨识"
      - "激励轨迹"
    links:
      abs: "https://doi.org/10.1109/70.631234"
      pdf: "https://lirias.kuleuven.be/retrieve/80252"
    problem: "动力学参数辨识的精度取决于激励轨迹的「信息量」：激励不充分时回归问题病态，参数估计方差大，辨识出的模型不可用。"
    motivation: "相对已有工作的两点差异（摘要原文）：一是激励轨迹的参数化方式——改用有限傅里叶级数而非一般多项式/样条；二是优化准则——直接最小化参数估计不确定度（协方差的下界），而不是常用的回归矩阵条件数。"
    method: "每个关节的激励轨迹取有限傅里叶级数，保证周期激励：可做时域平均、估计测量噪声特性（服务于最大似然估计）、由位置测量解析地计算速度与加速度、并显式控制激励带宽；随后用最大似然（ML）估计动力学参数。"
    mechanism: "刚体动力学对基参数是线性的（标准表述）：$\\boldsymbol{\\tau} = \\boldsymbol{\\Phi}(\\mathbf{q}, \\dot{\\mathbf{q}}, \\ddot{\\mathbf{q}})\\,\\boldsymbol{\\theta}$，其中 $\\boldsymbol{\\tau}$ 为关节力矩，$\\mathbf{q}$ 为关节位置，$\\boldsymbol{\\Phi}$ 为回归矩阵，$\\boldsymbol{\\theta}$ 为待辨识的基参数向量。轨迹参数化为 $q_i(t) = \\sum_{k=1}^{N} \\big(a_{ik}\\sin(k\\omega_f t) + b_{ik}\\cos(k\\omega_f t)\\big)$ 形式的有限傅里叶级数（$\\omega_f$ 为基频，$a_{ik}, b_{ik}$ 为待优化系数），在关节限位/速度/加速度约束下优化参数协方差准则。"
    experiments: "作者声称：仿真表明按「参数不确定度」准则优化的轨迹，比按经典条件数准则优化的轨迹给出更小的参数不确定度界；并在一台工业机器人上实验验证，轨迹设计与 ML 估计相互配合，可得到精确的机器人模型（摘要原文）。"
    limitations: "ML 估计依赖噪声模型假设与周期稳态激励；摩擦等非线性项的模型选择、基参数的物理可行性（质量/惯量为正）等问题需要后续工作补充。"
    recommendation: "动力学参数辨识的标准方法论源头：傅里叶级数激励 + 协方差准则几乎是今天所有辨识流程的默认配置，也是本站动力学辨识项目的方法学基础。"
  - title: "Dynamics for robot control: friction modeling and ensuring excitation during parameter identification"
    authors:
      - "Brian Armstrong"
    published: 1988-05-01
    topics:
      - "摩擦建模"
      - "动力学辨识"
    links:
      abs: "https://apps.dtic.mil/dtic/tr/fulltext/u2/a198732.pdf"
    problem: "关节摩擦在低速与换向时高度非线性（静摩擦、Stribeck 效应、位置依赖性），既破坏基于模型的控制，也污染动力学参数辨识的结果。"
    motivation: "在此之前摩擦常被简化为「库仑 + 粘性」两项；该论文（斯坦福大学博士论文，DTIC 技术报告编号 AD-A198732，OpenAlex 记录作者为 Brian Armstrong，Gene F. Franklin 一同列名）系统地研究了真机摩擦的实验测量与建模，并讨论辨识实验中如何保证激励充分。"
    method: "对机械臂关节摩擦做系统的实验测量与建模（包括低速区的 Stribeck 效应与随关节位置变化的摩擦分量），并给出在参数辨识实验中保证激励（excitation）充分性的方法。"
    mechanism: "静态摩擦模型的标准形式（标准背景表述，非论文原始记号）：$\\tau_f = \\big[\\tau_c + (\\tau_s - \\tau_c)\\,e^{-(\\dot{q}/v_s)^2}\\big]\\,\\mathrm{sgn}(\\dot{q}) + \\sigma\\,\\dot{q}$。其中 $\\tau_c$ 为库仑摩擦力矩，$\\tau_s$ 为静摩擦力矩，$v_s$ 为 Stribeck 速度（刻画低速下摩擦随速度下降的区间），$\\sigma$ 为粘性摩擦系数，$\\dot{q}$ 为关节速度。"
    experiments: "学位论文性质的真机摩擦测量与辨识实验；本条目尚未精读原文，实验平台与数据细节待核对（AI 草稿）。"
    limitations: "静态摩擦模型无法描述预滑动位移、摩擦记忆等动态现象，后续被 LuGre 等动态摩擦模型扩展；另外 DTIC 原文链接对自动化访问有限制（返回 403），需要用浏览器直接打开。"
    recommendation: "摩擦建模与「辨识时如何保证激励」这两个问题的经典起点，与 Swevers 的最优激励设计互为补充；做关节级力矩控制或辨识前值得通读。"
  - title: "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware"
    authors:
      - "Tony Z. Zhao"
      - "Vikash Kumar"
      - "Sergey Levine"
      - "Chelsea Finn"
    arxivId: "2304.13705"
    published: 2023-04-23
    categories:
      - "cs.RO"
      - "cs.LG"
    topics:
      - "模仿学习"
      - "双臂"
      - "ACT"
    links:
      abs: "https://arxiv.org/abs/2304.13705"
      pdf: "https://arxiv.org/pdf/2304.13705"
      project: "https://tonyzhaozh.github.io/aloha/"
      code: "https://github.com/tonyzhaozh/act"
    problem: "穿扎带、装电池这类精细双臂操作需要高精度、接触力协调和闭环视觉反馈，传统上只能靠高端机器人与精密标定完成；低成本、不精确的硬件能否通过学习做到？"
    motivation: "直接的端到端模仿学习在高精度任务上有两大障碍（摘要原文）：策略误差随时间复合（compounding error），以及人类演示的非平稳性。ACT 针对这两点设计。"
    method: "ALOHA 低成本双臂遥操作平台采集真实演示；ACT（Action Chunking with Transformers）在动作序列上学一个生成式模型：policy 一次预测一段动作块（chunk）而非单步动作，从源头减少误差复合；再配合时间集成（temporal ensembling）平滑执行。"
    mechanism: "ACT 把演示建模为条件变分自编码器（CVAE）：编码器把动作序列压缩为风格变量 $z$，解码器（Transformer）以观测与 $z$ 为条件重建未来 $k$ 步动作块 $\\mathbf{a}_{t:t+k}$。动作分块把有效决策步长从 1 变为 $k$，误差复合次数随之减少约 $k$ 倍；时间集成对同一时刻来自不同 chunk 的预测做指数加权平均（标准表述，权重细节见论文）。"
    experiments: "作者声称：真机上学会 6 个困难任务（如打开半透明调料杯、装电池），成功率 80–90%，每个任务只用约 10 分钟的演示数据（摘要原文）。"
    limitations: "需要逐任务采集演示与训练，策略不具备跨任务/跨指令泛化；CVAE 的单模态高斯先验对高度多模态的演示分布表达有限（这也是后续扩散类策略的切入点）。"
    recommendation: "低成本双臂模仿学习的里程碑，ALOHA 硬件 + ACT 算法直接催生了之后的大规模双臂数据采集生态；与本站《ACT 与 Diffusion Policy 原理解析》对照阅读。"
  - title: "Diffusion Policy: Visuomotor Policy Learning via Action Diffusion"
    authors:
      - "Cheng Chi"
      - "Zhenjia Xu"
      - "Siyuan Feng"
      - "Eric Cousineau"
      - "Yilun Du"
      - "Benjamin Burchfiel"
      - "Russ Tedrake"
      - "Shuran Song"
    arxivId: "2303.04137"
    published: 2023-03-07
    categories:
      - "cs.RO"
    topics:
      - "扩散策略"
      - "模仿学习"
    links:
      abs: "https://arxiv.org/abs/2303.04137"
      pdf: "https://arxiv.org/pdf/2303.04137"
      project: "https://diffusion-policy.cs.columbia.edu/"
      code: "https://github.com/real-stanford/diffusion_policy"
    problem: "视觉-运动策略学习要同时面对多模态动作分布（同一场景多种合理做法）、高维动作空间和训练不稳定——确定性回归或高斯策略在这些点上先天吃亏。"
    motivation: "与其回归单一动作，不如把 visuomotor policy 表示为「条件去噪扩散过程」：扩散模型天然擅长表达多模态分布、可扩展到高维输出，且训练稳定（摘要原文给出的三点优势）。"
    method: "以观测为条件的 DDPM 在动作序列上做去噪生成；配合三项关键设计（摘要原文）：滚动时域控制（receding horizon）、视觉条件化（visual conditioning）与时序扩散 Transformer（time-series diffusion transformer）。"
    mechanism: "标准 DDPM 表述：策略学习噪声预测网络 $\\varepsilon_\\theta(\\mathbf{o}, \\mathbf{a}^k, k)$，推理时从高斯噪声 $\\mathbf{a}^K$ 出发做 $K$ 步随机朗之万式迭代去噪 $\\mathbf{a}^{k-1} = \\alpha_k\\big(\\mathbf{a}^k - \\gamma_k\\,\\varepsilon_\\theta(\\mathbf{o}, \\mathbf{a}^k, k)\\big) + \\mathcal{N}(0, \\sigma_k^2 I)$。变量含义：$\\mathbf{o}$ 为视觉观测条件，$\\mathbf{a}^k$ 为第 $k$ 步去噪的动作序列，$\\varepsilon_\\theta$ 等价于学到动作分布评分函数（score）的梯度场，$\\alpha_k, \\gamma_k, \\sigma_k$ 为噪声调度系数。"
    experiments: "作者声称：在 4 个机器人操作基准的 12 个任务上一致超越既有 SOTA，平均提升 46.9%（摘要原文）。"
    limitations: "多步迭代去噪带来推理延迟，对高频闭环控制不友好（催生了后续蒸馏/一致性/流匹配等加速工作）；与 ACT 一样仍是逐任务模仿，不具备语言条件的任务泛化。"
    recommendation: "生成式策略路线的奠基之作：理解了「动作分布的 score 场」这一视角，再看后来的流匹配动作专家（π0 等）就是自然延伸。与本站《ACT 与 Diffusion Policy 原理解析》对照阅读。"
  - title: "π0: A Vision-Language-Action Flow Model for General Robot Control"
    authors:
      - "Kevin Black"
      - "Noah Brown"
      - "Danny Driess"
      - "Adnan Esmail"
      - "Michael Equi"
      - "Chelsea Finn"
      - "Niccolo Fusai"
      - "Lachy Groom"
      - "Karol Hausman"
      - "Brian Ichter"
      - "Szymon Jakubczak"
      - "Tim Jones"
      - "Liyiming Ke"
      - "Sergey Levine"
      - "Adrian Li-Bell"
      - "Mohith Mothukuri"
      - "Suraj Nair"
      - "Karl Pertsch"
      - "Lucy Xiaoyang Shi"
      - "James Tanner"
      - "Quan Vuong"
      - "Anna Walling"
      - "Haohuan Wang"
      - "Ury Zhilinsky"
    arxivId: "2410.24164"
    published: 2024-10-31
    categories:
      - "cs.LG"
      - "cs.RO"
    topics:
      - "VLA"
      - "流匹配"
      - "双臂"
    links:
      abs: "https://arxiv.org/abs/2410.24164"
      pdf: "https://arxiv.org/pdf/2410.24164"
      project: "https://www.physicalintelligence.company/blog/pi0"
      code: "https://github.com/Physical-Intelligence/openpi"
    problem: "把机器人学习推到真实世界可用的通用性水平，面临数据、泛化与鲁棒性三重障碍；需要一个能吃下多平台异构数据、输出高频连续动作的通用策略（机器人基础模型）。"
    motivation: "离散动作 token 的 VLA（如 RT-2 一系）难以输出灵巧任务所需的高频连续动作块。π0 在预训练 VLM 之上加一个流匹配（flow matching）动作专家，既继承互联网规模的语义知识，又能生成连续动作序列（摘要原文）。"
    method: "预训练 VLM 作为语义骨干 + 流匹配动作专家输出动作块；在包含单臂、双臂与移动操作平台的大规模异构数据上预训练，之后评估零样本执行、跟随人类/高层 VLM 策略的语言指令、以及微调习得新技能的能力（摘要原文）。"
    mechanism: "标准流匹配表述（变量含义如下）：对动作块 $\\mathbf{A}_t$ 取线性插值路径 $\\mathbf{A}_t^{\\tau} = \\tau\\,\\mathbf{A}_t + (1-\\tau)\\,\\boldsymbol{\\epsilon}$，$\\boldsymbol{\\epsilon}\\sim\\mathcal{N}(0, I)$，训练网络 $\\mathbf{v}_\\theta$ 拟合目标速度场：$\\mathcal{L} = \\mathbb{E}\\,\\big\\|\\mathbf{v}_\\theta(\\mathbf{A}_t^{\\tau}, \\mathbf{o}_t, \\tau) - (\\mathbf{A}_t - \\boldsymbol{\\epsilon})\\big\\|^2$。其中 $\\tau\\in[0,1]$ 为流时间，$\\mathbf{o}_t$ 为观测（多路图像 + 语言 + 本体状态），推理时从噪声出发沿学到的速度场数值积分若干步即得动作块——步数远少于 DDPM 的去噪步数。"
    experiments: "作者声称：模型可在预训练后零样本执行任务、跟随语言指令，并经微调掌握叠衣服、擦桌子、装箱等多阶段灵巧任务（摘要原文；具体成功率数字在论文正文，本条目未转述）。"
    limitations: "训练依赖大规模私有真机数据（约 10k 小时级别，正文数字请以论文为准）；对失败的自主恢复、长时序任务的可靠性在后续 π0.5 / RECAP 等工作中才逐步解决。"
    recommendation: "流匹配动作专家 + VLM 的组合已成为当前 VLA 的主流形态之一；本站《π 系列 VLA 原理解析》对 π0 到 π0.7 的演进有完整推导，此处作为经典索引收录。"
  - title: "Manipulation planning on constraint manifolds"
    authors:
      - "Dmitry Berenson"
      - "Siddhartha S. Srinivasa"
      - "Dave Ferguson"
      - "James J. Kuffner"
    published: 2009-05-12
    topics:
      - "运动规划"
      - "受约束规划"
    links:
      abs: "https://doi.org/10.1109/ROBOT.2009.5152399"
      pdf: "https://publications.ri.cmu.edu/storage/publications/pub_files/2009/5/icra09.pdf"
    problem: "操作规划常带多种硬约束——持物位姿约束（端杯水不能倾倒）、力矩限制（搬重物）、沿工作面运动等；约束把可行解压缩到构型空间中的低维流形上，普通采样规划器几乎采不到流形上的点。"
    motivation: "BiRRT 等采样规划器在无约束构型空间中高效，但对约束流形无能为力。CBiRRT 要给出一个统一框架，在同一个规划器里处理力矩限制、持物位姿约束与工作面跟随等多类约束（摘要原文）。"
    method: "CBiRRT（Constrained Bi-directional RRT）扩展 BiRRT：用投影技术把采样/扩展得到的构型拉回约束流形，在流形上生长双向树并寻找流形之间的桥接；只新增一个参数——约束满足的允许误差（摘要原文）。"
    mechanism: "投影的标准做法（细节以论文为准）：对约束误差 $\\Delta\\mathbf{x}$（如末端位姿偏离约束集的量），用雅可比伪逆迭代 $\\mathbf{q} \\leftarrow \\mathbf{q} - \\mathbf{J}^{+}(\\mathbf{q})\\,\\Delta\\mathbf{x}$ 直至误差小于允许值。其中 $\\mathbf{q}$ 为关节构型，$\\mathbf{J}$ 为约束函数对 $\\mathbf{q}$ 的雅可比，$\\mathbf{J}^{+}$ 为其伪逆。论文配合 Task Space Regions 一类的约束表示来计算 $\\Delta\\mathbf{x}$。"
    experiments: "作者声称：在装有 4 自由度 Barrett 手的 7 自由度 WAM 机械臂（移动底座）上演示，机器人可完成家务任务、解谜与搬运重物（摘要原文）。"
    limitations: "投影式采样在约束流形维度很低或多个流形相距很远时效率下降；输出路径仍需后处理平滑；对动力学约束（非完整/时间参数化）不直接适用。"
    recommendation: "受约束操作规划的标准算法：持杯移动、双臂闭链这类任务的规划器基本都从 CBiRRT 的「采样 + 投影」范式出发。与本站《采样式路径规划》《双臂协同运动规划》两篇笔记互补。"
---

```alert
type: warning
icon: lucide:shield-alert
title: AI 分析草稿
本期各论文的「问题/动机/方法/机制」等注解由 AI 基于论文摘要与公开记录撰写，公式为教科书标准表述而非论文原始记号；尚未经本人逐篇审读，转述如有出入以论文原文为准。所有链接（DOI / PDF / 项目页 / 代码）均已逐一验证可达（2026-10-24；DTIC 一条对自动访问返回 403，需浏览器打开）。
```

## 为什么先补课

这个研究板块的追新部分（每周论文雷达）只有建立在扎实的经典谱系上才有判断力。第 1 期按「控制 → 辨识 → 学习 → 规划」四条线各选了最绕不开的源头论文，共 8 篇：

- **交互控制**：Hogan 的阻抗控制三部曲（Part I）与 Ferraguti 的能量罐变刚度——从「恒定阻抗的理论」到「时变刚度的无源性」。
- **动力学辨识**：Swevers 的最优激励 + 最大似然辨识，与 Armstrong 的摩擦建模——辨识的「激励设计」与「摩擦这块硬骨头」。
- **操作学习**：ACT（双臂模仿学习）、Diffusion Policy（生成式策略）、π0（VLA + 流匹配）——从单任务模仿到机器人基础模型的三级跳。
- **受约束规划**：CBiRRT——持物位姿、力矩限制、闭链这类约束流形上的采样规划范式。

## 后续批次（待整理）

下列主题在本站的经典谱系中尚缺条目，留作后续批次（只列主题，不预填链接，待逐一核实原文后收录）：

- 逆运动学与冗余分解：阻尼最小二乘、零空间投影、任务优先级框架的源头论文；
- 双臂协同的经典形式化：相对任务空间 / 协同任务表示；
- 灵巧手操作：抓取闭合性理论与手内操作（in-hand manipulation）的奠基工作;
- 里程碑 VLA 的补充条目：RT 系列、OpenVLA 等开源代表作。
