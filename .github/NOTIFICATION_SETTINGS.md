# GitHub 邮件通知设置指南

如果你收到过多的 GitHub 邮件通知，可以按照以下步骤进行配置。

## 1. 关闭 GitHub Actions 成功通知

### 方法一：全局设置（推荐）

1. 访问 GitHub 个人设置：<https://github.com/settings/notifications>
2. 找到 **"Actions"** 部分
3. **取消勾选** "Send notifications for successful workflow runs"（只在失败时通知）
4. 可选：取消勾选 "Email" 复选框，改用 Web 通知

### 方法二：针对本仓库

1. 访问仓库页面：<https://github.com/jiangshangjiu/jiangshangjiu.github.io>
2. 点击右上角的 **"Watch"** 按钮
3. 选择 **"Custom"**（自定义）
4. 取消勾选 **"Actions"** 或选择 **"Ignore"**（忽略所有通知）

## 2. 减少 GitHub Pages 部署通知

GitHub Pages 的部署通知无法单独关闭，但可以通过以下方式减少：

1. 在 <https://github.com/settings/notifications> 中
2. 找到 **"Email notification preferences"**
3. 取消勾选不需要的通知类型

## 3. 批量管理邮件通知

### 推荐设置：

- ✅ **Issues**: 仅当你被 @提及或参与讨论时通知
- ✅ **Pull requests**: 仅当你被 @提及或是审阅者时通知
- ❌ **Actions**: 只在失败时通知（或完全关闭）
- ❌ **Releases**: 关闭（除非你需要跟踪发布）
- ✅ **Discussions**: 仅当你被 @提及时通知

### 设置路径：

1. 访问：<https://github.com/settings/notifications>
2. 配置 **"Watching"** 部分：
   - Automatic watching: 建议取消勾选 "Automatically watch repositories"
3. 配置 **"Subscriptions"** 部分：
   - 选择你希望收到通知的事件类型

## 4. 针对本项目的建议

由于这是个人博客项目，推送到 main 分支会自动触发部署，建议：

1. **关闭 Actions 成功通知**（构建成功时不发邮件）
2. **保留 Actions 失败通知**（构建失败时及时发现问题）
3. 将本仓库的 Watch 设置为 **"Participating and @mentions"**

## 5. 邮件过滤规则（Gmail 示例）

如果你使用 Gmail，可以创建过滤规则自动归档 GitHub 邮件：

1. 搜索：`from:notifications@github.com subject:"[jiangshangjiu/jiangshangjiu.github.io]"`
2. 点击搜索框右侧的 ⋮ → "筛选这类邮件"
3. 勾选 "跳过收件箱（归档）" 或 "应用标签"
4. 创建过滤器

### 建议的过滤规则：

```
from:notifications@github.com subject:"[jiangshangjiu/jiangshangjiu.github.io] Run"
```

- 操作：**跳过收件箱** + **标记为已读** + **应用标签 "GitHub/Actions"**

## 6. 管理其他仓库的通知（如 transformers 仓库）

如果你收到来自其他仓库的通知（例如 "Nvidia CI - Flash Attn" workflow 警告）：

### 方法一：取消 Watch 该仓库

1. 访问仓库页面：<https://github.com/JiangShangJiu/transformers>
2. 点击右上角的 **"Unwatch"** 或 **"Watch"** 按钮
3. 选择 **"Ignore"**（忽略所有通知）

### 方法二：只关闭 Actions 通知

1. 访问仓库页面：<https://github.com/JiangShangJiu/transformers>
2. 点击右上角的 **"Watch"** 按钮
3. 选择 **"Custom"**（自定义）
4. **取消勾选 "Actions"** 相关选项
5. 点击 "Apply"（应用）

### 方法三：批量管理所有订阅

1. 访问：<https://github.com/notifications/subscriptions>
2. 查看所有已订阅的仓库列表
3. 找到 `JiangShangJiu/transformers`
4. 点击 **"Unwatch"** 或调整订阅设置

### 针对 Workflow 即将禁用的警告

如果收到 "workflow will be disabled soon" 的邮件：

- **原因**：GitHub 会自动禁用 60 天未使用的 workflow
- **解决**：如果不需要该 workflow，可以直接忽略这个警告
- **保持激活**：如果需要保持 workflow 激活，需要手动触发一次或推送代码

## 7. 取消订阅已有的通知线程

如果你已经订阅了某些讨论或 Issue：

1. 打开邮件中的 GitHub 链接
2. 在页面右侧找到 **"Unsubscribe"** 按钮
3. 点击取消订阅

## 快速链接

- **全局通知设置**：<https://github.com/settings/notifications>
- **已订阅仓库列表**：<https://github.com/notifications/subscriptions>
- **本仓库 (博客)**：<https://github.com/jiangshangjiu/jiangshangjiu.github.io>
- **transformers 仓库**：<https://github.com/JiangShangJiu/transformers>

## 推荐配置总结

### 个人博客仓库 (jiangshangjiu.github.io)

- ✅ **Watch**: "Participating and @mentions"
- ❌ **Actions**: 只在失败时通知

### transformers 仓库

- **不需要关注**：设置为 **"Ignore"**
- **偶尔查看**：设置为 **"Releases only"** 或 **"Custom"**（取消所有勾选项）

### 全局设置

1. 取消勾选 "Automatically watch repositories"
2. Actions: 只在失败时通知
3. Email: 只接收重要通知（@mentions、参与的讨论）

---

**注意**：修改设置后，新的配置会立即生效，但可能需要几分钟才能完全同步。
