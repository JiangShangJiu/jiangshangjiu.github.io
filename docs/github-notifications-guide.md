---
layout: page
title: GitHub 通知管理指南
description: 如何减少和管理 GitHub 邮件通知
---

# GitHub 通知管理指南

如果你收到过多的 GitHub 邮件通知，本指南将帮助你快速解决问题。

## 🚀 快速解决方案（3 分钟搞定）

### 第一步：关闭 Actions 成功通知

访问 <https://github.com/settings/notifications> 并：

1. 找到 **"Actions"** 部分
2. **取消勾选** "Send notifications for successful workflow runs"
3. 保存设置

这样你只会在构建**失败**时收到通知，不会再收到成功的构建邮件。

### 第二步：管理仓库订阅

访问 <https://github.com/notifications/subscriptions> 并：

1. 找到你不想关注的仓库（如 `transformers`）
2. 点击 **"Unwatch"** 或设置为 **"Ignore"**
3. 对于个人博客仓库，设置为 **"Participating and @mentions"**

### 第三步（可选）：设置邮件过滤

如果你使用 Gmail，可以创建过滤规则：

- **搜索**：`from:notifications@github.com`
- **操作**：跳过收件箱 + 应用标签 "GitHub"
- **针对特定仓库**：添加 `subject:"[仓库名]"` 到搜索条件

---

## 📚 详细说明

### 问题 1：收到大量 Actions 构建通知

**症状**：每次推送代码都收到 "Run succeeded" 或 "Run failed" 邮件

**解决方案**：

1. 访问：<https://github.com/settings/notifications>
2. 找到 **"Actions"** 部分
3. 配置通知选项：
   - ✅ 推荐：只在失败时通知
   - ❌ 不推荐：每次运行都通知
4. 保存设置

**针对单个仓库**：

1. 访问仓库主页
2. 点击 **"Watch"** 按钮
3. 选择 **"Custom"**
4. 取消勾选 **"Actions"**

### 问题 2：收到 "Workflow will be disabled soon" 警告

**症状**：收到类似 "The 'Nvidia CI - Flash Attn' workflow in JiangShangJiu/transformers will be disabled soon" 的邮件

**原因**：GitHub 会自动禁用 60 天未使用的 workflow

**解决方案**：

**如果你不需要这个 workflow**：
1. 访问该仓库：<https://github.com/JiangShangJiu/transformers>
2. 点击 **"Watch"** 按钮 → 选择 **"Ignore"**
3. 以后不会再收到该仓库的任何通知

**如果你需要保持 workflow 激活**：
1. 访问仓库的 Actions 页面
2. 手动触发一次该 workflow
3. 或者推送一次代码来激活它

### 问题 3：收到太多 GitHub Pages 部署通知

**症状**：每次博客更新都收到部署成功的邮件

**解决方案**：

GitHub Pages 的部署是 Actions workflow 的一部分，参考"问题 1"的解决方案即可。

---

## 🎯 推荐配置

### 个人博客仓库 (jiangshangjiu.github.io)

```
Watch: "Participating and @mentions"
Actions: 只在失败时通知
```

### Fork 的大型项目（如 transformers）

```
Watch: "Ignore" 或 "Releases only"
```

### 全局设置

访问 <https://github.com/settings/notifications>：

- ❌ **Automatically watch repositories**: 取消勾选
- ❌ **Automatically watch teams**: 取消勾选
- ✅ **Actions**: 只在失败时通知
- ✅ **Email**: 只接收 @mentions 和你参与的讨论

---

## 📋 所有 GitHub 仓库订阅管理

访问 <https://github.com/notifications/subscriptions> 可以看到：

- 所有你正在 Watch 的仓库
- 所有你订阅的 Issue 和 PR
- 批量管理订阅设置

**建议操作**：

1. 检查列表中的每个仓库
2. 保留你需要关注的项目
3. 其他项目设置为 "Ignore" 或 "Releases only"

---

## 🔗 快速链接

| 功能 | 链接 |
|-----|------|
| 全局通知设置 | <https://github.com/settings/notifications> |
| 已订阅仓库列表 | <https://github.com/notifications/subscriptions> |
| 邮件偏好设置 | <https://github.com/settings/notifications> |
| 个人博客仓库 | <https://github.com/jiangshangjiu/jiangshangjiu.github.io> |
| Transformers 仓库 | <https://github.com/JiangShangJiu/transformers> |

---

## 💡 高级技巧

### Gmail 邮件过滤规则

创建多级过滤规则来精细管理 GitHub 邮件：

#### 规则 1：归档成功的构建通知

```
搜索条件：
from:notifications@github.com subject:"Run succeeded" OR subject:"successful"

操作：
- 跳过收件箱（归档）
- 标记为已读
- 应用标签：GitHub/Actions/Success
```

#### 规则 2：高亮失败的构建

```
搜索条件：
from:notifications@github.com subject:"Run failed" OR subject:"failing"

操作：
- 标记为重要
- 应用标签：GitHub/Actions/Failed
```

#### 规则 3：归档特定仓库

```
搜索条件：
from:notifications@github.com subject:"[JiangShangJiu/transformers]"

操作：
- 跳过收件箱（归档）
- 标记为已读
- 应用标签：GitHub/Archive
```

### Outlook 规则

类似地，在 Outlook 中可以创建规则：

1. 右键点击 GitHub 邮件
2. 选择"规则" → "创建规则"
3. 设置条件和操作

### 移动端管理

GitHub 移动 App 也支持通知管理：

1. 打开 GitHub App
2. 进入设置 → 通知
3. 配置推送通知选项

---

## ❓ 常见问题

### Q: 我已经关闭了通知，为什么还收到邮件？

A: 可能的原因：
1. 设置需要几分钟才能生效
2. 你可能在特定 Issue/PR 中被 @提及
3. 你可能是某个讨论的参与者
4. 检查是否有旧的邮件规则在转发

### Q: 如何只接收重要通知？

A: 推荐配置：
1. 全局设置为"只接收 @mentions"
2. 关闭 Actions 成功通知
3. 只 Watch 重要的仓库
4. 其他仓库设置为 "Ignore"

### Q: 能否完全关闭 GitHub 邮件？

A: 可以，但不推荐：
1. 访问：<https://github.com/settings/notifications>
2. 取消勾选所有 Email 相关选项
3. 只保留 Web 和移动端通知

但这样可能会错过重要的 @mentions 和安全警告。

### Q: 如何恢复通知？

A: 
1. 访问：<https://github.com/settings/notifications>
2. 重新勾选需要的通知类型
3. 或访问具体仓库，调整 Watch 设置

---

## 📞 需要帮助？

如果本指南没有解决你的问题：

1. 查看 [GitHub 官方文档](https://docs.github.com/en/account-and-profile/managing-subscriptions-and-notifications-on-github)
2. 检查你的邮箱是否有自动转发规则
3. 确认问题是否来自 GitHub 之外的服务

---

**最后更新**: 2026-08-10

详细技术文档：查看 `.github/NOTIFICATION_SETTINGS.md`
