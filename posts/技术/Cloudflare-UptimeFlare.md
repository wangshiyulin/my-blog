---
title: 利用 Cloudflare 搭建 Uptime-Flare，免费站点在线监控服务
slug: Cloudflare-UptimeFlare
date: 2026/08/09 19:11:00
updated: 2026/08/12 17:01:00
status: publish
auther: 往世雨
categories: 
  - 技术
tags:
  - 网站
desc: 详细介绍如何使用 GitHub Actions 和 Cloudflare Workers、D1 部署 UptimeFlare，监控网站可用性与性能，并绑定自定义域名。
keywords:
  - UptimeFlare
  - Cloudflare 网站监控
  - 网站可用性监控
  - 网站 uptime 监控
  - Cloudflare Workers
  - Cloudflare D1
  - GitHub Actions
---

如果你有个人博客、网站、API 或其他在线服务，除了正常访问之外，还应该关注一个问题：

> **网站挂了以后，你能不能第一时间知道？**

`UptimeFlare` 是一个开源的网站监控工具，可以定期检查网站的可用性，并提供状态页面（Status Page），方便我们直观查看网站当前是否正常运行。

它可以部署在 Cloudflare 的基础设施上，并使用 Cloudflare D1 等服务保存监控数据。对于个人网站、小型项目来说，在符合当前 Cloudflare 免费额度和服务限制的前提下，可以做到较低甚至无需额外服务器成本的部署。

本文将从零开始，使用 **GitHub + GitHub Actions + Cloudflare** 部署 UptimeFlare，并配置需要监控的网站。

> **本文说明基于 UptimeFlare 项目当前的部署方式整理。Cloudflare 的产品界面、免费额度和计费规则可能发生变化，实际使用时请以官方文档和控制台当前显示为准。**

---

## 一、UptimeFlare 是什么？

UptimeFlare 是一个开源的网站监控工具，主要用于监控网站或其他 HTTP 服务的运行状态。

它的基本工作流程可以理解为：

```text
                 定期发起监控请求
                        │
                        ▼
              ┌─────────────────┐
              │    UptimeFlare  │
              └────────┬────────┘
                       │
             ┌─────────┼─────────┐
             ▼         ▼         ▼
          网站 A     网站 B     API C
             │         │         │
             └─────────┼─────────┘
                       ▼
                 保存监控结果
                       │
                       ▼
                  Status Page
```

因此，它不仅适合监控个人博客，也可以用于：

- 个人网站；
- 博客；
- API 服务；
- 在线项目；
- 自建服务；
- 多个域名的可用性监控。

与单纯使用 `ping` 不同，网站监控通常更关注实际的 HTTP 请求结果，例如目标 URL 是否能够正常访问、HTTP 状态是否符合预期等。

---

## 二、为什么选择 UptimeFlare + Cloudflare？

对于个人网站来说，这套方案有几个比较明显的优势：

### 1. 开源

UptimeFlare 的源代码公开，可以自行查看、修改和部署。

项目地址：

[UptimeFlare GitHub](https://github.com/lyc8503/UptimeFlare)

### 2. 不需要单独购买监控服务器

UptimeFlare 可以部署到 Cloudflare 的相关服务中。

如果你的使用量符合 Cloudflare 当前免费计划的额度和限制，就可以在不额外购买 VPS 的情况下运行这套监控服务。

### 3. 可以自己维护监控配置

网站列表、监控规则和状态页等内容都由自己的仓库控制，修改配置后可以通过 GitHub Actions 自动完成部署。

### 4. 可以绑定自己的域名

部署完成后，可以将自定义域名绑定到 Cloudflare 上部署的服务，形成类似：

```text
https://status.example.com
```

这样的独立状态页。

---

## 三、本文最终实现的效果

完成部署后，可以得到一个独立的网站状态页，例如：

```text
https://status.example.com
```

状态页可以展示你配置的监控对象及其运行状态。

整个部署流程如下：

```text
修改 UptimeFlare 配置
          │
          ▼
      GitHub Repository
          │
          ▼
      GitHub Actions
          │
          ▼
       Cloudflare
       ├── Workers
       ├── D1
       └── Pages（具体资源以项目当前版本为准）
          │
          ▼
      Status Page
```

---

# 四、准备工作

开始之前，需要准备：

- 一个 GitHub 账号；
- 一个 Cloudflare 账号；
- Cloudflare 中已经添加并可管理的账户资源；
- 一个需要监控的网站或服务；
- 一个可选的自定义域名。

如果你已经在使用 Cloudflare 托管域名，后续绑定自定义域名会更加方便。

---

# 五、创建 Cloudflare API Token

UptimeFlare 的 GitHub Actions 需要获得 Cloudflare 的授权，才能将项目部署到你的 Cloudflare 账户。

因此，第一步需要创建 **Cloudflare API Token**。

打开：

[Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)

进入 Cloudflare 控制台后：

```text
Profile
→ API Tokens
→ Create Token
```

---

## 1. 选择 Workers 模板

在创建 API Token 时，选择：

```text
Edit Cloudflare Workers
```

然后根据 UptimeFlare 当前部署所需要的资源权限，补充 **D1** 的编辑权限。

原项目 Quickstart 对此有明确说明，建议以项目当前 Wiki 的权限要求为准：

[UptimeFlare Quickstart](https://github.com/lyc8503/UptimeFlare/wiki/Quickstart)

---

## 2. 限制 Token 的账户范围

在账户资源（Account Resources）中：

**选择你自己的 Cloudflare 账户。**

不要直接选择：

```text
All accounts
```

区域资源（Zone Resources）则根据项目当前要求选择。

如果你的 Token 只服务于这一套 UptimeFlare 部署，原则上应遵循：

> **权限够用即可，不要授予不必要的账户范围。**

这是管理 API Token 时非常重要的安全原则。

---

## 3. 创建 Token

确认权限后点击：

```text
Continue to summary
```

检查权限无误后创建 Token。

创建完成后，Cloudflare 会显示 Token。

**立即复制并妥善保存。**

> API Token 属于敏感凭证，不要提交到 GitHub 仓库，也不要直接写入 `uptime.config.ts`。

![创建 Cloudflare API Token](/images/uploads/2026/08/6190909d22ea.gif)

---

# 六、使用 UptimeFlare 模板创建 GitHub Repository

打开 UptimeFlare 项目：

[UptimeFlare GitHub](https://github.com/lyc8503/UptimeFlare)

在项目页面选择：

```text
Use this template
→ Create a new repository
```

创建属于自己的 GitHub Repository。

建议仓库设置为：

```text
Private
```

或者根据你的实际需求决定是否公开。

> 即使仓库是公开的，也绝对不要把 Cloudflare API Token、密码或其他敏感凭据直接写入代码。

![使用 UptimeFlare 模板创建仓库](/images/uploads/2026/08/2ba486084111.gif)

---

# 七、在 GitHub 中配置 Cloudflare API Token

创建仓库之后，需要将刚才生成的 Cloudflare Token 保存到 GitHub Actions Secrets。

进入：

```text
Repository
→ Settings
→ Secrets and variables
→ Actions
→ New repository secret
```

创建：

```text
Name:
CLOUDFLARE_API_TOKEN
```

Value 填入刚才复制的 Cloudflare API Token。

最终类似：

```text
CLOUDFLARE_API_TOKEN = 你的 Cloudflare API Token
```

保存即可。

![配置 GitHub Actions Secret](/images/uploads/2026/08/530174cdd107.gif)

### 为什么要使用 GitHub Secrets？

因为 GitHub Actions 在部署时需要使用 Cloudflare Token，但 Token 不应该直接出现在源代码中。

GitHub Actions Secrets 可以让工作流在运行时读取凭据，而不需要将凭据提交到仓库。

GitHub 官方也建议将敏感信息作为 Secrets 管理，而不是直接写进工作流或源码。

---

# 八、配置 UptimeFlare

完成 Cloudflare 和 GitHub 的基础配置之后，开始修改 UptimeFlare 的监控配置。

在仓库根目录找到：

```text
uptime.config.ts
```

UptimeFlare 官方配置说明：

[UptimeFlare Configuration Wiki](https://github.com/lyc8503/UptimeFlare/wiki/Configuration)

---

# 九、理解 PageConfig 和 WorkConfig

这里非常容易混淆。

UptimeFlare 的配置中，至少需要区分两个概念：

### PageConfig

负责状态页面相关的配置。

例如：

- 状态页展示的名称；
- 页面中的链接；
- 页面相关信息。

因此，`PageConfig` 中的 `Links` **并不是监控目标列表**。

### WorkConfig

负责实际的监控任务。

也就是说：

> **真正需要监控的网站，应当配置在 WorkConfig 中。**

可以简单理解为：

```text
PageConfig
    ↓
控制“状态页长什么样”

WorkConfig
    ↓
控制“监控哪些网站”
```

---

# 十、配置状态页信息

根据自己的需求修改 `PageConfig` 中的内容。

例如，你可以将状态页中的项目名称、介绍和链接修改成自己的信息。

博主的配置中包含：

- GitHub；
- 青鸾小栈 Blog。

![PageConfig 配置示例](/images/uploads/2026/08/2026-08-09_19-37-23.webp)

这里不建议直接复制别人的配置。

你应该根据自己的项目进行修改，例如：

```text
项目名称
项目描述
项目链接
联系方式
```

这样最终生成的 Status Page 才真正属于你自己的监控服务。

---

# 十一、配置 WorkConfig 监控目标

接下来配置真正需要监控的网站。

例如：

```text
个人博客
GitHub Pages
API 服务
项目官网
```

具体配置字段和可用监控方式可能会随着 UptimeFlare 版本更新，因此建议直接参考官方 Configuration Wiki：

[UptimeFlare Configuration](https://github.com/lyc8503/UptimeFlare/wiki/Configuration)

一个重要原则是：

> **不要盲目复制旧文章中的完整配置。**

因为 UptimeFlare 的配置结构可能随着版本变化。

最稳妥的方式是：

1. 先确认当前仓库版本；
2. 打开当前版本对应的官方 Wiki；
3. 根据 Wiki 配置 `WorkConfig`；
4. 提交后观察 GitHub Actions 的构建日志。

![WorkConfig 配置示例](/images/uploads/2026/08/2026-08-09_19-44-09.webp)

---

# 十二、提交代码并自动部署

配置完成之后，将修改提交到 GitHub。

如果直接在 GitHub 网页中修改：

```text
uptime.config.ts
```

点击：

```text
Commit changes
```

提交修改。

提交后，GitHub Actions 会根据项目预先配置好的 Workflow 自动执行部署流程。

进入：

```text
Repository
→ Actions
```

即可查看部署任务。

![GitHub Actions 部署](/images/uploads/2026/08/2026-08-09_19-49-36.webp)

---

## 如何判断部署是否成功？

如果任务显示：

```text
✓
```

通常表示该次 Workflow 已经成功完成。

如果显示：

```text
✕
```

则说明 Workflow 中存在失败步骤。

此时不要反复重新提交代码，应该先打开对应的 Workflow，查看具体失败步骤和日志。

常见问题包括：

- Cloudflare Token 权限不足；
- Token 配置错误；
- UptimeFlare 配置文件语法错误；
- 配置字段与当前版本不匹配；
- Cloudflare 账户资源权限不足；
- GitHub Actions Workflow 执行失败。

---

# 十三、在 Cloudflare 查看部署结果

GitHub Actions 成功之后，进入 Cloudflare 控制台查看部署结果。

根据 UptimeFlare 当前版本的部署方式，你可能会在 Cloudflare 的相关产品页面中看到对应的 Worker、Pages 或其他资源。

> **这里不建议死记“Worker 和 Pages 一定都会出现”。**  
> UptimeFlare 的部署架构可能随着项目版本更新而调整，实际创建哪些 Cloudflare 资源，应以当前项目代码和官方 Quickstart 为准。

部署完成后，先使用 Cloudflare 提供的默认访问地址测试状态页是否正常。

确认页面正常之后，再进行自定义域名绑定。

---

# 十四、绑定自己的域名

如果你希望使用：

```text
https://status.example.com
```

而不是 Cloudflare 提供的默认地址，可以在 Cloudflare 控制台中为对应服务添加自定义域名。

例如：

```text
status.example.com
```

建议专门使用一个子域名作为网站状态页：

```text
status.example.com
```

而不要直接占用主站：

```text
example.com
```

具体绑定方式取决于 UptimeFlare 当前部署到 Cloudflare 的具体资源类型，因此以 Cloudflare 当前控制台提供的 Custom Domains / Domains 配置入口为准。

---

# 十五、常见问题

## 1. GitHub Actions 部署失败怎么办？

首先进入：

```text
GitHub
→ Actions
→ 对应 Workflow
```

打开失败的 Job，找到第一个出现错误的位置。

重点检查：

- Cloudflare API Token 是否正确；
- Token 是否已经过期或被撤销；
- Token 是否具有项目当前版本要求的权限；
- D1 权限是否正确；
- `uptime.config.ts` 是否存在语法错误；
- 配置项是否与当前 UptimeFlare 版本匹配。

---

## 2. Cloudflare Token 应该放在哪里？

应该放在：

```text
GitHub Repository
→ Settings
→ Secrets and variables
→ Actions
```

Secret 名称：

```text
CLOUDFLARE_API_TOKEN
```

**不要把 Token 直接写进 `uptime.config.ts`。**

---

## 3. `PageConfig.Links` 是不是监控的网站？

不是。

`PageConfig.Links` 主要用于状态页中的链接信息。

实际需要监控的目标应该在当前版本支持的 `WorkConfig` 中配置。

---

## 4. UptimeFlare 是完全免费的吗？

不能简单地说“永久免费”。

更准确的说法是：

> UptimeFlare 本身是开源项目，可以部署到 Cloudflare；在使用量符合 Cloudflare 当前免费计划和各产品限制的情况下，可以以零额外服务费用运行。

Cloudflare 的免费额度、产品限制和计费规则可能发生变化。

因此，长期运行之前应查看 Cloudflare 当前官方定价和配额说明。

---

# 十七、结语

如果你只有几个个人网站需要监控，其实没有必要为了一个简单的 Uptime 监控服务专门购买一台 VPS。

通过：

```text
UptimeFlare
+
GitHub
+
GitHub Actions
+
Cloudflare
```

就可以搭建一套属于自己的网站状态监控系统。

整个流程可以浓缩成：

```text
① 创建 Cloudflare API Token
        ↓
② 使用 UptimeFlare 模板创建 GitHub 仓库
        ↓
③ 将 API Token 保存到 GitHub Secrets
        ↓
④ 修改 uptime.config.ts
        ↓
⑤ 配置 PageConfig
        ↓
⑥ 配置 WorkConfig
        ↓
⑦ Commit
        ↓
⑧ GitHub Actions 自动部署
        ↓
⑨ Cloudflare 检查部署结果
        ↓
⑩ 绑定自己的 status 子域名
```

最终，你就拥有了一个独立的：

```text
https://status.example.com
```

网站状态页。

对于个人博客、开源项目和自建服务来说，这是一套成本低、维护相对简单，而且数据和配置都掌握在自己手里的监控方案。

---

## 相关链接

- [UptimeFlare GitHub](https://github.com/lyc8503/UptimeFlare)
- [UptimeFlare Quickstart](https://github.com/lyc8503/UptimeFlare/wiki/Quickstart)
- [UptimeFlare Configuration Wiki](https://github.com/lyc8503/UptimeFlare/wiki/Configuration)
- [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
- [Cloudflare Dashboard](https://dash.cloudflare.com/)
- [GitHub Actions 文档](https://docs.github.com/en/actions)

---

## 我的 UptimeFlare 监控页面

如果你希望参考实际部署效果，也可以访问：

[青鸾小栈 Status](https://status.qingluanx.com)
